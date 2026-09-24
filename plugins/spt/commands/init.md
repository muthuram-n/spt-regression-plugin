---
description: "[Setup] One-time setup of SPT in this Salesforce project (config, org knowledge file, sandbox check, metadata index)"
argument-hint: "[sandbox-org-alias]"
allowed-tools: Bash(node:*), Bash(sf:*), Read, Write, Edit
---

Set up the SPT regression package for this Salesforce DX project.

1. If `spt.config.json` does not exist in the project root, copy `${CLAUDE_PLUGIN_ROOT}/templates/spt.config.json` there. If the user passed an org alias (`$ARGUMENTS`), put it in `allowedOrgs`. Ask the user for the client name and any additional metadata paths if `force-app/main/default` is not the right root (check `sfdx-project.json` packageDirectories).
2. Ensure `sfdx-project.json` has a non-default package directory for generated tests (value of `testSourceDir`, default `spt-tests`). Add `{ "path": "spt-tests", "default": false }` if missing and create `spt-tests/main/default/classes/`.
3. Add `.spt/runs/*/raw-test-output.json` and `.spt/index/` to `.gitignore` (keep other run artefacts committed for audit).
4. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/preflight.mjs" --org <alias>` and report each check. If the org is not a sandbox, STOP and tell the user SPT will not run against production.
5. Suggest `sf project retrieve start --manifest manifest/package.xml --target-org <alias>` if the local metadata looks stale or sparse, then run `node "${CLAUDE_PLUGIN_ROOT}/scripts/build-metadata-index.mjs"` and summarise the component counts.
6. Copy `${CLAUDE_PLUGIN_ROOT}/templates/requirement-template.md` to `requirements/_TEMPLATE.md` if a `requirements/` folder does not exist.
7. If the org knowledge file (`orgKnowledgeFile` in spt.config.json, default `spt-org-knowledge.md`) does not exist, copy `${CLAUDE_PLUGIN_ROOT}/templates/org-knowledge.md` there. Pre-fill what the metadata shows with confidence (trigger handler classes, any class named like `TestDataFactory`, custom permissions named like `Bypass*`, installed managed-package namespaces from `sfdx-project.json`/metadata prefixes), mark each pre-filled line `(detected - please confirm)`, and ask the user to complete the rest. This is where client-specific behaviour lives; the plugin only holds global Salesforce rules.

Finish with a short "Next step: /spt:analyze requirements/<file>.md (Step 1)" message.
