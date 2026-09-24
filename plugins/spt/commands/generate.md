---
description: Generate regression test scenarios for the current run and prepare them for human review
allowed-tools: Bash(node:*), Read, Grep, Glob, Write, Task
---

1. Confirm the current run has `blast-radius.json` (`cat .spt/current-run`). If not, tell the user to run /spt:analyze first.
2. Delegate to the **test-designer** agent. It writes `scenarios.json` (must validate against `${CLAUDE_PLUGIN_ROOT}/templates/scenario.schema.json`) and `scenarios.md` with every scenario as an UNTICKED checkbox line `- [ ] **SC-###** ...`.
3. Present to the user: the coverage matrix (component -> scenarios), counts by priority and executionMode, and any components with no scenario and why.
4. STOP. Tell the user:
   - "Open `.spt/runs/<runId>/scenarios.md`, tick `[x]` the scenarios you approve, edit or add any you need, then run `/spt:approve`."
   
**You must never tick checkboxes, edit approval state, or run approval-gate.mjs yourself. Approval is a human action.**
