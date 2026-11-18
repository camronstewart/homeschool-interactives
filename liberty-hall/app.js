'use strict';
/* Liberty Bell & Independence Hall — a gentle walk-through for kids */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const ICON=id=>`<svg viewBox="0 0 64 64"><use href="#i-${id}"/></svg>`;

/* ---------------- audio ---------------- */
let AC=null, master=null, verb=null;
function audio(){
  if(!AC){
    const C=window.AudioContext||window.webkitAudioContext; if(!C) return null;
    AC=new C(); master=AC.createGain(); master.gain.value=.9; master.connect(AC.destination);
    // simple hall reverb
    const len=AC.sampleRate*3.2, ir=AC.createBuffer(2,len,AC.sampleRate);
    for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2)}
    verb=AC.createConvolver(); verb.buffer=ir; const wet=AC.createGain(); wet.gain.value=.35; verb.connect(wet); wet.connect(master);
  }
  if(AC.state==='suspended') AC.resume();
  return AC;
}
// unlock audio on first touch (iOS)
window.addEventListener('pointerdown',()=>audio(),{once:true});

function bellStrike(vol=1){
  const ctx=audio(); if(!ctx) return;
  const t=ctx.currentTime+.01, prime=311.1; // the Liberty Bell's note is close to E-flat
  const out=ctx.createGain(); out.gain.value=.22*vol; out.connect(master); out.connect(verb);
  const parts=[[.5,.55,7],[1,1,5],[1.183,.55,3.6],[1.497,.32,2.8],[2,.5,2.6],[2.51,.24,1.9],[2.66,.22,1.6],[3.01,.16,1.3],[4.07,.11,.9],[5.24,.07,.6],[6.7,.04,.4]];
  parts.forEach(([r,a,d])=>{
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type='sine'; o.frequency.value=prime*r*(1+(Math.random()-.5)*.003);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(a,t+.004); g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g); g.connect(out); o.start(t); o.stop(t+d+.05);
    // a cracked bell buzzes a little: add a slightly detuned twin
    if(r>=1&&r<=2){const o2=ctx.createOscillator(),g2=ctx.createGain();o2.frequency.value=o.frequency.value*1.0045;g2.gain.setValueAtTime(0,t);g2.gain.linearRampToValueAtTime(a*.35,t+.004);g2.gain.exponentialRampToValueAtTime(.0001,t+d*.7);o2.connect(g2);g2.connect(out);o2.start(t);o2.stop(t+d)}
  });
  // the clapper's clang
  const n=ctx.createBufferSource(), b=ctx.createBuffer(1,ctx.sampleRate*.08,ctx.sampleRate), dd=b.getChannelData(0);
  for(let i=0;i<dd.length;i++) dd[i]=(Math.random()*2-1)*Math.pow(1-i/dd.length,4);
  n.buffer=b; const bp=ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=2600; bp.Q.value=1.4;
  const ng=ctx.createGain(); ng.gain.value=.5; n.connect(bp); bp.connect(ng); ng.connect(out); n.start(t);
}
function chime(){ // soft success chime
  const ctx=audio(); if(!ctx) return; const t=ctx.currentTime;
  [523.25,659.25,783.99,1046.5].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=f;
    g.gain.setValueAtTime(0,t+i*.09);g.gain.linearRampToValueAtTime(.12,t+i*.09+.01);g.gain.exponentialRampToValueAtTime(.0001,t+i*.09+.9);
    o.connect(g);g.connect(master);o.start(t+i*.09);o.stop(t+i*.09+1)});
}
function scratch(){ // quill scratch, very soft
  const ctx=AC; if(!ctx) return; const t=ctx.currentTime;
  const n=ctx.createBufferSource(), b=ctx.createBuffer(1,ctx.sampleRate*.05,ctx.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*.5;
  n.buffer=b; const hp=ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=3000; const g=ctx.createGain(); g.gain.value=.025;
  n.connect(hp); hp.connect(g); g.connect(master); n.start(t);
}

/* ---------------- read aloud ---------------- */
let voice=null;
function pickVoice(){const vs=speechSynthesis.getVoices();voice=vs.find(v=>/Samantha|Karen|Moira|Daniel/.test(v.name))||vs.find(v=>/^en[-_]US/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
function speak(text,btn){
  if(!('speechSynthesis' in window)){toast('Reading aloud is not available on this device');return}
  if(speechSynthesis.speaking){speechSynthesis.cancel(); $$('.speaking').forEach(b=>b.classList.remove('speaking')); if(btn&&btn._on){btn._on=false;return}}
  const u=new SpeechSynthesisUtterance(text.replace(/\s+/g,' ')); if(voice)u.voice=voice; u.rate=.92; u.pitch=1.02;
  if(btn){btn.classList.add('speaking');btn._on=true;u.onend=u.onerror=()=>{btn.classList.remove('speaking');btn._on=false}}
  speechSynthesis.speak(u);
}
const readBtn=(label='Read to me')=>`<button class="pill ghost read"><svg viewBox="0 0 24 24"><use href="#i-speak"/></svg>${label}</button>`;
function wireRead(root,getText){$$('.read',root).forEach(b=>b.addEventListener('click',()=>speak(getText(),b)))}

/* ---------------- toast ---------------- */
let toastT;
function toast(msg,ms=2200){const t=$('#toast');t.innerHTML=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),ms)}

/* ---------------- main scene ---------------- */
const VIEWS={
  '1778':{img:'assets/scene-1778.jpg',w:1511,h:1046,focus:.66,
    spots:[
      {x:.838,y:.25,icon:'bell',label:'Ring the bell',go:()=>openBell()},
      {x:.757,y:.6,icon:'clock',label:'Tell the time',go:()=>openClock()},
      {x:.585,y:.70,icon:'door',label:'Go inside',go:()=>openRoom()},
    ]},
  'today':{img:'assets/scene-today.jpg',w:1600,h:1200,focus:.52,
    spots:[
      {x:.52,y:.12,icon:'bell',label:'Ring the bell',go:()=>openBell()},
      {x:.52,y:.29,icon:'clock',label:'Tell the time',go:()=>openClock()},
      {x:.66,y:.70,icon:'door',label:'Go inside',go:()=>openRoom()},
      {x:.42,y:.66,icon:'person',label:'Whose statue?',go:()=>openPerson('washington')},
    ]},
};
let view='1778', pan={x:0,y:0,s:1,minX:0,minY:0};
const stage=$('#stage'), vp=$('#viewport'), img=$('#sceneImg');

function setView(v){
  view=v; const V=VIEWS[v];
  $$('.seg-btn').forEach(b=>b.classList.toggle('on',b.dataset.view===v));
  img.style.opacity=0;
  const pre=new Image(); pre.onload=()=>{img.src=V.img;layout(true);requestAnimationFrame(()=>img.style.opacity=1)}; pre.src=V.img;
  const hs=$('#hotspots'); hs.innerHTML='';
  V.spots.forEach(s=>{
    const b=document.createElement('button'); b.className='hs'; b.style.left=s.x*100+'%'; b.style.top=s.y*100+'%';
    b.innerHTML=`<span class="pulse"></span><span class="ring"></span>${ICON(s.icon)}<span class="lbl">${s.label}</span>`;
    b.addEventListener('click',e=>{if(dragged)return; $('#hint').classList.add('gone'); s.go()});
    hs.appendChild(b);
  });
}
function layout(recenter){
  const V=VIEWS[view], W=vp.clientWidth, H=vp.clientHeight;
  const xs=V.spots.map(p=>p.x), x0=Math.min(...xs), x1=Math.max(...xs);
  let s=Math.max(W/V.w,H/V.h);
  const need=(W-130)/((x1-x0)*V.w); if(need<s) s=Math.max(need,W/V.w); // keep every hotspot on screen on narrow phones
  const w=V.w*s, h=V.h*s; V._focus=(x0+x1)/2;
  stage.style.width=w+'px'; stage.style.height=h+'px';
  pan.minX=Math.min(0,W-w); pan.minY=Math.min(0,H-h); pan.maxY=h<H?(H-h)/2:0; pan.w=w; pan.h=h;
  if(recenter||pan.x<pan.minX){const f=w>W*1.25?V._focus:V.focus; pan.x=Math.max(pan.minX,Math.min(0,W/2-f*w)); pan.y=h<H?(H-h)/2:pan.minY/2}
  applyPan();
}
function applyPan(){pan.x=Math.max(pan.minX,Math.min(0,pan.x));pan.y=pan.maxY?pan.maxY:Math.max(pan.minY,Math.min(0,pan.y));stage.style.transform=`translate(${pan.x}px,${pan.y}px)`}
let dragged=false;
(function(){ // drag to look around when the picture is wider than the screen
  let sx,sy,px,py,down=false;
  vp.addEventListener('pointerdown',e=>{down=true;dragged=false;sx=e.clientX;sy=e.clientY;px=pan.x;py=pan.y});
  window.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)+Math.abs(dy)>8)dragged=true;pan.x=px+dx;pan.y=py+dy;applyPan()});
  window.addEventListener('pointerup',()=>{down=false;setTimeout(()=>dragged=false,0)});
  window.addEventListener('pointercancel',()=>{down=false;dragged=false});
})();
$$('.seg-btn').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
window.addEventListener('resize',()=>{layout(false); if(onResize) onResize()});

