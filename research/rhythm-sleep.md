# 昼夜节律与睡眠：可量化参数

调研日期 2026-11-05。检索源 Europe PMC（PubMed 摘要）。**规则：只写摘要里出现过的数字**；
摘要里没有的一律写「未找到」，不用常识补。每条数字后跟 PMID 与英文原句。

标注沿用 `SOURCES.md` 的三级：`[S]` 可引用 / `[A]` 只能说方向 / `[G]` 估的。

---

## 1. 核心体温（core body temperature）日曲线

| 量 | 值 | 级 | 出处 |
|---|---|---|---|
| 最低点（nadir）时刻 | **约 05:00**（常规定时作息、改良恒定routine） | S | PMID 15038855 |
| 最低点时刻（可穿戴/直肠实测） | 5.8 ± 1.7 h（直肠）/ 5.9 ± 1.6 h（胸贴） | A | PMID 40964223 |
| 最低点相对习惯就寝时刻 | 4:57 ± 0:33 h post-habitual bedtime（健康对照女性） | A | PMID 11238482 |
| 峰谷差（°C） | **未找到** | — | — |
| 最高点（acrophase）时刻 | **未找到**（体温）；相邻指标见下 | — | — |

原文：

- PMID 15038855（J Biol Rhythms 2004，14 人，48 h 改良恒定 routine）：
  > "Individual curves were adjusted to the group mean temperature minimum time of 0500 h and averaged to create the 4 mean curves."
- PMID 40964223（Sleep Sci 2025，16 人，真实环境 3–5 天，60 对 trough）：
  > "The mean CBT trough comparison was 5.9 ± 1.6 hours in the CALERA Research sensor and 5.8 ± 1.7 hours in the rectal probe."
- PMID 11238482（2001，10 例纤维肌痛 + 12 例健康对照，控制光照/姿势/进食）：
  > "...and 5:19 +/- 0:19 and 4:57 +/- 0:33, respectively, for core body temperature phases."
  （单位是 hours post habitual bedtime；两组无显著差异。）

**能替代「最高点」的一条**（不是体温，别混用）：PMID 8092328（1994，7 名男性，34 h 恒定 routine）
> "Heat production and heart rate were phase locked with a maximum at 1100-1200 h."
同一摘要还说体温节律与产热/散热节律**不同相**：
> "These physiological circadian rhythm parameters, as well as biochemical parameters ... were phase advanced by 25-180 min with respect to the circadian rhythm in rectal temperature."
所以「体温最高点在傍晚」这句话，在这批摘要里**没有直接证据**。

**峰谷差 °C：未找到。** 检索到的相关摘要只给相对变化，不给绝对值，例如
PMID 11404278（酒精研究）："alcohol consumption induced a very significant hyperthermic effect (+0.36 degrees C) during the night and thereby reduced the circadian amplitude of core body temperature by 43%."
这是「幅度被削 43%」，不是幅度本身，不能倒推。

---

## 2. 皮质醇晨峰（CAR）

| 量 | 值 | 级 | 出处 |
|---|---|---|---|
| 峰值时刻 | 醒来后 **30 min 内**达到峰（采样窗口 30–60 min） | S | PMID 9416776 |
| 相对基线增幅 | **+50–75%** | S | PMID 9416776 |

原文 PMID 9416776（Life Sci 1997，三项独立研究，n=152，唾液 10/15 min 采样）：
> "In all three studies, free cortisol levels increased by 50-75% within the first 30 minutes after awakening in both sexes on all days."
> "Premenopausal women consistently showed a stronger increase with a delayed peak after awakening compared to men on all days."
> "Neither age, weight, nor smoking showed an effect on baseline or peak cortisol levels."

机制侧（无数字）PMID 20026350：CAR 与「醒来瞬间 HPA 轴启动 + 肾上腺对 ACTH 敏感性翻转」有关。

---

## 3. 两过程模型（Borbély）

