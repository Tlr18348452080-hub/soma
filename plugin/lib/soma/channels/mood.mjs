/**
 * channels/mood.mjs — 心情
 *
 * 心情不是一种激素，是好几样东西的合成结果。
 * 血清素低、多巴胺低、睡不够、饿着——任何一样都能把心情往下拽，
 * 但它们合起来的效果不是相加，是被最差的那一项压住。
 *
 * 所以这里用两个轴：
 *   valence（-1 … 1）  —— 好受不好受
 *   arousal（0 … 1）   —— 绷着还是松着
 * 二维模型（Russell 的 circumplex）比「开心/难过」一个轴能多装下很多状态：
 * 同样 valence=0，可以是「平静」，也可以是「烦但没劲」。
 *
 * 这一层不产生新信息，它是别的层的和。改别的层，它就跟着动。
 *
 * 关于权重：这一版的激素权重是**故意调低**的。
 * 文献里激素对情绪的直接效应都很小——催产素对社会认知 g≈0.29（PMID 23575742），
 * n=532 的等效检验直接判定「小到不值得研究」（PMID 41880977）；
 * 皮质醇与瞬时负性情绪 r≈.06（PMID 33662445），孟德尔随机化里皮质醇→抑郁 OR 1.02 跨 1（PMID 38525495）。
 * 真正稳的是状态变量：睡不够、疼、饿。所以重量压在它们身上，激素只是微调。
 * 这一层是 [G]，别当剂量-反应关系看。
 */

import { Channel } from '../core.mjs';

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

// 心情变得比激素快，但比触觉慢
const TAU_VALENCE = 900;   // 15 分钟 [G]
const TAU_AROUSAL = 600;   // 10 分钟 [G]

export class Mood extends Channel {
  constructor() {
    super('mood');
    this.valence = 0.1;
    this.arousal = 0.35;
  }

  apply() { return false; }   // 只读别的通道，不接事件

  step(h, ctx) {
    const e = ctx?.endocrine ?? {};
    const v = ctx?.vitals ?? {};
    const t = ctx?.touch;
    const br = ctx?.brain ?? {};

    let pain = 0;
    if (Array.isArray(t)) for (const r of t) if (r.pain > pain) pain = r.pain;

    const ser = (e.serotonin ?? 0.5) - 0.5;
    const dop = (e.dopamine ?? 0.45) - 0.45;
    const oxy = (e.oxytocin ?? 0.3) - 0.3;

    // 正向项：三项都是「相对基线」的偏离——心情住在变化里，不住在绝对值里
    let target = 0.18
      + 0.45 * ser
      + 0.55 * dop
      + 0.45 * oxy;

    // 负向项：压得更狠。丢东西比得到同样的东西更重（损失厌恶，方向 [S]）
    target -= 1.00 * (e.stressLoad ?? 0);
    target -= 0.70 * pain;
    target -= 0.85 * (v.fatigue ?? 0);
    target -= 0.55 * clamp(((v.hunger ?? 0) - 0.55) / 0.45, 0, 1);
    target -= 0.45 * (br.fear ?? 0);
    // 夜里本来就低。昼夜对心情有独立的那一路，跟累不累无关 [S]
    target -= 0.15 * (1 - (ctx?.rhythm?.alert ?? 1));
    // 生病那天的低落是一整套行为反应，不是「心情不好」
    target -= 0.80 * (ctx?.immune?.sickness ?? 0);
    this.valence += (clamp(target, -1, 1) - this.valence) * Math.min(1, h / TAU_VALENCE);

    // 唤醒轴：绷不绷。肾上腺素和警觉拉高，疲劳和困把下限按住
    let ar = 0.20
      + 0.85 * (e.adrenaline ?? 0.05)
      + 0.40 * clamp(((e.cortisol ?? 0.2) - (e.baseCortisol ?? 0.2)) * 4, -0.5, 1)
      + 0.30 * (br.fear ?? 0);
    ar -= 0.45 * (v.fatigue ?? 0);
    this.arousal += (clamp(ar, 0, 1) - this.arousal) * Math.min(1, h / TAU_AROUSAL);
  }

  /** 「烦躁」不是 valence 低，是 valence 低 + arousal 高 + 还有力气。 */
  get irritability() {
    return clamp((-this.valence) * 0.6 + (this.arousal - 0.45) * 0.8, 0, 1);
  }

  read() {
    return {
      valence: this.valence,
      arousal: this.arousal,
      irritability: this.irritability,
    };
  }
}