/* ---------------- sheet system ---------------- */
let onResize=null, hist=[];
const sheet=$('#sheet'), body=$('#sheetBody');
function openSheet(html,cls='',{push=true}={}){
  if('speechSynthesis' in window) speechSynthesis.cancel();
  if(push && sheet.classList.contains('open') && current) hist.push(current);
  body.innerHTML=`<div class="panel ${cls}">${html}</div>`;
  sheet.classList.add('open'); sheet.setAttribute('aria-hidden','false');
  $('#backSheet').hidden=!hist.length; onResize=null; stopBell();
  return body.firstElementChild;
}
let current=null;
function show(fn,...args){ if(sheet.classList.contains('open')&&current) hist.push(current); current=()=>fn(...args); fn(...args); $('#backSheet').hidden=!hist.length }
function closeSheet(){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');hist=[];current=null;onResize=null;stopBell();if('speechSynthesis' in window)speechSynthesis.cancel();setTimeout(()=>{if(!sheet.classList.contains('open'))body.innerHTML=''},400)}
$('#closeSheet').addEventListener('click',closeSheet);
$('#backSheet').addEventListener('click',()=>{const prev=hist.pop(); if(prev){current=prev;prev();$('#backSheet').hidden=!hist.length}else closeSheet()});
function render(html,cls){ if('speechSynthesis' in window)speechSynthesis.cancel(); stopBell(); onResize=null; body.innerHTML=`<div class="panel ${cls}">${html}</div>`; sheet.classList.add('open'); sheet.setAttribute('aria-hidden','false'); return body.firstElementChild }

/* ---------------- the bell ---------------- */
const COLONIES=['New Hampshire','Massachusetts','Rhode Island','Connecticut','New York','New Jersey','Pennsylvania','Delaware','Maryland','Virginia','North Carolina','South Carolina','Georgia'];
let bellRAF=0;
function stopBell(){cancelAnimationFrame(bellRAF);bellRAF=0}
const BELL_TEXT=`The State House Bell. This bell hung high in the State House steeple. It rang to call lawmakers to meetings and to tell the town important news. Around its top are words from the Bible, Leviticus chapter 25, verse 10: Proclaim liberty throughout all the land unto all the inhabitants thereof. Many people believe it rang on July 8, 1776, when the Declaration of Independence was read out loud to the people for the first time. Years later the bell cracked, so now it rests quietly in its own building, and people call it the Liberty Bell.`;
function openBell(){ show(bellPanel) }
function bellPanel(){
  const p=render(`
    <div class="bell-left" id="bellArea">
      <div class="beam"></div>
      <div class="bell-wrap" id="bellWrap"><img src="assets/bell.webp" alt="The Liberty Bell" draggable="false"></div>
      <button class="pill ring-btn" id="ringBtn">${ICON('bell').replace('viewBox','style="width:24px;height:24px" viewBox')} Ring it!</button>
      <div class="stars" id="stars">${COLONIES.map(()=>`<svg class="star" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z"/></svg>`).join('')}</div>
      <div class="colony" id="colony">Ring it 13 times — once for each colony!</div>
    </div>
    <div class="bell-right"><div class="card-text">
      <h2>The State House Bell</h2>
      <div class="sub">Today we call it the Liberty Bell</div>
      <p>This bell hung high in the State House steeple. It rang to call lawmakers to meetings and to tell the whole town when there was important news.</p>
      <div class="inscription">“Proclaim LIBERTY throughout all the Land unto all the Inhabitants thereof.”<br><small style="font-size:.7em;color:#e7c98a">— Leviticus 25:10, cast around the top of the bell</small></div>
      <p>Many people believe it rang on <b>July 8, 1776</b>, when the Declaration of Independence was read out loud to the people for the first time.</p>
      <p>Years later the bell cracked. Now it rests in its own building across the street, and people come from all over the world to see it.</p>
      <div class="row">${readBtn()}</div>
      <p style="font-size:14px;opacity:.75;margin-top:14px">The real bell is cracked and is not rung anymore. The sound here is made to be like a big bronze bell.</p>
    </div></div>`,'bell-panel');
  wireRead(p,()=>BELL_TEXT);
  const wrap=$('#bellWrap'), area=$('#bellArea'); let th=0, om=0, last=0, count=0, dragging=false, lastSign=0, ptr=null;
  const lit=()=>{$$('.star',p).forEach((s,i)=>s.classList.toggle('lit',i<count))};
  function ding(power){
    bellStrike(Math.min(1,.45+power)); if(count<13){count++; lit(); $('#colony').textContent=count+'. '+COLONIES[count-1]}
    if(count===13 && !p._done){p._done=1; setTimeout(()=>{chime();toast('13 rings for 13 colonies! 🔔')},500)}
  }
  function push(){ if(Math.abs(om)<30) om+= (lastSign>=0?-1:1)*170; else om*=1.25; lastSign=-lastSign||1 }
  $('#ringBtn').addEventListener('click',e=>{e.stopPropagation();push()});
  area.addEventListener('pointerdown',e=>{ if(e.target.closest('button'))return; dragging=true; ptr={x:e.clientX,th}; area.setPointerCapture(e.pointerId)});
  area.addEventListener('pointermove',e=>{ if(!dragging)return; const nt=Math.max(-38,Math.min(38,ptr.th+(e.clientX-ptr.x)*.18)); om=(nt-th)*60; th=nt });
  const up=()=>{ if(dragging){dragging=false; if(Math.abs(th)<3&&Math.abs(om)<20) push()} };
  area.addEventListener('pointerup',up); area.addEventListener('pointercancel',up);
  let prevOm=0, t0=performance.now();
  const step=now=>{
    const dt=Math.min(.033,(now-t0)/1000); t0=now;
    if(!dragging){ const a=-28*th - .9*om; om+=a*dt; th+=om*dt }
    // strike at the top of each swing
    if(Math.sign(om)!==Math.sign(prevOm) && Math.abs(th)>6 && now-last>250){ last=now; ding(Math.min(.55,Math.abs(th)/50)) }
    prevOm=om; wrap.style.transform=`rotate(${th}deg)`;
    bellRAF=requestAnimationFrame(step);
  };
  bellRAF=requestAnimationFrame(step);
}

/* ---------------- Assembly Room ---------------- */
const ROOM_SPOTS=[
  {x:.462,y:.47,title:'The president’s desk',img:'assets/inkstand.jpg',
   text:'John Hancock, the President of the Congress, sat up front. On his desk was a silver inkstand made by Philip Syng. The men who signed dipped their quill pens into it.'},
  {x:.14,y:.66,title:'A table for each colony',
   text:'The men from each colony sat together at tables covered in green cloth. They talked, argued, and voted, colony by colony. It took many days to agree.'},
  {x:.462,y:.12,title:'Candles and windows',
   text:'There were no electric lights. Tall windows let in the sunshine, and candles burned when it got dark. It was a hot summer, and Thomas Jefferson later remembered horse flies from a stable nearby!'},
  {x:.84,y:.6,title:'Where it happened',
   text:'In this room, on July 2, 1776, the Congress voted to be free from Great Britain. On July 4 they agreed on the words of the Declaration of Independence.'},
];
function openRoom(){ show(roomPanel) }
function fitBox(el,ar,mode){ // size a box to the panel with the image aspect ratio
  const W=el.parentElement.clientWidth,H=el.parentElement.clientHeight;
  let w,h; if(mode==='cover'){w=Math.max(W,H*ar);h=w/ar}else{w=Math.min(W,H*ar);h=w/ar}
  el.style.cssText+=`;position:absolute;width:${w}px;height:${h}px;left:${Math.max(0,(W-w)/2)}px;top:${(H-h)/2}px`;
  const st=el.parentElement; if(w>W+4){ st.style.overflowX='auto'; requestAnimationFrame(()=>st.scrollLeft=(w-W)/2) } else st.style.overflowX='hidden';
}
function roomPanel(){
  const p=render(`<div class="photo-stage"><div id="roomBox"><img class="bg" src="assets/assembly-room.jpg" alt="The Assembly Room" draggable="false" style="width:100%;height:100%"></div></div>
    <div class="caption-bar"><div class="txt"><h2>The Assembly Room</h2>Tap the glowing circles to look around the room where the Declaration of Independence was agreed to.</div>
    <div class="row"><button class="pill" id="whoBtn">${ICON('person').replace('viewBox','style="width:22px;height:22px" viewBox')} Who was there?</button>
    <button class="pill dark" id="signBtn">${ICON('quill').replace('viewBox','style="width:22px;height:22px" viewBox')} Sign it too</button></div></div>`,'photo-panel');
  const box=$('#roomBox'); const fit=()=>fitBox(box,1190/960,'cover'); fit(); onResize=fit;
  ROOM_SPOTS.forEach(s=>{
    const b=document.createElement('button'); b.className='hs'; b.style.left=s.x*100+'%'; b.style.top=s.y*100+'%';
    b.innerHTML=`<span class="pulse"></span><span class="ring"></span><svg viewBox="0 0 24 24" style="width:26px;height:26px"><circle cx="12" cy="12" r="5" fill="currentColor"/></svg>`;
    b.addEventListener('click',e=>{e.stopPropagation();popCard(p,s,b)}); box.appendChild(b);
  });
  $('#whoBtn').addEventListener('click',()=>show(trumbullPanel));
  $('#signBtn').addEventListener('click',()=>show(signPanel));
  p.addEventListener('click',e=>{ if(!e.target.closest('.popcard')) $$('.popcard',p).forEach(c=>c.remove()) });
}
function popCard(root,s,anchor){
  $$('.popcard',root).forEach(c=>c.remove());
  const c=document.createElement('div'); c.className='popcard paper';
  c.innerHTML=`<button class="pc-x" aria-label="Close">×</button>${s.img?`<img src="${s.img}" alt="">`:''}<h3>${s.title}</h3><p>${s.text}</p>${readBtn()}`;
  c.querySelector('.pc-x').addEventListener('click',e=>{e.stopPropagation();c.remove()});
  root.appendChild(c); wireRead(c,()=>s.title+'. '+s.text);
  const r=anchor.getBoundingClientRect(), R=root.getBoundingClientRect(), cw=c.offsetWidth, ch=c.offsetHeight;
  const ax=r.left+r.width/2-R.left;
  if(R.width<620){ c.style.left=(R.width-cw)/2+'px'; c.style.top=Math.max(84,R.height-ch-16)+'px'; }
  else{ c.style.left=(ax>R.width/2? 18 : R.width-cw-18)+'px'; c.style.top=Math.max(84,Math.min(R.height-ch-120,(R.height-ch)/2-30))+'px'; }
  c.addEventListener('click',e=>e.stopPropagation());
}

/* ---------------- Trumbull painting ---------------- */
const FACES=[
  {x:.485,y:.446,title:'John Adams',text:'A lawyer from Massachusetts who argued hard for independence. He was on the committee that planned the Declaration, and later became the second President.'},
  {x:.528,y:.43,title:'Roger Sherman & Robert Livingston',text:'Two more members of the “Committee of Five.” Sherman, from Connecticut, was a shoemaker who became a judge. Livingston was from New York.'},
  {x:.583,y:.413,title:'Thomas Jefferson',text:'The tall man in the red vest is handing over the Declaration. He wrote the first draft when he was 33 years old.',person:'jefferson'},
  {x:.637,y:.449,title:'Benjamin Franklin',text:'At 70, he was the oldest man to sign. He helped Jefferson make the words even better.',person:'franklin'},
  {x:.823,y:.413,title:'Charles Thomson',text:'The Secretary of the Congress. He wrote down what happened each day, and his name went on the first printed copies along with Hancock’s.'},
  {x:.838,y:.5,title:'John Hancock',text:'The President of the Congress sits in the big chair. He signed his name first, in the middle, big and bold.',img:'assets/hancock.jpg'},
];
function trumbullPanel(){
  const p=render(`<div class="photo-stage" style="background:#120c06"><div id="tBox"><img class="bg" src="assets/trumbull.jpg" alt="Painting of the Declaration of Independence by John Trumbull" draggable="false" style="width:100%;height:100%;object-fit:contain"></div></div>
    <div class="caption-bar"><div class="txt"><h2>Who was there?</h2>John Trumbull painted this scene after the war. He met many of these men and painted their faces from real life. Tap a glowing face!</div>
    <div class="row"><span id="seenCount" style="font-weight:800;color:var(--gold2)">0 of ${FACES.length} found</span></div></div>`,'photo-panel');
  const box=$('#tBox'); const fit=()=>{const P=box.parentElement;const W=P.clientWidth,H0=P.clientHeight,ar=1280/841;
    let w,h,top;
    if(W<H0){ h=Math.min(H0*0.52,520); w=h*ar; top=96 } // phone/tablet portrait: big painting, swipe sideways
    else { const H=H0-120; w=Math.min(W,H*ar); h=w/ar; top=Math.max(70,(H-h)/2+10) }
    box.style.cssText=`position:absolute;width:${w}px;height:${h}px;left:${Math.max(0,(W-w)/2)}px;top:${top}px`;
    if(w>W+4){P.style.overflowX='auto';requestAnimationFrame(()=>P.scrollLeft=Math.max(0,w*0.66-W/2))}else P.style.overflowX='hidden'}; fit(); onResize=fit;
  let seen=new Set();
  FACES.forEach((f,i)=>{
    const b=document.createElement('button'); b.className='face'; b.style.left=f.x*100+'%'; b.style.top=f.y*100+'%'; b.setAttribute('aria-label',f.title);
    if(f.title.includes('&')){b.style.width=b.style.height='48px'}
    b.addEventListener('click',e=>{e.stopPropagation();seen.add(i);b.classList.add('seen');$('#seenCount').textContent=`${seen.size} of ${FACES.length} found`;
      popCard(p,f,b); if(f.person){const c=$('.popcard',p); const more=document.createElement('button'); more.className='pill'; more.style.marginLeft='8px'; more.textContent='Story card'; more.onclick=()=>show(personPanel,f.person); c.appendChild(more)}
      if(seen.size===FACES.length) setTimeout(()=>{chime();toast('You found everyone! ⭐')},600)});
    box.appendChild(b);
  });
  p.addEventListener('click',e=>{ if(!e.target.closest('.popcard')) $$('.popcard',p).forEach(c=>c.remove()) });
}

/* ---------------- Sign your name ---------------- */
let strokes=[];
function signPanel(){
  const p=render(`
    <div class="sign-head">
      <div class="t1">IN CONGRESS, July 4, 1776.</div>
      <div class="t2">The unanimous Declaration of the thirteen united States of America</div>
      <div class="t3">“We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness.”</div>
    </div>
    <div class="sign-area" id="signArea">
      <img class="sig-hancock" src="assets/hancock-signature.png" alt="John Hancock's signature">
      <div class="sig-hancock-cap">John Hancock signed here first</div>
      <div class="sig-line"><span>Write your name here with the quill</span></div>
      <canvas id="signCanvas"></canvas>
    </div>
    <div class="sign-tools">
      <button class="inkwell" id="inkwell" aria-label="Dip the quill in the inkstand"><img src="assets/inkstand.jpg" alt=""></button>
      <div><div style="font-weight:800;font-size:15px;margin-bottom:4px">Ink on your quill</div><div class="inkmeter"><i id="inkLevel" style="width:100%"></i></div></div>
      <button class="pill ghost" id="clearBtn">Start over</button>
      <button class="pill dark" id="saveBtn">Save my page</button>
    </div>`,'paper sign-panel');
  const cv=$('#signCanvas'), area=$('#signArea'), ctx=cv.getContext('2d'); let ink=1, cur=null, warned=false;
  function size(){const r=area.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);cv.width=r.width*d;cv.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);redraw()}
  function seg(a,b,W,H){ctx.strokeStyle=`rgba(28,20,14,${b.a})`;ctx.lineWidth=b.w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a.x*W,a.y*H);ctx.lineTo(b.x*W,b.y*H);ctx.stroke()}
  function redraw(){const r=area.getBoundingClientRect(),W=r.width,H=r.height;ctx.clearRect(0,0,W,H);
    strokes.forEach(s=>{ if(s.blot){ctx.fillStyle='rgba(28,20,14,.85)';ctx.beginPath();ctx.arc(s.blot.x*W,s.blot.y*H,s.blot.r,0,7);ctx.fill()} for(let i=1;i<s.pts.length;i++)seg(s.pts[i-1],s.pts[i],W,H)})}
  const setInk=v=>{ink=Math.max(0,Math.min(1,v));$('#inkLevel').style.width=ink*100+'%';$('#inkwell').classList.toggle('need',ink<.12)};
  area.addEventListener('pointerdown',e=>{audio();area.setPointerCapture(e.pointerId);const r=area.getBoundingClientRect();
    const pt={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height,w:3,a:Math.max(.08,ink)};
    cur={pts:[pt],t:performance.now()}; if(ink>.92){cur.blot={x:pt.x,y:pt.y,r:3+Math.random()*2.5}} strokes.push(cur); redraw();
    if(ink<.12&&!warned){warned=true;toast('Your quill is dry — tap the inkstand to dip it!')}});
  area.addEventListener('pointermove',e=>{ if(!cur)return; const r=area.getBoundingClientRect();
    const evs=e.getCoalescedEvents?e.getCoalescedEvents():[e];
    evs.forEach(ev=>{const last=cur.pts[cur.pts.length-1];const x=(ev.clientX-r.left)/r.width,y=(ev.clientY-r.top)/r.height;
      const dx=(x-last.x)*r.width,dy=(y-last.y)*r.height,dist=Math.hypot(dx,dy); if(dist<1.2)return;
      const now=performance.now(),sp=dist/Math.max(1,now-cur.t);cur.t=now;
      // a quill nib: thicker on down-strokes, thinner when fast
      const ang=Math.atan2(dy,dx); const nib=1.2+2.6*Math.abs(Math.sin(ang-0.7));
      const w=Math.max(1,Math.min(6.5,(nib+2.2)-sp*1.4)); const a=ink<.02?.05:Math.min(.95,.22+ink*.8);
      const pt={x,y,w:last.w*.6+w*.4,a}; cur.pts.push(pt); seg(last,pt,r.width,r.height); setInk(ink-dist/1800); if(Math.random()<.15)scratch()});
  });
  const end=()=>{cur=null};
  area.addEventListener('pointerup',end); area.addEventListener('pointercancel',end);
  $('#inkwell').addEventListener('click',()=>{setInk(1);warned=false;toast('Dip! Your quill is full of ink.',1200);chime()});
  $('#clearBtn').addEventListener('click',()=>{strokes=[];setInk(1);redraw()});
  $('#saveBtn').addEventListener('click',()=>savePage(area));
  size(); onResize=size;
}
function savePage(area){
  const W=1600,H=1000,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#f6ecd5');g.addColorStop(1,'#e6d2a8');x.fillStyle=g;x.fillRect(0,0,W,H);
  for(let i=0;i<9000;i++){x.fillStyle=`rgba(110,80,40,${Math.random()*.05})`;x.fillRect(Math.random()*W,Math.random()*H,2,2)}
  x.fillStyle='#2a1a0e';x.textAlign='center';x.font='56px "IM Fell", Georgia, serif';x.fillText('IN CONGRESS, July 4, 1776.',W/2,110);
  x.font='italic 34px "IM Fell", Georgia, serif';x.fillText('The unanimous Declaration of the thirteen united States of America',W/2,170);
  const r=area.getBoundingClientRect(), top=230, ah=H-top-60, aw=W-80;
  const sig=$('.sig-hancock',area), sr=sig.getBoundingClientRect();
  x.drawImage(sig,40+(sr.left-r.left)/r.width*aw,top+(sr.top-r.top)/r.height*ah,sr.width/r.width*aw,sr.height/r.height*ah);
  x.save();x.translate(40,top);
  strokes.forEach(s=>{ if(s.blot){x.fillStyle='rgba(28,20,14,.85)';x.beginPath();x.arc(s.blot.x*aw,s.blot.y*ah,s.blot.r*aw/r.width,0,7);x.fill()}
    for(let i=1;i<s.pts.length;i++){const a=s.pts[i-1],b=s.pts[i];x.strokeStyle=`rgba(28,20,14,${b.a})`;x.lineWidth=b.w*aw/r.width;x.lineCap='round';x.beginPath();x.moveTo(a.x*aw,a.y*ah);x.lineTo(b.x*aw,b.y*ah);x.stroke()}});
  x.restore();
  c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='my-declaration-signature.png';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000);toast('Saved your page!')},'image/png');
}

/* ---------------- People story cards ---------------- */
const PEOPLE={
  washington:{name:'George Washington',sub:'Leader of the army · first President',img:'assets/washington.jpg',
    facts:['George grew up on a farm in Virginia. As a teenager he worked as a surveyor, measuring land with chains and drawing careful maps.',
      'In July 1776 he was not in Philadelphia. He was in New York leading the Continental Army. When the Declaration reached him, he had it read out loud to his soldiers on July 9.',
      'In 1787 he came back to the Assembly Room to lead the meeting that wrote the Constitution. Two years later he became the first President of the United States.',
      'The statue in front of Independence Hall today is of George Washington.'],
    fun:'His chair in the Assembly Room has a half sun carved on top. Ben Franklin said he was happy to decide it was a rising sun, not a setting one.'},
  franklin:{name:'Benjamin Franklin',sub:'Printer · inventor · the oldest signer',img:'assets/franklin.jpg',
    facts:['Ben was the fifteenth of seventeen children! He left school at ten and learned to be a printer in his big brother’s shop.',
      'In Philadelphia he ran his own print shop. He printed a newspaper and Poor Richard’s Almanack, full of wise sayings like “Early to bed and early to rise, makes a man healthy, wealthy, and wise.”',
      'He flew a kite in a storm to show that lightning is electricity, and he invented the lightning rod, bifocal glasses, and a better stove.',
      'In 1776 he was 70 years old, the oldest man to sign. He helped Jefferson make the Declaration’s words even better.'],
    fun:'He started Philadelphia’s first lending library and its volunteer fire company.'},
  jefferson:{name:'Thomas Jefferson',sub:'Writer of the Declaration · third President',img:'assets/jefferson.jpg',
    facts:['Thomas was tall with reddish hair. He loved books, gardens, and music, and he played the violin.',
      'Congress picked five men to plan the Declaration, and they asked Jefferson to write the first draft. He was only 33.',
      'He wrote it in two rented rooms in Philadelphia, sitting at a small folding writing desk he had designed himself.',
      'Congress changed some of his words, then agreed on the final Declaration on July 4, 1776. He later became the third President.'],
    fun:'Jefferson and John Adams both died on the same day: July 4, 1826, exactly fifty years after the Declaration.'},
};
function openPerson(id){ show(personPanel,id) }
function personPanel(id){
  const P=PEOPLE[id], ids=Object.keys(PEOPLE), i=ids.indexOf(id);
  const p=render(`<div class="portrait"><div class="frame"><img src="${P.img}" alt="${P.name}"></div></div>
    <div class="person-text paper"><div class="card-text">
      <h2>${P.name}</h2><div class="sub">${P.sub}</div>
      <div class="facts">${P.facts.map((f,k)=>`<div class="fact"><b>${k+1}</b><div>${f}</div></div>`).join('')}</div>
      <p><b>Did you know?</b> ${P.fun}</p>
      <div class="row">${readBtn()}
        <button class="pill ghost" id="nextP">Next: ${PEOPLE[ids[(i+1)%ids.length]].name.split(' ').pop()} ›</button></div>
    </div></div>`,'person-panel');
  wireRead(p,()=>`${P.name}. ${P.facts.join(' ')} Did you know? ${P.fun}`);
  $('#nextP').addEventListener('click',()=>{current=()=>personPanel(ids[(i+1)%ids.length]);current()});
}
$$('.dock-btn.person').forEach(b=>b.addEventListener('click',()=>{$('#hint').classList.add('gone');openPerson(b.dataset.person)}));
$('#dockSign').addEventListener('click',()=>{$('#hint').classList.add('gone');show(signPanel)});

/* ---------------- Clock ---------------- */
function openClock(){ show(clockPanel) }
function clockPanel(){
  const nums=['XII','I','II','III','IIII','V','VI','VII','VIII','IX','X','XI'];
  const p=render(`
    <svg class="clockface" id="clock" viewBox="0 0 200 200">
      <defs><radialGradient id="cf" cx="45%" cy="40%"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#ead9b5"/></radialGradient>
      <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6d98d"/><stop offset=".5" stop-color="#9a6d1d"/><stop offset="1" stop-color="#e8c46c"/></linearGradient></defs>
      <circle cx="100" cy="100" r="97" fill="url(#rim)"/><circle cx="100" cy="100" r="88" fill="url(#cf)" stroke="#6b4a1e" stroke-width="1.2"/>
      ${Array.from({length:60},(_,k)=>{const a=k*6*Math.PI/180,r1=k%5?82:78;return `<line x1="${100+Math.sin(a)*r1}" y1="${100-Math.cos(a)*r1}" x2="${100+Math.sin(a)*85}" y2="${100-Math.cos(a)*85}" stroke="#3a2a18" stroke-width="${k%5?0.8:2}"/>`}).join('')}
      ${nums.map((n,k)=>{const a=k*30*Math.PI/180;return `<text x="${100+Math.sin(a)*66}" y="${100-Math.cos(a)*66+5.5}" text-anchor="middle" font-family="IM Fell, Georgia, serif" font-size="15" fill="#2a1a0e">${n}</text>`}).join('')}
      <g id="hHand"><path d="M100 104 L96 100 L100 52 L104 100 Z" fill="#2a1a0e"/><circle cx="100" cy="62" r="5" fill="none" stroke="#2a1a0e" stroke-width="2"/></g>
      <g id="mHand"><path d="M100 106 L97.5 100 L100 24 L102.5 100 Z" fill="#2a1a0e"/></g>
      <circle cx="100" cy="100" r="5" fill="#9a6d1d" stroke="#2a1a0e"/>
    </svg>
    <div class="clock-text card-text">
      <h2>Noon, July 8, 1776</h2>
      <p>On this day a crowd gathered in the State House Yard. At <b>12 o’clock noon</b>, John Nixon stood up and read the Declaration of Independence out loud to the people for the first time.</p>
      <p><b>Can you set the State House clock to 12 o’clock?</b> Drag the hands with your finger. The short hand shows the hour. The long hand shows the minutes.</p>
      <div class="row">${readBtn()}<span id="clockMsg" style="font-weight:800;color:var(--ox)"></span></div>
    </div>`,'clock-panel');
  wireRead(p,()=>'On July 8, 1776, a crowd gathered in the State House Yard. At 12 o clock noon, John Nixon read the Declaration of Independence out loud to the people. Can you set the clock to 12 o clock? Drag the hands. The short hand shows the hour. The long hand shows the minutes.');
  const svg=$('#clock'); let mins=9*60+30, which=null, done=false;
  function draw(){const h=(mins/60)%12, m=mins%60; $('#hHand').setAttribute('transform',`rotate(${h*30} 100 100)`); $('#mHand').setAttribute('transform',`rotate(${m*6} 100 100)`);
    const hh=Math.floor(mins/60)%12||12, mm=Math.round(m); $('#clockMsg').textContent=`${hh}:${String(mm%60).padStart(2,'0')}`;}
  function ang(e){const r=svg.getBoundingClientRect();const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;return (Math.atan2(x,-y)*180/Math.PI+360)%360}
  svg.addEventListener('pointerdown',e=>{svg.setPointerCapture(e.pointerId);const a=ang(e);const hA=((mins/60)%12)*30,mA=(mins%60)*6;
    const d=(p,q)=>Math.min(Math.abs(p-q),360-Math.abs(p-q)); which=d(a,hA)<d(a,mA)?'h':'m'; move(e)});
  function move(e){ if(!which)return; const a=ang(e);
    if(which==='m'){const old=mins%60;let nm=Math.round(a/6)%60;let base=mins-old; if(old>45&&nm<15)base+=60; if(old<15&&nm>45)base-=60; mins=(base+nm+720*10)%720}
    else{const h=Math.floor(a/30);mins=h*60+(mins%60)}
    draw(); check()}
  svg.addEventListener('pointermove',move);
  svg.addEventListener('pointerup',()=>{which=null;check(true)});
  function check(release){const m=mins%60, h=Math.floor(mins/60)%12; const ok=(h===0&&m<=5)||(h===11&&m>=55); if(ok&&release&&!done){done=true;mins=0;draw();$('#clockMsg').textContent='12:00 — Noon! 🎉';
      let k=0;const ring=()=>{bellStrike(.8);if(++k<3)setTimeout(ring,900)};ring();
      setTimeout(()=>toast('You did it! The bells ring and the Declaration is read!'),400)} }
  draw();
}

/* ---------------- credits ---------------- */
$('#creditsBtn').addEventListener('click',()=>show(()=>{
  render(`<div class="credits-list paper"><h2>Pictures &amp; sounds</h2><ul>${(window.CREDITS||[]).map(c=>`<li><b>${c.title.replace(/\.(jpg|jpeg|png|tif)$/i,'')}</b> — ${c.artist}. ${c.license}${c.licurl?` (<a href="${c.licurl}" target="_blank" rel="noopener">license</a>)`:''}. <a href="${c.page}" target="_blank" rel="noopener">Source</a>${c.note?'. '+c.note:''}</li>`).join('')}
  <li>Bell and chime sounds are made in the browser with the Web Audio API. Fonts: IM Fell English (Igino Marini), Nunito, and Homemade Apple, under the SIL Open Font License.</li></ul>
  <p style="font-size:14px">Stories on this page are written for our family homeschool. The words from the Declaration of Independence and the Bible are in the public domain.</p></div>`,'paper')
}));

/* ---------------- boot ---------------- */
setView('1778');
setTimeout(()=>$('#hint').classList.add('gone'),9000);
window.__ready=true;
