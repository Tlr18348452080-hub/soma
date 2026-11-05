# 皮肤力学、摩擦，与力向皮下的传递

为 `soma` 的触觉通道找可引用的数值。数据源：Europe PMC REST（`resultType=core`，只读摘要）。
**所有数字都逐字来自摘要文本**；摘要里没出现的量，一律写「未找到」。

## 搜过的 query

按主题分组（全部用 Europe PMC 字段语法，`resultType=lite/core`，`pageSize=8~10`）：

**皮肤/指腹模量**
- `TITLE:"elastic modulus" AND ABSTRACT:"human skin" AND ABSTRACT:in vivo`
- `ABSTRACT:"young's modulus" AND ABSTRACT:"human skin" AND ABSTRACT:indentation`
- `TITLE:"finger pad" AND ABSTRACT:"elastic modulus"`
- `ABSTRACT:"effective elastic modulus" AND ABSTRACT:skin`
- `ABSTRACT:"finger pad" AND ABSTRACT:"effective elastic modulus"`
- `ABSTRACT:"finger pad" AND ABSTRACT:indentation AND ABSTRACT:modulus`
- `ABSTRACT:"fingerpad" AND ABSTRACT:stiffness`
- `TITLE:"elastic properties" AND TITLE:"finger"`
- `ABSTRACT:"elastic modulus" AND ABSTRACT:skin AND ABSTRACT:"MPa"`
- `TITLE:"mechanical properties of human skin" AND ABSTRACT:modulus`
- `ABSTRACT:"stratum corneum" AND ABSTRACT:"Young's modulus"`
- `ABSTRACT:"strain stiffening" AND ABSTRACT:skin`
- `ABSTRACT:"strain hardening" AND ABSTRACT:"human skin" AND ABSTRACT:modulus`
- `TITLE:"finger pad" AND ABSTRACT:"kPa"`
- `AUTH:"Pawluk" AND ABSTRACT:fingerpad`
- `TITLE:"finite element" AND TITLE:fingertip`

**皮下组织 / 脂肪**
- `TITLE:"subcutaneous fat" AND ABSTRACT:"elastic modulus"`
- `TITLE:"subcutaneous tissue" AND ABSTRACT:"mechanical properties"`
- `TITLE:"subcutaneous fat" AND ABSTRACT:thickness AND ABSTRACT:finger`
- `ABSTRACT:"fat pad" AND ABSTRACT:"mechanical" AND ABSTRACT:finger`
- `ABSTRACT:"adipose tissue" AND ABSTRACT:"elastic modulus"`

**摩擦**
- `TITLE:"finger pad" AND ABSTRACT:friction`
- `TITLE:friction AND TITLE:"human finger" AND ABSTRACT:"coefficient of friction"`
- `ABSTRACT:"coefficient of friction" AND ABSTRACT:"finger pad" AND ABSTRACT:"normal force"`
- `ABSTRACT:"coefficient of friction" AND ABSTRACT:skin AND ABSTRACT:moisture AND ABSTRACT:"normal force"`
- `TITLE:friction AND ABSTRACT:"wet skin"`
- `ABSTRACT:friction AND ABSTRACT:dry AND ABSTRACT:wet AND ABSTRACT:skin AND ABSTRACT:"coefficient of friction"`
- `ABSTRACT:"finger" AND ABSTRACT:"friction" AND ABSTRACT:"moisture"`

**C-tactile**
- `TITLE:"Coding of pleasant touch"` → Löken 2009
- `TITLE:"C-tactile" AND ABSTRACT:velocity`
- `ABSTRACT:"CT afferents" AND ABSTRACT:velocity`
- `ABSTRACT:"CT afferents" AND ABSTRACT:"firing" AND ABSTRACT:"velocity"`
- `TITLE:"C tactile" AND ABSTRACT:"stroking velocity"`
- `ABSTRACT:"C-tactile" AND ABSTRACT:"1-10 cm/s"`
- `TITLE:"optimal" AND ABSTRACT:"C-tactile" AND ABSTRACT:pleasant`

**深度衰减 / 埋深**
- `ABSTRACT:attenuation AND ABSTRACT:vibration AND ABSTRACT:skin AND ABSTRACT:depth`
- `TITLE:"finite element" AND TITLE:fingertip`（→ 16962362、19045525）
- `ABSTRACT:"Pacinian" AND ABSTRACT:depth AND ABSTRACT:dermis`
- `ABSTRACT:Meissner AND ABSTRACT:depth AND ABSTRACT:epidermis`
- `ABSTRACT:Ruffini AND ABSTRACT:depth AND ABSTRACT:dermis`
- `ABSTRACT:"Merkel" AND ABSTRACT:depth AND ABSTRACT:"basal layer"`
- `ABSTRACT:"Meissner corpuscles" AND ABSTRACT:"dermal papillae"`
- `"Pacinian corpuscles" AND "depth" AND "subcutaneous"`
- `"distribution of mechanoreceptors" AND "depth"`
- `"mm below the skin surface"`、`"μm below the skin surface" AND "corpuscle"`

