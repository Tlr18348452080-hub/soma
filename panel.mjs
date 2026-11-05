#!/usr/bin/env node
// 身体状态面板。只读 /root/.dsh/soma-state.json —— 不推进、不写盘、不抢插件的活。
//   node panel.mjs [--port 7788]
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { Soma } from './soma.mjs';

const statePath = process.env.SOMA_STATE || '/root/.dsh/soma-state.json';
const argv = process.argv.slice(2);
const port = Number(argv[argv.indexOf('--port') + 1]) || 7788;

let soma = new Soma();
let lastMtime = 0, savedAt = 0, err = null;

function refresh() {
  try {
    const st = statSync(statePath);
    if (st.mtimeMs !== lastMtime) {
      lastMtime = st.mtimeMs;
      savedAt = st.mtimeMs;
      soma = new Soma();
      soma.load(JSON.parse(readFileSync(statePath, 'utf8')));
      err = null;
    }
  } catch (e) { err = e.message; }
}

function payload() {
  refresh();
  return {
    ok: !err, err,
    words: soma.fmtWords(),
    age: savedAt ? Math.round((Date.now() - savedAt) / 1000) : null,
    regions: soma.read(),
    vitals: (() => { try { return soma.get('vitals').read(); } catch { return {}; } })(),
    rhythm: (() => { try { return soma.get('rhythm').read(); } catch { return null; } })(),
    homeo: (() => { try { return soma.get('homeo').read(); } catch { return null; } })(),
    cycle: (() => { try { return soma.get('cycle').read(); } catch { return null; } })(),
    table: err ? '' : soma.table(),
  };
}

