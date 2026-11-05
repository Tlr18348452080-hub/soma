# 月经周期：可量化的参数

检索日期 2026-11-05。数据源 Europe PMC REST + NCBI E-utilities，**只读 `abstractText`**，
不读全文、不读表格。所以凡是把数字放在 Results 表里的论文，这里一律拿不到——
这是本轮最大的盲区，不是「文献里没有」。

分级沿用 `SOURCES.md`：

- `[S]` 教科书 / 多篇独立研究一致（含 meta 分析的方向性结论）
- `[A]` 单一研究，数值照抄摘要，未交叉验证
- `[G]` 估的 / 方法可疑，不能当数据引用
- 「未找到」= 摘要里确实没出现这个数，不要用常识补

---

## 一、周期长度与各期天数

| 量 | 数值 | 单位 | PMID | 年份 | 期刊 | 级 |
|---|---|---|---|---|---|---|
| 平均周期长度（卵泡期+黄体期） | 29.3 | 天 | 31482137 | 2019 | NPJ Digit Med | S |
| 卵泡期平均长度 | 16.9（95%CI 10–30） | 天 | 31482137 | 2019 | NPJ Digit Med | S |
| 黄体期平均长度 | 12.4（95%CI 7–17） | 天 | 31482137 | 2019 | NPJ Digit Med | S |
| 周期长度「正常」入组范围 | 21–35 | 天 | 26082480 | 2015 | Hum Reprod | A |
| 月经期（出血）长度 | 4.5 ± 1.4 | 天 | 21560310 | 2011 | 卫生研究 | A |

样本量要说清楚：31482137 是 124,648 人、612,613 个排卵周期的 app 数据，
是本轮唯一一个「大样本 + 同时给出卵泡期和黄体期」的来源，所以周期长度这一项给 S。

> "we analysed 612,613 ovulatory cycles with a mean length of 29.3 days from 124,648 users.
> The mean follicular phase length was 16.9 days (95% CI: 10-30) and mean luteal phase length
> was 12.4 days (95% CI: 7-17)." — 31482137

> "Women aged 18-44 years, with self-reported BMI between 18 and 35 kg/m(2) and cycle lengths
> between 21 and 35 days, were included in the study." — 26082480

> "The average menstrual period was (4.5 +/- 1.4) days." — 21560310

注意两件事，别当成矛盾：

1. **卵泡期可变、黄体期相对固定**。29.3 = 16.9 + 12.4，但卵泡期的 95%CI 宽到 10–30 天，
   黄体期只有 7–17。所以周期长短的变异基本全在卵泡期这一侧——模拟时应该让「排卵前的
   天数」抖，而不是让黄体期抖。
2. 21–35 天这个范围来自一篇队列研究的**入组标准**，不是一篇专门定义正常值的文献。
   作为「常见区间」够用，作为「诊断界值」不够。

---

## 二、激素曲线

| 量 | 数值 | 单位 | PMID | 年份 | 期刊 | 级 |
|---|---|---|---|---|---|---|
| E2 卵泡早期最低值 | 39.9 ± 11.8 | pg/mL | 16435345 | 2006 | J Orthop Res | A |
| E2 排卵前峰值 | 199.6 ± 54.9 | pg/mL | 16435345 | 2006 | J Orthop Res | A |
| E2 卵泡中期（day 8.0 ± 1.4） | 46.3 ± 8.9 | pg/mL | 35429247 | 2022 | Calcif Tissue Int | A |
| E2 黄体中期（day 22.0 ± 2.5） | 67.3 ± 23.4 | pg/mL | 35429247 | 2022 | Calcif Tissue Int | A |
| E2 黄体中期（另一研究，day 21–22） | 109.3 ± 15.7 | pg/mL | 37522690 | 2023 | Eur Rev Med Pharmacol Sci | A |
| P4 卵泡期 | 4.12 ± 2.36 | ng/mL | 35429247 | 2022 | Calcif Tissue Int | A |
| P4 黄体中期 | 11.86 ± 4.49 | ng/mL | 35429247 | 2022 | Calcif Tissue Int | A |
| 尿 LH 峰值范围 | 13.5–73.0 | mIU/mL | 11092703 | 2000 | Int J Fertil Womens Med | A |
| LH 峰后到排卵（≤24 h） | 80（8/10 人） | % | 11092703 | 2000 | Int J Fertil Womens Med | A |
| LH 峰后到排卵（≤48 h） | 100（10/10 人） | % | 11092703 | 2000 | Int J Fertil Womens Med | A |

