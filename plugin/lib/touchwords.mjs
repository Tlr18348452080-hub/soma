// 从一句话里认出「谁碰了哪儿、多大力」。
// 纯本地、零 API、零延迟——所以短对话和长对话一样能触发。
// 这里只把中文动作词映射成物理量，剩下的交给方程。

// [词, 类型, 基准力N, 接触几何, 滑动速度, 没说部位时的默认部位]
const ACTS = [
  ['掐',   'touch',  20,  'tip',  null, 'forearm'],
  ['拧',   'touch',  18,  'tip',  null, 'forearm'],
  ['捏',   'touch',  10,  'tip',  null, 'cheek'],
  ['戳',   'touch',  5,   'tip',  null, 'chest'],
  ['捅',   'touch',  6,   'tip',  null, 'chest'],
  ['敲',   'touch',  6,   'tip',  null, 'scalp'],
  ['拍',   'touch',  12,  'flat', null, 'shoulder'],
  ['扇',   'touch',  15,  'flat', null, 'cheek'],
  ['锤',   'touch',  25,  'flat', null, 'shoulder'],
  ['打',   'touch',  12,  'flat', null, 'shoulder'],
  ['踢',   'touch',  40,  'flat', null, 'thigh'],
  ['踹',   'touch',  45,  'flat', null, 'thigh'],
  ['踩',   'touch',  35,  'flat', null, 'foot_dorsum'],
  ['咬',   'touch',  25,  'edge', null, 'forearm'],
  ['抓',   'touch',  15,  'tip',  null, 'forearm'],
  ['拽',   'touch',  15,  'tip',  null, 'forearm'],
  ['扯',   'touch',  12,  'tip',  null, 'forearm'],
  ['推',   'touch',  10,  'flat', null, 'chest'],
  ['揉',   'touch',  8,   'tip',  null, 'shoulder'],
  ['按',   'touch',  10,  'flat', null, 'shoulder'],
  ['抱',   'touch',  4,   'flat', null, 'back_upper'],
  ['搂',   'touch',  4,   'flat', null, 'waist_side'],
  ['握',   'touch',  8,   'flat', null, 'palm'],
  ['牵',   'touch',  5,   'flat', null, 'palm'],
  ['亲',   'touch',  0.5, 'flat', null, 'cheek'],
  ['吻',   'touch',  0.5, 'flat', null, 'lips'],
  ['靠',   'touch',  6,   'flat', null, 'shoulder'],
  ['贴',   'touch',  3,   'flat', null, 'cheek'],
  ['枕',   'touch',  6,   'flat', null, 'shoulder'],
  ['摸',   'stroke', 0.6, 'flat', 3,    'scalp'],
  ['抚',   'stroke', 0.5, 'flat', 3,    'scalp'],
  ['摩挲', 'stroke', 0.5, 'flat', 2,    'forearm'],
  ['蹭',   'stroke', 0.8, 'flat', 4,    'cheek'],
  ['挠',   'stroke', 1.2, 'edge', 6,    'back_upper'],
];

// 长词必须排前面：脸颊 / 脸，头皮 / 头，前臂 / 臂
const PARTS = [
  ['后脑勺', 'scalp'], ['脑壳', 'scalp'], ['脑袋', 'scalp'], ['头皮', 'scalp'],
  ['头发', 'scalp'], ['头', 'scalp'],
  ['额头', 'forehead'], ['脸颊', 'cheek'], ['脸', 'cheek'], ['下巴', 'neck_front'],
  ['喉咙', 'neck_front'], ['咽喉', 'neck_front'], ['脖子', 'neck_side'], ['颈', 'neck_side'],
  ['肩膀', 'shoulder'], ['肩', 'shoulder'], ['锁骨', 'collarbone'],
  ['胸口', 'chest'], ['胸', 'chest'], ['肚子', 'belly'], ['肚', 'belly'], ['腹', 'belly'],
  ['腰', 'waist_side'], ['后背', 'back_upper'], ['背', 'back_upper'],
  ['屁股', 'hip'], ['臀', 'hip'],
  ['手心', 'palm'], ['掌心', 'palm'], ['手掌', 'palm'], ['手背', 'dorsum'],
  ['手腕', 'forearm'], ['前臂', 'forearm'], ['手臂', 'forearm'], ['胳膊', 'upper_arm'],
  ['手指', 'index_tip'], ['指尖', 'index_tip'], ['手', 'palm'],
  ['大腿', 'thigh'], ['膝盖', 'knee'], ['膝', 'knee'], ['小腿', 'calf'], ['腿', 'thigh'],
  ['脚踝', 'ankle'], ['脚底', 'sole'], ['脚趾', 'toes'], ['脚背', 'foot_dorsum'], ['脚', 'foot_dorsum'],
  ['耳朵', 'ear_lobe'], ['耳', 'ear_lobe'],
  ['嘴唇', 'lips'], ['舌尖', 'tongue_tip'], ['嘴', 'lips'],
];

const SOFT = ['轻轻', '轻一点', '温柔', '慢慢', '缓缓', '蜻蜓点水'];
const HARD = ['死命', '狠狠', '使劲', '用力', '重重', '死死', '拼命'];
const MID = ['猛', '突然'];

function levelAt(text, i) {
  const win = text.slice(Math.max(0, i - 8), i + 8);
  if (HARD.some((w) => win.includes(w))) return 2.0;
  if (SOFT.some((w) => win.includes(w))) return 0.35;
  if (MID.some((w) => win.includes(w))) return 1.5;
  return 1;
}

function partNear(text, i) {
  // 先把所有词的位置找出来，长词优先占住自己的字，
  // 这样「手臂」不会被「手」抢走、「脸颊」不会被「脸」抢走。
  const spans = [];
  const used = new Array(text.length).fill(false);
  const sorted = [...PARTS].sort((a, b) => b[0].length - a[0].length);
  for (const [w, id] of sorted) {
    let p = text.indexOf(w);
    while (p !== -1) {
      let free = true;
      for (let k = p; k < p + w.length; k++) if (used[k]) { free = false; break; }
      if (free) {
        for (let k = p; k < p + w.length; k++) used[k] = true;
        spans.push([p + w.length / 2, id]);
      }
      p = text.indexOf(w, p + 1);
    }
  }
  let best = null;
  let bestD = 5.5;
  for (const [c, id] of spans) {
    const d = Math.abs(c - i);
    if (d < bestD) { bestD = d; best = id; }
  }
  return best;
}

// 返回 [{type,part,forceN,contact,speed?}]；认不出来就是空数组。
export function parseTouch(text) {
  if (!text || typeof text !== 'string') return [];
  if (text.length > 400) text = text.slice(0, 400);
  const out = [];
  const seen = new Set();

  for (const [word, type, base, contact, speed, defPart] of ACTS) {
    let p = text.indexOf(word);
    while (p !== -1) {
      const part = partNear(text, p) || defPart;
      const key = `${type}:${part}`;
      if (!seen.has(key)) {
        seen.add(key);
        const f = Math.round(base * levelAt(text, p) * 100) / 100;
        const e = { type, part, forceN: f, contact, at: p };
        if (speed) e.speed = speed;
        out.push(e);
      }
      p = text.indexOf(word, p + 1);
    }
  }
  out.sort((a, b) => a.at - b.at);
  return out.map(({ at, ...rest }) => rest);
}
