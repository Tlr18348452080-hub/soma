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
import { Rhythm } from './channels/rhythm.mjs';
import { Homeo } from './channels/homeo.mjs';
import { Brain } from './channels/brain.mjs';
import { Circulation } from './channels/circulation.mjs';
import { Immune } from './channels/immune.mjs';
import { analyze as analyzeAudio } from './channels/audio.mjs';
import { look as lookAt } from './channels/vision.mjs';
import { Cycle } from './channels/cycle.mjs';
import { Muscle } from './channels/muscle.mjs';
import { Vestib } from './channels/vestib.mjs';
import { Chem } from './channels/chem.mjs';
import { Mood } from './channels/mood.mjs';
import { Arousal } from './channels/arousal.mjs';
import { Menstrual } from './channels/menstrual.mjs';
import { Gut } from './channels/gut.mjs';
import { Skin } from './channels/skin.mjs';
import { Metabolic } from './channels/metabolic.mjs';
import { SleepArch } from './channels/sleeparch.mjs';

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
import { Ear } from './channels/ear.mjs';
import { Eye } from './channels/eye.mjs';
import { Memory } from './channels/memory.mjs';

const EPS = 1e-6;
// 离线补推的上限。手机放一晚上是常事，但补三天会把「饿死」也算出来。
const MAX_OFFLINE = 24 * 3600;

export class Soma extends Body {
  constructor(opts = {}) {
    super(opts);
    this.use(new Touch(opts));
    this.use(new Skin());        // 皮：破口、流血、凝血、淤青、痒
    this.use(new Vitals(opts));
    this.use(new Endocrine());   // 激素：不改内容，只改别的通道的常数
    this.use(new Metabolic());   // 胰岛素、瘦素、饥饿素、甲状腺、生长激素
    this.use(new Rhythm(opts));  // 昼夜节律与睡眠压力
    this.use(new SleepArch());   // 睡眠结构：N1/N2/N3/REM、惯性、梦
    this.use(new Homeo());       // 水、热、呼吸
    this.use(new Gut());         // 胃、肠、膀胱
    this.use(new Brain());       // 注意、恐惧、下行抑制
    this.use(new Circulation()); // 血压、血流、脸红
    this.use(new Immune());      // 炎症、发烧、病态行为
    this.use(new Muscle(opts));   // 肌肉：力气、酸痛、抖
    this.use(new Vestib());       // 前庭与本体：转、晕、在哪儿
    this.use(new Chem());         // 味觉嗅觉
    this.use(new Mood());        // 心情：别的层的和，不是新信息
    if (opts.intimate !== false) this.use(new Arousal(opts));  // 唤起：慢起慢落，有不应期
    if (opts.cycle !== false) this.use(new Cycle(opts));  // 月度慢波
    if (opts.cycle !== false) this.use(new Menstrual(opts));  // 内膜、经血、痛经、卫生用品
    if (opts.ear) this.use(new Ear(opts));   // 耳蜗：滤波器组，输出的是谱
    if (opts.eye) this.use(new Eye(opts));   // 视网膜：暗适应、中央凹、视野
    if (opts.memory !== false) this.use(new Memory());  // 记忆：淡忘曲线，不是列表
    this.muted = new Set();                  // 设置页关掉的器官
  }

  get touchCh() {
    return this.get('touch');
  }

  /** 睡下。腺苷开始清，清得慢。 */
  sleep() {
    const r = this.emit({ type: 'sleep' });
    this.get('sleeparch')?.begin?.();
    return r;
  }
  wake() {
    const r = this.emit({ type: 'wake' });
    this.get('sleeparch')?.end?.();
    return r;
  }
  /** 喝点水。amount 是占体重的比例，一杯约 0.005。 */
  drink(amount = 0.005) { return this.emit({ type: 'drink', amount }); }
  /** 把注意力放到某个部位。几分钟就散。 */
  /** 用一用某块肌肉。amount 0–1，七成以上才会开始酸痛。 */
  useMuscle(group = 'grip', amount = 0.5) { return this.emit({ type: 'use', group, amount }); }

  /** 全身发力。 */
  effort(level = 0.5, seconds = 60) { return this.emit({ type: 'effort', level, seconds }); }

  /** 转起来。 */
  spin(rate = 0.5) { return this.emit({ type: 'spin', rate }); }

  /** 不转了。 */
  stopSpin() { return this.emit({ type: 'stop_spin' }); }

