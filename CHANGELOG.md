# Changelog
## 0.2.0
- Workflow is now three explicit steps. Every command description is labelled `[Step 1 of 3]`, `[Step 2 of 3]`, `[Step 3 of 3]`, `[Setup]`, `[Knowledge]` or `[Utility]`.
- New `/spt:finalize` (end of Step 1): the reviewer adds, removes or re-rates components and answers open questions, then the blast radius is hash-locked. `/spt:generate` now requires a finalised blast radius, and an approval becomes invalid if the blast radius is re-finalised.
- Org-specific knowledge layer: new `spt-org-knowledge.md` (created by `/spt:init`, path set by `orgKnowledgeFile`) holds client-specific behaviour. The new `salesforce-knowledge-layers` skill separates global Salesforce rules from org-specific facts, and every component and diagnosis carries a `basis` tag. Agents write `org-knowledge-proposals.md` per run; the new `/spt:learn` (human-only) merges accepted proposals into the org knowledge file.
- `.docx` requirements are supported (zero-dependency extraction to `requirement.extracted.md`).

## 0.1.1
- Fix: `build-metadata-index.mjs` now resolves field references/writes in Apex classes and triggers accessed through a variable (`opp.Discount__c`, `Trigger.new[0].Discount__c`), not just literal `Object.Field` text. Previously Apex logic — where most blast-radius-relevant behaviour lives — only ever registered as a generic "references object X", and never contributed to depth>1 traversal via `blast-radius.mjs` because it had no `writes`. Apex components now populate `writes` the same way Flows do, so a field an Apex class assigns correctly seeds the next traversal depth.

## 0.1.0
- Initial scaffold: blast radius, scenario generation, approval gate, sandbox execution (validate mode), failure analysis.
