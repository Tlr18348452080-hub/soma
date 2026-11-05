# 本体感觉与内感受：可引用数值

调研时间 2026-11-05。数据源只有 Europe PMC REST（`/europepmc/webservices/rest/search`），
容器内 node https，`family: 4` + User-Agent。web_search 不可用，wiki/知乎不可达。

**读数规则**：下表每个数字都必须能在对应 PMID 的摘要原文里找到。
摘要里没有的一律写「未找到」，不从小标题、图表、常识里补。区间原样保留。
可信度 S = 综述/元分析级公认值，A = 单一研究，G = 找不到。

---

## 搜过的 query

按主题分组，实际执行 70+ 条，下面是起作用的和主要的空手而归的。

**本体感觉 / 关节**
```
TITLE:"proprioception" AND ABSTRACT:"joint angle" AND ABSTRACT:threshold AND ABSTRACT:degrees
TITLE:"position sense" AND ABSTRACT:accuracy AND ABSTRACT:"degrees" AND ABSTRACT:joint
ABSTRACT:"movement detection threshold" AND ABSTRACT:proprioception AND ABSTRACT:degrees
ABSTRACT:"proprioceptive acuity" AND ABSTRACT:degrees
ABSTRACT:"proprioceptive acuity" AND ABSTRACT:"threshold" AND ABSTRACT:"degrees" AND ABSTRACT:"healthy"
TITLE:"threshold to detection of passive motion"
ABSTRACT:"threshold to detection of passive motion" AND ABSTRACT:"degrees"
ABSTRACT:"detection of passive motion" AND ABSTRACT:"healthy" AND ABSTRACT:"mean" AND ABSTRACT:"degrees"
ABSTRACT:"kinesthesia" AND ABSTRACT:"threshold" AND ABSTRACT:"degrees"
ABSTRACT:"joint angle" AND ABSTRACT:"discrimination" AND ABSTRACT:"degrees" AND ABSTRACT:"healthy"
ABSTRACT:"just noticeable difference" AND ABSTRACT:"joint angle"
TITLE:"repositioning error" AND ABSTRACT:degrees AND ABSTRACT:joint
TITLE:"kinaesthesia" AND ABSTRACT:threshold AND ABSTRACT:joint
```

**肌梭 / 腱器官**
```
TITLE:"muscle spindle" AND ABSTRACT:density AND ABSTRACT:"per gram"
ABSTRACT:"muscle spindles" AND ABSTRACT:number AND ABSTRACT:human AND ABSTRACT:muscle
ABSTRACT:"spindle density" AND ABSTRACT:"per gram" AND ABSTRACT:human
TITLE:"Golgi tendon organ" AND ABSTRACT:number AND ABSTRACT:muscle
TITLE:"Golgi tendon organ" AND ABSTRACT:density
TITLE:"Golgi tendon organs" AND ABSTRACT:"density"
ABSTRACT:"Golgi tendon organs" AND ABSTRACT:"number" AND ABSTRACT:"muscle"
ABSTRACT:"Golgi tendon organs" AND ABSTRACT:"per gram"
ABSTRACT:"Golgi tendon organs" AND ABSTRACT:"muscle" AND ABSTRACT:"density"
ABSTRACT:"tendon organ" AND ABSTRACT:"spindle" AND ABSTRACT:"density" AND ABSTRACT:human
TITLE:"tendon organ" AND ABSTRACT:human AND ABSTRACT:count
```

**心跳**
```
TITLE:"heartbeat counting" AND ABSTRACT:accuracy
TITLE:"heartbeat detection" AND ABSTRACT:accuracy AND ABSTRACT:participants
TITLE:"heartbeat perception" AND ABSTRACT:accuracy
ABSTRACT:"interoceptive accuracy" AND ABSTRACT:"heartbeat" AND ABSTRACT:"percentage"
ABSTRACT:"heartbeat counting" AND ABSTRACT:"one third"
ABSTRACT:"interoceptive accuracy" AND ABSTRACT:Schandry
ABSTRACT:"heartbeat counting task" AND ABSTRACT:"mean" AND ABSTRACT:"accuracy score"
```

