#!/usr/bin/env node
// Human approval gate.
//   freeze : reads ticked checkboxes in scenarios.md, writes approved-scenarios.json (hash-locked)
//   verify : exits 0 only if approval exists and approved scenarios are unchanged since approval
//   revoke : deletes the approval
// Usage: node approval-gate.mjs freeze --approver "Jane Smith" | verify | revoke
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { runDir, readJson, writeJson, sha256, loadConfig, arg } from './lib/common.mjs';

const cmd = process.argv[2];
const dir = runDir();
const scenariosJson = path.join(dir, 'scenarios.json');
const scenariosMd = path.join(dir, 'scenarios.md');
const approvedFile = path.join(dir, 'approved-scenarios.json');
const cfg = loadConfig() || {};

const hashOf = list => sha256(JSON.stringify(list.map(({ testMethod, ...s }) => s)));

if (cmd === 'freeze') {
  if (!fs.existsSync(scenariosJson) || !fs.existsSync(scenariosMd)) { console.error('scenarios.json / scenarios.md not found. Run /spt:generate first.'); process.exit(1); }
  let approver = arg('approver');
  if (!approver) { try { approver = execSync('git config user.name', { encoding: 'utf8' }).trim(); } catch { /* ignore */ } }
  if (cfg.approval?.requireApproverName !== false && !approver) { console.error('Approver name required: --approver "Full Name"'); process.exit(1); }

  const md = fs.readFileSync(scenariosMd, 'utf8');
  const ticked = new Set([...md.matchAll(/^\s*-\s*\[[xX]\]\s*\**(SC-\d{3})/gm)].map(m => m[1]));
  const rejected = new Set([...md.matchAll(/^\s*-\s*\[\s\]\s*\**(SC-\d{3})/gm)].map(m => m[1]));
  const all = readJson(scenariosJson).scenarios;
  const approved = all.filter(s => ticked.has(s.id));
  const min = cfg.approval?.minApprovedScenarios ?? 1;
  if (approved.length < min) { console.error(`Only ${approved.length} scenario(s) ticked; at least ${min} required. Tick "- [x] SC-###" lines in scenarios.md.`); process.exit(1); }

  const record = {
    status: 'approved', approver, approvedAt: new Date().toISOString(),
    approvedCount: approved.length, rejected: [...rejected], hash: hashOf(approved), scenarios: approved
  };
  writeJson(approvedFile, record);
  const run = readJson(path.join(dir, 'run.json')); run.status = 'approved'; writeJson(path.join(dir, 'run.json'), run);
  console.log(JSON.stringify({ approved: approved.length, rejected: rejected.size, approver, file: approvedFile }, null, 2));
} else if (cmd === 'verify') {
  if (!fs.existsSync(approvedFile)) { console.error('NOT APPROVED: no approved-scenarios.json. A human must run /spt:approve.'); process.exit(2); }
  const rec = readJson(approvedFile);
  if (rec.status !== 'approved' || hashOf(rec.scenarios) !== rec.hash) { console.error('APPROVAL INVALID: approved scenarios were modified after approval. Re-run /spt:approve.'); process.exit(2); }
  console.log(JSON.stringify({ ok: true, approver: rec.approver, approvedAt: rec.approvedAt, count: rec.approvedCount }));
} else if (cmd === 'revoke') {
  if (fs.existsSync(approvedFile)) fs.unlinkSync(approvedFile);
  console.log('Approval revoked.');
} else {
  console.error('Usage: approval-gate.mjs freeze|verify|revoke'); process.exit(1);
}
