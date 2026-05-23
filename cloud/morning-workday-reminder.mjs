import { requireEnv, sendTextMessage } from "./feishu-http.mjs";

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

  return `【每日早报｜Levanta 和投流数据】
早上好，今天先看这三件事：

1. 打开 Levanta，查看订单和红人信息情况。
   ${levantaSummary}
   请同步更新到下方表格：
   https://acnnjmus15ma.feishu.cn/base/BjbZbDQTBaXxWPs74yJcADFKn8b?from=from_copylink

2. 查看李辉更新的独立站投流数据表。
   重点看昨日花费、出单量、CPC、千展成本、ROI / CPA 是否异常。
   https://acnnjmus15ma.feishu.cn/sheets/UKULs2H11hb948tKnhIceaYvnIU?from=from_copylink

   仪表盘文档：
   https://www.feishu.cn/file/Zbsrbc6wqo7neSxcsjXcSeFfnlf

3. 查看黄观锦 CC 给你的红人邮件。
${mailSummary}

有异常或需要跟进的地方，可以顺手备注一下原因和下一步动作。`;
}

async function main() {
  requireEnv(["FEISHU_APP_ID", "FEISHU_APP_SECRET", "FEISHU_RECEIVE_ID_TYPE", "FEISHU_RECEIVE_ID"]);
  const text = await buildMessage();
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
