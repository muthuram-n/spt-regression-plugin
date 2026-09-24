---
description: "[Knowledge] Review org-specific learnings proposed during runs and add the accepted ones to the org knowledge file"
argument-hint: "[runId | all]"
disable-model-invocation: true
allowed-tools: Bash(node:*), Read, Write, Edit, Glob
---

Scope: `$ARGUMENTS` (default: current run).

1. Read `orgKnowledgeFile` from `spt.config.json` (default `spt-org-knowledge.md`). If it doesn't exist, copy `${CLAUDE_PLUGIN_ROOT}/templates/org-knowledge.md` there.
2. Collect `org-knowledge-proposals.md` from the chosen run folder(s) under `.spt/runs/`. Skip items already marked `[accepted]` or `[rejected]`.
3. Show each proposal with its evidence and ask the user which to accept (accept all / pick by number / reject). Do not decide for them.
4. Merge each accepted fact into the right section of the org knowledge file. If it contradicts an existing entry, show both and ask which to keep. Mark the proposal line `[accepted]` or `[rejected]` in its proposals file.
5. Report what was added. Remind the user to commit the org knowledge file so the whole team, and future runs, benefit.
