import { requireEnv, sendTextMessage } from "./feishu-http.mjs";
import { readAdsSummary, readOffsiteSummary, writeDashboardFile } from "./boss-report-reminder.mjs";

async function fetchLevantaSummary() {
  if (!process.env.LEVANTA_API_KEY?.trim()) {
    return "Levanta API Key 未配置，今天请手动打开 Levanta 查看订单和红人信息。";
  }

  const base = "https://app.levanta.io/api/seller/v1";
  let cursor = "";
  let total = 0;

  do {
    const url = new URL(`${base}/creator-connections/creators`);
    url.searchParams.set("limit", "100");
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await fetch(url, {
      headers: { authorization: `Bearer ${process.env.LEVANTA_API_KEY}` },
    });
    if (!response.ok) {
      throw new Error(`Failed to read Levanta creators: HTTP ${response.status}`);
    }
    const data = await response.json();
    total += Array.isArray(data.creators) ? data.creators.length : 0;
    cursor = data.cursor ?? "";
  } while (cursor);

  return `Levanta 当前连接红人数：${total}。今日目标：触达 500 个红人，并新增 5 个可合作红人数据。`;
}

async function buildMessage() {
  const mailSummary =
    process.env.FEISHU_MAIL_SUMMARY_TEXT?.trim() ||
    "邮件汇总尚未接入云端自动读取。请今天手动查看昨天黄观锦 CC 给你的红人邮件。";
  const levantaSummary = await fetchLevantaSummary();
  const ads = await readAdsSummary();
  const offsite = await readOffsiteSummary();
  const dashboard = await writeDashboardFile({ ads, offsite });

  return `【每日早报｜Levanta 和投流数据】
早上好，今天先看这三件事：

1. 打开 Levanta，查看订单和红人信息情况。
   ${levantaSummary}
   请同步更新到下方表格：
   https://acnnjmus15ma.feishu.cn/base/BjbZbDQTBaXxWPs74yJcADFKn8b?from=from_copylink

2. 查看李辉更新的独立站投流数据表。
   当前最新汇总：
   - 统计周期：${ads.start} 至 ${ads.end}
   - 销售额：$${ads.sales.toFixed(2)}
   - 订单数：${Math.round(ads.orders)}
   - 广告消耗：$${ads.spend.toFixed(2)}
   - Meta 消耗：$${ads.metaSpend.toFixed(2)}
   - TK 消耗：$${ads.tkSpend.toFixed(2)}
   - 总流量：${Math.round(ads.traffic)}
   - 综合 ROI：${ads.roi.toFixed(2)}

   站外最新汇总：
   - 有效记录数：${Math.round(offsite.records)}
   - 费用总计：¥${offsite.totalCost.toFixed(2)}
   - 出单总数：${Math.round(offsite.totalOrders)}
   - 平均单均费用：¥${offsite.avgCostPerOrder.toFixed(2)} / 单

   重点看昨日花费、出单量、CPC、千展成本、ROI / CPA 是否异常。
   https://acnnjmus15ma.feishu.cn/sheets/UKULs2H11hb948tKnhIceaYvnIU?from=from_copylink

   最新仪表盘已在云端生成：${dashboard.fileName}
   说明：旧固定仪表盘链接已移除，避免误导；飞书 Drive 上传权限生效后会自动发送可打开链接。

3. 查看黄观锦 CC 给你的红人邮件。
${mailSummary}

有异常或需要跟进的地方，可以顺手备注一下原因和下一步动作。`;
}

async function main() {
  requireEnv(["FEISHU_APP_ID", "FEISHU_APP_SECRET", "FEISHU_RECEIVE_ID_TYPE", "FEISHU_RECEIVE_ID"]);
  const text = await buildMessage();
  if (process.argv.includes("--preview")) {
    console.log(text);
    return;
  }

  const messageId = await sendTextMessage({
    receiveIdType: process.env.FEISHU_RECEIVE_ID_TYPE,
    receiveId: process.env.FEISHU_RECEIVE_ID,
    text,
  });
  console.log(`Sent Feishu message: ${messageId ?? "(no message id returned)"}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
