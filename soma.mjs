#!/usr/bin/env node
/**
 * soma.mjs — 一小片用生理公式跑出来的身体
 *
 * 内核在 core.mjs，触觉在 channels/touch.mjs。这里只是命令行。
 *
 *   node soma.mjs --list
 *   node soma.mjs --demo
 *   node soma.mjs --script '<json>' [--fmt text|vec|raw] [--every 1]
 */

import { Body } from './core.mjs';
import { Touch, REGIONS, MATERIALS } from './channels/touch.mjs';
import { Vitals } from './channels/vitals.mjs';
import { Endocrine } from './channels/endocrine.mjs';

const EPS = 1e-6;

export class Soma extends Body {
  constructor(opts = {}) {
    super(opts);
    this.use(new Touch(opts));
    this.use(new Vitals(opts));
    this.use(new Endocrine());   // 激素：不改内容，只改别的通道的常数
  }

  get touchCh() {
    return this.get('touch');
  }

  /** 应激：急了、被凶了、摔了一跤。皮质醇慢慢起，肾上腺素立刻起。 */
  stress(level = 0.5) { return this.emit({ type: 'stress', level }); }

  /** 奖励：做成了、被夸了、有新东西。这是 RPE 的粗糙代理，不是真的多巴胺机理。 */
  reward(amount = 0.5) { return this.emit({ type: 'reward', amount }); }

  // 能改状态的只有这几条路。没有 set()。
  // 力是牛顿，面积是 cm²，温度是 °C。感受器吃的是压强。
  touch(part, forceN = 1, opts = {}) {
    return this.emit({
      type: 'touch',
      part,
      force: forceN,
      area: opts.area,
      temp: opts.temp,
      material: opts.material,
    });
  }
  release(part) {
    return this.emit({ type: 'release', part });
  }
  /** 抚摸：沿皮肤移动的接触。speed 单位 cm/s（最优 3） */
  stroke(part, opts = {}) { this.get('touch').stroke(part, opts); }

  /** 停止抚摸 */
  stop(part) { this.get('touch').stop(part); }

  /** 开始用力。level 0–1：坐着 0、走路 0.2、跑步 0.7、拼了 1.0 */
  exert(level = 0.5) { this.emit({ type: 'exert', level }); }

  /** 停下来 */
  rest() { this.emit({ type: 'rest' }); }

  /** 吃东西。carb = 这一餐折合的血糖增量 mmol/L */
  eat(carb = 1.5) { this.emit({ type: 'eat', carb }); }

  attend(part, gain = 2.2) {
    return this.emit({ type: 'attend', part, gain });
  }

  read() {
    return this.touchCh.read();
  }

  active(threshold = 0.03) {
    const a = this.read().filter(
      (r) => Math.abs(r.pressure) > threshold || Math.abs(r.thermal) > 0.25,
    );
    return a.length < 2 ? a : a.sort((x, y) => Math.abs(y.pressure) - Math.abs(x.pressure));
  }

  fmtRaw() {
    const sgn = (v, w = 3) => {
      const n = Math.round(v);
      return (n < 0 ? '-' : '+') + String(Math.abs(n)).padStart(w, '0');
    };
    const r = this.read();
    return (
      `t=${this.t.toFixed(2)} V ` +
      r.map((x) => sgn(x.pressure * 100)).join(' ') +
      ' ' +
      r.map((x) => sgn(x.thermal * 10)).join(' ')
    );
  }

  // 只吐非零的那些，给注入用。
  // 触觉和内脏一起吐——不然模型只知道"哪里被碰了"，不知道"自己累不累、饿不饿"。
  fmtCompact(threshold = 0.05) {
    const parts = [];
    for (const r of this.read()) {
      let s = '';
      if (Math.abs(r.pressure) > threshold) s += `${r.pressure >= 0 ? '压' : '松'}${Math.abs(r.pressure).toFixed(2)}`;
      if (r.ct > 0.15) s += `舒服${r.ct.toFixed(2)}`;
      if (r.pain > 0.05) s += `痛${r.pain.toFixed(2)}`;
      if (r.thermal <= -0.3) s += '凉';
      else if (r.thermal >= 0.3) s += '暖';
      if (s) parts.push(r.label + s);
    }
    const v = this.get('vitals')?.read();
    if (v) {
      if (v.fatigue > 0.15) parts.push(`累${v.fatigue.toFixed(2)}`);
      if (v.hunger > 0.45) parts.push(`饿${v.hunger.toFixed(2)}`);
      if (Math.abs(v.hr - 65) > 15) parts.push(`心跳${v.hr.toFixed(0)}`);
    }
    return parts.length ? parts.join(' ') : '静息';
  }

