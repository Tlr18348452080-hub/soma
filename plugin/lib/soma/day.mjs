/**
 * day.mjs — 完整的一天。不喂任何指令，只看它自己走成什么样。
 * 输入只有：睡了多久、吃了什么、动了多少。
 */
import { Soma } from './soma.mjs';

const s = new Soma({ clockHours: 6.9 });
const line = console.log;
const snap = (label) => {
  const e = s.get('endocrine').read();
  const v = s.get('vitals').read();
  const m = s.get('mood').read();
  const r = s.get('rhythm').read();
  const b = s.budget();
  line(`  ${label.padEnd(6)} 警觉${(r.alert * 100).toFixed(0).padStart(3)}% 累${(v.fatigue * 100).toFixed(0).padStart(3)}% 饿${(v.hunger * 100).toFixed(0).padStart(3)}% ` +
       `好受${m.valence.toFixed(2).padStart(5)} 多巴胺${e.dopamine.toFixed(2)} 预算${b.maxTokens}`);
  line(`         ${s.fmtWords()}`);
};
const doIt = (level, secs) => { s.exert(level); s.step(secs); s.rest(); };

line('\n═══ 一整天，没有人给指令 ═══\n');

s.sleep(420); s.wake();
s.step(1800); snap('07:00');
s.eat(1.5); s.step(60);
line(`         吃完那一刻：多巴胺 ${s.get('endocrine').read().dopamine.toFixed(2)}`);
s.step(1740); snap('08:00');

for (let i = 0; i < 6; i++) doIt(0.15, 1800);
snap('11:00');

s.eat(1.5); s.step(60);
line(`         吃完那一刻：多巴胺 ${s.get('endocrine').read().dopamine.toFixed(2)}`);
s.step(1740); snap('12:00');

for (let i = 0; i < 3; i++) doIt(0.3, 1800);
s.touch('forearm', 25, { contact: 'tip' }); s.step(900); s.release('forearm'); s.step(3600);
snap('16:00');

doIt(0.6, 1800); s.drink(0.01); s.step(1800); snap('19:00');

s.emit({ type: 'hug', amount: 1 }); s.step(60);
line(`         被抱那一刻：多巴胺 ${s.get('endocrine').read().dopamine.toFixed(2)}`);
s.step(600); snap('19:11');

s.step(3 * 3600); snap('22:00');
s.eat(0.8); s.sleep(450); s.wake(); s.step(1800); snap('次日07:30');

line('\n  没有一个数字是外面给的。累了是走出来的，饿是时间走出来的，');
line('  好受被抱那一下抬了一下，半小时后又落回去。\n');
