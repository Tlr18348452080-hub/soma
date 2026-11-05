/**
 * channels/touch.mjs — 机械 + 温度
 *
 * 全身版。
 *
 * ── 输入是物理量，不是「感觉」──────────────────────
 *   力 F（牛顿）、接触面积 A（cm²）、物体温度、材料
 *   感受器吃的是压强 p = F/A（N/cm²），不是总力。
 *   掐 20N 摊在 1cm² 上 = 20；掌压 20N 摊在 100cm² 上 = 0.2。差一百倍。
 *
 * ── 常数可信度 ──────────────────────────────────────
 *   [S] 教科书级  [A] 近似  [G] 估的    详细见 ../SOURCES.md
 */

import { Channel } from '../core.mjs';

// 压强 → 换能。Naka-Rushton 饱和曲线，感受器 transduction 的常用形式。
// p50 [G] 取 0.6 N/cm²：轻抚远在下面，用力按开始饱和。
import { contactArea, contactPressure, indentationDepth } from './contact.mjs';

const P50 = 0.6;

// ── 温度痛层 ──────────────────────────────────────────────
// [S] 热痛阈 45.0±3.7°C（PMID 11799504），个体范围 41–49
// [S] 冷痛阈 19.1°C（有毛皮肤，PMID 2812842）；舌尖低到 4.5°C
// [A] 阈值本身是「水平检测器」——压多久、升多快都不改阈值（2s vs 64s 无差异，PMID 9003568）
// [A] 但阈上的痛强度是积分器：同样温度，持续更久更痛（时间总和，PMID 16540248）
//     所以这里拆成两个量：painNow（瞬时，接近 Aδ）和 painLoad（累积，接近 C）
const HOT_PAIN = 45.0, COLD_PAIN = 19.1;

// ── 重力层 ────────────────────────────────────────────────
// 重量是唯一一个永远不撤除的刺激。站着你一直在压脚底，
// 只是几秒后就感觉不到了——那是适应在干活，不是没有压力。
// [S] 重力 g=9.8；静息时人体重心落在支撑面上，各区按比例分摊
// [G] 下面每个姿势的分摊比例和有效接触面积都是估的
const G = 9.8;
export const POSES = {
  standing:    { sole: { share: 1.00, area: 300 } },
  sitting:     { hip: { share: 0.75, area: 120 }, thigh: { share: 0.25, area: 300 } },
  lying_supine:{ scalp: { share: 0.05, area: 150 }, back_upper: { share: 0.20, area: 250 },
                 back_lower: { share: 0.25, area: 200 }, hip: { share: 0.25, area: 250 },
                 thigh: { share: 0.20, area: 350 }, calf: { share: 0.05, area: 200 } },
  kneeling:    { knee: { share: 0.50, area: 40 }, shin: { share: 0.50, area: 120 } },
  side_lying:  { shoulder: { share: 0.25, area: 90 }, hip: { share: 0.35, area: 250 },
                 thigh: { share: 0.30, area: 350 }, calf: { share: 0.10, area: 200 } },
};

/**
 * 全身分区。
 *   density  [S] 机械感受器 /cm²
 *   acuity   [S] 两点辨别阈 mm
 *   baseT    [S] 静息皮温 °C —— 不是全局常数，脚和躯干差 7 度
 *   tauF/tauS [G] **知觉层面**的习惯化，不是感受器适应。
 *             实测感受器适应：SA-I 58 ms / RA-I 29 ms / PC 4.2 ms（猴，模型拟合，PMID 7097579），
 *             比这两个数快两个数量级。这里故意用慢的——模拟的是"压久了会麻"，
 *             那件事发生在知觉层。两者别混。
 *   rth      [G] 相对热阻（角质层厚度 + 皮下脂肪）
 *   area     [A] 参考接触面积 cm²（整块区域的大致范围）
 *   kind     glabrous 无毛 / hairy 有毛
 */
