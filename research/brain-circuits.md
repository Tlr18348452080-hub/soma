# 大脑里与身体感觉直接耦合的回路：可引用的数值

检索日期 2026-11-05。数据源只有 Europe PMC REST（`resultType=core` 的
`abstractText`），**只读摘要**，不读全文、不读表格、不读补充材料。
所以凡是论文把数字放进 Results 表格的，这里通常是空的 —— 这是本轮最大的盲区，
不是「文献里没有」。查不到的条目一律写「未找到」，不拿常识补。

分级沿用 `SOURCES.md`：

- `S` 教科书 / 多篇独立研究一致的汇总量（meta-analysis、systematic review 的池化值）
- `A` 单一研究（数值照抄摘要，未跨研究验证）
- `G` 估的 / 未找到（表里写「未找到」，文末列出搜过什么）

---

## 一、下行疼痛调制（DNIC / CPM）

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 可信度 |
|---|---|---|---|---|---|---|
| CPM 对压力痛阈（PPT）的抬升 | +66.3 ± 10.0 | % | 29913755 | 2011 | Scand J Pain | A |
| CPM 对疼痛耐受阈（PPTol）的抬升 | +32.6 ± 4.6 | % | 29913755 | 2011 | Scand J Pain | A |
| CPM 对 VAS 疼痛评分的压低 | −41.5 ± 5.3 | % | 29913755 | 2011 | Scand J Pain | A |
| CPM 个体间变异系数（inter-CV） | 41.4–60.1 | % | 29913755 | 2011 | Scand J Pain | A |
| CPM 个体内变异系数（intra-CV，VAS，冷压） | 27.0 | % | 29913755 | 2011 | Scand J Pain | A |
| CPM 后效应持续时间（7 °C 冷压，阈值 −10/100） | 32 | min | 33987521 | 2021 | Can J Pain | A |
| CPM 后效应持续时间（12 °C 冷压，阈值 −10/100） | 20 | min | 33987521 | 2021 | Can J Pain | A |
| CPM 后效应持续时间（7 °C，阈值 −20/100） | 16 | min | 33987521 | 2021 | Can J Pain | A |
| CPM 后效应持续时间（12 °C，阈值 −20/100） | 9 | min | 33987521 | 2021 | Can J Pain | A |
| 热痛阈在 30 s 冷浸（5 °C）后的可测效果时长（健康对照） | 到第 4 分钟 | min | 32649294 | 2020 | J Basic Clin Physiol Pharmacol | A |
| 「正常 CPM」的判定切点（PPT 降幅） | >75（≈14% 基线） | kPa | 42080990 | 2026 | Eur J Pain | A |
| CPM 效应量（0 °C vs 7 °C 条件刺激，PPT） | d = 0.52 | Cohen's d | 42080990 | 2026 | Eur J Pain | A |
| CPM 重测信度（ICC，压力痛） | 0.25–0.37 | ICC | 41868690 | 2026 | Pain Rep | A |
| CPM 响应者分类在两次测量间翻转的比例 | 38 | % | 41868690 | 2026 | Pain Rep | A |
| 膝骨关节炎患者 vs 对照的局部 CPM 效率 | SMD −0.55（−0.86, −0.24） | SMD | 40517980 | 2025 | J Pain | S |

原文摘录：

