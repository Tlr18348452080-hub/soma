// 新增人体通道的回归测试：经期、消化泌尿、皮肤、代谢、睡眠分期。
// 跑法：node tests/body2.mjs
import { Soma } from '../soma.mjs';

const log = (name, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? '  ' + detail : ''}`);
  if (!ok) process.exitCode = 1;
};

// 经期：第 1 天开始流血
{
  const s = new Soma();
  s.get('cycle').day = 1;
  s.catchUp(6 * 3600);
  const m = s.get('menstrual').read();
  log('经期第 1 天在流血', m.flow > 0.2, `flow=${m.flow.toFixed(3)}`);
  log('经血在累计', m.cycleLoss > 1, `loss=${m.cycleLoss.toFixed(1)} mL`);
  log('卫生用品在变湿', m.padSat > 0.02, `padSat=${m.padSat.toFixed(3)}`);
  log('经期有痛感', m.painGain > 1, `painGain=${m.painGain.toFixed(3)}`);
}

// 经期：第 20 天不流血
{
  const s = new Soma();
  s.get('cycle').day = 20;
  s.catchUp(6 * 3600);
  const m = s.get('menstrual').read();
  log('非经期不流血', m.flow < 0.01, `flow=${m.flow.toFixed(3)}`);
  log('非经期没有经痛', m.cramp < 0.2, `cramp=${m.cramp.toFixed(3)}`);
}

// 周期读数：排卵前后
{
  const s = new Soma();
  s.get('cycle').day = 13;
  const a = s.get('cycle').read();
  s.get('cycle').day = 22;
  const b = s.get('cycle').read();
  log('排卵期黏液变多', a.mucus > b.mucus + 0.2, `${a.mucus.toFixed(2)} vs ${b.mucus.toFixed(2)}`);
  log('排卵期有性欲抬升', a.libido > b.libido, `${a.libido.toFixed(2)} vs ${b.libido.toFixed(2)}`);
}

// 消化：吃进去、排出去
{
  const s = new Soma();
  s.eat(2);
  const g0 = s.get('gut').read();
  log('吃东西胃里有东西', g0.stomach > 300, `stomach=${g0.stomach.toFixed(0)} mL`);
  s.catchUp(4 * 3600);
  const g1 = s.get('gut').read();
  log('胃在排空', g1.stomach < g0.stomach, `${g0.stomach.toFixed(0)} → ${g1.stomach.toFixed(0)}`);
  log('肠道在积', g1.stool > g0.stool, `${g0.stool.toFixed(2)} → ${g1.stool.toFixed(2)}`);
}

// 泌尿：憋久了有尿意，撒完就好
{
  const s = new Soma();
  s.catchUp(3 * 3600);
  const b0 = s.get('gut').read();
  log('憋久了膀胱在涨', b0.bladder > 120, `bladder=${b0.bladder.toFixed(0)} mL`);
  log('有尿意', b0.urgency > 0.05, `urgency=${b0.urgency.toFixed(2)}`);
  s.pee(400);
  log('撒完尿意下去', s.get('gut').read().bladder < b0.bladder, `→ ${s.get('gut').read().bladder.toFixed(0)} mL`);
}

// 皮肤：划开、凝血、按住
{
  const s = new Soma();
  s.cut('forearm', 4, 0.3);
  const k0 = s.get('skin').read();
  log('划开在流血', k0.bleeding > 0.05, `bleeding=${k0.bleeding.toFixed(3)}`);
  s.catchUp(20 * 60);
  const k1 = s.get('skin').read();
  log('血流会变少', k1.bleeding < k0.bleeding, `${k0.bleeding.toFixed(3)} → ${k1.bleeding.toFixed(3)}`);
  log('凝血在涨', k1.wounds && k1.clot > 0, `clot=${k1.clot.toFixed(3)}`);
  s.bandage();
  log('按住就不流了', s.get('skin').read().bleeding < 1e-6, `bleeding=${s.get('skin').read().bleeding.toFixed(4)}`);
}

// 代谢：饿着的时候激素换挡
{
  const s = new Soma();
  const m0 = s.get('metabolic').read();
  s.catchUp(24 * 3600);
  const m1 = s.get('metabolic').read();
  log('饿久了饥饿素上去', m1.ghrelin > m0.ghrelin + 0.1, `${m0.ghrelin.toFixed(2)} → ${m1.ghrelin.toFixed(2)}`);
  log('饿久了瘦素下来', m1.leptin < m0.leptin, `${m0.leptin.toFixed(2)} → ${m1.leptin.toFixed(2)}`);
  log('饿久了开始产酮', m1.ketones > 0.05, `ketones=${m1.ketones.toFixed(3)}`);
  s.eat(2);
  log('吃完胰岛素抬头', s.get('metabolic').read().insulin > m1.insulin, `insulin=${s.get('metabolic').read().insulin.toFixed(3)}`);
}

// 睡眠：入睡、进深睡、醒来发懵
{
  const s = new Soma();
  s.sleep();
  log('刚睡下是 N1', s.get('sleeparch').read().stage === 'N1', s.get('sleeparch').read().stage);
  s.catchUp(4 * 3600);
  const sa = s.get('sleeparch').read();
  log('四小时后睡得深', sa.depth > 0.45, `depth=${sa.depth.toFixed(2)} stage=${sa.stage}`);
  log('有 REM 在记账', sa.rem > 0.2, `rem=${sa.rem.toFixed(2)}`);
  s.wake();
  const sb = s.get('sleeparch').read();
  log('醒来有睡眠惯性', sb.inertia > 0.1, `inertia=${sb.inertia.toFixed(2)}`);
}

// 表里真的看得到
{
  const s = new Soma();
  s.get('cycle').day = 2;
  s.catchUp(2 * 3600);
  const t = s.table();
  for (const key of ['胃', '膀胱', '伤口', '经期', '胰岛素', '睡眠分期']) {
    log(`table 里有${key}`, t.includes(key));
  }
}

console.log('\n完成。失败项会以 FAIL 标出。');