export const REGIONS = [
  // ── 手 ───────────────────────────────────────────
  { id: 'index_tip',  label: '食指尖', kind: 'glabrous', density: 241, acuity: 2.3, baseT: 31.0, rth: 0.85, tauF: 2.0, tauS: 18, area: 2 },
  { id: 'thumb_tip',  label: '拇指尖', kind: 'glabrous', density: 240, acuity: 2.5, baseT: 31.0, rth: 0.85, tauF: 2.0, tauS: 18, area: 2 },
  { id: 'middle_tip', label: '中指尖', kind: 'glabrous', density: 240, acuity: 2.3, baseT: 31.0, rth: 0.85, tauF: 2.0, tauS: 18, area: 2 },
  { id: 'ring_tip',   label: '无名指尖', kind: 'glabrous', density: 220, acuity: 2.6, baseT: 30.5, rth: 0.88, tauF: 2.1, tauS: 19, area: 2 },
  { id: 'pinky_tip',  label: '小指尖', kind: 'glabrous', density: 200, acuity: 3.0, baseT: 30.0, rth: 0.90, tauF: 2.2, tauS: 20, area: 2 },
  { id: 'palm',       label: '掌心',   kind: 'glabrous', density: 58, acuity: 6.3,  baseT: 33.0, rth: 1.40, tauF: 4.0, tauS: 35, area: 60 },
  { id: 'palm_edge',  label: '手掌外缘', kind: 'glabrous', density: 50, acuity: 9.0, baseT: 32.5, rth: 1.45, tauF: 4.2, tauS: 38, area: 25 },
  { id: 'dorsum',     label: '手背',   kind: 'hairy',    density: 50,  acuity: 20,  baseT: 31.5, rth: 1.20, tauF: 4.5, tauS: 42, area: 50 },
  { id: 'index_mid',  label: '食指中节', kind: 'hairy',  density: 140, acuity: 4.0, baseT: 31.0, rth: 1.05, tauF: 2.8, tauS: 26, area: 8 },

  // ── 手臂 ─────────────────────────────────────────
  { id: 'forearm',    label: '前臂',   kind: 'hairy',    density: 15,  acuity: 35,  baseT: 32.0, rth: 1.60, tauF: 6.0, tauS: 60, area: 120 },
  { id: 'upper_arm',  label: '上臂',   kind: 'hairy',    density: 12,  acuity: 40,  baseT: 32.5, rth: 1.55, tauF: 6.5, tauS: 65, area: 150 },
  { id: 'elbow',      label: '肘窝',   kind: 'hairy',    density: 25,  acuity: 25,  baseT: 33.0, rth: 1.30, tauF: 4.0, tauS: 45, area: 20 },
  { id: 'armpit',     label: '腋下',   kind: 'hairy',    density: 60,  acuity: 12,  baseT: 35.5, rth: 1.10, tauF: 2.5, tauS: 25, area: 30, ticklish: 2.5 },

  // ── 肩颈 ─────────────────────────────────────────
  { id: 'neck_side',  label: '颈侧',   kind: 'hairy',    density: 40,  acuity: 15,  baseT: 35.0, rth: 1.15, tauF: 3.0, tauS: 30, area: 30, ticklish: 2.0 },
  { id: 'neck_front', label: '咽喉',   kind: 'hairy',    density: 50,  acuity: 12,  baseT: 35.5, rth: 1.10, tauF: 2.6, tauS: 26, area: 25, ticklish: 2.0 },
  { id: 'shoulder',   label: '肩膀',   kind: 'hairy',    density: 12,  acuity: 40,  baseT: 34.0, rth: 1.50, tauF: 6.0, tauS: 60, area: 90 },
  { id: 'collarbone', label: '锁骨',   kind: 'hairy',    density: 30,  acuity: 18,  baseT: 34.5, rth: 1.25, tauF: 3.5, tauS: 35, area: 25 },

  // ── 躯干 ─────────────────────────────────────────
  { id: 'chest',      label: '胸口',   kind: 'hairy',    density: 12,  acuity: 40,  baseT: 35.5, rth: 1.45, tauF: 6.0, tauS: 60, area: 250 },
  { id: 'belly',      label: '腹部',   kind: 'hairy',    density: 10,  acuity: 45,  baseT: 35.0, rth: 1.50, tauF: 6.5, tauS: 65, area: 280, ticklish: 1.5 },
  { id: 'waist_side', label: '腰侧',   kind: 'hairy',    density: 10,  acuity: 45,  baseT: 34.5, rth: 1.50, tauF: 6.5, tauS: 65, area: 120, ticklish: 3.0 },
  { id: 'back_upper', label: '上背',   kind: 'hairy',    density: 10, acuity: 55.4,  baseT: 34.0, rth: 1.55, tauF: 7.0, tauS: 70, area: 250 },
  { id: 'back_lower', label: '下背',   kind: 'hairy',    density: 10, acuity: 55.4,  baseT: 34.0, rth: 1.55, tauF: 7.0, tauS: 70, area: 200 },
  { id: 'hip',        label: '臀',     kind: 'hairy',    density: 10, acuity: 55.4,  baseT: 34.0, rth: 1.90, tauF: 7.5, tauS: 75, area: 250 },

  // ── 头面 ─────────────────────────────────────────
  { id: 'forehead',   label: '额头',   kind: 'hairy',    density: 35,  acuity: 18,  baseT: 34.0, rth: 1.15, tauF: 3.5, tauS: 35, area: 50 },
  { id: 'cheek',      label: '脸颊',   kind: 'hairy',    density: 55,  acuity: 12,  baseT: 33.5, rth: 1.10, tauF: 2.8, tauS: 28, area: 35 },
  { id: 'lips',       label: '嘴唇',   kind: 'glabrous', density: 150, acuity: 4.5, baseT: 34.5, rth: 0.70, tauF: 1.6, tauS: 14, area: 6 },
  { id: 'tongue_tip', label: '舌尖',   kind: 'glabrous', density: 200, acuity: 2.0, baseT: 36.0, rth: 0.45, tauF: 1.2, tauS: 10, area: 3 },
  { id: 'ear_lobe',   label: '耳垂',   kind: 'hairy',    density: 45,  acuity: 15,  baseT: 31.0, rth: 0.95, tauF: 3.0, tauS: 30, area: 8 },
  { id: 'scalp',      label: '头皮',   kind: 'hairy',    density: 20,  acuity: 28,  baseT: 34.5, rth: 1.20, tauF: 5.0, tauS: 50, area: 150, hair: true },

  // ── 腿脚 ─────────────────────────────────────────
  { id: 'thigh',      label: '大腿',   kind: 'hairy',    density: 8,   acuity: 50,  baseT: 33.0, rth: 1.70, tauF: 8.0, tauS: 80, area: 350 },
  { id: 'knee',       label: '膝',     kind: 'hairy',    density: 12,  acuity: 45,  baseT: 32.5, rth: 1.65, tauF: 7.5, tauS: 75, area: 40 },
  { id: 'calf',       label: '小腿',   kind: 'hairy',    density: 10,  acuity: 48,  baseT: 31.5, rth: 1.60, tauF: 7.5, tauS: 75, area: 200 },
  { id: 'ankle',      label: '脚踝',   kind: 'hairy',    density: 20,  acuity: 30,  baseT: 30.5, rth: 1.55, tauF: 5.5, tauS: 55, area: 30 },
  { id: 'foot_dorsum',label: '脚背',   kind: 'hairy',    density: 18,  acuity: 32,  baseT: 30.0, rth: 1.60, tauF: 6.0, tauS: 60, area: 70 },
  { id: 'sole',       label: '脚底',   kind: 'glabrous', density: 40,  acuity: 22,  baseT: 29.0, rth: 2.40, tauF: 9.0, tauS: 90, area: 90, thick: true },
  { id: 'toes',       label: '脚趾',   kind: 'glabrous', density: 60,  acuity: 15,  baseT: 28.5, rth: 2.00, tauF: 7.0, tauS: 70, area: 15 },

  // ── 私密区 ───────────────────────────────────────
  // 神经密度高、但两点辨别差：感觉强烈，说不清具体在哪。
  // 参数 [G]，没有可靠文献。默认加载，opts.intimate = false 可关掉。
  // 不在 README 和 demo 里出现。
  { id: 'nipple',     label: '乳晕',   kind: 'glabrous', density: 80,  acuity: 15,  baseT: 35.0, rth: 0.90, tauF: 2.2, tauS: 20, area: 5,  intimate: true },
  { id: 'pubic',      label: '耻骨',   kind: 'hairy',    density: 15,  acuity: 40,  baseT: 35.0, rth: 1.50, tauF: 6.5, tauS: 65, area: 80, intimate: true },
  { id: 'vulva',      label: '外阴',   kind: 'glabrous', density: 120, acuity: 25,  baseT: 35.5, rth: 0.80, tauF: 2.0, tauS: 18, area: 20, intimate: true },
  { id: 'penis',      label: '阴茎',   kind: 'glabrous', density: 110, acuity: 25,  baseT: 33.5, rth: 0.85, tauF: 2.2, tauS: 20, area: 25, intimate: true },
  { id: 'scrotum',    label: '阴囊',   kind: 'hairy',    density: 70,  acuity: 30,  baseT: 32.0, rth: 1.30, tauF: 3.0, tauS: 28, area: 40, intimate: true },
  { id: 'perineum',   label: '会阴',   kind: 'hairy',    density: 60,  acuity: 35,  baseT: 34.5, rth: 1.20, tauF: 3.2, tauS: 30, area: 25, intimate: true },
];

