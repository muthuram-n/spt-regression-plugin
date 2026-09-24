---
description: "[Step 3 of 3] Run the approved regression tests in a sandbox, then explain failures and give remediation steps"
argument-hint: "<sandbox-org-alias>"
disable-model-invocation: true
allowed-tools: Bash(node:*), Bash(sf:*), Read, Write, Edit, Grep, Glob, Task
---

Target org: `$ARGUMENTS`

1. Gate checks (stop on any failure and explain):
   - `node "${CLAUDE_PLUGIN_ROOT}/scripts/approval-gate.mjs" verify`
   - `node "${CLAUDE_PLUGIN_ROOT}/scripts/preflight.mjs" --org $ARGUMENTS` (must confirm sandbox)
2. Delegate to the **apex-test-author** agent to generate Apex test classes ONLY for approved scenarios with `executionMode: "apex"` into `<testSourceDir>/main/default/classes/`, named `SPT_<Area>_Test`, with one method per scenario named `SC_###_<shortName>` (results are mapped back by this prefix). It writes `test-map.json` (scenario -> Class.method) in the run folder. It must NOT modify `approved-scenarios.json` (that would invalidate the approval hash).
3. Execute, based on `execution.mode` in spt.config.json:
   - `validate` (default, leaves nothing in the org):
     `sf project deploy validate --source-dir <testSourceDir> --target-org $ARGUMENTS --test-level RunSpecifiedTests --tests <Class1> --tests <Class2> --wait <waitMinutes> --json > .spt/runs/<runId>/raw-test-output.json`
   - `deploy`: `sf project deploy start ...` with the same flags.
   A non-zero exit code is expected when tests fail; continue.
4. Parse: `node "${CLAUDE_PLUGIN_ROOT}/scripts/parse-results.mjs"`.
5. If there are compile errors (`componentErrors`), fix the generated test class (never the org's production code) and re-run up to 2 times. Record each attempt in the report.
6. Delegate to the **failure-analyst** agent to produce `failure-report.md`.
7. Show the user: pass/fail/manual summary table, then the failed scenarios with a one-line reason each, and point to `failure-report.md` for root cause and remediation. List manual scenarios as a checklist for the tester. If new org knowledge was proposed, suggest `/spt:learn`.
