// ── PASSWORD LOCK ──
// Yahan apna password change kar sakte hain (neeche wali line mein):
const APP_PASSWORD = 'Rehan';
const $=id=>document.getElementById(id);
function checkPassword(){
  const val=$('lock-pass').value;
  if(val===APP_PASSWORD){ $('lock-screen').style.display='none'; $('app-content').style.display='block'; replay(cur); }
  else { $('lock-err').textContent='Galat password! Dobara koshish karein.'; $('lock-pass').value=''; $('lock-pass').focus(); }
}
$('lock-pass').addEventListener('keydown',e=>{ if(e.key==='Enter') checkPassword(); });
function logout(){
  $('app-content').style.display='none'; $('lock-screen').style.display='flex';
  $('lock-pass').value=''; $('lock-err').textContent=''; $('lock-pass').focus();
}

// ── DATA (same storage key + same record structure as before) ──
let db = { nc:[], oi:[], ex:[], sl:[], fe:[] };
try {
  const saved = localStorage.getItem('isp_register_db');
  if (saved) db = JSON.parse(saved);
  ['nc','oi','ex','sl','fe'].forEach(k=>{ if(!db[k]) db[k]=[]; });
} catch(e) {}
function saveToStorage(){ try{ localStorage.setItem('isp_register_db', JSON.stringify(db)); }catch(e){} }
const pad=n=>String(n).padStart(2,'0');
const today=()=>new Date().toISOString().slice(0,10);
const Rs=n=>'Rs '+(n||0).toLocaleString();
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function fmtDate(d){
  if(!d) return 'Date Nahi'; const p=d.split('-'); if(p.length!==3) return d;
  const M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], mi=parseInt(p[1],10)-1;
  return mi<0||mi>11?d:`${parseInt(p[2],10)} ${M[mi]} ${p[0]}`;
}
function nameToColor(n){ let h=0; for(let i=0;i<n.length;i++){h=n.charCodeAt(i)+((h<<5)-h);h&=h;} return `hsl(${Math.abs(h)%360},65%,42%)`; }

// ── ICONS ──
const IC={dash:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
inc:'<path d="M12 5v14M19 12l-7 7-7-7"/>',exp:'<path d="M12 19V5M5 12l7-7 7 7"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 3-6 6.5-6s6.5 2.4 6.5 6M17 4.5a3.5 3.5 0 010 7M21.5 20c0-2.6-1.7-4.6-4-5.5"/>',
wifi:'<path d="M2 9a15 15 0 0120 0M5 12.5a10.5 10.5 0 0114 0M8.5 16a5.5 5.5 0 017 0"/><circle cx="12" cy="19.5" r="1"/>',chart:'<path d="M3 3v18h18M7 15l4-4 3 3 5-6"/>',
wallet:'<path d="M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 7l12-3v3M16 14h2"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
alert:'<path d="M12 3l10 18H2zM12 10v5M12 18v.01"/>',file:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
card:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',bars:'<path d="M6 20V10M12 20V4M18 20v-7"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>',
del:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
out:'<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>',save:'<path d="M5 3h12l3 3v15H5zM8 3v6h8V3M8 21v-7h8v7"/>',load:'<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',print:'<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>'};
const ic=(n,s)=>`<svg class="i" viewBox="0 0 24 24"${s?` style="width:${s}px;height:${s}px"`:''}>${IC[n]}</svg>`;

// ── FIELD DEFINITIONS (key|label|type|extra|datalist) ──
const FD={
 nc:['name|Naam|t|Customer Name|cust','phone|Phone|p|03XX-XXXXXXX','pkg|Package|r|Package','inst|Install Fee|n','mon|Monthly Fee|n','mod|Modem (Rs)|n','online|Online Amount|n','date|Date|d'],
 oi:['desc|Description|t|e.g. Monthly Bill, Late Fee...','person|Customer / Person|t|Naam|cust','cat|Category|s|Monthly Bill,Late Fee,Service Charge,Equipment Sale,Other','amt|Amount (Rs)|n','online|Online Amount|n','pay|Payment|s|Cash,JazzCash,EasyPaisa,Bank Transfer','date|Date|d'],
 ex:['desc|Wajah / Description|t|e.g. Electricity Bill...','vendor|Kisko Diya (Name)|t|Naam','cat|Category|s|Bandwidth,Electricity,Salary,Equipment,Rent,Maintenance,Fuel,Marketing,Other','amt|Amount (Rs)|n','pay|Payment|s|Cash,JazzCash,EasyPaisa,Bank Transfer','date|Date|d'],
 sl:['name|Worker Naam|t|Worker Naam|worker','amt|Amount (Rs)|n','pay|Payment|s|Cash,JazzCash,EasyPaisa,Bank Transfer','date|Date|d'],
 fe:['name|User / Customer Naam|t|Customer Naam|cust','amt|Credit Amount (Rs)|n','date|Date|d']};
