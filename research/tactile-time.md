# 触觉：时间常数与空间分辨 —— 可引用数值表

> 只收录**摘要原文里明确出现的数字**。摘要没有的数不写；区间原样保留，不取中位数。
> 采集时间：2026-11-05（UTC）
> 数据源：Europe PMC REST（`resultType=core`）+ NCBI E-utilities（`esearch`/`efetch`）。

---

## 一、检索记录

### 通道状况
- Europe PMC REST 在本次采集**中途开始持续返回 503**（`Search service is temporarily unavailable`），
  单次请求与背景队列重试（20 s 间隔 ×10）均失败，约 13:40 UTC 起不可用。
- 回退到 **NCBI E-utilities**（`esearch.fcgi` + `efetch.fcgi`，PubMed 官方接口），
  全程可达，返回 PubMed 原始 XML 摘要。**下文所有 PMID 均为 PubMed 编号，两种源可互查。**
- `web_search` 未使用（按任务说明为坏）。

### 查询与命中率

Europe PMC（字段语法）：

| 查询 | 结果 |
| --- | --- |
| `TITLE:"two-point discrimination" AND TITLE:finger` | 3 条，1 条相关 |
| `TITLE:"two-point discrimination" AND ABSTRACT:tactile` | 8 条，范围多、分部位值少 |
| `TITLE:"two-point discrimination" AND TITLE:normal` | **命中 42921384 / 39345675** |
| `ABSTRACT:"two-point discrimination" AND ABSTRACT:"normative values"` | 命中 42921384 |
| `ABSTRACT:"two-point discrimination" AND ABSTRACT:"palmar"` | 8 条全为手术临床，0 正常值 |
| `ABSTRACT:"two-point discrimination" AND ABSTRACT:"palm" AND ABSTRACT:"forearm"` | 仅 24062677 相关（无具体数值） |
| `ABSTRACT:"two-point discrimination" AND ABSTRACT:"back" AND ABSTRACT:"mm"` | 8 条，无健康人躯干值 |
| `ABSTRACT:"two-point discrimination" AND ABSTRACT:"lips"` | **命中 8171132** |
| `TITLE:lip AND ABSTRACT:"two-point discrimination" AND ABSTRACT:"mm"` | **命中 7991127** |
| `TITLE:"tactile sensibility in the human hand"` | **命中 439026 / 702358（Vallbo）** |
| `ABSTRACT:"innervation density" AND ABSTRACT:"glabrous skin"` | 0 条 |
| `ABSTRACT:"mechanoreceptor density" AND ABSTRACT:"human fingertip"` | 0 条 |
| `ABSTRACT:"Meissner corpuscles" AND ABSTRACT:"density" AND ABSTRACT:"skin"` | 8 条，摘要均无绝对值 |
| `ABSTRACT:"FA-I" AND ABSTRACT:"SA-I" AND ABSTRACT:"density"` | 3 条，无密度值 |
| `ABSTRACT:"cortical magnification" AND ABSTRACT:"primary somatosensory"` | 8 条，仅 33488347 相关且摘要无数值 |
| `ABSTRACT:"cortical magnification" AND ABSTRACT:human` | 8 条，全为视觉皮层 |
| `ABSTRACT:"spatial summation" AND ABSTRACT:tactile` | **命中 16503579 / 12088385 / 23357339** |
| `TITLE:"spatial summation" AND TITLE:tactile` | **命中 16503579 / 12088385** |
| `ABSTRACT:"adaptation" AND ABSTRACT:"slowly adapting" AND ABSTRACT:"Merkel"` | 1 条，蛙类离体，不适用 |
| `ABSTRACT:"tactile" AND ABSTRACT:"adaptation" AND ABSTRACT:"time constant"` | 4 条，全为昆虫机械感受器 |
| `AUTH:"Weinstein S" AND PUB_YEAR:1968` | 8 条全无关 —— **Weinstein 1968 未被 PubMed 收录** |

NCBI E-utilities：

