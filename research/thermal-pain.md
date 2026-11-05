# 温度感觉与痛觉：可引用的数值

检索日期 2026-11-05。数据源只有 Europe PMC REST（`/search?...&resultType=core`），
**只读 `abstractText`**，不读全文、不读表格。所以凡是论文把数字放在 Results 表格里的，
这里多半是空的——这是本轮最大的盲区，不是「文献里没有」。

分级沿用 `SOURCES.md` 的约定：

- `S` 教科书 / 多篇独立研究一致
- `A` 单一研究（数值照抄摘要，未跨研究交叉验证）
- `G` 找不到（表里写「未找到」，并在文末列出搜过什么）

---

## 一、检测阈（冷 / 温）

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 可信度 |
|---|---|---|---|---|---|---|
| 冷觉检测阈（method of levels，相对基础皮温） | −0.47 | °C | 33011804 | 2020 | Pain Med | A |
| 冷觉检测阈（method of limits，相对基础皮温） | −1.67 | °C | 33011804 | 2020 | Pain Med | A |
| 冷觉检测阈（健康对照，绝对温度） | 27.2 ± 2.1 | °C | 28128860 | 2017 | Muscle Nerve | A |
| 冷觉检测阈（足背） | 28.6（27.4–29.6） | °C | 31536037 | 2019 | Scand J Pain | A |
| 冷觉阈（MLI，常氧） | 30.3 ± 0.4 | °C | 18365241 | 2008 | Eur J Appl Physiol | A |
| 温觉检测阈（前臂，健康对照） | 35.4（34.3–36.5） | °C | 24412285 | 2014 | Pain | A |
| 温觉检测阈（足背） | 37.7（36.1–39.4） | °C | 31536037 | 2019 | Scand J Pain | A |
| 温觉阈（MLE，常氧） | 32.8 ± 0.9 | °C | 18365241 | 2008 | Eur J Appl Physiol | A |
| 温觉检测阈（对照组） | 34.3 ± 0.9 | °C | 11799504 | 2002 | Reg Anesth Pain Med | A |
| 温觉可察觉的最小变化量 | 2.7（与起始皮温无关） | °C | 20428245 | 2010 | PLoS One | A |

读法：**绝对值差别很大，差值比较稳**。不同研究、不同部位、不同算法（limits vs levels）
报出来的冷觉阈落在 27–30 °C、温觉阈落在 33–38 °C，光看绝对值没法互相引用。
但「相对变化量」集中在 **冷 0.5–1.7 °C、温 2.7 °C** 这个量级。
20428245 的结论值得单独记：温觉是 **difference detector**，察觉的是变化量，
和起始皮温无关；痛觉则不是（见第二节）。

---

## 二、痛阈（冷 / 热）

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 可信度 |
|---|---|---|---|---|---|---|
| 热痛阈（有毛皮肤，9 人 14 次实验） | 41–49 | °C | 6707724 | 1984 | J Neurophysiol | A |
| C 伤害感受器反应阈（14 例中多数） | 41（2 例 43） | °C | 6707724 | 1984 | J Neurophysiol | A |
| 热痛阈（对照，mean ± SD） | 45.0 ± 3.7 | °C | 11799504 | 2002 | Reg Anesth Pain Med | A |
| 热痛阈（第 1–3 次测量 / 第 4–6 次） | 45.9 / 47.7 | °C | 19019713 | 2009 | Eur J Pain | A |
| 热痛阈（健康对照） | 42.3（41.1–43.5） | °C | 24412285 | 2014 | Pain | A |
| 热痛阈量级（两项独立研究的均值 45.0 与 45.9） | ≈45 | °C | 11799504, 19019713 | 2002/2009 | — | S |
| 冷痛阈（有毛皮肤，健康人，mean） | 19.1 | °C | 2812842 | 1989 | Pain | A |
| 冷痛阈（同上，仅 C 纤维传导时） | 22.8 | °C | 2812842 | 1989 | Pain | A |
| 冷痛阈（舌尖，无毛皮肤） | 4.5 ± 2.9（中位 6.4） | °C | 33063218 | 2021 | Clin Oral Investig | A |

