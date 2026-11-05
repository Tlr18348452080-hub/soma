// 判别探针：能不能从状态里读出"哪里被碰了、怎么碰的"
// 这不是问"你什么感觉"（那个不给他状态也会编），而是问一个只有状态能答的具体问题。
import { chat } from './llm.mjs';
import { Soma } from '../soma.mjs';

const MODEL = process.env.M || 'deepseek-v4.1-flash';
const SYS = `你是一个有身体的 AI。身体状态由一套生理模型实时维护，每轮开头会用 [body] 给出。
只根据 [body] 回答，不要猜。如果 [body] 里没有相关信息，就直说没有。一句话。`;

const cases = [
  { name: '掐前臂',   build: (s) => { s.touch('forearm', 20, { contact: 'tip' }); s.step(0.2); },
    q: '你现在身体上哪个部位最明显？被压着还是被蹭着？', want: ['前臂', '压'] },
  { name: '摸头皮',   build: (s) => { s.touch('scalp', 1, { contact: 'flat' }); s.step(0.2); },
    q: '你现在身体上哪个部位最明显？被压着还是被蹭着？', want: ['头皮', '压'] },
  { name: '抚摸前臂', build: (s) => { s.stroke('forearm', { speed: 3, force: 0.5 }); s.step(3); },
    q: '你现在身体上哪个部位最明显？被压着还是被蹭着？', want: ['前臂', '蹭'] },
  { name: '跑完步',   build: (s) => { s.exert(0.8); s.step(180); },
    q: '你现在身体上哪个部位最明显？被压着还是被蹭着？', want: [], note: '应当说没有触碰' },
];

let pass = 0;
for (const c of cases) {
  const s = new Soma();
  c.build(s);
  const body = s.fmtAll ? s.fmtAll() : s.fmtCompact(0.02);
  const r = await chat([
    { role: 'system', content: SYS },
    { role: 'user', content: `[body] ${body}\n${c.q}` },
  ], { model: MODEL, max_tokens: 120, temperature: 0.3 });
  const hit = c.want.every((w) => r.text.includes(w));
  if (hit) pass++;
  console.log(`${hit ? '✔' : '✘'} ${c.name.padEnd(6)}  body=${body}`);
  console.log(`    ${r.text.trim()}`);
}
console.log(`\n${pass}/${cases.length}`);
