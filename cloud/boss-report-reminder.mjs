import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  feishuApiJson,
  requireEnv,
  sendFileMessage,
  sendTextMessage,
  uploadDriveFile,
  uploadImFile,
} from "./feishu-http.mjs";

const DEFAULT_ADS_SPREADSHEET_TOKEN = "UKULs2H11hb948tKnhIceaYvnIU";
const DEFAULT_ADS_SHEET_ID = "9f5381";
const DEFAULT_OFFSITE_BASE_TOKEN = "Q5cFbxctRaZZM9sax9Fc9tM0nOc";
const DEFAULT_OFFSITE_TABLE_ID = "tblbYWNOzUrkABOj";

function shanghaiDateString(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (Array.isArray(value)) return toNumber(value.map((item) => toPlainText(item)).join(""));
  const normalized = String(value).replace(/[$¥,%\s,]/g, "");
  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function toPlainText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map((item) => toPlainText(item)).join("");
  if (typeof value === "object") {
    if ("text" in value) return String(value.text ?? "");
    if ("name" in value) return String(value.name ?? "");
    return Object.values(value).map((item) => toPlainText(item)).join("");
  }
  return String(value);
}

function formatUsd(value) {
  return `$${toNumber(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatCny(value) {
  return `¥${toNumber(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatCount(value) {
  return Math.round(toNumber(value)).toLocaleString("en-US");
}

function formatRate(value) {
  const raw = String(value ?? "").trim();
  if (raw.endsWith("%")) return raw;
  return `${toNumber(value).toFixed(2)}%`;
}

function parseSheetValues(data) {
  const valueRange = data?.data?.valueRange ?? data?.data?.value_range ?? data?.data?.valueRange?.valueRange;
  const values = valueRange?.values;
  if (!Array.isArray(values)) {
    throw new Error(`Failed to read spreadsheet values: ${JSON.stringify(data)}`);
  }
  return values;
}

function weekSummaryFromRows(rows, targetDate = shanghaiDateString()) {
  const summaries = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index] ?? [];
    if (row[0] !== "周汇总") continue;

    const dailyRows = rows.slice(index + 2, index + 9).filter((daily) => {
      const date = String(daily?.[1] ?? "");
      return /^\d{4}-\d{2}-\d{2}$/.test(date);
    });
    if (!dailyRows.length) continue;

    const dates = dailyRows.map((daily) => daily[1]).sort();
    summaries.push({
      start: dates[0],
      end: dates[dates.length - 1],
      row,
      dailyRows,
    });
  }

  const current = summaries.find((summary) => summary.start <= targetDate && targetDate <= summary.end);
  if (current) return current;
  if (summaries.length) return summaries[0];
  throw new Error("No weekly summary row found in FlyLily spreadsheet.");
}

async function readAdsSummary() {
  const spreadsheetToken = process.env.FEISHU_ADS_SPREADSHEET_TOKEN ?? DEFAULT_ADS_SPREADSHEET_TOKEN;
  const sheetId = process.env.FEISHU_ADS_SHEET_ID ?? DEFAULT_ADS_SHEET_ID;
  const range = `${sheetId}!A1:AE80`;
  const data = await feishuApiJson(
    `/open-apis/sheets/v2/spreadsheets/${encodeURIComponent(spreadsheetToken)}/values/${encodeURIComponent(range)}?valueRenderOption=FormattedValue`,
  );
  if (data.code !== 0) {
    throw new Error(`Failed to read FlyLily spreadsheet: ${data.msg}`);
  }

  const rows = parseSheetValues(data);
  const current = weekSummaryFromRows(rows);
  const currentIndex = rows.indexOf(current.row);
  const summaryRows = rows
    .map((row, index) => ({ row, index }))
    .filter((item) => item.row?.[0] === "周汇总");
  const previousSummary = summaryRows.find((item) => item.index > currentIndex)?.row ?? [];

  return {
    start: current.start,
    end: current.end,
    sales: toNumber(current.row[2]),
    orders: toNumber(current.row[4]),
    traffic: toNumber(current.row[6]),
    bounce: current.row[7],
    conversion: current.row[10],
    spend: toNumber(current.row[15]),
    roi: toNumber(current.row[17]),
    metaSpend: toNumber(current.row[18]),
    tkSpend: toNumber(current.row[21]),
    previousSales: toNumber(previousSummary[2]),
    previousOrders: toNumber(previousSummary[4]),
    previousSpend: toNumber(previousSummary[15]),
    previousTraffic: toNumber(previousSummary[6]),
    previousRoi: toNumber(previousSummary[17]),
  };
}

async function readOffsiteSummary() {
  const baseToken = process.env.FEISHU_OFFSITE_BASE_TOKEN ?? DEFAULT_OFFSITE_BASE_TOKEN;
  const tableId = process.env.FEISHU_OFFSITE_TABLE_ID ?? DEFAULT_OFFSITE_TABLE_ID;
  const rows = [];
  let pageToken = "";

  do {
    const query = new URLSearchParams({ page_size: "500" });
    if (pageToken) query.set("page_token", pageToken);
    const data = await feishuApiJson(
      `/open-apis/base/v3/bases/${encodeURIComponent(baseToken)}/tables/${encodeURIComponent(tableId)}/records?${query.toString()}`,
    );
    if (data.code !== 0) {
      throw new Error(`Failed to read offsite base records: ${data.msg}`);
    }

    const records = Array.isArray(data.data?.items)
      ? data.data.items.map((item) => item.fields ?? {})
      : Array.isArray(data.data?.data)
        ? data.data.data.map((row) => {
            const mapped = {};
            for (const [index, fieldName] of (data.data.fields ?? []).entries()) {
              mapped[fieldName] = row[index];
            }
            return mapped;
          })
        : [];

    for (const fields of records) {
      const name = toPlainText(fields["文本"]).trim();
      const cost = toNumber(fields["费用"]);
      const orders = toNumber(fields["出单总数"]);
      if (!name && cost === 0 && orders === 0) continue;
      rows.push({ name, cost, orders });
    }
    pageToken = data.data?.page_token ?? "";
  } while (pageToken);

  const totalCost = rows.reduce((sum, row) => sum + row.cost, 0);
  const totalOrders = rows.reduce((sum, row) => sum + row.orders, 0);
  return {
    records: rows.length,
    totalCost,
    totalOrders,
    avgCostPerOrder: totalOrders ? totalCost / totalOrders : 0,
    topOrders: [...rows].sort((a, b) => b.orders - a.orders).slice(0, 4),
    topCost: [...rows].sort((a, b) => b.cost - a.cost).slice(0, 3),
  };
}

function topNames(rows) {
  return rows
    .filter((row) => row.name)
    .map((row) => row.name)
    .join("、");
}

function buildDashboardMarkdown({ ads, offsite }) {
  return `# 独立站及站外数据仪表盘

数据读取时间：${new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date())}（北京时间）

数据来源：

- FlyLily 站内数据
- 站外投放及红人推广 / 站外需求及效果评估

## 一、核心数据概览

| 模块 | 指标 | 当前数据 | 说明 |
|---|---|---:|---|
| 独立站 | 本周销售额 | ${formatUsd(ads.sales)} | ${ads.start} 至 ${ads.end} |
| 独立站 | 本周订单数 | ${formatCount(ads.orders)} | 当前周汇总 |
| 独立站 | 本周广告消耗 | ${formatUsd(ads.spend)} | Meta + TK |
| 独立站 | Meta 消耗 | ${formatUsd(ads.metaSpend)} | 当前周 Meta |
| 独立站 | TK 消耗 | ${formatUsd(ads.tkSpend)} | 当前周 TK |
| 独立站 | 本周总流量 | ${formatCount(ads.traffic)} | 当前周汇总 |
| 独立站 | 本周转化率 | ${formatRate(ads.conversion)} | 当前周汇总 |
| 独立站 | 本周综合 ROI | ${ads.roi.toFixed(2)} | 当前周汇总 |
| 站外 | 有效记录数 | ${formatCount(offsite.records)} | 非空项目记录 |
| 站外 | 费用总计 | ${formatCny(offsite.totalCost)} | 当前累计费用 |
| 站外 | 出单总数 | ${formatCount(offsite.totalOrders)} | 当前累计出单 |
| 站外 | 平均单均费用 | ${formatCny(offsite.avgCostPerOrder)} / 单 | 费用总计 / 出单总数 |

## 二、独立站数据

### 本周数据

| 指标 | 数值 |
|---|---:|
| 销售额 | ${formatUsd(ads.sales)} |
| 订单数 | ${formatCount(ads.orders)} |
| 广告消耗 | ${formatUsd(ads.spend)} |
| Meta 消耗 | ${formatUsd(ads.metaSpend)} |
| TK 消耗 | ${formatUsd(ads.tkSpend)} |
| 总流量 | ${formatCount(ads.traffic)} |
| 跳出率 | ${formatRate(ads.bounce)} |
| 转化率 | ${formatRate(ads.conversion)} |
| 综合 ROI | ${ads.roi.toFixed(2)} |

### 上周对比

| 周期 | 销售额 | 订单数 | 广告消耗 | 总流量 | 综合 ROI |
|---|---:|---:|---:|---:|---:|
| ${ads.start} 至 ${ads.end} | ${formatUsd(ads.sales)} | ${formatCount(ads.orders)} | ${formatUsd(ads.spend)} | ${formatCount(ads.traffic)} | ${ads.roi.toFixed(2)} |
| 上一周 | ${formatUsd(ads.previousSales)} | ${formatCount(ads.previousOrders)} | ${formatUsd(ads.previousSpend)} | ${formatCount(ads.previousTraffic)} | ${ads.previousRoi.toFixed(2)} |

## 三、站外需求及效果评估

### 汇总数据

| 汇总项 | 数值 |
|---|---:|
| 有效记录数 | ${formatCount(offsite.records)} |
| 费用总计 | ${formatCny(offsite.totalCost)} |
| 出单总数 | ${formatCount(offsite.totalOrders)} |
| 平均单均费用 | ${formatCny(offsite.avgCostPerOrder)} / 单 |

### 站外出单 Top 项目

| 排名 | 项目 | 出单 | 费用 |
|---:|---|---:|---:|
${offsite.topOrders.map((row, index) => `| ${index + 1} | ${row.name || "未命名项目"} | ${formatCount(row.orders)} | ${formatCny(row.cost)} |`).join("\n")}

### 站外费用 Top 项目

| 排名 | 项目 | 费用 | 出单 |
|---:|---|---:|---:|
${offsite.topCost.map((row, index) => `| ${index + 1} | ${row.name || "未命名项目"} | ${formatCny(row.cost)} | ${formatCount(row.orders)} |`).join("\n")}

## 四、简要结论

- 本周独立站统计周期为 ${ads.start} 至 ${ads.end}，销售额 ${formatUsd(ads.sales)}，订单 ${formatCount(ads.orders)}，广告消耗 ${formatUsd(ads.spend)}。
- 站外当前累计费用 ${formatCny(offsite.totalCost)}，累计出单 ${formatCount(offsite.totalOrders)} 单，整体单均费用约 ${formatCny(offsite.avgCostPerOrder)} / 单。
- 站外出单贡献较高的项目：${topNames(offsite.topOrders) || "暂无"}。
`;
}

async function writeDashboardFile({ ads, offsite }) {
  const outputDir = process.env.BOSS_REPORT_OUTPUT_DIR ?? "boss-report-output";
  await mkdir(outputDir, { recursive: true });
  const date = shanghaiDateString();
  const fileName = `独立站及站外数据仪表盘-${date}.md`;
  const filePath = join(outputDir, fileName);
  await writeFile(filePath, buildDashboardMarkdown({ ads, offsite }), "utf8");
  return { fileName, filePath };
}

function buildMessage({ ads, offsite, dashboardLink }) {
  const generatedAt = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

  return `各位大佬好，本周【独立站及站外数据仪表盘】已更新，烦请查阅。

数据读取时间：${generatedAt}（北京时间）
仪表盘链接：${dashboardLink ?? "生成后随消息发送"}

本周核心数据简要汇总如下：

| 模块 | 指标 | 数据 |
|---|---|---:|
| 独立站 | 销售额 | ${formatUsd(ads.sales)} |
| 独立站 | 订单数 | ${formatCount(ads.orders)} |
| 独立站 | 广告消耗 | ${formatUsd(ads.spend)} |
| 独立站 | Meta 消耗 | ${formatUsd(ads.metaSpend)} |
| 独立站 | TK 消耗 | ${formatUsd(ads.tkSpend)} |
| 独立站 | 总流量 | ${formatCount(ads.traffic)} |
| 独立站 | 转化率 | ${formatRate(ads.conversion)} |
| 独立站 | 综合 ROI | ${ads.roi.toFixed(2)} |
| 站外 | 记录数 | ${formatCount(offsite.records)} |
| 站外 | 费用总计 | ${formatCny(offsite.totalCost)} |
| 站外 | 出单总数 | ${formatCount(offsite.totalOrders)} |
| 站外 | 平均单均费用 | ${formatCny(offsite.avgCostPerOrder)} / 单 |

上周对比：独立站销售额 ${formatUsd(ads.previousSales)}，订单 ${formatCount(ads.previousOrders)}，广告消耗 ${formatUsd(ads.previousSpend)}，总流量 ${formatCount(ads.previousTraffic)}，综合 ROI ${ads.previousRoi.toFixed(2)}。

简要说明：本周独立站统计周期为 ${ads.start} 至 ${ads.end}。站外侧当前共 ${formatCount(offsite.records)} 条有效记录，累计费用 ${formatCny(offsite.totalCost)}，累计出单 ${formatCount(offsite.totalOrders)} 单，整体单均费用约 ${formatCny(offsite.avgCostPerOrder)} / 单。

站外出单贡献较高的项目：${topNames(offsite.topOrders) || "暂无"}。
站外费用较高的项目：${topNames(offsite.topCost) || "暂无"}。

后续将按每周一 18:00 固定更新同步。请各位大佬查阅。`;
}

async function main() {
  requireEnv(["FEISHU_APP_ID", "FEISHU_APP_SECRET", "FEISHU_BOSS_REPORT_CHAT_ID"]);
  const ads = await readAdsSummary();
  const offsite = await readOffsiteSummary();
  const dashboard = await writeDashboardFile({ ads, offsite });

  if (process.argv.includes("--preview")) {
    console.log(buildMessage({ ads, offsite }));
    console.log(`\nDashboard file: ${dashboard.filePath}`);
    return;
  }

  const driveFileToken = await uploadDriveFile({
    filePath: dashboard.filePath,
    fileName: dashboard.fileName,
  });
  if (!driveFileToken) {
    throw new Error("Feishu Drive upload did not return a file token.");
  }
  const dashboardLink = `${process.env.FEISHU_FILE_BASE_URL ?? "https://acnnjmus15ma.feishu.cn"}/file/${driveFileToken}`;
  const text = buildMessage({ ads, offsite, dashboardLink });

  const fileKey = await uploadImFile({
    filePath: dashboard.filePath,
    fileName: dashboard.fileName,
  });
  const messageId = await sendTextMessage({
    receiveIdType: "chat_id",
    receiveId: process.env.FEISHU_BOSS_REPORT_CHAT_ID,
    text,
  });
  console.log(`Sent Feishu message: ${messageId ?? "(no message id returned)"}`);
  const fileMessageId = await sendFileMessage({
    receiveIdType: "chat_id",
    receiveId: process.env.FEISHU_BOSS_REPORT_CHAT_ID,
    fileKey,
  });
  console.log(`Sent Feishu dashboard file: ${fileMessageId ?? "(no message id returned)"}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
