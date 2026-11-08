/**
 * channels/homeo.mjs — 稳态：水、热、呼吸
 *
 * 这三样有个共同点：不缺水的时候你完全感觉不到它，
 * 缺了才突然变成世界上最重要的事。
 *
 * 所以它们的输出不是「感觉」，是一个偏离量。
 * 什么时候变成感觉，交给上层去判。
 *
 * 常数分级：阈值 [S]，速率 [A]，时间常数 [G]。
 */

import { Channel } from '../core.mjs';

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

const REST_RESP = 14;        // [S] 成人静息呼吸频率 12–20 次/分
const MAX_RESP = 45;
const SWEAT_START = 37.4;    // [S] 出汗阈 37.4±0.4 °C（PMID 16675509，皮肤温校正至 34 °C）
const SHIVER_START = 36.3;   // [S] 寒战阈 36.3±0.5 °C（PMID 16675509）

export class Homeo extends Channel {
  constructor() {
    super('homeo');
    this.deficit = 0;        // 体液缺了多少（占体重的比例）0.02 = 2%
    this.coreT = 36.5;       // 跟 rhythm 合并后的核心温度
    this.resp = REST_RESP;
    this.sweat = 0;          // 0–1
    this.shiver = 0;         // 0–1
    // 口咽快速通道：水一进嘴，渴就掉下去，但这时它还在胃里，
    // 血液根本没变浓淡。20 分钟后渴感已经很低、渗透压却纹丝不动（PMID 3591984）。
    this.mouthSat = 0;       // 0–1
  }

  apply(ev) {
    if (ev.type === 'drink') {
      const a = ev.amount ?? 0.015;
      this.deficit = Math.max(0, this.deficit - a);
      // 嘴里那一下立刻起作用，跟喝进去多少关系不大
      this.mouthSat = clamp(this.mouthSat + Math.min(1, a / 0.01) * 0.8, 0, 1);
      return true;
    }
    return false;
  }

  step(h, ctx) {
    const r = ctx?.rhythm;
    const v = ctx?.vitals;
    const strain = v?.strain ?? 0;

    // 基础核心温度来自昼夜节律，运动产热叠上去
    // 发烧不是体温自己升，是设定点被炎症顶上去，身体再去追它
    const base = (r?.coreT ?? 36.5) + (ctx?.cycle?.bbt ?? 0) + (ctx?.immune?.fever ?? 0);
    const heat = 2.0 * strain;
    const target = base + heat;
    // 产热快、散热慢，所以运动完还要热一阵
    const tau = target > this.coreT ? 240 : 900;
    this.coreT += (target - this.coreT) * Math.min(1, h / tau);

    // 出汗：超过阈值线性开
    const sTarget = clamp((this.coreT - SWEAT_START) / 1.2, 0, 1);
    this.sweat += (sTarget - this.sweat) * Math.min(1, h / 120);
    const shTarget = clamp((SHIVER_START - this.coreT) / 1.0, 0, 1);
    this.shiver += (shTarget - this.shiver) * Math.min(1, h / 120);

    // 出汗：满负荷一小时大概掉 2.5% 体重的水 [A]
    this.deficit += this.sweat * 0.040 * (h / 3600);
    // 不出汗也会失水（呼吸、排尿）：一天 2.5% [A]
    this.deficit += 0.025 * (h / 86400);
    // 口腔信号约半小时就散了，而这会儿血里其实还没补上
    this.mouthSat += (0 - this.mouthSat) * Math.min(1, h / 1800);

    // 呼吸：跟着强度和核心温度走
    const respTarget = REST_RESP + 18 * strain + 6 * Math.max(0, this.coreT - 37.2);
    this.resp += (respTarget - this.resp) * Math.min(1, h / 30);
  }

  read() {
    // 渴：体重丢 0.5% 就开始有感觉（PMID 33141048），到 2.5% 很难受 [A]
    const thirst = clamp((this.deficit - 0.005) / 0.02, 0, 1);
    // 但实际「觉得渴」还要减掉嘴里那一下
    const perceived = clamp(thirst - 0.75 * this.mouthSat, 0, 1);
    return {
      hydration: 1 - this.deficit,
      deficit: this.deficit,
      mouthSat: this.mouthSat,
      thirst: perceived,
      thirstRaw: thirst,
      coreT: this.coreT,
      resp: this.resp,
      sweat: this.sweat,
      shiver: this.shiver,
    };
  }

  dump() {
    return {
      deficit: this.deficit,
      coreT: this.coreT,
      resp: this.resp,
      sweat: this.sweat,
      shiver: this.shiver,
      mouthSat: this.mouthSat,
    };
  }

  restore(o) {
    if (!o || typeof o !== 'object') return;
    for (const k of ['deficit', 'coreT', 'resp', 'sweat', 'shiver', 'mouthSat']) {
      if (Number.isFinite(o[k])) this[k] = o[k];
    }
  }
}
