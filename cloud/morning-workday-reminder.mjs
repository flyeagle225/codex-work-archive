import { requireEnv, sendTextMessage } from "./feishu-http.mjs";

function buildMessage() {
  const mailSummary = process.env.FEISHU_MAIL_SUMMARY_TEXT?.trim();
  if (!mailSummary) {
    throw new Error("Missing config: FEISHU_MAIL_SUMMARY_TEXT");
  }

  return `【工作日上午提醒｜Levanta 和投流数据】
早上好，今天先看这三件事：

1. 打开 Levanta，查看订单和红人信息情况。
   今日目标：触达 500 个红人，并新增 5 个可合作红人数据。
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
  requireEnv(["FEISHU_APP_ID", "FEISHU_APP_SECRET", "FEISHU_RECEIVE_ID_TYPE", "FEISHU_RECEIVE_ID", "FEISHU_MAIL_SUMMARY_TEXT"]);
  const messageId = await sendTextMessage({
    receiveIdType: process.env.FEISHU_RECEIVE_ID_TYPE,
    receiveId: process.env.FEISHU_RECEIVE_ID,
    text: buildMessage(),
  });
  console.log(`Sent Feishu message: ${messageId ?? "(no message id returned)"}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
