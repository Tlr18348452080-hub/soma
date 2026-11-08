import { Channel } from '../core.mjs';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const num = (x, d) => (Number.isFinite(Number(x)) ? Number(x) : d);

const BASE = { insulin: 0.18, leptin: 0.68, ghrelin: 0.35, tsh: 0.50, gh: 0.10, endorphin: 0.12, resist: 0.12, ketones: 0.02 };
const TAU = { insulin: 900, leptin: 3 * 86400, ghrelin: 3 * 3600, tsh: 21 * 86400, gh: 1200, endorphin: 600, resist: 30 * 86400, ketones: 6 * 3600 };

/**
 * 代谢内分泌：胰岛素、瘦素、饥饿素、甲状腺、生长激素、内啡肽
 *
 * 这一层的意义是让"饿"有来源。之前 hunger 是血糖的一个函数，
 * 血糖掉就是饿——真人不是这样，饿了半宿血糖会稳，饿意却还在。
 * 瘦素管长期，饥饿素管短期，甲状腺管"烧得多快"，各管一段。
 */
export class Metabolic extends Channel {
  constructor() {
    super('metabolic');
    this.insulin = BASE.insulin;
    this.leptin = BASE.leptin;
    this.ghrelin = BASE.ghrelin;
    this.tsh = BASE.tsh;
    this.gh = BASE.gh;
    this.endorphin = BASE.endorphin;
    this.resist = BASE.resist;
    this.ketones = BASE.ketones;
    this.lastGlucose = 5.0;
    this.fedHours = 12;
  }

  apply(ev) {
    if (ev.type === 'eat' || ev.type === 'swallow') {
      const carb = Number(ev.carb) || 0;
      this.fedHours = 0;
      this.insulin = clamp(this.insulin + 0.12 + 0.10 * clamp(carb / 3));
      return false;   // 让 vitals 也接这一口
    }
    if (ev.type === 'exert') {
      const lv = clamp(num(ev.level, 0.5));
      this.endorphin = clamp(this.endorphin + 0.25 * lv);
      this.gh = clamp(this.gh + 0.10 * lv);
      return false;
    }
    return false;
  }

  step(dt, ctx) {
    const hours = dt / 3600;
    const sec = dt;

    const v = ctx?.vitals ?? {};
    const en = ctx?.endocrine ?? {};
    const rh = ctx?.rhythm ?? {};
    const ho = ctx?.homeo ?? {};
    const br = ctx?.brain ?? {};

    const g = Number(v.glucose) || 5.0;
    const energy = Number(v.energy) || 0.75;
    const strain = Number(v.strain) || 0;
    const cortisol = Number(en.cortisol) || 0.2;
    const serotonin = Number(en.serotonin) || 0.5;
    const adrenaline = Number(en.adrenaline) || 0.05;
    const debt = Number(rh.debt) || 0;
    const asleep = !!rh.asleep;
    const clock = Number(rh.clock) || 0;
    const deficit = Number(ho.deficit) || 0;

    this.fedHours += hours;

    // 血糖在涨还是在掉（每小时的变化率）
    const dg = (g - this.lastGlucose) / Math.max(1e-6, hours);
    this.lastGlucose = g;

    // 夜里生长激素高，睡不好就少
    const dayFrac = (clock % 86400) / 86400;
    const night = clamp((0.5 + 0.5 * Math.cos(2 * Math.PI * (dayFrac - 0.5))) ** 2);

    const insTarget = clamp(0.18 + clamp(dg * 0.05, 0, 0.5) + 0.30 * clamp((g - 5.5) / 3) + 0.10 * cortisol);
    const leptTarget = clamp(0.12 + 0.78 * energy - 0.25 * clamp(cortisol - 0.2));
    const ghrelinTarget = clamp(
      0.15 + 0.55 * (1 - energy) + 0.25 * clamp(this.fedHours / 16) + 0.20 * clamp(debt / 6) - 0.15 * serotonin
    );
    const tshTarget = clamp(0.50 - 0.20 * clamp(cortisol * 2.5) - 0.10 * clamp(debt / 8) + 0.10 * clamp(energy - 0.5));
    const ghTarget = 0.06 + 0.45 * night * (asleep ? 1 : 0.15) + 0.12 * clamp(1 - energy);
    const endTarget = 0.12 + 0.30 * clamp(((Number(br.painMod) || 1) - 1) / 0.6) + 0.25 * clamp(adrenaline * 4);
    const rTarget = clamp(0.10 + 0.35 * clamp((this.insulin - 0.25) / 0.5) + 0.15 * (1 - energy));
    const kTarget = clamp(0.02 + 0.70 * clamp((this.fedHours - 12) / 24) * (1 - 0.8 * clamp((g - 4.5) / 2)));

    const near = (x, t, tau) => x + (t - x) * (1 - Math.exp(-sec / tau));
    this.insulin = clamp(near(this.insulin, insTarget, TAU.insulin));
    this.leptin = clamp(near(this.leptin, leptTarget, TAU.leptin));
    this.ghrelin = clamp(near(this.ghrelin, ghrelinTarget, TAU.ghrelin));
    this.tsh = clamp(near(this.tsh, tshTarget, TAU.tsh));
    this.gh = clamp(this.gh * 0.6 + ghTarget * 0.4);
    this.endorphin = clamp(near(this.endorphin, endTarget, TAU.endorphin));
    this.resist = clamp(near(this.resist, rTarget, TAU.resist));
    this.ketones = clamp(near(this.ketones, kTarget, TAU.ketones));

    // 缺水的时候血更稠，胰岛素按比例显得不够用
    if (deficit > 0.02) this.insulin = clamp(this.insulin * 1.004);
    if (strain > 0.6) this.ghrelin = clamp(this.ghrelin + 0.002 * hours * 60);
  }

  hungerDrive() {
    return clamp(0.75 * this.ghrelin + 0.35 * (1 - this.leptin) + 0.10 * (1 - this.tsh));
  }

  satietyDrive() {
    return clamp(0.60 * this.leptin + 0.25 * (1 - this.ghrelin) + 0.15 * this.insulin);
  }

  // 代谢率：甲状腺高就烧得快，抵抗高就烧不动
  energyUse() {
    return clamp(0.85 + 0.30 * (this.tsh - 0.5) - 0.20 * this.resist + 0.10 * this.gh);
  }

  read() {
    return {
      insulin: this.insulin,
      leptin: this.leptin,
      ghrelin: this.ghrelin,
      tsh: this.tsh,
      gh: this.gh,
      endorphin: this.endorphin,
      resist: this.resist,
      ketones: this.ketones,
      fedHours: this.fedHours,
      fasting: this.fedHours > 16,
      hunger: this.hungerDrive(),
      satiety: this.satietyDrive(),
      burn: this.energyUse(),
    };
  }

  dump() {
    const o = {};
    for (const k of ['insulin','leptin','ghrelin','tsh','gh','endorphin','resist','ketones','lastGlucose','fedHours']) o[k] = this[k];
    return o;
  }

  restore(o) {
    if (!o) return;
    for (const k in o) if (Number.isFinite(o[k])) this[k] = o[k];
  }
}
