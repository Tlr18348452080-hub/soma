/**
 * dsh-soma —— 浏览器半端：设置页里的一页「身体」
 *
 * 约定同 dsh-fish-tone：
 *   1. client bundle 不是 ESM，是自注册脚本 window.__ModuleLoader__.load({ id, factory })
 *   2. 进设置靠 slots.inject('settings.section', ...)，label 就是左边导航那一项
 *   3. 宿主开 /api/soma，这一页只做 fetch，改完立刻生效
 *
 * 样式只用宿主自己那套 token（--dsw-alias-* / --dsw-radius-*），不写死颜色，
 * 浅色深色跟着主题走。所有规则都挂在 [data-sm-*] 上，不会漏到别人的面板里。
 */
window.__ModuleLoader__.load({
  id: 'dsh-soma',
  factory: (require) => {
    const React = require('react')
    const h = React.createElement
    const API = '/api/soma'

    const asJson = async (res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status)
      return res.json()
    }
    const jget = (ctl) => fetch(API, {
      credentials: 'same-origin',
      cache: 'no-store',
      signal: ctl ? ctl.signal : undefined,
    }).then(asJson)
    const jpost = (body) => fetch(API + '/config', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body || {}),
    }).then(asJson)

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
[data-sm-page]{
  --sm-fill:var(--dsw-alias-settings-card-fill,var(--dsw-alias-bg-layer-2,rgba(127,127,127,.06)));
  --sm-stroke:var(--dsw-alias-settings-card-stroke,var(--dsw-alias-border-l4,rgba(127,127,127,.18)));
  --sm-hair:var(--dsw-alias-border-l1,rgba(127,127,127,.12));
  --sm-text:var(--dsw-alias-label-primary,inherit);
  --sm-dim:var(--dsw-alias-label-tertiary,rgba(127,127,127,.95));
  --sm-faint:var(--dsw-alias-label-caption,rgba(127,127,127,.8));
  box-sizing:border-box;display:flex;flex-direction:column;gap:26px;
  max-width:640px;padding:2px 0 14px;
  color:var(--sm-text);font-size:14px;line-height:22px;
  -webkit-font-smoothing:antialiased;
}
[data-sm-page] *{box-sizing:border-box}

/* 页头 */
[data-sm-head]{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:2px 2px 0}
[data-sm-headtext]{min-width:0;flex:1}
[data-sm-title]{margin:0;font-size:20px;line-height:28px;font-weight:600;letter-spacing:-.01em;color:var(--sm-text)}
[data-sm-sub]{margin-top:6px;font-size:12.5px;line-height:19px;color:var(--sm-dim);max-width:46ch}

/* 分区 */
[data-sm-sec]{display:flex;flex-direction:column;gap:10px}
[data-sm-sech]{display:flex;align-items:baseline;gap:10px;padding:0 4px}
[data-sm-sech-t]{font-size:12px;line-height:18px;font-weight:600;letter-spacing:.07em;color:var(--sm-dim)}
[data-sm-sech-h]{font-size:11.5px;line-height:18px;color:var(--sm-faint);margin-left:auto;font-variant-numeric:tabular-nums}

/* 卡片与行 */
[data-sm-card]{background:var(--sm-fill);border:1px solid var(--sm-stroke);border-radius:var(--dsw-radius-lg,16px);overflow:hidden}
[data-sm-card]+[data-sm-card]{margin-top:10px}
[data-sm-row]{display:flex;align-items:center;gap:14px;min-height:56px;padding:11px 16px}
[data-sm-row]+[data-sm-row],[data-sm-row]+[data-sm-gain],[data-sm-gain]+[data-sm-row]{border-top:1px solid var(--sm-hair)}
[data-sm-meta]{flex:1;min-width:0}
[data-sm-name]{font-size:14px;line-height:21px;font-weight:500;color:var(--sm-text)}
[data-sm-note]{margin-top:2px;font-size:12px;line-height:18px;color:var(--sm-dim)}
[data-sm-row][data-off] [data-sm-name]{opacity:.55}
[data-sm-row][data-off] [data-sm-note]{opacity:.55}
[data-sm-ctl]{flex:none;display:flex;align-items:center;gap:10px}
[data-sm-acts]{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px}

