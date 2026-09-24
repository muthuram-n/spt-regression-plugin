---
description: "[Step 1 of 3] Finalise the blast radius (apply reviewer adjustments, then lock it for scenario generation)"
argument-hint: "[\"Reviewer Name\"] [add <component> | remove <component> | note ...]"
allowed-tools: Bash(node:*), Read, Grep, Glob, Write, Edit
---

Reviewer input: `$ARGUMENTS`

1. Read `.spt/current-run`, then `blast-radius.json` and `blast-radius.md` in that run folder. If missing, tell the user to run /spt:analyze first.
2. If the reviewer asked to add, remove or re-rate components, or answered open questions (in `$ARGUMENTS` or earlier in this conversation):
   - For each addition, confirm the component exists in the local metadata (Grep/Glob). Add it to `components[]` with `addedBy: "reviewer"`, `verified: true`, and a `basis` per the **salesforce-knowledge-layers** skill. If it does not exist locally, add it to `notAnalysable[]` instead and say so.
   - For each removal, move the component to a `removedByReviewer[]` array with the reason. Do not delete it silently.
   - Move answered questions from `openQuestions[]` to `resolvedQuestions[]` with the answer.
   - Update `blast-radius.md` to match, including a "Reviewer adjustments" section.
   - If an answer reveals an org-specific behaviour, append it to `org-knowledge-proposals.md` in the run folder.
3. If `openQuestions[]` still contains items marked blocking, list them and STOP without finalising.
4. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/finalize-blast-radius.mjs" finalise --by "<reviewer name from $ARGUMENTS, or omit to use git user.name>"`.
5. Report: component counts by risk, adjustments applied, who finalised it and when. Say: "Step 1 complete. Blast radius locked. Next: /spt:generate (Step 2)."