两条值得注意的机制：

1. **热痛阈在 45 °C 附近扎堆**，而个体阈值能跨 41–49 °C（6707724 同时记了 C 纤维
   单纤维反应阈，多数 41 °C）——痛阈不是一个点，是一段分布。
2. **冷痛阈的跨部位差异比热痛大得多**：前臂 19.1 °C，舌尖 4.5 °C。这是两个部位，
   不能直接当「同一个人在皮上的散布」读。2812842 做了更有说服力的实验：用压迫阻滞
   把有髓纤维关掉后，冷痛阈从 19.1 抬到 22.8 °C，且「冷痛变烫痛」——说明冷痛的温度
   编码依赖 Aδ 与 C 的**相对**放电，不只是某一路的绝对放电率。

---

## 三、皮肤热物性

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 可信度 |
|---|---|---|---|---|---|---|
| 有效热导率 keff（皮肤 + 皮下脂肪，水浸 15–36 °C 区间的低端 → 高端） | 0.28 ± 0.03 → 0.73 ± 0.14 | W·m⁻¹·K⁻¹ | 1885465 | 1991 | J Appl Physiol | A |
| 有效热导率 keff（肌肉，同区间低端 → 高端） | 0.56 ± 0.05 → 1.91 ± 0.19 | W·m⁻¹·K⁻¹ | 1885465 | 1991 | J Appl Physiol | A |
| 肌肉占前臂总隔热比例 | 92 ± 1 | % | 1885465 | 1991 | J Appl Physiol | A |
| 角质层 / 表皮 热扩散率（光声法） | (4.1 ± 0.8)×10⁻⁴（= 0.041） | cm²·s⁻¹（= mm²·s⁻¹） | 8024119 | 1994 | Analyst | A |
| 组织有效热导率拟合基线 | 0.16 | W·m⁻¹·K⁻¹ | 41186918 | 2025 | Med Phys | A（拟合值，弱） |
| 真皮热导率（单独测值） | 未找到 | W·m⁻¹·K⁻¹ | — | — | — | G |
| 皮下脂肪热导率（单独测值） | 未找到 | W·m⁻¹·K⁻¹ | — | — | — | G |
| 皮肤热渗透系数（绝对值 e） | 未找到 | J·m⁻²·K⁻¹·s⁻⁰·⁵ | — | — | — | G |
| 脂肪厚度对温度分布的影响 | 脂肪越厚，真皮—肌肉温差越大 | — | 18780297 | 2009 | Bioelectromagnetics | A |

**关键的一条**：1885465 是在体（in vivo）测的，前臂水浸 3 h，用有限元解生物热方程
反推 keff。它给出两件事——

- **水浴 ≤ 30 °C 时，keff 与体外死组织文献值没有差别**（与离体组织的文献值一致，说明这一段血流贡献可忽略）；
- **水浴 ≥ 30 °C 时，keff 与血流量 Q 线性相关，r = 0.80，P < 0.001**。

所以「皮肤热导率」不是一个常数，是 `k(T, Q)`。低温段可以当纯传导材料算，
30 °C 以上必须把血流当成一个可调的等效导热项——这正是项目热传导模型缺的那半截。

`8024119` 的 0.041 mm²/s 是**角质层/表皮**的，别拿它当整块皮肤的热扩散率：
角质层含水量低、导得慢，真皮和脂肪会更接近水的量级。摘要里没给真皮值，所以这里留空。

---

