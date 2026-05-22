import { requireEnv, sendTextMessage } from "./feishu-http.mjs";

function buildMessage() {
  return `各位大佬好，本周【独立站及站外数据仪表盘】已更新，烦请查阅。

当前仪表盘摘要如下，请查阅。

本周核心数据简要汇总如下：

| 模块 | 指标 | 数据 |
|---|---|---:|
| 独立站 | 销售额 | $0.00 |
| 独立站 | 订单数 | 0 |
| 独立站 | 广告消耗 | $38.99 |
| 独立站 | 总流量 | 27 |
| 站外 | 费用总计 | ¥2,987.25 |
| 站外 | 出单总数 | 243 |
| 站外 | 平均单均费用 | ¥12.29 / 单 |

简要说明：本周独立站暂无销售额和订单产生；站外当前累计费用 ¥2,987.25，累计出单 243 单。

后续将按每周一 18:00 固定更新同步。请各位大佬查阅。`;
}

async function main() {
  requireEnv(["FEISHU_APP_ID", "FEISHU_APP_SECRET", "FEISHU_BOSS_REPORT_CHAT_ID"]);
  const messageId = await sendTextMessage({
    receiveIdType: "chat_id",
    receiveId: process.env.FEISHU_BOSS_REPORT_CHAT_ID,
    text: buildMessage(),
  });
  console.log(`Sent Feishu message: ${messageId ?? "(no message id returned)"}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
