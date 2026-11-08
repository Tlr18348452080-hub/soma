import { Channel } from '../core.mjs';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const CYCLE = 90;   // 分钟

/**
 * 睡眠结构：N1 / N2 / N3 / REM
 *
 * 睡眠不是一个 0 到 1 的进度条，是九十分钟转一圈的楼。
 * N3 在前面几个周期最深，REM 在后面拉长；醒来的那一瞬间还困不困，
 * 取决于你从哪一层被拽出来——从 N3 拽出来是真的木。
 */
export class SleepArch extends Channel {
  constructor() {
    super('sleeparch');
    this.stage = 'awake';
    this.t = 0;              // 这一觉睡了多久（分钟）
    this.sinceStage = 0;     // 当前阶段持续（秒）
    this.cycle = 0;
    this.depth = 0;
    this.remLoad = 0.20;
    this.inertia = 0;
    this.dream = 0;
    this.awakenings = 0;
    this.lastStage = 'awake';
    this.asleepHours = 0;
  }

  // 某个时刻"应该在"哪一层
  stageAt(minute, asleepHours) {
    const cycle = Math.floor(minute / CYCLE);
    const inCycle = minute - cycle * CYCLE;
    if (inCycle < 5) return 'N1';
    const remW = cycle === 0 ? [70, 88] : cycle === 1 ? [66, 89] : [60, 90];
    const n3W = cycle === 0 ? [15, 45] : cycle === 1 ? [15, 35] : cycle === 2 ? [20, 32] : [20, 26];
    if (inCycle >= remW[0] && inCycle <= remW[1]) return 'REM';
    if (inCycle >= n3W[0] && inCycle <= n3W[1] && asleepHours < 6.5) return 'N3';
    return 'N2';
  }

  apply(ev) {
    if (ev.type === 'sleep') {
      this.stage = 'N1';
      this.t = 0;
      this.asleepHours = 0;
      this.cycle = 0;
      this.sinceStage = 0;
      return false;
    }
    if (ev.type === 'wake') {
      const from = this.stage;
      this.lastStage = from;
      // 从哪一层被拽出来，决定了醒来那半小时有多糊
      const iner = from === 'N3' ? 0.85 : from === 'REM' ? 0.55 : from === 'N2' ? 0.35 : 0.15;
      this.inertia = Math.max(this.inertia, iner);
      if (from === 'REM') this.dream = clamp(0.5 + 0.5 * this.remLoad);
      if (from !== 'awake') this.awakenings += 1;
      this.stage = 'awake';
      this.t = 0;
      this.cycle = 0;
      this.sinceStage = 0;
      return false;
    }
    return false;
  }

  /** 入睡。事件可能被 Rhythm 先吃掉，Soma 会直接叫这里。 */
  begin() {
    if (this.stage !== 'awake') return;
    this.stage = 'N1';
    this.t = 0;
    this.cycle = 0;
    this.sinceStage = 0;
    this.asleepHours = 0;
  }

  /** 醒来。按醒前所在的那一期给睡眠惯性。 */
  end() {
    if (this.stage === 'awake') return;
    const from = this.stage;
    const iner = from === 'N3' ? 0.85 : from === 'REM' ? 0.55 : from === 'N2' ? 0.35 : 0.15;
    this.inertia = Math.max(this.inertia, iner);
    if (from === 'REM') this.dream = clamp(0.5 + 0.5 * this.remLoad);
    this.awakenings += 1;
    this.stage = 'awake';
    this.t = 0;
    this.cycle = 0;
    this.sinceStage = 0;
  }

  step(dt, ctx) {
    const hours = dt / 3600;
    const asleep = !!ctx?.rhythm?.asleep;
    this.sinceStage += dt;

    // 事件的顺序不一定轮到我们（Rhythm 可能先吃掉 sleep/wake），
    // 所以真正的状态切换以 rhythm.asleep 为准，事件只用来补细节。
    if (asleep && this.stage === 'awake') {
      this.stage = 'N1';
      this.t = 0;
      this.cycle = 0;
      this.sinceStage = 0;
      this.asleepHours = 0;
    } else if (!asleep && this.stage !== 'awake') {
      const from = this.stage;
      const iner = from === 'N3' ? 0.85 : from === 'REM' ? 0.55 : from === 'N2' ? 0.35 : 0.15;
      this.inertia = Math.max(this.inertia, iner);
      if (from === 'REM') this.dream = clamp(0.5 + 0.5 * this.remLoad);
      this.awakenings += 1;
      this.stage = 'awake';
      this.t = 0;
      this.cycle = 0;
      this.sinceStage = 0;
    }

    if (asleep) {
      this.asleepHours += hours;
      this.t += dt / 60;
      this.cycle = Math.floor(this.t / CYCLE);
      const want = this.stageAt(this.t, this.asleepHours);
      const minStay = want === 'N3' ? 300 : want === 'REM' ? 180 : 60;
      if (want !== this.stage && this.sinceStage >= minStay) {
        this.stage = want;
        this.sinceStage = 0;
      }
      const target = this.stage === 'N3' ? 1 : this.stage === 'REM' ? 0.55 : this.stage === 'N2' ? 0.6 : 0.25;
      this.depth += (target - this.depth) * (1 - Math.exp(-dt / 300));
      // REM 压力：只靠 REM 释放，浅睡几乎不还
      const ratePerMin = this.stage === 'REM' ? -0.010 : 0.020;
      this.remLoad = clamp(this.remLoad + (ratePerMin / 60) * dt);
    } else {
      this.depth += (0 - this.depth) * (1 - Math.exp(-dt / 300));
      this.remLoad = clamp(this.remLoad + (0.008 / 60) * dt);
      this.inertia *= Math.exp(-dt / 1200);
      this.dream *= Math.exp(-dt / 900);
    }
  }

  read() {
    const asIndex = ['awake', 'N1', 'N2', 'N3', 'REM'].indexOf(this.stage);
    return {
      stage: this.stage,
      asIndex,
      depth: this.depth,
      cycle: this.cycle,
      rem: this.remLoad,
      inertia: this.inertia,
      dream: this.dream,
      awakenings: this.awakenings,
      inDeep: this.stage === 'N3',
      asleepHours: this.asleepHours,
    };
  }

  dump() {
    return {
      stage: this.stage, t: this.t, sinceStage: this.sinceStage, cycle: this.cycle,
      depth: this.depth, remLoad: this.remLoad, inertia: this.inertia, dream: this.dream,
      awakenings: this.awakenings, lastStage: this.lastStage, asleepHours: this.asleepHours,
    };
  }

  restore(o) {
    if (!o) return;
    if (typeof o.stage === 'string') this.stage = o.stage;
    if (typeof o.lastStage === 'string') this.lastStage = o.lastStage;
    for (const k of ['t','sinceStage','cycle','depth','remLoad','inertia','dream','awakenings','asleepHours']) {
      if (Number.isFinite(o[k])) this[k] = o[k];
    }
  }
}
