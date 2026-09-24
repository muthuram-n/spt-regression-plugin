# Architecture

## Design principle: deterministic scripts + reasoning agents
| Concern | Done by | Why |
|---|---|---|
| Parse metadata, build dependency graph, traverse | Node scripts (`build-metadata-index`, `blast-radius`) | Fast, repeatable, no token cost, same answer every time |
| Map business language → API names, verify dependencies, order-of-execution reasoning | `blast-radius-analyst` agent | Needs judgement; scripts are regex-based and produce false positives/negatives |
| Blast radius finalisation | Human review + `finalize-blast-radius.mjs` | Locks scope before scenarios are designed |
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
│   ├── commands/        init, analyze, finalize, generate, approve, run, report, status, full, learn
│   ├── agents/          blast-radius-analyst, test-designer, apex-test-author, failure-analyst
│   ├── skills/          sf-metadata-analysis, regression-scenario-design, sf-remediation, salesforce-knowledge-layers
│   ├── hooks/hooks.json PreToolUse guard on Bash
│   ├── scripts/         Node 18+, zero dependencies
│   └── templates/       spt.config.json, org-knowledge.md, requirement template, scenario schema
├── examples/requirements/
└── docs/
```

## Why Apex tests (and what they can't cover)
Apex tests in a sandbox execute the org's real flows, triggers, validation rules, roll-ups and sharing, which covers most of a typical blast radius. They cannot assert UI (layouts, LWC rendering, Lightning pages), email content, or receipt by external systems. Those scenarios are generated with `executionMode: "manual"` and appear as a checklist in the failure report. UI automation (e.g. Playwright/Provar) can be added later as a second executor.

## The three steps
| Step | Commands | Gate at the end |
|---|---|---|
| 1. Analyse requirement & blast radius | `/spt:analyze`, `/spt:finalize` | `run.json.blastRadius.hash` (finalise) |
| 2. Create regression tests | `/spt:generate`, `/spt:approve` | `approved-scenarios.json` hash (human only) |
| 3. Run regression tests | `/spt:run`, `/spt:report` | n/a: produces `failure-report.md` |

## Knowledge layers
Global Salesforce rules live in the plugin skills and are the same for every client. Org-specific behaviour lives in the client repo's `spt-org-knowledge.md` and is never written into the plugin. Precedence: metadata > org knowledge > global rule > assumption. See the `salesforce-knowledge-layers` skill.

## Run state machine
`analysing → blast_radius_finalised → approved → executed` (stored in `run.json`; scenarios and reports are tracked by the files in the run folder).
