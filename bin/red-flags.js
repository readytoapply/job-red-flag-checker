#!/usr/bin/env node
'use strict';
// Job Red Flag Checker, command line.
//   red-flags posting.txt
//   pbpaste | red-flags
//   red-flags posting.txt --json
const fs = require('fs');
const RF = require('../src/red-flags.js');

const args = process.argv.slice(2);
const json = args.includes('--json');
const file = args.find((a) => !a.startsWith('--'));

if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: red-flags [file] [--json]\nReads a job posting from a file, or from stdin when no file is given.');
  process.exit(0);
}
if (!file && process.stdin.isTTY) {
  console.error('Paste a job posting into a file and run: red-flags posting.txt\n(or pipe it in: cat posting.txt | red-flags)');
  process.exit(1);
}

const text = file ? fs.readFileSync(file, 'utf8') : fs.readFileSync(0, 'utf8');
const r = RF.scan(text);

if (json) {
  console.log(JSON.stringify(r, null, 2));
  process.exit(0);
}

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (color ? '\x1b[' + code + 'm' + s + '\x1b[0m' : s);
const TIER_COLOR = { severe: '31', hard: '33', soft: '36' };
const LEVEL_COLOR = { stop: '31;1', high: '33;1', caution: '33', clear: '32', none: '32' };

const list = RF.flags();
['severe', 'hard', 'soft'].forEach((tier) => {
  const hits = r.flags.filter((f) => f.tier === tier && f.hits.length);
  if (!hits.length) return;
  console.log('\n' + c(TIER_COLOR[tier] + ';1', RF.TIERS[tier].label.toUpperCase() + ': ' + RF.TIERS[tier].meaning));
  hits.forEach((f) => {
    const info = list.find((x) => x.id === f.id);
    console.log('  ' + c('1', '⚑ ' + f.label));
    f.hits.forEach((h) => console.log('    ' + (h.note ? h.excerpt : '“' + h.excerpt + '”')));
    console.log('    ' + c('2', '→ ' + info.tip));
  });
});

const notChecked = list.filter((f) => f.detect !== 'auto' && !r.found.includes(f.id));
if (notChecked.length) {
  console.log('\n' + c('2', 'Rules cannot fully judge these. Check them yourself:'));
  notChecked.forEach((f) => console.log(c('2', '  ☐ ' + f.label)));
}

console.log('\n' + c(LEVEL_COLOR[r.verdict.level], r.verdict.title) + '\n' + r.verdict.text);
if (r.verdict.level === 'none' || r.verdict.level === 'clear') {
  console.log('\nLooks real? See how well your resume fits this job: https://readytoapply.ai/?utm_source=github&utm_medium=cli&utm_campaign=red-flags');
} else {
  console.log('\nHow to report a scam posting: https://readytoapply.ai/job-scam-checker?utm_source=github&utm_medium=cli&utm_campaign=red-flags#report');
}
