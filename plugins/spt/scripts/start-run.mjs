#!/usr/bin/env node
// Creates a new run folder and copies the requirement into it.
// Usage: node start-run.mjs --requirement path/to/req.md [--name short-slug]
import fs from 'node:fs';
import path from 'node:path';
import { RUNS_DIR, CURRENT_FILE, PROJECT_ROOT, arg, writeJson } from './lib/common.mjs';

const req = arg('requirement');
if (!req || !fs.existsSync(path.resolve(PROJECT_ROOT, req))) { console.error(`Requirement file not found: ${req}`); process.exit(1); }
const slug = (arg('name') || path.basename(req).replace(/\.[^.]+$/, '')).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 13);
const runId = `${stamp}-${slug}`;
const dir = path.join(RUNS_DIR, runId);
fs.mkdirSync(dir, { recursive: true });
fs.copyFileSync(path.resolve(PROJECT_ROOT, req), path.join(dir, 'requirement' + path.extname(req)));
writeJson(path.join(dir, 'run.json'), { runId, requirement: req, createdAt: new Date().toISOString(), status: 'analysing' });
fs.writeFileSync(CURRENT_FILE, runId);
console.log(JSON.stringify({ runId, dir: path.relative(PROJECT_ROOT, dir) }));