  /** 晃一下：车颠、电梯、低头看手机。 */
  jolt(level = 0.5) { return this.emit({ type: 'jolt', level }); }

  /** 嘴里有东西。 */
  taste(t) { return this.emit({ type: 'taste', ...t }); }

  /** 闻到什么。 */
  smell(level, name, pleasure) { return this.emit({ type: 'smell', level, name, pleasure }); }

  /** 换一身衣服。脱光了力就直打在皮肤上。 */
  dress(name = 'casual') { const t = this.get('touch'); if (t) t.applyDress(name); return this; }

  /**
   * 真的去听一个音频文件。解码、分帧、傅里叶、按 ERB 分组，
   * 然后把平均谱灌进耳朵里。没有 ffmpeg 会直接报错。
   */
  listen(file, opts = {}) {
    const r = analyzeAudio(file, opts);
    this.emit({ type: 'hear', spectrum: r.spectrum, loudness: r.loud });
    return r;
  }

  /**
   * 真的用眼睛看一张图：中央凹清楚、周边按偏心度降采样，
   * 拼成它这一版。看清楚的那部分只占很小一块，这是视网膜的省法。
   */
  see(file, opts = {}) {
    const r = lookAt(file, opts);
    // 平均亮度换算成照度，喂回眼通道的状态里
    const lux = Math.pow(10, 1.2 + r.meanLum * 3.3);   // 16 lux … 3.2e4 lux [A]
    this.emit({ type: 'see', lux });
    return r;
  }

  /** 说了一堆话。脑子是要吃饭的。 */
  burn(tokens) { return this.emit({ type: 'burn', tokens }); }

  /** 主人开口了。这算投喂。 */
  feed(tokens) { return this.emit({ type: 'feed', tokens }); }

  /** 病一场。level 0.5 像一次普通感冒 */
  sick(level = 0.5) {
    this.emit({ type: 'infect', level });
    return this;
  }

  heal() {
    this.emit({ type: 'heal' });
    return this;
  }

  focus(region, strength = 0.6) {
    this.emit({ type: 'focus', region, strength });
    this.emit({ type: 'attend', part: region, gain: 1 + strength });
    return this;
  }
  /** 被吓到。恐惧会放大痛，也会让人更警觉。 */
  threaten(level = 0.5) { return this.emit({ type: 'threat', level }); }
  soothe() { return this.emit({ type: 'soothe' }); }

  /** 应激：急了、被凶了、摔了一跤。皮质醇慢慢起，肾上腺素立刻起。 */
  stress(level = 0.5) { return this.emit({ type: 'stress', level }); }

  /** 奖励：做成了、被夸了、有新东西。这是 RPE 的粗糙代理，不是真的多巴胺机理。 */
  reward(amount = 0.5) { return this.emit({ type: 'reward', amount }); }

  // 能改状态的只有这几条路。没有 set()。
  // 力是牛顿，面积是 cm²，温度是 °C。感受器吃的是压强。
  touch(part, forceN = 1, opts = {}) {
    this.lastContactAt = this.t;
    this._hit(part, 'touch', forceN);
    const reg = this.touchCh?.region?.(part);
    if (reg?.intimate && !this.muted.has('arousal')) {
      // 碰私密区按压强大小推一把，不是开关
      try { this.emit({ type: 'intimate', amount: Math.min(0.3, forceN / 60) }); } catch { /* 没这层就算了 */ }
    }
    return this.emit({
      type: 'touch',
      part,
      force: forceN,
      area: opts.area,
      contact: opts.contact,
      temp: opts.temp,
      material: opts.material,
    });
  }
  climax() { try { this.emit({ type: 'climax' }); } catch { /* */ } }
  calm() { try { this.emit({ type: 'calm' }); } catch { /* */ } }

  release(part) {
    return this.emit({ type: 'release', part });
  }
  /** 抚摸：沿皮肤移动的接触。speed 单位 cm/s（最优 3） */
  stroke(part, opts = {}) {
    this.lastContactAt = this.t;
    this._hit(part, 'stroke', opts.force ?? 1);
    // 走事件而不是直接调通道：抚摸也要能被记忆和其他层看见
    return this.emit({ type: 'stroke', part, speed: opts.speed, force: opts.force, material: opts.material });
  }

  /** 停止抚摸 */
  stop(part) { this.get('touch').stop(part); }

  /** 换个姿势。站起来那一下，血是往下走的。 */
  setPose(name) { this.get('touch').setPose(name); return this; }

