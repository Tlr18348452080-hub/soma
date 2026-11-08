// 触觉通道数值稳定性回归。
// 病灶：bar 的适应用显式欧拉 (h/τ) 近似，而 catchUp 一步给 60 s、τ 最小 1.2 s，
// 每步放大 |1-h/τ| 倍 → 嘴唇压强读数真的变成过 2.8e45 N/cm²。
// 现在改成 1-e^(-h/τ)，对任意 h 稳定；restore 另外把越界的历史坏值扔掉。
// 跑法：node tests/touch-stab.mjs
import { Touch } from '../channels/touch.mjs';

const log = (name, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? '  ' + detail : ''}`);
  if (!ok) process.exitCode = 1;
};

// 1) 300 步 × 60 s 空走，两根 bar 都不能跑出 [0,1] 太远
{
  const t = new Touch({});
  const body = { t: 0 };
  t.body = body;
  let worst = 0;
  for (let i = 0; i < 300; i++) {
    body.t += 60;
    t.step(60, {});
    for (const r of t.regions) worst = Math.max(worst, Math.abs(r.barF), Math.abs(r.barS));
  }
  log('离线补推 5 小时不发散', Number.isFinite(worst) && worst <= 1 + 1e-9, `max|bar|=${worst.toExponential(1)}`);
}

// 2) 有持续按压时读数仍是正常量级
{
  const t = new Touch({});
  const body = { t: 0 };
  t.body = body;
  t.apply({ type: 'touch', part: 'lips', force: 0.5, contact: 'tip' });
  for (let i = 0; i < 60; i++) { body.t += 60; t.step(60, {}); }
  const lip = t.read().find((r) => r.id === 'lips');
  log('嘴唇压强是正常量级', Math.abs(lip.pressure) < 10, `${lip.pressure.toFixed(3)} N/cm²`);
}

// 3) 旧存档里的发散坏值读进来要被扔掉，正常值要留着
{
  const t = new Touch({});
  t.restore({ regions: {
    lips: [0.083, 34.5, 0, 0, 0, 0, 0, 1, 0.12, -7.8e39, 0, 2547],
    sole: [0, 29, 0, 0, 0, 0, 1.6, 1, -1.6e50, 0.7, 0, null],
  } });
  const lips = t.region('lips'), sole = t.region('sole');
  log('坏值归零', lips.barS === 0 && sole.barF === 0, `${lips.barS} / ${sole.barF}`);
  log('好值保留', lips.barF === 0.12 && sole.barS === 0.7);
}

console.log('\n完成。失败项会以 FAIL 标出。');
