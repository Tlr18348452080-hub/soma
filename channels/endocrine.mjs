/**
 * channels/endocrine.mjs — 激素层
 *
 * 激素不是信号，是参数。
 *
 * 神经是快信号：毫秒级、点到点、送的是「哪里、多强」。
 * 激素是慢调制：分钟到小时、全身广播、**改的不是内容，是增益和阈值**。
 * 皮质醇高不会让你「收到一条疼的消息」，它让你对同样的碰更疼；
 * 多巴胺高不会让你「收到一条快乐的消息」，它让同样的东西更值钱。
 *
 * 所以这一层在代码里只做两件事：
 *   1. 改别的通道的常数（P50、舒适增益），不往感知里塞东西
 *   2. 改请求参数（输出预算），不改它说什么
 *
 * 它永远不出现在 [body] 正文里。写进正文就变成「多巴胺 0.3」这种事实，
 * 模型会照着念——那退回到我们刚修掉的那个坑。
 *
 * 常数分级：时间常数 [A] 量级对，具体值 [G]。
 */

import { Channel } from '../core.mjs';

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

// 基线。人是不会归零的——皮质醇有晨峰，多巴胺有紧张性水平 [A]
const BASE = { cortisol: 0.20, adrenaline: 0.05, dopamine: 0.45 };

// 一阶回归的时间常数（秒）
const TAU = {
  cortisol: 2400,   // 40 分钟。HPA 轴慢，还得穿过血脑屏障 [A]
  adrenaline: 120,  // 2 分钟。交感神经，来得快去得也快 [A]
  dopamine: 720,    // 12 分钟。紧张性（tonic）水平，不是相位性放电 [A]
};

export class Endocrine extends Channel {
  constructor() {
    super('endocrine');
    this.cortisol = BASE.cortisol;
    this.adrenaline = BASE.adrenaline;
    this.dopamine = BASE.dopamine;
    this.baseCortisol = BASE.cortisol;
    this.stressLoad = 0;   // 累积应激，慢变量。痛觉敏化跟它走，不跟瞬时皮质醇走
  }

  apply(ev) {
    switch (ev.type) {
      case 'stress': {
        // 急性应激：皮质醇慢慢起，肾上腺素立刻起
        const l = clamp(Number(ev.level ?? 0.5), 0, 1);
        this.cortisol = clamp(this.cortisol + l * 0.10, 0, 1);
        this.stressLoad = clamp(this.stressLoad + l * 0.30, 0, 1);
        this.adrenaline = clamp(this.adrenaline + l * 0.45, 0, 1);
        return true;
      }
      case 'reward': {
        // 奖励预测误差的代理。
        // 真 RPE 是 r − V(s)，得有 reward 函数；我们没有，只能用外部事件当代理。
        // 这一条是 [G]，别当多巴胺的机理看。
        const a = clamp(Number(ev.amount ?? 0.5), 0, 1);
        this.dopamine = clamp(this.dopamine + a * 0.25, 0, 1);
        return true;
      }
      case 'exert': {
        const l = clamp(Number(ev.level ?? 0.5), 0, 1);
        this.adrenaline = clamp(this.adrenaline + l * 0.5, 0, 1);
        return true;
      }
      default:
        return false;
    }
  }

  step(h, ctx) {
    // 持续的痛会把皮质醇顶上去——这是真的，也是为什么慢性痛会越拖越敏感
    const t = ctx?.touch;
    if (Array.isArray(t)) {
      let pain = 0;
      for (const r of t) if (r.pain > pain) pain = r.pain;
      if (pain > 0.15) {
        this.cortisol = clamp(this.cortisol + pain * 0.0004 * h, 0, 1);
        this.stressLoad = clamp(this.stressLoad + pain * 0.0008 * h, 0, 1);
      }
    }

    // 皮质醇的基线不是常数——它跟着昼夜节律走，醒后半小时有个晨峰
    this.baseCortisol = BASE.cortisol * (ctx?.rhythm?.cortisolMod ?? 1);
    this.stressLoad += (0 - this.stressLoad) * Math.min(1, h / 10800);
    for (const k of ['cortisol', 'adrenaline', 'dopamine']) {
      const b = k === 'cortisol' ? this.baseCortisol : BASE[k];
      this[k] += (b - this[k]) * Math.min(1, h / TAU[k]);
    }
  }

  read() {
    // 增益按「基线 = 1.0」归一化，这样没激素的时候身体还是原来的身体
    // 痛觉敏化跟「累积应激」走，不跟瞬时皮质醇走。
    // 这样晨峰不会把人变敏感——正常起床不是创伤。
    const painGain = clamp(1 + 1.2 * this.stressLoad, 0.8, 2.2);
    const comfortGain = clamp(0.40 + 1.33 * this.dopamine, 0.40, 1.60);
    // 基线 = 1.0：多巴胺掉一截就提不起劲，皮质醇升一截就做什么都费劲
    const motivation = clamp(1 + 1.0 * (this.dopamine - BASE.dopamine) - 0.9 * (this.cortisol - BASE.cortisol), 0.15, 1.15);
    return {
      cortisol: this.cortisol,
      adrenaline: this.adrenaline,
      dopamine: this.dopamine,
      painGain,
      comfortGain,
      motivation,
      alert: this.adrenaline,
      stressLoad: this.stressLoad,
    };
  }
}
