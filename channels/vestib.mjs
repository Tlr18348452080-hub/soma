// 前庭与本体感觉：站不站得稳、东西在不在转、手脚在哪儿。
// 前庭管「转不转」，本体管「在哪」，两个坏掉的感觉完全不同：
//   前庭坏了——世界在转，但你清楚自己没动；
//   本体坏了——你知道自己没转，但不知道腿在哪。
import { Channel } from '../core.mjs';

export class Vestib extends Channel {
  constructor() {
    super('vestib');
    // 半规管的「转」信号 0–1，会自己适应掉（盯着一圈圈转，转久了就不转了）
    this.spin = 0;
    this.spinBar = 0;
    // 累积的冲突量 → 恶心的燃料
    this.conflict = 0;
    this.nausea = 0;
    // 本体感觉的噪声：累了、冷了会变大
    this.proprioErr = 0;
    // 站姿稳定度 0–1
    this.stability = 1;
  }

  apply(ev) {
    if (ev.type === 'spin') {
      this.spin = Math.min(1, (ev.rate ?? 0.5));
      // 转起来的那一下是最大的，之后就淡了——所以是从上往下掉，不是爬上去
      this.spinBar = Math.max(this.spinBar, this.spin);
      return true;
    }
    if (ev.type === 'stop_spin') {
      // 停下来的瞬间：真实世界里会有明显后效应，方向反着来
      this.spinBar = -0.35 * Math.abs(this.spinBar);
      this.spin = 0;
      return true;
    }
    // 加速度变化、晃动、低头看手机坐车——都是感觉冲突
    if (ev.type === 'jolt') { this.conflict = Math.min(2, this.conflict + (ev.level ?? 0.5)); return true; }
    return false;
  }

  step(dt, ctx) {
    const brain = ctx.get?.('brain')?.read?.() ?? {};
    const circ = ctx.get?.('circulation')?.read?.() ?? {};
    const vit = ctx.get?.('vitals')?.read?.() ?? {};

    // 转起来之后，感觉会被适应掉（τ≈20 秒）
    // 一直转，感觉会被适应掉：τ ≈ 20 秒，转久了就不转了 [A]
    this.spinBar *= Math.exp(-dt / 20);

    // 冲突持续存在才会恶心；0.2 Hz 左右的晃动最难受 [A]
    const drive = Math.max(0, this.conflict - 0.35) * Math.min(1, dt / 30);
    this.nausea = Math.min(1, this.nausea + drive * 0.6);
    this.nausea = Math.max(0, this.nausea - dt / 900);
    this.conflict = Math.max(0, this.conflict - dt / 120);

    // 本体感觉误差：疲劳、低血糖、冷、恐惧都会让它变差
    const want = 0.02 + (vit.fatigue ?? 0) * 0.25 + Math.max(0, (4.0 - (vit.glucose ?? 5)) / 4) * 0.4
      + (brain.fear ?? 0) * 0.15;
    this.proprioErr += (want - this.proprioErr) * Math.min(1, dt / 60);

    // 稳不稳：血压掉了会晃，恶心会晃，转了更会晃
    const dizzy = circ.dizzy ?? 0;
    const want2 = Math.max(0, 1 - Math.abs(this.spinBar) * 0.6 - this.nausea * 0.5 - dizzy * 0.5);
    this.stability += (want2 - this.stability) * Math.min(1, dt / 3);
  }

  read() {
    return {
      spin: this.spinBar,
      nausea: this.nausea,
      proprioErr: this.proprioErr,      // 度数，关节位置觉误差
      stability: this.stability,
      vertigo: Math.max(this.spinBar * 0.8, this.nausea * 0.6),
    };
  }

  dump() { return { spin: this.spin, spinBar: this.spinBar, conflict: this.conflict, nausea: this.nausea, proprioErr: this.proprioErr, stability: this.stability }; }
  restore(d) { if (d) Object.assign(this, d); }
}
