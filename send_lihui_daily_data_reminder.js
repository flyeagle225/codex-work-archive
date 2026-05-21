const { spawnSync } = require("node:child_process");
const path = require("node:path");

const liHuiOpenId = process.env.FEISHU_REMINDER_TEST_USER_ID || "ou_f6cad0a6196dcd8f5cf2e110740af268";
const cli = path.join(__dirname, ".tools", "lark-cli-download", "lark-cli.exe");

const markdown = `【每日提醒｜独立站数据更新】

李辉，麻烦今天下班前更新一下独立站投放出单数据，并填写至下方表格：

[FlyLily站内数据](https://acnnjmus15ma.feishu.cn/sheets/UKULs2H11hb948tKnhIceaYvnIU?from=from_copylink)

重点确认：

1. 昨日花费
2. 出单量
3. 点击数和展示量
4. CPC 和千展成本
5. ROI / CPA 是否有异常

如果数据异常，也麻烦简单备注原因和明日动作。

谢谢。`;

const result = spawnSync(
  cli,
  [
    "im",
    "+messages-send",
    "--as",
    "bot",
    "--user-id",
    liHuiOpenId,
    "--markdown",
    markdown,
    "--idempotency-key",
    `lihui-daily-data-reminder-${new Date().toISOString().slice(0, 10)}`,
  ],
  { encoding: "utf8" },
);

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
