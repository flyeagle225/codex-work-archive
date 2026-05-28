"""Daily Feishu report entrypoint.

Purpose:
- Collect daily operating data.
- Format the report for Feishu/Lark.
- Send or preview the report based on runtime configuration.

Required environment variables when sending is enabled:
- FEISHU_APP_ID
- FEISHU_APP_SECRET
- FEISHU_REPORT_CHAT_ID
"""

from __future__ import annotations

import os
from datetime import datetime, timezone


def build_report() -> str:
    """Build the daily report body."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return f"Daily Feishu report placeholder for {today}."


def main() -> None:
    report = build_report()
    chat_id = os.getenv("FEISHU_REPORT_CHAT_ID")

    if not chat_id:
        print("FEISHU_REPORT_CHAT_ID is not configured; preview only.")
        print(report)
        return

    print("Feishu send integration is not implemented yet.")
    print(report)


if __name__ == "__main__":
    main()
