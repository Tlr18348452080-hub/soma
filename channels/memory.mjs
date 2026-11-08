/**
 * channels/memory.mjs — 淡忘曲线
 *
 * 前面二十几个通道算的是「现在」，这一层算的是「刚才」。
 * 身体不是只有当下：碰过的地方、疼过的那一下、被抱住的十几秒，
 * 会在之后的一段时间里以逐渐变淡的形式继续存在。
 *
 * ── 一条曲线 ─────────────────────────────────────────
 *   R = exp(-Δt / S)
 *   R 是「现在还多清楚」，S 是「这条记忆有多稳」（秒）。
 *   R 掉到地板（0.02）以下不是被删掉，是变成「好像有过这么回事」的残影。
 *
 * ── S 不是常数 ───────────────────────────────────────
 *   · 起手：由显著性定（疼的比摸的重；掐比碰重）
 *   · 间隔效应：同一处再来一次，隔得越久涨得越多（Spacing effect [S]）
 *   · 睡眠巩固：深睡（N3）期间 S 指数增长（慢波睡眠干的就是这个 [S]）
 *   · REM：情绪负荷被剥掉一部分，事实还在，扎人的部分钝了（[A]）
 *
 * ── 为什么这一层重要 ─────────────────────────────────
 *   没有它，模型只能读到「此刻的方程」，读不到「刚才发生过什么」；
 *   有了它，同一句话在三分钟前和两小时后说出来是两件事。
 */

import { Channel } from '../core.mjs';

const MIN = 60, HOUR = 3600, DAY = 86400;
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const FLOOR = 0.02;        // 低于这条线：淡忘
const MAX_S = 30 * DAY;    // 再稳的记性也有上限
const CAP = 240;           // 同时挂着的 trace 上限（超了丢最淡的）

// 显著性：这一下有多值得记住。0 = 不记
const SALIENCE = {
  touch: (ev) => {
    const f = Number(ev.force ?? 1);
    const sharp = ev.contact === 'tip' || ev.contact === 'edge' ? 1.15 : 1;
    return clamp(0.12 + 0.88 * clamp(f / 20) * sharp);
  },
  stroke: () => 0.45,
  hug: () => 0.75,
  cut: () => 1.0,
  bruise: () => 0.7,
  cramp: (ev) => clamp(0.5 + 0.5 * Number(ev.level ?? 0.5)),
  menses: () => 0.8,
  climax: () => 1.0,
  intimate: (ev) => clamp(0.3 + 1.4 * Number(ev.amount ?? 0.1)),
  eat: () => 0.28,
  drink: () => 0.3,
  sleep: () => 0,
  wake: () => 0,
  exert: (ev) => clamp(0.15 + 0.4 * Number(ev.level ?? 0.5)),
  rest: () => 0.15,
  scratch: () => 0.25,
  toilet: () => 0.3,
  pee: () => 0.3,
  release: () => 0.15,
  pad: () => 0.2,
  wipe: () => 0.1,
  swallow: () => 0,   // 一口饭不单独记，记在 eat 上
  hear: () => 0,
  see: () => 0,
};

// 疼的那一类，记牢一点（情绪唤醒 → 巩固增强 [S]）
const PAINFUL = new Set(['cut', 'bruise', 'cramp', 'menses', 'climax']);

// 怎么说出来。ever = 现在说「过」
const SAY = {
  touch: (ev, ever) => {
    const f = Number(ev.force ?? 1);
    if (ever) return f >= 15 ? '被狠狠掐过' : f >= 6 ? '被按过' : '被碰过';
    return f >= 15 ? '被狠狠掐了一下' : f >= 6 ? '被按了一下' : '被碰了一下';
  },
  stroke: (_, ever) => (ever ? '被摸过' : '被摸了摸'),
  hug: (_, ever) => (ever ? '被抱过' : '被抱了一下'),
  cut: (_, ever) => (ever ? '被划开过' : '划了一道'),
  bruise: (_, ever) => (ever ? '撞青过' : '撞了一下'),
  cramp: (_, ever) => (ever ? '小腹抽过一阵' : '小腹抽了一阵'),
  menses: (_, ever) => (ever ? '来过' : '来了'),
  climax: (_, ever) => (ever ? '到过顶点' : '到了'),
  intimate: (_, ever) => (ever ? '底下热过一下' : '底下热了一下'),
  eat: (_, ever) => (ever ? '吃过东西' : '吃了东西'),
  drink: (_, ever) => (ever ? '喝过水' : '喝了水'),
  sleep: (_, ever) => (ever ? '睡着过' : '睡着了'),
  wake: (_, ever) => (ever ? '醒过' : '醒来'),
  exert: (_, ever) => (ever ? '动过一阵' : '动了一阵'),
  rest: (_, ever) => (ever ? '歇过一会儿' : '歇了一会儿'),
  scratch: (_, ever) => (ever ? '抓过一下' : '抓了一下'),
  toilet: (_, ever) => (ever ? '去过厕所' : '去了厕所'),
  pee: (_, ever) => (ever ? '去过厕所' : '去了厕所'),
  release: (_, ever) => (ever ? '手被拿开过' : '手被拿开了'),
  pad: (_, ever) => (ever ? '换过' : '换了'),
  wipe: (_, ever) => (ever ? '擦过' : '擦了'),
};