**摩擦与触觉**
- `ABSTRACT:friction AND ABSTRACT:tactile AND ABSTRACT:"tangential" AND ABSTRACT:"perception"`
- `TITLE:"human finger pad" AND ABSTRACT:mechanoreceptor`

> 备注：检索后段 Europe PMC 搜索服务持续返回 `503 Search service is temporarily unavailable`，
> 若干补充 query（`"finger pad" AND "0.1 MPa"`、`"Meissner" AND "0.5 mm" AND "dermis"` 等）
> 未能执行，因此下面标 G 的项有「没查到」和「没查成」两种原因，已在备注里分开写。

---

## 表

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 可信度 |
|---|---|---|---|---|---|---|
| 表皮（含角质层）杨氏模量，前臂，4–10 kHz 表面波 OCE | ~4 | MPa | 35470076 | 2022 | Acta Biomaterialia | A |
| 真皮杨氏模量，前臂，0.2–1 kHz | ~40 | kPa | 35470076 | 2022 | Acta Biomaterialia | A |
| 皮下层（hypodermis）杨氏模量，前臂 | ~15 | kPa | 35470076 | 2022 | Acta Biomaterialia | A |
| 足底皮肤拉伸弹性模量（后部，PA / LM 方向） | 22.05 / 12.91 | MPa | 41832387 | 2026 | Annals of Biomedical Engineering | A |
| 足底皮肤拉伸弹性模量（前部，PA / LM 方向） | 17.39 / 12.82 | MPa | 41832387 | 2026 | Annals of Biomedical Engineering | A |
| 指腹软组织二阶超弹性参数 C01 | 0.59 ± 0.09 | kPa | 29217092 | 2018 | Journal of Biomechanics | A |
| 指腹软组织二阶超弹性参数 C20 | 2.65 ± 0.88 | kPa | 29217092 | 2018 | Journal of Biomechanics | A |
| 指腹软组织（骨以上）最大厚度 | 6.4 ± 0.8 | mm | 29217092 | 2018 | Journal of Biomechanics | A |
| 末节指骨高度 | 4 ± 1 | mm | 29217092 | 2018 | Journal of Biomechanics | A |
| 指腹压缩挠度 @2 N / 50° | 1.8 ± 0.3 | mm | 29217092 | 2018 | Journal of Biomechanics | A |
| 指腹压缩挠度 @4 N / 15° | 3.1 ± 0.2 | mm | 29217092 | 2018 | Journal of Biomechanics | A |
| 指腹松弛时间常数（三指数） | ~4 / ~70 / ~1400 | ms | 10211451 | 1999 | Journal of Biomechanical Engineering | A |
| 指腹「有效弹性模量」的具体数值 | 未找到 | — | — | — | — | G |
| 皮肤应变硬化的定量曲线 | 未找到定量；仅定性「刚度随位移指数增长」 | — | 10633260 | 1999 | Journal of Biomechanical Engineering | G |
| 指腹脂肪垫单独的厚度（与总软组织分离） | 未找到 | — | — | — | — | G |
| 指腹 vs 铝，平均动摩擦系数 | 0.6 | — | 19431002 | 2009 | Ergonomics | A |
| 指腹 vs 橡胶软管，平均动摩擦系数 | 0.9 | — | 19431002 | 2009 | Ergonomics | A |
| 法向力 1→20 N 时平均摩擦系数变化 | −46 | % | 19431002 | 2009 | Ergonomics | A |
| 指腹 vs 6 种不同含湿量材料，摩擦系数范围 | 0.763 – 1.033 | — | 35044853 | 2022 | Journal of Neurophysiology | A |
| 光滑不透水表面（玻璃）长接触 >10 s，摩擦系数随法向力下降而上升 | ~5 | 倍 | 28179549 | 2017 | Journal of the Royal Society Interface | A |
| 同上，但为多孔表面 | 随接触时间下降（摘要未给倍数） | — | 23256185 | 2013 | Journal of the Royal Society Interface | S |
| 干燥手 vs 湿手，静态摩擦系数差异 | 不显著（p>0.05）；肥皂水显著更低 | — | 11693248 | 2001 | Ergonomics | A |
| 指腹 vs 玻璃/常见表面的绝对摩擦系数表 | 未找到（摘要只给相对变化） | — | — | — | — | G |
| C-tactile 最优抚摸速度 | 1 – 10 | cm/s | 19363489 | 2009 | Nature Neuroscience | S |
| C-tactile 速度调谐实测点 | 0.3 / 1 / 3 / 10 / 30，中性皮温(32°C)下偏好慢速 | cm/s | 24553929 | 2014 | Journal of Neuroscience | A |
| 人际抚摸（伴侣/婴儿）实测速度 | 落在 1–10 内 | cm/s | 26433145 | 2016 | Behavioural Brain Research | A |
| CT「最优」代表速度（文献惯用点） | 3 | cm/s | 27915070 | 2017 | Behavioural Brain Research | A |
| 低频振动动态应变穿透深度 | >3 | mm | 16962362 | 2007 | Medical Engineering & Physics | A（FE 模型） |
| 高频振动动态应变集中深度 | <0.8 | mm | 16962362 | 2007 | Medical Engineering & Physics | A（FE 模型） |
| 指腹主共振频率 | 100 – 125 | Hz | 16962362 | 2007 | Medical Engineering & Physics | A（FE 模型） |
| 预压 0.5→2.0 mm 时共振频率漂移 | 88 → 125 | Hz | 19045525 | 2008 | Journal of Biomechanical Engineering | A（FE 模型） |
| 甲床下软组织位移 / 指腹位移 | <10 | % | 19045525 | 2008 | Journal of Biomechanical Engineering | A（FE 模型） |
| 「多深就感知不到」的知觉阈值深度 | 未找到 | mm | — | — | — | G |
| Merkel 细胞位置 | 表皮基底层（定性） | — | — | — | — | G（无数值、无摘要级出处） |
| Meissner 小体位置 | 真皮乳头（dermal papillae，定性） | — | 30085522 | 2026 | StatPearls（Histology, Meissner Corpuscle） | S |
| Pacinian 小体位置 | 真皮深层与皮下（deep dermis & hypodermis，定性） | — | 29632963 | 2018 | Skeletal Radiology | A |
| Ruffini 小体位置 / 埋深 | 未找到 | — | — | — | — | G |
| 四种感受器的埋深数值（mm） | 未找到 | mm | — | — | — | G |
| 摩擦变化的 Weber 分数（JND/基线切向力） | 0.11 | — | 29212757 | 2017 | Journal of the Royal Society Interface | A |
| 切向力变化率 RMS 与主观粗糙度相关 | r ≈ 0.88 | — | 12012159 | 2002 | Experimental Brain Research | A |
| 润滑使动摩擦下降 / 粗糙度估计下降 | ~40 / 16.4 | % | 12012159 | 2002 | Experimental Brain Research | A |
| 摩擦感知 JND（μs = 0.2–0.8） | 0.056 – 50.150（原文如此，疑为 0.056–0.150 之误） | — | 27788106 | 2009 | IEEE Transactions on Haptics | A |
| 0.25–0.75 mm 指腹皮肤牵张对摩擦感知的影响 | 显著提高（p<0.01） | mm | 27788106 | 2009 | IEEE Transactions on Haptics | A |
| 摩擦对「湿感」的解释力 | ~11（Qmax 22、含水 18） | % 方差 | 35044853 | 2022 | Journal of Neurophysiology | A |

