# 体内稳态：可量化参数 —— 文献表

> 规则：只收录**摘要原文里明确出现的数字**。摘要没有的数不写；区间原样保留，不取中位数。
> 派生值（除法、换算）单列，标 `[G]` 或 `[A]`，并写出算式。
> 采集时间：2026-11-05（UTC）
> 数据源：Europe PMC REST（`resultType=core`，`EXT_ID` 取摘要）。本轮回退未使用。

---

## 一、检索记录

| 查询 | 结果 |
| --- | --- |
| `TITLE:"plasma osmolality" AND ABSTRACT:"thirst"` | **命中 29344350（阈值系统综述）** |
| `ABSTRACT:"thirst" AND ABSTRACT:"osmolality" AND ABSTRACT:"threshold"` | 命中 29344350 / 35110290 |
| `ABSTRACT:"osmolality" AND ABSTRACT:"280" AND ABSTRACT:"295"` | **命中 39941427（正常范围）** |
| `ABSTRACT:"plasma osmolality" AND ABSTRACT:"285" AND ABSTRACT:"thirst"` | **命中 3791867（阈值 281）** |
| `TITLE:thirst AND ABSTRACT:"body weight" AND ABSTRACT:dehydration` | 8 条，均无 %BML 阈值 |
| `TITLE:"mild dehydration" AND ABSTRACT:"thirst"` | **命中 33141048（0.5 %BML 起渴感）** |
| `ABSTRACT:"thirst" AND ABSTRACT:"drinking" AND ABSTRACT:"min" ...` | **命中 3591984 / 9227585（消退时延）** |
| `TITLE:"sweating threshold"` | 8 条，多为药物/绝经，仅 19423839 讲方法 |
| `ABSTRACT:"shivering threshold" AND ABSTRACT:"humans" AND ABSTRACT:"core temperature"` | **命中 16675509 / 14695722（三阈值同测）** |
| `ABSTRACT:"onset of sweating" AND ABSTRACT:"esophageal temperature"` | **命中 9272768（β=0.1）** |
| `TITLE:"normal body temperature"` | **命中 30976605（系统综述）** |
| `ABSTRACT:"heart rate" AND ABSTRACT:"beats per minute" AND ABSTRACT:"degree" ...` | **命中 31536050（7.2 bpm/°C）** |
| `AUTH:"Crandall CG" AND ABSTRACT:"heart rate" AND ABSTRACT:"core temperature"` | **命中 40087302（400+ 研究元分析）** |
| `ABSTRACT:"rate of rise" AND ABSTRACT:"core temperature"` | 8 条，仅 30039995 给 °C·km⁻¹（不可换算），**33273272 给 60 min ΔTre** |
| `ABSTRACT:"respiratory rate" AND ABSTRACT:"breaths per minute" AND ABSTRACT:"normal"` | **命中 31082106（12–20）** |
| `ABSTRACT:"resting respiratory rate" AND ABSTRACT:"healthy adults"` | 1 条，无正常值 |
| `ABSTRACT:"ventilatory response to CO2" AND ABSTRACT:"l/min/mmHg"` | **命中 2135218 / 24612621（斜率）** |
| `TITLE:"ventilatory equivalent"` | 8 条全为临床预后（心衰/脱机），**无健康运动值** |
| `ABSTRACT:"ventilatory equivalent" AND ABSTRACT:"exercise" AND ABSTRACT:"healthy"` | 8 条，摘要均无 VE/VO₂ 数值 |
| `ABSTRACT:"VE/VO2" AND ABSTRACT:"exercise"` | 8 条，无正常值 |
| `ABSTRACT:"C-tactile" AND ABSTRACT:"skin temperature"` | **命中 24553929**（未及取摘要，见 §四） |
| `ABSTRACT:"tactile" AND ABSTRACT:"cooling" AND ABSTRACT:"threshold"` | 无「冷→两点辨别阈」数值 |
| `ABSTRACT:"tactile acuity" AND ABSTRACT:"skin temperature"` | 8 条，无温度-敏度数值 |
| `TITLE:dehydration AND ABSTRACT:cognitive AND ABSTRACT:"body mass"` | **命中 29933347（元分析）** |

