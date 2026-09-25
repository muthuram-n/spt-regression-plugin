#!/usr/bin/env node
// Writes the Excel deliverable for a workflow stage into the current run folder.
// Usage: node export-xlsx.mjs impact | testpack | results | failures
//   impact   -> impact-analysis.xlsx        (from blast-radius.json)
//   testpack -> regression-test-pack.xlsx   (from scenarios.json)
//   results  -> test-results.xlsx           (from results.json)
//   failures -> failure-analysis.xlsx       (from failure-analysis.json)
import fs from 'node:fs';
import path from 'node:path';
import { runDir, readJson, PROJECT_ROOT } from './lib/common.mjs';
import { writeXlsx } from './lib/xlsx.mjs';

const kind = process.argv[2];
const dir = runDir();
const run = readJson(path.join(dir, 'run.json'));
const load = f => { const p = path.join(dir, f); if (!fs.existsSync(p)) { console.error(`${f} not found in ${path.relative(PROJECT_ROOT, dir)}.`); process.exit(1); } return readJson(p); };
const opt = f => { const p = path.join(dir, f); return fs.existsSync(p) ? readJson(p) : null; };

// Agents write either plain strings or objects; flatten both into readable text.
const text = v => v == null ? '' : typeof v === 'string' || typeof v === 'number' ? String(v) : Array.isArray(v) ? v.map(text).join(', ')
  : Object.entries(v).filter(([, x]) => x != null && x !== '').map(([k, x]) => `${k}: ${text(x)}`).join('; ');
const pick = (o, ...keys) => { if (o == null || typeof o !== 'object') return keys.length === 1 ? '' : o; for (const k of keys) if (o[k] != null && o[k] !== '') return o[k]; return ''; };
const countBy = (arr, fn) => arr.reduce((a, x) => { const k = fn(x) || '(none)'; a[k] = (a[k] || 0) + 1; return a; }, {});
const kv = obj => Object.entries(obj).map(([k, v]) => [k, v]);
const summarySheet = (title, pairs) => ({ name: 'Summary', title, filter: false,
  columns: [{ header: 'Item', width: 32, style: 'bold' }, { header: 'Value', width: 80, auto: true }],
  rows: pairs.map(([k, v]) => [k, typeof v === 'number' ? String(v) : v]) });
const base = [['Run ID', run.runId], ['Requirement', run.requirement], ['Generated', new Date().toISOString()]];

let file, sheets;