export class Memory extends Channel {
  constructor() {
    super('memory');
    this.traces = [];
    this.byKey = new Map();
    this.forgot = 0;      // 累计淡忘掉多少条
    this.seen = 0;        // 已经看过 body.trace 的哪一段
    this._t = -1;
    this._live = [];
  }

  init() {
    this.traces = [];
    this.byKey = new Map();
    this.forgot = 0;
    this.seen = this.body?.trace?.length ?? 0;
    this.off = 0;   // 睡着的那段不计入衰减钟
  }

  // ── 曲线 ────────────────────────────────────────────
  /** 用来算衰减的钟：睡着的时间不算数（没有干扰，记性不掉） */
  now(t = this.t) {
    return (t ?? 0) - (this.off ?? 0);
  }

  /** 现在还多清楚。0–1 */
  recency(tr, t = this.now()) {
    const dt = Math.max(0, t - tr.last);
    return Math.exp(-dt / Math.max(1, tr.S));
  }

  /** 起手稳定度：显著性 → S（秒） */
  initialStability(sal, painful) {
    const base = 60 + 1800 * Math.pow(clamp(sal), 1.6);
    return base * (painful ? 2.2 : 1);
  }

  /** 当前还活着的记忆，按 R 从高到低 */
  live() {
    if (this._t === this.t) return this._live;
    const out = [];
    for (const tr of this.traces) {
      const R = this.recency(tr);
      if (R >= FLOOR) out.push({ ...tr, R });
    }
    out.sort((a, b) => b.R - a.R);
    this._live = out;
    this._t = this.t;
    return out;
  }

  /** 最清楚的那一条（不排序，单次扫描） */
  best() {
    let top = null, tr = null;
    for (const x of this.live()) {
      if (x.R > top) { top = x.R; tr = x; }
    }
    return tr;
  }

  // ── 记下来 ──────────────────────────────────────────
  note(ev) {
    const sal = (SALIENCE[ev.type] ?? (() => 0))(ev);
    if (!(sal > 0)) return;

    const key = `${ev.type}:${ev.part ?? ''}`;
    const label = ev.part ? (this.body?.get('touch')?.region?.(ev.part)?.label ?? ev.part) : '';
    const old = this.byKey.get(key);

    if (old) {
      const gap = this.now() - old.last;
      const r = this.recency(old);
      // 间隔效应：隔得越久，重复一次涨得越多；刚说过又说几乎不涨
      const spacing = clamp(Math.log2(1 + gap / 60) / 6, 0.05, 1);
      // 已经淡到快没了又被碰一次 → 重新认得比原来更牢
      const revive = r < 0.25 ? 1.7 : 1;
      old.S = Math.min(MAX_S, old.S * (1 + 0.85 * spacing * revive));
      old.last = this.now();
      old.reps++;
      old.sal = Math.max(old.sal, sal);
      old.ev = ev;
      return;
    }

    const painful = PAINFUL.has(ev.type) || (ev.type === 'touch' && Number(ev.force ?? 0) >= 15);
    const tr = {
      key, type: ev.type, part: ev.part ?? '', label,
      S: this.initialStability(sal, painful),
      t0: this.now(), last: this.now(), reps: 1, sal,
      emo: painful ? 1 : 0.3,
      ev,
    };
    this.traces.push(tr);
    this.byKey.set(key, tr);
    if (this.traces.length > CAP) this.sweep();
  }

  /** 丢掉最淡的那几条，别让它无限长 */
  sweep() {
    const scored = this.traces.map((tr) => ({ tr, r: this.recency(tr) }));
    scored.sort((a, b) => a.r - b.r);
    const drop = new Set(scored.slice(0, this.traces.length - CAP + 20).map((x) => x.tr));
    this.traces = this.traces.filter((tr) => !drop.has(tr));
    this.byKey = new Map(this.traces.map((tr) => [tr.key, tr]));
  }