/* 开关 */
[data-sm-sw]{position:relative;flex:none;width:44px;height:26px;padding:0;border:0;border-radius:13px;
  background:var(--dsw-alias-border-l3,rgba(127,127,127,.34));cursor:pointer;
  transition:background .18s ease;-webkit-tap-highlight-color:transparent}
[data-sm-sw][data-on]{background:var(--dsw-alias-brand-primary,#111)}
[data-sm-sw]:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#111);outline-offset:2px}
[data-sm-knob]{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;
  background:var(--dsw-alias-switch-thumb,#fff);box-shadow:0 1px 2px rgba(0,0,0,.28);
  transition:transform .18s cubic-bezier(.34,.9,.3,1)}
[data-sm-sw][data-on] [data-sm-knob]{transform:translateX(18px)}

/* 倍率 */
[data-sm-gain]{display:flex;flex-direction:column;gap:10px;padding:14px 16px 15px}
[data-sm-gain-h]{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
[data-sm-val]{font-size:13px;line-height:20px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--sm-text)}
input[data-sm-range]{-webkit-appearance:none;appearance:none;width:100%;height:20px;margin:0;
  background:transparent;cursor:pointer}
input[data-sm-range]::-webkit-slider-runnable-track{height:4px;border-radius:2px;
  background:var(--dsw-alias-border-l3,rgba(127,127,127,.28))}
input[data-sm-range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;margin-top:-6px;
  border:0;border-radius:50%;background:var(--dsw-alias-brand-primary,#111);
  box-shadow:0 1px 3px rgba(0,0,0,.3)}
input[data-sm-range]::-moz-range-track{height:4px;border-radius:2px;
  background:var(--dsw-alias-border-l3,rgba(127,127,127,.28))}
input[data-sm-range]::-moz-range-thumb{width:16px;height:16px;border:0;border-radius:50%;
  background:var(--dsw-alias-brand-primary,#111)}

/* 时间 */
[data-sm-time]{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--sm-dim)}
[data-sm-time] input{font:inherit;font-size:13px;line-height:18px;color:var(--sm-text);padding:5px 9px;
  background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,.08));
  border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.2));border-radius:var(--dsw-radius-sm,8px)}
[data-sm-time] input::-webkit-calendar-picker-indicator{opacity:.45;cursor:pointer}

/* 按钮 */
[data-sm-btn]{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:30px;
  padding:0 12px;border-radius:var(--dsw-radius-sm,8px);cursor:pointer;white-space:nowrap;
  font:inherit;font-size:12.5px;line-height:18px;text-decoration:none;
  color:var(--sm-text);background:transparent;
  border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.2));
  transition:background .15s ease,-webkit-tap-highlight-color .15s}
[data-sm-btn]:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.1))}
[data-sm-btn][data-primary]{background:var(--dsw-alias-button-primary-fill,#111);
  border-color:transparent;color:var(--dsw-alias-label-primary-inverted,#fff)}
[data-sm-btn][data-primary]:hover{background:var(--dsw-alias-button-primary-hover,#000)}
[data-sm-file]{position:relative;overflow:hidden}
[data-sm-file] input{position:absolute;inset:0;width:100%;height:100%;opacity:0;font-size:0;cursor:pointer}

/* 外观 */
[data-sm-av]{display:flex;align-items:center;gap:14px;padding:14px 16px}
[data-sm-av-img]{flex:none;width:52px;height:68px;object-fit:cover;border-radius:12px;
  background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,.08));
  border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.2))}
[data-sm-av-txt]{flex:1;min-width:0}

/* 现在 */
[data-sm-words]{position:relative;padding:14px 16px 14px 18px;font-size:13.5px;line-height:22px;color:var(--dsw-alias-label-secondary,var(--sm-text))}
[data-sm-words]::before{content:'';position:absolute;left:0;top:14px;bottom:14px;width:2px;border-radius:1px;
  background:var(--dsw-alias-brand-primary,#111);opacity:.35}

/* 提示条 */
[data-sm-toast]{display:flex;align-items:center;gap:8px;padding:9px 13px;
  border-radius:var(--dsw-radius-md,10px);font-size:12.5px;line-height:18px;
  background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,.08));
  border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.2));
  color:var(--dsw-alias-label-secondary,var(--sm-text))}