> "Minimum levels of E (39.9+/-11.8 pg/mL) and P (0.61+/-0.27 ng/mL), coupled with peak
> concentrations of E (199.6+/-54.9 pg/mL) and T (22.5+/-10.5 ng/dL) explained 57.6% of the
> change in K(Lax) across the cycle." — 16435345

> "resting estradiol concentrations increased from 46.3 ± 8.9 pg·mL-1 in the FP to
> 67.3 ± 23.4 pg·mL-1 in the LP (p = 0.015), and resting progesterone increased from
> 4.12 ± 2.36 ng·mL-1 in the FP to 11.86 ± 4.49 ng·mL-1 in the LP" — 35429247

> "The mid-luteal E2 and P statistically decreased from 109.3±15.7 pg/mL" — 37522690

> "Peak urinary LH values by RIA ranged from 13.5 mIU/mL to 73.0 mIU/mL." — 11092703

> "Follicular collapse occurred within 24 hours of the urinary LH peak in 8 of 10 (80%) and by
> 48 hours in the remaining 2 subjects." — 11092703

读法（这几条要紧）：

1. **E2 有两个峰，不是一个。** 排卵前那个大峰（约 200 pg/mL），加黄体中期一个**小得多的**
   次峰（67–109 pg/mL，两项研究差 1.6 倍）。模拟里如果把黄体期 E2 画成和排卵前一样高，
   就错了——低一个量级才对。
2. **黄体期 E2 的具体值文献分歧明显**（67.3 vs 109.3 pg/mL，测的是同一天段）。
   方向（先降后小升）可靠，绝对值只能标 [A]，别在视频里报精确数。
3. P4 的「卵泡期 4.12 ng/mL」偏高——多数教科书会讲卵泡期接近 1 ng/mL 以下。
   这个数照抄自摘要（day 8，n=10），可能受 assay 或取样日影响，**不要单独拿它当卵泡期基线**。
   能用的是「黄体中期 ≈ 12 ng/mL」和它的离散度。
4. **LH 那个 13.5–73.0 是尿 LH，不是血清 LH**（n=11，RIA 定量）。血清 LH 峰值通常更高，
   但本轮没找到摘要里直接给出血清峰值的文献。这一项只能当「量级参考」，别当血清值用。
5. 排卵时点：80% 发生在尿 LH 峰后 24 h 内，全部在 48 h 内。**「LH 峰 → 排卵」这一段是
   可测的、离散不大的**，比「周期第 14 天排卵」靠谱得多（后者假设 28 天周期）。

---

## 三、基础体温（BBT）双相

| 量 | 数值 | 单位 | PMID | 年份 | 期刊 | 级 |
|---|---|---|---|---|---|---|
| 卵泡期→黄体期核心体温升幅 | 0.31 ± 0.18 | °C | 41624353 | 2025 | Front Sports Act Living | A |
| BBT 升幅（华氏，原文） | 0.7–1.3 | °F | 16295726 | 2005 | Nepal Med Coll J | G |
| 同一数值换算 | 0.39–0.72 | °C | 16295726 | 2005 | Nepal Med Coll J | G |
| 月经第 1 天 BBT 下降的周期比例 | 80 | % | 35065994 | 2022 | Steroids | A |
| 排卵前 3→2 天 BBT 已开始升的周期比例 | 41 | % | 35065994 | 2022 | Steroids | A |
| BBT 与尿 PDG 的相关 | r = 0.53 | — | 35065994 | 2022 | Steroids | A |
| BBT 停止随 PDG 上升的阈值 | ≈10 | µg/mg Cr（PDG） | 35065994 | 2022 | Steroids | A |

> "detecting all ovulations and showing the largest temperature rise from follicular to luteal
> phase (0.31 ± 0.18 °C)" — 41624353（连续阴道内核心体温，n=17）

> "decreases in PDG and BBT on the first day of menses were seen in nearly 90% and 80% of
> cycles, respectively" — 35065994（n=107 人 / 283 周期）

> "between the third and the second day before ovulation, PDG and BBT began to rise in 56% and
> 41% of cycles, respectively" — 35065994

> "The basal body temperature (BBT) was increased 0.7 degrees F to 1.3 degrees F during the
> ovulation period" — 16295726

16295726 那条标 G 不是因为它数值离谱，而是那篇的主题是「满月影响胎儿性别」，
BBT 只是顺带测的，没有对照、没有方法学——**数值本身落在常见区间内，但不能引用**。
真正能用的是 41624353 的 0.31 °C。

