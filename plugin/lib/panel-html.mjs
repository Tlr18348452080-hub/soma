// 面板的页面本体。独立服务器和插件的 /api/soma/panel 共用这一份。
// 里面只认相对地址 /state 与 /avatar，谁挂载谁负责把这两个名字指对。
export const HTML = `<!doctype html>
<html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>soma · 身体</title>
<style>
:root{
  --bg:#fbfbfd;--pane:#ffffff;--hair:rgba(0,0,0,.06);--line:rgba(0,0,0,.09);
  --fg:#14161c;--dim:#6d7480;--faint:#9299a4;--track:rgba(0,0,0,.07);
  --fig-line:rgba(0,0,0,.16);--fig-fill:rgba(0,0,0,.03);
  --hr:#d9584f;--fat:#9b7bec;--hun:#dd9a3c;--glu:#2f9e92;--alr:#6d7fdd;--thi:#4a9fd4;
  --r-lg:16px;--r-md:11px;
}
@media (prefers-color-scheme:dark){
  :root{
    --bg:#0b0f18;--pane:#111726;--hair:rgba(255,255,255,.055);--line:rgba(255,255,255,.09);
    --fg:#e7ecf6;--dim:#8d95a8;--faint:#6b7386;--track:rgba(255,255,255,.09);
    --fig-line:rgba(255,255,255,.16);--fig-fill:rgba(255,255,255,.028);
    --hr:#ff6b6b;--fat:#b294ff;--hun:#ffb454;--glu:#4fd1c5;--alr:#8b9cf5;--thi:#5fc9f8;
  }
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0}
body{
  background:var(--bg);color:var(--fg);
  font:14px/1.6 -apple-system,BlinkMacSystemFont,"PingFang SC","Noto Sans CJK SC","Segoe UI",Roboto,sans-serif;
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
  padding:max(14px,env(safe-area-inset-top)) 16px 28px;
}
.bar{display:flex}
body.embedded .bar{display:none}
.bar{align-items:center;gap:10px;padding:2px 2px 14px}
.bar b{font-size:15px;font-weight:600;letter-spacing:-.01em}
.bar span{font-size:11.5px;color:var(--faint)}
.bar button{
  margin-left:auto;height:30px;padding:0 13px;border:0;cursor:pointer;
  border-radius:var(--r-md);background:var(--hair);color:var(--dim);
  font:inherit;font-size:12.5px;
}
.bar button:hover{color:var(--fg)}

.wrap{display:grid;grid-template-columns:minmax(190px,300px) minmax(0,1fr);gap:20px;
  max-width:900px;margin:0 auto;align-items:start}
@media (max-width:680px){
  .wrap{grid-template-columns:1fr;gap:16px}
  .left{max-width:250px;margin:0 auto;width:100%}
}

.left{position:sticky;top:14px}
@media (max-width:680px){.left{position:static}}
#fig{width:100%;height:auto;display:block}
#fig path.silhouette{stroke:var(--fig-line);fill:var(--fig-fill)}
.dot{transition:cx .45s,cy .45s,r .45s,fill .45s,opacity .45s}

.right{display:flex;flex-direction:column;gap:12px;min-width:0}
.card{background:var(--pane);border:1px solid var(--line);border-radius:var(--r-lg);
  padding:14px 16px;box-shadow:0 1px 2px rgba(0,0,0,.03)}

.bodyline{font-size:14.5px;line-height:1.65;min-height:44px;letter-spacing:.005em}
.bodyline .age{display:block;margin-top:8px;color:var(--faint);font-size:11.5px;font-variant-numeric:tabular-nums}

h3{margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:.08em;
  color:var(--faint);text-transform:uppercase}

.gauge+.gauge{margin-top:11px}
.gauge .lbl{display:flex;align-items:baseline;justify-content:space-between;gap:12px;
  font-size:12.5px;color:var(--dim);margin-bottom:5px}
.gauge .lbl b{color:var(--fg);font-weight:500;font-size:12.5px;
  font-variant-numeric:tabular-nums;letter-spacing:0}
.bar{height:3px;border-radius:3px;background:var(--track);overflow:hidden}
.bar i{display:block;height:100%;border-radius:3px;transition:width .5s cubic-bezier(.4,0,.2,1)}

table{width:100%;border-collapse:collapse;font-size:12.5px}
tr+tr td{border-top:1px solid var(--hair)}
td{padding:7px 0;color:var(--dim);vertical-align:top}
td:first-child{color:var(--fg);width:36%;padding-right:10px}
td:last-child{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;padding-left:10px}
.empty td{color:var(--faint);text-align:left;font-style:normal}

.slow{margin-top:13px;padding-top:12px;border-top:1px solid var(--hair);
  color:var(--dim);font-size:12px;line-height:1.75;font-variant-numeric:tabular-nums}
</style></head><body>
<div class="bar"><b>身体</b><span>每秒刷新</span><button type="button" onclick="leave()">关闭</button></div>
<div class="wrap">
  <div class="left"><svg id="fig" viewBox="0 0 220 460" aria-label="身体示意图"></svg></div>
  <div class="right">
    <div class="card"><div class="bodyline" id="bodyline">正在读…</div></div>
    <div class="card"><h3>内脏</h3>
      <div class="gauge"><div class="lbl"><span>心率</span><b id="hrv">—</b></div>
        <div class="bar"><i id="hrb" style="background:var(--hr);width:0"></i></div></div>
      <div class="gauge"><div class="lbl"><span>疲劳</span><b id="fatv">—</b></div>
        <div class="bar"><i id="fatb" style="background:var(--fat);width:0"></i></div></div>
      <div class="gauge"><div class="lbl"><span>饥饿</span><b id="hungv">—</b></div>
        <div class="bar"><i id="hungb" style="background:var(--hun);width:0"></i></div></div>
      <div class="gauge"><div class="lbl"><span>血糖</span><b id="gluv">—</b></div>
        <div class="bar"><i id="glub" style="background:var(--glu);width:0"></i></div></div>
      <div class="gauge"><div class="lbl"><span>警觉</span><b id="alv">—</b></div>
        <div class="bar"><i id="alb" style="background:var(--alr);width:0"></i></div></div>
      <div class="gauge"><div class="lbl"><span>渴</span><b id="thv">—</b></div>
        <div class="bar"><i id="thb" style="background:var(--thi);width:0"></i></div></div>
      <div class="slow" id="slow">—</div>
    </div>
    <div class="card"><h3>皮肤 · 只列有动静的</h3><table id="tbl"></table></div>
  </div>
</div>
<script>
if(window.self!==window.top) document.body.classList.add('embedded');
function leave(){
  if(window.self!==window.top){ try{ parent.postMessage({type:'soma-panel-close'},'*') }catch(e){} return }
  if(history.length>1) history.back(); else window.close();
}
const XY={scalp:[110,20],forehead:[110,42],cheek:[96,58],ear_lobe:[79,54],lips:[110,66],tongue_tip:[110,70],
neck_front:[110,84],neck_side:[96,84],collarbone:[110,97],shoulder:[69,105],armpit:[77,116],chest:[110,118],
nipple:[98,126],belly:[110,152],waist_side:[86,161],back_upper:[130,121],back_lower:[130,159],hip:[110,196],
pubic:[110,212],vulva:[118,218],penis:[110,221],scrotum:[110,229],perineum:[110,235],
upper_arm:[51,132],elbow:[46,170],forearm:[42,201],dorsum:[40,233],palm:[40,249],palm_edge:[49,249],
thumb_tip:[26,259],index_mid:[34,263],index_tip:[32,273],pinky_tip:[42,266],ring_tip:[38,272],middle_tip:[36,276],
thigh:[95,262],knee:[95,301],calf:[95,341],ankle:[95,383],foot_dorsum:[95,399],sole:[95,407],toes:[95,417]};
const FIG='<g stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round">'
+'<ellipse cx="110" cy="50" rx="27" ry="33"/>'
+'<path class="silhouette" d="M96 81 L96 96 Q110 103 124 96 L124 81 Z"/>'
+'<path class="silhouette" d="M69 106 Q110 96 151 106 L153 190 Q132 207 110 207 Q88 207 67 190 Z"/>'
+'<path class="silhouette" d="M67 190 Q110 214 153 190 L151 237 Q110 256 69 237 Z"/>'
+'<path class="silhouette" d="M61 111 Q46 120 44 160 L42 247 Q42 264 49 270 L57 265 Q54 250 58 247 L60 160 L66 119 Z"/>'
+'<path class="silhouette" d="M159 111 Q174 120 176 160 L178 247 Q178 264 171 270 L163 265 Q166 250 162 247 L160 160 L154 119 Z"/>'
+'<path class="silhouette" d="M73 241 Q69 300 75 373 L84 373 Q84 300 88 241 Z"/>'
+'<path class="silhouette" d="M147 241 Q151 300 145 373 L136 373 Q136 300 132 241 Z"/>'
+'<path class="silhouette" d="M75 373 L84 373 L86 402 L74 402 Z"/>'
+'<path class="silhouette" d="M145 373 L136 373 L134 402 L146 402 Z"/>'
+'</g>';
const SVGFIG=document.getElementById('fig');
SVGFIG.innerHTML=FIG+'<g id="dots"></g>';

function tone(r){
  if(r.pain>0.05) return ['var(--hr)','痛'];
  if(r.ct>0.10) return ['var(--fat)','舒服'];
  if(r.pressure>0.02) return ['var(--thi)','压'];
  if(r.pressure<-0.02) return ['var(--dim)','松开'];
  return null;
}
function amount(r){ return Math.min(1,Math.max(Math.abs(r.pressure)/1.2, r.pain, r.ct)); }

async function loadLook(){
  try{
    const r=await fetch('/avatar',{cache:'no-store'});
    if(!r.ok) return;
    const b=await r.blob();
    const u=URL.createObjectURL(b);
    SVGFIG.querySelectorAll('path.silhouette').forEach(p=>p.setAttribute('opacity','0.12'));
    const img=document.createElementNS('http://www.w3.org/2000/svg','image');
    img.setAttribute('href',u); img.setAttribute('x','0'); img.setAttribute('y','0');
    img.setAttribute('width','220'); img.setAttribute('height','460');
    img.setAttribute('preserveAspectRatio','xMidYMid meet');
    SVGFIG.insertBefore(img, SVGFIG.firstChild);
  }catch(e){}
}

function draw(regions){
  let h='';
  for(const r of (regions||[])){
    const t=tone(r); const xy=XY[r.id];
    if(!t||!xy) continue;
    const a=amount(r);
    h+='<circle class="dot" cx="'+xy[0]+'" cy="'+xy[1]+'" r="'+(4+9*a).toFixed(1)+'" fill="'+t[0]+'" opacity="'+(0.32+0.52*a).toFixed(2)+'" stroke="var(--bg)" stroke-width="1.2"/>';
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
  document.getElementById('glub').style.background = g<3.9 ? 'var(--hr)' : 'var(--glu)';
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
  const m=d.memory||{};
  if(m.count!=null) parts.push('记得 '+m.count+' 条（最清楚 '+Math.round((m.strength||0)*100)+'%）');
  document.getElementById('slow').textContent=parts.join(' · ');
}

function table(txt){
  const rows=String(txt||'').trim().split('\\n').slice(1).map(l=>l.split('|').map(s=>s.trim()));
  const body=rows.filter(r=>r[0]&&r[1]&&r[0]!=='—')
    .map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+(r[2]||'')+'</td></tr>').join('');
  document.getElementById('tbl').innerHTML=body||'<tr class="empty"><td>身上没什么特别的动静</td></tr>';
}

async function tick(){
  if(!window.__look){window.__look=1;loadLook();}
  try{
    const d=await (await fetch('/state')).json();
    const bl=document.getElementById('bodyline');
    if(!d.ok){ bl.innerHTML='读不到状态文件<small class="age">'+(d.err||'')+'</small>'; return; }
    bl.innerHTML=d.words+'<small class="age">'+(d.age===null?'':'上次写盘 '+d.age+' 秒前')+'</small>';
    draw(d.regions);
    vitals(d.vitals||{}); slow(d);
    table(d.table);
  }catch(e){ }
}
tick(); setInterval(tick,1000);
</script></body></html>`