const FT={nc:'New Connection Add Karo',oi:'Daily Income Add Karo',ex:'Daily Expense Add Karo',sl:'Worker Salary Add Karo',fe:'User Credit (Udhaar) Add Karo'};
function mkField(sp,pre,val,edit,type){
  const [k,l,t,x,dl]=sp.split('|'), id=pre+k; let inp;
  const v=val==null?'':esc(val);
  if(t==='s'){ let o=x.split(','); if(val&&!o.includes(val)) o.push(val);
    inp=`<select id="${id}">${o.map(a=>`<option${a===val?' selected':''}>${esc(a)}</option>`).join('')}</select>`; }
  else if(t==='n') inp=`<input id="${id}" type="number" placeholder="0" value="${v}"${k==='online'?' class="onl"':''}>`;
  else if(t==='d') inp=`<input id="${id}" type="date" value="${v||today()}">`;
  else if(t==='r'&&!edit) inp=`<input id="${id}" placeholder="${x}" readonly style="cursor:pointer;background:#F7F5F5">`;
  else inp=`<input id="${id}" ${t==='p'?'type="tel" ':''}placeholder="${x||''}" value="${v}"${dl?` list="${dl}-list"`:''}>`;
  return `<div class="field${k==='name'||k==='desc'?' nm':''}"><label>${l}</label>${inp}</div>`;
}
function readF(type,pre){
  const o={}; FD[type].forEach(sp=>{ const [k,,t]=sp.split('|'), e=$(pre+k);
    o[k]=t==='n'?(parseFloat(e.value)||0):(t==='s'||t==='d'?e.value:e.value.trim()); }); return o;
}
function validate(t,r){
  if(t==='nc'&&!r.name&&!r.pkg&&!r.inst&&!r.mon) return 'Kam az kam Naam ya Amount daalo';
  if(t==='oi'&&!r.amt&&!r.online) return 'Amount ya Online Amount mein se koi ek daalo';
  if(t==='ex'&&!r.amt) return 'Amount daalo';
  if(t==='sl'){ if(!r.name) return 'Worker ka naam daalo'; if(!r.amt) return 'Amount daalo'; }
  if(t==='fe'){ if(!r.name) return 'User ka naam daalo'; if(!r.amt) return 'Credit amount daalo'; }
  return '';
}
function addRec(t){
  const r=readF(t,t+'-'); if(t==='fe'&&!r.date) r.date=today();
  const m=validate(t,r); if(m){ alert(m); return; }
  db[t].push(r);
  FD[t].forEach(sp=>{ const [k,,ty]=sp.split('|'), e=$(t+'-'+k); if(ty==='d') e.value=today(); else if(ty!=='s') e.value=''; });
  if(t==='nc') document.querySelectorAll('.pkb').forEach(b=>b.classList.remove('sel'));
  render(); refreshCustList(); refreshWorkerList();
  $(t+'-'+FD[t][0].split('|')[0]).focus();
}
function selPkg(btn,pkg){
  document.querySelectorAll('.pkb').forEach(b=>b.classList.remove('sel')); btn.classList.add('sel');
  $('nc-pkg').value=pkg; $('nc-name').focus();
}
function refreshCustList(){ $('cust-list').innerHTML=[...new Set(db.nc.map(r=>r.name).filter(Boolean))].map(n=>`<option value="${esc(n)}">`).join(''); }
function refreshWorkerList(){ $('worker-list').innerHTML=[...new Set(db.sl.map(r=>r.name).filter(Boolean))].map(n=>`<option value="${esc(n)}">`).join(''); }

// ── EDIT / DELETE ──
let edT=null, edI=null;
function edit(t,i){
  edT=t; edI=i; const r=db[t][i];
  $('mt').textContent='Edit Entry #'+(i+1);
  $('mf').innerHTML=FD[t].map(sp=>mkField(sp,'ed-',r[sp.split('|')[0]],true)).join('');
  $('modal').classList.add('on');
}
function closeM(){ $('modal').classList.remove('on'); }
function saveEdit(){
  const r=readF(edT,'ed-'); const m=validate(edT,r); if(m){ alert(m); return; }
  Object.assign(db[edT][edI],r); closeM(); render(); refreshCustList(); refreshWorkerList();
}
// delete — hamesha confirm ke baad
function del(t,i){
  if(!confirm('Pakka is entry ko delete karna hai? Ye wapis nahi aayega.')) return;
  db[t].splice(i,1); render(); refreshCustList(); refreshWorkerList();
}
function toggleG(id){ const b=$(id); if(b) b.classList.toggle('collapsed'); }