机制上诚实一点：BBT 升高是**孕酮驱动**的，但 35065994 给的是相关性（r=0.53），
不是因果。而且它在 PDG 超过约 10 µg/mg Cr 之后**就不再涨了**——说明 BBT 是
孕酮的**饱和型**读出，不是线性传感器。模拟里如果让 BBT 正比于 P4 一路涨，会过头。

回落时点：**月经第 1 天**（80% 的周期当天就掉）。这也解释了为什么 BBT 判断排卵
要看「持续升高 3 天以上」，单日高不算。

---

## 四、痛阈随周期变化

| 量 | 数值 | 单位 | PMID | 年份 | 期刊 | 级 |
|---|---|---|---|---|---|---|
| 全刺激类型合并效应量 | ≈0.40 | d | 10431710 | 1999 | Pain | S |
| 卵泡期 vs 排卵期（阈值） | 0.34 | d | 10431710 | 1999 | Pain | A |
| 卵泡期 vs 黄体期（阈值） | 0.37 | d | 10431710 | 1999 | Pain | A |
| 卵泡期 vs 经前期（阈值） | 0.48 | d | 10431710 | 1999 | Pain | A |
| 近期严格控制研究：无相位效应 | 定性 | — | 25899177 | 2015 | Eur J Pain | S |
| 66 人重复测量：多数痛测试无差异 | 定性 | — | 37458377 | 2023 | Am J Physiol | A |

> "The magnitude of the effect was approximately 0.40 across all stimulation." — 10431710

> "comparisons involving the follicular phase were small to moderate (periovulatory phase,
> d(thr) = 0.34; luteal phase, d(thr) = 0.37; premenstrual phase, d(thr) = 0.48)." — 10431710

> "Most of the more recent, well-controlled studies show that menstrual cycle phase has no
> effect on the perception of pain in healthy, pain-free women." — 25899177

> "Only the right ulna pressure test showed a significant reduction in pain threshold (PPTh3)
> during the mL." / "Most pain tests showed no difference between the two subphases" — 37458377

这是本轮**唯一一个有 meta 分析的条目**，但结论是打架的，得原样呈现：

- 1999 年那篇（16 项研究）给出 d≈0.37–0.48，方向是**卵泡期阈值更高、越靠经前越低**。
- 2015 年的综述说，方法学更严的近期研究**基本看不到相位效应**。
- 2023 年 66 人重复测量，四个痛测试里只有一个部位（右尺骨压痛）在黄体中期下降。

怎么用：**方向可以写，幅度不能报。** d≈0.4 是「小到中等」，换算成痛阈大约是几个百分点
的量级，不是「疼一倍」。而且电刺激那一类方向是反的（黄体期阈值最高），说明这不是
「一个统一的痛觉增益旋钮」，更像不同模态各自为政。

模拟建议（标 G，理由见下）：把周期对痛阈的影响做成**很小的**乘性因子（±5% 以内），
并且只作用于机械/压觉通道。这不来自任何一篇文献，是把上面三条折中之后的工程选择。

---

## 五、经前症状（PMS）

| 量 | 数值 | 单位 | PMID | 年份 | 期刊 | 级 |
|---|---|---|---|---|---|---|
| PMS 全球合并患病率 | 47.8 | % | 32809533 | 2023 | StatPearls | A |
| 症状严重到影响日常的比例 | ≈20 | % | 32809533 | 2023 | StatPearls | A |
| 中度到重度（PMS/PMDD）比例 | 5–8 | % | 30335340 | 2026 | 综述 | A |
| 黄体期体重增加 | 未找到 | kg | — | — | — | — |
| 水肿 / 液体潴留量 | 未找到 | L 或 kg | — | — | — | — |
| 乳房胀痛发生率 | 未找到 | % | — | — | — | — |
| 情绪量表效应量 | 未找到 | d | — | — | — | — |

> "The pooled prevalence of reproductive-age women affected with PMS worldwide amounts to
> 47.8%. Among these, about 20% of women experience symptoms severe enough to disrupt their
> daily activities" — 32809533

> "5% to 8% of women develop moderate-to-severe symptoms that result in significant distress
> and functional impairment." — 30335340

> "Symptoms of PMS include changes in appetite, weight gain, abdominal pain, back pain, low back
> pain, headache, swelling and tenderness of the breasts, nausea, constipation, anxiety,
> irritability, anger, fatigue, restlessness, mood swings, and crying." — 32809533

**这条要老实说**：「体重增加」「乳房胀痛」只查到**作为症状被列出**，没查到任何一篇
摘要给了 kg 数或发生率。检索到的都是「有 / 无」级别的描述。所以：