## 四、皮肤血流对局部温度的影响

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 可信度 |
|---|---|---|---|---|---|---|
| keff 与血流量的相关（Tw ≥ 30 °C） | r = 0.80，P < 0.001 | — | 1885465 | 1991 | J Appl Physiol | A |
| 局部加温 39 °C 时皮肤血管传导（CVC） | +331 ± 46（对照点）/ +139 ± 31 | % | 8214111 | 1993 | Am J Physiol | A |
| 局部加温 38 °C 时 CVC | +89 ± 15 | % | 8214111 | 1993 | Am J Physiol | A |
| 局部降温 29 °C 时 CVC | −34 ± 8 | % | 8214111 | 1993 | Am J Physiol | A |
| 局部 42 °C 持续 35–55 min → 阻断全身热应激的反射性扩血管 | 定性（完整阻断） | — | 6469780 | 1984 | J Appl Physiol | A |
| 冷水浸泡：指温最低 → CIVD 峰值（回升 ≈2.3） | 10.9 ± 0.4 → 13.2 ± 0.8 | °C | 29500655 | 2018 | Eur J Appl Physiol | A |
| CIVD 振幅（0 °C 水 / 8 °C 水） | 9.2 ± 4.0 / 4.0 ± 2.3 | °C | 25886576 | 2015 | PLoS One | A |
| CIVD 振幅（5 / 8 / 10 / 15 °C 水） | 4.2 ± 2.6 / 3.4 ± 2.0 / 2.1 ± 1.6 / 2.8 ± 2.0 | °C | 23368823 | 2013 | Appl Physiol Nutr Metab | A |
| CIVD 起始时间 | ≈25 | min | 24448777 | 2014 | Int J Biometeorol | A |
| hunting wave 数（30 min 冷水浸泡，指温最低 11.3 ± 0.5） | 2.6 ± 0.4 | 次/30 min | 9404866 | 1997 | Eur J Appl Physiol | A |
| **长时间接触时的温度回升量级** | **2–9（视水温而定）** | °C | 29500655, 25886576 | 2015/2018 | — | S |

这就是「长时间接触会回温」的实测量级：冰水（0–4 °C）里泡手指，指温先掉到 10–11 °C，
然后 CIVD 把它抬回 2–9 °C，30 min 内出现 2–3 次波动。水温越冷、振幅越大
（0 °C 时 9.2 °C，8 °C 时 4.0 °C）。起始大约 25 min。

反过来（温侧），8214111 给的是血流量而不是温度：局部 38–39 °C 让 CVC 涨 89%–331%。
血流量翻倍对应表面温度回升多少度，摘要里没写，我不补。

---

## 五、时间-强度交换

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 可信度 |
|---|---|---|---|---|---|---|
| 血管扩张阈（C 伤害感受器激活的代理）：2 s 平台 vs 64 s 平台 | 39.4 vs 39.6（n.s.） | °C | 9003568 | 1996 | J Physiol | A |
| 热痛阈 vs 升温速率 1–16 °C/s | 无影响 | — | 9874521 | 1998 | Somatosens Mot Res | A |
| 热痛阈 vs 升温速率 3–10 °C/s、有毛/无毛部位 | 无影响 | — | 8821389 | 1996 | Exp Brain Res | A |
| 阈上痛强 vs 时长（46 °C：burning 痛 1.5→3 s 增强；pricking 痛 0.1–3 s 不变） | 方向（仅定性） | — | 9874521 | 1998 | Somatosens Mot Res | A |
| 重复 5 s 接触的强度评分（40 °C / 50 °C） | 2.19 ± 1.22 / 8.93 ± 1.33 | 评分 | 11160525 | 2001 | J Neurophysiol | A |
| 20 × 5 s 刺激：后 5 次强于前 5 次（50 °C；40 °C 无变化） | 定性 | — | 11160525 | 2001 | J Neurophysiol | A |
| 时间总和：重复相位 / 持续相位 | 52.9 ± 11.7 → 80.2 ± 15.5 / 38.5 ± 13.3 → 75.8 ± 18.3 | 评分 | 16540248 | 2006 | Pain | A |
| 45–53 °C 预热 thermode，10 次接触内可达很强疼痛 | 定性（随温度单调） | — | 9307129 | 1997 | J Neurophysiol | A |
| 造成热损伤的条件刺激 | 50 °C × 100 s 或 48 °C × 360 s | °C·s | 6707724 | 1984 | J Neurophysiol | A |
| 「多少度几秒开始痛」的定量曲线 | 未找到 | — | — | — | — | G |

**这一段是对建模最有用的结论**，而且方向明确：

- **阈值端 ≈ 水平检测器**。刺激从 2 s 拉到 64 s（9003568），速率从 1 拉到 16 °C/s
  （9874521）、3 拉到 10 °C/s 并换部位（8821389），**阈值温度基本不动**。
  所以「几度开始痛」不随接触时长明显下移——别按 `T_th(duration)` 去调阈值。
