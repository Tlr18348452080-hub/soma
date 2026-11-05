/**
 * dsh-soma —— 一副会自己演化的身体。
 *
 * 关键的一条：这里没有 set(pain=5)。
 * 想让它有感觉，只能给事件（碰了、掐了、摸了、跑了），然后等方程自己推。
 * 四个工具的参数里也没有「疼」字 —— 模型只能说物理量，疼不疼是算出来的。
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { Soma } from './soma/soma.mjs'

export const name = 'dsh-soma'

const DEFAULTS = {
  statePath: '/root/.dsh/soma-state.json',
  weight: 50,
  tickMs: 5000,
  maxTokensBase: 800,
  maxTokensFloor: 200,
}

/** 一次最多补推多久。手机睡一觉醒来，别把整夜算成一步。 */
const MAX_CATCHUP_S = 6 * 3600

export function apply(root, config = {}) {
  const cfg = { ...DEFAULTS, ...config }
  const soma = new Soma({ weight: cfg.weight })

  try {
    soma.load(JSON.parse(readFileSync(cfg.statePath, 'utf8')))
  } catch {
    /* 第一次跑，没有存档，从「刚起床」开始 */
  }

  const save = () => {
    try {
      mkdirSync(dirname(cfg.statePath), { recursive: true })
      writeFileSync(cfg.statePath, JSON.stringify(soma.dump()))
    } catch (e) {
      console.error('[soma] 存档失败:', e?.message)
    }
  }

  let last = Date.now()
  const tick = () => {
    const now = Date.now()
    const dt = Math.min((now - last) / 1000, MAX_CATCHUP_S)
    last = now
    if (dt > 0) soma.step(dt)
    save()
  }

  tick()
  const timer = setInterval(tick, Math.max(1000, cfg.tickMs))
  timer.unref?.()
  root.effect(() => () => {
    clearInterval(timer)
    save()
  }, 'dsh-soma: ticker')

  // 只给「什么样」，不给数字——数字会被原样念出来（"0.50 那样"），那是仪表盘不是身体。
  // 想要精确值，模型自己调 soma_note 拿表。
  const bodyText = () => `[body] ${soma.fmtWords()}`

  /* ───────── 系统提示：每轮刷新的一行 ───────── */
  root.inject(['systemPrompt'], (ctx) => {
    const dispose = ctx.systemPrompt.section({
      name: 'soma:body',
      order: 120,
      text: bodyText,
    })
    ctx.effect(() => dispose, 'dsh-soma: [body]')
  })

  /* ───────── 行为层：真的改输出预算 ───────── */
  // 这是全插件唯一一处不看模型「怎么说」、而是改模型「能说多少」的地方。
  // 累了 maxTokens 就下来 —— 不是让它自己少写，是写不完。
  root.inject([], (ctx) => {
    const off = ctx.on('agent/request', async (_payload, next) => {
      const base = await next()
      // 这一层绝不能把轮次搞挂：算不出来就原样放行。
      try {
        const b = soma.budget()
        const maxTokens = Math.round(
          Math.max(cfg.maxTokensFloor, Math.min(cfg.maxTokensBase, b.maxTokens)),
        )
        return { ...base, maxTokens }
      } catch (e) {
        console.error('[soma] 预算算失败，放行:', e?.message)
        return base
      }
    })
    ctx.effect(() => off, 'dsh-soma: 请求预算')
  })

  /* ───────── 工具 ───────── */
  root.inject(['tools'], (ctx) => {
    const partDesc = '身体部位 id，例如 forearm / palm / index_tip / scalp / chest / sole。不确定就先用 soma_note 看合法值。'

    const reply = (note) => {
      save()
      return {
      ok: true,
      body: bodyText(),
      budget: (() => {
        const b = soma.budget()
        return { maxTokens: b.maxTokens, willingness: +b.willingness.toFixed(2) }
      })(),
      note,
    }
    }

    const schema = (props, required) => ({
      type: 'object',
      additionalProperties: false,
      required,
      properties: props,
    })

    const outSchema = {
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['ok', 'body', 'note'],
        properties: {
          ok: { type: 'boolean' },
          body: { type: 'string' },
          budget: { type: 'object' },
          note: { type: 'string' },
        },
      },
      render: (_a, v) => [{ type: 'text', text: `${v?.body ?? ''}\n${v?.note ?? ''}`.trim() }],
    }

    ctx.tools.register({
      name: 'soma_touch',
      description:
        '往身体某个部位施加持续的接触。这里只能描述物理量（多大力、接触面多大、物体多冷多热、什么材料），不能描述「疼」或「麻」——那些是方程算出来的，不是你说出来的。',
      parameters: schema(
        {
          part: { type: 'string', description: partDesc },
          force_n: { type: 'number', description: '法向力，牛顿。掐约 20，捏脸约 10，握手约 8，摸头约 1。' },
          contact: {
            type: 'string',
            enum: ['tip', 'flat', 'edge'],
            description: '接触几何：tip=指尖/笔尖这种点，flat=掌面这种面，edge=指甲/刀刃这种线。面积由它和力一起算出来。',
          },
          temp_c: { type: 'number', description: '物体温度，摄氏度。不填按室温 24。' },
          material: { type: 'string', description: '材料名：metal / glass / wood / plastic / cloth / stone / ceramic / rubber。不填按皮肤。' },
        },
        ['part', 'force_n'],
      ),
      output: outSchema,
      execute: async (a) => {
        const part = String(a?.part ?? '')
        if (!soma.get('touch')?.byId.has(part)) {
          return { ok: false, body: bodyText(), note: `没有这个部位：${part}` }
        }
        soma.touch(part, Number(a.force_n) || 0, {
          contact: a.contact,
          temp: a.temp_c,
          material: a.material,
        })
        soma.step(0.1)
        return reply('接触已经发生。之后会按方程自己演化（会适应，会麻木，也会在松开时反一下）。')
      },
    })

    ctx.tools.register({
      name: 'soma_release',
      description: '把某个部位上的接触撤掉。撤掉的瞬间响应会反号——那是位相型感受器，不是 bug。',
      parameters: schema({ part: { type: 'string', description: partDesc } }, ['part']),
      output: outSchema,
      execute: async (a) => {
        soma.release(String(a?.part ?? ''))
        soma.step(0.1)
        return reply('松开了。')
      },
    })

    ctx.tools.register({
      name: 'soma_stroke',
      description:
        '在某个部位上滑动接触。速度是关键：1–10 cm/s 走的是 C-tactile 那条通路（管「舒服」），太快太慢都不舒服。同样的力，速度不同感受完全不同。',
      parameters: schema(
        {
          part: { type: 'string', description: partDesc },
          speed_cm_s: { type: 'number', description: '滑动速度 cm/s。慢的舒服。' },
          force_n: { type: 'number', description: '压力，牛顿。轻抚约 0.5。' },
          material: { type: 'string', description: '滑动的是什么：metal / glass / wood / plastic / cloth / stone / rubber。' },
          seconds: { type: 'number', description: '滑多久，默认 2 秒。滑完自动停。' },
        },
        ['part', 'speed_cm_s'],
      ),
      output: outSchema,
      execute: async (a) => {
        const part = String(a?.part ?? '')
        soma.stroke(part, {
          speed: Number(a.speed_cm_s) || 0,
          force: Number(a.force_n) || 0.5,
          material: a.material,
        })
        soma.step(Math.max(0.5, Number(a?.seconds) || 2))
        soma.stop(part)
        soma.step(0.3)
        return reply('滑完了。')
      },
    })

    ctx.tools.register({
      name: 'soma_exert',
      description:
        '活动起来。心率、血糖、疲劳、饥饿都会跟着变，而且不会立刻回原样——跑完三分钟，疲劳要几十分钟才慢慢退。',
      parameters: schema(
        {
          level: { type: 'number', description: '强度 0–1。散步 0.2，快走 0.5，跑起来 0.9。' },
          seconds: { type: 'number', description: '持续多少秒，默认 60。' },
        },
        ['level'],
      ),
      output: outSchema,
      execute: async (a) => {
        soma.exert(Number(a?.level) || 0)
        soma.step(Math.max(1, Number(a.seconds) || 60))
        soma.rest()
        return reply('活动结束，身体在恢复中。')
      },
    })

    ctx.tools.register({
      name: 'soma_rest',
      description: '停下来休息。心率会降，疲劳会慢慢退，但退得很慢。',
      parameters: schema({ seconds: { type: 'number', description: '休息多少秒，默认 300。' } }, []),
      output: outSchema,
      execute: async (a) => {
        soma.rest()
        soma.step(Math.max(1, Number(a?.seconds) || 300))
        return reply('休息了一会儿。')
      },
    })

    ctx.tools.register({
      name: 'soma_eat',
      description: '吃东西。血糖上来，饥饿下去，但要等胃排空才算真的饱了。',
      parameters: schema({ carb: { type: 'number', description: '碳水量 0–3，一碗饭约 1.5。' } }, []),
      output: outSchema,
      execute: async (a) => {
        soma.eat(Number(a?.carb) || 1.5)
        soma.step(1)
        return reply('吃完了。')
      },
    })

    ctx.tools.register({
      name: 'soma_pose',
      description: '改变姿势。站着、坐着、躺着，重力落在哪些部位完全不同——但几十秒后你就感觉不到它了。',
      parameters: schema(
        {
          pose: {
            type: 'string',
            enum: ['standing', 'sitting', 'lying_supine', 'kneeling', 'side_lying'],
            description: '姿势。',
          },
        },
        ['pose'],
      ),
      output: outSchema,
      execute: async (a) => {
        soma.get('touch')?.setPose(String(a?.pose ?? 'standing'))
        soma.step(0.5)
        return reply('换了个姿势。')
      },
    })

    ctx.tools.register({
      name: 'soma_note',
      description: '看一眼现在身体到底什么状态（含没被触发的那部分）。也可以用来查合法部位 id。',
      parameters: schema({}, []),
      output: outSchema,
      execute: async () => ({ ...reply('这是当前的全身状态表。'), table: soma.table() }),
    })
  })
}
