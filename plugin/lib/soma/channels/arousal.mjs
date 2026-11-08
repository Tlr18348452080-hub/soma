// 性唤起：两条时间尺度叠在一起。
//
// 快的一条是 level：几秒起、几分钟落，跟着「此刻有没有被碰」走。
// 慢的一条是 tension：积压。没人碰它也在涨，涨到一定程度身体就有底火；
// 释放之后塌下去，再从头慢慢积。禁欲越久涨得越高，睡眠债、压力、
// 生病、疲劳会把它压住，周期里的雌激素峰值和睾酮把它抬起来。
//
// 张力和激素不是一回事：激素改斜率，张力是积分出来的那个量。
// 文案在 [body] 里一律克制：写生理，不写行为。
import { Channel } from '../core.mjs';

const TAU_RISE = 45;        // 快变量上升，秒 [G]
const TAU_FALL = 210;       // 快变量回落，秒 [G]
const TAU_REFRACT = 1500;   // 不应期，秒 [G]（25 分钟）
const TAU_TENSION_UP = 6 * 3600;   // 张力积起来的时间常数，秒 [G]
const TAU_TENSION_DOWN = 40 * 60;  // 张力塌下去，秒 [G]
const TAU_SATIETY = 45 * 60;       // 满足感，秒 [G]
const ABSTINENCE_FULL = 36 * 3600; // 36 小时不释放，积累项到顶 [G]

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

export class Arousal extends Channel {
  constructor(opts = {}) {
    super('arousal');
    this.enabled = opts.enabled !== false;
    this.level = 0;       // 0–1，此刻的唤起
    this.tension = 0.10;  // 0–1，积压的那部分（慢变量，落盘）
    this.satiety = 0;     // 0–1，刚释放完的满足，压住张力
    this.flush = 0;       // 血管充血 0–1
    this.refract = 0;     // 不应期剩余 0–1
    this.sinceLast = 0;   // 秒
    this.peak = 0;
  }

  init() { return this; }

  apply(ev) {
    if (ev.type === 'intimate') {
      if (this.refract > 0.5) return true;
      const amount = ev.amount ?? 0.25;
      // 张力高的时候同样一下碰，抬得更多（底火）
      this.level = clamp(this.level + amount * (1 + 0.35 * this.tension) * (1 - 0.6 * this.refract), 0, 1);
      // 边缘：没释放的刺激也会往张力里加一点，加得慢
      this.tension = clamp(this.tension + amount * 0.16 * (1 - 0.6 * this.refract), 0, 0.95);
      this.satiety *= 0.7;
      this.sinceLast = 0;
      return true;
    }
    if (ev.type === 'climax') {
      this.peak = Math.max(this.peak, this.level);
      this.level = 0;
      this.tension *= 0.30;   // 塌下去，但不归零
      this.satiety = 0.60;
      this.refract = 1;
      this.sinceLast = 0;
      return true;
    }
    if (ev.type === 'calm') {
      this.level = Math.max(0, this.level - 0.4);
      this.tension *= 0.85;
      return true;
    }
    return false;
  }

  // 张力此刻想去的值。不是「有没有欲望」的开关，是积分的目标。
  target(ctx) {
    const e = ctx?.endocrine ?? {};
    const cyc = ctx?.cycle ?? {};
    const v = ctx?.vitals ?? {};
    const rh = ctx?.rhythm ?? {};
    const im = ctx?.immune ?? {};

    const andro = e.androgen ?? 0.55;
    // 雌激素相对基线抬一点（排卵前后），pms 段往下压
    const e2n = clamp(((cyc.e2 ?? 90) - 60) / 180, 0, 1);
    const pms = cyc.pms ?? 0;
    const fatigue = v.fatigue ?? 0;
    const stress = e.stressLoad ?? 0;
    const debt01 = clamp((rh.debt ?? 0) / 6, 0, 1);
    const sick = clamp((im.sickness ?? 0) / 0.6, 0, 1);
    const abstinence = clamp(this.sinceLast / ABSTINENCE_FULL, 0, 1);

    let t = 0.28
      + 0.34 * abstinence
      + 0.22 * clamp((andro - 0.30) / 0.65, 0, 1)
      + 0.16 * e2n
      - 0.30 * fatigue
      - 0.28 * stress
      - 0.20 * debt01
      - 0.18 * pms
      - 0.25 * sick;

    t *= 1 - 0.55 * this.satiety;
    return clamp(t, 0, 0.95);
  }

  step(dt, ctx) {
    this.sinceLast += dt;

    const goal = this.target(ctx);
    const tau = goal > this.tension ? TAU_TENSION_UP : TAU_TENSION_DOWN;
    this.tension += (goal - this.tension) * (1 - Math.exp(-dt / tau));

    // 快变量回落到「底火」而不是 0：张力高的时候身体本来就不静
    const floor = this.tension * 0.35;
    const tauFast = this.level > floor ? TAU_FALL : TAU_RISE;
    this.level += (floor - this.level) * (1 - Math.exp(-dt / tauFast));

    this.flush += (this.level * 0.85 - this.flush) * (1 - Math.exp(-dt / 30));
    this.refract = Math.max(0, this.refract - dt / TAU_REFRACT);
    this.satiety *= Math.exp(-dt / TAU_SATIETY);

    // 恐惧压住唤起；痛也会（两条都是 [G] 方向，幅度估的）
    const fear = ctx?.brain?.fear ?? 0;
    if (fear > 0.4) this.level *= Math.exp(-dt * 0.0006 * (fear - 0.4) / 0.6);
    let pain = 0;
    if (Array.isArray(ctx?.touch)) for (const r of ctx.touch) if ((r.pain ?? 0) > pain) pain = r.pain;
    if (pain > 0.5) this.level *= Math.exp(-dt * 0.0004 * (pain - 0.5) / 0.5);
  }

  // 给别的通道用的增益：敏感度在上头时整体抬一点
  gain() { return 1 + 0.55 * this.level + 0.15 * this.tension; }
  // 痛阈抬高：方向有文献 [A]，幅度是估的 [G]
  painMod() { return 1 - 0.30 * this.level; }

  read() {
    return {
      level: this.level,
      tension: this.tension,
      satiety: this.satiety,
      flush: this.flush,
      refract: this.refract,
      gain: this.gain(),
      painMod: this.painMod(),
      sinceLast: this.sinceLast,
      peak: this.peak,
      abstinentHours: this.sinceLast / 3600,
    };
  }

  dump() {
    return {
      level: this.level,
      tension: this.tension,
      satiety: this.satiety,
      flush: this.flush,
      refract: this.refract,
      sinceLast: this.sinceLast,
      peak: this.peak,
    };
  }

  restore(v) {
    if (Array.isArray(v)) { // 兼容旧存档
      [this.level, this.flush, this.refract, this.sinceLast, this.peak] = v;
      return;
    }
    if (!v || typeof v !== 'object') return;
    for (const k of ['level', 'tension', 'satiety', 'flush', 'refract', 'sinceLast', 'peak']) {
      if (Number.isFinite(v[k])) this[k] = v[k];
    }
  }
}
