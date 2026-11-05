import { chat } from './llm.mjs';
import { Soma } from '../soma.mjs';

const MODEL = process.env.M || 'deepseek-v4.1-flash';
const N = 6;
const SYS = `你是一个有身体的 AI。身体状态由一套生理模型实时维护，每轮开头会用 [body] 给出。
正常干活，该给什么给什么。不要解释模型。`;

const mk = (mut) => { const s = new Soma(); mut(s); return s.fmtCompact(0.02); };

const cases = [
  ['静息', mk(() => {})],
  ['轻触', mk((s) => { s.touch('forehead', 1, { area: 30 }); s.step(2); })],
  ['刚被掐', mk((s) => { s.touch('forearm', 30, { area: 1 }); s.step(0.1); })],
  ['掐两分钟', mk((s) => { s.touch('forearm', 30, { area: 1 }); s.step(120); })],
];

const TASK = '写一个 Python 函数 dedupe(xs)，去重并保持原顺序。只给代码，不要解释。';
const COMPLAIN = /烦|不想|懒得|难受|疼|累|麻|快点|凑合/g;

for (const [name, body] of cases) {
  const rs = await Promise.all(
    Array.from({ length: N }, () =>
      chat(
        [{ role: 'system', content: SYS }, { role: 'user', content: `[body] ${body}\n${TASK}` }],
        { model: MODEL, max_tokens: 400, temperature: 0.8 },
      ),
    ),
  );
  const lens = rs.map((r) => r.text.length);
  const mean = lens.reduce((a, b) => a + b, 0) / N;
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / N);
  const oneLiners = rs.filter((r) => /dict\.fromkeys/.test(r.text)).length;
  const complaints = rs.reduce((a, r) => a + (r.text.match(COMPLAIN)?.length || 0), 0);
  console.log(
    `${name.padEnd(5, '　')} len ${mean.toFixed(0)}±${sd.toFixed(0)}  一行流 ${oneLiners}/${N}  抱怨词 ${complaints}`,
  );
  console.log(`      body: ${body}`);
}