**汇总：27 个 query，直接产出可用数值的 14 个。两处硬缺口：健康人运动中的 VE/VO₂ 当量、皮肤温度对触觉阈值的影响。**

---

## 二、数值表

### 1. 口渴（渗透压驱动）

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 级 |
| --- | --- | --- | --- | --- | --- | --- |
| 血浆渗透压 · 正常范围 | 280–295（维持在 ±5 % 内） | mOsm/kg H₂O | 39941427 | 2025 | J Clin Med | S |
| 渴感阈值 · pOsm（12 项试验 / 167 人合并） | **285.23 ± 1.29**（95 % CI） | mOsm/kg | 29344350 | 2018 | Perioper Med | S |
| 渴感阈值 · pOsm（10 人盐水输注，回归截距） | 281 | mOsm/kg | 3791867 | 1986 | Clin Sci | A |
| 渴感斜率（阈值以上） | 0.54 ± 0.07（SEM） | cm VAS / (mOsm/kg) | 29344350 | 2018 | Perioper Med | S |
| 渴感斜率（另一研究） | 0.3，r = 0.92 | cm VAS / (mOsm/kg) | 3791867 | 1986 | Clin Sci | A |
| AVP 释放阈值 | 284.3 ± 0.71（95 % CI） | mOsm/kg | 29344350 | 2018 | Perioper Med | S |
| 渴感出现 · 体重丢失 | **≈0.5 %**（限水开始约 4 h 后；渴、口干、想喝水逐级增强） | % 体重 | 33141048 | 2021 | Physiol Behav | A |
| 该研究终点体重丢失 | 1.67 kg = 2.12 % | % 体重 | 33141048 | 2021 | Physiol Behav | A |
| 脱水强度对照（运动+热，2 h） | 28.6 ± 1.4 ml/kg = 2.86 %；pOsm +7.8 ± 0.6；血浆量 −4.7 %；渴感 +7.6 cm | — | 9227585 | 1997 | Am J Physiol | A |
| 喝水后渴感消退 | **≤5 min 内显著下降**；20 min 时 7.7→1.0 cm，pOsm 306→304（P=0.17，无显著变化） | cm VAS / min | 3591984 | 1987 | Am J Physiol | S |
| 口咽反射（不改变 pOsm 的抑制） | 再水化 5 min 内 AVP 与渴感反射性下降 | min | 9227585 | 1997 | Am J Physiol | A |

