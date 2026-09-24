---
description: "[Utility] Show where the current SPT run is in the 3-step workflow and the next command to run"
allowed-tools: Bash(node:*), Bash(ls:*), Bash(cat:*), Read
---

Read `.spt/current-run` and the run folder. Report the run ID, requirement, and which stages are complete, grouped by step:

- **Step 1 — Analyse & blast radius:** Requirement uploaded -> Blast radius analysed -> Blast radius finalised (by whom/when; check with `finalize-blast-radius.mjs verify`)
- **Step 2 — Regression tests:** Scenarios generated -> Approved (by whom/when; check with `approval-gate.mjs verify`)
- **Step 3 — Run:** Executed (pass/fail counts from results.json) -> Failure report -> Org knowledge proposals pending (count unticked items in `org-knowledge-proposals.md`)

State the single next command the user should run. List other runs in `.spt/runs/` (newest first, max 5).