- 29913755 — «CPP induced the most powerful CPM on PPT (66.3 ± 10.0% increase), VAS ratings (41.5 ± 5.3% reduction) and PPTol (32.6±4.6% increase), especially at TA, and resulted in the smallest inter-CV (41.4-60.1%).»  /  «The smallest intra-CV value was obtained in pain ratings with CPP (27.0%).»  n=12 名健康男性。
- 33987521 — «CPM hypoalgesia, when defined as a reduction in pain levels >10/100, did not last longer following the more intense 7°C CPT compared to the 12°C CPT (32 min vs. 20 min, respectively; P = 0.06)»  /  «similar results were obtained when CPM hypoalgesia was defined as a reduction in pain levels of >20/100 (16 min following the 7°C CPT vs. 9 min following the 12°C CPT; P = 0.33)». n=20，60 s 热刺激为测试刺激，5 min 一次复测。原文结论：更痛的条件刺激并**没有**换来更长的时程。
- 32649294 — «While in healthy controls, the effect lasted till the 4th minute.»（条件刺激为对侧足 5 °C 冷水浸 30 s，测试量为面部热痛阈；这是「短条件刺激」端，和 33987521 的 20–32 min 不是同一量级。）
- 42080990 — «Conditioning with 0°C water led to stronger inhibition of pressure pain threshold (PPT) than conditioning with 7°C water (Cohen's d = 0.52)»  /  «decrease by more than 75 kPa or 14% of baseline»（摘要此句在 "baseline P" 处被截断，按 PPT 补全方括号前请勿改写数值）。同一句还写：所有结局的 95% CI 都包含「易化」一侧，即正常人里也有 CPM 为负的。
- 41868690 — «Conditioned pain modulation effects were robust for both changes in PDT and PTT»  /  «poor for CPM effects (ICC = 0.25-0.37)»  /  «with 38% of participants switching classification for both PDT and PTT». 324 名健康人、8 项研究合并。
- 40517980 — «Very low-certainty evidence suggests lower local CPM efficiency with a moderate effect size (556 patients and 379 controls; SMD = -0.55 [-0.86 to -0.24]; p = 0.00)». 证据确定性「very low」，别当强结论用。

读法：**CPM 的「抬高多少 %」对测试量极其敏感**。同一个范式，压力痛阈涨 66%，
疼痛耐受阈只涨 33%，VAS 只是掉 41%。所以 soma 里给 CPM 建模，不要把「一个百分数」
套到所有通道上，要按「阈值型 vs 评分型」分开。时程的两个数（4 min vs 20–32 min）
差了一个数量级，差别在条件刺激长度（30 s vs 数分钟）和判定阈值（−10/100 vs −20/100），
不是实验误差 —— 判定放得松，时长就报得长（同文 P = 0.008）。信度很差（ICC 0.25–0.37），
这一条很重要：CPM 是**群体水平**的量，不能当个体的稳定参数。

---

## 二、安慰剂与期望

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 可信度 |
|---|---|---|---|---|---|---|
| 安慰剂对疼痛评分的效应（个体级 meta，n=603） | g = −0.66（−0.80, −0.53） | Hedges' g | 30073258 | 2018 | JAMA Neurol | S |
| 安慰剂对伤害性特异神经标志 NPS 的效应（同上） | g = −0.08（−0.15, −0.01） | Hedges' g | 30073258 | 2018 | JAMA Neurol | S |
| 安慰剂起效的试验比例（疼痛评分） | 17 / 20（85%） | 比例 | 30073258 | 2018 | JAMA Neurol | S |
| 安慰剂改变 NPS 的试验比例 | 3 / 20（15%） | 比例 | 30073258 | 2018 | JAMA Neurol | S |
| 机制类安慰剂研究的平均效应量 | 0.95 | 效应量 | 12406519 | 2002 | Pain | S |
| 临床试验（仅以安慰剂作对照）的平均效应量 | 0.15 | 效应量 | 12406519 | 2002 | Pain | S |
| 物理/心理干预 sham 的短期安慰剂效应 | SMD 0.21（0.1–0.33） | SMD | 37985188 | 2024 | Eur J Pain | S |
| 安慰剂占治疗短期总疗效的比例 | 39 | % | 37985188 | 2024 | Eur J Pain | S |
| 中期/长期随访的安慰剂效应 | 无（未检出） | — | 37985188 | 2024 | Eur J Pain | S |
| 开放标签安慰剂（OLP）的响应者比例 | 40.6 | % | 36165878 | 2023 | Pain | A |
| 个体安慰剂反应可被基线/试验参数解释的方差 | 20–25 | % | 40310873 | 2025 | Pain | S |

原文摘录：

- 30073258 — «Placebo treatments showed significant behavioral outcomes on pain ratings in 17 of 20 studies (85%) and in the combined sample (g = -0.66 [95% CI, -0.80 to -0.53]).»  /  «However, placebo effects on the NPS response were significant in only 3 of 20 studies (15%) and were very small in the combined sample (g = -0.08 [95% CI, -0.15 to -0.01]).»  /  «indicate that placebo treatments affect pain via brain mechanisms largely independent of effects on bottom-up nociceptive processing.» 20 项研究、603 名健康人的个体数据 meta。
- 12406519 — «Magnitudes of placebo analgesic effects were much higher in the latter (mean effect size=0.95) as compared to the former (mean effect size=0.15) and were significantly different (P=0.003).»（后者 = 14 项研究安慰剂**机制**的研究；前者 = 23 项只把安慰剂当对照的临床试验。）
- 37985188 — «The average short-term placebo effect was small (0.21 SMD, 0.1-0.33 95% CI, p = 0.0002, 1440 participants).»  /  «Overall, placebo analgesia accounted for 39% of treatments' short-term effectiveness.»  /  «No placebo effects were found at medium-term (7 RCTs, 381 participants) or long-term follow-up (3 RCTs, 173 participants).»
- 36165878 — «Although 59.4% of the subjects did not respond to the open-label placebo, 40.6% showed a substantial response.»  /  «a hidden injection of 10 mg naloxone could reverse placebo analgesia compared with a hidden injection of saline solution.»
- 40310873 — «Together, predictors explained 20% to 25% of the individual variance in placebo responses, whereas 75% to 80% remained unaccounted for.» 11 项 RCT、2768 例慢性疼痛患者。

**预期 vs 实际的分离**（这条是本节的结论，比上面的百分数更有用）：

| 发现 | 数值 | 出处(PMID) | 可信度 |
|---|---|---|---|
| 阿尔茨海默病患者：期望被完整保留（开放 vs 隐藏给药，P = 0.008 / P < 0.001），但**没有**镇痛效应（P = 0.44） | 见左 | 37703397 | A |
| 健康对照：同一范式下有安慰剂镇痛（P = 0.01） | — | 37703397 | A |
| 无意识（掩蔽）线索同样能诱发安慰剂/反安慰剂效应 | 见左 | 23019380 | A |

- 37703397 — «Healthy participants obtained a placebo effect ( P = 0.01)»  /  «Patients with AD did not obtain a placebo effect ( P = 0.44) nor a significant nocebo effect ( P = 0.86).»  /  «The same expectation effects were seen in patients with AD (open vs hidden lidocaine, P = 0.008; open vs hidden capsaicin, P < 0.001).»（n=21 AD + 26 健康；开放/隐藏利多卡因与辣椒素 × 自然史对照。）
- 23019380 — «Significant placebo and nocebo effects were found in both experiment 1 (using clearly visible stimuli) and experiment 2 (using nonconscious stimuli), indicating that the mechanisms responsible for placebo and nocebo effects can operate without conscious awareness of the triggering cues.»

读法：**预期不是充分条件**。AD 病人的「我以为会好一点」照常出现，镇痛却消失 ——
所以 soma 里不能把「期望值」直接当「镇痛量」的输入，中间还有一段需要完好的
前额叶—脑干通路。反方向的证据也一致：安慰剂把主观评分拉低了中等幅度
（g≈−0.66），但伤害性特异的神经签名几乎不动（g≈−0.08），也就是**改的是评价，不是输入**。
另外机制研究（0.95）和临床研究（0.15）的效应量差 6 倍 —— 引用安慰剂效应时必须
写明是哪一种场景，否则 6 倍误差。

---

## 三、恐惧学习与消退

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 可信度 |
|---|---|---|---|---|---|---|
| 形成条件恐惧所需的最少配对次数 | 1 | 次 | 27960093 | 2017 | Behav Res Ther | A |
| 人类消退训练「短」方案 | 10 | trials | 31243481 | 2019 | Psychopharmacology | A |
| 人类消退训练「长」方案 | 25 | trials | 31243481 | 2019 | Psychopharmacology | A |
| 消退记忆检索测试距消退的间隔 | 7 | 天 | 42557391 | 2026 | Mol Psychiatry | A |
| 自发恢复测试与消退之间的常用间隔 | ~24 | 小时 | 42500404 | 2026 | Front Behav Neurosci | S |
| 自发恢复综述纳入的研究数 | 242 | 篇 | 42500404 | 2026 | Front Behav Neurosci | S |
| 「达到消退标准」的判据 | 条件反应完全消失 | — | 31243481 | 2019 | Psychopharmacology | A |

原文摘录：

- 27960093 — «we found evidence of strong fear after a single conditioning trial (fast learning) as well as attenuated fear responding when only half of the trained stimulus combination was presented (specific learning).»（单次配对即可，指标为在线电击预期评分、皮电、惊跳反射调制。）
- 31243481 — «an experiment with a short (10 trials, experiment 1) and long (25 trials, experiment 2) extinction session.»  /  «post-extinction L-DOPA compared to placebo administration reduced conditioned responses at test only in participants showing a complete reduction of conditioned fear at the end of extinction.»（三天范式：day1 习得，day2 消退 + 给药，day3 测试。）
- 42557391 — «we conducted a six-arm randomized, triple-blind, placebo-controlled intervention study in 180 healthy participants who underwent a 3-day Pavlovian fear conditioning paradigm.»  /  «NaBu facilitated later retrieval of extinction memory after seven days»  /  «emerging only when participants had been exposed to a high number of trials.»
- 42500404 — «paradigms involving a ~ 24-h delay between extinction and spontaneous recovery test (typically conducted across two consecutive days) are most frequently used and might produce the strongest effects.»

**未找到**：习得阶段「标准需要几次配对才能达到学习标准」的定量答案。
查到的摘要只给方案规模（如 3 天范式、10/25 trials 的消退段），没有一篇把
「几次配对到标准」写成数字。唯一能确定的是**下界为 1 次**（27960093）。

读法：恐惧是**一次就够**的学习，消退是**几十次**才够的抑制，而且抑制会自己退回去
（自发恢复，常用 24 h 尺度）。这三件事不对称，正是 soma 里「急性威胁 vs 慢性适应」
应该分开建模的理由。消退 trial 数在 10 与 25 之间时，药理学增强剂的效果就从
「无效」变成「有效」（42557391 的 "high number of trials" 依赖），说明消退不是线性过程。

---

## 四、注意对感觉的增益

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 可信度 |
|---|---|---|---|---|---|---|
| 分心（电子游戏）对冷压痛耐受的改善 | partial η² = 0.41 | η² | 30422807 | 2019 | Scand J Pain | A |
| 同样的分心对疼痛**强度**评分的改善 | 未给出数值 | — | 30422807 | 2019 | Scand J Pain | G |
| 高工作记忆负荷（2-back）降低疼痛强度与 S1/S2 激活 | 方向确定，无数值 | — | 41180365 | 2025 | J Pain Res | A |
| 内感受聚焦（MIET）与分心都能降低冷压痛强度/不愉快度、提高耐受 | 方向确定，无数值 | — | 40737987 | 2025 | Behav Res Ther | A |
| 注意指向条件刺激（而非测试刺激）时 CPM 更有效 | 定性（meta） | — | 39541722 | 2024 | Clin Psychol Rev | S |
| 分心对 CPM 本身的影响 | 无（meta 结论：不受影响） | — | 39541722 | 2024 | Clin Psychol Rev | S |
| 注意某部位时该部位触觉/痛觉阈值下降的 % | 未找到 | % | — | — | — | G |
| 分心任务使痛强度降低的 % | 未找到 | % | — | — | — | G |

原文摘录：

- 30422807 — «Participants experienced improvement in pain tolerance from baseline to distraction in both display modality conditions (p<0.001, partial η2=0.41)»；n=164，冷压痛。同一句后文：VR 头盔 vs 普通屏幕的差异只是趋势（p=0.057）。
- 41180365 — «High load WM significantly reduced both the perceived pain intensity and nociceptive neural activation in the primary sensorimotor cortex (SM1) and secondary somatosensory cortex (S2).» n=35。
- 40737987 — «The MIET and distraction task both improved pain tolerance while reducing pain intensity and aversiveness.» n=160，三臂随机。
- 39541722 — «meta-analyses showed that CPM is more efficient when attention is directed towards the CS versus the TS, and is not influenced by distraction.» 24 篇纳入。

读法：**注意改的是「耐受」和「不愉快」，不是「阈值」**。分心能让人多忍一会儿
（η²=0.41 是大效应），但摘要里没有一篇给出「阈值下降 X%」的数字 —— 那个数字多半
在全文表格里，本轮读不到，所以这一行老实标 `G`，不要拿 η² 去顶百分数。

---

## 五、习惯化 vs 敏化

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 可信度 |
|---|---|---|---|---|---|---|
| 同一部位重复热刺激 → 习惯化；跨部位重复 → 敏化 | 方向相反、同时存在 | — | 24768695 | 2014 | J Pain | A |
| 该动态模型对组均值疼痛评分的解释方差 | 93 | % | 24768695 | 2014 | J Pain | A |
| 刺激间隔（ISI） | ~20 | 秒 | 24768695 | 2014 | J Pain | A |
| 习惯化是否依赖刺激温度 | 是（temperature-dependent） | — | 24768695 | 2014 | J Pain | A |
| 时间总和（TSP）范式用过的刺激频率数 | 31 种，0.03–200 | Hz | 39239632 | 2024 | Pain Rep | S |
| 持续刺激时长范围 | 5–1080 | 秒 | 39239632 | 2024 | Pain Rep | S |
| 习惯化在电生理上的表现 | N2-P2 振幅下降 | — | 37851343 | 2024 | Pain | A |
| 习惯化「多久出现」的统一时间常数 | 未找到 | — | — | — | — | G |
| 敏化所需的「频率下限」统一值 | 未找到（>0.33 Hz 是常见惯例，摘要未给） | — | — | — | — | G |

原文摘录：

- 24768695 — «repeated stimulations of the same skin site produced temperature-dependent habituation, whereas repeated stimulations across different sites produced sensitization.»  /  «Stimulation trials were separated by ∼20 seconds, and sensitization was unrelated to the distance between successively stimulated sites, suggesting that neither temporal nor spatial summation occurred.»  /  «The model explains 93% of the variance in the group-mean pain ratings after controlling for current stimulation temperature». n=100。
- 39239632 — «Repeated stimuli were applied using 31 different frequencies (0.03-200 Hz) and sustained stimulations ranging from 5 to 1080 seconds were used.»  /  «Temporal summation of pain protocols vary excessively, hindering the comparison and pooling of results.» 406 项研究。
- 37851343 — «Electroencephalography studies showed habituation of the N2-P2 amplitude»；63 项研究，结论是「habituation 在方法学上差异极大」。

读法：**方向取决于「是不是同一个点」**，不是取决于刺激强弱。同一个点反复打 → 降；
换着点打 → 升。这条对 soma 很关键：模型里必须记住「上一次刺激落在哪个部位」，
只记强度会把这个现象整个丢掉。至于「多久降一半」，摘要里没有，标 `G`。

---

## 六、运动后镇痛（EIH）与内源性阿片

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 可信度 |
|---|---|---|---|---|---|---|
| 有氧运动的 EIH（健康人，实验痛） | g = −0.85（−1.58, −0.13） | Hedges' g | 32599154 | 2021 | J Pain | S |
| 动态抗阻运动的 EIH | g = −0.45（−0.69, −0.22） | Hedges' g | 32599154 | 2021 | J Pain | S |
| 等长运动的 EIH | g = −0.16（−0.36, 0.05），不显著 | Hedges' g | 32599154 | 2021 | J Pain | S |
| 纳洛酮（0.8 mg iv）对运动镇痛的影响 | 基本无影响；仅臂运动后有一段早期、短暂的阈值回落 | — | 3486546 | 1986 | Acta Physiol Scand | A |
| 阿片机制对运动镇痛的贡献 | 「只能是部分介导」 | — | 3486546 | 1986 | Acta Physiol Scand | A |
| 安慰剂镇痛的阿片依赖性（开放标签安慰剂被纳洛酮反转） | 见第二节 | — | 36165878 | 2023 | Pain | A |

原文摘录：

- 32599154 — «In healthy individuals, aerobic exercise caused large EIH (7 studies, 236 participants; g = -.85 [-1.58, -.13]), dynamic resistance exercise caused small EIH (2 studies, 23 participants; g = -.45 [-.69, -.22]), and isometric exercise did not cause EIH (3 studies, 177 participants; g = -.16 [-.36,.05]).»
- 3486546 — «These changes in pain threshold were unaffected following injections of either naloxone or saline, except for an early and short-lasting reduction when naloxone was injected following arm exercise.»  /  «The pain threshold increase after arm exercise could only be partially mediated by endorphinergic mechanisms.» n=11，牙痛阈，腿/臂运动 20 min，低频 TENS 30 min。

读法：**「运动镇痛 = 内啡肽」这个说法只对了一小半**。效应本身很大（有氧 g=−0.85，
和安慰剂 g=−0.66 同量级），但纳洛酮几乎不挡 —— 说明书里常写的那条通路至多是
部分贡献。安慰剂镇痛倒是能被纳洛酮反转（36165878），所以「阿片」这个词在这两个
场景里不能互换。

---

## 本轮搜过但没拿到数字的清单

字段语法（Europe PMC，`resultType=core`），命中但摘要无数值的都记在这里：

1. `TITLE:"conditioned pain modulation" AND ABSTRACT:"effect size"` — 命中 42080990 等，只有 Cohen's d，无 %
2. `ABSTRACT:"conditioned pain modulation" AND ABSTRACT:"average reduction"` — 0 命中
3. `ABSTRACT:"conditioned pain modulation" AND ABSTRACT:"percent reduction"` — 0 命中
4. `ABSTRACT:"diffuse noxious inhibitory controls" AND ABSTRACT:"percent"` — 0 命中
5. `ABSTRACT:"placebo analgesia" AND ABSTRACT:"percent"` — 0 命中（安慰剂 % 值全在表格里）
6. `TITLE:"fear conditioning" AND ABSTRACT:"how many trials"` — 0 命中
7. `ABSTRACT:"tactile detection threshold" AND ABSTRACT:"attention"` — 0 命中
8. `ABSTRACT:"habituation" AND ABSTRACT:"pain" AND ABSTRACT:"within minutes"` — 0 命中
9. `ABSTRACT:"wind-up" AND ABSTRACT:"Hz" AND ABSTRACT:"human"` — 命中但摘要只谈机制，无频率阈值
10. `ABSTRACT:"exercise" AND ABSTRACT:"naloxone" AND ABSTRACT:"pain threshold"` — 命中 3486546 等，无 % 效应量

教训：这批课题的百分数几乎全部放在 Results 表格里，摘要只写「显著/方向」。
要拿到「抬高多少 %」，必须读全文表格 —— 本轮的网络配方只能到摘要，所以
凡是标 `G` 的行，是**读不到**，不是**不存在**。