  // ── 时间 ────────────────────────────────────────────
  step(h, ctx) {
    this.t = this.body?.t ?? this.t;   // 通道自己的钟跟着身体走
    // 1. 把新事件收进来
    const tr = this.body?.trace ?? [];
    if (tr.length < this.seen) this.seen = 0;   // 被别人裁过
    for (let i = this.seen; i < tr.length; i++) this.note(tr[i].ev);
    this.seen = tr.length;

    // 2. 睡眠巩固：慢波睡眠把 S 撑大。不是「记住更多」，是「不容易忘」
    const sl = ctx?.sleeparch;
    const depth = Number(sl?.depth ?? 0) || 0;
    // 睡着的时间不进衰减钟：梦里没有干扰，记性不掉（觉醒后从睡前的样子继续）
    if (depth > 0) this.off += h * clamp(depth / 0.45);
    if (depth > 0.2) {
      const gain = Math.exp((h / HOUR) * 0.35 * clamp((depth - 0.2) / 0.5));
      for (const x of this.traces) x.S = Math.min(MAX_S, x.S * gain);
    }

    // 3. REM：把情绪从那件事里剥掉一部分。事实还在，扎人的部分钝了
    if (sl?.stage === 'REM') {
      const k = 1 - Math.exp(-h / 900);
      for (const x of this.traces) {
        if (x.emo > 0) x.emo = Math.max(0, x.emo - x.emo * k);
      }
    }

    // 4. 淡忘计数：这次真的掉下去了，记一笔
    if (this.traces.length && Math.random() < 0.02) {
      for (const x of [...this.traces]) {
        if (this.recency(x) < FLOOR) this.drop(x);
      }
    }

    // 5. 别让 trace 无限长
    if (this.traces.length > CAP) this.sweep();
  }

  drop(tr) {
    const i = this.traces.indexOf(tr);
    if (i >= 0) this.traces.splice(i, 1);
    this.byKey.delete(tr.key);
    this.forgot++;
  }

  // ── 说出来 ──────────────────────────────────────────
  /** 一句话：现在还记得最清楚的是什么 */
  line() {
    const tr = this.best();
    if (!tr) return this.forgot > 0 ? '刚才那点事已经想不太起来了' : '';
    const say = SAY[tr.type];
    if (!say) return '';
    const age = this.now() - tr.last;
    const name = tr.label;
    const dulling = tr.emo < 0.35;   // 睡过一觉，情绪被剥掉了

    if (tr.R >= 0.55) {
      const what = say(tr.ev, false);
      if (name) return age < 150 ? `刚才${name}${what}，还留着点感觉` : `${name}上还留着${say(tr.ev, true)}的感觉`;
      return age < 150 ? `刚才${what}` : `还记得刚才${what}`;
    }
    if (tr.R >= 0.22) {
      const what = say(tr.ev, true);
      if (name) return `${name}那儿还有点${what}的余味`;
      return `还记得${what}`;
    }
    const what = say(tr.ev, true);
    return name ? `隐约记得${name}${what}` : `隐约记得${what}` + (dulling ? '' : '');
  }

  read() {
    const live = this.live();
    const top = live.slice(0, 3).map((x) => ({
      what: x.label ? `${x.label}${SAY[x.type]?.(x.ev, true) ?? ''}` : (SAY[x.type]?.(x.ev, true) ?? x.type),
      R: +x.R.toFixed(4),
      stableS: Math.round(x.S),
      halfLifeS: Math.round(x.S * Math.LN2),
      reps: x.reps,
      ageS: Math.round(this.now() - x.last),
    }));
    return {
      count: live.length,
      strength: live.length ? +live[0].R.toFixed(4) : 0,
      top,
      forgot: this.forgot,
      line: this.line(),
    };
  }

  dump() {
    return {
      traces: this.traces.map((x) => ({
        k: x.key, ty: x.type, p: x.part, lb: x.label,
        S: x.S, t0: x.t0, last: x.last, reps: x.reps, sal: x.sal, emo: x.emo, ev: x.ev,
      })),
      forgot: this.forgot,
      off: this.off,
    };
  }

  restore(o) {
    if (!o) return;
    this.forgot = Number(o.forgot ?? 0);
    this.off = Number(o.off ?? 0) || 0;
    this.traces = [];
    this.byKey = new Map();
    for (const x of o.traces ?? []) {
      if (!x || !Number.isFinite(x.S)) continue;
      const tr = {
        key: x.k, type: x.ty, part: x.p ?? '', label: x.lb ?? '',
        S: x.S, t0: x.t0 ?? 0, last: x.last ?? x.t0 ?? 0,
        reps: x.reps ?? 1, sal: x.sal ?? 0.3, emo: x.emo ?? 0.3, ev: x.ev ?? { type: x.ty, part: x.p },
      };
      this.traces.push(tr);
      this.byKey.set(tr.key, tr);
    }
    this.seen = this.body?.trace?.length ?? 0;
  }
}