// mu = 摩擦系数 [A] 铝 0.6 / 橡胶 0.9 有实测（PMID 19431002），其余按材质粗糙度估 [G]
export const MATERIALS = {
  metal:   { e: 14.0, mu: 0.60, label: '金属' },
  alu:     { e: 23.7, mu: 0.60, label: '铝' },
  glass:   { e: 1.40, mu: 0.55, label: '玻璃' },
  ceramic: { e: 2.20, mu: 0.50, label: '陶瓷' },
  stone:   { e: 3.50, mu: 0.70, label: '石头' },
  plastic: { e: 0.55, mu: 0.45, label: '塑料' },
  wood:    { e: 0.40, mu: 0.50, label: '木头' },
  cloth:   { e: 0.06, mu: 0.85, label: '布' },
  rubber:  { e: 0.35, mu: 0.90, label: '橡胶' },
  skin:    { e: 1.00, mu: 0.70, label: '皮肤' },
};

// ── 抚摸（C-tactile）──────────────────────────────────────
// [S] 最优速度 1–10 cm/s，峰值 3 cm/s（Löken 2009, Nat Neurosci, PMID 19363489）
// [A] 实测点 0.3 / 1 / 3 / 10 / 30 cm/s 都偏低速（PMID 24553929）
// 用对数高斯调谐：σ 取到让 1 和 10 cm/s 都还有 0.6，0.3 和 30 掉到 0.15
const CT_PEAK = 3, CT_SIGMA = 1.19;