  /** 给模型看的一行：只说什么样，不给数字。
   *  数字会被原样念出来（"0.50 那样"），那是读仪表盘，不是身体。
   *  要精确数值走 table()，那是给工具用的，不进系统提示。 */
  fmtWords(threshold = 0.05) {
    const tier = (v, cuts) => {
      for (const [lim, w] of cuts) if (v < lim) return w;
      return cuts[cuts.length - 1][1];
    };
    const P = [[0.15, '轻轻压着'], [0.35, '压着'], [0.8, '压得明显'], [2, '压得重'], [Infinity, '压得很重']];
    const F = [[0.15, '有点累'], [0.45, '累'], [0.7, '很累'], [0.9, '累得不行'], [Infinity, '累得动不了']];
    const H = [[0.5, '有点饿'], [0.75, '饿'], [Infinity, '饿得慌']];
    const HR = [[85, '心跳略快'], [105, '心跳快'], [Infinity, '心跳很快']];

    const skin = [];
    for (const r of this.read()) {
      const seg = [];
      if (r.pressure >= threshold) seg.push(tier(r.pressure, P));
      else if (r.pressure <= -threshold) seg.push('刚松开，空落落的');
      if (r.ct > 0.15) seg.push('蹭着舒服');
      if (r.pain > 0.1) seg.push('痛');
      if (r.thermal <= -0.3) seg.push('发凉');
      else if (r.thermal >= 0.3) seg.push('发烫');
      if (seg.length) skin.push(`${r.label}${seg.join('、')}`);
    }

    const deep = [];
    const v = this.get('vitals')?.read();
    if (v) {
      if (v.fatigue > 0.15) deep.push(tier(v.fatigue, F));
      if (v.hunger > 0.5) deep.push(tier(v.hunger, H));
      if (v.hr > 85) deep.push(tier(v.hr, HR));
    }
    const e = this.get('endocrine')?.read();
    if (e) {
      if (e.motivation < 0.55) deep.push('提不起劲');
      else if (e.alert > 0.55) deep.push('绷着');
    }

    const out = [];
    if (skin.length) out.push(skin.join('，'));
    if (deep.length) out.push(deep.join('，'));
    return out.length ? out.join('；') : '身上没什么特别的动静';
  }

  /** 全身状态表：带单位，给工具用。模型想看细节时调 soma_note 才拿到。 */
  table() {
    const rows = this.read().filter((r) => Math.abs(r.pressure) > 0.02 || r.ct > 0.1 || r.pain > 0.02);
    const lines = ['部位 | 接触 | 压强 N/cm² | 表面温度 °C'];
    for (const r of rows) {
      const how = r.ct > 0.15 ? '蹭着' : r.pressure < -0.02 ? '松开' : r.pressure > 0.02 ? '压着' : '静止';
      lines.push(`${r.label} | ${how} | ${r.pressure.toFixed(2)} | ${r.temp.toFixed(1)}`);
    }
    const v = this.get('vitals')?.read();
    if (v) {
      lines.push(`— | 心跳 | ${v.hr.toFixed(0)} 次/分 | —`);
      lines.push(`— | 疲劳 | ${(v.fatigue * 100).toFixed(0)}% | —`);
      lines.push(`— | 饥饿 | ${(v.hunger * 100).toFixed(0)}% | —`);
      lines.push(`— | 血糖 | ${v.glucose.toFixed(1)} mmol/L | —`);
    }
    return lines.join('\n');
  }

  /** 整副身体存档。插件每 tick 落盘用。 */
  dump() {
    const channels = {};
    for (const [id, ch] of this.channels) {
      if (typeof ch.dump === 'function') channels[id] = ch.dump();
    }
    return { v: 1, at: Date.now(), channels };
  }

  load(o) {
    if (!o?.channels) return;
    for (const [id, ch] of this.channels) {
      if (typeof ch.restore === 'function') ch.restore(o.channels[id]);
    }
  }

