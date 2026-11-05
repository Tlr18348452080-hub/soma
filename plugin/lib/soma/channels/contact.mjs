// 物理层：力 → 接触面积 → 压强 → 组织形变深度
//
// 现在 touch() 收的 area 是外部给的。这一步缺的是：那个面积其实是被力决定的。
// 你掐的时候指腹会陷进去，接触面积跟着长，所以压强涨得比力慢很多。
//
// 依据：
// [S] 指腹接触面积随载荷增长，呈**分段线性**（Skin Res Technol 2018, PMID 28573767）
//     低载段斜率大 = 指纹脊被压平；高载段斜率小 = 压到骨头，扛住了
// [A] 分段位置与斜率的具体数值是我按"点击 0.5–2N / 面积约 1cm²、掐 20N / 约 1.5cm²"反推的
// [A] 按压痕深度用赫兹公式 δ = (9F²/16 R E*²)^(1/3)，球形近似
// [G] E*（有效模量）取 30 N/cm²，真皮从轻触到重压是应变硬化的，这个数应该随力变

export const CONTACTS = {
  // id: { label, A0[cm²], k1[cm²/N], Fk[N], k2[cm²/N], R[cm] }
  tip:  { label: '指腹/点压', A0: 0.25, k1: 0.090, Fk: 3,  k2: 0.030, R: 0.8 },
  flat: { label: '掌面/贴合', A0: 25.0, k1: 0.020, Fk: 3,  k2: 0.010, R: 8.0 },
  edge: { label: '边缘/线',   A0: 0.10, k1: 0.045, Fk: 3,  k2: 0.015, R: 0.1 },
};

/** 接触面积 cm²。分段线性：Fk 以下斜率 k1，以上 k2 */
export function contactArea(kind, F) {
  const c = CONTACTS[kind] ?? CONTACTS.tip;
  const f = Math.max(0, F);
  if (f <= c.Fk) return c.A0 + c.k1 * f;
  return c.A0 + c.k1 * c.Fk + c.k2 * (f - c.Fk);
}

/** 平均压强 N/cm² */
export function contactPressure(kind, F) {
  if (F <= 0) return 0;
  return F / contactArea(kind, F);
}

// [S] 指腹实测压缩曲线：2 N → 1.8 mm，4 N → 3.1 mm（J Biomech 2018, PMID 29217092）
//     两点拟合幂律 δ = 1.045 · F^0.784。比赫兹的 F^(2/3) 更陡，因为皮下会应变硬化。
const TIP_A = 1.045, TIP_B = 0.784;

/** 压痕深度 mm。指腹用实测曲线，其余用赫兹（球压弹性半空间） */
export function indentationDepth(kind, F, Estar = 30) {
  const c = CONTACTS[kind] ?? CONTACTS.tip;
  if (F <= 0) return 0;
  if (kind === 'tip') return TIP_A * Math.pow(F, TIP_B);
  // δ = (9F² / (16 R E*²))^(1/3)，单位 mm（F:N, R:cm→10mm, E*:N/cm²→N/mm²=÷100）
  const Rmm = c.R * 10, Emm = Estar / 100;
  return Math.cbrt((9 * F * F) / (16 * Rmm * Emm * Emm));
}

/** 峰值压强 ≈ 平均的 1.5 倍（赫兹椭圆分布，中心比边缘高 50%） */
export function peakPressure(kind, F) {
  return 1.5 * contactPressure(kind, F);
}

/** 一条曲线，给 demo 打表用 */
export function sweep(kind, forces) {
  return forces.map((F) => ({
    F,
    A: +contactArea(kind, F).toFixed(3),
    p: +contactPressure(kind, F).toFixed(2),
    pk: +peakPressure(kind, F).toFixed(2),
    d: +indentationDepth(kind, F).toFixed(2),
  }));
}