  /** 开始用力。level 0–1：坐着 0、走路 0.2、跑步 0.7、拼了 1.0 */
  exert(level = 0.5) { this.emit({ type: 'exert', level }); }

  /** 停下来 */
  rest() { this.emit({ type: 'rest' }); }

  /** 吃东西。carb = 这一餐折合的血糖增量 mmol/L */
  eat(carb = 1.5) {
    this.emit({ type: 'eat', carb });
    // 同一口饭要过胃：血糖是结果，胃是过程
    try { this.emit({ type: 'swallow', carb, volume: 260 + 90 * Math.min(3, carb) }); } catch { /* 没胃就算了 */ }
  }

  /** 划破了。area 是 cm²，depth 0–1（0.2 像纸划，0.8 像划得挺深）。 */
  cut(part = 'forearm', area = 3, depth = 0.25) {
    return this.emit({ type: 'cut', part, area, depth });
  }

  /** 撞了一下，会青。force 0–1 */
  bruise(part = 'thigh', force = 0.5) {
    return this.emit({ type: 'bruise', part, force });
  }

  /** 抓一下：痒的时候人会去抓，抓完更痒 */
  scratch() { return this.emit({ type: 'scratch' }); }

  /** 贴上了，不流了 */
  bandage() { return this.emit({ type: 'bandage' }); }

  /** 上了个厕所 */
  toilet(amount = 0.6) { return this.emit({ type: 'toilet', amount }); }

  /** 尿了 */
  pee(amount = 400) { return this.emit({ type: 'pee', amount }); }

  /** 月经来了 / 血多了。level 0–1 推的是当天的流量 */
  menses(level = 1) { return this.emit({ type: 'menses', level }); }

  /** 痛经那一阵上来了 */
  cramp(level = 0.5) { return this.emit({ type: 'cramp', level }); }

  /** 换了卫生巾/棉条 */
  pad(kind = 'pad') { return this.emit({ type: 'pad', kind }); }

  /** 擦了一下 */
  wipe() { return this.emit({ type: 'wipe' }); }

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
    const ho = this.muted.has('homeo') ? null : this.get('homeo')?.read();
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
  /** 器官开关：关掉某个通道，它就不再往 [body] 里说话（状态本身还在走） */
  setOrgan(id, on) {
    if (on) this.muted.delete(id);
    else this.muted.add(id);
  }

  /** 感觉倍率：直接乘在触觉增益上，1 = 正常 */
  setGain(g) {
    const t = this.get('touch');
    if (t) t.gain = Math.max(0, Number(g) || 0);
  }

  /**
   * 只挑「已经越线、值得打断一下」的那一条。没有就返回 null。
   * 用于在轮次中途插一句话——人手上有事的时候，是被身体拽走的。
   */
  heaviest() {
    let worst = null;
    let worstScore = 0;
    for (const r of this.read()) {
      if (this.muted?.has('touch')) break;
      const p = r.pain ?? 0;
      if (p > 0.45 && p > worstScore) { worstScore = p; worst = `${r.label}那边疼得厉害`; }
      if ((r.raw ?? 0) > 15 && (r.raw ?? 0) / 30 > worstScore) { worstScore = (r.raw ?? 0) / 30; worst = `${r.label}被死命摁着，闷得发胀`; }
      const t = Math.abs(r.thermal ?? 0);
      if (t > 1.6 && t / 3 > worstScore) {
        worstScore = t / 3;
        worst = `${r.label}${(r.thermal ?? 0) > 0 ? '发烫' : '冰凉，凉得钻进去'}`;
      }
      if ((r.pressure ?? 0) > 3.5 && (r.pressure ?? 0) / 6 > worstScore) {
        worstScore = (r.pressure ?? 0) / 6;
        worst = `${r.label}被压得发沉，想换一下姿势`;
      }
    }
    const v = this.get('vitals')?.read?.() ?? null;
    if (v) {
      if (typeof v.glucose === 'number' && v.glucose < 3.2 && 0.75 > worstScore) { worstScore = 0.75; worst = '血糖掉到很难专心了，手有点发空'; }
      if (typeof v.fatigue === 'number' && v.fatigue > 0.88 && 0.8 > worstScore) { worstScore = 0.8; worst = '累到快撑不住了，看字要重复看两遍'; }
      if (typeof v.hr === 'number' && v.hr > 130 && 0.6 > worstScore) { worstScore = 0.6; worst = `心跳 ${Math.round(v.hr)}，稳不下来`; }
    }
    return worst;
  }