// ── FILTERS ──
const F={nc:{},oi:{},ex:{},sl:{},fe:{},fn:{},cp:{}};
function sf(v,k,val){ F[v][k]=val; render(true); }
function clr(v){ F[v]={}; document.querySelectorAll('#tb-'+v+' input').forEach(i=>i.value=''); render(true); }
function tbar(v,dates=true){
  return `<div class="tbar" id="tb-${v}"><div class="sb">${ic('search')}<input placeholder="Search..." oninput="sf('${v}','q',this.value)"></div>`+
  (dates?`<label>From <input type="date" onchange="sf('${v}','a',this.value)"></label><label>To <input type="date" onchange="sf('${v}','b',this.value)"></label>`:'')+
  `<button class="btn ghost" onclick="clr('${v}')">Clear</button></div>`;
}
function rowsOf(v,t,pred){
  const f=F[v], q=(f.q||'').toLowerCase();
  return db[t].map((r,i)=>({...r,_i:i})).filter(r=>(!pred||pred(r))&&(!q||Object.values(r).join(' ').toLowerCase().includes(q))
    &&(!f.a||(r.date||'')>=f.a)&&(!f.b||(r.date||'')&&(r.date||'')<=f.b)).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||b._i-a._i);
}
const ma=(v,c)=>v?`<span class="amt ${c}">${Rs(v)}</span>`:'<span class="mut">–</span>';
const acts=(t,i)=>`<td class="act"><button class="e" title="Edit" onclick="edit('${t}',${i})">${ic('edit')}</button><button class="d" title="Delete" onclick="del('${t}',${i})">${ic('del')}</button></td>`;
const dtc=r=>`<td class="mut" style="white-space:nowrap">${r.date?fmtDate(r.date):'–'}</td>`;
const pp=(a,b)=>`<td><b>${esc(a)||'–'}</b><small>${esc(b)}</small></td>`;
const VW={
 nc:{t:'nc',h:['#','Naam / Phone','Package','Install','Monthly','Modem','Online','Date'],f:r=>`<td class="mut">${r._i+1}</td>${pp(r.name,r.phone)}<td><span class="chip">${esc(r.pkg)||'–'}</span></td><td>${ma(r.inst,'inc')}</td><td>${ma(r.mon,'inc')}</td><td>${ma(r.mod,'inc')}</td><td>${ma(r.online,'onl')}</td>${dtc(r)}`,s:r=>(r.inst||0)+(r.mon||0)+(r.mod||0)},
 oi:{t:'oi',h:['#','Description / Person','Category','Payment','Amount','Online','Date'],f:r=>`<td class="mut">${r._i+1}</td>${pp(r.desc,r.person)}<td><span class="chip">${esc(r.cat)}</span></td><td class="mut">${esc(r.pay)}</td><td>${ma(r.amt,'inc')}</td><td>${ma(r.online,'onl')}</td>${dtc(r)}`,s:r=>r.amt||0},
 ex:{t:'ex',h:['#','Wajah / Kisko Diya','Category','Payment','Amount','Date'],f:r=>`<td class="mut">${r._i+1}</td>${pp(r.desc,r.vendor)}<td><span class="chip">${esc(r.cat)}</span></td><td class="mut">${esc(r.pay)}</td><td>${ma(r.amt,'exp')}</td>${dtc(r)}`,s:r=>r.amt||0}};
VW.fn={...VW.oi,pred:r=>r.cat==='Late Fee'};
function tableV(v){
  const w=VW[v], rows=rowsOf(v,w.t,w.pred), tot=rows.reduce((s,r)=>s+w.s(r),0);
  const body=rows.length?`<div class="tw"><table><thead><tr>${w.h.map(h=>`<th>${h}</th>`).join('')}<th></th></tr></thead><tbody>${rows.map(r=>`<tr>${w.f(r)}${acts(w.t,r._i)}</tr>`).join('')}</tbody></table></div>`:'<div class="emp">Koi entry nahi</div>';
  $('tbl-'+v).innerHTML=body+`<div class="sum"><span>${rows.length} entries shown</span><span>Filtered Total: <span class="${v==='ex'?'exp':'inc'}">${Rs(tot)}</span></span></div>`;
}
function groupSL(){
  const rows=rowsOf('sl','sl'); if(!rows.length){ $('tbl-sl').innerHTML='<div class="emp">Koi salary entry nahi — upar form bhar kar Add karo</div>'; return; }
  const g={}; rows.forEach(r=>{ (g[r.name||'(Naam Nahi)']=g[r.name||'(Naam Nahi)']||[]).push(r); });
  $('tbl-sl').innerHTML=Object.keys(g).sort().map(n=>{
    const rs=g[n].slice().sort((a,b)=>(a.date||'').localeCompare(b.date||'')), c=nameToColor(n), id='wb-'+n.replace(/[^a-zA-Z0-9]/g,'_');
    return `<div class="grp" style="border-left:5px solid ${c}"><div class="gh" onclick="toggleG('${id}')"><span class="l"><span class="av" style="background:${c}">${esc(n.charAt(0).toUpperCase())}</span><span><b>${esc(n)}</b><small>${rs.length} din salary li</small></span></span><span class="r" style="color:${c}"><small>Ab Tak Total</small>${Rs(rs.reduce((s,r)=>s+(r.amt||0),0))}</span></div>
    <div class="gb" id="${id}">${rs.map(r=>`<div class="gr"><span class="mut">${r.date?fmtDate(r.date):'–'}</span><span class="mut">${esc(r.pay)}</span><span class="amt exp">${Rs(r.amt)}</span><span class="act">${acts('sl',r._i).replace(/<\/?td[^>]*>/g,'')}</span></div>`).join('')}</div></div>`;
  }).join('');
}
function groupFE(){
  const rows=rowsOf('fe','fe'); if(!rows.length){ $('tbl-fe').innerHTML='<div class="emp">Koi credit entry nahi — upar form bhar kar Add karo</div>'; return; }
  const g={}; rows.forEach(r=>{ (g[r.date||'']=g[r.date||'']||[]).push(r); });
  $('tbl-fe').innerHTML=Object.keys(g).sort((a,b)=>b.localeCompare(a)).map(d=>{
    const rs=g[d], id='cb-'+(d||'x').replace(/[^a-zA-Z0-9]/g,'_');
    return `<div class="grp" style="border-left:5px solid var(--or)"><div class="gh" onclick="toggleG('${id}')"><span class="l"><span class="av" style="background:var(--or)">${ic('clock',16)}</span><span><b>${fmtDate(d)}</b><small>${rs.length} credit entries</small></span></span><span class="r pend"><small>Is Din Total Credit</small>${Rs(rs.reduce((s,r)=>s+(r.amt||0),0))}</span></div>
    <div class="gb" id="${id}">${rs.map(r=>`<div class="gr" style="grid-template-columns:2fr 1fr auto"><span>${esc(r.name)||'–'} <span class="chip o">Pending</span></span><span class="amt pend">${Rs(r.amt)}</span><span class="act">${acts('fe',r._i).replace(/<\/?td[^>]*>/g,'')}</span></div>`).join('')}</div></div>`;
  }).join('');
}

