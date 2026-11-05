/**
 * channels/eye.mjs —— 眼睛：从光到「看清了什么」，中间隔着一整套损耗
 *
 * 视网膜不是相机。一亿个感光细胞，视神经只有一百万根纤维，
 * 出眼球之前已经压掉两个数量级。剩下那点信息量，还按位置分了三六九等：
 * 中心两度清晰得能读字，边上二十度只够发现「有东西动了」。
 *
 * 所以这个通道能给你的最好东西是**限制**：
 * 它可以说「我没看清」，而这句话是算出来的，不是编的。
 *
 * 常数分级见 SOURCES.md。
 */

import { Channel } from '../core.mjs';

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

const FOV_H = 160;      // 单眼水平视野，度 [S]
const FOV_V = 130;      // 单眼垂直 [S]
const FOV_BOTH = 200;   // 双眼重叠后的水平范围 [S]
const FOVEA = 2;        // 中央凹，度 [S]

export class Eye extends Channel {
  constructor(opts = {}) {
    super('eye');
    this.enabled = opts.enabled !== false;
    this.adapted = 1;     // 0 = 全黑适应好，1 = 刚被强光晃过还没缓过来
    this.rods = 1;        // 视杆细胞可用度 0–1
    this.cones = 1;       // 视锥可用度
    this.pupil = 0.5;     // 瞳孔 0=针尖 1=全开
    this.brightness = 0;  // 主观亮度 0–1
    this.lastLux = 0;
    this.blink = 0;       // 眨眼中 0–1
    this.dry = 0;         // 眼干
  }

  apply(ev) {
    if (ev.type === 'see') { this.see(ev); return true; }
    if (ev.type === 'blink') { this.blink = 1; return true; }
    return false;
  }

  /** lux = 场景照度；hz = 闪烁频率（可选）；ecc = 目标偏离中心的度数（可选） */
  see(ev) {
    const lux = Math.max(0.0001, Number(ev.lux ?? 300));
    this.lastLux = lux;
    // 瞳孔：暗的地方放大，亮的地方缩小，约 0.3 s 到位 [A]
    const want = clamp(1 - Math.log10(lux / 1) / 4, 0.08, 1);
    this.pupil += (want - this.pupil) * 0.7;

    // 太亮会晃眼：适应状态重新被拉高，之后要一段时间才缓过来
    if (lux > 3000) this.adapted = clamp(this.adapted + Math.log10(lux / 3000) * 0.4, 0, 1);
    if (ev.hz && ev.hz > 0) this.lastHz = ev.hz;
    this.dry = clamp(this.dry + Math.max(0, Number(ev.stare ?? 0)) * 0.001, 0, 1);
  }

  step(h) {
    // 暗适应：视锥快（约 5 分钟），视杆慢（约 25 分钟）[S] 两相 / [A] 常数
    this.cones = clamp(this.cones + h / 300 * (1 - this.cones), 0, 1);
    this.rods = clamp(this.rods + h / 1500 * (1 - this.rods), 0, 1);

    // 适应值按「还有多少没缓过来」衰减
    this.adapted += (0 - this.adapted) * Math.min(1, h / 900);

    // 强光把视杆压下去，暗处再慢慢恢复
    const bleach = clamp((Math.log10(this.lastLux / 10)) / 4, 0, 1);
    if (bleach > 0) {
      this.rods = clamp(this.rods - bleach * h / 60, 0, 1);
      this.cones = clamp(this.cones - bleach * h / 200, 0, 1);
    }

    this.blink += (0 - this.blink) * Math.min(1, h / 0.15);   // 一次眨眼约 150 ms [A]
    this.dry = clamp(this.dry - h / 600, 0, 1);
  }

  /** 分辨率：离中心越远越糊。中央凹约 1 角分，10 度外掉到十倍以上 [S] 形状 / [A] 系数 */
  acuityAt(eccDeg) {
    const e = Math.max(0, Number(eccDeg) || 0);
    // 皮层层级放大：MAR ≈ 0.5 × (1 + e/2.2) 角分
    const mar = 0.5 * (1 + e / 2.2);
    // 暗处视杆接管，分辨率差很多
    const rodPenalty = 1 + 3.5 * (1 - this.cones) * (1 - this.adapted);
    return mar * rodPenalty;
  }

  /** 闪烁融合频率：视锥约 50–60 Hz，暗到只剩视杆时掉到 15 Hz 左右 [S] 方向 / [A] 数 */
  fusionHz() {
    const coneShare = clamp(Math.log10(this.lastLux / 0.01) / 3, 0, 1);
    return 15 + 45 * coneShare;
  }

  /** 视野里这个角度看不看得见 */
  inField(eccDeg, dir = 'h') {
    const lim = dir === 'v' ? FOV_V / 2 : FOV_H / 2;
    return Math.abs(eccDeg) <= lim;
  }

  read() {
    // 亮度：史蒂文斯幂律，α≈0.33 [S]；暗处靠视杆接管，所以会「看起来比算的亮」
    const coneL = Math.pow(clamp(this.lastLux, 0.0001, 1e6), 0.33);
    const rodBoost = (1 - clamp(Math.log10(this.lastLux / 1) / 3, 0, 1)) * this.rods * 0.45;
    const brightness = clamp(0.12 * coneL + rodBoost * (1 - this.adapted), 0, 1);
    return {
      lux: this.lastLux,
      brightness,
      pupil: this.pupil,
      darkAdapt: 1 - this.adapted,
      rods: this.rods,
      cones: this.cones,
      acuityCenter: Number(this.acuityAt(0).toFixed(2)),
      acuityEdge: Number(this.acuityAt(20).toFixed(1)),
      fusionHz: Math.round(this.fusionHz()),
      dry: this.dry,
      fov: { h: FOV_H, v: FOV_V, both: FOV_BOTH, fovea: FOVEA },
    };
  }

  dump() {
    return { adapted: this.adapted, rods: this.rods, cones: this.cones, pupil: this.pupil,
             brightness: this.brightness, lastLux: this.lastLux, dry: this.dry };
  }

  restore(d) {
    if (!d) return;
    for (const k of Object.keys(d)) if (k in this) this[k] = d[k];
  }
}