- **阈上端 ≈ 积分器**。温度固定、时间拉长或重复，痛强显著上升
  （11160525 的 50 °C、16540248 的时间总和 +27 到 +37 分、9307129 的 10 次接触）。
  46 °C 这一档只增强 burning 成分、不增强 pricking 成分（9874521）——两个通道分开积分。
- 唯一确定的「时长换温度」是**损伤**，不是痛阈：50 °C 100 s ≈ 48 °C 360 s（6707724）。
  这可以拿来做「多久会烫伤」的判据，不能拿来做痛阈。

---

## 六、Aδ 与 C 纤维

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 可信度 |
|---|---|---|---|---|---|---|
| Aδ 传导速度（人，心理物理估计） | 13 | m/s | 20428245 | 2010 | PLoS One | A |
| C 传导速度（人，心理物理估计） | 0.8 | m/s | 20428245 | 2010 | PLoS One | A |
| Aδ 触发痛阈比 C 高 | 2.5–3 | °C | 20428245 | 2010 | PLoS One | A |
| C 纤维 LEP 传导速度（人，EEG 法 / 反应时法） | 2.4 / 2.8 | m/s | 10467918 | 1999 | Pain | A |
| Aδ / C 传导速度（大鼠 DRG 单纤维） | 2.2–8 / < 1.4 | m/s | 2987489 | 1985 | J Physiol | S |
| Aδ / C（单纤维） | 2–7 / 0.4–2 | m/s | 2754484 | 1989 | J Neurophysiol | S |
| 纤维分组（C / C-Aδ 交界 / Aδ / Aαβ） | < 1.3 / 1.3–2 / 2–12 / > 12 | m/s | 1770443 | 1991 | J Physiol | S |
| 冷感受器 C 纤维（兔角膜） | 0.25–1.6 | m/s | 8410200 | 1993 | J Neurosci | A |

阈值差异（同一篇给的两条）：

- 40 °C 的刺激**高于 C 的热阈、但低于 Aδ 的阈**（10467918）——按教科书的两阶段模型，
  那就是「第一痛快、锐，走 Aδ；第二痛慢、灼，走 C」的窗口；本批摘要只给到阈值排序，
  没给双痛之间的时间差。
- Aδ 的触发阈整体比 C 高 2.5–3 °C（20428245）。人身上测得的 **Aδ 13 m/s、C 0.8 m/s**
  与动物单纤维（Aδ 2–12、C <1.3）差一个量级——人的 13 m/s 是心理物理反推的
  等效值，别当单纤维速度用。

---

## 七、适应速度

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 可信度 |
|---|---|---|---|---|---|---|
| 热痛阈习惯化（6 次重复测量内完成） | 45.9 → 47.7（+1.8） | °C | 19019713 | 2009 | Eur J Pain | A |
| 冷觉阈 / 冷痛阈 跨次变化 | −0.28 / 1.51 | °C | 19019713 | 2009 | Eur J Pain | A |
| 慢速升温时对「暖」的适应（0.3 vs 1 °C/s 的 WDT） | 0.3 °C/s 时 WDT 显著更高 | — | 16191757 | 2005 | Somatosens Mot Res | A |
| 泡温水 / 冷水后感觉减弱的具体分钟数 | 未找到 | min | — | — | — | G |

能说的：

- **热痛通道会习惯化**，而且很快——6 次重复 QST 内阈值抬高 1.8 °C，跨天可重复
  （19019713）。作者推测是外周受体疲劳。
- **冷通道不这样**：CDT 只动 0.28 °C，CPT 只动 1.51 °C，第 2 次之后就稳了。
- **温觉适应只在慢速升温时出现**（16191757）：Method of Levels 下 0.3 °C/s 的 WDT
  显著高于 1 °C/s，快升时测不到适应。方向清楚了，具体时间常数摘要里没给。
- 「泡 40 °C 温水 X 分钟后感觉减弱多少度」这种**分钟级的定量时间常数，摘要里没找到**。
  现有证据只到「重复几次测量」和「斜坡速率」这两个尺度。

---

