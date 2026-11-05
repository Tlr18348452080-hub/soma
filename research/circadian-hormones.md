# 昼夜节律如何驱动激素 —— 参数表

检索源：Europe PMC（`/tmp/q.mjs` 字段语法查询 + `/tmp/abs.mjs` 摘要）。
规则：只写摘要里出现过的数字；每条给 PMID + 英文原句；`[S]` 教科书级/多研究一致、`[A]` 单项研究或近似、`[G]` 由摘要数值推算的估算。
所有时间均为受试者本地时钟时间（论文未换算 UTC）。

---

## 1. 褪黑素（melatonin）

### 1.1 夜间峰值时刻与幅度

| 量 | 值 | 级别 | PMID | 摘要原句 |
|---|---|---|---|---|
| 峰值时刻 | 多数在 02:00 或 03:00 | [S] | 27302542 | "Sixteen studies showed a secretion pattern with a clear peak concentration, mostly at 0200h or 0300h." |
| 峰值幅度（老年人，RIA） | 11.2–91.3 pg/mL | [S] | 27302542 | "Maximum concentrations varied greatly from 11.2 to 91.3pgml(-1)." |
| 65–70 岁均值 | 49.3 pg/mL | [A] | 27302542 | "Maximum melatonin level in studies with participants mean aged 65-70years was 49.3pgml(-1)" |
| ≥75 岁均值 | 27.8 pg/mL | [A] | 27302542 | "and in studies with participants mean aged ≥75years 27.8" |
| 模型化峰值时刻（正常睡眠者） | 23:59 | [A] | 40288357 | "peak time, 23:59 (4.13%)" |
| 模型化幅度 | 7.95（模型单位，摘要未标单位） | [A] | 40288357 | "amplitude, 7.95 (15.47%)" |
| 模型化基线浓度 | 3.21 pg/mL | [A] | 40288357 | "baseline melatonin concentration, 3.21 pg/mL (23.27%)" |

注意：40288357 的“幅度 7.95”原文没有给单位，不能当 pg/mL 用。

### 1.2 光照抑制的剂量反应

单次研究，午夜 00:00–01:00 光照 1 小时，血浆褪黑素抑制率（男女无差异）：

| 照度 | 抑制率 | 级别 | PMID | 摘要原句 |
|---|---|---|---|---|
| 200 lux | 17% | [A] | 10821436 | "the mean melatonin suppression by light in both males and females was dose dependent (17% [200 lux], 40% [500 lux], 56% [1,000 lux] and 74% [3,000 lux])" |
| 500 lux | 40% | [A] | 10821436 | 同上 |
| 1,000 lux | 56% | [A] | 10821436 | 同上 |
| 3,000 lux | 74% | [A] | 10821436 | 同上 |

阈值/饱和（按 melanopic lux 建模，综合多套数据）：

| 量 | 值 | 级别 | PMID | 摘要原句 |
|---|---|---|---|---|
| 最低起效 | ~1.5 melanopic lux | [A] | 30697806 | "melatonin suppression is predicted to occur at levels as low as ~1.5 melanopic lux (melanopsin-weighted irradiance 0.2 µW/cm2 )" |
| 饱和 | 305 melanopic lux | [A] | 30697806 | "saturation occurs at 305 melanopic lux (melanopsin-weighted irradiance 36.6 µW/cm2)" |

旧式单色光阈值（509 nm）：介于 1.6–5 µW/cm² 之间 —— PMID 3409004，"the mean threshold irradiance for suppressing melatonin is between 1.6 and 5 microW/cm2."

### 1.3 半衰期

| 量 | 值 | 级别 | PMID | 摘要原句 |
|---|---|---|---|---|
| 外源速释褪黑素 t½ | 1.01 h | [A] | 39458580 | "The mean t1/2 of Melatonin-SR (5.10 h) was prolonged by five-fold compared to Melatonin-IR (1.01 h)." |
| 外源缓释 t½ | 5.10 h | [A] | 39458580 | 同上 |
| 内源消除速率常数 | 1.23 h⁻¹ | [A] | 40288357 | "elimination rate constant, 1.23 h-1 (21.82%)" |
| 内源 t½（由 k 推算） | 0.693/1.23 ≈ 0.56 h ≈ 34 min | [G] | 40288357 | 推算自上一行；摘要未直接给 t½ |

内源半衰期的直接实测值：未找到（检索到的 t½ 均为外源给药）。

---

## 2. 皮质醇（cortisol）

CAR（醒后 30 分钟内 +50–75%）按要求不再复检。

### 2.1 夜间最低值相对白天的比例

