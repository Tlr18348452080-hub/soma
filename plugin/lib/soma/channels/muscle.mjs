// 肌肉：不是「有没有力气」一个数，是「哪块还能使、哪块已经酸了」。
// 力量掉得慢，酸痛来得晚——练完当天只觉得累，第二天才开始疼。
import { Channel } from '../core.mjs';

/** 肌群。mvc = 占体重的最大自主收缩比例 [G]；tauSore = 酸痛消退时间常数 */
export const GROUPS = {
  grip:    { label: '握力',   mvc: 0.45, tauSore: 48 * 3600, use: '拿东西' },
  forearm: { label: '前臂',   mvc: 0.30, tauSore: 48 * 3600, use: '提' },
  upperarm:{ label: '上臂',   mvc: 0.35, tauSore: 48 * 3600, use: '举' },
  shoulder:{ label: '肩',     mvc: 0.30, tauSore: 60 * 3600, use: '扛' },
  trunk:   { label: '躯干',   mvc: 0.55, tauSore: 60 * 3600, use: '撑着' },
  thigh:   { label: '大腿',   mvc: 1.20, tauSore: 72 * 3600, use: '走、站、蹲' },
  calf:    { label: '小腿',   mvc: 0.60, tauSore: 72 * 3600, use: '踮脚' },
  neck:    { label: '颈',     mvc: 0.15, tauSore: 36 * 3600, use: '顶着脑袋' },
};

export class Muscle extends Channel {
  constructor(opts = {}) {
    super('muscle');
    this.weight = opts.weight ?? 50;
    this.groups = Object.entries(GROUPS).map(([id, g]) => ({
      id, ...g,
      // 用掉的力气 0–1，恢复快（几分钟到几小时）
      used: 0,
      // 酸痛 0–1，来得晚、退得慢：练完 24–48 小时才到顶 [A]
      sore: 0,
      dmg: 0,   // 已经发生的损伤：酸痛从它这儿慢慢长出来，不是立刻
      // 颤抖 0–1，力竭时的 8–10 Hz 抖动 [A]（PMID 常用 8–12 Hz）
      tremor: 0,
    }));
    this.byId = new Map(this.groups.map((g) => [g.id, g]));
  }

  g(id) { return this.byId.get(id) ?? this.byId.get('grip'); }

  apply(ev) {
    if (ev.type === 'use') {
      const g = this.g(ev.group);
      const amount = Math.max(0, Math.min(1, ev.amount ?? 0.5));
      g.used = Math.min(1, g.used + amount * 0.25);
      // 用力到七成以上，肌肉开始损伤，酸痛就是从这里来的
      if (amount > 0.7) g.dmg = Math.min(1, g.dmg + (amount - 0.7) * 1.2);
      return true;
    }
    if (ev.type === 'effort') {
      // 全身发力：大腿和躯干先上
      for (const g of this.groups) {
        const w = ['thigh', 'trunk', 'calf'].includes(g.id) ? 1 : 0.4;
        const a = (ev.level ?? 0.5) * w;
        g.used = Math.min(1, g.used + a * 0.5 * ((ev.seconds ?? 60) / 120));
      }
      return true;
    }
    return false;
  }

  step(dt, ctx) {
    const v = ctx?.vitals;
    const fatigue = v?.fatigue ?? 0;
    // 用掉的力气恢复：快（τ≈6 分钟）
    const back = 1 - Math.exp(-dt / 360);
    for (const g of this.groups) {
      g.used = Math.max(0, g.used * (1 - back));
      // 酸痛不是练完就有的：损伤先躺着，18 小时后才变成痛，24–48 小时到顶 [A]
      g.sore += (g.dmg - g.sore) * Math.min(1, dt / (18 * 3600));
      g.sore = Math.max(0, g.sore * Math.exp(-dt / g.tauSore));
      g.dmg = Math.max(0, g.dmg * Math.exp(-dt / (96 * 3600)));
      // 颤抖：力气用掉七成以上才开始抖
      const t = Math.max(0, (g.used - 0.7) / 0.3);
      g.tremor += (t * (0.5 + fatigue * 0.5) - g.tremor) * Math.min(1, dt / 4);
    }
  }

  /** 这块现在还能使出多少（0–1）。 */
  strength(id) {
    const g = this.g(id);
    return Math.max(0.05, 1 - g.used * 0.55 - g.sore * 0.35);
  }

  read() {
    const worst = [...this.groups].sort((a, b) => (b.sore + b.used) - (a.sore + a.used))[0];
    return {
      strongest: worst.id, label: worst.label,
      sore: worst.sore, used: worst.used, tremor: worst.tremor,
      gripRatio: this.strength('grip'),
      groups: this.groups.map((g) => ({ id: g.id, label: g.label, used: g.used, sore: g.sore, tremor: g.tremor })),
    };
  }

  dump() { return { groups: Object.fromEntries(this.groups.map((g) => [g.id, [g.used, g.sore, g.tremor]])) }; }
  restore(d) {
    if (!d?.groups) return;
    for (const g of this.groups) { const a = d.groups[g.id]; if (a) [g.used, g.sore, g.tremor, g.dmg = 0] = a; }
  }
}