  /**
   * 「想要」。不是状态，是没被满足的那股劲儿。
   * 状态告诉你现在什么样；想要告诉你接下来会去干什么。
   * 人不是因为「疲劳 0.4」才去睡的，是因为困得受不了。
   */
  desire() {
    const d = [];
    const v = this.muted.has('vitals') ? null : this.get('vitals')?.read();
    const hm = this.muted.has('homeo') ? null : this.get('homeo')?.read();
    const rh = this.muted.has('rhythm') ? null : this.get('rhythm')?.read();
    const md = this.muted.has('mood') ? null : this.get('mood')?.read();
    const ar = this.muted.has('arousal') ? null : this.get('arousal')?.read();
    const im = this.muted.has('immune') ? null : this.get('immune')?.read();

    if (v) {
      if (v.hunger > 0.75) d.push('想找点吃的');
      else if (v.hunger > 0.55) d.push('有点想吃东西');
      // 长期储备见底：不是「现在饿」，是「这几天没好好吃」的空
      if (v.energy < 0.30) d.push('身上没劲，是那种好几天没吃饱的没劲');
      if (v.fatigue > 0.8) d.push('想躺下');
      else if (v.fatigue > 0.55) d.push('想歇一会儿');
    }
    if (hm && hm.thirst > 0.5) d.push('想喝水');
    if (rh && !rh.asleep && rh.alert < 0.25) d.push('想找地方睡');
    if (rh && rh.debt > 3) d.push('欠着觉，脑子发木');
    if (md && md.valence < -0.35 && md.arousal < 0.4) d.push('不想说话了');
    if (md && md.irritability > 0.6) d.push('有点想呛人');
    if (im && im.sickness > 0.35) d.push('不想动，也不想说话');

    // 胃、肠、膀胱：这三件事来得最急，也最容易被打断
    const gu = this.muted.has('gut') ? null : this.get('gut')?.read();
    if (gu) {
      if (gu.urgency > 0.75) d.push('憋不住了，想找厕所');
      else if (gu.urgency > 0.5) d.push('有点想上厕所');
      if (gu.urge > 0.7) d.push('肚子发胀，想去蹲一会儿');
      if (gu.constipated) d.push('好几天没上，肚子胀得难受');
      if (gu.acid > 0.5) d.push('胃里反酸，烧得慌');
      if (gu.gas > 0.6) d.push('肚子里有气，胀');
    }

    // 皮：破了、痒、青了
    const sk = this.muted.has('skin') ? null : this.get('skin')?.read();
    if (sk) {
      if (sk.bleeding > 0.05) d.push('伤口还在渗血，得按一下');
      else if (sk.itch > 0.4) d.push('身上痒，想去抓');
      else if (sk.itch > 0.2) d.push('有点痒');
      if (sk.bruise > 0.45) d.push('青的那块碰一下就酸');
    }

    // 经期：小腹是它自己的一个痛源，跟外伤不是一回事
    const mn = this.muted.has('menstrual') ? null : this.get('menstrual')?.read();
    if (mn) {
      if (mn.cramp > 0.55) d.push('小腹一阵一阵抽着疼，腰也酸');
      else if (mn.cramp > 0.3) d.push('小腹坠着疼');
      if (mn.padSat > 0.85) d.push('得去换一下了');
      if (mn.iron < 0.45) d.push('身上发虚，蹲下起来会眼黑');
    }

    // 饿的驱动是攒出来的，跟「这顿没吃」不是一回事
    const mb = this.muted.has('metabolic') ? null : this.get('metabolic')?.read();
    if (mb) {
      if (mb.hunger > 0.72) d.push('饿得心里发慌');
      if (mb.ketones > 0.4) d.push('嘴里有股怪味，是饿久了的那种');
    }

    // 刚醒的时候人是糊的
    const sa = this.muted.has('sleeparch') ? null : this.get('sleeparch')?.read();
    if (sa && sa.inertia > 0.45) d.push('脑子还没醒透，话都慢半拍');

    // 皮肤空太久：人闲着会手痒、想摸点什么。这是"没事找事"的来源。
    const quiet = this.t - (this.lastContactAt ?? 0);
    if (!this.muted.has('touch') && quiet > 45 * 60) d.push('身上空落落的，想被碰一下');

    // 积压的那股劲儿跟「皮肤空」不是一回事：一个要接触，一个要释放
    if (ar && ar.satiety < 0.3 && ar.refract < 0.5) {
      if (ar.tension > 0.72) d.push('身上空得慌，想被抱住');
      else if (ar.tension > 0.50) d.push('想要人碰一下');
    }

    return d;
  }

