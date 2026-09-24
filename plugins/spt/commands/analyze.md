---
description: "[Step 1 of 3] Upload a requirement and run a Blast Radius Analysis against the Salesforce metadata in this VS Code workspace"
argument-hint: "<path-to-requirement.md|.txt|.pdf|.docx>"
allowed-tools: Bash(node:*), Read, Grep, Glob, Write, Task
---

Requirement file: `$ARGUMENTS`

Analyse this requirement against the Salesforce metadata available in the current VS Code workspace (the SFDX project's local source under `spt.config.json`'s `metadataPaths`) and produce a Blast Radius Analysis: the Salesforce components that could be impacted by the requirement or proposed change, covering every affected area the local metadata shows. Any requirement works (new feature, change, fix, data remapping); nothing here is specific to one requirement type.

1. If no file was given, ask for one. Supported: .md, .txt, .pdf, .docx.
2. Start a run: `node "${CLAUDE_PLUGIN_ROOT}/scripts/start-run.mjs" --requirement "$ARGUMENTS"`. Read the requirement from the `readRequirementFrom` path it prints.
3. Refresh the index: `node "${CLAUDE_PLUGIN_ROOT}/scripts/build-metadata-index.mjs"`.
4. Delegate to the **blast-radius-analyst** agent with the run folder path. It must:
   - read the org knowledge file (`orgKnowledgeFile` in spt.config.json) before mapping business terms,
   - extract seeds (objects, fields, components) from the requirement,
   - run `blast-radius.mjs` with those seeds,
   - verify and extend the result by reading the actual metadata files,
   - write `blast-radius.md` and `blast-radius.json` into the run folder, tagging each component with its `basis`.
5. Show the user the executive summary and the High-risk components table from `blast-radius.md`, then list assumptions and open questions (blocking ones first).
6. Say: "Review the blast radius. To adjust it, tell me what to add or remove, or run `/spt:finalize \"Your Name\" add <component> remove <component>`. When it's right, run `/spt:finalize \"Your Name\"` to lock it and complete Step 1."
