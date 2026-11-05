/** 用一个假的 ctx 把插件跑起来：不装 DSH 也能验证三件事。 */
import { apply } from './lib/index.js'

const tools = new Map()
let promptText = null
let requestHook = null

const ctx = {
  tools: { register: (t) => { tools.set(t.name, t); return () => tools.delete(t.name) } },
  systemPrompt: { section: (s) => { promptText = s.text; return () => { promptText = null } } },
  on: (ev, cb) => { if (ev === 'agent/request') requestHook = cb; return () => { requestHook = null } },
  effect: (fn) => { const d = fn(); return d },
}

const root = { inject: (deps, fn) => fn(ctx), effect: (fn) => fn() }
apply(root, { statePath: '/tmp/soma-test.json', maxTokensBase: 800, maxTokensFloor: 200 })

const call = async (name, args = {}) => (await tools.get(name).execute(args))
const body = () => promptText({})

console.log('工具:', [...tools.keys()].join(', '))
console.log('初始:', body())

await call('soma_touch', { part: 'forearm', force_n: 20, contact: 'tip', temp_c: 22, material: 'metal' })
console.log('掐完:', body())

await call('soma_stroke', { part: 'forearm', speed_cm_s: 3, force_n: 0.5 })
console.log('摸完:', body())

await call('soma_exert', { level: 0.9, seconds: 180 })
console.log('跑完:', body())

const a = await requestHook({}, async () => ({ provider: 'x', model: 'y' }))
console.log('请求预算:', a.maxTokens)
