---
name: superpowers-workflow
description: Run a disciplined end-to-end software development workflow covering design clarification, implementation planning, test-first coding, systematic debugging, code review, and verification. Use for non-trivial feature work, bug fixes, refactors, implementation plans, or any coding task where Codex should proceed methodically from intent to proven completion.
---

# Superpowers Workflow

Apply the smallest workflow that fits the task while preserving the user's explicit instructions as the highest priority.

## Choose The Track

- For a new feature, behavior change, or unclear request: use the design track.
- For a reproducible defect, failing test, or unexpected behavior: use the debugging track.
- For a review request: inspect for bugs, regressions, risks, and missing tests before summarizing.
- For a tiny, fully specified edit: implement directly, then verify.

## Design Track

1. Inspect the repository, existing conventions, and relevant tests before proposing architecture.
2. Clarify only decisions that cannot be discovered and would materially change the implementation.
3. Consider at least two viable approaches when tradeoffs are meaningful.
4. Present a concise design covering behavior, boundaries, data flow, errors, and testing.
5. Obtain user approval before implementing when the change is broad, ambiguous, destructive, or architecture-setting.
6. Break approved work into small tasks with exact files and verification steps.

## Implementation Track

1. Preserve unrelated user changes and follow repository instructions.
2. Add or update a test that demonstrates the required behavior when practical.
3. Run the test and confirm it fails for the expected reason.
4. Implement the smallest change that satisfies the test and requirement.
5. Run focused tests, then broader checks appropriate to the blast radius.
6. Refactor only after behavior is green; avoid speculative abstractions.
7. Review the diff for accidental churn, security issues, compatibility changes, and missing edge cases.

If a test-first cycle is impractical, state why and use the strongest available verification instead.

## Debugging Track

1. Reproduce the failure and capture the exact error or incorrect output.
2. Trace inputs, state transitions, and call boundaries until the first incorrect assumption or value is found.
3. Form one falsifiable root-cause hypothesis at a time.
4. Test the hypothesis with the smallest diagnostic change or command.
5. Fix the root cause rather than masking the symptom.
6. Add a regression test when feasible.
7. Re-run the original reproduction and relevant surrounding tests.

Do not stack speculative fixes. If evidence contradicts a hypothesis, discard it and continue tracing.

## Review Track

Report findings first, ordered by severity. Ground each finding in a precise file and line, explain the user-visible or operational impact, and identify the missing safeguard. Keep summaries secondary. If no issue is found, say so and name residual test gaps or risks.

## Completion Gate

Before claiming success:

- Re-run the commands that prove the requested behavior.
- Confirm test, lint, build, or type-check results relevant to the change.
- Inspect the final diff and repository status.
- Distinguish verified facts from assumptions or unrun checks.
- Report concrete evidence, including failures or blockers.

Never claim a task is complete based only on code inspection when executable verification is available.

## Platform Notes

Use Codex-native tools and repository conventions. Use task plans only for work that benefits from visible sequencing. Use subagents only when the user explicitly requests delegation or parallel agent work. Follow workspace-specific cloud, Git, and persistence rules before this workflow.

For provenance and the upstream methodology summarized by this adaptation, read [references/upstream.md](references/upstream.md).