- 能写：PMS 患病率约一半，其中约 1/5 影响日常，5–8% 达到中重度。
- 不能写：「经前平均涨 1–2 kg」这类数字——**那是常识，不是这批文献里的数**。
  真要这个参数，得去找体重日记类研究（daily weight logging），本轮没做。

---

## 六、月经失血量与铁蛋白

| 量 | 数值 | 单位 | PMID | 年份 | 期刊 | 级 |
|---|---|---|---|---|---|---|
| 自报「量多」者的中位失血量 | 66.1（IQR 28.7–122.5） | mL | 40543154 | 2025 | Eur J Obstet Gynecol Reprod Biol | A |
| 同一研究里的 HMB 阈值 | 120 | mL | 40543154 | 2025 | Eur J Obstet Gynecol Reprod Biol | A |
| 女大学生平均失血量（称重法） | 59.3 ± 25.1（范围 24–110） | g | 21560310 | 2011 | 卫生研究 | A |
| 月经期血清铁蛋白 | 17.2 | µg/L | 8237879 | 1993 | Am J Clin Nutr | A |
| 黄体/黄体晚期血清铁蛋白 | 24.0 | µg/L | 8237879 | 1993 | Am J Clin Nutr | A |
| 月经期 vs 黄体晚期血红蛋白 | 130 vs 133 | g/L | 8237879 | 1993 | Am J Clin Nutr | A |
| 月经期 vs 黄体晚期转铁蛋白饱和度 | 21.2 vs 24.8 | % | 8237879 | 1993 | Am J Clin Nutr | A |

> "The median menstrual blood loss per cycle was 66.1 mL (IQR 28.7-122.5 mL), with only 25.3 %
> (20/79) of participants exceeding the heavy menstrual bleeding threshold of 120 mL." — 40543154

> "The average menstrual blood loss was (59.3 +/- 25.1) g, in a range of 24 g to 110 g." — 21560310

> "Adjusted mean values of hemoglobin (Hb), transferrin saturation (TS), and serum ferritin (SF)
> were lowest for women whose blood was drawn during menses and highest for women examined in
> luteal or late luteal phase of the menstrual cycle (Hb = 130 vs 133 g/L; TS = 21.2% vs 24.8%,
> P < 0.01 for both; and SF = 17.2 vs 24.0 micrograms/L, P < 0.05)." — 8237879

三个坑：

1. **单位不统一。** 40543154 是 mL，21560310 是 g（称重法）。血密度略大于 1，
   但**本轮没有文献支持换算**，所以两个数并列放着，不做换算。
2. 40543154 的样本是**自报量多**的人，中位数 66 mL 不能当「正常人平均值」。
   而且同一篇里 HMB 阈值用的是 120 mL——和常见的 80 mL 不一样，说明**阈值本身就有分歧**。
3. 铁蛋白那条是 NHANES II（n=1712），**横断面**：月经期抽血的人铁蛋白低 6.8 µg/L。
   它证明「周期相位会污染铁蛋白读数」，但**不等于「同一个人经期铁蛋白会掉 40%」**——
   个体内的变化幅度这篇没测。要用个体内数据得找纵向研究。

---

## 七、本轮没查到的东西（不是「文献里没有」）

| 缺口 | 搜过什么 | 结果 |
|---|---|---|
| 血清 LH 峰值（mIU/mL） | `"LH peak" AND "mIU/ml"` 等 4 组 | 只有尿 LH（13.5–73.0） |
| 黄体期体重增加 kg | `premenstrual AND "weight gain" AND (kg OR kilograms)` 等 6 组 | 0 命中 |
| 经前水肿量 | `premenstrual AND "water retention"` | 76 篇，摘要均无量化 |
| 乳房胀痛发生率 | `premenstrual AND breast AND (swelling OR tenderness) AND prevalence` | 21 篇，摘要均无百分比 |
| PMS 情绪量表效应量 | `premenstrual AND "effect size" AND (mood OR anxiety)` | 5 篇，摘要无 d 值 |
| 周期相位 × 痛阈的**专门** meta 分析 | `TITLE:"menstrual" AND TITLE:"meta-analysis"` 等 8 组 | 只有 1999 那篇（10431710） |
| 失血量 80 mL 阈值的原始出处 | `"menstrual blood loss" AND "80 mL"` | 112 篇，摘要里没给出处 |

**方法论提示给下一轮**：这类「参考值表」论文（如 16776638，Stricker 2006，
20 人每日采血 + 超声定排卵，按 LH 峰对齐给出各期 5th/50th/95th 百分位）正是最该引的，
但所有数字都在表里、摘要一个都没有——而本轮的工具只能读摘要。要拿这些数，必须读全文表格。