单项大样本（306 名 40–62 岁女性，唾液，几何均值 nmol/L：醒时 8.6、醒后 30 分 10.0、午后 3.7、睡前 1.6）：

| 量 | 值 | 级别 | PMID | 摘要原句 |
|---|---|---|---|---|
| 睡前（夜间最低） | 1.6 nmol/L | [A] | 26663024 | "3·7 (SD 3·3) early afternoon and 1·6 (SD 1·8) bedtime" |
| 醒后 30 分（峰） | 10.0 nmol/L | [A] | 26663024 | "10·0 (SD 7·5) wake +30 min" |
| 夜间/峰值 | 1.6 / 10.0 ≈ 16% | [G] | 26663024 | 上面两行相除；摘要未直接给该比例 |
| 夜间/白天三点均值 | 1.6 / 7.43 ≈ 22% | [G] | 26663024 | 同上，白天均值取 8.6、10.0、3.7 |

直接以“夜间最低值占白天均值百分比”表述的原文：未找到。

### 2.2 昼夜幅度

| 量 | 值 | 级别 | PMID | 摘要原句 |
|---|---|---|---|---|
| 24 h mesor（健康男性，血清） | 7.22 µg/dL | [A] | 11994358 | "The geometric mean of the 24-h mesor (AUC((0-24 h))/24 h) was 7.22 microg/dl for placebo" |
| 昼夜幅度（绝经后女性） | 20.20 µg/dL → ERT 后 25.97 µg/dL | [A] | 10579640 | "The circadian amplitude of cortisol increased during ERT from 20.20 (18.35, 23.61) to 25.97 (24.94, 27.74) microg/dL (p = 0.016)" |
| 幅度/基线（跨研究粗算） | 20.20 / 7.22 ≈ 2.8 | [G] | 10579640 + 11994358 | 两项研究人群不同（绝经后女性 vs 健康男性），只作量级参考 |

两项研究对“amplitude”的定义未必一致（峰-谷 vs 半幅），上表第三行只能当量级。

### 2.3 相位（最低点时刻）

| 量 | 值 | 级别 | PMID | 摘要原句 |
|---|---|---|---|---|
| 血浆皮质醇最低点（对照女性，恒定作息） | 22:03 | [A] | 9146822 | "The minimum of the cortisol rhythm was phase-delayed in the SAD group compared to the control group, 12:11 AM vs. 10:03 PM" |
| CSF 皮质醇峰/谷 | 09:00 / 01:00（比血浆滞后 2 h） | [A] | 31838496 | "closely followed the plasma rhythm by 2 h with peak and nadir levels at 0900h and 0100h" |

---

## 3. 血清素 / 5-HT

| 量 | 值 | 级别 | PMID | 摘要原句 |
|---|---|---|---|---|
| 脑内 5-HT 转化率的季节差 | 冬季最低（p=0.013） | [A] | 12480364 | "we showed that turnover of serotonin by the brain was lowest in winter (p=0.013)" |
| 与日照时长的相关 | r = 0.294, p = 0.010 | [A] | 12480364 | "the rate of production of serotonin by the brain was directly related to the prevailing duration of bright sunlight (r=0.294, p=0.010), and rose rapidly with increased luminosity" |
| 血浆 5-HT 季节峰谷 | 夏季最高、秋季最低 | [A] | 2478199 | "Plasma serotonin (5-HT) shows very marked changes throughout the year, with maximum values during the summer and lowest values in the fall" |

季节/日照关系的具体百分比或效应量：未找到（12480364 只给 r 与 p，2478199 只给方向）。

### 色氨酸耗竭（ATD）对情绪的影响

| 结论 | 级别 | PMID | 摘要原句 |
|---|---|---|---|
| 健康对照：不降低情绪 | [S] | 17389902 | "5-HT or NE/DA depletion did not decrease mood in healthy controls." |
| 有 MDD 家族史的健康人：轻度降低 | [A] | 17389902 | "5-HT or NE/DA depletion slightly lowered mood in healthy controls with a family history of MDD." |
| 缓解期未服药 MDD：中度降低 | [A] | 17389902 | "In drug-free patients with MDD in remission, a moderate mood decrease was found for ATD, without an effect of APTD." |
| 服 5-HT 能抗抑郁药者：诱发复发 | [A] | 17389902 | "ATD induced relapse in patients with MDD in remission who used serotonergic antidepressants." |

效应量（Cohen's d / SMD）数值：未找到 —— 该 meta 摘要只写 "moderate mood decrease"，没有给数字。

---

## 4. 生长激素（GH）

