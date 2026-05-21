const { spawnSync } = require("node:child_process");
const path = require("node:path");

const userOpenId = "ou_dbf761347f696a177e473ced64f7ea0d";
const cli = path.join(__dirname, ".tools", "lark-cli-download", "lark-cli.exe");

function runCli(args) {
  const result = spawnSync(cli, args, { encoding: "utf8" });
  if (result.status !== 0) return null;
  try {
    return JSON.parse(result.stdout);
  } catch {
    return null;
  }
}

function shanghaiDateParts(offsetDays) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const now = new Date();
  const target = new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  const parts = Object.fromEntries(formatter.formatToParts(target).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function detectBrand(subject, body) {
  const text = `${subject || ""} ${body || ""}`.toLowerCase();
  if (text.includes("星空灯") || text.includes("projector") || text.includes("flylily")) return "FlyLily 星空灯";
  if (text.includes("drawing board") || text.includes("发光画板")) return "FlyLily 儿童发光画板";
  if (text.includes("robot") || text.includes("pet companion")) return "FlashPet 智宠机器人";
  if (text.includes("odor") || text.includes("air purifier") || text.includes("hydro-ion")) return "FlashPet 水离子除味";
  return "待确认品牌";
}

function summarizeReply(message) {
  const body = message.body_plain_text || "";
  const lower = body.toLowerCase();

  if (lower.includes("amazon link") || lower.includes("direct amazon link")) {
    return ["红人在询问 Amazon 链接。", "需要补发 Amazon 链接。"];
  }
  if (lower.includes("$3,500") || lower.includes("3500")) {
    return ["红人只做付费合作，报价较高，完整版权需另算。", "建议确认预算，或先搁置。"];
  }
  if (lower.includes("$125") || lower.includes("raw footage")) {
    return ["红人可提供 Amazon/YouTube 视频；如需原始素材和照片需额外付费。", "如需要广告素材，建议确认授权方案。"];
  }
  if (lower.includes("$20")) {
    return ["红人可做 Amazon 视频，提到基础费用约 $20。", "可确认是否继续推进及是否需要额外授权。"];
  }
  if (lower.includes("paid collaboration") || lower.includes("paid partnership")) {
    return ["红人表示倾向付费合作。", "建议让对方提供报价或确认预算。"];
  }
  if (lower.includes("vertical video") || lower.includes("option a")) {
    return ["红人倾向竖版视频方案。", "需要确认平台、链接、寄样和交付要求。"];
  }
  if (lower.includes("reference video") || body.includes("参考视频")) {
    return ["红人/机构需要参考视频或更明确的拍摄方向。", "需要补充参考视频和拍摄重点。"];
  }
  if (lower.includes("look forward") || lower.includes("sounds great")) {
    return ["红人回复积极，等待后续安排。", "继续跟进寄样、链接或发布时间。"];
  }
  return ["有新的红人回复，需要查看邮件详情。", "建议打开邮件确认是否需要跟进。"];
}

function yesterdayInfluencerMailSummary() {
  const day = process.env.FEISHU_MAIL_REPORT_DATE || shanghaiDateParts(-1);
  const filter = {
    cc: ["pr@flashpetlife.com"],
    time_range: {
      start_time: `${day}T00:00:00+08:00`,
      end_time: `${day}T23:59:59+08:00`,
    },
  };

  const triage = runCli([
    "mail",
    "+triage",
    "--filter",
    JSON.stringify(filter),
    "--max",
    "30",
    "--format",
    "json",
    "--as",
    "user",
  ]);
  const messages = triage?.messages || [];
  const influencerMessages = messages.filter((m) => {
    const from = (m.from || "").toLowerCase();
    return !from.includes("collab@flashpetlife.com") && !from.includes("collab@flylilylighting.com");
  });

  if (influencerMessages.length === 0) {
    return `昨日红人邮件汇总（${day}）\n\n未发现黄观锦 CC 给你的红人新回复。`;
  }

  const ids = influencerMessages.slice(0, 8).map((m) => m.message_id).join(",");
  const detail = runCli([
    "mail",
    "+messages",
    "--message-ids",
    ids,
    "--html=false",
    "--format",
    "json",
    "--as",
    "user",
  ]);
  const detailedMessages = detail?.data?.messages || [];

  const rows = detailedMessages.map((message, index) => {
    const brand = detectBrand(message.subject, message.body_plain_text);
    const name = message.head_from?.name || message.head_from?.mail_address || "未知红人";
    const [point, action] = summarizeReply(message);
    return `${index + 1}. ${brand}\n红人/机构：${name}\n回复重点：${point}\n建议动作：${action}`;
  });

  return `昨日红人邮件汇总（${day}）\n\n${rows.join("\n\n")}`;
}

const mailSummary = yesterdayInfluencerMailSummary();

const markdown = `【工作日提醒｜上午事项】

早上好，今天先看这三件事：

1. 打开 Levanta，查看订单和红人信息情况。

   今日目标：触达 500 个红人，并新增 5 个可合作红人数据。

   请同步更新到下方表格：

[红人数据表](https://acnnjmus15ma.feishu.cn/base/BjbZbDQTBaXxWPs74yJcADFKn8b?from=from_copylink)

2. 查看李辉更新的独立站投流数据表。

   重点看昨日花费、出单量、CPC、千展成本、ROI / CPA 是否异常。

[FlyLily站内数据](https://acnnjmus15ma.feishu.cn/sheets/UKULs2H11hb948tKnhIceaYvnIU?from=from_copylink)

   仪表盘文档：

[FlyLily独立站投流数据仪表盘](https://www.feishu.cn/file/Zbsrbc6wqo7neSxcsjXcSeFfnlf)

3. 查看黄观锦 CC 给你的红人邮件。

${mailSummary}

有异常或需要跟进的地方，可以顺手备注一下原因和下一步动作。`;

const result = spawnSync(
  cli,
  [
    "im",
    "+messages-send",
    "--as",
    "bot",
    "--user-id",
    userOpenId,
    "--markdown",
    markdown,
    "--idempotency-key",
    `morning-workday-reminder-${new Date().toISOString().slice(0, 10)}-${Date.now()}`,
  ],
  { encoding: "utf8" },
);

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