/** 速度调谐曲线：0–1，1 表示正处在最优抚摸速度 */
export function ctTuning(speed) {
  const v = Math.max(0.05, speed);
  const x = Math.log(v / CT_PEAK) / CT_SIGMA;
  return Math.exp(-0.5 * x * x);
}

/** 摩擦系数随法向力下降：1 N → 20 N 降 46%（PMID 19431002） */
export function frictionOf(forceN, mu0 = 0.6) {
  return mu0 * (1 - 0.46 * Math.min(1, Math.max(0, (forceN - 1) / 19)));
}

export class Touch extends Channel {
  constructor(opts = {}) {
    super('touch');
    this.gain = opts.gain ?? 1.0;
    this.intimate = opts.intimate !== false;
    this.weight = opts.weight ?? 50;   // kg
    this.pose = opts.pose ?? 'standing';
    this.regions = REGIONS.filter((r) => this.intimate || !r.intimate).map((r) => ({
      ...r,
      refArea: r.area,
      P: 0,          // 压强 N/cm²
      objT: null,
      eObj: null,
      barF: 0,
      barS: 0,
      T: r.baseT,
      thermBar: 0,
      since: null,
      gain: 1,
      pWeight: 0,   // 重力带来的持续压强 N/cm²
      ct: 0,        // C-tactile 活动 0–1：慢速轻抚走的那条通路，管"舒服"
      slip: 0,      // 切向摩擦 0–1：滑动时的阻力，独立于压力
      painNow: 0,   // 瞬时痛强度 0–1（温度越过阈值就开始）
      painLoad: 0,  // 累积痛 0–1（阈上刺激的时间总和）
      // [S] 指尖 = 骨以上软组织最大厚度 6.4mm（PMID 29217092）；其余 [G] 分档估的
      sMax: r.thick ? 2.5 : (r.area < 10 ? 6.4 : r.area < 60 ? 8 : 15),
    }));
    this.byId = new Map(this.regions.map((r) => [r.id, r]));
  }

