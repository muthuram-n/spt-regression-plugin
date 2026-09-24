# Architecture

## Design principle: deterministic scripts + reasoning agents
| Concern | Done by | Why |
|---|---|---|
| Parse metadata, build dependency graph, traverse | Node scripts (`build-metadata-index`, `blast-radius`) | Fast, repeatable, no token cost, same answer every time |
| Map business language → API names, verify dependencies, order-of-execution reasoning | `blast-radius-analyst` agent | Needs judgement; scripts are regex-based and produce false positives/negatives |
| Scenario design | `test-designer` agent + `regression-scenario-design` skill | Judgement, domain heuristics |
| Approval | Human + `approval-gate.mjs` | Must not be delegable to the model |
| Execution | `sf` CLI | Real org automation (flows, triggers, VRs) runs inside Apex tests |
| Result parsing | `parse-results.mjs` | Deterministic mapping via `SC_###` method prefix |
| Diagnosis & remediation | `failure-analyst` agent + `sf-remediation` skill | Judgement |

## Repository layout
```
spt-regression-plugin/
├── .claude-plugin/marketplace.json      # makes this repo installable as a marketplace
├── plugins/spt/
│   ├── .claude-plugin/plugin.json
│   ├── commands/        init, analyze, generate, approve, run, report, status, full
│   ├── agents/          blast-radius-analyst, test-designer, apex-test-author, failure-analyst
│   ├── skills/          sf-metadata-analysis, regression-scenario-design, sf-remediation
│   ├── hooks/hooks.json PreToolUse guard on Bash
│   ├── scripts/         Node 18+, zero dependencies
│   └── templates/       spt.config.json, requirement template, scenario schema
├── examples/requirements/
└── docs/
```

## Why Apex tests (and what they can't cover)
Apex tests in a sandbox execute the org's real flows, triggers, validation rules, roll-ups and sharing, which covers most of a typical blast radius. They cannot assert UI (layouts, LWC rendering, Lightning pages), email content, or receipt by external systems. Those scenarios are generated with `executionMode: "manual"` and appear as a checklist in the failure report. UI automation (e.g. Playwright/Provar) can be added later as a second executor.

## Run state machine
`analysing → analysed → scenarios_generated → approved → executed → reported` (stored in `run.json`).