**呼吸阻力**
```
ABSTRACT:"resistive load" AND ABSTRACT:"detection" AND ABSTRACT:breathing
ABSTRACT:"load detection" AND ABSTRACT:respiratory AND ABSTRACT:threshold
TITLE:"respiratory resistance" AND ABSTRACT:threshold AND ABSTRACT:detection
TITLE:"dyspnea" AND ABSTRACT:"resistance" AND ABSTRACT:"detection threshold"
TITLE:"breathlessness" AND ABSTRACT:"resistive load" AND ABSTRACT:detection
```

**疲劳**
```
ABSTRACT:"maximal voluntary contraction" AND ABSTRACT:fatigue AND ABSTRACT:"time constant"
TITLE:"sustained maximal voluntary contraction" AND ABSTRACT:decline
ABSTRACT:"MVC" AND ABSTRACT:"fatigue" AND ABSTRACT:"exponential" AND ABSTRACT:decline
TITLE:"muscle fatigue" AND ABSTRACT:"time constant" AND ABSTRACT:"force" AND ABSTRACT:"decline"
ABSTRACT:"fatigue" AND ABSTRACT:"exponential" AND ABSTRACT:"tau" AND ABSTRACT:"force"
TITLE:"fatigue" AND ABSTRACT:"rate constant" AND ABSTRACT:"force"
TITLE:"modeling peripheral muscle fatigue and recovery"
ABSTRACT:"monoexponential" AND ABSTRACT:"fatigue" AND ABSTRACT:"force"
ABSTRACT:"sustained" AND ABSTRACT:"MVC" AND ABSTRACT:"time constant"
ABSTRACT:"fatigue index" AND ABSTRACT:"MVC" AND ABSTRACT:"force"
```

**饥饿 / 血糖**
```
ABSTRACT:hunger AND ABSTRACT:"blood glucose" AND ABSTRACT:"mmol/L"
TITLE:"hunger" AND ABSTRACT:glucose AND ABSTRACT:"decline"
ABSTRACT:"glucose" AND ABSTRACT:"hunger" AND ABSTRACT:"nadir"
TITLE:"glucostatic" AND ABSTRACT:hunger
ABSTRACT:hunger AND ABSTRACT:"hours after" AND ABSTRACT:meal AND ABSTRACT:rating
ABSTRACT:"hunger" AND ABSTRACT:"plasma glucose" AND ABSTRACT:"after a meal"
ABSTRACT:"hunger" AND ABSTRACT:"2 h" AND ABSTRACT:"satiety" AND ABSTRACT:"meal"
```

**内感受 × 情绪**
```
TITLE:"interoceptive accuracy" AND ABSTRACT:"emotion" AND ABSTRACT:"correlation"
ABSTRACT:"interoceptive accuracy" AND ABSTRACT:"alexithymia" AND ABSTRACT:"correlation"
TITLE:"interoception" AND ABSTRACT:"emotion regulation" AND ABSTRACT:"r ="
```

---

## 数值表

