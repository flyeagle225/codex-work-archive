# Cloud reminders

These scripts are called by GitHub Actions and do not depend on the local PC.

## Secrets

- `FEISHU_APP_ID`
- `FEISHU_APP_SECRET`
- `FEISHU_OUTBOUND_CHAT_ID`
- `FEISHU_TASK_CHAT_ID`
- `FEISHU_LIHUI_OPEN_ID`
- `FEISHU_MORNING_OPEN_ID`
- `FEISHU_MAIL_SUMMARY_TEXT`
- `LEVANTA_API_KEY`

## Scripts

- `send-text-message.mjs`: generic Feishu text sender
- `task-close-reminder.mjs`: sends the weekly task close reminder
- `morning-workday-reminder.mjs`: sends the morning Levanta and ad data reminder
- `levanta-new-creators.ps1`: checks new Levanta creators and uploads reports as workflow artifacts

## Remaining cloud dependency

The morning reminder can already send from GitHub Actions, but the mail-summary section still needs a cloud mail source. Until that is connected, it reads `FEISHU_MAIL_SUMMARY_TEXT` from GitHub Secrets.