| 量 | 值 | 级 | 出处 |
|---|---|---|---|
| Process S 累积/衰减时间常数 | **未找到**（摘要未给 tau 数值） | — | — |
| Process C 周期（体温） | 24 h 13 min ± 15 min（健康对照） | S | PMID 27312974 |
| Process C 周期（褪黑素） | 24 h 22 min ± 15 min（健康对照） | S | PMID 27312974 |
| Process C 的睡眠倾向幅度 | 98.5%（峰，约 05:20）↔ 64.9%（谷，约 21:20），均值 82.3% | S | PMID 22621352 |

原文：

- PMID 27312974（80 h 超短日恒定 routine，18 名对照）：
  > "DSWPD patients had significantly longer melatonin rhythm taus (24 h 34 min ± 17 min) than controls (24 h 22 min ± 15 min, p = 0.03, d = 0.70)."
  > "These results were further supported by longer temperature rhythm taus in DSWPD patients (24 h 34 min ± 26 min) relative to controls (24 h 13 min ± 15 min, p = 0.01, d = 0.80)."
- PMID 22621352（28 h 强制去同步，27 名男性，控制组 13 人）：
  > "For the control group, there was a clear circadian rhythm in sleep propensity, with a peak of 98.5% at 5° (~05:20 h), a trough of 64.9% at 245° (~21:20 h), and an average of 82.3%."
  > "In contrast, sleep propensity for the sleep restriction group was relatively high at all circadian phases, with an average of 96.7%."
  这条对项目最有用：**睡不够时，Process C 的调制几乎被压平**（96.7% 均值，最低也有 91.3%）。

Process S 侧唯一拿到的量化是「睡眠剥夺后的慢波活动增量」PMID 16335485（36 h 清醒，恢复睡眠）：
> "Sleep deprivation resulted in a stronger increase of slow-wave activity (EEG power 0.6-4.6 Hz, marker for sleep homeostatic pressure) in Tanner 5 (39% above baseline) than in Tanner 1/2 adolescents (18% above baseline)."
这是 sleep pressure 的**测量代理**，不是 tau，只能定向用 `[A]`。

---

## 4. 睡眠债 / 警觉度

| 量 | 值 | 级 | 出处 |
|---|---|---|---|
| 警觉度开始按「清醒时长」线性累积的拐点 | 清醒 **15.84 h**（s.e. 0.73 h）以上 | S | PMID 12683469 |
| 6 h/夜 × 14 天的代价 | 认知缺损 ≈ **连续 2 晚完全不睡** | S | PMID 12683469 |
| PVT 反应时/失误数在 X 小时后的具体绝对值 | **未找到** | — | — |

原文 PMID 12683469（Sleep 2003，n=48，4/6/8 h 卧床 × 14 天 + 3 晚 0 h）：
> "A statistical model revealed that, regardless of the mode of sleep deprivation, lapses in behavioral alertness were near-linearly related to the cumulative duration of wakefulness in excess of 15.84 h (s.e. 0.73 h)."
> "Since chronic restriction of sleep to 6 h or less per night produced cognitive performance deficits equivalent to up to 2 nights of total sleep deprivation..."
> "Subjective sleepiness ratings showed an acute response to sleep restriction but only small further increases on subsequent days, and did not significantly differentiate the 6 h and 4 h conditions."
最后一句很关键：**主观困倦饱和了，客观失误还在涨** —— 模型里主观和客观两条曲线必须分开。

40 h 不睡的研究（PMID 16453981）只报了年龄×时长的交互（年轻人一晚不睡后 PVT 速度下降更多），摘要无具体毫秒数，未采用。

---

## 5. 褪黑素

| 量 | 值 | 级 | 出处 |
|---|---|---|---|
| DLMO 相对就寝 | **约睡前 2 h**；醒来后约 14 h | S | PMID 15600132 |
| 抑制半最大效应所需光照 | **约 100 lx**（约为 9000 lx 亮光的 1%） | S | PMID 10922269 |
| 抑制的绝对阈值（最低多少 lux 起效） | **未找到**（只知 40–1000 lx 范围内剂量依赖） | — | — |
| 作用光谱峰 | 446–477 nm | S | PMID 11487664 |

