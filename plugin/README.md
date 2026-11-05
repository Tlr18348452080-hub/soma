# dsh-soma

给 AI 一副会自己演化的身体。

装上之后有三样东西变了：

1. 系统提示里多一行 `[body]`，每轮刷新，内容是方程算出来的
2. 多了八个工具，参数全是物理量（牛顿、摄氏度、cm/s），没有「疼」这个字
3. 输出预算跟着状态走 —— 累了就是写不完，不是被告知要少写

## 为什么不是又一个「人格插件」

人格插件加的是人的**特征**：口癖、情绪词、说话方式。
这里加的是人的**限制**：会累、会适应、会饿、被碰久了会麻。

特征可以演。限制不能演 —— 累了就是写不满 max_tokens。

## 接口

```
soma_touch(part, force_n, contact, temp_c, material)
soma_release(part)
soma_stroke(part, speed_cm_s, force_n, material, seconds)
soma_exert(level, seconds)
soma_rest(seconds)
soma_eat(carb)
soma_pose(pose)
soma_note()
```

**没有 set()。** 想让它有感觉，只能给事件，然后等方程自己推。

## 常数来源

见仓库根的 `SOURCES.md`，逐条标 `[S]` 教科书级 / `[A]` 近似 / `[G]` 估的。