  /** 行为层：状态对"怎么做事"的约束。
   *  这些数不是描述，是给外层用的开关——疲劳高就真的少写。
   *  但现在这个仓库里没人读它，得等插件接上宿主。 */
  budget() {
    const v = this.get('vitals')?.read() ?? { fatigue: 0, hunger: 0, hr: 65 };
    const pain = Math.max(0, ...this.read().map((r) => r.pain));
    const drain = Math.min(1, 0.6 * v.fatigue + 0.25 * Math.max(0, v.hunger - 0.6) + 0.5 * pain);
    const e = this.get('endocrine')?.read();
    const motivation = e?.motivation ?? 1;
    const base = 300 + 700 * (1 - drain);
    return {
      maxTokens: Math.round(base * motivation),          // 累/饿/疼 → 话变短；提不起劲 → 再短
      willingness: Math.max(0, (1 - drain) * Math.min(1, motivation)),  // 愿不愿意接活
      precision: Math.max(0.2, 1 - 0.5 * drain),         // 还细不细
      drain,
      motivation,
    };
  }

  fmtVec(threshold = 0.03) {
    const a = this.active(threshold);
    if (!a.length) return `t=${this.t.toFixed(2)} | empty`;
    return (
      `t=${this.t.toFixed(2)} | ` +
      a
        .map(
          (r) =>
            `${r.id}:${r.pressure.toFixed(2)},${r.sharp.toFixed(2)},${r.thermal.toFixed(1)},${r.held.toFixed(1)}`,
        )
        .join(' ')
    );
  }

  fmtText(threshold = 0.03) {
    const a = this.active(threshold);
    const head = `t=${this.t.toFixed(2)}s`;
    if (!a.length) return `${head}  全身静息`;
    const lines = a.map((r) => {
      const dir = r.pressure >= 0 ? '压' : '松';
      const q = r.sharp > 0.6 ? '锐' : r.sharp > 0.3 ? '中' : '钝';
      const t =
        r.thermal >= 0.3
          ? `暖+${r.thermal.toFixed(1)}`
          : r.thermal <= -0.3
            ? `凉${r.thermal.toFixed(1)}`
            : '常温';
      return `  ${r.label.padEnd(4, '　')} ${dir}${Math.abs(r.pressure).toFixed(2)} ${q} ${t} 持续${r.held.toFixed(1)}s`;
    });
    return [head, ...lines].join('\n');
  }
}

export function run(script, opts = {}) {
  const dt = opts.dt ?? 0.25;
  const every = opts.every ?? 1.0;
  const soma = new Soma({ gain: script.gain });
  const events = [...(script.events ?? [])].sort((a, b) => a.t - b.t);
  const dur = script.duration ?? 8000;
  const frames = [];
  let nextOut = 0;
  let ei = 0;

  while (soma.t * 1000 < dur + EPS) {
    while (ei < events.length && events[ei].t <= soma.t * 1000 + EPS) {
      soma.emit(events[ei++]);
    }
    if (soma.t >= nextOut - EPS) {
      frames.push({ t: +soma.t.toFixed(3), raw: soma.fmtRaw(), vec: soma.fmtVec(), text: soma.fmtText() });
      nextOut += every;
    }
    soma.step(dt);
  }
  return frames;
}

export { REGIONS, MATERIALS };

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const arg = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : d;
  };

  if (argv.includes('--list')) {
    const showAll = argv.includes('--all');
    const list = REGIONS.filter((p) => showAll || !p.intimate);
    console.log('可用的皮肤分区：\n');
    for (const p of list) {
      console.log(
        `  ${p.id.padEnd(11)} ${p.label.padEnd(5, '　')} 密度${String(p.density).padStart(3)}/cm²  两点辨别${String(p.acuity).padStart(2)}mm  快适应${p.tauF}s  慢适应${p.tauS}s`,
      );
    }
    console.log('\n材料：' + Object.entries(MATERIALS).map(([k, v]) => `${k}(${v.label})`).join('  '));
    process.exit(0);
  }

  const fmt = arg('--fmt', 'text');
  const dt = +arg('--dt', 0.25);
  const every = +arg('--every', 1.0);

  if (argv.includes('--demo')) {
    const { spawnSync } = await import('node:child_process');
    const here = new URL('./demo.mjs', import.meta.url).pathname;
    const r = spawnSync(process.execPath, [here, '--every', String(every)], { stdio: 'inherit' });
    process.exit(r.status ?? 0);
  }

  const scriptRaw = arg('--script');
  if (scriptRaw) {
    for (const f of run(JSON.parse(scriptRaw), { dt, every })) {
      console.log(fmt === 'raw' ? f.raw : fmt === 'vec' ? f.vec : f.text);
    }
    process.exit(0);
  }

  console.log(`soma — 一小片用生理公式跑出来的身体

  node soma.mjs --list
  node soma.mjs --demo
  node soma.mjs --script '<json>'  [--fmt text|vec|raw] [--every 1]
`);
}
