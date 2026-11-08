// 循环层：血压、血流分配、脸红。
//
// 为什么要有这一层：真实的「站起来眼前一黑」是血液沉下去了，
// 不是大脑觉得累。没有血管就没有这件事。
//
// [S] 成人静息血压约 112/70 mmHg（90–120 / 60–80 都算正常）
// [A] 站立后收缩压短时下降 5–10 mmHg，10–20 s 内代偿恢复
// [A] 热应激时皮肤血流可从心输出量的 5% 升到 20%
// [G] 下面的时间常数与增益是估的
import { Channel } from '../core.mjs';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const REST_SBP = 112, REST_DBP = 70;

export class Circulation extends Channel {
  constructor(opts = {}) {
    super('circulation');
    this.sbp = REST_SBP;
    this.dbp = REST_DBP;
    this.skinFlow = 0.05;   // 心输出量分给皮肤的份额 0–1
    this.faceFlow = 0.05;   // 面部局部血流，脸红就是它
    this.lastPose = opts.pose ?? 'standing';
    this.ortho = 0;        // 体位性负荷 0–1，刚站起来时最高
    this.dizzy = 0;        // 头晕 0–1
  }

  apply(ev) {
    if (ev.type === 'flush') { this.faceFlow = clamp(this.faceFlow + (ev.amount ?? 0.4), 0, 1); return true; }
    return false;
  }

  step(h, ctx) {
    const t = this.body?.get('touch');
    const pose = t?.pose ?? 'standing';
    const v = ctx?.vitals ?? {};
    const e = ctx?.endocrine ?? {};
    const ho = ctx?.homeo ?? {};
    const rh = ctx?.rhythm ?? {};

    // ── 体位：躺/坐 → 站，血往下走，一时供不上 ──────────
    if (pose !== this.lastPose) {
      const up = this.lastPose !== 'standing' && pose === 'standing';
      if (up) this.ortho = 1;
      this.lastPose = pose;
    }
    this.ortho -= this.ortho * Math.min(1, h / 12);   // 十几秒代偿完

    // ── 血压 ───────────────────────────────────────────
    // 心率、交感、血容量三样在推它
    const hr = v.hr ?? 65;
    const vol = 1 - clamp((ho.deficit ?? 0) / 0.05, 0, 0.6);   // 缺水 = 血少了
    const symp = 1 + 0.25 * (e.adrenaline ?? 0.05);
    const targetSbp = REST_SBP * symp * (0.55 + 0.45 * vol) * (0.6 + 0.4 * hr / 65) - 38 * this.ortho;
    const targetDbp = REST_DBP * symp * (0.6 + 0.4 * vol) - 24 * this.ortho;
    this.sbp += (targetSbp - this.sbp) * Math.min(1, h / 3);
    this.dbp += (targetDbp - this.dbp) * Math.min(1, h / 3);

    // ── 皮肤血流：热了往皮肤上送，冷了收回来 ────────────
    const warm = clamp(((ho.coreT ?? 36.9) - 36.9) / 1.2, 0, 1);
    const burn = clamp(((ho.sweat ?? 0)), 0, 1);
    const targetSkin = 0.05 + 0.30 * warm + 0.15 * burn;
    this.skinFlow += (targetSkin - this.skinFlow) * Math.min(1, h / 60);

    // ── 脸：血管扩张。跟皮肤温度、交感、社交应激都有关 ──
    const blushDrive = 0.15 * (e.adrenaline ?? 0) + 0.5 * (ctx?.brain?.fear ?? 0)
      + 0.25 * Math.max(0, ((ctx?.endocrine?.oxytocin ?? 0.3) - 0.3));
    this.faceFlow += (0.05 + 0.6 * warm + blushDrive - this.faceFlow) * Math.min(1, h / 8);

    // ── 头晕：脑灌注不够 ────────────────────────────────
    const map = this.dbp + (this.sbp - this.dbp) / 3;
    this.dizzy = clamp((75 - map) / 20, 0, 1);
  }

  read() {
    return {
      sbp: this.sbp,
      dbp: this.dbp,
      map: this.dbp + (this.sbp - this.dbp) / 3,
      skinFlow: this.skinFlow,
      faceFlow: this.faceFlow,
      blush: clamp((this.faceFlow - 0.08) / 0.5, 0, 1),
      dizzy: this.dizzy,
      ortho: this.ortho,
    };
  }

  dump() {
    return {
      sbp: this.sbp, dbp: this.dbp,
      skinFlow: this.skinFlow, faceFlow: this.faceFlow,
      lastPose: this.lastPose, ortho: this.ortho, dizzy: this.dizzy,
    };
  }

  restore(o) {
    if (!o || typeof o !== 'object') return;
    for (const k of ['sbp', 'dbp', 'skinFlow', 'faceFlow', 'ortho', 'dizzy']) {
      if (Number.isFinite(o[k])) this[k] = o[k];
    }
    if (typeof o.lastPose === 'string') this.lastPose = o.lastPose;
  }
}
