# SPT Regression Plugin for Claude Code

Requirement-driven Salesforce regression testing ("Regression as a Service") packaged as a reusable Claude Code plugin. It replaces the manual prompt-by-prompt process with a fixed set of commands that work for any requirement against any client's Salesforce metadata.

When you upload a requirement, the plugin analyses it against the Salesforce metadata already checked out in your VS Code workspace (the SFDX project's `force-app` source) and runs a **Blast Radius Analysis**: it identifies the Salesforce objects, fields, flows, automations, validation rules and other components that could be impacted by the requirement, covering every affected area the local metadata can show.

## The three steps
```
STEP 1  Analyse requirement & blast radius   /spt:analyze <file>   ->  review  ->  /spt:finalize "Name"
STEP 2  Create regression tests               /spt:generate         ->  tick [x] in scenarios.md  ->  /spt:approve "Name"   (HUMAN)
STEP 3  Run regression tests                  /spt:run <sandbox>    ->  failures explained + remediation in failure-report.md
```
Setup once per project with `/spt:init <sandbox>`. Use `/spt:status` at any time to see the next command. `/spt:full <file>` runs Steps 1 and 2 in one go and stops at approval.

Global Salesforce rules are built into the plugin. Client-specific behaviour lives in the client repo's `spt-org-knowledge.md`, which improves after each run via `/spt:learn`.

## Install (per user, once)

Prerequisites: Claude Code, Node.js 18+, Salesforce CLI (`sf`), a Salesforce DX project, an authorised **sandbox**.

**From a terminal (one line):**
```
claude plugin marketplace add muthuram-n/spt-regression-plugin && claude plugin install spt@spt-marketplace
```

**Or inside the Claude Code chat in VS Code:**
```
/plugin marketplace add muthuram-n/spt-regression-plugin
/plugin install spt@spt-marketplace
```
Restart Claude Code if the `/spt:` commands don't appear. Update later with `/plugin marketplace update spt-marketplace`.

> `npx skills add muthuram-n/spt-regression-plugin` is **not** a substitute: it copies only the skill files, not the commands, agents, hooks or scripts, so the `/spt:` workflow will not work.

### Team-wide install (recommended)
Commit this to each client project's `.claude/settings.json` so everyone who opens the repo is prompted to install:
```json
{
  "extraKnownMarketplaces": {
    "spt-marketplace": { "source": { "source": "github", "repo": "muthuram-n/spt-regression-plugin" } }
  },
  "enabledPlugins": { "spt@spt-marketplace": true }
}
```

## Use (per client project)

```
/spt:init my-uat-sandbox                         # config, sandbox check, metadata index
/spt:analyze requirements/JIRA-123.docx          # STEP 1: blast radius → .spt/runs/<id>/blast-radius.md
/spt:finalize "Reviewer Name"                     # STEP 1: apply adjustments, lock the blast radius
/spt:generate                                    # STEP 2: scenarios → .spt/runs/<id>/scenarios.md
   ✍  reviewer ticks [x] approved scenarios in scenarios.md
/spt:approve "Reviewer Name"                     # STEP 2: hash-locked approval
/spt:run my-uat-sandbox                          # STEP 3: execute, explain failures, remediation
/spt:report                                      # re-open failure report
/spt:status                                      # where am I?
/spt:full requirements/JIRA-123.md               # steps 1-2 in one go, stops at approval
/spt:learn                                       # accept org-specific learnings into spt-org-knowledge.md
```

## What you get per run (`.spt/runs/<runId>/`)
| File | Content |
|---|---|
| `requirement.*` | Copy of the uploaded requirement (`.docx` also gets `requirement.extracted.md`) |
| `blast-radius.md/.json` | Impacted objects, fields, flows, automations, validation rules, other components, affected areas, limitations |
| `org-knowledge-proposals.md` | Org-specific facts discovered in this run, pending `/spt:learn` |
| `scenarios.md/.json` | Generated scenarios with coverage matrix (review here) |
| `approved-scenarios.json` | Approver, timestamp, SHA-256 of the approved set |
| `test-map.json` | Scenario → Apex test method |
| `results.json` | Normalised pass/fail per scenario |
| `failure-report.md` | Why each scenario failed, root-cause class, remediation steps, manual checklist |

Commit run folders (except raw output) for an audit trail.

## Safety controls
- **Blast radius lock**: scenarios are generated only from a finalised blast radius; re-finalising it invalidates any approval.
- **Human approval gate**: tests can't run without `approved-scenarios.json`; editing approved scenarios invalidates the approval. `/spt:approve` and `/spt:run` can only be invoked by the user.
- **Org guard hook**: blocks `sf` deploy/test/data commands unless `--target-org` is explicit, is in `allowedOrgs`, and doesn't match `blockedOrgPatterns`.
- **Sandbox check**: preflight queries `Organization.IsSandbox` and refuses production.
- **Validate mode (default)**: tests run via check-only deploy, so nothing is left in the sandbox.

Step-by-step user guide: [docs/SPT-Plugin-User-Guide.docx](docs/SPT-Plugin-User-Guide.docx). See also [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/CUSTOMISING.md](docs/CUSTOMISING.md).
