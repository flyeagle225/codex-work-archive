# Codex Work Archive

This repository stores work artifacts and cloud automation workflows.

## Cloud Automation Status

These reminders are wired to GitHub Actions so they can run when the local PC is off:

- Outbound ad data workday reminder: weekdays at 10:00 Asia/Shanghai
- Li Hui independent-site data reminder: weekdays at 17:00 Asia/Shanghai
- May 23 group task close reminder: 2026-05-23 16:00 Asia/Shanghai
- May 29 group task close reminder: 2026-05-29 17:00 Asia/Shanghai
- Levanta new creator check: daily at 09:00 Asia/Shanghai
- Morning Levanta and ad-data reminder: weekdays at 10:00 Asia/Shanghai
- Boss report weekly dashboard reminder: Mondays at 18:00 Asia/Shanghai

## Required GitHub Secrets

- `FEISHU_APP_ID`
- `FEISHU_APP_SECRET`
- `FEISHU_OUTBOUND_CHAT_ID`: Feishu group `站外需求对接`
- `FEISHU_TASK_CHAT_ID`: Feishu group `独立站及站外运营`
- `FEISHU_LIHUI_OPEN_ID`: Li Hui user open id
- `FEISHU_MORNING_OPEN_ID`: morning reminder recipient open id
- `FEISHU_BOSS_REPORT_CHAT_ID`: Feishu group `向大佬汇报`
- `LEVANTA_API_KEY`

## Optional GitHub Secret

- `FEISHU_MAIL_SUMMARY_TEXT`: optional temporary text for the morning reminder mail-summary section. If it is not set, the workflow still sends the reminder with a manual-mail-check note.

## Workflows

- `.github/workflows/feishu-outbound-workday-reminder.yml`
- `.github/workflows/feishu-lihui-workday-reminder.yml`
- `.github/workflows/feishu-task-close-reminders.yml`
- `.github/workflows/feishu-morning-workday-reminder.yml`
- `.github/workflows/feishu-boss-report-weekly-reminder.yml`
- `.github/workflows/levanta-daily-check.yml`