| 量 | 数值 | 单位 | 出处(PMID) | 年份 | 期刊 | 可信度 |
|---|---|---|---|---|---|---|
| 腕关节位置觉误差 · 屈曲/伸展 | 4.64 ± 0.24 | ° | 27536882 | 2016 | PLoS One | A |
| 腕关节位置觉误差 · 内收/外展 | 3.68 ± 0.32 | ° | 27536882 | 2016 | PLoS One | A |
| 腕关节位置觉误差 · 旋前/旋后 | 5.15 ± 0.37 | ° | 27536882 | 2016 | PLoS One | A |
| 关节角度辨别阈（被动运动觉察阈 TDPM，健康成人） | 未找到 | ° | — | — | — | G |
| 肌梭密度 · 头上斜肌 | 190 | 个/g 肌肉 | 11799407 | 2001 | Neurology India | A |
| 肌梭密度 · 头下斜肌 | 242 | 个/g 肌肉 | 11799407 | 2001 | Neurology India | A |
| 肌梭密度 · 头后直肌 | 98 | 个/g 肌肉 | 11799407 | 2001 | Neurology India | A |
| 高尔基腱器官密度（每克肌肉个数） | 未找到 | 个/g 肌肉 | — | — | — | G |
| 心跳感知者比例 · 心跳计数任务（HBC） | 27.4 | % | 40468631 | 2025 | Psychophysiology | A |
| 心跳感知者比例 · 多间隔辨别任务 | 28.8 | % | 40468631 | 2025 | Psychophysiology | A |
| 心跳感知者比例 · 心血管信号检测任务（cvSDT） | 12.3 | % | 40468631 | 2025 | Psychophysiology | A |
| 心跳计数平均准确率（HBC 得分均值） | 未找到 | — | — | — | — | G |
| 吸气阻力觉察阈 · 20–39 岁 | 4.00 ± 3.06 | kPa·s/L | 19589812 | 2009 | Age and Ageing | A |
| 吸气阻力觉察阈 · 40–64 岁 | 6.51 ± 6.20 | kPa·s/L | 19589812 | 2009 | Age and Ageing | A |
| 吸气阻力觉察阈 · 65 岁以上 | 29.10 ± 13.58 | kPa·s/L | 19589812 | 2009 | Age and Ageing | A |
| 吸气阻力觉察阈 · 老年 COPD 患者 | 5.93 ± 7.02 | kPa·s/L | 32869264 | 2020 | Advances in Respiratory Medicine | A |
| 呼气阻力觉察阈 | 未找到（原文测了 ILDT 和 ELDT，摘要只报 ILDT） | — | — | — | — | G |
| 持续 MVC 的力衰减时间常数 τ | 未找到 | s | — | — | — | G |
| 3 分钟间歇 MVC（5 s 收缩 / 2 s 休息）后的力衰减（疲劳指数）· 青年 | 40.2 ± 12.6 | % 基线 | 11077978 | 2000 | Canadian Journal of Physiology and Pharmacology | A |
| 同上 · 老年 | 25.2 ± 12.3 | % 基线 | 11077978 | 2000 | Canadian Journal of Physiology and Pharmacology | A |
| 力竭性运动后 MVC 降幅 | −19 ± 4 | % | 32318812 | 2020 | European Journal of Applied Physiology | A |
| 低血糖判定阈值 | 3.9（70 mg/dL） | mmol/L | 40185804 | 2025 | Scientific Reports | A |
| 口服糖耐量试验中出现低血糖的时间 | 240–300 | min | 40185804 | 2025 | Scientific Reports | A |
| 正常餐后到饥饿感出现的时间 | 未找到 | min | — | — | — | G |
| 餐后饥饿感上升 × 胃排空 90% 时间的相关 | r = 0.75 | 无量纲 | 2596841 | 1989 | Appetite | A |
| 述情障碍 × 内感受觉察 | r = −0.162，95% CI [−0.252, −0.068]，p = .001 | 无量纲 | 31380655 | 2019 | Journal of Abnormal Psychology | S |
| 急性应激后皮质醇总输出 × 内感受准确率 | r = −0.670，p = .017 | 无量纲 | 34389438 | 2021 | Biological Psychology | A |
| 内感受准确率 × 情绪调节（学前儿童） | R² = 0.231，β = .278（p = .073，趋势） | — | 34389438 | 2021 | Biological Psychology | A |

---

## 每条数字的原文依据

**27536882**（30 名健康青年，机器人外骨骼，同侧主动关节位置匹配）：
> "the error of acuity for flexion/extension is 4.64 ± 0.24°; abduction/adduction: 3.68 ± 0.32°;
> supination/pronation: 5.15 ± 0.37°"

这是**位置匹配误差**，不是「两角度能不能分辨」的辨别阈。项目里当 acuity 用可以，别叫它 JND。
同一个关节三个自由度差 1.5°，是「不同自由度不同」最干净的证据；跨关节（膝/髋/肩）的对比
这次没有拿到摘要级数值。

**11799407**（人胎儿尸体，三个枕下小肌）：
> "The spindle density of superior oblique muscle was found to be 190, that of inferior oblique was 242
> and the rectus capitis posterior contained 98 spindles per gram of muscle. No tendon organs were seen."

枕下肌是全身肌梭密度最高的一档，**不能代表四肢**。四肢肌肉的每克密度这次没找到摘要级数字。

**40468631**（n = 73 青年，三种任务同批做）：
> "27.4% of the sample were heartbeat perceivers according to the heartbeat counting task, 28.8%
> according to the multi-interval discrimination task, and 12.3% according to the cvSDT.
> There was only one heartbeat perceiver according to all three tasks."

