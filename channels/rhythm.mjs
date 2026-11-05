/**
 * channels/rhythm.mjs — 昼夜节律与睡眠压力
 *
 * 这一层不接任何外部事件也能自己变：只要时间在走。
 * 它管的是「什么时候」——同样的碰，凌晨三点和下午三点不是一个感觉。
 *
 * 两套钟叠在一起（Borbély 两过程模型）：
 *   Process C：24 小时的昼夜节律，管核心体温、皮质醇晨峰、褪黑素
 *   Process S：清醒多久就攒多少的睡眠压力（腺苷），只有睡着才清
 *
 * 常数分级见 SOURCES.md。时间点 [S]，幅度 [A]，时间常数 [G]。
 */

import { Channel } from '../core.mjs';

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const DAY = 86400;
const TWO_PI = Math.PI * 2;

export class Rhythm extends Channel {
  constructor(opts = {}) {
    super('rhythm');
    // 时钟：从午夜起的秒数。默认早上八点醒着。
    this.clock = Number(opts.clockHours ?? 8) * 3600;
    this.awake = 0;          // 连续清醒秒数
    this.asleep = false;
    this.adenosine = 0.20;   // 睡眠压力 0–1
    this.sleepDebt = 0;      // 缺觉累积，小时
  }

  /** 相位 0–1，0 = 半夜 */
  get phase() {
    return (this.clock % DAY) / DAY;
  }

  apply(ev) {
    if (ev.type === 'sleep') { this.asleep = true; return true; }
    if (ev.type === 'wake') { this.asleep = false; this.awake = 0; return true; }
    return false;
  }

  step(h) {
    this.clock += h;
    if (this.asleep) {
      this.awake = 0;
      // 睡着才清腺苷。清得慢——睡八小时也未必清干净。
      this.adenosine += (0.02 - this.adenosine) * Math.min(1, h / (TAU_CLEAR));
      this.sleepDebt = Math.max(0, this.sleepDebt - h / 3600);
    } else {
      this.awake += h;
      this.adenosine = clamp(this.adenosine + (1 - this.adenosine) * Math.min(1, h / TAU_BUILD), 0, 1);
      this.sleepDebt += h / 3600 * 0.0;   // 缺觉只在欠的时候算，见 sleepDebtOf()
    }
  }

  /** 现在欠了多少觉（小时）。清醒超过 16 小时开始记。 */
  debtHours() {
    // 16 小时是拐点：清醒 15.84 h 以上警觉度开始线性掉 [S]（PMID 12683469）
    return Math.max(0, this.awake / 3600 - 16) + this.sleepDebt;
  }

  read() {
    const p = this.phase;
    // 核心体温最低点约 05:00 [S]（PMID 15038855）。峰谷差文献没给，取 0.30 °C [G]
    const coreT = 36.5 - 0.30 * Math.cos(TWO_PI * (p - 5.0 / 24));
    // 皮质醇晨峰：醒来后 30 分钟内到顶，比基线高 50–75% [S]（PMID 9416776）。
    // 所以它跟"醒了多久"走，不跟钟走。
    const car = Math.exp(-Math.pow((this.awake - 1800) / 1200, 2));
    const cDay = 0.5 - 0.5 * Math.cos(TWO_PI * (p - 20 / 24));
    // 褪黑素：天黑后起，凌晨 3 点前后最高 [S]
    const melatonin = 0.5 - 0.5 * Math.cos(TWO_PI * (p - 3 / 24));
    // 昼夜那一路：只在那个谷上建模，白天接近满值。
    // 谷的位置取 05:20（睡眠倾向峰值时刻，PMID 22621352）[S]
    const d = Math.abs(p - (5 + 20 / 60) / 24);
    const dist = Math.min(d, 1 - d);
    const circ = clamp(1 - Math.exp(-Math.pow(dist / 0.17, 2)), 0, 1);
    // 睡眠压力压在上面。腺苷是平方项——攒到后半程才开始真正难受 [G]
    const alert = clamp(circ - 0.85 * this.adenosine * this.adenosine
                        - 0.25 * this.debtHours() / 12, 0.02, 1);
    return {
      clock: this.clock % DAY,
      phase: p,
      coreT,
      // 皮质醇有昼夜基线：夜里只剩白天的两成左右 [G]（PMID 26663024），
      // 谷在 22–23 点，晨峰叠在它上面 [A]（PMID 9146822）
      cortisolMod: (0.16 + 0.84 * cDay) * (1 + 0.62 * car),
      melatonin,
      adenosine: this.adenosine,
      alert,
      asleep: this.asleep,
      debt: this.debtHours(),
    };
  }
}

const TAU_BUILD = 14 * 3600;   // [G] 清醒 16 小时攒到约 0.75
const TAU_CLEAR = 6 * 3600;    // [G]