if (kind === 'impact') {
  const br = load('blast-radius.json');
  const comps = br.components || [];
  const riskOrder = { High: 0, Medium: 1, Low: 2 };
  comps.sort((a, b) => (riskOrder[a.risk] ?? 3) - (riskOrder[b.risk] ?? 3));
  const byRisk = countBy(comps, c => c.risk), byType = countBy(comps, c => c.type);
  file = 'impact-analysis.xlsx';
  sheets = [
    summarySheet('Impact Analysis & Blast Radius', [
      ...base,
      ['Requirement summary', text(br.requirementSummary)],
      ['Overall risk', br.overallRisk || (byRisk.High ? 'High' : byRisk.Medium ? 'Medium' : 'Low')],
      ['Impacted components', comps.length],
      ...kv(byRisk).map(([k, v]) => [`  ${k} risk`, v]),
      ...kv(byType).map(([k, v]) => [`  ${k}`, v]),
      ['Impacted objects', (br.impactedObjects || []).map(o => pick(o, 'name', 'object') || text(o)).join(', ')],
      ['Open questions', (br.openQuestions || []).length],
    ]),
    { name: 'Impacted Components', columns: [
      { header: '#', width: 5 }, { header: 'Type', width: 16 }, { header: 'API Name', width: 38 }, { header: 'Object', width: 20 },
      { header: 'Risk', width: 10, auto: true }, { header: 'Impact / Why', width: 60 }, { header: 'Basis', width: 14 },
      { header: 'Verified', width: 10 }, { header: 'Metadata file', width: 55 }],
      rows: comps.map((c, i) => [i + 1, c.type, c.name || c.key, c.object, c.risk, [c.impact, c.reason].filter(Boolean).map(text).join(' – '),
        c.basis, c.verified === false ? 'No' : 'Yes', c.path]) },
    { name: 'Dependencies', columns: [
      { header: 'From', width: 38 }, { header: 'Relationship', width: 24 }, { header: 'To', width: 38 }, { header: 'Notes', width: 60 }],
      rows: (br.dependencies || []).map(d => typeof d === 'string' ? [d, '', '', ''] : [pick(d, 'from', 'source'), pick(d, 'type', 'relationship'), pick(d, 'to', 'target'), text(pick(d, 'notes', 'reason'))]) },
    { name: 'Objects & Fields', columns: [{ header: 'Kind', width: 10 }, { header: 'API Name', width: 40 }, { header: 'Type', width: 16 }, { header: 'How impacted', width: 70 }],
      rows: [
        ...(br.impactedObjects || []).map(o => ['Object', pick(o, 'name', 'object') || text(o), '', text(pick(o, 'impact', 'reason', 'how'))]),
        ...(br.impactedFields || []).map(f => ['Field', pick(f, 'name', 'field') || text(f), pick(f, 'type'), text(pick(f, 'impact', 'reason', 'how'))]),
      ] },
    { name: 'Affected Areas', columns: [{ header: 'Area', width: 36 }, { header: 'Description', width: 80 }],
      rows: (br.affectedAreas || []).map(a => typeof a === 'string' ? [a, ''] : [pick(a, 'area', 'name'), text(pick(a, 'description', 'impact', 'reason'))]) },
    { name: 'Risks & Considerations', columns: [{ header: 'Risk / consideration', width: 60 }, { header: 'Severity', width: 11, auto: true },
      { header: 'Mitigation / what to check', width: 60 }, { header: 'Related components', width: 40 }],
      rows: (br.risks || []).map(r => typeof r === 'string' ? [r, '', '', ''] : [text(pick(r, 'risk', 'description', 'consideration')), pick(r, 'severity', 'level'), text(pick(r, 'mitigation', 'check')), text(pick(r, 'components', 'related'))]) },
    { name: 'Assumptions & Questions', columns: [{ header: 'Type', width: 18 }, { header: 'Detail', width: 90 }, { header: 'Blocking', width: 11, auto: true }],
      rows: [
        ...(br.assumptions || []).map(a => ['Assumption', text(a), '']),
        ...(br.openQuestions || []).map(q => ['Open question', text(pick(q, 'question', 'text') || q), q?.blocking ? 'Blocking' : '']),
        ...(br.resolvedQuestions || []).map(q => ['Resolved', text(q), '']),
      ] },
    { name: 'Limitations', columns: [{ header: 'Not analysable from local metadata', width: 110 }],
      rows: [...(br.notAnalysable || []), ...(br.limitations || [])].map(x => [text(x)]) },
  ];
} else if (kind === 'testpack') {
  const sc = load('scenarios.json').scenarios || [];
  const approved = opt('approved-scenarios.json');
  const approvedIds = new Set((approved?.scenarios || []).map(s => s.id));
  const br = opt('blast-radius.json');
  file = 'regression-test-pack.xlsx';
  const coverage = (br?.components || []).map(c => {
    const ids = sc.filter(s => (s.components || []).some(k => k === c.key || k === c.name)).map(s => s.id);
    return [c.name || c.key, c.type, c.risk, ids.join(', ') || { v: 'Not covered', style: 'warn' }];
  });
  sheets = [
    summarySheet('Regression Test Pack', [
      ...base, ['Test cases', sc.length],
      ...kv(countBy(sc, s => s.priority)).map(([k, v]) => [`  Priority ${k}`, v]),
      ...kv(countBy(sc, s => s.executionMode)).map(([k, v]) => [`  Mode: ${k}`, v]),
      ...kv(countBy(sc, s => s.category)).map(([k, v]) => [`  Category: ${k}`, v]),
      ['Approval', approved ? `Approved by ${approved.approver} at ${approved.approvedAt}` : 'Awaiting human approval'],
    ]),
    { name: 'Test Cases', columns: [
      { header: 'ID', width: 9 }, { header: 'Title', width: 42 }, { header: 'Category', width: 12 }, { header: 'Priority', width: 9 },
      { header: 'Mode', width: 9 }, { header: 'Run as', width: 18 }, { header: 'Given', width: 45 }, { header: 'When', width: 38 },
      { header: 'Then (expected result)', width: 45 }, { header: 'Components', width: 40 }, { header: 'Approval', width: 12, auto: true }],
      rows: sc.map(s => [s.id, s.title, s.category, s.priority, s.executionMode, s.runAsProfile, s.given, s.when, s.then, s.components,
        approved ? (approvedIds.has(s.id) ? { v: 'Approved', style: 'pass' } : { v: 'Rejected', style: 'fail' }) : 'Pending']) },
    { name: 'Coverage', columns: [{ header: 'Blast-radius component', width: 42 }, { header: 'Type', width: 16 }, { header: 'Risk', width: 10, auto: true }, { header: 'Test case IDs', width: 40 }],
      rows: coverage },
  ];
} else if (kind === 'results') {
  const res = load('results.json');
  const rows = res.scenarios || [];
  file = 'test-results.xlsx';
  sheets = [
    summarySheet('Test Execution Results', [
      ...base, ['Executed', res.parsedAt], ['Target org', run.targetOrg || ''],
      ...kv(res.summary || {}).map(([k, v]) => [k, v]),
      ['Compile / deploy errors', (res.componentErrors || []).length],
    ]),
    { name: 'Results', columns: [
      { header: 'ID', width: 9 }, { header: 'Title', width: 42 }, { header: 'Priority', width: 9 }, { header: 'Mode', width: 9 },
      { header: 'Status', width: 10, auto: true }, { header: 'Test method', width: 40 }, { header: 'Message', width: 60 }, { header: 'Stack trace', width: 50 }],
      rows: rows.map(r => [r.id, r.title, r.priority, r.executionMode, r.status, r.test, r.message, r.stackTrace]) },
    { name: 'Manual Checklist', columns: [{ header: 'ID', width: 9 }, { header: 'Title', width: 50 }, { header: 'Priority', width: 9 }, { header: 'Result (Pass/Fail)', width: 18 }, { header: 'Tester notes', width: 50 }],
      rows: rows.filter(r => r.status === 'Manual').map(r => [r.id, r.title, r.priority, '', '']) },
    { name: 'Compile Errors', columns: [{ header: 'Component', width: 40 }, { header: 'Type', width: 14 }, { header: 'Line', width: 8 }, { header: 'Problem', width: 80 }],
      rows: (res.componentErrors || []).map(e => [e.component, e.type, e.line, e.problem]) },
  ];
} else if (kind === 'failures') {
  const fa = load('failure-analysis.json');
  const items = fa.failures || [];
  file = 'failure-analysis.xlsx';
  sheets = [
    summarySheet('Failure Analysis & Recommendations', [
      ...base, ['Verdict', fa.verdict || ''], ['Failed / errored scenarios', items.length],
      ...kv(countBy(items, f => f.rootCauseClass)).map(([k, v]) => [`  ${k}`, v]),
      ['Summary', text(fa.summary)],
    ]),
    { name: 'Failure Analysis', columns: [
      { header: 'ID', width: 9 }, { header: 'Title', width: 36 }, { header: 'Priority', width: 9 }, { header: 'Status', width: 9, auto: true },
      { header: 'Root-cause class', width: 20 }, { header: 'Why it failed', width: 60 }, { header: 'Evidence', width: 45 },
      { header: 'Impacted components', width: 38 }, { header: 'Recommended fix / next steps', width: 60 }, { header: 'Owner', width: 14 },
      { header: 'Severity', width: 10, auto: true }, { header: 'Regression considerations', width: 45 }, { header: 'Basis', width: 14 }],
      rows: items.map(f => [f.id, f.title, f.priority, f.status, f.rootCauseClass, text(f.whyItFailed), text(f.evidence), f.impactedComponents,
        Array.isArray(f.remediationSteps) ? f.remediationSteps.map((s, i) => `${i + 1}. ${text(s)}`).join('\n') : text(f.remediationSteps),
        f.owner, f.severity, text(f.regressionConsiderations), f.basis]) },
    { name: 'Regression Considerations', columns: [{ header: 'Consideration', width: 110 }],
      rows: (fa.regressionConsiderations || []).map(x => [text(x)]) },
  ];
} else {
  console.error('Usage: export-xlsx.mjs impact | testpack | results | failures'); process.exit(1);
}

const out = path.join(dir, file);
writeXlsx(out, sheets.filter(s => s.rows.length || s.name === 'Summary' || s.name === 'Results' || s.name === 'Test Cases' || s.name === 'Impacted Components' || s.name === 'Failure Analysis'));
console.log(JSON.stringify({ written: path.relative(PROJECT_ROOT, out), sheets: sheets.map(s => `${s.name} (${s.rows.length})`) }));
