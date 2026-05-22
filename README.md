# Codex Work Archive

This repository stores local work artifacts and cloud automation workflows.

## Cloud automation status

These reminders are wired to GitHub Actions so they can run even when the local PC is off:

- `站外投放数据工作日提醒`: weekdays at 10:00 Asia/Shanghai
- `工作日提醒李辉更新独立站数据`: weekdays at 17:00 Asia/Shanghai
- `5月23日群发任务收尾提醒`: 2026-05-23 16:00 Asia/Shanghai
- `5月29日群发任务收尾提醒`: 2026-05-29 17:00 Asia/Shanghai
- `Levanta 每日新增红人检查`: daily at 09:00 Asia/Shanghai
- `工作日上午提醒 Levanta 和投流数据`: weekdays at 10:00 Asia/Shanghai, currently needs `FEISHU_MAIL_SUMMARY_TEXT` until a cloud mail source is connected

## Required GitHub Secrets

- `FEISHU_APP_ID`
- `FEISHU_APP_SECRET`
- `FEISHU_OUTBOUND_CHAT_ID`: `站外需求对接` group, `oc_790fc7b454a5b09b4fd8b2e48f664fae`
- `FEISHU_TASK_CHAT_ID`: `独立站及站外运营` group, `oc_3f9fe10b24fd8b1f65cbd105d1063406`
- `FEISHU_LIHUI_OPEN_ID`: Li Hui user open id, `ou_f6cad0a6196dcd8f5cf2e110740af268`
- `FEISHU_MORNING_OPEN_ID`: morning reminder recipient open id, `ou_dbf761347f696a177e473ced64f7ea0d`
- `FEISHU_MAIL_SUMMARY_TEXT`: temporary mail summary text for the morning reminder
- `LEVANTA_API_KEY`

## Workflows

- `.github/workflows/feishu-outbound-workday-reminder.yml`
- `.github/workflows/feishu-lihui-workday-reminder.yml`
- `.github/workflows/feishu-task-close-reminders.yml`
- `.github/workflows/feishu-morning-workday-reminder.yml`
- `.github/workflows/levanta-daily-check.yml`