const HTML = `<!doctype html>
<html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>soma · 身体状态</title>
<style>
:root{--bg:#0b0f18;--pane:#121828;--line:#222c44;--dim:#5d6b8a;--fg:#c9d4ea}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.55 -apple-system,"PingFang SC","Noto Sans CJK SC",sans-serif}
.wrap{display:flex;gap:16px;padding:16px;max-width:880px;margin:0 auto;align-items:flex-start}
.left{flex:0 0 46%;max-width:320px}
.right{flex:1;display:flex;flex-direction:column;gap:10px;min-width:0}
.card{background:var(--pane);border:1px solid var(--line);border-radius:12px;padding:12px 14px}
.bodyline{font-size:15px;color:#e8eefc;min-height:46px}
.bodyline .age{display:block;color:var(--dim);font-size:11px;margin-top:7px}
.gauge{margin-bottom:11px}
.gauge:last-child{margin-bottom:0}
.gauge .lbl{display:flex;justify-content:space-between;font-size:12px;color:var(--dim);margin-bottom:4px}
.gauge .lbl b{color:var(--fg);font-weight:600;font-variant-numeric:tabular-nums}
.bar{height:6px;border-radius:4px;background:#1c2540;overflow:hidden}
.bar i{display:block;height:100%;border-radius:4px;transition:width .45s ease}
table{width:100%;border-collapse:collapse;font-size:12.5px}
td{padding:2.5px 0;border-bottom:1px solid #192033;color:var(--dim)}
td:first-child{color:var(--fg);width:34%}
td:last-child{text-align:right;font-variant-numeric:tabular-nums}
h3{margin:0 0 9px;font-size:11px;color:var(--dim);font-weight:500;letter-spacing:.1em}
svg{width:100%;height:auto;display:block}
.dot{transition:cx .4s,cy .4s,r .4s,fill .4s,opacity .4s}
</style></head><body>
<div class="wrap">
  <div class="left"><svg id="fig" viewBox="0 0 220 460"></svg></div>
  <div class="right">
    <div class="card"><div class="bodyline" id="bodyline">正在读…</div></div>
    <div class="card"><h3>内脏</h3>
      <div class="gauge"><div class="lbl"><span>心率</span><b id="hrv">—</b></div><div class="bar"><i id="hrb" style="background:#ff6b6b;width:0"></i></div></div>
      <div class="gauge"><div class="lbl"><span>疲劳</span><b id="fatv">—</b></div><div class="bar"><i id="fatb" style="background:#c58cff;width:0"></i></div></div>
      <div class="gauge"><div class="lbl"><span>饥饿</span><b id="hungv">—</b></div><div class="bar"><i id="hungb" style="background:#ffb454;width:0"></i></div></div>
      <div class="gauge"><div class="lbl"><span>血糖</span><b id="gluv">—</b></div><div class="bar"><i id="glub" style="background:#4fd1c5;width:0"></i></div></div>
      <div class="gauge"><div class="lbl"><span>警觉</span><b id="alv">—</b></div><div class="bar"><i id="alb" style="background:#8b9cf5;width:0"></i></div></div>
      <div class="gauge"><div class="lbl"><span>渴</span><b id="thv">—</b></div><div class="bar"><i id="thb" style="background:#5fc9f8;width:0"></i></div></div>
      <div style="color:var(--dim);font-size:12px;line-height:1.7;margin-top:6px" id="slow">—</div>
    </div>
    <div class="card"><h3>皮肤（只列有动静的）</h3><table id="tbl"></table></div>
  </div>
</div>
<script>
const XY={scalp:[110,20],forehead:[110,42],cheek:[96,58],ear_lobe:[79,54],lips:[110,66],tongue_tip:[110,70],
neck_front:[110,84],neck_side:[96,84],collarbone:[110,97],shoulder:[69,105],armpit:[77,116],chest:[110,118],
nipple:[98,126],belly:[110,152],waist_side:[86,161],back_upper:[130,121],back_lower:[130,159],hip:[110,196],
pubic:[110,212],vulva:[118,218],penis:[110,221],scrotum:[110,229],perineum:[110,235],
upper_arm:[51,132],elbow:[46,170],forearm:[42,201],dorsum:[40,233],palm:[40,249],palm_edge:[49,249],
thumb_tip:[26,259],index_mid:[34,263],index_tip:[32,273],pinky_tip:[42,266],ring_tip:[38,272],middle_tip:[36,276],
thigh:[95,262],knee:[95,301],calf:[95,341],ankle:[95,383],foot_dorsum:[95,399],sole:[95,407],toes:[95,417]};
const FIG='<g stroke="#2a3450" stroke-width="2" fill="#161d2e" stroke-linejoin="round">'
+'<ellipse cx="110" cy="50" rx="27" ry="33"/>'
+'<path d="M96 81 L96 96 Q110 103 124 96 L124 81 Z"/>'
+'<path d="M69 106 Q110 96 151 106 L153 190 Q132 207 110 207 Q88 207 67 190 Z"/>'
+'<path d="M67 190 Q110 214 153 190 L151 237 Q110 256 69 237 Z"/>'
+'<path d="M61 111 Q46 120 44 160 L42 247 Q42 264 49 270 L57 265 Q54 250 58 247 L60 160 L66 119 Z"/>'
+'<path d="M159 111 Q174 120 176 160 L178 247 Q178 264 171 270 L163 265 Q166 250 162 247 L160 160 L154 119 Z"/>'
+'<path d="M73 241 Q69 300 75 373 L84 373 Q84 300 88 241 Z"/>'
+'<path d="M147 241 Q151 300 145 373 L136 373 Q136 300 132 241 Z"/>'
+'<path d="M75 373 L84 373 L86 402 L74 402 Z"/>'
+'<path d="M145 373 L136 373 L134 402 L146 402 Z"/>'
+'</g>';
document.getElementById('fig').innerHTML=FIG+'<g id="dots"></g>';

function tone(r){
  if(r.pain>0.05) return ['#ff5c5c','痛'];
  if(r.ct>0.10) return ['#ff9ad5','舒服'];
  if(r.pressure>0.02) return ['#4fc3f7','压'];
  if(r.pressure<-0.02) return ['#8494b4','松开'];
  return null;
}
function amount(r){ return Math.min(1,Math.max(Math.abs(r.pressure)/1.2, r.pain, r.ct)); }

function draw(regions){
  let h='';
  for(const r of regions){
    const t=tone(r); const xy=XY[r.id];
    if(!t||!xy) continue;
    const a=amount(r);
    h+='<circle class="dot" cx="'+xy[0]+'" cy="'+xy[1]+'" r="'+(4+9*a).toFixed(1)+'" fill="'+t[0]+'" opacity="'+(0.35+0.55*a).toFixed(2)+'" stroke="#0b0f18" stroke-width="1.2"/>';
  }
  document.getElementById('dots').innerHTML=h;
}

function vitals(o){
  const hr=o.hr??65;
  const g=o.glucose??5.2;
  const f=o.fatigue??0;
  const hu=o.hunger??0;
  document.getElementById('hrv').textContent=Math.round(hr)+' 次/分';
  document.getElementById('hrb').style.width=(Math.max(0,(hr-50)/110)*100).toFixed(0)+'%';
  document.getElementById('fatv').textContent=Math.round(f*100)+'%';
  document.getElementById('fatb').style.width=(f*100).toFixed(0)+'%';
  document.getElementById('hungv').textContent=Math.round(hu*100)+'%';
  document.getElementById('hungb').style.width=(hu*100).toFixed(0)+'%';
  document.getElementById('gluv').textContent=g.toFixed(2)+' mmol/L';
  document.getElementById('glub').style.width=Math.min(100,Math.max(0,(g-3)/5*100)).toFixed(0)+'%';
  document.getElementById('glub').style.background = g<3.9 ? '#ff6b6b' : '#4fd1c5';
}

function slow(d){
  const r=d.rhythm||{}; const h=d.homeo||{}; const c=d.cycle||{};
  const al=Math.round((r.alert??0)*100);
  document.getElementById('alv').textContent=al+'%';
  document.getElementById('alb').style.width=al+'%';
  const th=Math.round((h.thirst??0)*100);
  document.getElementById('thv').textContent=th+'%';
  document.getElementById('thb').style.width=th+'%';
  const clock=r.clock!=null?String(Math.floor(r.clock/3600)).padStart(2,'0')+':'+String(Math.floor(r.clock%3600/60)).padStart(2,'0'):'—';
  const parts=[clock+' 身体钟', '核心 '+(h.coreT??0).toFixed(1)+'°C'];
  if(r.asleep) parts.push('睡着');
  if(c.day) parts.push('第 '+Math.floor(c.day)+' 天');
  document.getElementById('slow').textContent=parts.join(' · ');
}

function table(txt){
  const rows=txt.trim().split('\\n').slice(1).map(l=>l.split('|').map(s=>s.trim()));
  const body=rows.filter(r=>r[0]&&r[1]&&r[0]!=='—').map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td></tr>').join('');
  document.getElementById('tbl').innerHTML=body||'<tr><td colspan="3">身上没什么特别的动静</td></tr>';
}

async function tick(){
  try{
    const d=await (await fetch('/state')).json();
    const bl=document.getElementById('bodyline');
    if(!d.ok){ bl.innerHTML='读不到状态文件<small class="age">'+d.err+'</small>'; return; }
    bl.innerHTML=d.words+'<small class="age">'+(d.age===null?'':'上次写盘 '+d.age+' 秒前')+'</small>';
    draw(d.regions);
    vitals(d.vitals||{}); slow(d);
    table(d.table);
  }catch(e){ }
}
tick(); setInterval(tick,1000);
</script></body></html>`;

createServer((req, res) => {
  const url = req.url.split('?')[0];
  const send = (code, type, body) => {
    res.writeHead(code, { 'content-type': type, 'access-control-allow-origin': '*', 'cache-control': 'no-store' });
    res.end(body);
  };
  if (url === '/' ) return send(200, 'text/html; charset=utf-8', HTML);
  if (url === '/state') return send(200, 'application/json', JSON.stringify(payload()));
  return send(404, 'text/plain', 'not found');
}).listen(port, '127.0.0.1', () => console.log(`soma 面板  http://127.0.0.1:${port}`));