  /** 存档：只存会变的东西，分区按 id 对齐（以后加区也不会错位）。 */
  dump() {
    const regions = {};
    for (const r of this.regions) {
      regions[r.id] = [r.P, r.T, r.ct, r.slip, r.painNow, r.painLoad, r.pWeight, r.gain, r.barF, r.barS, r.thermBar, r.since];
    }
    return { weight: this.weight, pose: this.pose, regions };
  }

  restore(o) {
    if (!o) return;
    this.weight = o.weight ?? this.weight;
    this.pose = o.pose ?? this.pose;
    for (const r of this.regions) {
      const v = o.regions?.[r.id];
      if (!v) continue;
      [r.P, r.T, r.ct, r.slip, r.painNow, r.painLoad, r.pWeight, r.gain, r.barF, r.barS, r.thermBar, r.since] = v;
    }
  }

  apply(ev) {
    if (ev.type === 'touch') {
      const r = this.region(ev.part);
      const F = ev.force ?? 1;
      // 面积不再外部给：由接触几何和力推出来（物理层）
      let A, p;
      if (ev.contact) {
        const kind = ev.contact;
        A = Math.min(contactArea(kind, F), r.refArea);
        p = F / Math.max(A, 0.5);
        r.depth = this.saturateDepth(indentationDepth(kind, F), r);
        r.contact = kind;
      } else if (ev.area != null) {
        A = ev.area;
        p = F / Math.max(A, 0.5);
      } else {
        A = Math.min(contactArea('tip', F), r.refArea);
        p = F / Math.max(A, 0.5);
        r.depth = this.saturateDepth(indentationDepth('tip', F), r);
        r.contact = 'tip';
      }
      r.P = Math.max(r.P, p);
      if (ev.temp != null) {
        r.objT = ev.temp;
        r.eObj = (MATERIALS[ev.material ?? 'skin'] ?? MATERIALS.skin).e;
      }
      if (r.since == null) r.since = this.body.t;
      return true;
    }
    if (ev.type === 'release') {
      const r = this.region(ev.part);
      r.P = 0;
      r.objT = null;
      return true;
    }
    if (ev.type === 'attend') {
      const r = this.region(ev.part);
      r.gain = ev.gain ?? 2.2;
      return true;
    }
    if (ev.type === 'gain') {
      this.gain = ev.value ?? 1;
      return true;
    }
    return false;
  }

  region(id) {
    const r = this.byId.get(id);
    if (!r) throw new Error(`没有这个区域: ${id}`);
    return r;
  }

  // 压强 → 归一化换能。饱和曲线，不是线性的。
  transduce(p) {
    return p / (p + P50);
  }

  contactTemp(objT, eObj) {
    return (1 * 33 + eObj * objT) / (1 + eObj);
  }