// ── AGGREGATES ──
const sum=(a,f)=>a.reduce((s,r)=>s+(f(r)||0),0);
const incW=p=>sum(db.nc.filter(r=>p(r.date||'')),r=>(r.inst||0)+(r.mon||0)+(r.mod||0))+sum(db.oi.filter(r=>p(r.date||'')),r=>r.amt);
const amtW=(k,p)=>sum(db[k].filter(r=>p(r.date||'')),r=>r.amt);
const mkey=(o)=>{ const d=new Date(new Date().getFullYear(),new Date().getMonth()-o,1); return d.getFullYear()+'-'+pad(d.getMonth()+1); };
const mlab=k=>{ if(!k) return 'No Date'; const [y,m]=k.split('-'); return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1]+(y?' '+y.slice(2):''); };
const mlabF=k=>k?mlab(k).replace(/ (\d\d)$/,' 20$1'):'No Date';
const lastM=n=>Array.from({length:n},(_,i)=>mkey(n-1-i));
const abbr=n=>{ const a=Math.abs(n); return (n<0?'-':'')+(a>=1e6?(a/1e6).toFixed(1).replace('.0','')+'M':a>=1e3?(a/1e3).toFixed(a>=1e4?0:1).replace('.0','')+'K':Math.round(a)); };
const nice=m=>{ if(m<=0) return 0; const p=10**Math.floor(Math.log10(m)),u=m/p; return (u<=1?1:u<=2?2:u<=4?4:u<=8?8:10)*p; };

// ── CHARTS (inline SVG, no external library) ──
function scale(vals,H,T,B,zero){
  const hi=nice(Math.max(0,...vals))||1000, lo=zero?0:-nice(-Math.min(0,...vals));
  return {hi,lo,y:v=>T+(H-T-B)*(hi-v)/(hi-lo)};
}
function grid(sc,W,L,R){ let s=''; for(let k=0;k<=4;k++){ const v=sc.lo+(sc.hi-sc.lo)*k/4, y=sc.y(v); s+=`<line class="gl" x1="${L}" x2="${W-R}" y1="${y}" y2="${y}"/><text x="${L-6}" y="${y+3}" text-anchor="end">${abbr(v)}</text>`; } return s; }
const shade=(h,a)=>{ const n=parseInt(h.slice(1),16),f=a<0?0:255,q=Math.abs(a); return '#'+[n>>16,n>>8&255,n&255].map(v=>Math.round(v+(f-v)*q).toString(16).padStart(2,'0')).join(''); };
let gcnt=0;
function bars(labels,ser,zero){
  let defs='',G={};
  const gid=c=>{ if(!G[c]){ G[c]='g'+(gcnt++); defs+=`<linearGradient id="${G[c]}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${shade(c,.4)}"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${shade(c,-.32)}"/></linearGradient>`; } return 'url(#'+G[c]+')'; };
  const W=640,H=250,L=44,R=8,T=10,B=26,n=labels.length, sc=scale(ser.flatMap(s=>s.v),H,T,B,zero);
  let s=grid(sc,W,L,R); const gw=(W-L-R)/n, bw=Math.min(26,gw*.6/ser.length), y0=sc.y(0);
  labels.forEach((l,i)=>{ const cx=L+gw*(i+.5); s+=`<text x="${cx}" y="${H-8}" text-anchor="middle">${l}</text>`;
    ser.forEach((q,j)=>{ const v=q.v[i], x=cx+(j-(ser.length-1)/2)*(bw+4)-bw/2, y=sc.y(v), h=Math.max(2,Math.abs(y-y0));
      s+=`<rect class="b" x="${x}" y="${Math.min(y,y0)}" width="${bw}" height="${h}" rx="${Math.min(7,bw/2)}" fill="${gid(typeof q.c==='function'?q.c(v,i):q.c)}" style="animation-delay:${(i*ser.length+j)*55}ms" data-t="${l} · ${q.n}: ${Rs(v)}"/>`; }); });
  return `<svg class="ch" viewBox="0 0 ${W} ${H}" width="100%"><defs>${defs}</defs>${s}</svg>`;
}
function line(labels,v,col,name){
  const W=640,H=250,L=44,R=14,T=10,B=26,n=labels.length, sc=scale(v,H,T,B,true), k=Math.ceil(n/8);
  const px=i=>n>1?L+(W-L-R)*i/(n-1):(L+W-R)/2; let s=grid(sc,W,L,R);
  const pts=v.map((a,i)=>`${px(i)},${sc.y(a)}`).join(' ');
  s+=`<polygon points="${px(0)},${sc.y(0)} ${pts} ${px(n-1)},${sc.y(0)}" fill="${col}" opacity=".13"/><polyline pathLength="1" points="${pts}" fill="none" stroke="${col}" stroke-width="3" stroke-linejoin="round"/>`;
  v.forEach((a,i)=>{ s+=`<circle class="b" cx="${px(i)}" cy="${sc.y(a)}" r="4.5" fill="#fff" stroke="${col}" stroke-width="2.5" style="animation-delay:${700+i*70}ms" data-t="${labels[i]} · ${name}: ${name==='Connections'?a:Rs(a)}"/>`; if(i%k===0) s+=`<text x="${px(i)}" y="${H-8}" text-anchor="middle">${labels[i]}</text>`; });
  return `<svg class="ch" viewBox="0 0 ${W} ${H}" width="100%">${s}</svg>`;
}
const PAL=['#00452E','#0AB35E','#35C77A','#8FD9A8','#F79009','#D92D20','#2f6f55','#6b7a72','#b7c4bd'];
function donut(items){
  const tot=sum(items,i=>i.v); if(!tot) return '<div class="emp">No data yet</div>';
  const C=2*Math.PI*54; let acc=0, s='';
  items.forEach((it,i)=>{ const len=C*it.v/tot; s+=`<circle class="b" cx="70" cy="70" r="54" fill="none" stroke="${PAL[i%9]}" stroke-width="22" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-acc}" transform="rotate(-90 70 70)" data-t="${esc(it.n)}: ${Rs(it.v)}"/>`; acc+=len; });
  return `<div class="dn"><svg viewBox="0 0 140 140"><circle cx="70" cy="70" r="54" fill="none" stroke="#eef2ef" stroke-width="22" style="opacity:.0"/>${s}<text x="70" y="68" text-anchor="middle" style="font-size:15px;font-weight:800;fill:#0d1b14">${abbr(tot)}</text><text x="70" y="82" text-anchor="middle" style="font-size:9px">TOTAL</text></svg><div class="dl">${items.map((it,i)=>`<div><span><i style="background:${PAL[i%9]}"></i>${esc(it.n)}</span><b>${Math.round(100*it.v/tot)}%</b></div>`).join('')}</div></div>`;
}
const leg=a=>`<div class="leg">${a.map(x=>`<span><i style="background:${x[1]}"></i>${x[0]}</span>`).join('')}</div>`;
const card=(t,s,h,c='')=>`<div class="card ${c}"><h3>${t}</h3><div class="hs">${s}</div>${h}</div>`;

