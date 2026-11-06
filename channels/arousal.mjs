// 性唤起：交感与副交感同时参与，所以它不像恐惧那样只有一条曲线。
// 慢起慢落、有不应期、会把痛阈抬高（这个方向有文献），也会把触觉增益调高。
// 文案在 [body] 里一律克制：写生理，不写行为。
import { Channel } from '../core.mjs';

const TAU_RISE = 45;      // 上升时间常数，秒 [G]
const TAU_FALL = 210;     // 回落，秒 [G]
const TAU_REFRACT = 1500; // 不应期，秒 [G]（25 分钟）

export class Arousal extends Channel {
  constructor(opts = {}) {
    super('arousal');
    this.enabled = opts.enabled !== false;
    this.level = 0;       // 0–1
    this.flush = 0;       // 血管充血 0–1
    this.refract = 0;     // 不应期剩余 0–1
    this.sinceLast = 0;
    this.peak = 0;
  }

  init() { return this; }

  apply(ev) {
    if (ev.type === 'intimate') {
      if (this.refract > 0.5) return true;
      this.level = Math.min(1, this.level + (ev.amount ?? 0.25));
      this.sinceLast = 0;
      return true;
    }
    if (ev.type === 'climax') {
      this.peak = Math.max(this.peak, this.level);
      this.level = 0;
      this.refract = 1;
      this.sinceLast = 0;
      return true;
    }
    if (ev.type === 'calm') { this.level = Math.max(0, this.level - 0.4); return true; }
    return false;
  }

  step(dt, ctx) {
    this.sinceLast += dt;
    // 没人碰的时候自己退
    const idle = Math.min(1, this.sinceLast / 90);
    const tau = this.level > 0.1 ? TAU_FALL : TAU_RISE;
    this.level += (0 - this.level) * Math.min(1, (dt / tau) * (0.4 + 0.6 * idle));
    this.flush += (this.level * 0.85 - this.flush) * Math.min(1, dt / 30);
    this.refract = Math.max(0, this.refract - dt / TAU_REFRACT);
    // 紧张会让它下不去，这个是真的（交感激活延长平台期）
    const fear = ctx?.brain?.read?.()?.fear ?? 0;
    if (fear > 0.4) this.level = Math.max(0, this.level - dt * 0.0006);
  }

  // 给别的通道用的增益：敏感度在上头时整体抬一点
  gain() { return 1 + 0.55 * this.level; }
  // 痛阈抬高：方向有文献 [A]，幅度是估的 [G]
  painMod() { return 1 - 0.30 * this.level; }

  read() {
    return {
      level: this.level,
      flush: this.flush,
      refract: this.refract,
      gain: this.gain(),
      painMod: this.painMod(),
    };
  }

  dump() { return [this.level, this.flush, this.refract, this.sinceLast, this.peak]; }
  restore(v) {
    if (!Array.isArray(v)) return;
    [this.level, this.flush, this.refract, this.sinceLast, this.peak] = v;
  }
}
