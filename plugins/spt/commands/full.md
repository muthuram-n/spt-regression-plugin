---
description: Run the whole pipeline up to the human approval gate (analyse -> generate), then stop
argument-hint: "<path-to-requirement>"
allowed-tools: Bash(node:*), Read, Grep, Glob, Write, Task
---

Execute `/spt:analyze $ARGUMENTS` steps, then `/spt:generate` steps, without pausing between them unless the analyst raised blocking open questions (then ask the user first).

Then STOP at the approval gate. Never approve on the user's behalf and never run tests. Tell the user to review `scenarios.md`, run `/spt:approve "Their Name"`, then `/spt:run <sandbox-alias>`.