---

## 读表要注意的三件事

1. **4 MPa 不是「皮肤模量」。** 35470076 分了三层：表皮 ~4 MPa、真皮 ~40 kPa、皮下 ~15 kPa，
   差两个数量级。前者是 4–10 kHz 表面波探到的角质层/表皮，后者是 0.2–1 kHz 探到的深层。
   做「皮肤刚度」时要按层取，取错一层就差百倍。而且样本是**前臂**，不是指腹。

2. **摩擦系数不是常数。** 同一根手指对玻璃，接触几十秒内可以涨一个数量级，而对纸这类多孔表面会降（23256185）。
   19431002 的 0.6 / 0.9 是在 1、10、20 N 三个法向力下测的，法向力从 1 N 升到 20 N 时平均摩擦系数降了 46%。
   引用摩擦系数必须同时报法向力和接触时间，否则数字没有意义。

3. **「衰减深度」目前只有动力学答案，没有知觉答案。** 16962362 给的是**动态应变**在组织里的分布
   （低频 >3 mm、高频 <0.8 mm），不等于「刺激多深就感觉不到」。后者需要一个以知觉阈值为因变量的实验，
   这次没找到。

## 没查到的（以及原因）

- 指腹有效弹性模量的绝对值：搜了 `"finger pad" AND "effective elastic modulus"`、`"finger pad" AND "0.1 MPa"`、
  `ABSTRACT:"finger pad" AND ABSTRACT:"kPa"` 等，只找到「测了但摘要没给数」（26269232 明确说做了 indentation
  测 fingerpad effective elastic modulus，摘要只讨论性别差异与 TFC，没有数值）。后两条 query 撞上 503，未完成。
- 皮下脂肪层单独厚度：搜到的是「指腹软组织总厚度 6.4 mm」，脂肪层没单独拆出来。
- 四种感受器埋深的 mm 值：摘要级检索只能拿到「位于真皮乳头 / 深真皮与皮下」这种定性描述。
  教科书里常引的那套毫米数，这次没有在摘要里找到可引原句，所以不写。
- Ruffini：连定性位置都没检索到（Europe PMC 收录偏少，且多次 503）。
