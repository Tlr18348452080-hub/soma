import { Channel } from '../core.mjs';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const num = (x, d) => (Number.isFinite(Number(x)) ? Number(x) : d);

/**
 * 皮肤：伤口、出血、凝血、淤青、痒
 *
 * 出血不是"血量条在掉"，是压力差、凝血速度和伤口深度的三方拉扯。
 * 血止住之后才开始痒——那是身体说"在长"。
 */
export class Skin extends Channel {
  constructor() {
    super('skin');
    this.wounds = [];
    this.bruises = [];
    this.nextId = 1;
    this.scratch = 0;
    this.goose = 0;
    this.flush = 0;
    this.afterglow = 0;
  }

  apply(ev) {
    if (ev.type === 'cut') {
      const area = clamp(Number(ev.area) || 3, 0.2, 60);
      const depth = clamp(num(ev.depth, 0.25));
      this.wounds.push({
        id: this.nextId++,
        part: ev.part || 'forearm',
        area,
        depth,
        bleed: depth * area * 0.9,
        clot: 0,
        age: 0,
        itch: 0,
        scar: 0,
      });
      return true;
    }
    if (ev.type === 'bruise') {
      this.bruises.push({
        part: ev.part || 'thigh',
        force: clamp(num(ev.force, 0.5)),
        age: 0,
      });
      return true;
    }
    if (ev.type === 'scratch') {
      for (const w of this.wounds) {
        if (w.itch > 0.2) {
          w.itch = clamp(w.itch + 0.15);
          w.bleed += w.area * 0.01;
        }
      }
      this.scratch = clamp(this.scratch + 0.3);
      return true;
    }
    if (ev.type === 'bandage') {
      for (const w of this.wounds) if (w.clot > 0.2) w.bleed = 0;
      return true;
    }
    return false;
  }

  step(dt, ctx) {
    const hours = dt / 3600;
    const sbp = Number(ctx?.circulation?.sbp) || 115;
    const glucose = Number(ctx?.vitals?.glucose) || 5.0;
    const coreT = Number(ctx?.homeo?.coreT) || 36.6;
    const fear = Number(ctx?.brain?.fear) || 0;

    // 血压高，伤口出得更凶
    const pressure = 1 + clamp((sbp - 110) / 80, -0.3, 0.6);

    for (const w of this.wounds) {
      // 凝血：伤口越深越慢，血糖好一点会快一点
      const clotPerSec = (1 / (150 + 500 * w.depth)) * (1 + 0.3 * clamp(glucose / 6));
      w.clot = clamp(w.clot + clotPerSec * dt);
      w.bleed *= Math.exp(-dt / (900 * (1 + w.clot))) * pressure * (1 - 0.35 * w.clot);
      w.age += hours;

      // 愈合：浅的快，深的很慢
      const healPerDay = 0.35 / (1 + 2.2 * w.depth);
      const before = w.depth;
      w.depth = clamp(w.depth - (healPerDay * hours) / 24, 0, 1);
      if (before > 0 && w.depth === 0) w.scar = clamp(w.scar + (before > 0.4 ? 0.6 : 0.25));

      // 痒：结壳那几天最明显
      const crusty = w.clot > 0.25 && w.age < 3 + w.depth * 6;
      w.itch = clamp(w.itch + (crusty ? 0.05 : -0.08) * hours);
    }
    this.wounds = this.wounds.filter(
      (w) => !(w.depth <= 0 && w.bleed < 0.001 && w.clot > 0.9 && w.age > 7)
    );

    this.bruises = this.bruises.filter((b) => {
      b.age += hours;
      return b.age < 14 * 24;
    });

    // 冷和怕：起鸡皮。热和羞：脸发烫。都是皮肤在替身体说话。
    const cold = clamp((36.4 - coreT) / 1.2);
    this.goose = clamp(cold * 0.8 + fear * 0.5);
    this.flush = clamp(this.flush * Math.exp(-dt / 600) + 0.0);

    this.scratch *= Math.exp(-hours / 0.3);
    this.afterglow *= Math.exp(-hours / 0.5);
  }

  bleeding() {
    return this.wounds.reduce((s, w) => s + w.bleed, 0);
  }

  itch() {
    const open = this.wounds.reduce((s, w) => s + (w.depth > 0 ? w.itch * w.area : 0), 0);
    return clamp(open / 6 + this.scratch * 0.2);
  }

  bruiseMax() {
    return this.bruises.reduce((m, b) => Math.max(m, b.force), 0);
  }

  painGain() {
    const open = Math.min(1.5, this.bleeding());
    return 1 + 0.5 * open + 0.3 * this.bruiseMax();
  }

  read() {
    const bleeding = this.bleeding();
    const itch = this.itch();
    const bruise = this.bruiseMax();
    return {
      wounds: this.wounds.length,
      clot: this.wounds.reduce((m, w) => Math.max(m, w.clot), 0),
      bleeding,
      open: Math.min(1.5, bleeding),
      itch,
      scratched: this.scratch,
      bruises: this.bruises.length,
      bruise,
      goose: this.goose,
      afterglow: this.afterglow,
      care: bleeding > 0.2 || bruise > 0.5,
      painGain: this.painGain(),
    };
  }

  dump() {
    return {
      wounds: this.wounds.map((w) => ({ ...w })),
      bruises: this.bruises.map((b) => ({ ...b })),
      nextId: this.nextId,
      scratch: this.scratch,
      goose: this.goose,
      flush: this.flush,
      afterglow: this.afterglow,
    };
  }

  restore(o) {
    if (!o) return;
    if (Array.isArray(o.wounds)) this.wounds = o.wounds.map((w) => ({ ...w }));
    if (Array.isArray(o.bruises)) this.bruises = o.bruises.map((b) => ({ ...b }));
    for (const k of ['nextId', 'scratch', 'goose', 'flush', 'afterglow']) {
      if (Number.isFinite(o[k])) this[k] = o[k];
    }
  }
}
