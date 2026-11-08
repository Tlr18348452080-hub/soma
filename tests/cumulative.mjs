// 累积语义的回归测试。不测"像不像人"，测"关一次 App 之后还在不在"。
// 跑法：node tests/cumulative.mjs
import { Soma } from '../soma.mjs';
import assert from 'node:assert/strict';

const log = (name, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? '  ' + detail : ''}`);
  if (!ok) process.exitCode = 1;
};

// 1. 张力会自己积起来（睡着，不碰）
{
  const s = new Soma();
  s.sleep();
  const t0 = s.get('arousal').read().tension;
  s.catchUp(8 * 3600);
  const t1 = s.get('arousal').read().tension;
  log('tension 在安静时上升', t1 > t0 + 0.05, `${t0.toFixed(3)} → ${t1.toFixed(3)}`);
}

// 2. 禁欲 36 小时接近上限，且不会超过 0.95
{
  const s = new Soma();
  s.sleep();
  s.catchUp(36 * 3600);
  const a = s.get('arousal').read();
  log('禁欲把 target 抬上去', a.tension > 0.45, `tension=${a.tension.toFixed(3)}`);
  log('tension 有上限', a.tension <= 0.95, `tension=${a.tension.toFixed(3)}`);
}

// 3. 释放之后塌下来，满足感顶住
{
  const s = new Soma();
  s.emit({ type: 'climax' });
  const a = s.get('arousal').read();
  log('climax 把张力打下去', a.tension < 0.12, `tension=${a.tension.toFixed(3)}`);
  log('climax 留下满足感', a.satiety > 0.4, `satiety=${a.satiety.toFixed(3)}`);
  log('climax 接上催产素', s.get('endocrine').read().oxytocin > 0.4,
    `oxy=${s.get('endocrine').read().oxytocin.toFixed(3)}`);
}

// 4. 慢变量落盘：dump → 新身体 → restore
{
  const s = new Soma();
  s.sleep();
  s.catchUp(6 * 3600);
  const before = s.get('arousal').read();
  const rhBefore = s.get('rhythm').read();
  const eBefore = s.get('endocrine').read();
  const saved = s.dump();

  const s2 = new Soma();
  saved.at = Date.now(); // 没离线，读回来应该一模一样
  s2.load(saved);
  const after = s2.get('arousal').read();
  const rhAfter = s2.get('rhythm').read();
  const eAfter = s2.get('endocrine').read();

  log('tension 存档', Math.abs(after.tension - before.tension) < 1e-9,
    `${before.tension.toFixed(4)} vs ${after.tension.toFixed(4)}`);
  log('sleepDebt 存档', Math.abs(rhAfter.debt - rhBefore.debt) < 1e-9,
    `${rhBefore.debt.toFixed(3)} vs ${rhAfter.debt.toFixed(3)}`);
  log('睾酮存档', Math.abs(eAfter.androgen - eBefore.androgen) < 1e-9,
    `${eBefore.androgen.toFixed(4)} vs ${eAfter.androgen.toFixed(4)}`);

  // 离线补推单独测：同一份存档，假装两分钟前存下的
  const s3 = new Soma();
  const stale = s.dump();
  stale.at = Date.now() - 120 * 1000;
  s3.load(stale);
  log('离线两分钟被补上', Math.abs(s3.t - (s.t + 120)) < 2,
    `t=${s.t.toFixed(0)} → ${s3.t.toFixed(0)}（含 120s 补推）`);
}

// 5. 缺血糖会真的饿（chem 曾经因为 ctx.get 吃掉整个 hunger）
{
  const s = new Soma();
  s.catchUp(24 * 3600);
  const v = s.get('vitals').read();
  log('饿是算出来的', v.hunger > 0.5, `hunger=${v.hunger.toFixed(3)} glucose=${v.glucose.toFixed(2)}`);
}

// 6. 睡眠债会累积（之前在 step 里被乘了 0.0）
{
  const s = new Soma();
  s.catchUp(20 * 3600);
  const rh = s.get('rhythm').read();
  log('缺觉会累积', rh.debt > 1, `debt=${rh.debt.toFixed(2)}h`);
  s.sleep();
  s.catchUp(8 * 3600);
  const rh2 = s.get('rhythm').read();
  log('睡一觉能还一部分', rh2.debt < rh.debt, `${rh.debt.toFixed(2)} → ${rh2.debt.toFixed(2)}`);
}

// 7. 本体误差接上了疲劳/血糖（曾经 ctx.get 全空）
{
  const s = new Soma();
  s.catchUp(24 * 3600);
  const ve = s.get('vestib').read();
  log('本体误差不为零', ve.proprioErr > 0.02, `proprioErr=${ve.proprioErr.toFixed(4)}`);
}

// 8. fmtWords 在尾巴打开时不炸（on 的 TDZ）
{
  const s = new Soma();
  s.get('touch').setOrgan?.('tail', true);
  let ok = true;
  let err = '';
  try { s.fmtWords(); } catch (e) { ok = false; err = e.message; }
  log('fmtWords 不炸', ok, err);
}

// 9. table 里看得到累积量
{
  const s = new Soma();
  s.catchUp(10 * 3600);
  const t = s.table();
  log('table 有睡眠债', /缺觉/.test(t));
  log('table 有睾酮', /睾酮/.test(t));
  log('table 有性张力', /张力/.test(t));
}

// 10. 长期能量储备会掉，而且一顿饭补不回来（这才叫累积）
{
  const s = new Soma();
  s.catchUp(48 * 3600);
  const e1 = s.get('vitals').read().energy;
  s.eat(1.5);
  s.catchUp(5 * 3600); // 消化完、血糖又掉下去了
  const e2 = s.get('vitals').read().energy;
  log('饿两天掉能量', e1 < 0.5, `energy=${e1.toFixed(3)}`);
  log('一顿饭补不回来', e2 < 0.62 && e2 > e1, `${e1.toFixed(3)} → ${e2.toFixed(3)}`);
}

// 11. 能量储备也进存档
{
  const s = new Soma();
  s.catchUp(36 * 3600);
  const before = s.get('vitals').read().energy;
  const d = s.dump();
  d.at = Date.now();
  const s2 = new Soma();
  s2.load(d);
  const after = s2.get('vitals').read().energy;
  log('能量储备存档', Math.abs(after - before) < 1e-9, `${before.toFixed(3)} vs ${after.toFixed(3)}`);
}

// 12. 睡眠债有上限，不会连着熬夜就欠到八十小时
{
  const s = new Soma();
  s.catchUp(96 * 3600);
  const debt = s.get('rhythm').read().debt;
  log('睡眠债封顶', debt <= 48.0001, `debt=${debt.toFixed(1)}h`);
}

console.log('\n完成。失败项会以 FAIL 标出。');
