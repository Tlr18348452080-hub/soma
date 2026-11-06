// 免疫层：炎症。
//
// 生病那天的低落不是「心情不好」，是一整套行为反应：
// 不想动、不想说话、不想吃、碰一下更疼。这叫 sickness behavior，
// 文献里的证据比「激素→情绪」那堆硬得多。
//
// [S] 发热期的无力、社交退缩、痛觉敏化是炎症因子直接引起的
// [G] 下面的总量、时间常数都是估的
import { Channel } from '../core.mjs';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

export class Immune extends Channel {
  constructor(opts = {}) {
    super('immune');
    this.inflam = 0;      // 炎症负荷 0–1
    this.peak = 0;        // 这次病的峰值
    this.days = 0;        // 病了多久
  }

  apply(ev) {
    if (ev.type === 'infect') {
      this.peak = clamp((ev.level ?? 0.5), 0, 1);
      this.days = 0;
      return true;
    }
    if (ev.type === 'heal') { this.inflam = 0; return true; }
    return false;
  }

  step(h, ctx) {
    if (this.peak > 0) {
      // 第一天爬起来，之后两天半退掉。一场感冒的量级 [G]
      this.days += h / 86400;
      const wane = Math.exp(-Math.max(0, this.days - 1) / 2.5);
      const target = this.peak * wane;
      this.inflam += (target - this.inflam) * Math.min(1, h / 21600);
      if (this.inflam < 1e-3 && this.days > 2) { this.inflam = 0; this.peak = 0; this.days = 0; }
    }
  }

  read() {
    const f = this.inflam;
    return {
      inflam: f,
      // 发热：设定点上移，不是体温立刻上去（那个由 homeo 追）
      fever: 1.8 * f,
      // 病态行为：不想动、不想说、不想吃
      sickness: clamp(f * 0.9, 0, 1),
      // 炎症因子直接敏化痛觉
      painGain: 1 + 0.8 * f,
    };
  }
}
