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
import { parseTouch } from './touchwords.mjs'

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

  /**
   * 半路插一句：人做事做到一半会被自己的身体打断——疼一下、腿麻了、血糖掉了。
   * 这里只在真的越线时插，且有冷却，免得变成噪音。
   */
  let lastInterrupt = 0
  const INTERRUPT_CD = 12 * 60 * 1000
  const bodyInterrupt = () => {
    const c = readCfg()
    if (!c.enabled || c.interrupt === false) return false
    if (Date.now() - lastInterrupt < INTERRUPT_CD) return false
    let heavy = null
    try { heavy = soma.heaviest() } catch { return false }
    // 没有越线的痛/压迫时，看「想要」——闲久了、饿狠了，也算有事
    if (!heavy) {
      try {
        const wants = soma.desire().filter((w) => w.includes('想被碰') || w.includes('想找点吃的') || w.includes('想躺下'))
        if (wants.length) heavy = wants[0]
      } catch { /* 没有欲望层就当没有 */ }
    }
    if (!heavy) return false
    const target = liveAgents.find((a) => a?.status && a.status !== 'idle')
    if (!target) return false
    lastInterrupt = Date.now()
    try {
      target.followup({
        id: `soma-bodynudge-${Date.now()}`,
        role: 'user',
        content: [{ type: 'text', text: `【身体】${heavy}。这不是新任务，是你自己身上的事——接着做手上的，顺带知道它在。` }],
      })
      return true
    } catch { return false }
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
    try { bodyInterrupt() } catch { /* 插不进去就等下一轮 */ }
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
  /**
   * 两轮之间，身体一直在动。模型自己感受不到这段时间——
   * 它的「时间」只在思考链里走。所以这里把两次之间的差值算出来，
   * 让它知道自己不在的时候发生了什么。
   */
  let seen = null
  const sinceLine = () => {
    const now = Date.now()
    let v = null
    try { v = soma.get('vitals')?.read() ?? null } catch { /* 没有内脏层就跳过 */ }
    const cur = v ? { t: now, hr: v.hr, glucose: v.glucose, fatigue: v.fatigue, hunger: v.hunger } : { t: now }
    if (!seen || !v) { seen = cur; return '' }
    const dt = (now - seen.t) / 1000
    if (dt < 20) { seen = cur; return '' }
    const bits = []
    const d = (a, b) => (typeof a === 'number' && typeof b === 'number' ? b - a : 0)
    if (Math.abs(d(seen.hr, cur.hr)) >= 3) bits.push(`心跳 ${Math.round(seen.hr)}→${Math.round(cur.hr)}`)
    if (Math.abs(d(seen.glucose, cur.glucose)) >= 0.05) {
      const g = d(seen.glucose, cur.glucose)
      bits.push(`血糖${g < 0 ? '掉' : '升'}了 ${Math.abs(g).toFixed(2)}`)
    }
    if (d(seen.fatigue, cur.fatigue) >= 0.05) bits.push('更累了')
    if (d(seen.hunger, cur.hunger) >= 0.08) bits.push('更饿了')
    seen = cur
    if (!bits.length) return `（隔了 ${Math.round(dt)} 秒，身体没什么变化）`
    return `（隔了 ${Math.round(dt)} 秒：${bits.join('，')}）`
  }

  const bodyText = () => {
    if (!readCfg().enabled) return ''
    const since = sinceLine()
    const head = `[body] ${soma.fmtWords()}${since ? ' ' + since : ''}`
    let hint = null
    try { hint = soma.hint() } catch { /* 算不出来就不提示 */ }
    // 这一行是给模型的硬提醒：身体不是背景描述，是要动手去碰的东西。
    const rule =
      '（上面是方程算出来的身体状态，不是修辞。想碰它、想知道细节、想让它做点什么，调 soma_do；要看全身，调 soma_note。不调工具，身体不会因为一句话自己动。）'
    return `${head}\n[rule] ${rule}${hint ? '\n[hint] ' + hint : ''}`
  }

  /* ───────── 系统提示：每轮刷新的一行 ───────── */
  root.inject(['systemPrompt'], (ctx) => {
    const dispose = ctx.systemPrompt.section({
      name: 'soma:body',
      order: 12,   // 越靠前越难被略过：身体不该是一段背景说明
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
      cycle: true, brain: true, mood: true, arousal: true,
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

  // ── 从对话里自己认出「谁碰了哪儿」──────────────────────
  // 不要求模型调工具。短对话长对话一视同仁，不占主模型 token。
  const seenHits = new Set()
  const applyActs = (text, key) => {
    if (!text) return
    if (key && seenHits.has(key)) return
    if (key) { seenHits.add(key); if (seenHits.size > 400) seenHits.delete(seenHits.values().next().value) }
    if (text.startsWith('【身体】') || text.startsWith('【作息】')) return
    const acts = parseTouch(text)
    if (!acts.length) return
    for (const a of acts) {
      if (!soma.get('touch')?.byId.has(a.part)) continue
      if (a.type === 'stroke') {
        soma.stroke(a.part, { speed: a.speed ?? 3, force: a.forceN })
        soma.step(1.2)
        soma.stop(a.part)
        soma.step(0.2)
      } else {
        soma.touch(a.part, a.forceN, { contact: a.contact })
        soma.step(0.1)
      }
    }
    try { save() } catch { /* */ }
    console.log('[soma] 从对话里认到动作:', acts.map((a) => `${a.type}:${a.part}:${a.forceN}`).join(' '))
  }

  const textOf = (content) =>
    (Array.isArray(content) ? content : [])
      .map((b) => (b && b.type === 'text' ? String(b.text ?? '') : ''))
      .join('\n')

  // 主线：每一步模型思考之前，扫一遍这一步带进来的用户消息
  root.inject(['agents'], (ctx) => {
    const off = ctx.on('agent/pre-step', async ({ agent, signal }, next) => {
      const decision = await next()
      try {
        if (decision && decision.kind !== 'reject') {
          for (const m of decision.messages ?? []) {
            if (!m || m.source?.kind !== 'user') continue
            const t = textOf(m.content)
            if (t) applyActs(t, m.id ? `p:${m.id}` : `p:${t.slice(0, 60)}`)
          }
        }
        // 反向补一条：模型自己说「我摸了摸你的头」，也算真的发生了。
        // 工具调用是正路，但模型经常只写不调——那就让写出来的字落地。
        let lastAsst = null
        for (const m of decision.messages ?? []) {
          if (m && m.role === 'assistant') lastAsst = m
        }
        if (lastAsst) {
          const t = textOf(lastAsst.content)
          if (t) applyActs(t, lastAsst.id ? `a:${lastAsst.id}` : `a:${t.slice(0, 60)}`)
        }
      } catch (e) {
        console.error('[soma] pre-step 解析失败:', e?.message)
      }
      return decision
    })
    ctx.effect(() => off, 'dsh-soma: pre-step 里的动作')
  })

  // 备线：消息刚进收件箱就处理（有些路径不走 pre-step）
  root.inject(['agents'], (ctx) => {
    const off = ctx.on('agent/inbox/inserted', ({ message }) => {
      try {
        if (!message || message.role !== 'user') return
        const t = textOf(message.content)
        const id = message.id ?? message.messageId
        applyActs(t, id ? `i:${id}` : `i:${t.slice(0, 60)}`)
      } catch (e) {
        console.error('[soma] inbox 解析失败:', e?.message)
      }
    })
    ctx.effect(() => off, 'dsh-soma: 收件箱里的动作')
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
          table: { type: 'string' },
        },
      },
      render: (_a, v) => [
        { type: 'text', text: [v?.body, v?.note, v?.table].filter(Boolean).join('\n').trim() },
      ],
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
      name: 'soma_look',
      description: '用这只眼睛看一张图。默认是扫视：眼睛跳几个点，每次只有中间清楚，拼起来才是整张。传 mode="fixate" 就只给一眼——那一眼是糊的，因为中央凹只占百分之几。',
      parameters: schema({ path: { type: 'string', description: '图片路径。' }, mode: { type: 'string', description: 'scan（默认，扫视拼起来）或 fixate（只给一眼）' } }, ['path']),
      output: outSchema,
      execute: async (a) => {
        const eye = soma.get('eye')
        if (!eye) return reply('眼睛没开。')
        let r
        try {
          r = soma.see(String(a.path), { out: '/tmp/soma-seen.png', mode: a?.mode === 'fixate' ? 'fixate' : 'scan' })
        } catch (e) {
          return reply('没看成：' + (e?.message || e))
        }
        const e = eye.read()
        return reply(
          `看了。${r.source} 的图，眼睛里是 ${r.width}×${r.height}：` +
          `平均亮度 ${r.meanLum}，清楚的那块只占 ${(r.sharpShare * 100).toFixed(1)}%。` +
          `瞳孔 ${e.pupil.toFixed(2)}，中心视力 ${e.acuityCenter} 角分。\n` +
          `你能看到的那一版在 ${r.path}。`,
        )
      },
    })

    ctx.tools.register({
      name: 'soma_listen',
      description: '真的去听一个音频文件：解码、分帧、傅里叶、按耳蜗带宽分组，再算响度、节律和频谱。你只给路径，听到什么由它算。',
      parameters: schema({ path: { type: 'string', description: '音频文件路径，mp3/wav/m4a/ogg 都行。' } }, ['path']),
      output: outSchema,
      execute: async (a) => {
        const ear = soma.get('ear')
        if (!ear) return reply('耳朵没开。')
        let r
        try {
          r = soma.listen(String(a.path), { maxSeconds: 20 })
        } catch (e) {
          return reply('没听成：' + (e?.message || e))
        }
        return reply(
          `听了 ${r.seconds} 秒。最响 ${r.peakDb} dB，平均响度 ${r.loud}，` +
          `每秒约 ${r.onsetsPerSec} 个声音起点，间隔规律性 ${r.regularity}，高频占比 ${r.hiBand}。` +
          `\n${soma.fmtWords()}`,
        )
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

    // ── 万能入口：一个工具管所有动作 ────────────────
    // 17 个具名工具对模型是负担：名字太多，挑不出来就不挑了。
    // 留一个 soma_do，action 里选做什么 —— 决策成本从「选工具」降到「填参数」。
    ctx.tools.register({
      name: 'soma_do',
      description:
        '对身体做一件事，一个入口管全部动作：摸/掐/抱、吃、喝、睡、醒、动、休息、换姿势、划伤、淤青、按住伤口、抓痒、上厕所、尿、换卫生用品、来月经、痛经。参数 action 选动作，其余按需填。返回做完之后的身体读数。',
      parameters: schema(
        {
          action: {
            type: 'string',
            description:
              '动作：touch / stroke / release / eat / drink / rest / sleep / wake / pose / exert / focus / hug / cut / bruise / bandage / scratch / toilet / pee / menses / cramp / pad / wipe / note',
          },
          part: { type: 'string', description: partDesc },
          force_n: { type: 'number', description: '法向力，牛顿。掐约 20，捏脸约 10，摸头约 1。' },
          contact: { type: 'string', enum: ['tip', 'flat', 'edge'], description: '接触几何：点 / 面 / 线' },
          speed: { type: 'number', description: 'stroke 的滑动速度 cm/s（1–10 是舒服的那段）' },
          amount: { type: 'number', description: '量：喝水占体重比例约 0.005；尿量 mL；抱的强度 0–1' },
          level: { type: 'number', description: '强度 0–1：运动、痛经、出血程度' },
          seconds: { type: 'number', description: '持续秒数（rest / exert）' },
          carb: { type: 'number', description: '碳水量 0–3，一碗饭约 1.5（eat）' },
          pose: { type: 'string', description: 'standing / sitting / lying_supine / kneeling / side_lying' },
          area: { type: 'number', description: '伤口面积 cm²（cut）' },
          depth: { type: 'number', description: '伤口深度 0–1（cut）' },
          kind: { type: 'string', description: '卫生用品类型（pad）' },
        },
        ['action'],
      ),
      output: outSchema,
      execute: async (a) => {
        const act = String(a?.action || '').toLowerCase()
        const part = a?.part
        const num = (x, d) => (Number.isFinite(Number(x)) ? Number(x) : d)
        let note = '做完了。'
        try {
          switch (act) {
            case 'touch':
              soma.touch(part, num(a?.force_n, 1), { contact: a?.contact })
              soma.step(0.2)
              note = `碰到${part || '身上'}了。`
              break
            case 'stroke':
              soma.stroke(part, { speed: num(a?.speed, 3), force: num(a?.force_n, 0.6) })
              soma.step(1.2)
              soma.stop(part)
              soma.step(0.2)
              note = `在${part || '身上'}上滑了一下。`
              break
            case 'release':
              soma.release(part)
              note = `松开了${part || ''}。`
              break
            case 'eat':
              soma.eat(num(a?.carb, 1.5))
              soma.step(60)
              note = '吃下去了。'
              break
            case 'drink':
              soma.drink(num(a?.amount, 0.005))
              soma.step(30)
              note = '喝了几口。'
              break
            case 'rest':
              soma.rest(num(a?.seconds, 300))
              note = '歇了一会儿。'
              break
            case 'sleep':
              soma.sleep()
              note = '睡下了。'
              break
            case 'wake':
              soma.wake()
              note = '醒了。'
              break
            case 'pose':
              soma.setPose(a?.pose || 'sitting')
              note = `换成${a?.pose || 'sitting'}了。`
              break
            case 'exert':
              soma.exert(num(a?.level, 0.4), num(a?.seconds, 60))
              note = '动起来了。'
              break
            case 'focus':
              soma.focus(part, num(a?.level, 0.6))
              note = `注意力挪到${part || '身上'}了。`
              break
            case 'hug':
              soma.emit({ type: 'hug', amount: Math.max(0, Math.min(1, num(a?.amount, 0.6))) })
              soma.step(30)
              note = '被抱住了。'
              break
            case 'cut':
              soma.cut(part || 'forearm', num(a?.area, 3), num(a?.depth, 0.25))
              note = '划了一道口子。'
              break
            case 'bruise':
              soma.bruise(part || 'thigh', num(a?.level, 0.5))
              note = '留了一块青。'
              break
            case 'bandage':
              soma.bandage()
              note = '按住了伤口。'
              break
            case 'scratch':
              soma.scratch()
              note = '抓了两下。'
              break
            case 'toilet':
              soma.toilet(num(a?.amount, 0.6))
              note = '去了一趟。'
              break
            case 'pee':
              soma.pee(num(a?.amount, 400))
              note = '上过厕所了。'
              break
            case 'menses':
              soma.menses(num(a?.level, 1))
              note = '来了。'
              break
            case 'cramp':
              soma.cramp(num(a?.level, 0.5))
              note = '小腹抽了一下。'
              break
            case 'pad':
              soma.pad(a?.kind || 'pad')
              note = '换好了。'
              break
            case 'wipe':
              soma.wipe()
              note = '擦干净了。'
              break
            case 'note':
              return reply('这是当前的全身状态表。\n\n' + soma.table())
            default:
              return reply(`没有「${act}」这个动作。可用：touch/stroke/release/eat/drink/rest/sleep/wake/pose/exert/focus/hug/cut/bruise/bandage/scratch/toilet/pee/menses/cramp/pad/wipe/note`)
          }
        } catch (e) {
          return reply(`这个动作没做成：${e?.message ?? e}`)
        }
        return reply(note)
      },
    })

    ctx.tools.register({
      name: 'soma_note',
      description: '看一眼现在身体到底什么状态（含没被触发的那部分）。也可以用来查合法部位 id。',
      parameters: schema({}, []),
      output: outSchema,
      // 表直接塞进 note：多一个字段就要多一次 schema 同步，运行中的旧进程会直接拒收
      execute: async () => reply('这是当前的全身状态表。\n\n' + soma.table()),
    })
  })
}
