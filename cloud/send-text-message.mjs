import { sendTextMessage, requireEnv } from "./feishu-http.mjs";

async function main() {
  requireEnv(["FEISHU_APP_ID", "FEISHU_APP_SECRET", "FEISHU_RECEIVE_ID_TYPE", "FEISHU_RECEIVE_ID", "FEISHU_TEXT"]);
  const messageId = await sendTextMessage({
    receiveIdType: process.env.FEISHU_RECEIVE_ID_TYPE,
    receiveId: process.env.FEISHU_RECEIVE_ID,
    text: process.env.FEISHU_TEXT,
  });
  console.log(`Sent Feishu message: ${messageId ?? "(no message id returned)"}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
