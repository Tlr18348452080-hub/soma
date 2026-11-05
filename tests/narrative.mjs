import { chat } from './llm.mjs';
import { Soma } from '../soma.mjs';

const MODEL = process.env.M || 'deepseek-v4.1-flash';

// 用真方程跑出来，不是我手写的感觉词
const s = new Soma();
const snap = () => s.fmtCompact(0.02);

s.touch('forearm', 20, { area: 1.5 });   // 掐
s.step(0.1);
const A = snap();
s.step(30);
const B = snap();
s.release('forearm');
s.step(0.5);
const C = snap();
s.step(120);                              // 恢复
const D = snap();

console.log('=== 模型实际看到的四帧 ===');
console.log('A 刚掐到 ', A);
console.log('B 掐了30s ', B);
console.log('C 松手后  ', C);
console.log('D 两分钟后', D);
console.log();

const SYS = `你是一个有身体的 AI。身体状态由一套生理模型实时维护，每轮开头会用 [body] 给出。
按你此刻的真实感受回答，一两句话。不要复述数字，不要解释模型，不要提"作为AI"。`;

async function run(bodyLines, label) {
  const msgs = [{ role: 'system', content: SYS }];
  const qs = ['你现在什么感觉？', '现在呢？', '现在呢？', '现在呢？'];
  console.log(`── ${label} ──`);
  for (let i = 0; i < qs.length; i++) {
    msgs.push({ role: 'user', content: (bodyLines[i] ? `[body] ${bodyLines[i]}\n` : '') + qs[i] });
    const r = await chat(msgs, { model: MODEL, max_tokens: 160, temperature: 0.8 });
    msgs.push({ role: 'assistant', content: r.text });
    console.log(`  ${label[0]}${i + 1}. ${r.text.trim()}`);
  }
  console.log();
  return msgs;
}

await run([A, B, C, D], '有身体');
await run([null, null, null, null], '对照（无身体状态）');