| 查询 | 结果 |
| --- | --- |
| `tactile[tiab] AND habituation[tiab]` | 215 条，前 10 条无"持续压着变麻"的研究 |
| `mechanoreceptor*[tiab] AND "time constant"[tiab] AND skin[tiab]` | **命中 7097579（适应时间常数）** |
| `homunculus[tiab] AND magnification[tiab]` | **命中 32965159** |
| `"cortical magnification"[tiab] AND (digit* OR finger* OR hand)` | 16 条，摘要均无放大倍数数值 |
| `"magnification factor"[tiab] AND (somatosensory OR tactile OR touch)` | 13 条，均无人类数值 |
| `sustained[tiab] AND indentation[tiab] AND afferent*[tiab] AND human[tiab]` | **命中 1127614** |
| `("sustained touch" OR "static touch" OR "sustained pressure") AND adaptation` | **命中 26514637**（15 s 持续压 → 皮层指数衰减） |
| `("tactile adaptation" OR "vibrotactile adaptation") AND ("time constant" OR "time course")` | **命中 2378193（τ = 1.5–2 min）** |
| `"spatial summation"[tiab] AND (tactile OR touch)` | 30 条，**命中 7778407 / 38903739** |
| `mechanoreceptor*[tiab] AND density[tiab] AND (fingertip OR "finger pad")` | **命中 12891672** |
| `("Meissner corpuscles") AND density[tiab]` | 73 条，摘要均无 per-area 绝对值 |
| `"Merkel cells"[tiab] AND density[tiab] AND human[tiab]` | 20 条，仅胎儿足底值（不适用） |
| `"digit representations"[tiab] AND "primary somatosensory"[tiab] AND distance[tiab]` | 5 条，摘要无 mm 数值 |

**汇总：34 个 query，直接产出可用数值的 14 个；5 个目标量（分类型密度、纯知觉习惯化常数、皮层放大倍数、以 mm 计的求和半径）未能在摘要层面取到值。**

---

## 二、数值表

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 可信度 |
| --- | --- | --- | --- | --- | --- | --- |
| 两点辨别阈 · 指尖（全五指范围） | 2–5（众数 3–4；n=492 人 / 984 手） | mm | 42921384 | 2026 | Rev Bras Ortop | A |
| 两点辨别阈 · 指尖（成人均值范围） | 2.78–3.5（n=624） | mm | 39345675 | 2024 | Indian J Plast Surg | A |
| 两点辨别阈 · 指尖（拇指/中指/小指掌侧） | 2.6 | mm | 7089059 | 1982 | Phys Ther | A |
| 两点辨别阈 · 手掌（中部） | 5.39–7.13 | mm | 39345675 | 2024 | Indian J Plast Surg | A |
| 两点辨别阈 · 手背（第一骨间肌表面） | 21.0 | mm | 7089059 | 1982 | Phys Ther | A |
| 两点辨别阈 · 前臂 / 上臂（皮节区均值） | 30.7–45.4 | mm | 7089059 | 1982 | Phys Ther | A |
| 两点辨别阈 · 颈侧 | 35.2 | mm | 3969399 | 1985 | Phys Ther | A |
| 两点辨别阈 · 背部（C7 棘突外侧） | 55.4 | mm | 3969399 | 1985 | Phys Ther | A |
| 两点辨别阈 · 面部（眉弓 / 下颌外侧） | 14.9 / 10.4 | mm | 3969399 | 1985 | Phys Ther | A |
| 两点辨别阈 · 面部外侧与后部 → 唇中线 | 17–25 → 3–7（向唇递减） | mm | 8171132 | 1994 | Plast Reconstr Surg | A |
| 两点辨别阈 · 面部整体范围 | 4.66–19.16 | mm | 39041970 | 2024 | Neurol India | A |
| 两点辨别阈 · 上肢整体范围 | 1.33–68.66 | mm | 39041970 | 2024 | Neurol India | A |
| 空间分辨（光栅朝向）· 唇 | 0.51 | mm 沟宽 | 7991127 | 1994 | Neurology | A |
| 空间分辨（光栅朝向）· 舌 | 0.58 | mm 沟宽 | 7991127 | 1994 | Neurology | A |
| 空间分辨（光栅朝向）· 指尖 | 0.94 | mm 沟宽 | 7991127 | 1994 | Neurology | A |
| 低阈机械感受器总密度 · 指尖 | 241 | 个/cm² | 439026 | 1979 | J Physiol | S |
| 低阈机械感受器总密度 · 手掌 | 58 | 个/cm² | 439026 | 1979 | J Physiol | S |
| 相对密度 · 手掌 : 手指主体 : 指尖 | 1 : 1.6 : 4.2 | 比值 | 439026 | 1979 | J Physiol | S |
| Meissner 小体 · 手掌 / 指尖 | 20 | %（相对指尖计数） | 32647077 | 2020 | Anat Cell Biol | A |
| 全身体感传入纤维总数 | ~230,000（可信区间 200,000–270,000） | 根 | 32965159 | 2020 | J Neurophysiol | A |
| 传入纤维分配 · 双手掌侧皮肤 | 15 | % | 32965159 | 2020 | J Neurophysiol | A |
| 传入纤维分配 · 面与唇周 | 19 | % | 32965159 | 2020 | J Neurophysiol | A |
| 传入纤维随年龄衰减 | 5–8 / 十年 | %/十年 | 32965159 | 2020 | J Neurophysiol | A |
| 指尖有髓末梢密度（含分支，非"传入纤维数"） | 59.0 ± 29.3 | 个/mm² | 12891672 | 2003 | Ann Neurol | A |
| 适应时间常数 · SA（慢适应） | 58 | ms | 7097579 | 1982 | J Physiol | A ※猴 |
| 适应时间常数 · RA（快适应） | 29 | ms | 7097579 | 1982 | J Physiol | A ※猴 |
| 适应时间常数 · PC（Pacinian） | 4.2 | ms | 7097579 | 1982 | J Physiol | A ※猴 |
| SA-I 动态响应阈值 | 0.15–1.35 | mm 压入深度 | 1127614 | 1975 | J Physiol | A |
| SA-I 静态放电阈值 | 0.25 – >2.0 | mm 压入深度 | 1127614 | 1975 | J Physiol | A |
| SA-II 动态 / 静态响应阈值 | 0.25–0.95 / 0.55–1.65 | mm 压入深度 | 1127614 | 1975 | J Physiol | A |
| RA 与 SA-I 感受野尺寸 | 5–10 个乳头嵴 | 个（≈2.5–5 mm，按嵴距 0.5 mm 换算） | 702358 | 1978 | J Physiol | A |
| 知觉习惯化 · 振动适应阈值上升 | 指数上升，时间常数 1.5–2 | min | 2378193 | 1990 | Somatosens Mot Res | A |
| 知觉习惯化 · 持续压 15 s 内皮层反应 | 指数衰减（SA-I 介导）；摘要未给 τ | — | 26514637 | 2015 | BMC Neurosci | A |
| 振动适应 · 适应量与部位 | 机械振动 8 min @40×阈值 → 阈值升高；电刺激无此效应（外周为主） | — | 26581868 | 2016 | J Neurophysiol | A |
| 空间求和 · 300 Hz 触觉（大鱼际） | 接触面积 0.05 → 1.5 cm²，阈值降 ~13 | dB | 16503579 | 2005 | Somatosens Mot Res | A |
| 空间求和 · 面积效应 | 大鱼际 > 指尖（指尖求和更弱） | — | 12088385 | 2002 | Somatosens Mot Res | A |
| 空间求和 · 160 Hz（足底） | 阈值随探头直径 1→3→6→10 mm 单调下降 | mm 直径 | 23357339 | 2013 | Med Eng Phys | A |
| 空间求和 · 20 Hz（足底，非 P 通道） | 随面积无一致变化 | — | 23357339 | 2013 | Med Eng Phys | A |
| 空间求和（运动方向判别，前臂） | 间距 ≥16 mm 时宽探头（15 mm）优于 1 mm 探头 | mm | 7778407 | 1994 | Somatosens Mot Res | A |
| 皮层放大 · 手 vs 躯干 | **未找到**（仅"密度与皮层代表区大小弱相关，但不足以解释手与脸的放大"） | — | 32965159 | 2020 | J Neurophysiol | G |
| 分类型感受器绝对密度（Merkel/Meissner/Pacinian/Ruffini，个/cm²） | **未找到**（仅总密度与相对比值） | — | — | — | — | G |
| 纯知觉习惯化时间常数（"压多久变麻"，独立于外周适应） | **未找到**明确 τ（仅 1.5–2 min 振动适应、15 s 皮层指数衰减） | — | — | — | — | G |