三种任务只重合 1 个人 —— 这是「心跳感知」这件事最该被引用的一句。

**19589812**（124 名健康成人，20–86 岁，渐增外部阻力）：
> "the mean inspiratory LDT rose from 4.00 (3.06 SD) kPa.s/L in the 20-39 age group to 6.51 (6.20)
> in the 40-64 age group (NS) and 29.10 (13.58) in the 65 + age group"

单位换算是纯算术：1 kPa·s/L ≈ 10.2 cmH₂O·L⁻¹·s，即青年组约 41 cmH₂O·L⁻¹·s。
**这个数比经典教科书里「约 1 cmH₂O/L/s」大一个量级**，我没找到能对上经典值的摘要，
所以两个别混着用 —— 要么用这里的原文值，要么去查原始方法学。

**11077978**（48 人，三个年龄段，间歇 MVC 疲劳指数）：
> "voluntary fatigue index (FI) (percentage of force reduction from baseline; FI-young, 40.2 ± 12.6%
> vs. FI-old, 25.2 ± 12.3%)"

**32318812**（10 名健康男性，力竭性恒定功率骑行）：
> "a reduction in maximal voluntary contraction (MVC, - 19 ± 4%)"

摘要同时提到「MVC 恢复的时间常数」，但没给数值。

**40185804**（139 名非糖尿病受试者，75 g OGTT，5 小时）：
> "Hypoglycemia (< 70 mg/dL (3.9 mmol/L)) occurred at 240-300 min in 92% of all patients, with
> hypoglycemic and autonomic symptoms. ... autonomic symptoms ... increased at 240 and 300 min"

注意这是**糖耐量试验**，不是正常吃饭。饥饿属于自主神经症状那一组。
它给的是「低血糖到什么水平」而不是「血糖降到多少开始饿」。

**2596841**（10 名健康男性）：
> "a significant correlation between the postprandial increase in hunger ratings and the time for 90%
> of the meal to empty (r = 0.75, p less than 0.02)"
> "The increase in hunger was not related to any consistent change in plasma glucose concentration."

这条是**反证**：餐后饥饿的回归跟胃排空走，不跟血糖走。

**31380655**（元分析，66 个独立样本，N = 7,146）：
> "alexithymia had a small, negative correlation with interoceptive awareness (r = -.162, p = .001,
> 95% CI [-.252, -.068])"

且在健康样本中不显著，只在精神/发育障碍样本中中等相关。

**34389438**（学前儿童，Study I n = 40，Study II n = 31）：数字见上表，样本很小。

---

## 明确没找到的四项

| 想要 | 结论 | 试过的方向 |
|---|---|---|
| 关节角度辨别阈（TDPM，度） | 未找到摘要级数值 | 所有 TDPM / kinesthesia 检索命中的研究都在摘要里报 p 值和组间差异，数值在图表里；10525700、10525701、17608920、7773274 都只给方向 |
| 高尔基腱器官每克密度 | 未找到 | 只查到「人眼外肌没有腱器官」(16760116)、一篇只讲 GTO 模型的论文(16672300)，以及 2024 综述(39000428)说汇总了 77 块人肌肉的肌梭数量、摘要不含表 |
| MVC 衰减时间常数 | 未找到 | 3CC 模型(18789445 / 29960732)有 fatigue rate F 和 recovery rate R 两个参数，但摘要不给值；只拿到 3 分钟间歇 MVC 的疲劳指数 |
| 血糖阈值 → 饥饿感 / 餐后饥饿时间 | 未找到 | 只有低血糖症状阈值 3.9 mmol/L，和「饥饿不跟血糖走」的反证(2596841) |

---

## 三条使用提醒

1. **肌梭密度不能跨肌肉套用。** 190–242 个/g 是枕下肌，眼球外肌、手部小肌更高，腓肠肌低得多。
   项目里如果要一个全身默认值，这里没有依据，得标 `[G]`。
2. **心跳感知的比例取决于用哪个任务。** 同一个样本，计数法 27.4%、cvSDT 12.3%。
   引用时必须带任务名，否则这个百分比没有意义。
3. **呼吸阻力的单位。** 表里是 kPa·s/L，跟经典文献的 cmH₂O/L/s 差 10 倍，换算是算术不是实测。