原文：

- PMID 15600132（16 名年轻健康人，按习惯作息一周）：
  > "The DLMO occurred about 2 hours before bedtime and 14 hours after wake."
- PMID 10922269（Zeitzer 2000，23 人，晚间 6.5 h 单次光照）：
  > "...we found that half of the maximal phase-delaying response achieved in response to a single episode of evening bright light (approximately 9000 lux (lx)) can be obtained with just over 1 % of this light (dim room light of approximately 100 lx). The same held true for the acute suppressive effects of light on plasma melatonin..."
- PMID 30803301（40–1000 lx、0.5–3 h）：
  > "As for threshold, it takes longer to observe significant melatonin suppression at lower CS levels than at higher CS levels."
  → 只能支持「越暗越慢」，没有阈值数字。
- PMID 11487664（627 次单色光测试）：
  > "...identifies 446-477 nm as the most potent wavelength region providing circadian input for regulating melatonin secretion."

---

## 6. 午后低谷（post-lunch dip）

| 问题 | 结论 | 级 | 出处 |
|---|---|---|---|
| 是否真实存在 | **是**，且不依赖吃午饭、不依赖知道时间 | S | PMID 15892914 |
| 幅度（KSS 分 / PVT 毫秒） | **未找到** | — | — |
| 时段 | 早午后出现睡眠倾向小峰，傍晚 20:00 出现谷 | S | PMID 8795795 |

原文：

- PMID 15892914（Monk 2005 综述）：
  > "The post-lunch dip is a real phenomenon that can occur even when the individual has had no lunch and is unaware of the time of day. This dip has its roots in human biology, and may be linked to the size of the 12-hour harmonic in the circadian system."
- PMID 8795795（14 人恒定 routine + 24 h 内多次睡眠试验）：
  > "The eight subjects with both 24-h and 12-h rhythms showed a minor peak of sleep propensity in the early afternoon followed by a though in the early evening (20.00 hours)."
  （原文 "though" 应为 "trough" 的排版错误。）
  > "Of the 14 healthy, good sleeping subjects 13 had significant 24-h cosine rhythms of sleep propensity. Eight of these also had a significant 12-h cosine rhythm."
  → 12 h 谐波只在 **8/14** 的人身上显著，所以「人人都有午后低谷」不成立，`[A]` 都算勉强，模型里应做成个体参数。

---

## 7. 明确「未找到」的条目

1. 人体核心体温的**峰谷差（°C）** —— 摘要里没有绝对值。
2. 核心体温**最高点的钟点** —— 只有产热/心率在 11:00–12:00 达峰，体温本身没有。
3. Process S 的**累积/衰减时间常数（tau）** —— 两过程模型综述摘要不含数值。
4. 清醒 X 小时后 **PVT 反应时/失误数的具体数值**。
5. 褪黑素抑制的**绝对光照阈值（lux）**（只有半最大 ~100 lx）。
6. 午后低谷的**量化幅度**（KSS 分或 PVT 毫秒）。

---

## 8. 给 soma 的落地建议（不含新数字）

- 体温曲线：nadir 定在 **05:00** 可用 `[S]`；acrophase 和幅度只能先按 `[G]` 设（因为查不到），
  并且代码里那条常数的注释要写明「幅度无摘要出处」。
- CAR：醒来 +30 min 内抬到基线的 1.5–1.75 倍，`[S]`。
- Process C：周期用 24 h 13 min（体温）/ 24 h 22 min（褪黑素），`[S]`；
  幅度用「睡眠倾向 98.5% ↔ 64.9%」这个 0–1 区间的映射，`[S]`，但注意它是睡眠倾向不是体温。
- 睡眠债：以 **15.84 h** 为累积起点做线性累加，`[S]`；主观困倦要单独设饱和上限，
  否则模型会低估损伤（依据同上 PMID 12683469）。
- 褪黑素：DLMO = 就寝 − 2 h；光照抑制用 logistic，半最大落在 ~100 lx，`[S]`；
  阈值那条留参数、别写死。
