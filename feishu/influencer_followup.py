"""Influencer follow-up entrypoint.

Purpose:
- Read influencer follow-up status.
- Identify pending contacts and overdue replies.
- Prepare Feishu/Lark follow-up reminders.

Required environment variables when sending is enabled:
- FEISHU_APP_ID
- FEISHU_APP_SECRET
- FEISHU_INFLUENCER_CHAT_ID
"""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class FollowupItem:
    name: str
    status: str
    next_action: str


def collect_pending_followups() -> list[FollowupItem]:
    """Collect influencer follow-up items that need attention."""
    return []


def main() -> None:
    chat_id = os.getenv("FEISHU_INFLUENCER_CHAT_ID")
    items = collect_pending_followups()

    if not chat_id:
        print("FEISHU_INFLUENCER_CHAT_ID is not configured; preview only.")
        print(f"Pending follow-ups: {len(items)}")
        return

    print("Feishu follow-up send integration is not implemented yet.")
    print(f"Pending follow-ups: {len(items)}")


if __name__ == "__main__":
    main()