### 2. 体温调节

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 级 |
| --- | --- | --- | --- | --- | --- | --- |
| 核心温度 · 直肠（均值 ± 2SD） | **36.32–37.76** | °C | 30976605 | 2019 | Open Forum Infect Dis | S |
| 核心温度 · 鼓膜 | 35.76–37.52 | °C | 30976605 | 2019 | Open Forum Infect Dis | S |
| 核心温度 · 口腔 | 35.73–37.41 | °C | 30976605 | 2019 | Open Forum Infect Dis | S |
| 核心温度 · 腋下 | 35.01–36.93 | °C | 30976605 | 2019 | Open Forum Infect Dis | S |
| 老年人（≥60）偏低 | −0.23 | °C | 30976605 | 2019 | Open Forum Infect Dis | S |
| 出汗阈值（核心温，皮肤温校正到 34 °C） | **37.4 ± 0.4** | °C | 16675509 | 2006 | Br J Anaesth | S |
| 血管收缩阈值（同上） | 37.0 ± 0.5 | °C | 16675509 | 2006 | Br J Anaesth | S |
| 寒战阈值（同上） | **36.3 ± 0.5** | °C | 16675509 | 2006 | Br J Anaesth | S |
| 出汗起始 T_es · 静息（皮肤 36.8 °C） | 37.1 ± 0.1 | °C | 9272768 | 1997 | Eur J Appl Physiol | A |
| 出汗起始 T_es · 运动中（皮肤 30.9 °C） | 36.7 ± 0.2 | °C | 9272768 | 1997 | Eur J Appl Physiol | A |
| 出汗起始 T_es · 运动后 | 37.3 ± 0.1 | °C | 9272768 | 1997 | Eur J Appl Physiol | A |
| 皮肤温对出汗的权重 β | **0.1**（β/(1−β) = 0.111） | 无量纲 | 9272768 | 1997 | Eur J Appl Physiol | A |
| 核心温每 +1 °C 的心率增量 | **7.2 ± 0.4**（校正年龄/SpO₂/MAP 后 6.4 ± 0.4；高热段 7.4 ± 0.9） | bpm/°C | 31536050 | 2019 | Acute Med | A |
| 核心温每 +1 °C 的呼吸增量 | 1.4 ± 0.1（校正后 1.2 ± 0.1） | 次/min/°C | 31536050 | 2019 | Acute Med | A |
| 被动/主动加热 · 核心温升幅（中位） | 0.9（IQR 0.5–1.3） | °C | 40087302 | 2025 | Nat Commun | S |
| 被动/主动加热 · 心率升幅（中位） | 27（IQR 15–40） | bpm | 40087302 | 2025 | Nat Commun | S |
| 加热时 HR/ΔTc（由上两行相除） | ≈30（27/0.9） | bpm/°C | 40087302 | 2025 | Nat Commun | G |
| 运动 60 min 的 ΔTre · 23 °C / 7.5 W·kg⁻¹ | 0.83 ± 0.14 | °C | 33273272 | 2021 | Med Sci Sports Exerc | A |
| 运动 60 min 的 ΔTre · 33 °C / 5.5 W·kg⁻¹ | 0.51 ± 0.14 | °C | 33273272 | 2021 | Med Sci Sports Exerc | A |
| 运动 60 min 的 ΔTre · 33 °C / 7.5 W·kg⁻¹ | 0.77 ± 0.20 | °C | 33273272 | 2021 | Med Sci Sports Exerc | A |
| 平均升温速率（ΔTre/60 min） | 0.0085 – 0.0139 | °C/min | 33273272 | 2021 | Med Sci Sports Exerc | A |

### 3. 呼吸

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 级 |
| --- | --- | --- | --- | --- | --- | --- |
| 静息呼吸频率 · 成人 | **12–20** | 次/min | 31082106 | 2024 | StatPearls | S |
| 病案记录里的"正常"取值 | 18 与 20（36 966 次住院，分布非正态 → 记录不准） | 次/min | 28652259 | 2017 | BMJ Qual Saf | A |
| CO₂ 通气反应斜率 · 对照再呼吸（静息） | 2.08 ± 0.71 | L/min/mmHg | 24612621 | 2014 | Respir Med | A |
| CO₂ 通气反应斜率 · 对照（运动） | 2.05 ± 0.98 | L/min/mmHg | 24612621 | 2014 | Respir Med | A |
| CO₂ 通气反应斜率 · 5 名正常人 | +1.82 ± 0.43 → +2.2 ± 0.29（用药前后，NS） | L/min/mmHg | 2135218 | 1990 | Pulm Pharmacol | A |
| PetCO₂ = 50 mmHg 时的通气量 | 9.42 ± 3.3 | L/min | 2135218 | 1990 | Pulm Pharmacol | A |
| 通气当量 VE/VO₂（健康人运动） | **未找到**（8 条检索全为心衰/脱机预后；仅 ICU 脱机研究给 VEqO₂ 25.3–25.5 L/L，不可外推） | — | — | — | — | G |

### 4. 皮肤血流与触觉

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 级 |
| --- | --- | --- | --- | --- | --- | --- |
| 皮肤温度下降 → 触觉阈值 / 两点辨别阈 | **未找到** | — | — | — | — | G |
| 冷觉的选择性诱发（方法学，无阈值） | — | — | 36476749 | 2023 | J Neurosci Methods | G |
| C 触觉传入纤维被"抚摸温度"调谐（标题层面） | 摘要未取，不填数 | — | 24553929 | 2014 | J Neurosci | G |

