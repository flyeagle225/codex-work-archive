import { requireEnv, sendTextMessage } from "./feishu-http.mjs";

function buildMessage() {
  return `<at user_id="all">所有人</at>

【每周提醒｜任务收尾】
请大家检查本周任务是否完成，并及时更新到下方任务表：

5月工作计划：
https://acnnjmus15ma.feishu.cn/base/VPYKbOFbUaYYhuszKFRcjvzEn7d?from=from_copylink

已完成的任务，请更新状态。
未完成的任务，请备注原因和当前进度。

另外，李辉同学请同步更新独立站数据表：
https://acnnjmus15ma.feishu.cn/sheets/UKULs2H11hb948tKnhIceaYvnIU?from=from_copylink

最后，请大家记得提交本周周报。`;
}

async function main() {
  requireEnv(["FEISHU_APP_ID", "FEISHU_APP_SECRET", "FEISHU_RECEIVE_ID_TYPE", "FEISHU_RECEIVE_ID"]);
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
