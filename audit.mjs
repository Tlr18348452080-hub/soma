#!/usr/bin/env node
// 把代码里每个常数的可信度标出来，看看还有多少是估的。
// 约定：在定义那一行的注释里写 [S] / [A] / [G]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('.', import.meta.url).pathname;
const files = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    if (n === 'node_modules' || n.startsWith('.')) continue;
    const p = join(d, n);
    if (statSync(p).isDirectory()) { if (!['research', 'tests', 'node_modules', 'plugin'].includes(n)) walk(p); }
    else if (n.endsWith('.mjs') && n !== 'audit.mjs') files.push(p);
  }
})(ROOT);

const TAG = /\[(S|A|G)\]/;
const hits = { S: [], A: [], G: [] };
for (const f of files) {
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    const m = line.match(TAG);
    if (m) hits[m[1]].push({ file: relative(ROOT, f), line: i + 1, text: line.trim() });
  });
}

const show = (tag, title) => {
  console.log(`\n${title}  ${hits[tag].length} 条`);
  for (const h of hits[tag]) console.log(`  ${h.file}:${h.line}  ${h.text.slice(0, 96)}`);
};

console.log(`扫描 ${files.length} 个文件`);
show('S', '■ [S] 有出处，可以引用');
show('A', '■ [A] 方向可信，数值未必');
show('G', '■ [G] 纯估的 —— 这些是欠的债');

const total = hits.S.length + hits.A.length + hits.G.length;
if (total) console.log(`\n标的 ${total} 处：S ${hits.S.length} / A ${hits.A.length} / G ${hits.G.length}`);
