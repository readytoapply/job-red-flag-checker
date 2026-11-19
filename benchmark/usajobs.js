#!/usr/bin/env node
'use strict';
// False alarms on real US federal job postings. Every posting is a real job,
// so every warning the checker gives one is a false alarm.
//
// DATA. Not included in this repository. The postings come from the Hugging
// Face dataset loyoladatamining/usajobs (license MIT per its dataset card;
// USAJOBS open data), curated by Resh, Lee & Ming (2025), "U.S. Federal Civil
// Position Job Postings", figshare, doi:10.6084/m9.figshare.28509314.v5.
// https://huggingface.co/datasets/loyoladatamining/usajobs
//
// 1. Download postings to a local file (once; it resumes if interrupted):
//      node benchmark/usajobs.js fetch --config 2026_03 --n 7000
//    This reads Hugging Face's public dataset viewer API, 100 rows a request,
//    one request at a time, with a pause between requests. It writes
//    benchmark/data/usajobs-<config>.jsonl (one posting per line: control
//    number, title, text). benchmark/data/ is git-ignored: keep it local.
//
// 2. Score a slice of them:
//      node benchmark/usajobs.js score --skip 5000 --limit 2000
//    --skip N leaves out the first N postings (the ones rules were tuned on),
//    --limit N scores at most N, --file PATH reads another file of the same
//    shape, --show prints each flag's control number and matched words.
//
// The figures in benchmark/HISTORY.md, and the rules version each one was
// measured with, are recorded there. The checker itself never uses the network;
// only `fetch` here does.
const fs = require('fs');
const path = require('path');
const RF = require('../src/red-flags.js');

const argv = process.argv.slice(2);
const cmd = argv[0];
const arg = (n, d) => { const i = argv.indexOf(n); return i > 0 ? argv[i + 1] : d; };
const CONFIG = arg('--config', '2026_03');
const DEFAULT_FILE = path.join(__dirname, 'data', 'usajobs-' + CONFIG + '.jsonl');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchRows() {
  if (typeof fetch !== 'function') throw new Error('fetch needs Node 18 or later');
  const N = parseInt(arg('--n', '7000'), 10);
  const OUT = arg('--file', DEFAULT_FILE);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  let got = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').split('\n').filter(Boolean).length : 0;
  if (got >= N) { console.log('Already have ' + got + ' postings in ' + OUT); return; }
  console.log('Starting at posting ' + (got + 1));
  for (let offset = got; got < N; offset += 100) {
    const url = 'https://datasets-server.huggingface.co/rows?dataset=loyoladatamining%2Fusajobs&config=' +
      encodeURIComponent(CONFIG) + '&split=train&offset=' + offset + '&length=' + Math.min(100, N - got);
    let j;
    for (let attempt = 1; ; attempt++) {
      const r = await fetch(url, { headers: { 'User-Agent': 'job-red-flag-checker-benchmark' } });
      if (r.ok) { j = await r.json(); break; }
      if (attempt >= 6) throw new Error('HTTP ' + r.status + ' at offset ' + offset + ' (saved ' + got + '; run again to resume)');
      const wait = (parseInt(r.headers.get('retry-after'), 10) || 30 * attempt) * 1000;
      console.log('  HTTP ' + r.status + ', waiting ' + Math.round(wait / 1000) + ' s');
      await sleep(wait);
    }
    if (!j.rows || !j.rows.length) break;
    fs.appendFileSync(OUT, j.rows.map((x) => JSON.stringify({ id: x.row.usajobsControlNumber, title: x.row.title, text: x.row.text })).join('\n') + '\n');
    got += j.rows.length;
    if (got % 500 === 0) console.log('  ' + got + ' postings');
    await sleep(1000);
  }
  console.log('Have ' + got + ' postings in ' + OUT);
}

function score() {
  const FILE = arg('--file', DEFAULT_FILE);
  if (!fs.existsSync(FILE)) {
    console.error('No postings at ' + FILE + '. Download them first:\n  node benchmark/usajobs.js fetch --config ' + CONFIG + ' --n 7000');
    process.exit(1);
  }
  const SKIP = parseInt(arg('--skip', '0'), 10) || 0;
  const LIMIT = parseInt(arg('--limit', '0'), 10) || Infinity;
  const SHOW = argv.includes('--show');
  const rows = fs.readFileSync(FILE, 'utf8').split('\n').filter(Boolean).slice(SKIP, SKIP + LIMIT).map((l) => JSON.parse(l));
  if (!rows.length) { console.error('No postings in that slice.'); process.exit(1); }
  const levels = {}, perFlag = {}, shown = [];
  const flags = RF.flags();
  rows.forEach((p) => {
    const r = RF.scan(p.text || '');
    levels[r.verdict.level] = (levels[r.verdict.level] || 0) + 1;
    r.flags.forEach((f) => {
      if (!f.hits.length) return;
      perFlag[f.id] = (perFlag[f.id] || 0) + 1;
      if (SHOW) f.hits.forEach((h) => shown.push('  ' + f.id + ' #' + p.id + ': ' + h.match));
    });
  });
  const n = rows.length, pct = (a) => (100 * a / n).toFixed(2) + '%';
  const warn = (levels.stop || 0) + (levels.high || 0) + (levels.caution || 0);
  console.log('Job Red Flag Checker v' + RF.version + ' · ' + n + ' real federal postings (' + CONFIG + ', postings ' + (SKIP + 1) + '–' + (SKIP + n) + ')');
  ['stop', 'high', 'caution', 'clear', 'none'].forEach((l) => console.log('  ' + l.padEnd(8) + String(levels[l] || 0).padStart(6) + '  (' + pct(levels[l] || 0) + ')'));
  console.log('Wrongly told "Stop":     ' + (levels.stop || 0) + ' of ' + n + ' (' + pct(levels.stop || 0) + ')');
  console.log('Given any warning:       ' + warn + ' of ' + n + ' (' + pct(warn) + ')');
  console.log('\nFlags that fired (postings):');
  flags.forEach((f) => { if (perFlag[f.id]) console.log('  ' + (f.tier + ' ').padEnd(7) + f.id.padEnd(28) + String(perFlag[f.id]).padStart(5)); });
  if (SHOW) console.log('\nMatched words:\n' + shown.join('\n'));
  console.log('\nData: loyoladatamining/usajobs (MIT), Resh, Lee & Ming (2025), doi:10.6084/m9.figshare.28509314.v5');
}

if (cmd === 'fetch') fetchRows().catch((e) => { console.error(e.message); process.exit(1); });
else if (cmd === 'score') score();
else {
  console.log('Usage:\n  node benchmark/usajobs.js fetch [--config 2026_03] [--n 7000] [--file PATH]\n  node benchmark/usajobs.js score [--config 2026_03] [--skip N] [--limit N] [--file PATH] [--show]');
  process.exit(cmd ? 1 : 0);
}
