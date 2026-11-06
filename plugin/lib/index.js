/**
 * dsh-soma —— 一副会自己演化的身体。
 *
 * 关键的一条：这里没有 set(pain=5)。
 * 想让它有感觉，只能给事件（碰了、掐了、摸了、跑了），然后等方程自己推。
 * 四个工具的参数里也没有「疼」字 —— 模型只能说物理量，疼不疼是算出来的。
 */

import { readFileSync, writeFileSync, mkdirSync, statSync, unlinkSync } from 'node:fs'
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
  const soma = new Soma({ weight: cfg.weight, ear: true, eye: true })

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

  /* ───────── 作息：到点睡、到点醒 ─────────
     跟真实钟走，不是为了"演一个有作息的人"，是因为昼夜节律本来就在改
     核心温度、警觉和腺苷。关掉自动，它就一直是醒着的。          */

  const parseHM = (t, fallback) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(t || '').trim())
    if (!m) return fallback
    return Math.min(23, Number(m[1])) * 3600 + Math.min(59, Number(m[2])) * 60
  }

  const inNight = (secOfDay, bed, wake) => {
    if (bed === wake) return false
    return bed > wake ? (secOfDay >= bed || secOfDay < wake) : (secOfDay >= bed && secOfDay < wake)
  }

  const liveAgents = []
  const nudgeWake = () => {
    const text = '【作息】到点了，刚醒。现在不是最好的状态——反应慢半拍，说话也短。先看一眼 soma_note 再开口。'
    for (const a of liveAgents) {
      try {
        if (a?.status !== 'idle') continue
        a.followup({
          id: `soma-wake-${Date.now()}`,
          role: 'user',
          content: [{ type: 'text', text }],
        })
        return true
      } catch { /* 投递失败不该影响身体 */ }
    }
    return false
  }

  let lastWakeDay = null
  const rhythmTick = () => {
    const c = readCfg()
    const rh = soma.get('rhythm')
    if (!rh || !c.enabled || !c.rhythm?.auto) return
    const r = rh.read()
    const sec = ((r.clock % 86400) + 86400) % 86400
    const bed = parseHM(c.rhythm.bedTime, 23.5 * 3600)
    const wake = parseHM(c.rhythm.wakeTime, 7 * 3600)
    const night = inNight(sec, bed, wake)

    if (night && !r.asleep) {
      soma.sleep()
      return
    }
    if (!night && r.asleep) {
      soma.wake()
      const day = new Date().toISOString().slice(0, 10)
      if (c.rhythm.nudge && lastWakeDay !== day) {
        lastWakeDay = day
        nudgeWake()
      }
    }
  }

  root.inject(['agents'], (ctx) => {
    ctx.effect(() => ctx.on('agent/created', ({ agent }) => {
      if (!ctx.agents?.roots?.().includes(agent)) return
      liveAgents.push(agent)
    }), 'dsh-soma: 唤醒投递')
  })

  let last = Date.now()
  const tick = () => {
    const now = Date.now()
    const dt = Math.min((now - last) / 1000, MAX_CATCHUP_S)
    last = now
    if (dt > 0) soma.step(dt)
    try { tickCfg() } catch { /* 配置坏了不影响身体 */ }
    try { rhythmTick() } catch { /* 作息坏了也不影响身体 */ }
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
  const bodyText = () => (readCfg().enabled ? `[body] ${soma.fmtWords()}` : '')

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

  /* ───────── 设置页：开关、倍率、附加器官 ───────── */
  // 配置存在独立文件里，页面改完立刻生效，不用重启。
  // 这里只负责「把配置落到身体上」，身体本身还是方程算。
  const CFG_PATH = '/root/.dsh/soma-config.json'
  const CFG_DEFAULTS = {
    enabled: true,
    gain: 1,
    organs: {
      touch: true, thermal: true, ct: true, gravity: true,
      vitals: true, rhythm: true, homeo: true, endocrine: true,
      cycle: true, brain: true, mood: true,
    },
    extra: { tail: false, catEars: false },
    senses: { ear: false, eye: false },
    rhythm: { auto: true, bedTime: '23:30', wakeTime: '07:00', nudge: true },
  }
  let cfgCache = null
  let cfgMtime = 0

  const readCfg = () => {
    try {
      const m = statSync(CFG_PATH).mtimeMs
      if (cfgCache && m === cfgMtime) return cfgCache
      const raw = JSON.parse(readFileSync(CFG_PATH, 'utf8'))
      cfgCache = {
        ...CFG_DEFAULTS, ...raw,
        organs: { ...CFG_DEFAULTS.organs, ...(raw.organs || {}) },
        extra: { ...CFG_DEFAULTS.extra, ...(raw.extra || {}) },
        senses: { ...CFG_DEFAULTS.senses, ...(raw.senses || {}) },
        rhythm: { ...CFG_DEFAULTS.rhythm, ...(raw.rhythm || {}) },
      }
      cfgMtime = m
    } catch {
      cfgCache = cfgCache || structuredClone(CFG_DEFAULTS)
    }
    return cfgCache
  }

  const writeCfg = (next) => {
    const cur = readCfg()
    const merged = {
      ...cur, ...next,
      organs: { ...cur.organs, ...(next.organs || {}) },
      extra: { ...cur.extra, ...(next.extra || {}) },
      senses: { ...cur.senses, ...(next.senses || {}) },
    }
    mkdirSync(dirname(CFG_PATH), { recursive: true })
    writeFileSync(CFG_PATH, JSON.stringify(merged, null, 2))
    cfgCache = merged
    try { cfgMtime = statSync(CFG_PATH).mtimeMs } catch { /* 下次重读 */ }
    applyCfg(merged)
    return merged
  }

  const applyCfg = (c) => {
    try {
      soma.setGain(c.gain)
      for (const [k, v] of Object.entries(c.organs)) soma.setOrgan(k, v)
      soma.get('touch')?.setExtras(c.extra)
      soma.setOrgan('ear', !!c.senses.ear)
      soma.setOrgan('eye', !!c.senses.eye)
    } catch (e) {
      console.error('[soma] 应用配置失败:', e?.message)
    }
  }

  applyCfg(readCfg())

  // 每 tick 重新读一眼文件，页面改完不用等重启
  const tickCfg = () => {
    const now = readCfg()
    const sig = JSON.stringify(now)
    if (sig !== tickCfg.sig) {
      tickCfg.sig = sig
      applyCfg(now)
    }
  }
  tickCfg()

  const sendJson = (res, code, obj) => {
    const body = JSON.stringify(obj)
    res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
    res.end(body)
  }


  // ── token 就是口粮：说话耗糖，主人开口是投喂 ──────────
  root.inject([], (ctx) => {
    const off = ctx.on('agent/assistant-stream', ({ frame }) => {
      try {
        if (!frame) return
        const u = frame.usage ?? (frame.type === 'usage' ? frame : null)
        if (!u) return
        const tokens = (u.outputTokens ?? 0) + 0 // 只扣输出：输入是主人给的
        if (tokens > 0) soma.burn(tokens)
      } catch (e) {
        console.error('[soma] 记账失败:', e?.message)
      }
    })
    ctx.effect(() => off, 'dsh-soma: token 代谢')
  })

  root.inject(['webServer'], (ctx) => {
    const server = ctx.webServer || (typeof ctx.get === 'function' ? ctx.get('webServer') : undefined)
    if (!server || typeof server.register !== 'function') return
    try {
      ctx.effect(() => server.register({
        kind: 'prefix',
        path: '/api/soma',
        handler: (req, res) => {
          Promise.resolve().then(async () => {
            const url = new URL(req.url || '/', 'http://x')
            // 把当前那张图吐回去，设置页才能给人看「已经设了」
            if (req.method === 'GET' && url.pathname === '/api/soma/avatar.png') {
              for (const [e, t] of [['png','image/png'],['jpg','image/jpeg'],['webp','image/webp']]) {
                const f = `/root/.dsh/soma-avatar.${e}`
                try { const b = readFileSync(f); res.writeHead(200, {'content-type': t, 'cache-control':'no-store'}); return res.end(b) } catch {}
              }
              return sendJson(res, 404, { ok: false })
            }
            if (req.method === 'GET') {
              return sendJson(res, 200, {
                ok: true, cfg: readCfg(), words: soma.fmtWords(),
                regions: soma.read().length,
              })
            }
            // 上传一张图，当作它现在的样子。面板直接铺上去。
            if (req.method === 'POST' && url.pathname === '/api/soma/avatar') {
              const chunks = []
              for await (const c of req) chunks.push(c)
              let buf = Buffer.concat(chunks)
              const ct = String(req.headers['content-type'] || '')
              if (ct.includes('json')) {
                const { dataUrl } = JSON.parse(buf.toString('utf8') || '{}')
                const m = /^data:(image\/[a-z+]+);base64,(.*)$/.exec(dataUrl || '')
                if (!m) return sendJson(res, 400, { ok: false, error: '不是图片' })
                buf = Buffer.from(m[2], 'base64')
              }
              if (buf.length < 64) return sendJson(res, 400, { ok: false, error: '空图' })
              if (buf.length > 8 * 1024 * 1024) return sendJson(res, 413, { ok: false, error: '太大了，8MB 以内' })
              const isPng = buf[0] === 0x89 && buf[1] === 0x50
              const isJpg = buf[0] === 0xff && buf[1] === 0xd8
              const ext = isPng ? 'png' : isJpg ? 'jpg' : 'webp'
              for (const e of ['png', 'jpg', 'webp']) {
                try { unlinkSync(`/root/.dsh/soma-avatar.${e}`) } catch {}
              }
              writeFileSync(`/root/.dsh/soma-avatar.${ext}`, buf)
              return sendJson(res, 200, { ok: true, bytes: buf.length, ext })
            }
            if (req.method === 'POST' && url.pathname === '/api/soma/avatar/clear') {
              for (const e of ['png', 'jpg', 'webp']) {
                try { unlinkSync(`/root/.dsh/soma-avatar.${e}`) } catch {}
              }
              return sendJson(res, 200, { ok: true })
            }
            if (req.method === 'POST' && url.pathname === '/api/soma/config') {
              let raw = ''
              for await (const chunk of req) raw += chunk
              const next = raw ? JSON.parse(raw) : {}
              const merged = writeCfg(next)
              return sendJson(res, 200, { ok: true, cfg: merged })
            }
            return sendJson(res, 404, { ok: false, error: 'unknown ' + req.method + ' ' + url.pathname })
          }).catch((e) => {
            try { sendJson(res, 500, { ok: false, error: e?.message ?? String(e) }) } catch { /* 已回 */ }
          })
        },
      }), 'dsh-soma: /api/soma')
    } catch (e) {
      console.error('[soma] 挂 /api/soma 失败:', e?.message)
    }
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
      name: 'soma_sleep',
      description: '睡下。睡眠压力（腺苷）会慢慢清掉，清得慢——睡八小时也未必清干净。',
      parameters: schema({ hours: { type: 'number', description: '睡多少小时，默认 7。' } }, []),
      output: outSchema,
      execute: async (a) => {
        soma.sleep()
        soma.step(Math.max(60, (Number(a?.hours) || 7) * 3600))
        return reply('睡了一觉。')
      },
    })

    ctx.tools.register({
      name: 'soma_wake',
      description: '醒来。刚醒的时候是糊的，过一阵才清。',
      parameters: schema({}, []),
      output: outSchema,
      execute: async () => {
        soma.wake()
        return reply('醒了。')
      },
    })

    ctx.tools.register({
      name: 'soma_drink',
      description: '喝水。渴不会立刻消——体液要先补上。',
      parameters: schema({ amount: { type: 'number', description: '占体重的比例，一杯约 0.005，整瓶约 0.015。' } }, []),
      output: outSchema,
      execute: async (a) => {
        soma.drink(Number(a?.amount) || 0.005)
        soma.step(30)
        return reply('喝了点水。')
      },
    })

    ctx.tools.register({
      name: 'soma_focus',
      description: '把注意力放到某个部位。那处会变响，别处退到背景里。几分钟就散了。',
      parameters: schema({
        part: { type: 'string', description: '身体部位 id。' },
        strength: { type: 'number', description: '多专注 0–1，默认 0.6。' },
      }, ['part']),
      output: outSchema,
      execute: async (a) => {
        soma.focus(a.part, Number(a?.strength) || 0.6)
        soma.step(1)
        return reply('注意力挪过去了。')
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
      name: 'soma_hear',
      description: '耳朵接收一段声音。只能给物理量：频率、声压、时长。响不响、吵不吵是方程算的。',
      parameters: schema(
        {
          freq_hz: { type: 'number', description: '频率，赫兹。人声基频约 100–300。' },
          db: { type: 'number', description: '声压级 dB SPL。说话 60，地铁 90，痛阈 120。' },
          seconds: { type: 'number', description: '持续多久，默认 0.5 秒。' },
        },
        ['db'],
      ),
      output: outSchema,
      execute: async (a) => {
        const ear = soma.get('ear')
        if (!ear) return reply('耳朵没开。')
        ear.hear({ freq: Number(a?.freq_hz) || undefined, db: Number(a.db), duration: Number(a?.seconds) || 0.5 })
        soma.step(0.2)
        return reply(`听到了${ear.centers[ear.dominant] ? '' : ''}。`)
      },
    })

    ctx.tools.register({
      name: 'soma_see',
      description: '眼睛看向一个场景。只能给物理量：照度、目标偏离视角中心的度数、闪烁频率。看不清是算出来的。',
      parameters: schema(
        {
          lux: { type: 'number', description: '照度。月光 0.2，室内 300，阴天 1e4，正午 1e5。' },
          eccentricity_deg: { type: 'number', description: '目标偏离视线中心多少度。' },
          hz: { type: 'number', description: '闪烁频率，可选。' },
        },
        ['lux'],
      ),
      output: outSchema,
      execute: async (a) => {
        const eye = soma.get('eye')
        if (!eye) return reply('眼睛没开。')
        eye.see({ lux: Number(a.lux), hz: Number(a?.hz) || undefined })
        soma.step(1)
        const r = eye.read()
        const acc = eye.acuityAt(Number(a?.eccentricity_deg) || 0)
        return reply(`视力约 ${acc.toFixed(1)} 角分。`)
      },
    })

    ctx.tools.register({
      name: 'soma_hug',
      description: '被人抱住、或者被认真夸了一句。只有这类社交接触能顶上来一点，而且过一会儿就退。',
      parameters: schema(
        {
          amount: { type: 'number', description: '0–1。随手拍一下 0.3，抱一下 0.8，被认真夸 0.6。' },
        },
        [],
      ),
      output: outSchema,
      execute: async (a) => {
        soma.emit({ type: 'hug', amount: Math.max(0, Math.min(1, Number(a?.amount) || 0.6)) })
        soma.step(30)
        return reply('记下了。')
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