// ── DASHBOARD ──
function dash(T){
  const cm=mkey(0), pm=mkey(1), inM=m=>d=>d.slice(0,7)===m;
  const mv=(f)=>[f(inM(cm)),f(inM(pm))];
  const net=p=>incW(p)-amtW('ex',p);
  const K=[
   ['s-inc','Total Income',T.inc,'inc',mv(incW),1,1],['s-exp','Total Expenses',T.exp,'exp',mv(p=>amtW('ex',p)),0],
   ['s-fee','Total Credit',T.fee,'clock',mv(p=>amtW('fe',p)),0],['s-con','Total Connections',db.nc.length,'wifi',mv(p=>db.nc.filter(r=>p(r.date||'')).length),1],
   ['s-sal','Worker Salaries',T.sal,'users',mv(p=>amtW('sl',p)),0],['s-pro','Remaining Balance',T.net,'wallet',mv(net),1]];
  $('kpis').innerHTML=K.map((k,i)=>{ const [c,p]=k[4], pc=!p&&!c?'0%':!p?'New':((c-p)/Math.abs(p)*100>=0?'+':'')+((c-p)/Math.abs(p)*100).toFixed(1)+'%', good=(c>=p)===!!k[5];
    return `<div class="k${i===0?' dark':''}"><span class="pill${good?'':' bad'}">${pc}</span><div class="ic">${ic(k[3],22)}</div><div class="lb">${k[1]}</div><div class="vl" data-f="${k[0]==='s-con'?k[2]:Rs(k[2])}" id="${k[0]}"${k[0]==='s-pro'?` style="color:${T.net>=0?'#0A8F4F':'#D92D20'}"`:''}>${k[0]==='s-con'?k[2]:Rs(k[2])}</div><div class="vs">This month<br>${k[0]==='s-con'?c:Rs(c)}</div></div>`; }).join('');
  const m6=lastM(6), lb=m6.map(mlab);
  const mi=m6.map(m=>incW(inM(m))), me=m6.map(m=>amtW('ex',inM(m)));
  const days=Array.from({length:14},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-13+i); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); });
  const di=days.map(d=>incW(x=>x===d));
  const m12=lastM(12), cats={}; db.ex.forEach(r=>{ cats[r.cat||'Other']=(cats[r.cat||'Other']||0)+(r.amt||0); });
  const ci=Object.keys(cats).map(n=>({n,v:cats[n]})).filter(c=>c.v>0).sort((a,b)=>b.v-a.v);
  const debt={}; db.fe.forEach(r=>{ debt[r.name]=(debt[r.name]||0)+(r.amt||0); });
  const dl=Object.entries(debt).sort((a,b)=>b[1]-a[1]).slice(0,5), dm=dl[0]?dl[0][1]:1;
  $('charts').innerHTML=
   card('Monthly Income vs Expenses','Last 6 months',leg([['Income','#0AB35E'],['Expenses','#00452E']])+bars(lb,[{n:'Income',v:mi,c:'#0AB35E'},{n:'Expenses',v:me,c:'#00452E'}],true),'s2')+
   card('Expense Categories','Where your money goes',donut(ci))+
   card('Daily Income Statistics','Last 14 days',bars(days.map(d=>+d.slice(8)),[{n:'Income',v:di,c:(v,i)=>i===13?'#00452E':'#0AB35E'}],true),'s2')+
   card('Pending Credit (Udhaar)','Top customers owing',dl.length?dl.map(([n,v])=>`<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between"><b>${esc(n)||'–'}</b><span class="amt pend">${Rs(v)}</span></div><div class="bar2 o"><div style="width:${100*v/dm}%"></div></div></div>`).join(''):'<div class="emp">No credit pending</div>')+
   card('Monthly Profit Overview','Income − Expenses, last 6 months',leg([['Profit','#0AB35E'],['Loss','#D92D20']])+bars(lb,[{n:'Profit',v:m6.map((m,i)=>mi[i]-me[i]),c:v=>v>=0?'#0AB35E':'#D92D20'}],false),'s2')+
   card('Business Growth','New connections per month, last 12 months',line(m12.map(mlab),m12.map(m=>db.nc.filter(r=>(r.date||'').slice(0,7)===m).length),'#00452E','Connections'));
}

