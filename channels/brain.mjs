/**
 * channels/brain.mjs — 跟身体直接咬合的那几圈回路
 *
 * 这一层不改感知的内容，改的是「哪些进来的东西更响」。
 * 注意是把增益往一处拧，恐惧是把整条通路的音量调高，
 * 而持续的痛会反过来把门关上——那叫下行抑制。
 *
 * 三样东西在真实大脑里各有自己的核团，这里只保留了它们对身体的作用。
 * 常数分级见 SOURCES.md。
 */

import { Channel } from '../core.mjs';

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

export class Brain extends Channel {
  constructor() {
    super('brain');
    this.focus = null;      // 注意落在哪个部位
    this.focusGain = 0;     // 0–1
    this.fear = 0.05;       // 恐惧/警觉 0–1（慢通路，经皮层，认得准）
    this.fearFast = 0.05;   // 快速通路：丘脑直连杏仁核，二十来毫秒就到了，但粗
    this.habituate = 0;     // 海马：同一个情境反复来，反应往下走
    this.valence = 0;       // 效价 −1…+1
    this.endorphin = 0;     // 内源性镇痛 0–1
    this.cpm = 0;           // 下行抑制（条件性疼痛调制）0–1
  }

  apply(ev) {
    switch (ev.type) {
      case 'focus':
        this.focus = ev.region ?? null;
        this.focusGain = clamp(Number(ev.strength ?? 0.6), 0, 1);
        return true;
      case 'threat': {
        const l = clamp(Number(ev.level ?? 0.5), 0, 1);
        this.fear = clamp(this.fear + l * 0.5, 0, 1);
        // 快通路先到：幅度打折（分不清是不是真威胁），但不看情面 [S] 方向 / [A] 系数
        this.fearFast = clamp(this.fearFast + l * 0.8, 0, 1);
        this.valence = clamp(this.valence - l * 0.3, -1, 1);
        return true;
      }
      case 'soothe':
        // 冷压之类的强刺激会把下行抑制打开：压力痛阈抬 +66%、
        // 主观痛强度降 41.5%，效果还能再挂 20–32 分钟（PMID 29913755 / 33987521）
        this.cpm = clamp(this.cpm + 0.7, 0, 1);
        this.fear = clamp(this.fear - 0.3, 0, 1);
        this.valence = clamp(this.valence + 0.25, -1, 1);
        return true;
      case 'reward':
        this.valence = clamp(this.valence + 0.2, -1, 1);
        return false;   // 不独占，多巴胺那边也要收
      default:
        return false;
    }
  }

  step(h, ctx) {
    // 注意会自己漂走——没有新东西盯着，几十秒就散了
    if (this.focusGain > 0) {
      this.focusGain = clamp(this.focusGain - h / 45, 0, 1);
      if (this.focusGain <= 0) this.focus = null;
    }
    // 恐惧消退得慢
    this.fear += (0.05 - this.fear) * Math.min(1, h / 600);
    // 快通路没有皮层帮忙确认，几十秒就散了 [A]
    this.fearFast += (this.fear - this.fearFast) * Math.min(1, h / 25);
    // 海马的习惯化：反复的、无后果的威胁慢慢不再引起反应
    this.habituate += (this.fear - this.habituate) * Math.min(1, h / 900);
    this.fearFast = clamp(this.fearFast - this.habituate * 0.15, 0, 1);
    this.valence += (0 - this.valence) * Math.min(1, h / 900);

    // 下行抑制：持续的痛会把自己的门关小一点，也关别的门 [A]
    const t = ctx?.touch;
    let pain = 0;
    if (Array.isArray(t)) for (const r of t) if (r.pain > pain) pain = r.pain;
    const target = clamp(pain * 0.6, 0, 0.6);
    this.endorphin += (target - this.endorphin) * Math.min(1, h / 120);
    this.cpm += (0 - this.cpm) * Math.min(1, h / 1200);
  }

  read() {
    // 注意某处：那里变响，别处被压下去
    const focusBoost = 1 + 0.9 * this.focusGain;
    const otherCut = 1 - 0.35 * this.focusGain;
    return {
      focus: this.focus,
      focusGain: this.focusGain,
      fear: this.fear,
      fearFast: this.fearFast,
      habituate: this.habituate,
      valence: this.valence,
      endorphin: this.endorphin,
      // 乘在别的通道上
      cpm: this.cpm,
      painMod: (1 + 0.8 * this.fear) * (1 - 0.5 * this.endorphin) * (1 - 0.4 * this.cpm),
      alertBoost: 0.3 * Math.max(this.fear, this.fearFast * 0.8),
      focusBoost,
      otherCut,
    };
  }
}
