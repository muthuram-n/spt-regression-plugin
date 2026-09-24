---
description: Upload a requirement and run a Blast Radius Analysis against local Salesforce metadata
argument-hint: "<path-to-requirement.md|.txt|.pdf>"
allowed-tools: Bash(node:*), Read, Grep, Glob, Write, Task
---

Requirement file: `$ARGUMENTS`

1. If no file was given, ask for one. Supported: .md, .txt, .pdf. For .docx ask the user to export as PDF or Markdown.
2. Start a run: `node "${CLAUDE_PLUGIN_ROOT}/scripts/start-run.mjs" --requirement "$ARGUMENTS"`.
3. Refresh the index: `node "${CLAUDE_PLUGIN_ROOT}/scripts/build-metadata-index.mjs"`.
4. Delegate to the **blast-radius-analyst** agent with the run folder path. It must:
   - extract seeds (objects, fields, components) from the requirement,
   - run `blast-radius.mjs` with those seeds,
   - verify and extend the result by reading the actual metadata files,
   - write `blast-radius.md` and `blast-radius.json` into the run folder.
5. Show the user the executive summary and the High-risk components table from `blast-radius.md`, list any assumptions or open questions the analyst raised, then say: "Review the blast radius. When ready, run /spt:generate."
