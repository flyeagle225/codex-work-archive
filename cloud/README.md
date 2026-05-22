# Cloud reminders

These scripts are called by GitHub Actions and do not depend on the local PC.

## Required Secrets

- `FEISHU_APP_ID`
- `FEISHU_APP_SECRET`
- `FEISHU_OUTBOUND_CHAT_ID`
- `FEISHU_TASK_CHAT_ID`
- `FEISHU_LIHUI_OPEN_ID`
- `FEISHU_MORNING_OPEN_ID`
- `FEISHU_BOSS_REPORT_CHAT_ID`
- `LEVANTA_API_KEY`

## Optional Secret

- `FEISHU_MAIL_SUMMARY_TEXT`: optional text for the morning reminder. If this secret is missing, the reminder still sends with a note to manually check the mail summary.

## Feishu App Permissions

`boss-report-reminder.mjs` reads live source data and will not send if the read fails.

- `FlyLily站内数据`: grant `sheets:spreadsheet.meta:read` and `sheets:spreadsheet:read`
- `站外投放及红人推广`: grant `base:table:read` and `base:record:read`
- Dashboard file attachment: grant `im:resource` for file upload and keep `im:message` for sending messages
- Share both source files with the app/bot if Feishu returns a document permission error after scopes are enabled.

## Scripts

- `send-text-message.mjs`: generic Feishu text sender
- `task-close-reminder.mjs`: sends the group task close reminder
- `morning-workday-reminder.mjs`: sends the morning Levanta and ad-data reminder
- `boss-report-reminder.mjs`: sends the weekly boss-report dashboard reminder
- `levanta-new-creators.ps1`: checks new Levanta creators and uploads reports as workflow artifacts
