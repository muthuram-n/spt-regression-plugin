# Customising for a client

All client-specific settings live in the client project's `spt.config.json`, not in the plugin.

| Setting | Purpose |
|---|---|
| `metadataPaths` | Source folders to index (multiple package dirs supported) |
| `orgKnowledgeFile` | Client-specific behaviour file (default `spt-org-knowledge.md`) |
| `allowedOrgs` | Sandbox aliases SPT may deploy/test against |
| `blockedOrgPatterns` | Alias substrings always refused |
| `execution.mode` | `validate` (check-only, recommended) or `deploy` |
| `blastRadius.maxDepth` | Traversal depth through field writes (2 is a good default) |
| `blastRadius.excludeComponents` | Keys like `Flow:Legacy_Unused` to ignore |
| `approval.minApprovedScenarios` | Minimum ticked scenarios |

## Client-specific (org) knowledge
`/spt:init` creates `spt-org-knowledge.md` from the template and pre-fills what it can detect. Complete it with the business glossary, trigger framework, bypass mechanisms, test data factory, integration users, managed packages and known org behaviours. Every agent reads it.

After each run, agents propose new org-specific facts in `.spt/runs/<id>/org-knowledge-proposals.md`. A person accepts or rejects them with `/spt:learn`, which merges accepted facts into the file. Commit the file so the whole team benefits.

Rule of thumb: if it would be true in any Salesforce org, it belongs in the plugin skills. If it is true only for this client, it belongs in `spt-org-knowledge.md`.

## Extending the plugin
- New component types: add a matcher in `scripts/build-metadata-index.mjs`.
- New executor (UI tests): add a command + agent; keep the `SC_###` ID convention so `results.json` mapping still works.
- Versioning: bump `version` in both `plugin.json` and `marketplace.json`, update `CHANGELOG.md`, tag the release.
