import https from 'node:https';
import fs from 'node:fs';

const yml = fs.readFileSync('/root/.dsh/.credentials.yaml', 'utf8');
const key = (yml.match(/GPT_API_KEY:\s*(\S+)/) || [])[1];
if (!key) throw new Error('no key');

export function chat(messages, opts = {}) {
  const body = JSON.stringify({
    model: opts.model || 'claude-opus-5-5',
    messages,
    max_tokens: opts.max_tokens || 300,
    temperature: opts.temperature ?? 0.7,
  });
  return new Promise((resolve) => {
    const req = https.request(
      {
        host: 'api3.gemai.cc',
        path: '/v1/chat/completions',
        method: 'POST',
        family: 4,
        timeout: 90000,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let b = '';
        res.setEncoding('utf8');
        res.on('data', (d) => (b += d));
        res.on('end', () => {
          try {
            const j = JSON.parse(b);
            resolve({ status: res.statusCode, text: j.choices?.[0]?.message?.content ?? JSON.stringify(j).slice(0, 300) });
          } catch {
            resolve({ status: res.statusCode, text: b.slice(0, 300) });
          }
        });
      },
    );
    req.on('error', (e) => resolve({ status: 0, text: 'ERR ' + e.code }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, text: 'TIMEOUT' }); });
    req.write(body);
    req.end();
  });
}
