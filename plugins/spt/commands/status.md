---
description: Show where the current SPT run is in the workflow
allowed-tools: Bash(node:*), Bash(ls:*), Bash(cat:*), Read
---

Read `.spt/current-run` and the run folder. Report the run ID, requirement, and which stages are complete:
Requirement -> Blast radius -> Scenarios -> Approved (by whom/when, and whether the hash still verifies via `approval-gate.mjs verify`) -> Executed -> Failure report.
State the single next command the user should run. List other runs in `.spt/runs/` (newest first, max 5).
