/**
 * core.mjs — 身体内核
 *
 * 整个项目只有一条规矩：
 *   状态只能被「事件」和「时间」改变，不能直接赋值。
 *
 * 没有 body.set('pain', 5)。想让它疼，只能碰它。
 * 这就是「base case」在代码里的意思：一个绕不过去的层。
 */

export class Channel {
  constructor(id) {
    this.id = id;
    this.body = null;
  }
  init() {}
  // 返回 true 表示这条事件归我处理，后面的人不用看了
  apply(_ev) {
    return false;
  }
  step(_dt, _ctx) {}
  read() {
    return {};
  }
}

export class Body {
  constructor(opts = {}) {
    this.t = 0;
    this.channels = new Map();
    this.trace = [];
    this.onEvent = opts.onEvent ?? null;
  }

  use(ch) {
    this.channels.set(ch.id, ch);
    ch.body = this;
    ch.init?.();
    return this;
  }

  get(id) {
    return this.channels.get(id);
  }

  // ── 唯一能改状态的两条路之一：事件 ──────────────────
  emit(ev) {
    let hit = null;
    for (const ch of this.channels.values()) {
      if (ch.apply(ev) === true) {
        hit = ch.id;
        break;
      }
    }
    if (!hit) throw new Error(`没人接这个事件: ${JSON.stringify(ev)}`);
    this.trace.push({ t: this.t, ev, by: hit });
    this.onEvent?.(ev, hit);
    return this;
  }

  // ── 另一条：时间 ────────────────────────────────────
  // 步长不是常数。身上有动静的时候走细（触摸的 τ 只有几秒），
  // 安安静静的时候走粗（睡七小时没必要切成五十万份）。
  busy(ctx) {
    const t = ctx?.touch;
    if (Array.isArray(t)) {
      for (const r of t) {
        if (Math.abs(r.pressure) > 1e-3) return true;
        if (r.pain > 1e-3) return true;
        if (r.ct > 1e-3) return true;
      }
    }
    return false;
  }

  step(dt) {
    const ctx = this.snapshot();
    const sub = this.busy(ctx) ? 0.05 : Math.min(60, Math.max(0.05, dt / 300));
    let acc = 0;
    while (acc < dt - 1e-9) {
      const h = Math.min(sub, dt - acc);
      acc += h;
      this.t += h;
      for (const ch of this.channels.values()) ch.step(h, ctx);
    }
    return this;
  }

  // 通道之间互相看得见，这样才能耦合（饿久了触觉变钝）
  snapshot() {
    const o = { t: this.t };
    for (const [id, ch] of this.channels) o[id] = ch.read();
    return o;
  }
}
