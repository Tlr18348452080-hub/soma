// 味觉与嗅觉。两个都是「先闻着，一会儿就没了」的系统：
// 嗅觉适应极快（几十秒就闻不到了），味觉慢一些。
// 饱的时候什么都不香，这是嗅觉被内脏状态压着。
import { Channel } from '../core.mjs';

export const TASTES = {
  sweet: { label: '甜', thr: 0.10 },
  salt:  { label: '咸', thr: 0.08 },
  sour:  { label: '酸', thr: 0.06 },
  bitter:{ label: '苦', thr: 0.02 },
  umami: { label: '鲜', thr: 0.06 },
};

export class Chem extends Channel {
  constructor() {
    super('chem');
    this.taste = { sweet: 0, salt: 0, sour: 0, bitter: 0, umami: 0 };
    this.bar = { sweet: 0, salt: 0, sour: 0, bitter: 0, umami: 0 };
    this.smell = 0;
    this.smellBar = 0;
    this.smellName = null;
    this.pleasure = 0;   // 好吃／难吃 −1…1
  }

  apply(ev) {
    if (ev.type === 'taste') {
      for (const k of Object.keys(TASTES)) {
        if (ev[k] != null) this.taste[k] = Math.max(0, Math.min(1, ev[k]));
      }
      this.pleasure = ev.pleasure ?? this.pleasure;
      return true;
    }
    if (ev.type === 'smell') {
      this.smell = Math.max(0, Math.min(1, ev.level ?? 0.5));
      this.smellName = ev.name ?? null;
      this.pleasure = ev.pleasure ?? this.pleasure;
      return true;
    }
    if (ev.type === 'clear_mouth') { this.taste = { sweet: 0, salt: 0, sour: 0, bitter: 0, umami: 0 }; return true; }
    return false;
  }

  step(dt, ctx) {
    const vit = ctx.get?.('vitals')?.read?.() ?? {};
    const hunger = vit.hunger ?? 0;
    // 嗅觉适应：τ ≈ 40 秒（闻久了就闻不到）[A]
    this.smellBar += (this.smell - this.smellBar) * Math.min(1, dt / 40);
    this.smell = Math.max(0, this.smell - dt / 120);
    // 味觉适应慢一点，τ ≈ 90 秒 [G]
    for (const k of Object.keys(this.bar)) {
      // 尝到是几乎立刻的（τ≈1 秒），淡掉才慢
      this.bar[k] += (this.taste[k] - this.bar[k]) * Math.min(1, dt / 1);
      this.taste[k] = Math.max(0, this.taste[k] - dt / 180);
    }
    // 饿的时候更香，饱了就不香了（嗅觉被内脏状态上调）
    this.pleasure = Math.max(-1, Math.min(1, this.pleasure * (1 - Math.min(1, dt / 300)) + hunger * 0.0004));
  }

  read() {
    const top = Object.entries(this.bar).sort((a, b) => b[1] - a[1])[0];
    const taste = top && top[1] > (TASTES[top[0]].thr) ? { name: TASTES[top[0]].label, v: top[1] } : null;
    return {
      taste: taste?.name ?? null,
      tasteStrength: taste?.v ?? 0,
      smell: this.smellBar,
      smellName: this.smellName,
      pleasure: this.pleasure,
    };
  }

  dump() { return { taste: this.taste, bar: this.bar, smell: this.smell, pleasure: this.pleasure }; }
  restore(d) { if (d) { Object.assign(this.taste, d.taste); Object.assign(this.bar, d.bar); this.smell = d.smell ?? 0; this.pleasure = d.pleasure ?? 0; } }
}
