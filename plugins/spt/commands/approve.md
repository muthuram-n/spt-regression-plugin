---
description: HUMAN STEP - freeze the scenarios you ticked in scenarios.md as the approved test set
argument-hint: "\"Approver Full Name\""
disable-model-invocation: true
allowed-tools: Bash(node:*), Read
---

The user is approving scenarios. Approver: `$ARGUMENTS` (if empty, git user.name is used).

1. If the user edited or added scenarios in `scenarios.md`, first sync those edits into `scenarios.json` (same IDs, schema-valid). Do not change which boxes are ticked.
2. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/approval-gate.mjs" freeze --approver "$ARGUMENTS"`.
3. Report: number approved, number rejected, approver, timestamp. Remind the user that any later change to approved scenarios invalidates the approval.
4. Say: "Approved. Run /spt:run <sandbox-alias> to execute."
