---
description: Set up SPT regression testing in this Salesforce project (config, sandbox check, metadata index)
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

Finish with a short "Next step: /spt:analyze requirements/<file>.md" message.