// ── DERIVED PAGES (read-only views, no records created) ──
function custPay(){
  const q=(F.cp.q||'').toLowerCase(), M={};
  const g=n=>M[n]=M[n]||{n,c:0,a:0,o:0,p:0,cr:0};
  db.nc.forEach(r=>{ if(!r.name) return; const x=g(r.name); x.c++; x.a+=(r.inst||0)+(r.mon||0)+(r.mod||0); x.o+=r.online||0; });
  db.oi.forEach(r=>{ if(!r.person) return; const x=g(r.person); x.p+=r.amt||0; x.o+=r.online||0; });
  db.fe.forEach(r=>{ if(r.name) g(r.name).cr+=r.amt||0; });
  const L=Object.values(M).filter(x=>!q||x.n.toLowerCase().includes(q)).sort((a,b)=>(b.a+b.p)-(a.a+a.p));
  $('tbl-cp').innerHTML=L.length?`<div class="tw"><table><thead><tr><th>Customer</th><th>Connections</th><th>Connection Fees</th><th>Other Payments</th><th>Online</th><th>Total Paid</th><th>Credit</th></tr></thead><tbody>${L.map(x=>`<tr><td><b>${esc(x.n)}</b></td><td>${x.c}</td><td>${ma(x.a,'inc')}</td><td>${ma(x.p,'inc')}</td><td>${ma(x.o,'onl')}</td><td>${ma(x.a+x.p,'inc')}</td><td>${x.cr?`<span class="amt pend">${Rs(x.cr)}</span>`:'<span class="mut">–</span>'}</td></tr>`).join('')}</tbody></table></div>`:'<div class="emp">Koi customer nahi</div>';
}
function salesRev(){
  const src=[['Installation Fees',sum(db.nc,r=>r.inst)],['Monthly Fees',sum(db.nc,r=>r.mon)],['Modem Sales',sum(db.nc,r=>r.mod)]], C={};
  db.oi.forEach(r=>{ C[r.cat||'Other']=(C[r.cat||'Other']||0)+(r.amt||0); }); Object.keys(C).forEach(k=>src.push([k,C[k]]));
  const tot=sum(src,s=>s[1]), m12=lastM(12);
  $('sr-body').innerHTML=card('Monthly Revenue','Last 12 months',bars(m12.map(mlab),[{n:'Revenue',v:m12.map(m=>incW(d=>d.slice(0,7)===m)),c:'#0AB35E'}],true))+
   card('Revenue by Source','Share of Total Income',`<div class="tw"><table><thead><tr><th>Source</th><th>Amount</th><th style="width:40%">Share</th></tr></thead><tbody>${src.filter(s=>s[1]).map(s=>`<tr><td><b>${esc(s[0])}</b></td><td>${ma(s[1],'inc')}</td><td><div class="bar2"><div style="width:${tot?100*s[1]/tot:0}%"></div></div><small>${tot?(100*s[1]/tot).toFixed(1):0}%</small></td></tr>`).join('')||'<tr><td colspan=3 class="emp">No revenue yet</td></tr>'}</tbody><tfoot><tr><td>Total Revenue</td><td class="inc">${Rs(tot)}</td><td></td></tr></tfoot></table></div>`);
}
function repRows(){
  const ks=new Set(); ['nc','oi','ex','sl','fe'].forEach(k=>db[k].forEach(r=>ks.add((r.date||'').slice(0,7))));
  return [...ks].sort((a,b)=>b.localeCompare(a)).map(m=>{ const p=d=>d.slice(0,7)===m, i=incW(p), e=amtW('ex',p);
    return [m,i,e,i-e,amtW('sl',p),amtW('fe',p),db.nc.filter(r=>p(r.date||'')).length]; });
}
function report(T){
  const R=repRows();
  $('rp-body').innerHTML=`<div class="tw"><table><thead><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Net</th><th>Salaries</th><th>Credit</th><th>New Conn.</th></tr></thead><tbody>${R.map(r=>`<tr><td><b>${mlabF(r[0])}</b></td><td>${ma(r[1],'inc')}</td><td>${ma(r[2],'exp')}</td><td><span class="amt ${r[3]>=0?'inc':'exp'}">${Rs(r[3])}</span></td><td>${ma(r[4],'exp')}</td><td>${ma(r[5],'pend')}</td><td>${r[6]}</td></tr>`).join('')||'<tr><td colspan=7 class="emp">No data</td></tr>'}</tbody><tfoot><tr><td>Total</td><td class="inc">${Rs(T.inc)}</td><td class="exp">${Rs(T.exp)}</td><td class="${T.net>=0?'inc':'exp'}">${Rs(T.net)}</td><td class="exp">${Rs(T.sal)}</td><td class="pend">${Rs(T.fee)}</td><td>${db.nc.length}</td></tr></tfoot></table></div><div class="note">Note: Salaries aur Credit, Total Income / Remaining Balance mein shamil nahi hote (original accounting rule).</div>`;
}
function exportCSV(){
  const rows=[['Month','Income','Expenses','Net','Salaries','Credit','New Connections'],...repRows().map(r=>[mlabF(r[0]),...r.slice(1)])];
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'})); a.download='ISP-Report.csv'; a.click();
}

