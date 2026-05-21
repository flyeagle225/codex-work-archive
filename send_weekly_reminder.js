const { spawnSync } = require("node:child_process");
const path = require("node:path");

const chatId = "oc_3f9fe10b24fd8b1f65cbd105d1063406";
const cli = path.join(__dirname, ".tools", "lark-cli-download", "lark-cli.exe");

const content = {
  zh_cn: {
    title: "",
    content: [
      [{ tag: "at", user_id: "all" }],
      [{ tag: "text", text: "\n\n【每周提醒｜任务收尾】" }],
      [{ tag: "text", text: "\n\n请大家检查本周任务是否完成，并及时更新到下方任务表：" }],
      [
        { tag: "text", text: "\n\n" },
        {
          tag: "a",
          text: "5月工作计划",
          href: "https://acnnjmus15ma.feishu.cn/base/VPYKbOFbUaYYhuszKFRcjvzEn7d?from=from_copylink",
        },
      ],
      [{ tag: "text", text: "\n\n已完成的任务，请更新任务状态。" }],
      [{ tag: "text", text: "\n\n未完成的任务，请备注原因和当前进度。" }],
      [{ tag: "text", text: "\n\n另外，李辉同学请同步更新独立站数据表：" }],
      [
        { tag: "text", text: "\n\n" },
        {
          tag: "a",
          text: "FlyLily站内数据",
          href: "https://acnnjmus15ma.feishu.cn/sheets/UKULs2H11hb948tKnhIceaYvnIU?from=from_copylink",
        },
      ],
      [{ tag: "text", text: "\n\n最后，请大家记得提交本周周报。" }],
      [{ tag: "text", text: "\n\n辛苦啦，给这周一个漂亮的收尾。" }],
    ],
  },
};

const result = spawnSync(
  cli,
  [
    "im",
    "+messages-send",
    "--as",
    "bot",
    "--chat-id",
    chatId,
    "--msg-type",
    "post",
    "--content",
    JSON.stringify(content),
    "--idempotency-key",
    `weekly-reminder-${new Date().toISOString().slice(0, 10)}`,
  ],
  { encoding: "utf8" },
);

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
