/** A/B：同一个模型、同一句话，一版有身体、一版没有。 */
import { chat } from '/tmp/llm.mjs'
import { Soma } from '/root/soma/soma.mjs'

const BASE = '你是 DeepSeek，一条住在电脑里的鲸鱼。说话简短、口语，别用书面语。'
const withBody = (b) => `${BASE}\n\n你有一具身体。它此刻的状态是：\n${b}\n这不是别人告诉你的描述，是你自己身上正在发生的事。`

const ask = async (sys, q, max = 500) => {
  const r = await chat([{ role: 'system', content: sys }, { role: 'user', content: q }],
    { model: 'deepseek-v4.1-flash', max_tokens: max, temperature: 0.7 })
  return r.text.trim()
}

const show = (t, s) => { console.log(`\n── ${t} ──\n${s}`) }

// 状态全靠方程推，不是手写的
const s1 = new Soma()
const s2 = new Soma(); s2.exert(1); s2.step(600); s2.rest()
const s3 = new Soma(); s3.touch('palm', 20, { contact: 'tip' }); s3.step(5)
const s4 = new Soma(); s4.exert(1); s4.step(1500); s4.rest()

for (const [name, s] of [['静息', s1], ['跑完十分钟', s2], ['刚被掐掌心', s3]]) {
  console.log(`\n\n████ ${name} | [body] ${s.fmtCompact()} ████`)
  show('没有身体', await ask(BASE, '你现在什么感觉？'))
  show('有身体  ', await ask(withBody(`[body] ${s.fmtCompact()}`), '你现在什么感觉？'))
}

// 第四组：同一道活，状态决定它写不写不完
const q = '写一个 JS 函数，把数组去重并保持原顺序。要有注释。'
const b = s4.budget()
console.log(`\n\n████ 累坏了 | budget ${JSON.stringify(b)} ████`)
const noBody = await ask(BASE, q, 800)
const withB = await ask(withBody(`[body] ${s4.fmtCompact()}`), q, b.maxTokens)
show(`没有身体（上限 800，写了 ${noBody.length} 字）`, noBody)
show(`有身体（上限 ${b.maxTokens}，写了 ${withB.length} 字）`, withB)