| 量 | 值 | 级别 | PMID | 摘要原句 |
|---|---|---|---|---|
| 睡眠期 GH 脉冲与 SWS 的重合率（男性） | 约 70% | [A] | 8627466 | "In men approximately 70% of the GH pulses during sleep coincide with SWS, and the amount of GH secreted during these pulses correlates with the concurrent amount of SWS." |
| 睡眠起始脉冲的地位 | 成年男性常是全天主要甚至唯一分泌事件 | [A] | 10984255 | "in normal men, a sleep-onset-associated pulse is generally the major or even the only daily episode of active secretion" |
| 首夜前半段的分泌集中 | 延迟入睡会把 GH 分泌峰一起推后，峰值仍与最初 SWS 期重合 | [A] | 3406323 | "Delaying sleep onset after 0200 h substantially delayed the GH secretory bursts, which again coincided with the initial periods of SWS." |

“第一个 SWS 期占全天 GH 分泌的百分比”：未找到 —— 检索到的摘要都没有给出这个百分数（8627466 的 70% 是“睡眠期脉冲中与 SWS 重合的比例”，不是“占全天分泌量的比例”，不要混用）。

---

## 5. 瘦素（leptin）与饥饿素（ghrelin）

睡眠限制 2 晚（每晚 4 h，对照 10 h），12 名健康年轻男性，热量与活动受控：

| 量 | 值 | 级别 | PMID | 摘要原句 |
|---|---|---|---|---|
| 瘦素 | −18%（p = 0.04） | [A] | 15583226 | "Sleep restriction was associated with average reductions in the anorexigenic hormone leptin (decrease, 18%; P = 0.04), elevations in the orexigenic factor ghrelin (increase, 28%; P" |
| 饥饿素 | +28% | [A] | 15583226 | 同上 |

补充：5 h 睡眠 × 5 晚也显著降瘦素，但摘要只给 t 值与 p，没有百分比 —— PMID 22988459，"In morning dim light, 5-hour sleep restriction significantly reduced leptin concentrations compared to the baseline, 8-hour sleep/dim-light condition (t(1,32) = 2.9; P = 0.007)."

---

## 6. 睾酮（testosterone）

| 量 | 值 | 级别 | PMID | 摘要原句 |
|---|---|---|---|---|
| 峰→谷的最小跌幅（青年+中年男性各 10/8 人，30 min 采样 24 h） | 43% | [A] | 12780747 | "Both young and middle-aged men displayed a significant diurnal rhythm in all variables, with a minimum fall of 43% in total testosterone from peak to nadir in all subjects." |
| 节律是否随年龄消失 | 否，第 7 个十年仍保留 | [A] | 12780747 | "The study suggests that the diurnal rhythm in these indices of androgen status is maintained in fit, healthy men into the 7th decade of life." |

晨峰相对日间的“幅度（amplitude 参数值）”：未找到 —— 摘要只给了 43% 跌幅，没有给余弦拟合的 amplitude 数值。

---

## 7. 体温与激素的相位差

同一份恒定作息（constant routine）数据，对照女性：

| 量 | 值 | 级别 | PMID | 摘要原句 |
|---|---|---|---|---|
| 直肠温度最低点 | 03:16 | [A] | 9146822 | "The minimum of the fitted rectal temperature rhythm was phase-delayed in the SAD group compared to the controls 5:42 AM vs. 3:16 AM (p < .005)" |
| 皮质醇最低点 | 22:03 | [A] | 9146822 | "The minimum of the cortisol rhythm was phase-delayed in the SAD group compared to the control group, 12:11 AM vs. 10:03 PM (P < .05)" |
| 皮质醇谷比体温谷早 | 03:16 − 22:03 ≈ 5.2 h | [G] | 9146822 | 上面两行相减；摘要未直接写相位差小时数 |

“皮质醇峰比体温峰早/晚多少小时”的原文数字：未找到。多数研究报告的是谷值（CBTmin）与 DLMO 的相位角，皮质醇用谷值对齐；要拿峰对峰，得自己定峰（皮质醇晨峰 vs 体温傍晚峰），摘要里没有这种对照。

---

## 检索缺口（明确写下来，避免以后误当“没这回事”）

1. 内源褪黑素半衰期的直接实测值 —— 只有外源给药 t½，内源只有消除速率常数。
2. 皮质醇“夜间最低 / 白天均值”的原文百分比 —— 只有单研究的绝对浓度，比例是算出来的。
3. 色氨酸耗竭对情绪的效应量数字 —— meta 摘要只写 "moderate"。
4. GH 第一个 SWS 期占全天分泌的百分数 —— 未检索到给出该数字的摘要。
5. 皮质醇峰与体温峰的相位差小时数 —— 只有谷值相位。
