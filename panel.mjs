#!/usr/bin/env node
// 身体状态面板。只读 /root/.dsh/soma-state.json —— 不推进、不写盘、不抢插件的活。
//   node panel.mjs [--port 7788]
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { Soma } from './soma.mjs';

const statePath = process.env.SOMA_STATE || '/root/.dsh/soma-state.json';
const argv = process.argv.slice(2);
const port = Number(argv[argv.indexOf('--port') + 1]) || 7788;

let soma = new Soma();
let lastMtime = 0, savedAt = 0, err = null;

function refresh() {
  try {
    const st = statSync(statePath);
    if (st.mtimeMs !== lastMtime) {
      lastMtime = st.mtimeMs;
      savedAt = st.mtimeMs;
      soma = new Soma();
      soma.load(JSON.parse(readFileSync(statePath, 'utf8')));
      err = null;
    }
  } catch (e) { err = e.message; }
}

function payload() {
  refresh();
  return {
    ok: !err, err,
    words: soma.fmtWords(),
    age: savedAt ? Math.round((Date.now() - savedAt) / 1000) : null,
    regions: soma.read(),
    vitals: (() => { try { return soma.get('vitals').read(); } catch { return {}; } })(),
    rhythm: (() => { try { return soma.get('rhythm').read(); } catch { return null; } })(),
    homeo: (() => { try { return soma.get('homeo').read(); } catch { return null; } })(),
    cycle: (() => { try { return soma.get('cycle').read(); } catch { return null; } })(),
    memory: (() => { try { return soma.get('memory').read(); } catch { return null; } })(),
    table: err ? '' : soma.table(),
  };
}

import { HTML } from './panel-html.mjs';

createServer((req, res) => {
  const url = req.url.split('?')[0];
  const send = (code, type, body) => {
    res.writeHead(code, { 'content-type': type, 'access-control-allow-origin': '*', 'cache-control': 'no-store' });
    res.end(body);
  };
  if (url === '/' ) return send(200, 'text/html; charset=utf-8', HTML);
  if (url === '/state') return send(200, 'application/json', JSON.stringify(payload()));
  if (url === '/avatar') {
    for (const [f, t] of [['/root/.dsh/soma-avatar.png','image/png'],['/root/.dsh/soma-avatar.jpg','image/jpeg'],['/root/.dsh/soma-avatar.webp','image/webp']]) {
      if (existsSync(f)) return send(200, t, readFileSync(f));
    }
    return send(404, 'text/plain', 'none');
  }
  return send(404, 'text/plain', 'not found');
}).listen(port, '127.0.0.1', () => console.log(`soma 面板  http://127.0.0.1:${port}`));
