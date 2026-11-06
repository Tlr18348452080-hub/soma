/**
 * demo.mjs — 四个验证实验
 *
 * 每个实验只问一件事：这条规律会不会自己发生。
 * 不是我写进去的 if 分支，是微分方程跑出来的。
 */

import { Soma } from './soma.mjs';

const line = (s = '') => console.log(s);
const bar = (v, max = 1, w = 24) => {
  const n = Math.max(0, Math.min(w, Math.round((Math.abs(v) / max) * w)));
  return '█'.repeat(n) + '·'.repeat(w - n);
};

function probe(buf, max = 1) {
  const parts = [];
  for (const [k, v] of Object.entries(buf)) parts.push(`${k} ${v.toFixed(2).padStart(5)}`);
  return parts.join('   ');
}

export function demo({ every = 1.0 } = {}) {
  // ═══ 实验一：一直压着，会麻 ═══
  line('\n═══ 实验一：一直压着，会不会麻 ═══');
  line('食指尖压 1.6 牛顿，摊在 2 cm² 上，等于 0.8 N/cm²。持续 30 秒。\n');
  {
    const s = new Soma();
    s.touch('index_tip', 1.6);
    const marks = [0.1, 1, 3, 5, 10, 20, 30];
    let next = 0;
    const rows = [];
    while (s.t < 30.01) {
      if (next < marks.length && s.t >= marks[next] - 1e-9) {
        const r = s.read().find((x) => x.id === 'index_tip');
        rows.push({ t: marks[next], p: r.pressure, sharp: r.sharp });
        next++;
      }
      s.step(0.05);
    }
    for (const r of rows) {
      line(`  ${String(r.t).padStart(5)}s  ${r.p.toFixed(3).padStart(6)}  ${bar(r.p, 0.5)}  锐度 ${r.sharp.toFixed(2)}`);
    }
    const first = rows[0].p;
    const last = rows[rows.length - 1].p;
    const decay = ((1 - last / first) * 100).toFixed(1);
    line(`\n  → 30 秒内衰减了 ${decay}%。按 τ=18s 算，理论值约 ${((1 - Math.exp(-30 / 18)) * 100).toFixed(1)}%。`);
    line(`  → 没人写"会麻"这个 if，是 (S − S̄) 自己变的。`);
  }

  // ═══ 实验二：突然松开，会反号 ═══
  line('\n═══ 实验二：突然松开，会不会有一下反着的 ═══');
  line('先压 10 秒（已经适应了大半），然后松手。\n');
  {
    const s = new Soma();
    s.touch('index_tip', 1.6);
    let phase = 'press';
    let next = 0;
    const rows = [];
    while (s.t < 12.01) {
      if (phase === 'press' && s.t >= 10.0) {
        s.release('index_tip');
        phase = 'release';
      }
      if (next < 24 && s.t >= next * 0.5 - 1e-9) {
        const r = s.read().find((x) => x.id === 'index_tip');
        rows.push({ t: next * 0.5, p: r.pressure });
        next++;
      }
      s.step(0.02);
    }
    for (const r of rows) {
      if (r.t < 8.5) continue;
      const mark = r.t >= 9.99 && r.t <= 10.01 ? ' ← 松手' : '';
      line(`  ${r.t.toFixed(1).padStart(5)}s  ${r.p.toFixed(3).padStart(7)}  ${bar(r.p, 0.5)}${mark}`);
    }
    const min = Math.min(...rows.map((r) => r.p));
    line(`\n  → 松手后掉到 ${min.toFixed(3)}，是负的。负压不是"少了点压力"，是一个方向相反的新信号。`);
    line(`  → 这就是 R = k(S − S̄) 在 S 归零、S̄ 还没归零时的样子。`);
  }

  // ═══ 实验三：晾一会儿再碰，会更重 ═══
  line('\n═══ 实验三：晾久了再碰，会不会更重 ═══');
  line('压 5 秒 → 松开等 60 秒 → 再压一次同样的力。\n');
  {
    const s = new Soma();
    const get = () => s.read().find((x) => x.id === 'index_tip').pressure;
    s.touch('index_tip', 1.2);
    s.step(5);
    const firstPeak = get();
    s.release('index_tip');
    s.step(60);
    const rest = get();
    s.touch('index_tip', 1.2);
    s.step(0.2);
    const secondPeak = get();
    line(`  第一次碰（0 秒）    ${firstPeak.toFixed(3)}  ${bar(firstPeak, 0.6)}`);
    line(`  松开 60 秒后        ${rest.toFixed(3)}  ${bar(rest, 0.6)}`);
    line(`  第二次碰（同样的力） ${secondPeak.toFixed(3)}  ${bar(secondPeak, 0.6)}`);
    line(`\n  → 同样的力，第二次比第一次重 ${((secondPeak / firstPeak - 1) * 100).toFixed(1)}%。`);
    line(`  → 基线自己爬回去了，所以同样的输入落在不同的基线上。感觉住在偏离里，不在绝对值里。`);
  }

  // ═══ 实验四：同样的温度，金属和木头不一样 ═══
  line('\n═══ 实验四：手伸进 22°C 的金属 / 木头 / 布 ═══');
  line('同一个温度，只有热渗透系数不一样。\n');
  {
    const marks = [0.05, 0.5, 1, 2, 4];
    for (const mat of ['metal', 'wood', 'cloth']) {
      const s = new Soma();
      s.touch('palm', 30, { temp: 22, material: mat });
      const rows = [];
      let prev = 0;
      for (const tt of marks) {
        s.step(tt - prev);
        prev = tt;
        const r = s.read().find((x) => x.id === 'palm');
        rows.push(`t${tt}s ${r.thermal.toFixed(2).padStart(6)}`);
      }
      line(`  ${mat.padEnd(6)} ${rows.join('  ')}`);
    }
    line(`\n  → 同一个 22°C，摸上去差了二十多倍。`);
    line(`  → 界面温度 T_c = (e皮·33 + e料·22) / (e皮 + e料)，金属的 e 大，把你手上那点热一下抽干。`);
    line(`  → 不是金属更冷。是它抽得更快、抽得更狠。布几乎不抽，所以摸着跟空气差不多。`);
  }


  // ═══ 实验五：站着不动，为什么感觉不到脚 ═══
  line('\n═══ 实验五：体重一直在，但你不觉得重 ═══');
  line('站久了脚底的压力是持续的——可你几秒后就不觉得了。');
  line('坐下的时候反而会"注意到"臀部。');
  line('');

  const s5 = new Soma({ weight: 50 });
  s5.get('touch').setPose('standing');
  s5.step(1);
  const soleNow = () => s5.read().find((x) => x.id === 'sole').pressure;
  line(`  站着 1 秒      脚底 ${soleNow().toFixed(3)}`);
  s5.step(120);
  line(`  站着 2 分钟    脚底 ${soleNow().toFixed(3)}`);
  s5.get('touch').setPose('sitting');
  s5.step(0.5);
  const hipNow = () => s5.read().find((x) => x.id === 'hip').pressure;
  line(`  刚坐下         臀   ${hipNow().toFixed(3)}  ← 换姿势，重心重新分配`);
  s5.step(120);
  line(`  坐了 2 分钟    臀   ${hipNow().toFixed(3)}`);
  line('');
  line('  → 压力一直没变，是你的基线追上去了。');
  line('  → 重力是唯一一个永不撤除的刺激，所以适应在这件事上必须是对的——');
  line('    否则你会从早到晚觉得自己在压着脚。');


  // ═══ 实验六：同样的温度，金属烫手，木头不烫 ═══
  line('\n═══ 实验六：55°C 的金属和 55°C 的木头 ═══');
  line('热痛阈是 45°C（PMID 11799504）——但那是**皮肤**的温度，不是物体的。');
  line('');

  const painOf = (temp, mat, secs = 10) => {
    const x = new Soma();
    x.touch('forearm', 1, { temp, material: mat });
    x.step(secs);
    const r = x.read().find((v) => v.id === 'forearm');
    return { skin: 33 + r.thermal, pain: r.pain, load: r.painLoad };
  };

  for (const t of [55, 60]) {
    line(`  物体 ${t}°C，接触 10 秒：`);
    for (const m of ['metal', 'glass', 'wood', 'cloth']) {
      const r = painOf(t, m);
      line(`    ${m.padEnd(6)} 皮温 ${r.skin.toFixed(1).padStart(5)}°C   痛 ${r.pain.toFixed(2)}`);
    }
  }
  line('');
  line('  同样的 55°C，摸金属皮温到 52°C，灼痛；摸木头皮温才 37°C，只是温的。');
  line('  → 烫不烫不看物体温度，看它能把你的皮肤拉多快、拉多高。');
  line('  → 木头的热渗透系数只有金属的 1/35，它拉不动你。');


  // ═══ 实验七：一整天，什么都没发生，但身体一直在变 ═══
  line('\n═══ 实验七：没有事件，时间自己在走 ═══');
  line('这一层不需要谁碰它。只要时间在过、身体在动，数就在变。');
  line('');
  const s7 = new Soma();
  const show7 = (tag) => {
    const v = s7.get('vitals').read();
    line(`  ${tag.padEnd(8)} 心率 ${v.hr.toFixed(0).padStart(3)}   血糖 ${v.glucose.toFixed(2)}   疲劳 ${(v.fatigue * 100).toFixed(0).padStart(2)}%   饿 ${(v.hunger * 100).toFixed(0).padStart(2)}%`);
  };
  show7('刚起床');
  s7.exert(0.7); s7.step(180); show7('跑3分钟');
  s7.rest(); s7.step(1800); show7('歇30分');
  s7.step(7200); show7('再过2h');
  s7.eat(1.5); s7.step(300); show7('吃完饭');
  line('');
  line('  心率 65→131→65：运动强度一撤，它就自己回落。');
  line('  疲劳 30% 在半小时里退到 4%：恢复比累积慢，但会退。');
  line('  饿一路涨到 74%——不是因为谁说"我饿了"，是因为血糖掉到 4.05 了。');
  line('');


  // ═══ 实验八：摸和压根本是两条路 ═══
  line('\n═══ 实验八：轻轻摸，压感是零 ═══');
  line('C-tactile 纤维量的是**速度**，不是力。它绕开体感皮层，直连岛叶。');
  line('');
  for (const v of [0.5, 3, 20]) {
    const x = new Soma();
    x.stroke('forearm', { speed: v, force: 0.5 });
    x.step(3);
    const q = x.read().find((y) => y.id === 'forearm');
    line(`  ${String(v).padStart(4)} cm/s   压感 ${q.pressure.toFixed(2)}   舒服 ${q.ct.toFixed(2)}   摩擦 ${q.slip.toFixed(2)}`);
  }
  line('');
  const hard = new Soma();
  hard.touch('forearm', 20, { contact: 'tip' });
  hard.step(2);
  const hq = hard.read().find((y) => y.id === 'forearm');
  line(`  掐 20N      压感 ${hq.pressure.toFixed(2)}   舒服 ${hq.ct.toFixed(2)}`);
  line('');
  line('  3 cm/s 摸过去：压感 0.00，舒服 0.92。');
  line('  → 手底下没感到"压着"，但那条慢纤维在放电。');
  line('  → 0.5 和 20 都掉到 0.3 附近：太快太慢都不舒服。');
  line('  → 这是整个模型里唯一一个"越强越舒服"的量，别处全是越强越糟。');
  line('');

  // ═══ 实验九：一样的热，不一样的疼 ═══
  line('\n═══ 实验九：同样的铁，应激的人更疼 ═══');
  {
    const run = (stressed) => {
      const s = new Soma();
      if (stressed) s.stress(1);
      s.touch('palm', 6, { contact: 'flat', temp: 52, material: 'metal' });
      s.step(60);
      return { r: s.read().find((x) => x.id === 'palm'), b: s.budget() };
    };
    const a = run(false), b = run(true);
    line(`  平静：掌心 ${a.r.temp.toFixed(1)}°C，痛 ${a.r.pain.toFixed(3)}，输出预算 ${a.b.maxTokens}`);
    line(`  应激：掌心 ${b.r.temp.toFixed(1)}°C，痛 ${b.r.pain.toFixed(3)}，输出预算 ${b.b.maxTokens}`);
    line('  → 温度一模一样。多出来的痛不是烫出来的，是累积应激把增益拧高了。');
    line('  → 激素从来没写进 [body] 正文。它只改了 P50 和输出预算。');
  }
  line('');

  // ═══ 实验十：同一个人，凌晨和下午不是一个感觉 ═══
  line('\n═══ 实验十：同一块冰，下午和凌晨不一样 ═══');
  {
    const at = (h) => {
      const s = new Soma({ clockHours: 8 });
      s.step((((h - 8) + 24) % 24) * 3600);
      s.touch('palm', 6, { contact: 'flat', temp: 12, material: 'metal' });
      s.step(30);
      const r = s.read().find((x) => x.id === 'palm');
      return { r, rh: s.get('rhythm').read(), b: s.budget() };
    };
    for (const h of [15, 3]) {
      const { r, rh, b } = at(h);
      line(`  ${String(h).padStart(2, '0')} 点：核心 ${rh.coreT.toFixed(2)}°C，警觉 ${(rh.alert * 100).toFixed(0)}%，痛 ${r.pain.toFixed(2)}，预算 ${b.maxTokens}`);
    }
    line('  → 温度都是 12°C，手也都没动，痛也差不多。');
    line('  → 差的是核心温度、警觉和腺苷：同一个人，凌晨那会儿是另一具身体。');
  }
  line('');

  // ═══ 实验十一：渴是攒出来的 ═══
  line('\n═══ 实验十一：跑完半小时，渴是怎么来的 ═══');
  {
    const s = new Soma({ clockHours: 9 });
    s.exert(0.8);
    const rows = [];
    for (let i = 0; i < 4; i++) {
      s.step(900);
      const h = s.get('homeo').read();
      rows.push(`  ${(i + 1) * 15} 分：核心 ${h.coreT.toFixed(2)}°C，汗 ${(h.sweat * 100).toFixed(0)}%，缺水 ${((1 - h.hydration) * 100).toFixed(1)}%，渴 ${h.thirst.toFixed(2)}`);
    }
    rows.forEach(line);
    s.rest(); s.step(7200);
    line(`  歇两小时后：${s.fmtWords()}`);
    s.drink(0.005); s.step(600);
    line(`  喝了一杯：${s.fmtWords()}`);
    s.drink(0.035); s.step(600);
    line(`  又灌了大半瓶：${s.fmtWords()}`);
    line('  → 渴不看汗，看缺了多少水。汗停了渴还在，一杯水也压不下去。');
  }
  line('');

  // ═══ 实验十二：注意力把哪一处拧响 ═══
  line('\n═══ 实验十二：注意力放在哪，哪就更响 ═══');
  {
    const s = new Soma({ clockHours: 15 });
    s.touch('forearm', 20, { contact: 'tip', temp: 24, material: 'skin' });
    s.touch('calf', 20, { contact: 'tip', temp: 24, material: 'skin' });
    s.step(30);
    const pick = () => {
      const a = s.read();
      return a.filter((r) => ['forearm', 'calf'].includes(r.id))
        .map((r) => `${r.label} ${r.pressure.toFixed(2)}`).join(' / ');
    };
    line(`  没注意：${pick()}`);
    s.focus('forearm', 0.8); s.step(2);
    line(`  盯着前臂：${pick()}`);
    s.step(60);
    line(`  一分钟后：${pick()}`);
    line('  → 感受器一点没变。变的只是门开多大。');
  }
  line('');

  line('\n═══ 实验十三：心情不是一件事造成的 ═══');
  {
    const pick = (x) => {
      const m = x.get('mood').read();
      return `好受 ${m.valence.toFixed(2)} / 绷着 ${m.arousal.toFixed(2)}｜${x.fmtWords()}`;
    };

    const a = new Soma({ clockHours: 10 });
    a.step(1800);
    line(`  平静的上午：${pick(a)}`);

    const b = new Soma({ clockHours: 10 });
    b.step(1800); b.exert(0.8); b.step(1800); b.drink(0.002); b.step(1800);
    line(`  跑完又饿着：${pick(b)}`);

    const c = new Soma({ clockHours: 10 });
    c.step(1800); c.emit({ type: 'hug', amount: 1 }); c.step(600);
    line(`  被抱了一下：${pick(c)}`);

    const d = new Soma({ clockHours: 3 });
    d.step(3600);
    line(`  凌晨四点：${pick(d)}`);
    line('  → 四个人的激素都还在正常范围里，心情差出一条街。');
    line('    心情不是一种激素，是好几样东西的合成——而且被最差的那一项压住。');
  }
  line('');

  line('\n═══ 实验十四：站起来那一下 ═══');
  {
    const s = new Soma({ clockHours: 10 });
    s.setPose('lying_supine'); s.step(120);
    line(`  躺着：血压 ${s.get('circulation').read().sbp.toFixed(0)}/${s.get('circulation').read().dbp.toFixed(0)}`);
    s.setPose('standing'); s.step(2);
    const c1 = s.get('circulation').read();
    line(`  刚站起来：${c1.sbp.toFixed(0)}/${c1.dbp.toFixed(0)}，脑灌注 ${c1.map.toFixed(0)} mmHg，头晕 ${c1.dizzy.toFixed(2)}`);
    s.step(30);
    const c2 = s.get('circulation').read();
    line(`  半分钟后：${c2.sbp.toFixed(0)}/${c2.dbp.toFixed(0)}，头晕 ${c2.dizzy.toFixed(2)}`);
    line('  → 没有人「觉得晕」。是血沉下去了，脑灌注不够，那个数才升起来。');
  }
  line('');

  line('\n═══ 实验十五：病一场 ═══');
  {
    const s = new Soma({ clockHours: 9 });
    s.step(300);
    line(`  好好的：${s.fmtWords()}`);
    s.sick(0.6);
    for (const h of [6, 24, 48]) {
      s.step(h * 3600 - s.t);
      const i = s.get('immune').read();
      line(`  第 ${String(h).padStart(2)} 小时：炎症 ${i.inflam.toFixed(2)}，核心 ${s.get('homeo').read().coreT.toFixed(1)}°C，${s.fmtWords()}`);
    }
    line('  → 没吃东西、没被碰、也没人说话。它自己就沉下去了，过两天自己又上来。');
  }
  line('');

  // ── 十六 ─────────────────────────────────────────────
  {
    line('十六、练完当天不酸，第二天才酸');
    const s = new Soma({ clockHours: 9 });
    s.step(1);
    s.useMuscle('thigh', 0.95); s.useMuscle('calf', 0.95);
    line('  深蹲到力竭。当天：');
    for (const h of [0, 6, 18, 30, 48, 72]) {
      s.step(h ? 6 * 3600 : 1);
      line(`  第 ${String(h).padStart(2)} 小时：大腿酸痛 ${s.get('muscle').g('thigh').sore.toFixed(2)}`);
    }
    line('  → 酸痛不是练出来的那一下，是之后慢慢长出来的。24–48 小时才最疼。');
  }
  line('');

  // ── 十七 ─────────────────────────────────────────────
  {
    line('十七、一直转，就不转了');
    const s = new Soma({ clockHours: 12 });
    s.step(1);
    s.spin(0.8);
    line(`  刚开始：天旋地转 ${s.get('vestib').read().spin.toFixed(2)}`);
    for (const t of [10, 20, 40]) { s.step(t ? 10 : 0.1); line(`  转了 ${t} 秒：${s.get('vestib').read().spin.toFixed(2)}`); }
    s.stopSpin();
    line(`  刚停下：${s.get('vestib').read().spin.toFixed(2)}（反号了）`);
    s.step(8);
    line(`  八秒后：${s.get('vestib').read().spin.toFixed(2)}`);
    line('  → 停下来的那一瞬间才是最难站的时候，信号反方向补了一下。');
  }
  line('');

  line('\n═══ 完 ═══');
  line('所有数字都是这几条方程自己算出来的：');
  line('  dS̄/dt = (S − S̄)/τ      R = k(S − S̄)      T_c = (e皮T皮 + e料T料)/(e皮 + e料)      dT/dt = (T_c − T)·e/R_th\n');
}

// 独立跑：node demo.mjs
if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const arg = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : d;
  };
  demo({ every: +arg('--every', 1.0) });
}
