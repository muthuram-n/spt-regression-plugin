---
description: "[Steps 1-2] Run analyse -> finalise -> generate in one go, then stop at the human approval gate"
argument-hint: "<path-to-requirement>"
allowed-tools: Bash(node:*), Read, Grep, Glob, Write, Edit, Task
---

1. Execute the `/spt:analyze $ARGUMENTS` steps.
2. If the analyst raised blocking open questions, show them and STOP. Tell the user to answer them and run `/spt:finalize`, then `/spt:generate`.
3. Otherwise finalise without reviewer adjustments: `node "${CLAUDE_PLUGIN_ROOT}/scripts/finalize-blast-radius.mjs" finalise --by "system (/spt:full)"`. Tell the user the blast radius was finalised automatically and they can still adjust it with `/spt:finalize` before approving (this invalidates the scenarios, which must then be regenerated).
4. Execute the `/spt:generate` steps.

Then STOP at the approval gate. Never approve on the user's behalf and never run tests. Tell the user to review `scenarios.md`, run `/spt:approve "Their Name"`, then `/spt:run <sandbox-alias>`.
