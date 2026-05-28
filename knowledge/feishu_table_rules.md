# Feishu Table Rules

## Scope

This document defines field rules for Feishu/Lark table automation.

## Required Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Title | Text | Yes | Human-readable item name. |
| Status | Single select | Yes | Use a controlled status list. |
| Owner | Person/Text | No | Responsible person or team. |
| Updated At | DateTime | Yes | Last sync or manual update time. |
| Source | URL/Text | No | Original source record. |

## Status Values

- New
- In Progress
- Waiting
- Done
- Blocked

## Sync Rules

- Do not overwrite manually curated fields unless they are explicitly owned by automation.
- Match records by stable ID when available.
- Preserve source URLs and timestamps for traceability.
- Log skipped records with a clear reason.

## Secrets

Keep app IDs, app secrets, table IDs, and chat IDs in GitHub Actions secrets or local environment variables. Do not commit secrets to this repository.