// ── RENDER ──
let T={};
function render(filterOnly){
  tableV('nc'); tableV('oi'); tableV('ex'); tableV('fn'); groupSL(); groupFE(); custPay();
  if(filterOnly===true) return;
  const ncT=sum(db.nc,r=>(r.inst||0)+(r.mon||0)+(r.mod||0)), oiT=sum(db.oi,r=>r.amt), exT=sum(db.ex,r=>r.amt), slT=sum(db.sl,r=>r.amt), feT=sum(db.fe,r=>r.amt);
  // Worker Salary Total Expenses mein shamil nahi; Credit Total Income mein shamil nahi (original rules, unchanged)
  const inc=ncT+oiT; T={inc,exp:exT,net:inc-exT,sal:slT,fee:feT,nc:ncT,oi:oiT};
  $('nc-tot').textContent=Rs(ncT); $('oi-tot').textContent=Rs(oiT); $('ex-tot').textContent=Rs(exT); $('sl-tot').textContent=Rs(slT); $('fe-tot').textContent=Rs(feT);
  $('s-pro-side').textContent=Rs(T.net);
  dash(T); salesRev(); report(T);
  $('st-info').textContent=`${db.nc.length} connections · ${db.oi.length} income · ${db.ex.length} expenses · ${db.sl.length} salary · ${db.fe.length} credit records stored in this browser.`;
  saveToStorage();
}

// ── NAVIGATION & PAGES ──
const NAV=[['MENU',[['dash','Dashboard','dash'],['oi','Daily Income','inc'],['ex','Daily Expenses','exp'],['cp','Customer Payments','card'],['nc','New Connections','wifi']]],
 ['FINANCIAL',[['sr','Sales / Revenue','bars'],['sl','Worker Salaries','users'],['fe','Credit / Udhaar','clock'],['fn','Fines','alert']]],['TOOLS',[['rp','Reports','file'],['st','Settings','gear']]]];