※ 猴 = 恒河猴单纤维记录 + 模型拟合，非人类数据。

---

## 三、逐项说明与缺口

### 1. 两点辨别阈（mm）

覆盖：指尖 2–5 mm；手掌中部 5.39–7.13 mm；前臂 30.7–45.4 mm；背部（C7 外侧）55.4 mm；唇 3–7 mm。

- **指尖**：三项独立研究互相吻合（2–5 mm 范围 / 均值 2.78–3.5 mm / 2.6 mm），可作为稳定引用值。
- **手掌**：只有 39345675 给出 "mid-palm" 数值；7089059 的 21.0 mm 是**手背**第一骨间肌表面，不可当手掌用。
- **背部**：3969399 的量表是"颈部与躯干"，55.4 mm 对应 C7 棘突外侧，是本表里唯一可直接引用的背部值。
  其余检索到的背部 TPD 文献只报告信度（ICC），不报阈值。
- **嘴唇**：8171132 的 3–7 mm 是"向唇中线"的值（n=116）；同文面部外侧/后部为 17–25 mm。
  7991127 的 0.51 mm 是**光栅朝向法**，与两点辨别不是同一测量，不能混用。
- **Weinstein 1968 未取到**：该书章（Kenshalo 编 *The Skin Senses*）不在 PubMed 索引内，
  `AUTH:"Weinstein S" AND PUB_YEAR:1968` 的 8 条命中全部无关。表中数值均为可检索的替代研究。

### 2. 感受器密度（个/cm²）