### 5. 脱水与认知 / 情绪

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 级 |
| --- | --- | --- | --- | --- | --- | --- |
| 脱水对认知的总效应（33 研究 / 280 个 ES / 413 人） | ES = **−0.21**（95 % CI −0.31 ~ −0.11） | 标准化均差 | 29933347 | 2018 | Med Sci Sports Exerc | S |
| 脱水 >2 % 体重丢失时的效应 | ES = **−0.28**（−0.41 ~ −0.16） | 同上 | 29933347 | 2018 | Med Sci Sports Exerc | S |
| 脱水 ≤2 % 体重丢失时的效应 | ES = −0.14（−0.27 ~ 0.00，不显著） | 同上 | 29933347 | 2018 | Med Sci Sports Exerc | S |
| 受累域（>2 % BML） | 注意、执行功能、运动协调 | — | 29933347 | 2018 | Med Sci Sports Exerc | S |
| 脱水 1 %–6 % 体重丢失 | 该元分析纳入的脱水幅度区间 | % BML | 29933347 | 2018 | Med Sci Sports Exerc | S |
| 复水后的主观反转（30 min，1.46 ± 0.47 L） | 渴感/口干反转，热感觉转凉、满足感、胃充盈上升 | — | 33141048 | 2021 | Physiol Behav | A |

---

## 三、逐项说明

### 1. 口渴阈值：两个数不冲突，别混着用

- **285.23 ± 1.29 mOsm/kg**（29344350）是 12 项试验、167 人的合并值，附 95 % CI，是目前最该引的那个。
  原文：`The value ±95% CI for the pOsm threshold for thirst sensation was found to be 285.23 ± 1.29 mOsm/kg.`
- **281 mOsm/kg**（3791867）是单研究回归截距，作者自己强调 `much lower than in previous studies`。
  用于建模时它给出的是**线性外推的零点**，不是「到 281 就开始渴」的阶跃点。
- 阈值以上是**连续线性**，不是开关：斜率 0.54 cm/(mOsm/kg)（29344350）或 0.3（3791867）。
  代码里如果做成 `if (pOsm > T) thirst++` 的阶跃，和文献不符。
- 正常范围 280–295（39941427）与阈值 285 只差 10 mOsm/kg —— **窗口很窄**，
  所以「喝一口水就不渴了」在生理上成立，不是 bug。
- **0.5 % 体重丢失**就够让渴感开始上升（33141048，n=18，限水 4 h）。
  这个数比教科书常说的「1–2 % 才明显」低，性质不同：它测的是 VAS 上的**起始变化**，不是「明显口渴」。

### 2. 喝水后的消退：分钟级，且先于渗透压变化

3591984（n=7，高钠血症诱导）给得最干净：`within 5 min of drinking both plasma vasopressin and thirst were significantly lower`；
20 min 时渴感 7.7→1.0 cm，而 pOsm 306→304（P=0.17，**不显著**）。

机制是口咽/胃部的预先抑制（9227585 用鼻饲 vs 正常喝 vs 喝了又抽出来三组做了拆分：
`Reflex inhibition of [AVP]p and thirst occurred within 5 min of rehydration in Con and Ext ... but not during Inf`）。

建模含义：渴感要挂在**「喝水动作」**上，不能只挂在 pOsm 上。延迟取 **2–5 min** 有文献，取 20 min 是把渗透压那条也算了进去。

### 3. 体温：三个阈值挤在 1.1 °C 里

16675509 在同一批志愿者身上同时测了三个阈值（皮肤温校正到 34 °C）：
出汗 37.4 ± 0.4、血管收缩 37.0 ± 0.5、寒战 36.3 ± 0.5。

也就是说**出汗到寒战之间只有约 1.1 °C 的"死区"**。这个区间窄到模型里几乎不能留给"舒适"用，
真实人体是靠皮肤温、皮肤血流速率、行为（穿衣、开空调）在填，而不是核心温自己有带宽。

- 皮肤温的权重：9272768 的公式里 `beta for sweating = 0.1`，即
  `T_es(calculated) = T_es + [0.1/0.9](T_sk − 36.5)`。
  换算下来**皮肤温降 1 °C ≈ 核心阈值升 0.11 °C**（等价性，非直接测量）→ 标 A。
