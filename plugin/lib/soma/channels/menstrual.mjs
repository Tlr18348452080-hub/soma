import { Channel } from '../core.mjs';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const num = (x, d) => (Number.isFinite(Number(x)) ? Number(x) : d);
const gauss = (x, mu, sd) => Math.exp(-(((x - mu) / sd) ** 2));

/**
 * 月经：内膜、经血、子宫、铁
 *
 * 这一层不借 cycle 的相位来"演"，cycle 给天，它给量。
 * 天是日历，量是身体。两者对不上才叫异常。
 */
export class Menstrual extends Channel {
  constructor() {
    super('menstrual');
    this.endo = 0.30;        // 内膜厚度 0–1
    this.flow = 0;           // 当前流量 0–1（1 ≈ 8 mL/h）
    this.loss = 0;           // 本次经期累计失血 mL
    this.cycleLoss = 0;
    this.cramp = 0;
    this.uterus = 0.10;      // 子宫张力
    this.contractions = 0;   // 次/时
    this.padSat = 0;         // 卫生用品饱和
    this.padHours = 0;
    this.padCapacity = 12;   // mL
    this.iron = 0.95;        // 铁储备（铁蛋白替身）
    this.clot = 0;
    this.stain = 0;
    this.wet = 0;
    this.lastDay = 0;
    this.pads = 0;
    this.sinceMenses = 0;
  }

  // 内膜的目标厚度：掉干净 → 长回去 → 黄体期再厚一点等着
  endoTarget(day) {
    if (day <= 5) return 0.12;
    if (day <= 14) return 0.12 + ((day - 5) / 9) * 0.62;
    return 0.74 + ((day - 14) / 14) * 0.18;
  }

  // 经血只在头几天，第 1.6 天最凶
  flowCurve(day) {
    if (day > 6.5) return 0;
    return clamp(gauss(day, 1.6, 1.35));
  }

  apply(ev) {
    if (ev.type === 'menses') {
      const lv = clamp(num(ev.level, 1));
      this.flow = Math.max(this.flow, lv * 0.8);
      this.sinceMenses = 0;
      return true;
    }
    if (ev.type === 'cramp') {
      this.cramp = Math.max(this.cramp, clamp(num(ev.level, 0.5)));
      return true;
    }
    if (ev.type === 'pad') {
      this.padSat = 0;
      this.padHours = 0;
      this.pads += 1;
      this.stain *= 0.5;
      return true;
    }
    if (ev.type === 'wipe') {
      this.stain = 0;
      return true;
    }
    return false;
  }

  step(dt, ctx) {
    const hours = dt / 3600;
    this.sinceMenses += hours;

    const cy = ctx?.cycle ?? {};
    const day = Number(cy.day) || this.lastDay || 1;

    // 翻页：day 比上次小了一大截，说明新的一轮开始了
    if (this.lastDay && day + 7 < this.lastDay) {
      this.cycleLoss = 0;
      this.pads = 0;
    }
    this.lastDay = day;

    // ── 内膜：长起来慢，掉下去快 ──
    const et = this.endoTarget(day);
    const tauEndo = et > this.endo ? 7 * 86400 : 3.2 * 86400;
    this.endo += (et - this.endo) * (1 - Math.exp(-dt / tauEndo));

    // ── 流量 ──
    const ft = this.flowCurve(day);
    this.flow += (ft - this.flow) * (1 - Math.exp(-dt / 1800));

    // ── 失血、铁、卫生用品 ──
    const mL = this.flow * 8 * hours;
    if (mL > 0) {
      this.cycleLoss += mL;
      this.loss = this.cycleLoss;
      this.iron = clamp(this.iron - mL * 0.0016, 0, 1);
      this.padSat += mL / this.padCapacity;
      if (this.padSat > 0.95 && this.flow > 0.15) {
        this.stain = clamp(this.stain + (this.padSat - 0.95) * hours * 0.8);
        this.padSat = 1;
      }
      if (this.flow > 0.6) this.clot = clamp(this.clot + this.flow * hours * 0.6);
    }
    this.padHours += hours;
    // 铁恢复得很慢，一天几个毫克
    this.iron = clamp(this.iron + (0.95 - this.iron) * (1 - Math.exp(-dt / (12 * 86400))), 0, 1);
    this.wet = this.flow;

    // ── 痛经：冷、累、怕，都让它更紧 ──
    const coreT = Number(ctx?.homeo?.coreT) || 36.6;
    const fatigue = Number(ctx?.vitals?.fatigue) || 0;
    const fear = Number(ctx?.brain?.fear) || 0;
    const chill = clamp((36.2 - coreT) / 0.6);
    const trigger = this.flow * (1 + 0.35 * chill + 0.25 * fatigue + 0.20 * fear);
    this.cramp += (clamp(trigger * 2.2) - this.cramp) * (1 - Math.exp(-dt / 240));

    this.uterus = clamp(0.10 + 0.62 * this.cramp + 0.10 * this.flow);
    this.contractions = this.flow > 0.02 ? 4 + 26 * this.cramp : 0;
    this.clot *= Math.exp(-hours / 6);
  }

  painGain() {
    return 1 + 0.30 * this.cramp + 0.10 * (1 - this.iron);
  }

  read() {
    return {
      active: this.flow > 0.02,
      day: this.lastDay,
      flow: this.flow,
      loss: this.loss,
      cycleLoss: this.cycleLoss,
      heavy: this.cycleLoss > 80,
      endo: this.endo,
      cramp: this.cramp,
      uterus: this.uterus,
      contractions: this.contractions,
      padSat: this.padSat,
      padHours: this.padHours,
      pads: this.pads,
      iron: this.iron,
      clot: this.clot,
      stain: this.stain,
      wet: this.wet,
      painGain: this.painGain(),
    };
  }

  dump() {
    const o = {};
    for (const k of ['endo','flow','loss','cycleLoss','cramp','uterus','contractions','padSat',
      'padHours','iron','clot','stain','wet','lastDay','pads','sinceMenses']) o[k] = this[k];
    return o;
  }

  restore(o) {
    if (!o) return;
    for (const k in o) if (Number.isFinite(o[k])) this[k] = o[k];
  }
}
