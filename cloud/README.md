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

## Scripts

- `send-text-message.mjs`: generic Feishu text sender
- `task-close-reminder.mjs`: sends the group task close reminder
- `morning-workday-reminder.mjs`: sends the morning Levanta and ad-data reminder
- `boss-report-reminder.mjs`: sends the weekly boss-report dashboard reminder
- `levanta-new-creators.ps1`: checks new Levanta creators and uploads reports as workflow artifacts
