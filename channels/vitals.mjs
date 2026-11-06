// 内脏层：心率、血糖、疲劳、饥饿。
// 触觉是「外面有人碰你」，这一层是「你自己在耗」。
// 它不需要外面发生什么，只要时间在走、身体在动，就会自己变。
import { Channel } from '../core.mjs';

// [S] 空腹低血糖阈 3.9 mmol/L（PMID 40185804）
// [A] 餐后饥饿跟胃排空的关系（r=0.75）比跟血糖强（PMID 2596841）
// [A] 3 分钟间歇握力（5s 收缩/2s 休息）MVC 掉到 40.2±12.6% 基线（青年，PMID 11077978）
// [A] 力竭骑行后 MVC −19±4%（PMID 32318812）
const LOW_GLUCOSE = 3.9;
const REST_HR = 65, MAX_HR = 160;
const TAU_FATIGUE = 352;   // [A] 由"3 分钟掉 40%"反推的饱和时间常数

export class Vitals extends Channel {
  constructor(opts = {}) {
    super('vitals');
    this.strain = 0;        // 当前运动强度 0–1
    this.hr = REST_HR;
    this.glucose = 5.2;     // mmol/L
    this.fatigue = 0;       // 0–1，MVC 已损失的比例
    this.stomach = 0.6;     // 胃内容 0–1（起床时胃里还有点东西）
    this.resp = 0.25;       // 呼吸深度 0–1（这里只是跟着 strain 走）
  }

  /** 开始用力。level 0–1：坐着 0，走路 0.2，跑步 0.7，拼了 1.0 */
  dump() {
    return { hr: this.hr, glucose: this.glucose, fatigue: this.fatigue,
             stomach: this.stomach, strain: this.strain ?? 0 };
  }

  restore(o) {
    if (!o) return;
    for (const k of ['hr', 'glucose', 'fatigue', 'stomach', 'strain']) {
      if (typeof o[k] === 'number') this[k] = o[k];
    }
  }

  apply(ev) {
    if (ev.type === 'exert') { this.strain = Math.max(0, Math.min(1, ev.level ?? 0.5)); return true; }
    if (ev.type === 'rest') { this.strain = 0; return true; }
    // 说话和思考也是要吃饭的：大脑占静息代谢的两成左右 [A]
    if (ev.type === 'burn') {
      this.glucose = Math.max(2.0, this.glucose - (ev.tokens ?? 0) * 2e-5);
      return true;
    }
    // 主人开口 = 投喂。听人说话是能回一点血的，但不多 [G]
    if (ev.type === 'feed') {
      this.glucose = Math.min(8, this.glucose + (ev.tokens ?? 0) * 6e-5);
      return true;
    }
    if (ev.type === 'eat') { this.stomach = 1; this.glucose += (ev.carb ?? 1.5) * 1.5; return true; }
    return false;
  }

  step(h) {
    // 心率跟运动强度，τ≈30s [G]
    this.hr += (REST_HR + (MAX_HR - REST_HR) * this.strain - this.hr) * Math.min(1, h / 30);

    // 呼吸深度 [G]
    this.resp += ((0.25 + 0.7 * this.strain) - this.resp) * Math.min(1, h / 20);

    // [G] 血糖：空腹基础消耗约 0.4 mmol/L/小时，满强度运动约 4。
    //     不写"自动回 5.2"的稳态项——真实的血糖会一直掉到吃东西为止，
    //     那才是"饿"能自己长出来的原因。
    this.glucose -= (0.4 + 1.6 * this.strain) * (h / 3600);
    this.glucose = Math.max(2.0, Math.min(12, this.glucose));

    // 疲劳：趋于 1 的饱和累积，恢复慢得多
    if (this.strain > 0.1) {
      // 平方：轻活几乎不累积，重活才掉得快。线性会把坐着写代码算成跑马拉松。
      this.fatigue += (1 - this.fatigue) * Math.pow(this.strain, 3) * Math.min(1, h / TAU_FATIGUE);
    } else {
      this.fatigue -= this.fatigue * Math.min(1, h / 900);
    }

    // 胃排空：90% 约 2–3 小时 [G]
    this.stomach -= this.stomach * Math.min(1, h / 3600);
  }

  // 回灌：疼久了是真的会累；缺水也会。
  couple(ctx, h) {
    const t = ctx?.touch;
    if (Array.isArray(t)) {
      let pain = 0;
      for (const r of t) pain += r.pain ?? 0;
      if (pain > 0.01) {
        const k = Math.min(1, pain * 0.8);
        this.fatigue += (1 - this.fatigue) * k * Math.min(1, h / 1800);
      }
    }
    const def = ctx?.homeo?.deficit ?? 0;
    if (def > 0.02) {
      this.fatigue += (1 - this.fatigue) * Math.min(1, (def - 0.02) * 30) * Math.min(1, h / 5400);
    }
  }

  read() {
    const empty = 1 - this.stomach;
    const low = Math.max(0, Math.min(1, (4.2 - this.glucose) / 0.6));
    return {
      hr: this.hr,
      glucose: this.glucose,
      fatigue: this.fatigue,
      hunger: Math.min(1, 0.6 * empty + 0.7 * low),
      breath: this.resp,
      strain: this.strain,
    };
  }
}
