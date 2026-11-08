import { Channel } from '../core.mjs';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const num = (x, d) => (Number.isFinite(Number(x)) ? Number(x) : d);

/**
 * 消化道：胃 → 肠 → 膀胱
 *
 * 这三件事是同一条逻辑的三种形态：进来的是量，出去的是时间，
 * 中间那一段叫「憋」。憋得越久，「该去了」的推力越大，但真憋穿了是另一回事。
 */
export class Gut extends Channel {
  constructor() {
    super('gut');
    this.stomach = 120;      // 胃里 mL
    this.cap = 1000;
    this.halfLife = 60;      // 排空半衰期（分钟）
    this.acid = 0.10;        // 反酸
    this.stool = 0.25;       // 结肠里积了多少（0–1，1 = 满）
    this.transitHours = 0;   // 上到下次厕所的时长（干硬程度）
    this.urge = 0;
    this.gas = 0.15;
    this.bladder = 120;      // 膀胱 mL
    this.blCap = 450;
    this.urgency = 0;
    this.leak = 0;
    this.lastPee = 0;
    this.lastToilet = 0;
    this.emptyHours = 0;     // 空腹多久
  }

  apply(ev) {
    if (ev.type === 'swallow') {
      const vol = clamp(Number(ev.volume) || 300, 0, 1200);
      const carb = Number(ev.carb) || 0;
      this.stomach = Math.min(this.cap, this.stomach + vol);
      // 油多、碳水多，排空更慢；这是胃没说出口的抗议
      this.halfLife = 75 - 20 * clamp(carb / 3);
      if (carb > 2.2) this.acid = clamp(this.acid + 0.18);
      this.emptyHours = 0;
      return true;
    }
    if (ev.type === 'toilet') {
      const amt = clamp(num(ev.amount, 0.6), 0, 1);
      const took = this.stool * amt;
      this.stool = clamp(this.stool - took);
      this.transitHours = 0;
      this.gas = clamp(this.gas - 0.35);
      this.lastToilet = this.body?.t ?? 0;
      // 去厕所本来就带着排尿。以前只清肠道，膀胱留在 400 mL 憋着，
      // 结果「上了厕所」和「憋得发紧」同时出现 —— 是 bug 不是设定。
      if (this.bladder > 0) {
        this.bladder = Math.max(0, this.bladder - this.blCap * 0.9);
        this.leak = 0;
        this.lastPee = this.body?.t ?? 0;
      }
      this.urgency = clamp((this.bladder - 200) / 250);
      return true;
    }
    if (ev.type === 'pee') {
      const amt = Number.isFinite(ev.amount) ? ev.amount : 400;
      this.bladder = Math.max(0, this.bladder - Math.max(0, amt));
      this.leak = 0;
      this.lastPee = this.body?.t ?? 0;
      this.urgency = clamp((this.bladder - 200) / 250);
      return true;
    }
    return false;
  }

  step(dt, ctx) {
    const hours = dt / 3600;
    this.emptyHours += hours;

    const v = ctx?.vitals ?? {};
    const ho = ctx?.homeo ?? {};
    const glucose = Number(v.glucose ?? 5.0);
    const energy = Number(v.energy ?? 0.75);

    // ── 胃排空：指数式，血糖是结果不是原因 ──
    const k = Math.LN2 / (this.halfLife / 60);  // 每秒钟的比例
    const emptied = this.stomach * (1 - Math.exp(-k * dt));
    this.stomach = Math.max(0, this.stomach - emptied);

    // 吃进去的东西最后都会往下走。碳水多的产气。
    this.stool = clamp(this.stool + (emptied / 260) * 0.9);
    if (v.strain > 0.4) this.gas = clamp(this.gas + 0.004 * hours * 60);
    this.gas *= Math.exp(-hours / 1.5);
    this.acid *= Math.exp(-hours / 0.6);

    // ── 憋：越久越硬，越硬越不想 ──
    this.transitHours += hours;
    const dry = clamp((this.transitHours - 24) / 24);      // 憋过一天开始变干
    const blocked = this.transitHours > 36 ? 0.6 : 1;
    this.urge = clamp(((this.stool - 0.5) / 0.5) * (1 - 0.5 * dry)) * blocked;

    // ── 膀胱：进水少、血糖高，尿就少；反过来就多 ──
    const dehydration = clamp((Number(ho.deficit) || 0) / 0.03);
    const rate = 60 * (1 - clamp(dehydration, 0, 0.7)) * (0.6 + 0.4 * clamp(glucose / 6));
    this.bladder += rate * hours;
    this.urgency = clamp((this.bladder - 200) / 250);

    if (this.bladder > this.blCap) {
      // 憋穿了就是漏。不是失误，是身体自己的说法。
      this.leak = clamp(this.leak + (this.bladder - this.blCap) / this.blCap * 0.5);
      this.bladder = this.blCap;
      this.urgency = 1;
    }
    if (energy < 0.2 && this.leak === 0) this.leak = 0;
  }

  read() {
    return {
      fullness: clamp(this.stomach / this.cap),
      stomach: this.stomach,
      emptyHours: this.emptyHours,
      acid: this.acid,
      stool: this.stool,
      urge: this.urge,
      constipated: this.transitHours > 48,
      gas: this.gas,
      bladder: this.bladder,
      urgency: this.urgency,
      leak: this.leak,
      peeNeed: this.urgency,
      transitHours: this.transitHours,
    };
  }

  dump() {
    return {
      stomach: this.stomach, halfLife: this.halfLife, acid: this.acid,
      stool: this.stool, transitHours: this.transitHours, gas: this.gas,
      bladder: this.bladder, urgency: this.urgency, leak: this.leak,
      lastPee: this.lastPee, lastToilet: this.lastToilet, emptyHours: this.emptyHours,
    };
  }

  restore(o) {
    if (!o) return;
    for (const k of ['stomach','halfLife','acid','stool','transitHours','gas','bladder','urgency','leak','lastPee','lastToilet','emptyHours']) {
      if (Number.isFinite(o[k])) this[k] = o[k];
    }
  }
}