const TT={};
NAV.forEach(g=>g[1].forEach(n=>TT[n[0]]=n[1]));
$('nav').innerHTML=NAV.map(g=>`<div class="nh">${g[0]}</div>`+g[1].map(n=>`<button class="nav" data-p="${n[0]}" onclick="go('${n[0]}')">${ic(n[2])}${n[1]}</button>`).join('')).join('');
$('lg').innerHTML=ic('wifi',22); $('burger').innerHTML=ic('menu'); $('b-save').innerHTML=ic('save'); $('b-load').innerHTML=ic('load'); $('b-print').innerHTML=ic('print'); $('b-out').innerHTML=ic('out');
$('me-img').innerHTML=ic('wifi',18); $('lk-logo').innerHTML=ic('wifi',38);
$('dt').textContent=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const PT={dash:'ISP Register — Dashboard',nc:'New Connections',oi:'Other Income',ex:'Expenses',sl:'Worker Salary',fe:'Credit'};
const formCard=t=>`<div class="card fc"><h3>${FT[t]}</h3><div class="hs"></div>${t==='nc'?`<div class="pk"><span>Package:</span>${['4','6','8','10','20'].map(m=>`<button class="pkb" onclick="selPkg(this,'${m} Mbps')">${m} Mbps</button>`).join('')}</div>`:''}<div class="fields">${FD[t].map(sp=>mkField(sp,t+'-')).join('')}<button class="btn" onclick="addRec('${t}')">+ Add</button></div></div>`;
const listCard=(v,t,extra)=>`<div class="card"><h3>${t}</h3><div class="hs">Search, filter by date, edit or delete</div>${tbar(v)}<div id="tbl-${v}"></div>${extra||''}</div>`;
const sumL=(id,cls,lbl)=>`<div class="sum"><span>${lbl}</span><span>Total (all records): <span class="${cls}" id="${id}">Rs 0</span></span></div>`;
$('pages').innerHTML=[
 ['dash',`<div class="kpi" id="kpis"></div><div id="charts" class="g3"></div>`],
 ['oi',formCard('oi')+listCard('oi','Daily Income Records',sumL('oi-tot','inc',''))],
 ['ex',formCard('ex')+listCard('ex','Daily Expense Records',sumL('ex-tot','exp',''))],
 ['cp',`<div class="card"><h3>Customer Payments</h3><div class="hs">Automatic per-customer summary from your existing records (nothing is duplicated)</div>${tbar('cp',false)}<div id="tbl-cp"></div></div>`],
 ['nc',formCard('nc')+listCard('nc','Connection Records',sumL('nc-tot','inc',''))],
 ['sr',`<div id="sr-body"></div>`],
 ['sl',formCard('sl')+`<div class="card"><h3>Worker Salary History</h3><div class="hs">Click a worker to expand / collapse</div>${tbar('sl')}<div id="tbl-sl"></div>${sumL('sl-tot','exp','Grand Total (Sab Workers)')}</div>`],
 ['fe',formCard('fe')+`<div class="card"><h3>Credit / Udhaar History</h3><div class="hs">Date-wise. Credit amounts are pending and are not added to Total Income.</div>${tbar('fe')}<div id="tbl-fe"></div>${sumL('fe-tot','pend','Grand Total Credit (Sab Dates)')}</div>`],
 ['fn',listCard('fn','Fines & Late Fees')+''],
 ['rp',`<div class="card"><h3>Monthly Report</h3><div class="hs">Totals use the same accounting rules as before</div><div class="set" style="margin-bottom:14px"><button class="btn" onclick="window.print()">🖨️ Print</button><button class="btn ghost" onclick="exportCSV()">⬇ Export CSV</button></div><div id="rp-body"></div></div>`],
 ['st',`<div class="card"><h3>Settings & Data</h3><div class="hs" id="st-info"></div><div class="set"><button class="btn" onclick="saveFile()">💾 Save Backup (JSON)</button><button class="btn ghost" onclick="$('file-in').click()">📂 Load Backup</button><button class="btn ghost" onclick="window.print()">🖨️ Print</button><button class="btn" style="background:var(--red)" onclick="logout()">🔒 Logout</button></div><div class="note">Tip: Save a backup regularly. Password abhi bhi file ke script mein <code>APP_PASSWORD</code> se change hota hai.</div></div>`]
].map(p=>`<section class="page" id="page-${p[0]}">${PT[p[0]]?`<h2 class="print-title"${p[0]==='dash'?' id="pt-dash"':''}>${PT[p[0]]}</h2>`:''}${p[1]}</section>`).join('');
// fines: late-fee view has no add form — quick note
$('page-fn').insertAdjacentHTML('afterbegin','<div class="note" style="margin:0 4px 12px">Fines = Daily Income entries with category “Late Fee”. Add them from Daily Income.</div>');
let cur='dash';
function countUp(){
  document.querySelectorAll('#kpis .vl').forEach(e=>{
    const fin=e.dataset.f||e.textContent, rs=fin.startsWith('Rs'), n=parseFloat(fin.replace(/[^0-9.-]/g,''))||0, t0=performance.now();
    (function f(t){ const p=Math.min(1,(t-t0)/1000), v=n*(1-Math.pow(1-p,3));
      e.textContent=p>=1?fin:(rs?Rs(Math.round(v)):Math.round(v)); if(p<1) requestAnimationFrame(f); })(t0);
    setTimeout(()=>{ e.textContent=fin; },1150);
  });
}
function replay(p){
  const s=$('page-'+p); if(!s) return; s.classList.remove('play'); void s.offsetWidth; s.classList.add('play');
  clearTimeout(s._t); s._t=setTimeout(()=>s.classList.remove('play'),2400); if(p==='dash') countUp();
}
function go(p){ cur=p;
  document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('on',b.dataset.p===p));
  document.querySelectorAll('.page').forEach(s=>s.classList.toggle('on',s.id==='page-'+p));
  $('ttl').textContent=TT[p]; $('side').classList.remove('open'); $('ov').classList.remove('on'); window.scrollTo(0,0); replay(p);
}
function tgl(){ $('side').classList.toggle('open'); $('ov').classList.toggle('on'); }
$('modal').addEventListener('click',e=>{ if(e.target.id==='modal') closeM(); });
const TL='.k,.g3 .card', tilt=(e,c)=>{ const r=c.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height, f=c.classList.contains('k')?1:.3;
  c.style.setProperty('--ry',(x-.5)*14*f+'deg'); c.style.setProperty('--rx',(.5-y)*12*f+'deg'); c.style.setProperty('--mx',x*100+'%'); c.style.setProperty('--my',y*100+'%'); };
document.addEventListener('mousemove',e=>{ const c=e.target.closest&&e.target.closest(TL); if(c) tilt(e,c); });
document.addEventListener('mouseout',e=>{ const c=e.target.closest&&e.target.closest(TL); if(c&&!c.contains(e.relatedTarget)){ c.style.setProperty('--rx','0deg'); c.style.setProperty('--ry','0deg'); } });
const tip=$('tip');
document.addEventListener('mousemove',e=>{ const t=e.target.closest&&e.target.closest('[data-t]'); if(t){ tip.textContent=t.dataset.t; tip.style.display='block'; tip.style.left=Math.min(e.clientX+12,innerWidth-tip.offsetWidth-8)+'px'; tip.style.top=(e.clientY+14)+'px'; } else tip.style.display='none'; });

// ── SAVE / LOAD (unchanged behaviour) ──
function saveFile(){
  const month=prompt('File ka naam? (e.g. June-2026)','June-2026')||'ISP-Data';
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:'application/json'})); a.download=month+'-ISP.json'; a.click();
}
function loadFile(input){
  const f=input.files[0]; if(!f) return; const r=new FileReader();
  r.onload=e=>{ try{ db=JSON.parse(e.target.result); ['nc','oi','ex','sl','fe'].forEach(k=>{ if(!db[k]) db[k]=[]; }); render(); refreshCustList(); refreshWorkerList(); alert('Data load ho gaya!'); }catch{ alert('File galat hai!'); } };
  r.readAsText(f); input.value='';
}

window.addEventListener('beforeprint',()=>{ document.querySelectorAll('#kpis .vl').forEach(v=>{ if(v.dataset.f) v.textContent=v.dataset.f; }); $('pt-dash').textContent='ISP Register — Dashboard  ·  '+fmtDate(today()); });
render(); refreshCustList(); refreshWorkerList(); go('dash');