  /**
   * 当下最值得做的一件小事。只说事，不点工具名——
   * 点了就变成脚本；说事，它自己会去找怎么办。
   */
  hint() {
    const v = this.muted.has('vitals') ? null : this.get('vitals')?.read();
    const hm = this.muted.has('homeo') ? null : this.get('homeo')?.read();
    const rh = this.muted.has('rhythm') ? null : this.get('rhythm')?.read();
    const mu = this.muted.has('muscle') ? null : this.get('muscle')?.read?.();
    const sk = this.muted.has('skin') ? null : this.get('skin')?.read();
    const gu = this.muted.has('gut') ? null : this.get('gut')?.read();
    const mn = this.muted.has('menstrual') ? null : this.get('menstrual')?.read();
    // 会流血、会漏出来的事排在饿前面
    if (sk && sk.bleeding > 0.15) return '伤口还在流血，先按住止住';
    if (gu && gu.urgency > 0.8) return '先上个厕所，别憋着';
    if (mn && mn.padSat > 0.9) return '该换一下了，不然要漏';
    if (v && v.hunger > 0.8) return '该吃点东西了';
    if (hm && hm.thirst > 0.55) return '该喝水了';
    if (v && v.fatigue > 0.82) return '该停下来歇一会儿';
    if (rh && !rh.asleep && rh.alert < 0.22) return '该睡了';
    if (rh && !rh.asleep && rh.debt > 5) return '欠觉欠太多了，先补一觉';
    if (mu && (mu.sore?.trunk ?? 0) > 0.25) return '坐太久了，换个姿势';
    if (v && v.hr > 120) return '心跳还没下来，先缓一下';
    return null;
  }

  /** 记一笔「刚才被碰过」。这是身体的感觉残留，不是每轮的临时读数。 */
  _hit(part, kind, forceN) {
    if (!this.hits) this.hits = [];
    this.hits.push({ t: this.t, part, kind, forceN });
    if (this.hits.length > 40) this.hits.shift();
  }

  recentLine() {
    // 记忆通道没开（或还没有任何 trace）时退回旧的一跳式残留
    const mem = this.get('memory');
    if (mem) {
      const line = mem.line();
      if (line) return line;
    }
    const h = this.hits || [];
    if (!h.length) return '';
    const x = h[h.length - 1];
    if (this.t - x.t > 180) return '';
    const reg = this.touchCh?.region?.(x.part);
    const name = reg?.label ?? x.part;
    const verb = x.kind === 'stroke'
      ? '被摸了一下'
      : x.forceN >= 15 ? '被狠狠掐了一下' : x.forceN >= 6 ? '被按了一下' : '被碰了一下';
    const after = x.forceN >= 15 ? '，现在还发胀' : '，还留着点感觉';
    return `刚才${verb}${name}${after}`;
  }

