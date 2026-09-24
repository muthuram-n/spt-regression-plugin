# SPT Regression Plugin for Claude Code

Requirement-driven Salesforce regression testing ("Regression as a Service") packaged as a reusable Claude Code plugin.

```
Upload Requirement → Blast Radius Analysis → Generate Scenarios → HUMAN APPROVAL → Run in Sandbox → Failure Analysis → Remediation
   /spt:analyze          (automatic)          /spt:generate       /spt:approve       /spt:run          (automatic)     failure-report.md
```

## Install (per user, once)

Prerequisites: Claude Code, Node.js 18+, Salesforce CLI (`sf`), a Salesforce DX project, an authorised **sandbox**.

In Claude Code:
```
/plugin marketplace add <your-git-host>/spt-regression-plugin
/plugin install spt@spt-marketplace
```
Restart Claude Code if the commands don't appear. Update later with `/plugin marketplace update spt-marketplace`.

### Team-wide install (recommended)
Commit this to each client project's `.claude/settings.json` so everyone who opens the repo is prompted to install:
```json
{
  "extraKnownMarketplaces": {
    "spt-marketplace": { "source": { "source": "git", "url": "https://<your-git-host>/spt-regression-plugin.git" } }
  },
  "enabledPlugins": { "spt@spt-marketplace": true }
}
```

## Use (per client project)

```
/spt:init my-uat-sandbox                         # config, sandbox check, metadata index
/spt:analyze requirements/JIRA-123.md            # blast radius → .spt/runs/<id>/blast-radius.md
/spt:generate                                    # scenarios → .spt/runs/<id>/scenarios.md
   ✍  reviewer ticks [x] approved scenarios in scenarios.md
/spt:approve "Reviewer Name"                     # hash-locked approval
/spt:run my-uat-sandbox                          # execute, parse, analyse failures
/spt:report                                      # re-open failure report
/spt:status                                      # where am I?
/spt:full requirements/JIRA-123.md               # analyse + generate, stops at approval
```

## What you get per run (`.spt/runs/<runId>/`)
| File | Content |
|---|---|
| `requirement.*` | Copy of the uploaded requirement |
| `blast-radius.md/.json` | Impacted objects, fields, flows, automations, validation rules, other components, affected areas, limitations |
| `scenarios.md/.json` | Generated scenarios with coverage matrix (review here) |
| `approved-scenarios.json` | Approver, timestamp, SHA-256 of the approved set |
| `test-map.json` | Scenario → Apex test method |
| `results.json` | Normalised pass/fail per scenario |
| `failure-report.md` | Why each scenario failed, root-cause class, remediation steps, manual checklist |

Commit run folders (except raw output) for an audit trail.

## Safety controls
- **Human approval gate**: tests can't run without `approved-scenarios.json`; editing approved scenarios invalidates the approval. `/spt:approve` and `/spt:run` can only be invoked by the user.
- **Org guard hook**: blocks `sf` deploy/test/data commands unless `--target-org` is explicit, is in `allowedOrgs`, and doesn't match `blockedOrgPatterns`.
- **Sandbox check**: preflight queries `Organization.IsSandbox` and refuses production.
- **Validate mode (default)**: tests run via check-only deploy, so nothing is left in the sandbox.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/CUSTOMISING.md](docs/CUSTOMISING.md).
