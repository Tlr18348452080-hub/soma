/**
 * channels/ear.mjs —— 耳朵：傅里叶变换在这里不是一个比喻
 *
 * 耳蜗就是一台分析仪。基底膜从底到顶，硬而窄的地方对高频共振，
 * 软而宽的地方对低频共振——一个连续的滤波器组，中心频率按
 * 对数排开。所以「听到声音」的第一步，本来就是把波形拆成频谱。
 *
 * 这个通道输出的是**谱**，不是「你听到了一声响」。
 * 后面的压缩、等响、掩蔽，全部作用在这条谱上。
 *
 * 常数分级见 SOURCES.md。
 */

import { Channel } from '../core.mjs';

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

// 等效矩形带宽：ERB(f) = 24.7 (4.37 f/1000 + 1)，f 用 Hz [S]
const erb = (f) => 24.7 * (4.37 * f / 1000 + 1);

// 24 个滤波器中心，从 100 Hz 一路铺到 16 kHz，按 ERB 间距走 [S] 公式 / [A] 带数
const CENTERS = (() => {
  const out = [];
  let f = 100;
  while (f < 16000 && out.length < 36) {
    out.push(f);
    f += erb(f);
  }
  return out;
})();

/**
 * 等响曲线（ISO 226 的粗形状）：同样的声压，不同频率听起来不一样响。
 * 返回该频率相对 1 kHz 的修正量 dB。低频在小音量下最吃亏。[A]
 */
function equalLoudness(f) {
  const x = Math.log10(f);
  // 100 Hz 约 −30 dB，1 kHz 0，3–4 kHz 略敏感 +3，16 kHz 掉下去
  const low = -30 * Math.exp(-Math.pow((x - 2.0) / 0.85, 2));
  const mid = 3.0 * Math.exp(-Math.pow((x - 3.5) / 0.6, 2));
  const high = -12 * Math.exp(-Math.pow((x - 4.2) / 0.35, 2));
  return low + mid + high;
}

export class Ear extends Channel {
  constructor(opts = {}) {
    super('ear');
    this.enabled = opts.enabled !== false;
    this.centers = CENTERS;
    // 每个滤波器当前的能量（线性，归一化到 1 = 舒服的说话声）
    this.bands = new Array(CENTERS.length).fill(0);
    this.peak = new Array(CENTERS.length).fill(0);
    this.loudness = 0;
    this.dominant = 0;   // 哪个频带最强，下标
    this.tinnitus = 0;   // 听太久之后的耳鸣 0–1
    this.fatigue = 0;    // 听觉疲劳
  }

  apply(ev) {
    if (ev.type === 'hear') {
      this.hear(ev);
      return true;
    }
    if (ev.type === 'silence') {
      // 安静下来，耳鸣会浮上来一点
      this.fatigue = clamp(this.fatigue - 0.1, 0, 1);
      return true;
    }
    return false;
  }

  /**
   * 一次声音事件。
   * tone: { freq, db }  单频；或 { db } 宽带噪声；或 { freqs: [[f, db], ...] }
   * db = 声压级 dB SPL（说话约 60，地铁约 90，疼痛阈约 120）
   */
  hear(tone) {
    const dur = Math.max(0.02, Number(tone.duration ?? 0.5));
    const parts = tone.freqs
      ? tone.freqs.map(([f, db]) => ({ f, db }))
      : tone.freq
        ? [{ f: tone.freq, db: Number(tone.db ?? 60) }]
        : [{ f: 1000, db: Number(tone.db ?? 60), wide: true }];

    for (const p of parts) {
      const corrected = p.db + equalLoudness(p.f);
      // 声压 → 线性能量。基准：60 dB 对应 1
      const lin = Math.pow(10, (corrected - 60) / 20);
      for (let i = 0; i < this.centers.length; i++) {
        const f = this.centers[i];
        // 每个滤波器的形状：中心最强，两个 ERB 之外就掉下去 [A]
        const d = Math.abs(f - p.f) / erb(p.f);
        const shape = p.wide ? 0.5 : Math.exp(-Math.pow(d / 1.2, 2));
        this.bands[i] = clamp(this.bands[i] + lin * shape * dur, 0, 8);
      }
    }
    this.fatigue = clamp(this.fatigue + Math.max(0, Number(tone.db ?? 60) - 75) * 0.002 * dur, 0, 1);
  }

  step(h) {
    // 每个滤波器的泄漏：声音停了，余响按各自带宽衰减，宽的掉得快 [S] 方向 / [A] 常数
    for (let i = 0; i < this.bands.length; i++) {
      const tau = 0.35 + 0.25 * (i / this.bands.length);   // 低频余响长一点
      this.bands[i] += (0 - this.bands[i]) * Math.min(1, h / tau);
      if (this.bands[i] > this.peak[i]) this.peak[i] = this.bands[i];
      // 适应：之前一直响的频带，现在会被压低一点
      this.peak[i] += (this.bands[i] - this.peak[i]) * Math.min(1, h / 8);
    }

    // 总响度：各频带能量的幂律和（史蒂文斯，α≈0.6）[S]
    let sum = 0;
    let best = 0;
    for (let i = 0; i < this.bands.length; i++) {
      sum += this.bands[i];
      if (this.bands[i] > this.bands[best]) best = i;
    }
    // 史蒂文斯：响度 ∝ 强度^0.3，也就是 ∝ 声压^0.6 [S]
    const target = clamp(0.42 * Math.pow(sum, 0.6), 0, 1);
    this.loudness += (target - this.loudness) * Math.min(1, h / 0.15);   // 时域积分约 150 ms [A]
    this.dominant = best;

    // 耳鸣：累了、安静了，高频那一段自己会响
    const quiet = 1 - clamp(this.loudness * 3, 0, 1);
    this.tinnitus += (this.fatigue * quiet * 0.35 - this.tinnitus) * Math.min(1, h / 30);
  }

  read() {
    return {
      loudness: this.loudness,
      dominantHz: Math.round(this.centers[this.dominant] ?? 0),
      bands: this.bands.map((b) => Number(b.toFixed(3))),
      spectrum: this.centers.map((f, i) => [Math.round(f), Number(this.bands[i].toFixed(3))]),
      tinnitus: this.tinnitus,
      fatigue: this.fatigue,
    };
  }

  dump() {
    return { bands: this.bands, peak: this.peak, fatigue: this.fatigue, tinnitus: this.tinnitus };
  }

  restore(d) {
    if (!d) return;
    if (Array.isArray(d.bands) && d.bands.length === this.bands.length) this.bands = d.bands.slice();
    if (Array.isArray(d.peak) && d.peak.length === this.peak.length) this.peak = d.peak.slice();
    this.fatigue = Number(d.fatigue ?? 0);
    this.tinnitus = Number(d.tinnitus ?? 0);
  }
}