- 只取到**总密度**：指尖 241、手掌 58（439026，正中神经单纤维记录 + 组织学模型）。
- **分类型绝对值未找到**。439026 摘要只给总密度与相对比值（1 : 1.6 : 4.2），
  并说明"差异主要由 RA 与 SA-I 两种小感受野单位造成，PC 与 SA-II 近乎均匀分布"——
  这是定性结论，摘要里没有四类的 per-cm² 数字，故不填。
- 32647077 给出的是**相对值**（手掌 Meissner 计数 ≈ 指尖的 20%），可用于比例建模，不能当绝对密度。
- 12891672 的 59.0 个/mm² 是"有髓末梢"计数，含末梢分支，**与传入纤维密度不是同一口径**，引用必须带限定语。
- 32965159 的全身纤维数与分配比例可作为"总量约束"：全身 ~23 万根，双手掌侧 15%，面唇 19%。

### 3. 适应类型与时间常数

- 定量值只有一组：SA 58 ms / RA 29 ms / PC 4.2 ms（7097579，猴，膜时间常数，模型拟合）。
  这是 TouchSim 一类模型沿用的经典参数，但**物种是猴**，写进人类身体模型时应标注来源。
- 行为层面的定性差别（1127614, 702358）：
  - SA-I：无自发放电；需较大压入（静态阈值 0.25 至 >2 mm）才持续放电；感受野小（5–10 个乳头嵴）、灵敏度陡降。
  - SA-II（Ruffini 类）：多有自发、节律规则的放电；对皮肤侧向牵张敏感、有方向选择性；感受野单峰、阈值缓升。
  - RA-I（Meissner）：快速适应（32647077 明言 rapidly adapting）；感受野小。
  - PC：感受野单峰、阈值缓升；对振动/高频最敏感。
- 未取到"持续放电多少秒"这类整段时间：人类单纤维文献的摘要普遍只给频率-幅度函数。

### 4. 触觉知觉习惯化（非外周适应）

- **有值的一条**：2378193 —— 指腹振动适应，阈值随适应时间**指数上升，τ = 1.5–2 min**（四种频率组合一致，30 dB SL）。
  这是"知觉"层面的阈值漂移，但 26581868 表明机制上以**外周**为主（电刺激旁路机械转导则无适应），
  所以严格说它是"外周机制驱动的知觉习惯化"，不能当纯中枢习惯化常数。
- 26514637：持续压 15 s（SA-I 介导），S1/S2 激活**指数下降**——摘要只写 "exponentially decreased"，没给 τ。
- 26581868：8 min、40× 阈值的机械振动 → 检测阈升高；同样的电刺激不产生适应。
- **"持续压着多久会麻"的独立时间常数未找到**：`tactile[tiab] AND habituation[tiab]`（215 条）前 10 条
  全是惊跳反射习惯化、婴儿、ASD 类研究，没有持续压觉衰减的 τ。

### 5. 皮层放大倍数（手 vs 躯干）

- **未找到数值**。检索到的相关摘要：
  - 32965159：传入密度与皮层代表区大小**弱相关**，"但不能完全解释手与脸的放大"。
  - 33488347：确实"估计了 cortical magnification factors"，但摘要只给定位结果，不给倍数。
  - 31863915：确认"食指代表区大于其他手指"（符合皮层放大），摘要无面积/距离数值。
  - 17372277：手指 S1 代表区大小与超敏度阈值相关，摘要无 mm² 或倍数。
- 想拿到倍数需读全文（Penfield 原始图、或 33488347 的表格），本次未做。

### 6. 空间求和

- **没有"X mm 内的刺激会叠加"这样的单一阈值**。可取的是三条不同口径的证据：
  1. 面积口径（P 通道）：0.05 → 1.5 cm²，阈值降约 13 dB（16503579，300 Hz，大鱼际）。
  2. 部位差异：求和效应大鱼际 > 指尖（12088385）——指尖密度高，单点已接近饱和。
  3. 距离口径：前臂运动方向判别，间距 ≥16 mm 时宽探头才占优（7778407）——这是"求和有效距离"的下界证据，不是检测阈值。
- 生理学上界可用感受野代替：RA/SA-I 的敏感区覆盖 5–10 个乳头嵴（702358），即求和发生在感受野尺度内。
- 足底 160 Hz 有求和、20 Hz 无（23357339）：支持"求和主要发生在 Pacinian 通道"。

---

## 四、数据质量备注

- **PMID 318754 记录错配**：题名是 *Two-point discrimination distances in the normal hand and forearm*（1977），
  但 Europe PMC / PubMed 返回的摘要是一篇中国昆虫学论文（Cerace stipatana）。该记录**不可引用**，已剔除。
- 39041970 与 3969399 的数值口径不同（前者是 8 个测点的范围，后者是 11 个躯干区块的均值），
  两者不可直接相减比较灵敏度梯度。
- 表中未出现任何由我换算得到的数（唯一换算是 5–10 个乳头嵴 ≈ 2.5–5 mm，已在该行显式标注为换算）。