- 运动时出汗阈值**先降后升**：36.7（运动中）→ 37.3（运动后）。别把静息阈值当常数用。
- 心率：临床发热队列给 **7.2 bpm/°C**（31536050，n=4493，`ΔHR/°C ... was 7.2±0.4 beats per minute`）。
  加热实验元分析给的中位数是 0.9 °C 对 27 bpm（40087302），相除 ≈30 bpm/°C。
  **两者差 4 倍，不要合并。** 前者是发热（调定点上移），后者是热应激（调定点不动、靠散热），
  生理机制不同。要建模"热应激下的心率"，用 27 bpm / 0.9 °C 那组的方向，但只能当 `[G]`。
- 升温速率：33273272 的 60 min 数据反算是 **0.009–0.014 °C/min**（中等强度、可补偿热应激）。
  注意这是**60 min 平均**，不是瞬时斜率 —— 真实曲线是前 20 min 陡、后面趋平。

### 4. 呼吸

- 静息 12–20 次/分是教科书口径（31082106）。但 28652259 用 36 966 次住院数据说明：
  病案里的呼吸频率**根本不是测出来的**，全堆在 18 和 20 两个值上。
  拿它当"正常值"没问题，拿它当"测量精度"就不行。
- CO₂ 反应有三组独立值：2.08 ± 0.71、2.05 ± 0.98（24612621）、1.82 ± 0.43（2135218），
  都在 **1.8–2.1 L/min/mmHg** 一档，可作为 `[A]` 的共识区间。
- **VE/VO₂ 没查到健康人的值。** 检索到的全是心衰/肺移植/脱机的预后研究。
  唯一带数字的 31489359 是 ICU 自主呼吸试验人群（25.3–25.5 L/L），人群不对，不填。
  如果模型要"通气随代谢线性上升"，可以先用 `VE ≈ 25–30 × VO₂` 的老口径，但**这条没有 PMID**，只能标 `[G]`。

### 5. 皮肤温度与触觉：这一块是空缺

三个方向都查了（C-tactile 与皮肤温、冷刺激与触阈、触觉锐度与皮肤温），**摘要层面没有可用的阈值数据**。
检索命中了 24553929（*Human C-tactile afferents are tuned to the temperature of a skin-stroking caress*），
按标题正是要找的东西，但摘要未取，本表不填任何数。

如果代码里现在有"皮肤一冷、触觉变钝"的系数（比如 `touchGain *= f(Tsk)`），
**它目前没有出处**，应标 `[G]`，且只能保证方向。

### 6. 脱水与认知：效应小但一致

29933347 是 33 项研究、280 个效应量的元分析。总效应 **−0.21**（小效应），
>2 % 体重丢失时 **−0.28**，≤2 % 时 −0.14 且 95 % CI 跨 0。
受累的是注意、执行功能、运动协调 —— 不是"变笨"，是"坐不住、算得慢"。

33141048 补了主观侧：0.5 % 就开始渴，复水 30 min 内心境与热感觉一起反转。
所以「脱水 → 情绪」这条链在 **0.5 %** 量级就有信号，而「脱水 → 认知」要到 **2 %** 才稳定。

---

## 四、给代码的落地建议

1. **渴感**用连续量：`thirst = k * max(0, pOsm - 285)`，k 取 0.54 cm/(mOsm/kg)（29344350）。
   再乘一个「刚喝过水」的抑制项，时间常数 2–5 min（3591984）。别做成阶跃。
2. **体温**三阈值：出汗 37.4、血管收缩 37.0、寒战 36.3（16675509），
   三者都随皮肤温平移，系数 0.111 °C 核心 / °C 皮肤（9272768 的 β=0.1 换算，`[A]`）。
3. **心率**：发热/热应激分开建模。发热 7.2 bpm/°C（`[A]`，31536050）；热应激别用 30 bpm/°C 的硬数。
4. **呼吸**：静息 12–20 次/分（`[S]`）；CO₂ 斜率 1.8–2.1 L/min/mmHg（`[A]`）；
   VE/VO₂ 先挂 `[G]`，标明无出处。
5. **触觉随皮肤温的变化**目前**无出处**，保持 `[G]`。
