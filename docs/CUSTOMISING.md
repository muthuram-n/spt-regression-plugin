# Customising for a client

All client-specific settings live in the client project's `spt.config.json`, not in the plugin.

| Setting | Purpose |
|---|---|
| `metadataPaths` | Source folders to index (multiple package dirs supported) |
| `allowedOrgs` | Sandbox aliases SPT may deploy/test against |
| `blockedOrgPatterns` | Alias substrings always refused |
| `execution.mode` | `validate` (check-only, recommended) or `deploy` |
| `blastRadius.maxDepth` | Traversal depth through field writes (2 is a good default) |
| `blastRadius.excludeComponents` | Keys like `Flow:Legacy_Unused` to ignore |
| `approval.minApprovedScenarios` | Minimum ticked scenarios |

## Client-specific knowledge
Add a `CLAUDE.md` in the client project with things like: trigger framework name, test data factory class, integration users, managed packages, bypass custom permissions. The agents read project `CLAUDE.md` automatically.

## Extending the plugin
- New component types: add a matcher in `scripts/build-metadata-index.mjs`.
- New executor (UI tests): add a command + agent; keep the `SC_###` ID convention so `results.json` mapping still works.
- Versioning: bump `version` in both `plugin.json` and `marketplace.json`, update `CHANGELOG.md`, tag the release.