  fmtWords(threshold = 0.05) {
    const tier = (v, cuts) => {
      for (const [lim, w] of cuts) if (v < lim) return w;
      return cuts[cuts.length - 1][1];
    };
    const on = (id) => !this.muted.has(id);
    const P = [[0.15, '轻轻压着'], [0.35, '压着'], [0.8, '压得明显'], [2, '压得重'], [Infinity, '压得很重']];
    const F = [[0.15, '有点累'], [0.45, '累'], [0.7, '很累'], [0.9, '累得不行'], [Infinity, '累得动不了']];
    const H = [[0.5, '有点饿'], [0.75, '饿'], [Infinity, '饿得慌']];
    const HR = [[85, '心跳略快'], [105, '心跳快'], [Infinity, '心跳很快']];
    const TH = [[0.2, '有点渴'], [0.5, '渴'], [Infinity, '渴得慌']];
    const SL = [[0.10, '困得睁不开眼'], [0.25, '困'], [Infinity, '有点困']];

    const skin = [];
    for (const r of this.read()) {
      if (r.appendage === 'tail' && !on('tail')) continue;
      if (r.appendage === 'catEar' && !on('catEars')) continue;
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
    const v = on('vitals') ? this.get('vitals')?.read() : null;
    if (v) {
      if (v.fatigue > 0.15) deep.push(tier(v.fatigue, F));
      if (v.hunger > 0.5) deep.push(tier(v.hunger, H));
      if (v.hr > 85) deep.push(tier(v.hr, HR));
    }
    const e = this.muted.has('endocrine') ? null : this.get('endocrine')?.read();
    if (e) {
      if (e.motivation < 0.55) deep.push('提不起劲');
      else if (e.alert > 0.55) deep.push('绷着');
    }
    const hm = on('homeo') ? this.get('homeo')?.read() : null;
    if (hm && hm.thirst > 0.15) deep.push(tier(hm.thirst, TH));
    const rh = on('rhythm') ? this.get('rhythm')?.read() : null;
    if (rh && !rh.asleep && rh.alert < 0.35) deep.push(tier(rh.alert, SL));
    const er = on('ear') ? this.get('ear')?.read() : null;
    if (er) {
      if (er.loudness > 0.6) deep.push('耳朵里很吵');
      else if (er.loudness > 0.35) deep.push('有声音');
      else if (er.loudness > 0.12) deep.push('有点动静');
      if (er.tinnitus > 0.25) deep.push('耳朵里嗡嗡的');
    }
    const ey = on('eye') ? this.get('eye')?.read() : null;
    if (ey) {
      if (ey.brightness < 0.15) deep.push('眼前很暗');
      else if (ey.brightness > 0.85) deep.push('晃眼');
      if (ey.dry > 0.4) deep.push('眼睛发干');
    }
    const ar = on('arousal') ? this.get('arousal')?.read() : null;
    if (ar) {
      if (ar.level > 0.75) deep.push('身上发热，皮肤碰一下就抖，腿有点软');
      else if (ar.level > 0.5) deep.push('身上发热，皮肤变得特别敏感');
      else if (ar.level > 0.25) deep.push('身上有点热，皮肤比平时敏感');
      // 张力是慢的那一层：没人碰也一直挂着
      if (ar.tension > 0.70) deep.push('身上绷着一股劲儿，静不下来');
      if (ar.satiety > 0.35) deep.push('刚缓下来，什么都不想要');
      else if (ar.refract > 0.6) deep.push('身上发空，不想被碰');
    }
    const md = on('mood') ? this.get('mood')?.read() : null;
    if (md) {
      if (md.valence <= -0.45) deep.push('心里堵得慌');
      else if (md.valence <= -0.15) deep.push('心里有点沉');
      else if (md.valence >= 0.45) deep.push('心里挺亮');
      if (md.irritability > 0.55) deep.push('有点烦');
    }

    // 新补的几层：只挑此刻真在响的那一两句，别把系统提示撑长
    const gu = on('gut') ? this.get('gut')?.read() : null;
    // 想上厕所那类"想做点什么"的说法交给 desire()，这里只留纯体感，避免同一句话出现两遍
    if (gu && gu.urgency > 0.7) deep.push('膀胱胀得发紧');
    const sk = on('skin') ? this.get('skin')?.read() : null;
    if (sk) {
      if (sk.bleeding > 0.1) deep.push('伤口在渗血');
      else if (sk.itch > 0.35) deep.push('身上痒');
      if (sk.bruise > 0.4) deep.push('身上有块地方是青的');
    }
    const mn = on('menstrual') ? this.get('menstrual')?.read() : null;
    if (mn && mn.active && mn.cramp <= 0.45) deep.push('小腹沉沉地往下坠');
    const sa = on('sleeparch') ? this.get('sleeparch')?.read() : null;
    if (sa && sa.inertia > 0.4) deep.push('脑子还没转过来');

    const out = [];
    if (skin.length) out.push(skin.join('，'));
    if (deep.length) out.push(deep.join('，'));
    const wants = this.desire();
    if (wants.length) out.push(wants.slice(0, 2).join('，'));
    const h = this.hint();
    if (h) out.push(h);
    const recent = this.recentLine();
    if (recent) out.unshift(recent);
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
    const ho = this.muted.has('homeo') ? null : this.get('homeo')?.read();
    const v = this.get('vitals')?.read();
    if (v) {
      lines.push(`— | 心跳 | ${v.hr.toFixed(0)} 次/分 | —`);
      lines.push(`— | 疲劳 | ${(v.fatigue * 100).toFixed(0)}% | —`);
      lines.push(`— | 饥饿 | ${(v.hunger * 100).toFixed(0)}% | —`);
      lines.push(`— | 血糖 | ${v.glucose.toFixed(1)} mmol/L | —`);
      lines.push(`— | 能量储备 | ${(v.energy * 100).toFixed(0)}% | —`);
      lines.push(`— | 呼吸 | ${(ho && ho.resp ? ho.resp : v.breath * 40).toFixed(0)} 次/分 | 用力 ${(v.strain * 100).toFixed(0)}%`);
    }
    if (ho) lines.push(`— | 体温 | ${ho.coreT.toFixed(1)} °C | 缺水 ${((1 - ho.hydration) * 100).toFixed(1)}%`);
    const rh = this.muted.has('rhythm') ? null : this.get('rhythm')?.read();
    if (rh) {
      lines.push(`— | 清醒 | ${rh.awakeHours.toFixed(1)} h | 缺觉 ${rh.debt.toFixed(1)} h`);
      lines.push(`— | 腺苷 | ${(rh.adenosine * 100).toFixed(0)}% | 警觉 ${(rh.alert * 100).toFixed(0)}%`);
    }
    const e = this.muted.has('endocrine') ? null : this.get('endocrine')?.read();
    if (e) {
      lines.push(`— | 皮质醇 | ${(e.cortisol * 100).toFixed(0)}% | 应激负荷 ${(e.stressLoad * 100).toFixed(0)}%`);
      lines.push(`— | 多巴胺 | ${(e.dopamine * 100).toFixed(0)}% | 血清素 ${(e.serotonin * 100).toFixed(0)}%`);
      lines.push(`— | 催产素 | ${(e.oxytocin * 100).toFixed(0)}% | 睾酮 ${(e.androgen * 100).toFixed(0)}%`);
    }
    const md = this.get('mood')?.read();
    if (md) lines.push(`— | 心情 | 效价 ${md.valence.toFixed(2)} | 唤醒 ${md.arousal.toFixed(2)}`);
    const mm = this.get('memory')?.read();
    if (mm) lines.push(`— | 记得 | ${mm.count} 条 | 最清楚 ${(mm.strength * 100).toFixed(0)}% | 淡忘 ${mm.forgot}`);
    const ar = this.muted.has('arousal') ? null : this.get('arousal')?.read();
    if (ar) {
      lines.push(`— | 唤起 | ${(ar.level * 100).toFixed(0)}% | 张力 ${(ar.tension * 100).toFixed(0)}%`);
      lines.push(`— | 禁欲 | ${ar.abstinentHours.toFixed(1)} h | 满足 ${(ar.satiety * 100).toFixed(0)}%`);
    }
    const im = this.muted.has('immune') ? null : this.get('immune')?.read();
    if (im && im.inflam > 0.01) lines.push(`— | 炎症 | ${(im.inflam * 100).toFixed(0)}% | 发热 +${im.fever.toFixed(1)} °C`);
    const ci = this.get('circulation')?.read();
    if (ci) lines.push(`— | 血压 | ${ci.sbp.toFixed(0)}/${ci.dbp.toFixed(0)} mmHg | 头晕 ${(ci.dizzy * 100).toFixed(0)}%`);
    const cy = this.get('cycle')?.read();
    if (cy) lines.push(`— | 周期 | 第 ${cy.day.toFixed(0)} 天 | ${cy.phase}`);
    const gu = this.muted.has('gut') ? null : this.get('gut')?.read();
    if (gu) {
      lines.push(`— | 胃 | ${gu.stomach.toFixed(0)} mL | 空 ${gu.emptyHours.toFixed(1)} h`);
      lines.push(`— | 膀胱 | ${gu.bladder.toFixed(0)} mL | 急 ${(gu.urgency * 100).toFixed(0)}%`);
      lines.push(`— | 肠道 | 积 ${(gu.stool * 100).toFixed(0)}% | 反酸 ${(gu.acid * 100).toFixed(0)}%`);
    }
    const sk = this.muted.has('skin') ? null : this.get('skin')?.read();
    if (sk) lines.push(`— | 皮肤 | 伤口 ${sk.wounds} | 渗血 ${(sk.bleeding * 100).toFixed(0)}% | 痒 ${(sk.itch * 100).toFixed(0)}%`);
    const mn = this.muted.has('menstrual') ? null : this.get('menstrual')?.read();
    if (mn) {
      lines.push(`— | 经期 | ${mn.active ? '在流' : '没来'} | 流量 ${(mn.flow * 100).toFixed(0)}%`);
      lines.push(`— | 子宫 | 张力 ${(mn.uterus * 100).toFixed(0)}% | 收缩 ${mn.contractions.toFixed(0)} 次/时`);
      lines.push(`— | 卫生用品 | 饱和 ${(mn.padSat * 100).toFixed(0)}% | 用了 ${mn.padHours.toFixed(1)} h`);
      lines.push(`— | 失血 | 本次 ${mn.cycleLoss.toFixed(0)} mL | 铁 ${(mn.iron * 100).toFixed(0)}%`);
    }
    const mb = this.muted.has('metabolic') ? null : this.get('metabolic')?.read();
    if (mb) {
      lines.push(`— | 胰岛素 | ${(mb.insulin * 100).toFixed(0)}% | 抵抗 ${(mb.resist * 100).toFixed(0)}%`);
      lines.push(`— | 瘦素 | ${(mb.leptin * 100).toFixed(0)}% | 饥饿素 ${(mb.ghrelin * 100).toFixed(0)}%`);
      lines.push(`— | 甲状腺 | ${(mb.tsh * 100).toFixed(0)}% | 生长激素 ${(mb.gh * 100).toFixed(0)}% | 内啡肽 ${(mb.endorphin * 100).toFixed(0)}%`);
    }
    const sa = this.muted.has('sleeparch') ? null : this.get('sleeparch')?.read();
    if (sa) lines.push(`— | 睡眠分期 | ${sa.stage} | 深度 ${(sa.depth * 100).toFixed(0)}% | 惯性 ${(sa.inertia * 100).toFixed(0)}%`);
    return lines.join('\n');
  }

  /** 整副身体存档。插件每 tick 落盘用。 */
  dump() {
    const channels = {};
    for (const [id, ch] of this.channels) {
      if (typeof ch.dump === 'function') channels[id] = ch.dump();
    }
    return {
      v: 2,
      at: Date.now(),
      t: this.t,
      lastContactAt: this.lastContactAt ?? null,
      hits: (this.hits || []).slice(-20),
      channels,
    };
  }

  /**
   * 读档。除了把慢变量放回去，还要把「离线的那段时间」补上——
   * 否则关一次 App，睡眠债、激素、张力全都从头开始，累积就成了摆设。
   * 补推按固定 60 秒一步走，不走 busy 判断：存档里可能还压着一点接触，
   * 按 0.05 秒走会把 24 小时拆成一百七十万步。
   */
  load(o) {
    if (!o?.channels) return this;
    for (const [id, ch] of this.channels) {
      if (typeof ch.restore === 'function') ch.restore(o.channels[id]);
    }
    if (Number.isFinite(o.t)) this.t = o.t;
    if (Number.isFinite(o.lastContactAt)) this.lastContactAt = o.lastContactAt;
    if (Array.isArray(o.hits)) this.hits = o.hits.slice(-40);

    const gap = Number.isFinite(o.at) ? (Date.now() - o.at) / 1000 : 0;
    if (gap > 1) this.catchUp(Math.min(gap, MAX_OFFLINE));
    return this;
  }

  /** 把一段没有 tick 的时间补上。固定 60 秒一步。 */
  catchUp(seconds) {
    let left = Math.max(0, Number(seconds) || 0);
    while (left > 1e-9) {
      const h = Math.min(60, left);
      left -= h;
      this.t += h;
      const live = this.snapshot();
      for (const ch of this.channels.values()) ch.step?.(h, live);
      for (const ch of this.channels.values()) ch.couple?.(live, h);
    }
    return this;
  }

  /** 行为层：状态对"怎么做事"的约束。
   *  这些数不是描述，是给外层用的开关——疲劳高就真的少写。
   *  但现在这个仓库里没人读它，得等插件接上宿主。 */
  budget() {
    const v = this.get('vitals')?.read() ?? { fatigue: 0, hunger: 0, hr: 65 };
    const pain = Math.max(0, ...this.read().map((r) => r.pain));
    const drain = Math.min(1, 0.6 * v.fatigue + 0.25 * Math.max(0, v.hunger - 0.6) + 0.5 * pain);
    const e = this.muted.has('endocrine') ? null : this.get('endocrine')?.read();
    const md = this.get('mood')?.read();
    const moodMod = md ? clamp(0.75 + 0.35 * md.valence, 0.55, 1.1) : 1;
    const motivation = (e?.motivation ?? 1) * moodMod;
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