  step(h) {
    for (const r of this.regions) {
      const S = this.transduce(r.P + r.pWeight);
      r.barF += (S - r.barF) * (h / r.tauF);
      r.barS += (S - r.barS) * (h / r.tauS);

      if (r.objT != null) {
        const Tc = this.contactTemp(r.objT, r.eObj ?? 1);
        const rate = (0.35 * (r.eObj ?? 1)) / r.rth;
        r.T += (Tc - r.T) * Math.min(1, rate * h);
      } else {
        r.T += (r.baseT - r.T) * Math.min(1, 0.05 * h);
      }
      r.thermBar += (r.T - r.baseT - r.thermBar) * (h / 90);

      // 痛：阈值是硬的门，越过才开；跨过多少线性映射到 0–1
      const hot = Math.max(0, (r.T - HOT_PAIN) / 15);     // 45→60°C 映射到 0→1
      const cold = Math.max(0, (COLD_PAIN - r.T) / COLD_PAIN);
      r.painNow = Math.min(1, Math.max(hot, cold));
      r.painLoad += (r.painNow - r.painLoad) * Math.min(1, h / 60);

      // 抚摸：调谐曲线给目标值，然后像所有感觉一样适应
      const ctTarget = r.stroking ? ctTuning(r.stroking.speed) : 0;
      r.ct += (ctTarget - r.ct) * Math.min(1, h / 1.2);
      r.slip += ((r.slipTarget ?? 0) - r.slip) * Math.min(1, h / 0.4);

      if (r.P < 1e-3) r.since = null;
    }
  }

  /** 压痕深度限位：软组织底下是骨头，压到那儿就压不动了。
   *  用平滑取小（smooth max）而不是指数饱和——指数饱和会把实测曲线也压扁，
   *  而实测数据本来就包含了应变硬化。这个只在接近 sMax 时才起作用，远低于时几乎是恒等。 */
  saturateDepth(d, r) {
    const m = r.sMax ?? 8;
    return d / Math.pow(1 + Math.pow(d / m, 4), 0.25);
  }

  /** 抚摸：一个沿皮肤移动的接触。speed 单位 cm/s。
   *  这条通道跟"压"不是一回事——它走 C-tactile 纤维，直连岛叶，
   *  量的是速度不是力。太快太慢都不舒服。 */
  stroke(part, opts = {}) {
    const r = this.byId.get(part);
    if (!r) throw new Error(`没这个部位: ${part}`);
    const speed = opts.speed ?? 3;             // cm/s
    const force = opts.force ?? 0.5;           // N
    const mat = MATERIALS[opts.material ?? 'skin'] ?? MATERIALS.skin;
    const mu = frictionOf(force, mat.mu);
    r.stroking = { speed, force, mu };
    r.slipTarget = Math.min(1, (mu * force) / 0.8);
    r.since = r.since ?? this.body?.t ?? 0;
    return r;
  }

  /** 停止抚摸 */
  stop(part) {
    const r = this.byId.get(part);
    if (r) { r.stroking = null; r.slipTarget = 0; }
  }

  /** 换姿势：重心重新分配，各区的持续压强跟着变 */
  setPose(name) {
    const pose = POSES[name];
    if (!pose) throw new Error(`没有这个姿势: ${name}`);
    this.pose = name;
    for (const r of this.regions) r.pWeight = 0;
    for (const [id, { share, area }] of Object.entries(pose)) {
      const r = this.byId.get(id);
      if (r) r.pWeight = (this.weight * G * share) / area;
    }
  }

  read() {
    const t = this.body?.t ?? 0;
    return this.regions.map((r) => {
      const g = (r.gain ?? 1) * this.gain * (r.ticklish ?? 1);
      const S = this.transduce(r.P + r.pWeight);
      const RA = g * (S - r.barF);
      const SA = g * 0.6 * (S - r.barS);
      const thermal = r.T - r.baseT - r.thermBar;
      return {
        id: r.id,
        label: r.label,
        kind: r.kind,
        pressure: SA,
        sharp: Math.abs(RA) / (Math.abs(RA) + Math.abs(SA) + 1e-6),
        thermal,
        temp: r.T,
        held: r.since == null ? 0 : t - r.since,
        area: r.refArea,
        pain: r.painNow,
        painLoad: r.painLoad,
        ct: r.ct,
        slip: r.slip,
      };
    });
  }
}
