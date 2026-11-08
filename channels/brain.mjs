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
    this.thalamicGate = 0.8; // 丘脑：上行信息能过多少
    this.intero = 0.3;       // 岛叶：内脏信号有多清楚
    this.inhibit = 0.7;      // 前额叶：压得住多少次级冲动
    this.conflict = 0;       // 前扣带：两股相反的劲儿同时大
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

    // ── 丘脑门控：注意力开着就放得多，累了就漏 ──
    // 丘脑不是简单的中转，它按觉醒和注意决定多少信息能上行 [S] 方向 / [A] 系数
    const vt = ctx?.vitals ?? null;
    const fat = vt?.fatigue ?? 0;
    const gateWant = clamp(0.55 + 0.55 * this.focusGain - 0.35 * fat, 0.15, 1);
    this.thalamicGate += (gateWant - this.thalamicGate) * Math.min(1, h / 8);

    // ── 岛叶：内感受的清晰度。焦虑会把它调高（心跳变得很响） ──
    const hr = vt?.hr ?? 70;
    const drive = clamp((hr - 70) / 60, 0, 1) * 0.6 + (vt?.hunger ?? 0) * 0.4;
    const interoWant = clamp(0.25 + drive * 0.6 + this.fear * 0.35, 0, 1);
    this.intero += (interoWant - this.intero) * Math.min(1, h / 30);

    // ── 前额叶：疲劳和恐惧都会削弱抑制 ──
    const inhibitWant = clamp(0.85 - 0.55 * fat - 0.25 * this.fear, 0.1, 1);
    this.inhibit += (inhibitWant - this.inhibit) * Math.min(1, h / 180);

    // ── 前扣带：做与不做两股劲儿同时大，就卡住 ──
    // 冲突 = 2·min(a,b)/(a+b)，两股越接近越大 [A]
    const a = clamp(fat * 0.7 + 0.2, 0, 1);          // 想停
    const b = clamp(1 - fat + this.fear * 0.3, 0, 1); // 想继续
    const conflictWant = (2 * Math.min(a, b)) / Math.max(1e-6, a + b);
    this.conflict += (conflictWant - this.conflict) * Math.min(1, h / 60);
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
      thalamicGate: this.thalamicGate,
      interoception: this.intero,
      inhibition: this.inhibit,
      conflict: this.conflict,
      focusBoost,
      otherCut,
    };
  }

  dump() {
    return {
      focus: this.focus, focusGain: this.focusGain,
      fear: this.fear, fearFast: this.fearFast, habituate: this.habituate,
      thalamicGate: this.thalamicGate, intero: this.intero, inhibit: this.inhibit,
      conflict: this.conflict, valence: this.valence,
      endorphin: this.endorphin, cpm: this.cpm,
    };
  }

  restore(o) {
    if (!o || typeof o !== 'object') return;
    // focus 可能是 null，单独处理
    if (o.focus === null || typeof o.focus === 'string') this.focus = o.focus;
    for (const k of ['focusGain', 'fear', 'fearFast', 'habituate', 'thalamicGate',
      'intero', 'inhibit', 'conflict', 'valence', 'endorphin', 'cpm']) {
      if (Number.isFinite(o[k])) this[k] = o[k];
    }
  }
}