## 八、搜过什么（可复现）

成功的 query（`ABSTRACT:"..."` 均为短语匹配）：

```
TITLE:"thermal pain threshold"
ABSTRACT:"thermal detection thresholds" AND "reference values"
ABSTRACT:"°C" AND ABSTRACT:"detection threshold"
ABSTRACT:"thermal conductivity"
ABSTRACT:"thermal diffusivity"
ABSTRACT:"skin thermal conductivity"
TITLE:"thermal conductivity" AND TITLE:"skin"
ABSTRACT:"temperature difference threshold" AND ABSTRACT:"skin"
ABSTRACT:"adaptation" AND ABSTRACT:"thermal threshold"
TITLE:"cold pain" AND TITLE:"threshold" AND TITLE:"hand"
ABSTRACT:"cold pain threshold" AND ABSTRACT:"hand" AND ABSTRACT:"°C"
ABSTRACT:"cold pain threshold" AND ABSTRACT:"±"
ABSTRACT:"thermal conductivity" AND ABSTRACT:"epidermis"
ABSTRACT:"thermal conductivity" AND ABSTRACT:"skin" AND ABSTRACT:"fat"
ABSTRACT:"thermal diffusivity" AND ABSTRACT:"dermis"
ABSTRACT:"thermal diffusivity" AND ABSTRACT:"human skin"
ABSTRACT:"thermal conductivity" AND ABSTRACT:"subcutaneous"
ABSTRACT:"effusivity" AND ABSTRACT:"skin"
ABSTRACT:"thermal effusivity"
TITLE:"thermal properties" AND TITLE:"skin"
ABSTRACT:"heat capacity" AND ABSTRACT:"skin" AND ABSTRACT:"perfusion"
ABSTRACT:"cold-induced vasodilation" AND ABSTRACT:"°C"
ABSTRACT:"temperature sensation" AND ABSTRACT:"immersion"
ABSTRACT:"heat pain" AND ABSTRACT:"duration" AND ABSTRACT:"threshold" AND ABSTRACT:"s"
ABSTRACT:"heat pain threshold" AND ABSTRACT:"stimulus duration"
ABSTRACT:"habituation" AND ABSTRACT:"warmth"
ABSTRACT:"thermal conductivity" AND ABSTRACT:"human tissues"
ABSTRACT:"thermal conductivity" AND ABSTRACT:"fat tissue"
ABSTRACT:"effusivity" AND ABSTRACT:"contact"
```

**服务中断的记录（重要）**：检索后半段 Europe PMC search 开始返回
`503 {"errCode":503,"errMsg":"Search service is temporarily unavailable. Please retry later."}`，
带重试退避也一直是 503，直到最后仍不可用。因此：

- 末尾 3 条（human tissues / fat tissue / effusivity+contact）**没跑成**，不算「查过没有」；
- 前面几条返回 0 命中的，如果当时服务已经在降级，**0 命中可能是 503 被吞掉**，
  不能当作「文献里没有」的证据。我把它们列在下面，但不写进表里当结论。

明确失败的检索方向（摘要级）：

- **真皮 vs 皮下脂肪分开的热导率**：`thermal conductivity + dermis/epidermis/adipose/subcutaneous`
  各变体都没有给出 W/m·K 数字。这类数值几乎全在教材（Duck 1990 之类）和论文表格里，
  摘要不写。
- **热渗透系数绝对值**：所有 effusivity 检索只命中材料学与建筑学，皮肤侧只找到
  「低 e 材料摸起来更舒服」的方向性结论（34890830），没有 e 的数值。
- **痛阈对刺激时长的定量曲线**：没有一篇给出「X °C × Y s = 开始痛」的等式。
  能确定的是阈值几乎不随时长变（第五节的四条），所以这条曲线可能本来就不存在。
- **分钟级温度适应时间常数**：没有「泡 N 分钟后感觉减弱 M °C」的摘要数据。

已有脚本：`/tmp/scan5.mjs`（query → 筛出含单位与数字的句子，带重试与状态码），
`/tmp/abs2.mjs <pmid...>`（打印全文摘要），`/tmp/t.mjs <query>`（只查连通性）。