[data-sm-toast][data-bad]{border-color:var(--dsw-alias-state-error-secondary,rgba(200,70,70,.45));
  color:var(--dsw-alias-state-error-primary,#c0392b)}

/* 读入中 */
[data-sm-load]{display:flex;flex-direction:column;align-items:center;gap:14px;padding:64px 0 68px;
  font-size:12.5px;color:var(--sm-dim)}
[data-sm-spin]{width:18px;height:18px;border-radius:50%;
  border:2px solid var(--dsw-alias-border-l3,rgba(127,127,127,.3));
  border-top-color:var(--dsw-alias-label-secondary,#888);animation:sm-spin .72s linear infinite}
@keyframes sm-spin{to{transform:rotate(360deg)}}

/* 读不到 */
[data-sm-err]{display:flex;flex-direction:column;gap:10px;padding:16px}
[data-sm-err-t]{font-size:13.5px;line-height:20px;font-weight:500;
  color:var(--dsw-alias-state-error-primary,#c0392b)}
[data-sm-err-m]{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;line-height:17px;
  color:var(--sm-dim);word-break:break-all}

/* 页脚 */
[data-sm-foot]{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:0 4px;
  font-size:11.5px;line-height:17px;color:var(--sm-faint)}
[data-sm-foot] [data-sm-sep]{opacity:.5}

/* 全身面板：全屏浮层（点得进来，也点得出去） */
[data-sm-modal]{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;
  background:var(--dsw-alias-bg-base,#0b0f18);animation:sm-fade .16s ease}
[data-sm-modal-bar]{display:flex;align-items:center;gap:10px;flex:0 0 auto;
  padding:11px 14px;border-bottom:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.22));
  background:var(--dsw-alias-bg-layer-1,transparent)}
[data-sm-modal-t]{font-size:13px;font-weight:600;line-height:18px;letter-spacing:.01em;
  color:var(--dsw-alias-label-primary,var(--sm-text))}
[data-sm-modal-hint]{font-size:11.5px;line-height:16px;color:var(--sm-faint)}
[data-sm-modal-x]{margin-left:auto;height:28px;padding:0 12px;border:0;cursor:pointer;
  border-radius:var(--dsw-radius-sm,8px);font:inherit;font-size:12.5px;
  color:var(--dsw-alias-label-secondary,var(--sm-dim));
  background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}
[data-sm-modal-x]:hover{color:var(--dsw-alias-label-primary,var(--sm-text))}
[data-sm-modal-x]:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#888);outline-offset:2px}
[data-sm-modal-frame]{flex:1 1 auto;width:100%;border:0;display:block;background:transparent}
@keyframes sm-fade{from{opacity:0}to{opacity:1}}

@media (prefers-reduced-motion:reduce){
  [data-sm-sw],[data-sm-knob],[data-sm-btn]{transition:none}
  [data-sm-spin]{animation:none}
  [data-sm-modal]{animation:none}
}
`

    /* ——— 全屏浮层：点得进来，也点得出去 ——— */
    const MODAL_ID = 'dsh-soma-sheet'
    let escHandler = null

    function closeSheet() {
      const el = document.getElementById(MODAL_ID)
      if (el) el.remove()
      if (escHandler) { document.removeEventListener('keydown', escHandler); escHandler = null }
      document.documentElement.style.removeProperty('overflow')
    }

    function openSheet(title, url, hint) {
      closeSheet()
      const root = document.createElement('div')
      root.id = MODAL_ID
      root.setAttribute('data-sm-modal', '')
      root.setAttribute('role', 'dialog')
      root.setAttribute('aria-label', title)
      /* 关键定位写成内联样式：不依赖 <style> 有没有加载、有没有被裁掉 */
      root.style.cssText = 'position:fixed;top:0;right:0;bottom:0;left:0;z-index:2147483000;'
        + 'display:flex;flex-direction:column;background:var(--dsw-alias-bg-base,#0b0f18)'

      const bar = document.createElement('div')
      bar.setAttribute('data-sm-modal-bar', '')
      bar.style.cssText = 'display:flex;align-items:center;gap:10px;flex:0 0 auto;padding:11px 14px;'
        + 'border-bottom:1px solid rgba(127,127,127,.24);background:var(--dsw-alias-bg-layer-1,transparent)'
      const t = document.createElement('div')
      t.setAttribute('data-sm-modal-t', '')
      t.textContent = title
      t.style.cssText = 'font-size:13px;font-weight:600;line-height:18px'
      const hh = document.createElement('div')
      hh.setAttribute('data-sm-modal-hint', '')
      hh.textContent = hint || ''
      hh.style.cssText = 'font-size:11.5px;line-height:16px;opacity:.6'
      const x = document.createElement('button')
      x.setAttribute('data-sm-modal-x', '')
      x.type = 'button'
      x.textContent = '关闭'
      x.style.cssText = 'margin-left:auto;height:30px;padding:0 14px;border:0;cursor:pointer;'
        + 'border-radius:8px;font:inherit;font-size:12.5px;color:inherit;background:rgba(127,127,127,.16)'
      x.addEventListener('click', closeSheet)
      bar.appendChild(t)
      if (hint) bar.appendChild(hh)
      bar.appendChild(x)

      const fr = document.createElement('iframe')
      fr.setAttribute('data-sm-modal-frame', '')
      fr.setAttribute('title', title)
      fr.style.cssText = 'flex:1 1 auto;width:100%;border:0;display:block;background:transparent'
      fr.src = url

      root.appendChild(bar)
      root.appendChild(fr)
      document.body.appendChild(root)
      document.documentElement.style.setProperty('overflow', 'hidden')

      escHandler = (e) => { if (e.key === 'Escape') closeSheet() }
      document.addEventListener('keydown', escHandler)
    }

    const Switch = ({ on, onChange, label }) => h('button', {
      'data-sm-sw': '',
      'data-on': on ? '' : undefined,
      type: 'button',
      role: 'switch',
      'aria-checked': !!on,
      'aria-label': label || undefined,
      onClick: () => onChange(!on),
    }, h('span', { 'data-sm-knob': '' }))

    const Row = ({ title, note, off, children }) => h('div', {
      'data-sm-row': '',
      'data-off': off ? '' : undefined,
    },
      h('div', { 'data-sm-meta': '' },
        h('div', { 'data-sm-name': '' }, title),
        note ? h('div', { 'data-sm-note': '' }, note) : null),
      children ? h('div', { 'data-sm-ctl': '' }, children) : null)

    const Sec = ({ title, hint, children }) => h('section', { 'data-sm-sec': '' },
      h('div', { 'data-sm-sech': '' },
        h('span', { 'data-sm-sech-t': '' }, title),
        hint ? h('span', { 'data-sm-sech-h': '' }, hint) : null),
      children)

    // 渲染期抛错不该让整页变白：把错误本身显示出来，至少知道坏在哪。
    class Boundary extends React.Component {
      constructor(props) { super(props); this.state = { err: null } }
      static getDerivedStateFromError(err) { return { err } }
      render() {
        const e = this.state.err
        if (!e) return this.props.children
        return h('div', { 'data-sm-page': '' },
          h('div', { 'data-sm-card': '', 'data-sm-err': '' },
            h('div', { 'data-sm-err-t': '' }, '这一页崩了：' + ((e && e.message) || String(e))),
            h('div', { 'data-sm-err-m': '' }, String((e && e.stack) || '').slice(0, 600))))
      }
    }

    function Panel() {
      const [st, setSt] = React.useState(null)
      const [msg, setMsg] = React.useState('')
      const [bad, setBad] = React.useState(false)
      const [av, setAv] = React.useState(0)
      const [has, setHas] = React.useState(null)
      const [tries, setTries] = React.useState(0)

      React.useEffect(() => {
        const ctl = typeof AbortController === 'function' ? new AbortController() : null
        const timer = ctl ? setTimeout(() => ctl.abort(), 12000) : null
        let alive = true
        jget(ctl).then((d) => {
          if (!alive) return
          if (timer) clearTimeout(timer)
          setSt(d); setBad(false); setMsg('')
        }).catch((e) => {
          if (!alive) return
          if (timer) clearTimeout(timer)
          const m = e && e.name === 'AbortError' ? '12 秒没回话' : ((e && e.message) || String(e))
          setBad(true); setMsg('读不到 ' + API + '：' + m)
        })
        return () => { alive = false; if (timer) clearTimeout(timer); if (ctl) ctl.abort() }
      }, [tries])

      const notify = (text, isBad) => {
        setMsg(text); setBad(!!isBad)
        if (!isBad) setTimeout(() => setMsg((m) => (m === text ? '' : m)), 2400)
      }

      const save = (patch) => {
        jpost(patch)
          .then((r) => { setSt((s) => ({ ...s, cfg: r.cfg })); notify('已保存') })
          .catch((e) => notify('保存失败：' + ((e && e.message) || e), true))
      }

      const upload = async (e) => {
        const f = e.target.files && e.target.files[0]
        if (!f) return
        if (f.size > 8 * 1024 * 1024) { notify('太大了，8MB 以内', true); e.target.value = ''; return }
        try {
          const buf = await f.arrayBuffer()
          const r = await fetch(API + '/avatar', {
            method: 'POST',
            headers: { 'content-type': f.type || 'image/png' },
            body: buf,
          })
          const d = await r.json()
          if (d.ok) { setAv(Date.now()); setHas(true); notify('换好了，面板会跟着变') }
          else notify(d.error || '没传上去', true)
        } catch (err) {
          notify('上传失败：' + ((err && err.message) || err), true)
        }
        e.target.value = ''
      }

      const clearAvatar = async () => {
        try {
          await fetch(API + '/avatar/clear', { method: 'POST' })
          setAv(Date.now()); setHas(false); notify('恢复成默认轮廓')
        } catch (err) {
          notify('清不掉：' + ((err && err.message) || err), true)
        }
      }

      const head = h('div', { 'data-sm-head': '' },
        h('div', { 'data-sm-headtext': '' },
          h('h1', { 'data-sm-title': '' }, '身体'),
          h('div', { 'data-sm-sub': '' }, '关掉就不往对话里注入任何东西，状态照样在后台走。')))

      if (!st) {
        return h('div', { 'data-sm-page': '' },
          head,
          msg
            ? h('div', { 'data-sm-card': '', 'data-sm-err': '' },
                h('div', { 'data-sm-err-t': '' }, '没读到身体状态'),
                h('div', { 'data-sm-err-m': '' }, msg),
                h('div', { 'data-sm-acts': '' },
                  h('button', {
                    'data-sm-btn': '', 'data-primary': '', type: 'button',
                    onClick: () => { setMsg(''); setTries((n) => n + 1) },
                  }, '重试'),
                  h('a', { 'data-sm-btn': '', href: API, target: '_blank', rel: 'noopener' }, '直接看接口')))
            : h('div', { 'data-sm-load': '' },
                h('div', { 'data-sm-spin': '' }),
                h('div', {}, '正在读身体')))
      }

      const c = st.cfg || {}
      const organs = c.organs || {}
      const isOn = (k) => organs[k] !== false

      return h('div', { 'data-sm-page': '' },
        h('div', { 'data-sm-head': '' },
          h('div', { 'data-sm-headtext': '' },
            h('h1', { 'data-sm-title': '' }, '身体'),
            h('div', { 'data-sm-sub': '' }, '关掉就不往对话里注入任何东西，状态照样在后台走。')),
          h(Switch, {
            on: c.enabled !== false, label: '身体',
            onChange: (v) => save({ enabled: v }),
          })),

        msg ? h('div', { 'data-sm-toast': '', 'data-bad': bad ? '' : undefined }, msg) : null,

        h(Sec, { title: '感觉倍率' },
          h('div', { 'data-sm-card': '' },
            h('div', { 'data-sm-gain': '' },
              h('div', { 'data-sm-gain-h': '' },
                h('span', { 'data-sm-name': '' }, '触觉增益'),
                h('span', { 'data-sm-val': '' }, Number(c.gain ?? 1).toFixed(1) + '×')),
              h('input', {
                'data-sm-range': '', type: 'range', min: 0, max: 2, step: 0.1,
                value: Number(c.gain ?? 1),
                onChange: (e) => setSt({ ...st, cfg: { ...c, gain: Number(e.target.value) } }),
                onMouseUp: (e) => save({ gain: Number(e.target.value) }),
                onTouchEnd: (e) => save({ gain: Number(e.target.value) }),
              }),
              h('div', { 'data-sm-note': '' }, '1.0 是正常人。0.3 皮糙肉厚，2.0 吹口气都抖。')))),

        h(Sec, { title: '器官', hint: ORGANS.length + ' 项' },
          h('div', { 'data-sm-card': '' },
            ORGANS.map(([id, label, note]) => h(Row, {
              key: id, title: label, note, off: !isOn(id),
            }, h(Switch, {
              on: isOn(id), label,
              onChange: (v) => save({ organs: { [id]: v } }),
            }))))),

        h(Sec, { title: '附加器官' },
          h('div', { 'data-sm-card': '' },
            h(Row, {
              title: '尾巴', note: '120 cm，有毛。自己会甩，被抓住就不动',
              off: !(c.extra && c.extra.tail),
            }, h(Switch, {
              on: !!(c.extra && c.extra.tail), label: '尾巴',
              onChange: (v) => save({ extra: { tail: v } }),
            })),
            h(Row, {
              title: '猫耳', note: '薄、神经密。对气流敏感，受惊会压平',
              off: !(c.extra && c.extra.catEars),
            }, h(Switch, {
              on: !!(c.extra && c.extra.catEars), label: '猫耳',
              onChange: (v) => save({ extra: { catEars: v } }),
            })))),

        h(Sec, { title: '作息' },
          h('div', { 'data-sm-card': '' },
            h(Row, {
              title: '跟着钟走', note: '到点自己睡、到点自己醒。关掉就一直醒着',
              off: !(c.rhythm && c.rhythm.auto),
            }, h(Switch, {
              on: !!(c.rhythm && c.rhythm.auto), label: '跟着钟走',
              onChange: (v) => save({ rhythm: { auto: v } }),
            })),
            h(Row, { title: '睡下', note: '不用等到点，先躺下也算' },
              h(TimeField, {
                label: '睡下',
                value: (c.rhythm && c.rhythm.bedTime) || '23:30',
                onCommit: (v) => save({ rhythm: { bedTime: v } }),
              })),
            h(Row, { title: '醒来', note: '睡眠压力、生物钟一起算出来的时刻' },
              h(TimeField, {
                label: '醒来',
                value: (c.rhythm && c.rhythm.wakeTime) || '07:00',
                onCommit: (v) => save({ rhythm: { wakeTime: v } }),
              })),
            h(Row, {
              title: '醒来提醒', note: '到点先自己醒一次，不等人开口',
              off: !(c.rhythm && c.rhythm.nudge),
            }, h(Switch, {
              on: !!(c.rhythm && c.rhythm.nudge), label: '醒来提醒',
              onChange: (v) => save({ rhythm: { nudge: v } }),
            })))),

        h(Sec, { title: '感官' },
          h('div', { 'data-sm-card': '' },
            h(Row, {
              title: '耳朵', note: '耳蜗滤波器组：24 个以上频带，等响曲线，掩蔽',
              off: !(c.senses && c.senses.ear),
            }, h(Switch, {
              on: !!(c.senses && c.senses.ear), label: '耳朵',
              onChange: (v) => save({ senses: { ear: v } }),
            })),
            h(Row, {
              title: '眼睛', note: '暗适应、中央凹、视野边界。主要用来「没看清」',
              off: !(c.senses && c.senses.eye),
            }, h(Switch, {
              on: !!(c.senses && c.senses.eye), label: '眼睛',
              onChange: (v) => save({ senses: { eye: v } }),
            })))),

        h(Sec, { title: '外观' },
          h('div', { 'data-sm-card': '' },
            h('div', { 'data-sm-av': '' },
              h('img', {
                'data-sm-av-img': '',
                src: API + '/avatar.png?t=' + av,
                alt: '',
                onLoad: (e) => { e.target.style.visibility = 'visible'; setHas(true) },
                onError: (e) => { e.target.style.visibility = 'hidden'; setHas(false) },
              }),
              h('div', { 'data-sm-av-txt': '' },
                h('div', { 'data-sm-name': '' }, has ? '已经设好了' : (has === false ? '现在是默认轮廓' : '读外观')),
                h('div', { 'data-sm-note': '' }, '给它一张图就行。衣服在图上，想换就换一张。'),
                h('div', { 'data-sm-acts': '' },
                  h('label', { 'data-sm-btn': '', 'data-sm-file': '' }, '换一张',
                    h('input', { type: 'file', accept: 'image/*', onChange: upload })),
                  h('button', { 'data-sm-btn': '', type: 'button', onClick: clearAvatar }, '恢复默认')))))),

        h(Sec, { title: '现在' },
          h('div', { 'data-sm-card': '' },
            h('div', { 'data-sm-words': '' }, st.words || '身上没什么特别的动静'),
            h('div', { 'data-sm-row': '' },
              h('div', { 'data-sm-meta': '' },
                h('div', { 'data-sm-note': '' }, '共 ' + (st.regions || 0) + ' 个分区。改完立刻生效，不用重启。')),
              h('button', {
                'data-sm-btn': '', type: 'button',
                onClick: () => openSheet('身体 · 全身', API + '/panel', '每秒刷新'),
              }, '全身图')))),

        h('div', { 'data-sm-foot': '' },
          h('span', {}, 'dsh-soma v4'),
          h('span', { 'data-sm-sep': '' }, '·'),
          h('span', {}, '一秒一算，五秒一存'),
          h('span', { 'data-sm-sep': '' }, '·'),
          h('button', {
            'data-sm-btn': '', type: 'button',
            onClick: () => openSheet('原始读数', API, 'JSON'),
          }, '原始读数')))
    }

    function TimeField({ label, value, onCommit }) {
      return h('label', { 'data-sm-time': '' },
        h('span', {}, label),
        h('input', {
          type: 'time',
          value,
          'aria-label': label,
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
          () => h(Boundary, null, h(Panel)),
        ))
      },
    }
  },
})
