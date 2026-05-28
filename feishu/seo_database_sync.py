"""SEO database to Feishu table sync entrypoint.

Purpose:
- Read SEO content data from the source database or exported file.
- Normalize fields according to knowledge/feishu_table_rules.md.
- Sync changed records into Feishu/Lark tables.

Required environment variables when sending is enabled:
- FEISHU_APP_ID
- FEISHU_APP_SECRET
- FEISHU_BASE_APP_TOKEN
- FEISHU_BASE_TABLE_ID
"""

from __future__ import annotations

import os


def load_records() -> list[dict[str, str]]:
    """Load records that should be synced into Feishu."""
    return []


def main() -> None:
    table_id = os.getenv("FEISHU_BASE_TABLE_ID")
    records = load_records()

    if not table_id:
        print("FEISHU_BASE_TABLE_ID is not configured; preview only.")
        print(f"Records ready for sync: {len(records)}")
        return

    print("Feishu table sync integration is not implemented yet.")
    print(f"Records ready for sync: {len(records)}")


if __name__ == "__main__":
    main()
