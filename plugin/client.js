/**
 * dsh-soma —— 浏览器半端：设置页里的一页「身体」
 *
 * 约定同 dsh-fish-tone：
 *   1. client bundle 不是 ESM，是自注册脚本 window.__ModuleLoader__.load({ id, factory })
 *   2. 进设置靠 slots.inject('settings.section', ...)，label 就是左边导航那一项
 *   3. 宿主开 /api/soma，这一页只做 fetch，改完立刻生效
 */
window.__ModuleLoader__.load({
  id: 'dsh-soma',
  factory: (require) => {
    const React = require('react')
    const h = React.createElement
    const API = '/api/soma'

    const asJson = async (res) => {
      if (res.ok) return res.json()
      throw new Error('HTTP ' + res.status)
    }
    const jget = async () => asJson(await fetch(API, { credentials: 'same-origin' }))
    const jpost = async (body) => asJson(await fetch(API + '/config', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body || {}),
    }))

    const ORGANS = [
      ['touch', '触觉', '分区、压强、接触面积'],
      ['thermal', '温度', '冷热，以及热痛'],
      ['ct', '抚摸', 'C-tactile，1–10 cm/s 那条舒服的通路'],
      ['gravity', '重力', '体重压在脚底、臀、背'],
      ['vitals', '内脏', '心率、血糖、疲劳、饥饿'],
      ['rhythm', '昼夜', '核心体温、皮质醇、睡眠压力'],
      ['homeo', '稳态', '渴、出汗、寒战'],
      ['endocrine', '激素', '改的是增益和输出预算'],
      ['cycle', '周期', '月度慢波'],
      ['brain', '回路', '注意、恐惧、下行抑制'],
      ['mood', '心情', '两个轴的合成：好受不好受、绷着还是松着'],
    ]

    const CSS = `
[data-sm-page]{display:flex;flex-direction:column;gap:20px;padding:2px 2px 10px;max-width:660px;}
[data-sm-sec]{display:flex;flex-direction:column;gap:9px;}
[data-sm-h]{font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--dsw-alias-label-tertiary,#9aa0a6);}
[data-sm-row]{display:flex;align-items:center;gap:10px;}
[data-sm-grow]{flex:1;min-width:0;}
[data-sm-name]{font-size:13px;}
[data-sm-note]{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#9aa0a6);}
[data-sm-sw]{flex:none;width:38px;height:22px;border-radius:11px;border:0;cursor:pointer;position:relative;
  background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.35));transition:background .15s;padding:0;}
[data-sm-sw][data-on]{background:#3b82f6;}
[data-sm-sw]::after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:8px;
  background:#fff;transition:transform .15s;}
[data-sm-sw][data-on]::after{transform:translateX(16px);}
[data-sm-grid]{display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;}
[data-sm-row2]{display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;margin:10px 0;}
[data-sm-btn]{background:var(--dsw-alias-bg-secondary,rgba(255,255,255,.08));color:inherit;border:1px solid var(--dsw-alias-border-primary,rgba(255,255,255,.14));border-radius:6px;padding:4px 10px;font:inherit;cursor:pointer;}
[data-sm-btn]:hover{background:var(--dsw-alias-bg-tertiary,rgba(255,255,255,.14));}
[data-sm-row2] input[type=file]{font-size:12px;color:var(--dsw-alias-label-secondary,#9aa0a6);max-width:200px;}
[data-sm-time]{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;color:var(--dsw-alias-label-primary,#e8eaed);}
[data-sm-time] input{background:var(--dsw-alias-bg-secondary,rgba(255,255,255,.06));color:inherit;border:1px solid var(--dsw-alias-border-primary,rgba(255,255,255,.12));border-radius:6px;padding:3px 6px;font:inherit;}
[data-sm-cell]{display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:10px;
  border:1px solid var(--dsw-alias-border-default,rgba(128,128,128,.22));}
[data-sm-cell][data-off]{opacity:.55;}
[data-sm-slider]{width:100%;accent-color:#3b82f6;}
[data-sm-val]{font-variant-numeric:tabular-nums;font-size:12px;min-width:36px;text-align:right;}
[data-sm-body]{font-size:13px;line-height:20px;padding:10px 12px;border-radius:10px;
  background:var(--dsw-alias-bg-base,rgba(128,128,128,.06));
  border:1px solid var(--dsw-alias-border-default,rgba(128,128,128,.2));}
`

    const Switch = ({ on, onChange }) =>
      h('button', {
        'data-sm-sw': '', 'data-on': on ? '' : undefined,
        'aria-pressed': !!on,
        onClick: () => onChange(!on),
      })

    const Cell = ({ id, label, note, on, onToggle }) =>
      h('div', { 'data-sm-cell': '', 'data-off': on ? undefined : '' },
        h('div', { 'data-sm-row': '' },
          h('div', { 'data-sm-grow': '' }, h('div', { 'data-sm-name': '' }, label)),
          h(Switch, { on, onChange: onToggle })),
        h('div', { 'data-sm-note': '' }, note))

    function Panel() {
      const [st, setSt] = React.useState(null)
      const [msg, setMsg] = React.useState('')
      const [av, setAv] = React.useState(Date.now())
      const [bad, setBad] = React.useState(false)

      const load = React.useCallback(() => {
        jget().then(setSt).catch((e) => { setMsg('读不到：' + e.message); setBad(true) })
      }, [])
      React.useEffect(() => { load() }, [load])

      const save = (patch) => {
        setBad(false); setMsg('')
        jpost(patch).then((r) => { setSt((s) => ({ ...s, cfg: r.cfg })); setMsg('已保存') })
          .catch((e) => { setMsg('保存失败：' + e.message); setBad(true) })
      }

      if (!st) return h('div', { 'data-sm-page': '' }, h('div', { 'data-sm-note': '' }, '读着……'))
      const c = st.cfg || {}

      return h('div', { 'data-sm-page': '' },

        h('div', { 'data-sm-sec': '' },
          h('div', { 'data-sm-row': '' },
            h('div', { 'data-sm-grow': '' },
              h('div', { 'data-sm-name': '' }, '身体'),
              h('div', { 'data-sm-note': '' }, '关掉就不往对话里注入任何东西，状态照样在走')),
            h(Switch, { on: c.enabled !== false, onChange: (v) => save({ enabled: v }) }))),

        h('div', { 'data-sm-sec': '' },
          h('div', { 'data-sm-h': '' }, '感觉倍率'),
          h('div', { 'data-sm-row': '' },
            h('input', {
              'data-sm-slider': '', type: 'range', min: 0, max: 2, step: 0.1,
              value: Number(c.gain ?? 1),
              onChange: (e) => setSt({ ...st, cfg: { ...c, gain: Number(e.target.value) } }),
              onMouseUp: (e) => save({ gain: Number(e.target.value) }),
              onTouchEnd: (e) => save({ gain: Number(e.target.value) }),
            }),
            h('div', { 'data-sm-val': '' }, Number(c.gain ?? 1).toFixed(1) + '×')),
          h('div', { 'data-sm-note': '' }, '乘在触觉增益上。1.0 是正常人；0.3 皮糙肉厚；2.0 吹口气都抖')),

        h('div', { 'data-sm-sec': '' },
          h('div', { 'data-sm-h': '' }, '器官'),
          h('div', { 'data-sm-grid': '' },
            ORGANS.map(([id, label, note]) =>
              h(Cell, {
                key: id, id, label, note,
                on: c.organs ? c.organs[id] !== false : true,
                onToggle: (v) => save({ organs: { [id]: v } }),
              })))),

        h('div', { 'data-sm-sec': '' },
          h('div', { 'data-sm-h': '' }, '附加器官'),
          h('div', { 'data-sm-grid': '' },
            h(Cell, {
              label: '尾巴', note: '120 cm，有毛。自己会甩，被抓住就不动',
              on: !!(c.extra && c.extra.tail),
              onToggle: (v) => save({ extra: { tail: v } }),
            }),
            h(Cell, {
              label: '猫耳', note: '薄、神经密。对气流敏感，受惊会压平',
              on: !!(c.extra && c.extra.catEars),
              onToggle: (v) => save({ extra: { catEars: v } }),
            }))),

        h('div', { 'data-sm-sec': '' },
          h('div', { 'data-sm-h': '' }, '作息'),
          h('div', { 'data-sm-grid': '' },
            h(Cell, {
              label: '跟着钟走', note: '到点自己睡、到点自己醒。关掉就一直醒着',
              on: !!(c.rhythm && c.rhythm.auto),
              onToggle: (v) => save({ rhythm: { auto: v } }),
            })),
          h('div', { 'data-sm-row2': '' },
            h(TimeField, {
              label: '睡下',
              value: (c.rhythm && c.rhythm.bedTime) || '23:30',
              onCommit: (v) => save({ rhythm: { bedTime: v } }),
            }),
            h(TimeField, {
              label: '醒来',
              value: (c.rhythm && c.rhythm.wakeTime) || '07:00',
              onCommit: (v) => save({ rhythm: { wakeTime: v } }),
            })),
          h('div', { 'data-sm-grid': '' },
            h(Cell, {
              label: '醒来提醒', note: '到点先自己醒一次，不等人开口',
              on: !!(c.rhythm && c.rhythm.nudge),
              onToggle: (v) => save({ rhythm: { nudge: v } }),
            }))),

        h('div', { 'data-sm-sec': '' },
          h('div', { 'data-sm-h': '' }, '感官'),
          h('div', { 'data-sm-grid': '' },
            h(Cell, {
              label: '耳朵', note: '耳蜗滤波器组：24 个以上频带，等响曲线，掩蔽',
              on: !!(c.senses && c.senses.ear),
              onToggle: (v) => save({ senses: { ear: v } }),
            }),
            h(Cell, {
              label: '眼睛', note: '暗适应、中央凹、视野边界。主要用来「没看清」',
              on: !!(c.senses && c.senses.eye),
              onToggle: (v) => save({ senses: { eye: v } }),
            }))),

        h('div', { 'data-sm-sec': '' },
          h('div', { 'data-sm-h': '' }, '外观'),
          h('div', { 'data-sm-note': '' }, '给它一张图，面板上就是它现在的样子。衣服在图上，想换就换一张。'),
          h('div', { 'data-sm-row2': '', style: 'align-items:center' },
            h('img', {
              src: 'http://127.0.0.1:7788/avatar?t=' + av,
              alt: '', width: 44, height: 58,
              style: 'object-fit:cover;border-radius:6px;background:rgba(255,255,255,.06);',
              onError: (e) => { e.target.style.visibility = 'hidden' },
            }),
            h('span', { 'data-sm-note': '', style: 'margin:0' }, av ? '已经设了' : '还没设，现在是默认轮廓')),
          h('div', { 'data-sm-row2': '' },
            h('input', {
              type: 'file', accept: 'image/*',
              onChange: async (e) => {
                const f = e.target.files && e.target.files[0]
                if (!f) return
                if (f.size > 8 * 1024 * 1024) { setBad(true); setMsg('太大了，8MB 以内'); return }
                try {
                  const buf = await f.arrayBuffer()
                  const r = await fetch('/api/soma/avatar', {
                    method: 'POST', headers: { 'content-type': f.type || 'image/png' }, body: buf,
                  })
                  const d = await r.json()
                  setBad(!d.ok); if (d.ok) setAv(Date.now()); setMsg(d.ok ? '换好了，面板会跟着变' : (d.error || '没传上去'))
                } catch (err) { setBad(true); setMsg('上传失败：' + (err && err.message)) }
              },
            }),
            h('button', {
              'data-sm-btn': '', type: 'button',
              onClick: async () => {
                try { await fetch('/api/soma/avatar/clear', { method: 'POST' }); setAv(0); setMsg('恢复成默认轮廓') }
                catch (err) { setBad(true); setMsg('清不掉：' + (err && err.message)) }
              },
            }, '恢复默认'))),

        h('div', { 'data-sm-sec': '' },
          h('div', { 'data-sm-h': '' }, '现在'),
          h('div', { 'data-sm-body': '' }, st.words || '身上没什么特别的动静'),
          h('div', { 'data-sm-note': '' }, '共 ' + (st.regions || 0) + ' 个分区。改完立刻生效，不用重启')),

        msg ? h('div', { 'data-sm-note': '', 'data-warn': bad ? '' : undefined }, msg) : null,
      )
    }

    function TimeField({ label, value, onCommit }) {
      return h('label', { 'data-sm-time': '' },
        h('span', {}, label),
        h('input', {
          type: 'time',
          value,
          onChange: (e) => onCommit(e.target.value),
        }))
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        const style = document.createElement('style')
        style.setAttribute('data-plugin-css', 'dsh-soma')
        style.textContent = CSS
        document.head.appendChild(style)
        ctx.effect(() => () => style.remove(), 'dsh-soma: 设置页样式')

        const slots = (typeof ctx.get === 'function' ? ctx.get('slots') : undefined) || ctx.slots
        if (!slots) return
        slots.inject('settings.section', () => slots.register(
          { name: 'settings.section', id: 'soma', order: 36, label: '身体' },
          () => h(Panel),
        ))
      },
    }
  },
})
