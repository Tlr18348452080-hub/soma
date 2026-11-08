/**
 * channels/cycle.mjs — 月度节律
 *
 * 昼夜是 24 小时一圈，这个是 28 天一圈的慢波。
 * 它管的东西跟昼夜不重叠：体温基线、痛阈、体力、心情。
 *
 * 同一个碰，在第 8 天和第 26 天不是一个感觉。
 * 这不是性格变了，是增益被激素拧了。
 *
 * 常数分级见 SOURCES.md。默认开启；conf 里传 cycle:false 可整块关掉。
 */

import { Channel } from '../core.mjs';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const DAY = 86400;
const LEN = 28;          // [S] 平均 28 天，正常 21–35

export class Cycle extends Channel {
  constructor(opts = {}) {
    super('cycle');
    this.t = 0;                       // 秒
    this.day = Number(opts.cycleDay ?? 8);   // 1–28
  }

  step(h) {
    this.t += h;
    this.day = ((this.day - 1 + h / DAY) % LEN) + 1;
  }

  read() {
    const d = this.day;
    // 排卵在第 14 天前后（按 28 天算）。真实周期里黄体期固定约 14 天，
    // 卵泡期长短不一，所以这里用"距下次月经还有几天"会更准，先简化 [G]
    const ovu = 14;
    // 雌二醇：卵泡期爬升，排卵前一个峰，黄体期第二个小峰
    const e2 = 60 + 190 * Math.exp(-Math.pow((d - 13) / 2.2, 2))
                  + 90 * Math.exp(-Math.pow((d - 21) / 3.0, 2));
    // 孕酮：排卵后才起来，第 21 天前后最高，月经前掉下去
    const p4 = 0.3 + 14 * Math.exp(-Math.pow((d - 21) / 4.5, 2));
    // LH 峰很窄，就在排卵前一天
    const lh = 4 + 40 * Math.exp(-Math.pow((d - 13) / 0.9, 2));
    // 基础体温：排卵后升 0.3°C 左右，一直挂到月经来
    const bbt = d >= ovu && d <= 27 ? 0.30 : 0.0;
    // 痛阈：卵泡期偏高（不那么疼），黄体晚期偏低 [A]。
    // 输出的是增益：>1 代表同样的碰更疼
    const painGain = 1 - 0.15 * Math.exp(-Math.pow((d - 9) / 4, 2))
                       + 0.22 * Math.exp(-Math.pow((d - 26) / 2.5, 2));
    // 经前：水潴留 + 情绪
    const pms = clamp(Math.exp(-Math.pow((d - 26) / 3.0, 2)) * (d > 20 ? 1 : 0), 0, 1);

    // 宫颈黏液：干 → 黏 → 蛋清 → 干。排卵前最滑，量也最多
    const mucus = clamp(0.15 + 0.85 * Math.exp(-Math.pow((d - 13) / 2.4, 2)));
    // 受孕窗：精子活 3–5 天，卵子 12–24 小时
    const fertile = d >= 10 && d <= 16;
    // 排卵痛：只在排卵那一侧、那一两个小时，不是每个周期都有
    const mittelschmerz = 0.55 * Math.exp(-Math.pow((d - 13.5) / 0.8, 2)) * (this.hasMitt ?? 1);
    // 乳房胀：黄体中期起来，经前最明显
    const breast = clamp(0.75 * Math.exp(-Math.pow((d - 25) / 4.5, 2)) + 0.25 * (d > 18 ? 1 : 0) * 0.4);
    // 性欲：排卵前后一峰，经前一个小峰（两套机制，不是一条线）
    const libido = clamp(0.45 + 0.40 * Math.exp(-Math.pow((d - 14) / 2.6, 2))
      + 0.15 * Math.exp(-Math.pow((d - 24) / 3.0, 2)) - 0.25 * pms);
    // 食欲：黄体期整体偏高，经前最想吃甜的
    const appetite = clamp(0.40 + 0.30 * (d > 16 ? 1 : 0) * 0.7 + 0.30 * pms);
    // 子宫张力：平时是硬的，经期会一阵阵收紧
    const uterusTone = clamp(0.10 + 0.55 * (d <= 5 ? 1 : 0) * Math.exp(-Math.pow((d - 2.2) / 2.0, 2))
      + 0.15 * mittelschmerz);
    // 潮热：黄体晚期雌激素掉下来那一阵
    const hotFlash = clamp(0.6 * Math.exp(-Math.pow((d - 27.5) / 1.2, 2)));

    return {
      day: d,
      phase: d <= 5 ? 'menstrual' : d < ovu ? 'follicular' : d <= ovu + 1 ? 'ovulation' : 'luteal',
      e2, p4, lh, bbt, painGain, pms, bloating: pms * 0.6,
      mucus, fertile, mittelschmerz, breast, libido, appetite, uterusTone, hotFlash,
    };
  }

  dump() { return { t: this.t, day: this.day }; }

  restore(o) {
    if (!o || typeof o !== 'object') return;
    if (Number.isFinite(o.t)) this.t = o.t;
    if (Number.isFinite(o.day)) this.day = o.day;
  }
}
