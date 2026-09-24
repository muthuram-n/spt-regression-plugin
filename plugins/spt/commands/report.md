---
description: Re-open or regenerate the failure analysis and remediation report for the current run
allowed-tools: Bash(node:*), Read, Write, Grep, Glob, Task
---

1. Read `.spt/runs/<current>/results.json`. If missing, tell the user to run /spt:run.
2. If `failure-report.md` is missing or older than results.json, delegate to **failure-analyst** to regenerate it.
3. Display: summary table, each failed scenario (ID, title, priority, reason, remediation steps, owner suggestion), and the manual-test checklist.
