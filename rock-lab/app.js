/* reliable tap: fires on pointerup (fast on touch) or click (keyboard), never twice */
let __lastTap=0;
function onTap(el,fn){let d=null;
  el.addEventListener('pointerdown',e=>{d={x:e.clientX,y:e.clientY,id:e.pointerId}});
  el.addEventListener('pointerup',e=>{if(d&&d.id===e.pointerId&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<14){__lastTap=Date.now();fn(e)}d=null});
  el.addEventListener('pointercancel',()=>d=null);
  el.addEventListener('click',e=>{if(Date.now()-__lastTap<700)return;fn(e)})}
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const ROCKS={
  granite:{name:'Granite',type:'igneous',h:6,fizz:false,
    look:'Speckles! Pink and white feldspar, glassy gray quartz, and little black flakes of mica.',
    lookShort:'Big speckled crystals',
    where:'Little Cottonwood Canyon',
    whereText:'The gray-and-white speckled granite of Little Cottonwood Canyon was hauled by ox teams to build the Salt Lake Temple.',
    hunt:'Look for salt-and-pepper speckled stones in canyon creeks and in landscaping rocks.',
    story:'Granite cooled very slowly, deep underground, so its crystals had time to grow big enough to see.'},
  sandstone:{name:'Sandstone',type:'sedimentary',h:3,crumble:true,fizz:false,
    look:'Tiny round grains of sand, all stuck together like a sugar cube.',
    lookShort:'Sand grains glued together',
    where:'Red cliffs of southern Utah',
    whereText:'The giant red and white cliffs of Zion and Snow Canyon are Navajo Sandstone, made from desert sand dunes long ago.',
    hunt:'Rub it with your thumb. If sand grains come off, it is probably sandstone.',
    story:'Sandstone started as sand on beaches, rivers, or desert dunes. Layers of sand were pressed and glued together.'},
  limestone:{name:'Limestone',type:'sedimentary',h:3,fizz:true,
    look:'Smooth and gray. Sometimes you can find tiny sea shells and fossils inside.',
    lookShort:'Smooth, sometimes with shells',
    where:'Wasatch Mountains',
    whereText:'Much of Mount Timpanogos and the mountains above Spanish Fork is gray limestone. Timpanogos Cave was dissolved out of limestone by water.',
    hunt:'Gray rock in the mountains above our valley. Look closely for fossil shells!',
    story:'Limestone formed at the bottom of ancient seas from shells and the bits of tiny sea creatures.'},
  obsidian:{name:'Obsidian',type:'igneous',h:5.5,fizz:false,
    look:'Shiny black glass with curved, shell-shaped edges. No crystals at all!',
    lookShort:'Shiny glass, no crystals',
    where:'Black Rock Desert near Delta',
    whereText:'Western Utah has obsidian, including “snowflake obsidian” with white specks. Native Americans chipped it into sharp arrowheads.',
    hunt:'Shiny black and glassy. Its edges can be sharp, so let a grown-up pick it up.',
    story:'Obsidian is lava that cooled so fast that crystals had no time to grow. It turned into natural glass.'},
  quartz:{name:'Quartz',type:'igneous',h:7,fizz:false,mineral:true,
    look:'Clear or milky crystals with flat sides and pointed tips, like little towers.',
    lookShort:'Clear crystals with points',
    where:'Creeks and canyons all over Utah',
    whereText:'Quartz is one of the most common minerals on Earth. Most sand grains are tiny bits of quartz!',
    hunt:'Look for milky white, very hard pebbles in creeks. They can scratch glass.',
    story:'Quartz is a mineral, one of the building blocks of rocks like granite. Crystals like these grow from very hot water deep underground, so we put quartz with the rocks made by fire.'},
  basalt:{name:'Basalt',type:'igneous',h:6,fizz:false,
    look:'Dark and heavy with tiny crystals, and little holes where gas bubbles were trapped.',
    lookShort:'Dark, with bubble holes',
    where:'Lava fields near Fillmore',
    whereText:'Ice Springs and Pahvant Butte in central Utah have black basalt lava flows you can walk on.',
    hunt:'Dark gray or black rock, often full of little holes, like a sponge made of stone.',
    story:'Basalt is lava that cooled quickly on top of the ground, so its crystals stayed tiny.'},
  shale:{name:'Shale (with a trilobite!)',type:'sedimentary',h:3,fizz:false,
    look:'Thin, flat layers of hardened mud. This piece has a trilobite fossil in it!',
    lookShort:'Thin flat mud layers',
    where:'House Range near Delta',
    whereText:'The Wheeler Shale in western Utah is one of the best places in the world to find trilobite fossils, and families can dig for them.',
    hunt:'Flat, crumbly rock that splits apart like pages in a book.',
    story:'Shale formed from soft mud that settled at the bottom of quiet water, layer after layer.'},
  marble:{name:'Marble',type:'metamorphic',h:3,fizz:true,
    look:'Sparkly, sugary crystals all locked tightly together.',
    lookShort:'Sugary sparkly crystals',
    where:'Statues and old headstones',
    whereText:'Marble is rare in Utah’s mountains, but you can find it in old cemetery headstones, statues, and fancy buildings.',
    hunt:'Look in a cemetery for white headstones with soft, rounded old letters.',
    story:'Marble was once limestone. Deep underground it was squeezed and heated until its tiny pieces grew into sparkly crystals.'},
};
const FIELD_CAP={granite:'Granite boulders with dark spots (xenoliths) in Little Cottonwood Canyon',sandstone:'Navajo Sandstone cliff, southern Utah',limestone:'Folded limestone layers, Sheep Creek Canyon, Uinta Mountains',obsidian:'Obsidian from Utah',quartz:'A clear quartz crystal',basalt:'Basalt from Ice Springs Crater, Millard County, Utah',shale:'Mancos Shale hills, Book Cliffs, eastern Utah',marble:'White marble'};
const TYPES={
  igneous:{name:'Igneous',sub:'made by fire',img:'assets/form-igneous.jpg',
    text:'Deep underground it is so hot that rock melts into magma. When magma or lava cools, it hardens into rock. Cooling slowly underground grows big crystals. Cooling fast on top of the ground makes tiny crystals, or even glass.'},
  sedimentary:{name:'Sedimentary',sub:'made in layers',img:'assets/form-sedimentary.jpg',
    text:'Wind and water break rocks into sand, mud, and bits of shell. These pieces settle in layers in lakes, seas, rivers, and deserts. Over a very long time the layers are pressed and glued together into rock.'},
  metamorphic:{name:'Metamorphic',sub:'changed by squeeze and heat',img:'assets/form-metamorphic.jpg',
    text:'Metamorphic means “changed.” When rocks are buried deep, they get squeezed and heated, but not melted. Their tiny pieces grow and line up into a new rock. Limestone changes into marble, and sandstone changes into quartzite.'},
};
const ORDER=Object.keys(ROCKS);
const LS={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let sorted=new Set(LS.get('rocklab.sorted',[])), found=new Set(LS.get('rocklab.found',[]));
let cur=null, tool='look', scr={h:2.5,n:'fingernail'}, clues={};

/* ---------- audio ---------- */
let AC=null;
function ac(){if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AC=new C()}if(AC.state==='suspended')AC.resume();return AC}
window.addEventListener('pointerdown',()=>ac(),{once:true});
function noise(dur,type,freq,q,vol,t0=0){const c=ac();if(!c)return;const t=c.currentTime+t0;const b=c.createBuffer(1,Math.max(1,c.sampleRate*dur),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(c.destination);s.start(t)}
function clack(){noise(.08,'bandpass',900,2,.5);noise(.05,'bandpass',2400,3,.25,.01)}
function scratchSnd(hard){noise(.07,hard?'bandpass':'highpass',hard?5200:3200,hard?6:.7,hard?.08:.12)}
function fizzSnd(sec){const c=ac();if(!c)return;for(let i=0;i<sec*60;i++){noise(.02+Math.random()*.03,'highpass',3500+Math.random()*4000,.5,.03+Math.random()*.06,Math.random()*sec)}noise(sec,'highpass',5000,.3,.05)}
function drip(){const c=ac();if(!c)return;const t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(900,t);o.frequency.exponentialRampToValueAtTime(1800,t+.08);g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.0001,t+.12);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.15)}
function chime(){const c=ac();if(!c)return;const t=c.currentTime;[659,784,988,1319].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0,t+i*.08);g.gain.linearRampToValueAtTime(.12,t+i*.08+.01);g.gain.exponentialRampToValueAtTime(.0001,t+i*.08+.8);o.connect(g);g.connect(c.destination);o.start(t+i*.08);o.stop(t+i*.08+.9)})}
function boop(){const c=ac();if(!c)return;const t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(330,t);o.frequency.exponentialRampToValueAtTime(220,t+.2);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.0001,t+.3);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.32)}

/* ---------- speech ---------- */
let voice=null;function pickVoice(){const v=speechSynthesis.getVoices();voice=v.find(x=>/Samantha|Karen|Daniel/.test(x.name))||v.find(x=>/^en[-_]US/i.test(x.lang))||v.find(x=>/^en/i.test(x.lang))||null}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
function speak(t,btn){if(!('speechSynthesis' in window))return;if(speechSynthesis.speaking){speechSynthesis.cancel();$$('.speaking').forEach(b=>b.classList.remove('speaking'));return}
  const u=new SpeechSynthesisUtterance(t);if(voice)u.voice=voice;u.rate=.92;if(btn){btn.classList.add('speaking');u.onend=u.onerror=()=>btn.classList.remove('speaking')}speechSynthesis.speak(u)}

let tt;function toast(m,ms=2200){const t=$('#toast');t.innerHTML=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),ms)}
function msg(m){$('#matMsg').innerHTML=m}

/* ---------- drawer ---------- */
const drawer=$('#drawer');
ORDER.forEach(id=>{const b=document.createElement('button');b.className='slot';b.dataset.id=id;b.innerHTML=`<img src="assets/${id}.webp" alt="${ROCKS[id].name}"><span class="lab">${ROCKS[id].name.split(' ')[0]}</span>`;
  onTap(b,()=>pick(id));drawer.appendChild(b)});
function refreshDrawer(){$$('.slot').forEach(s=>{s.classList.toggle('active',s.dataset.id===cur);s.classList.toggle('done',sorted.has(s.dataset.id))});$('#scoreN').textContent=sorted.size}

/* ---------- specimen + hit testing ---------- */
const mat=$('#mat'), spec=$('#specimen'), specImg=$('#specImg'), fx=$('#fx'), fctx=fx.getContext('2d');
const hit=document.createElement('canvas'), hctx=hit.getContext('2d',{willReadFrequently:true});
function pick(id){
  cur=id; clues[id]=clues[id]||{}; const R=ROCKS[id];
  specImg.onload=()=>{hit.width=specImg.naturalWidth;hit.height=specImg.naturalHeight;hctx.clearRect(0,0,hit.width,hit.height);hctx.drawImage(specImg,0,0);sizeFx();clearFx()};
  specImg.src=`assets/${id}.webp`; specImg.alt=R.name;
  spec.classList.remove('drop'); void spec.offsetWidth; spec.classList.add('drop'); setTimeout(clack,250);
  $('#nameTag').textContent=R.name; $('#nbTitle').textContent=R.name;
  bubbles=[];wet=[];
  showClues(); refreshDrawer();
  msg(sorted.has(id)?`You already sorted ${R.name}. Try the tools again, or pick another rock!`:'Use the tools to find clues: <b>Magnify</b>, <b>Scratch</b>, and <b>Vinegar</b>.');
}
function onRock(cx,cy){const r=specImg.getBoundingClientRect();if(!cur||cx<r.left||cy<r.top||cx>r.right||cy>r.bottom)return false;
  const x=Math.floor((cx-r.left)/r.width*hit.width),y=Math.floor((cy-r.top)/r.height*hit.height);return hctx.getImageData(x,y,1,1).data[3]>140}
function sizeFx(){const r=mat.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);fx.width=r.width*d;fx.height=r.height*d;fctx.setTransform(d,0,0,d,0,0)}
let marks=[]; function clearFx(){marks=[];}

/* ---------- clues ---------- */
function showClues(){const c=clues[cur]||{};
  const set=(id,v)=>{const e=$('#'+id);e.querySelector('span').textContent=v||'?';e.classList.toggle('got',!!v)};
  set('cLook',c.look);set('cScratch',c.scratch);set('cFizz',c.fizz)}

/* ---------- tools ---------- */
$$('.tool').forEach(b=>onTap(b,()=>{tool=b.dataset.tool;$$('.tool').forEach(x=>x.classList.toggle('on',x===b));
  $('#scratchers').classList.toggle('show',tool==='scratch');$('#loupe').style.display='none';$('#dropper').style.display=tool==='vinegar'?'block':'none';
  if(!cur){msg('First pick a rock from the drawer!');return}
  const tips={look:'Drag the rock onto a colored box to sort it.',magnify:'Slide your finger over the rock to look closely.',scratch:`Drag the ${scr.n} across the rock. Does it leave a scratch?`,vinegar:'Tap the rock to drip vinegar on it. Watch for fizzing bubbles!'};
  msg(tips[tool]); if(tool==='vinegar') placeDropper(mat.clientWidth*.7,mat.clientHeight*.25)}));
$$('.sc').forEach(b=>onTap(b,()=>{scr={h:+b.dataset.h,n:b.dataset.n};$$('.sc').forEach(x=>x.classList.toggle('on',x===b));msg(`Drag the ${scr.n} across the rock.`)}));

const loupe=$('#loupe'), glass=$('#loupeGlass'), dropper=$('#dropper');
function magnify(cx,cy){const m=mat.getBoundingClientRect(),r=specImg.getBoundingClientRect();const L=loupe.offsetWidth||210,Z=3,inner=L-24;
  const lx=cx-m.left, ly=cy-m.top-L*.55; loupe.style.display='block'; loupe.style.transform=`translate(${lx-L/2}px,${ly-L/2}px)`;
  glass.style.backgroundImage=`url(${specImg.src})`; glass.style.backgroundSize=`${r.width*Z}px ${r.height*Z}px`;
  glass.style.backgroundPosition=`${inner/2-(cx-r.left)*Z}px ${inner/2-(cy-r.top)*Z}px`;
  if(onRock(cx,cy)&&!clues[cur].look){clues[cur].look=ROCKS[cur].lookShort;showClues()}
  if(onRock(cx,cy)) msg('🔍 '+ROCKS[cur].look)}
function placeDropper(x,y){dropper.style.display='block';dropper.style.transform=`translate(${x-28}px,${y-170}px)`}

let bubbles=[], wet=[], drops=[];
function vinegar(cx,cy){const m=mat.getBoundingClientRect();const x=cx-m.left,y=cy-m.top;placeDropper(x,y-30);
  drops.push({x,y0:y-60,y,t:0,cx,cy});}
function landDrop(d){drip();const R=ROCKS[cur];const on=onRock(d.cx,d.cy);
  if(!on){wet.push({x:d.x,y:d.y,r:10,a:.5});msg('Oops! That drip landed on the mat. Tap right on the rock.');return}
  wet.push({x:d.x,y:d.y,r:16+Math.random()*6,a:.45});
  if(R.fizz){for(let i=0;i<160;i++)bubbles.push({x:d.x+(Math.random()-.5)*60,y:d.y+(Math.random()-.5)*30,r:1.5+Math.random()*5,vy:-(8+Math.random()*34),life:0,max:1+Math.random()*3,delay:Math.random()*2.2});
    fizzSnd(2.5);clues[cur].fizz='Fizzes! 🫧';msg(`<b>Fizz!</b> ${R.name} has calcite in it. Vinegar is an acid, and it makes tiny bubbles of gas when it touches calcite.`)}
  else{clues[cur].fizz='No fizz';msg(`No fizz. The vinegar just sits there in a wet drop. ${R.name} doesn’t have calcite.`)}
  showClues()}

let lastScratch=null;
function scratch(cx,cy,first){const m=mat.getBoundingClientRect();const p={x:cx-m.left,y:cy-m.top};const on=onRock(cx,cy);const R=ROCKS[cur];
  if(lastScratch&&!first&&on){const d=Math.hypot(p.x-lastScratch.x,p.y-lastScratch.y);if(d<3)return;
    const soft=scr.h>R.h; marks.push({a:lastScratch,b:p,soft});scratchSnd(!soft);
    if(R.crumble&&soft&&Math.random()<.5) for(let i=0;i<3;i++)bubbles.push({x:p.x,y:p.y,r:1+Math.random()*1.6,vy:40+Math.random()*60,life:0,max:.8,delay:0,sand:true});
    if(!lastScratch.reported){lastScratch.reported=true;
      if(soft){clues[cur].scratch=`A ${scr.n} scratches it`;msg(R.crumble?`The ${scr.n} rubs sand grains right off! Sandstone grains are hard, but the glue holding them is weak.`:`Scratch! The ${scr.n} left a groove. ${R.name} is softer than a ${scr.n}.`)}
      else{if(!clues[cur].scratch||!/scratches/.test(clues[cur].scratch))clues[cur].scratch=`Harder than a ${scr.n}`;msg(R.h>=6?`No scratch at all! ${R.name} is harder than a ${scr.n}.${R.h>=7?' Quartz is so hard it can scratch glass!':''}`:`No scratch. ${R.name} is harder than a ${scr.n}. Try something harder!`)}
      showClues()}}
  lastScratch=on?Object.assign(p,{reported:lastScratch&&lastScratch.reported&&!first}):null}

/* ---------- pointer handling on the mat ---------- */
let ghost=null, dragStart=null;
mat.addEventListener('pointerdown',e=>{ac();if(!cur){msg('First pick a rock from the drawer!');return}
  if(tool==='magnify'){mat.setPointerCapture(e.pointerId);magnify(e.clientX,e.clientY)}
  else if(tool==='scratch'){mat.setPointerCapture(e.pointerId);lastScratch=null;scratch(e.clientX,e.clientY,true)}
  else if(tool==='vinegar'){vinegar(e.clientX,e.clientY)}
  else if(tool==='look'&&onRock(e.clientX,e.clientY)){startDrag(e)}});
mat.addEventListener('pointermove',e=>{if(e.buttons===0&&e.pointerType==='mouse')return;
  if(tool==='magnify'&&mat.hasPointerCapture(e.pointerId))magnify(e.clientX,e.clientY);
  else if(tool==='scratch'&&mat.hasPointerCapture(e.pointerId)){const evs=e.getCoalescedEvents?e.getCoalescedEvents():[e];evs.forEach(v=>scratch(v.clientX,v.clientY,false))}});
const endMat=()=>{lastScratch=null;if(tool==='magnify')setTimeout(()=>{},0)};
mat.addEventListener('pointerup',endMat);mat.addEventListener('pointercancel',endMat);

function startDrag(e){const r=specImg.getBoundingClientRect();ghost=specImg.cloneNode();Object.assign(ghost.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:r.width+'px',zIndex:50,pointerEvents:'none',transition:'none',filter:'drop-shadow(0 30px 24px rgba(0,0,0,.5))'});
  document.body.appendChild(ghost);specImg.style.opacity=.15;dragStart={x:e.clientX,y:e.clientY,l:r.left,t:r.top,w:r.width};
  const move=ev=>{const s=Math.max(.45,1-Math.hypot(ev.clientX-dragStart.x,ev.clientY-dragStart.y)/600);ghost.style.width=dragStart.w*s+'px';
    ghost.style.left=ev.clientX-(dragStart.x-dragStart.l)*s+'px';ghost.style.top=ev.clientY-(dragStart.y-dragStart.t)*s+'px';
    const el=document.elementFromPoint(ev.clientX,ev.clientY);$$('.bin').forEach(b=>b.classList.toggle('hover',!!el&&b.contains(el)))};
  const up=ev=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);
    const el=document.elementFromPoint(ev.clientX,ev.clientY);const bin=el&&el.closest&&el.closest('.bin');$$('.bin').forEach(b=>b.classList.remove('hover'));
    if(bin){ghost.remove();ghost=null;specImg.style.opacity=1;sortInto(bin.dataset.type,bin)}
    else{ghost.style.transition='all .35s cubic-bezier(.3,1.3,.5,1)';ghost.style.left=dragStart.l+'px';ghost.style.top=dragStart.t+'px';ghost.style.width=dragStart.w+'px';
      setTimeout(()=>{if(ghost){ghost.remove();ghost=null}specImg.style.opacity=1},360)}};
  window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up)}

/* ---------- sorting ---------- */
$$('.bin').forEach(b=>onTap(b,()=>{if(!cur){toast('Pick a rock first!');return}sortInto(b.dataset.type,b)}));
const HINTS={igneous:'It has crystals or glass from cooling melted rock.',sedimentary:'It is made of bits like sand, mud, or shells pressed into layers.',metamorphic:'It was changed by squeezing and heating.'};
function sortInto(type,bin){const R=ROCKS[cur];
  if(type!==R.type){bin.classList.remove('wrong');void bin.offsetWidth;bin.classList.add('wrong');boop();msg(`Hmm, not quite. Here’s a clue: ${HINTS[R.type]}`);return}
  chime();const first=!sorted.has(cur);sorted.add(cur);LS.set('rocklab.sorted',[...sorted]);refreshDrawer();showForms(cur,first)}
function showForms(id,first){const R=ROCKS[id],T=TYPES[R.type];
  const anim=R.type==='igneous'?Array.from({length:14},(_,i)=>`<span class="blob" style="left:${Math.random()*90}%;bottom:${Math.random()*20}%;width:${40+Math.random()*70}px;height:${40+Math.random()*70}px;animation-delay:${Math.random()*3}s"></span>`).join('')
    :R.type==='sedimentary'?Array.from({length:40},(_,i)=>`<span class="grain" style="left:${Math.random()*100}%;animation-delay:${Math.random()*3.4}s;opacity:${.5+Math.random()*.5}"></span>`).join('')
    :`<span class="arrow" style="left:6%;--d:30px">➜</span><span class="arrow" style="right:6%;--d:-30px;transform:scaleX(-1)">➜</span>`;
  const text=`${R.name} is ${T.name.toLowerCase()}, ${T.sub}. ${R.story} ${T.text}`;
  openModal(`<button class="mx" aria-label="Close">×</button>
    <h2>${first?'Yes! ':''}${R.name} is <span style="color:${R.type==='igneous'?'#c4471f':R.type==='sedimentary'?'#a87610':'#5a4b99'}">${T.name}</span></h2>
    <div class="form-anim"><img src="${T.img}" alt=""><div class="anim ${R.type}">${anim}</div></div>
    <p><b>${R.story}</b></p><p>${T.text}</p>
    <div class="mbtns"><button class="pill ghost read">🔊 Read to me</button>${sorted.size<8?'<button class="pill" id="nextRock">Next rock ›</button>':''}</div>`);onTap(
  $('.read',$('#modalCard')),e=>speak(text,e.currentTarget));
  const nx=$('#nextRock');if(nx)onTap(nx,()=>{closeModal();const n=ORDER.find(k=>!sorted.has(k));if(n)pick(n)});
  if(sorted.size===8&&first)setTimeout(()=>toast('🏅 All 8 rocks sorted!<br>You are a Junior Geologist!',3500),600)}

/* ---------- modal ---------- */
function openModal(html){$('#modalCard').innerHTML=html;$('#modal').classList.add('open');$('#modal').setAttribute('aria-hidden','false');const x=$('.mx',$('#modalCard'));if(x)onTap(x,closeModal)}
function closeModal(){$('#modal').classList.remove('open');$('#modal').setAttribute('aria-hidden','true');if('speechSynthesis' in window)speechSynthesis.cancel()}onTap(
$('#modal'),e=>{if(e.target.id==='modal')closeModal()});

/* ---------- animation loop ---------- */
let t0=performance.now();
function frame(now){const dt=Math.min(.05,(now-t0)/1000);t0=now;const W=mat.clientWidth,H=mat.clientHeight;fctx.clearRect(0,0,W,H);
  wet.forEach(w=>{const g=fctx.createRadialGradient(w.x,w.y,0,w.x,w.y,w.r);g.addColorStop(0,`rgba(255,255,255,${w.a*.5})`);g.addColorStop(.6,`rgba(40,40,30,${w.a*.35})`);g.addColorStop(1,'rgba(0,0,0,0)');fctx.fillStyle=g;fctx.beginPath();fctx.arc(w.x,w.y,w.r,0,7);fctx.fill();
    fctx.fillStyle=`rgba(255,255,255,${w.a*.6})`;fctx.beginPath();fctx.arc(w.x-w.r*.3,w.y-w.r*.3,w.r*.18,0,7);fctx.fill()});
  marks.forEach(m=>{if(m.soft){fctx.lineCap='round';fctx.strokeStyle='rgba(30,25,20,.35)';fctx.lineWidth=4;fctx.beginPath();fctx.moveTo(m.a.x+1,m.a.y+1.5);fctx.lineTo(m.b.x+1,m.b.y+1.5);fctx.stroke();
      fctx.strokeStyle='rgba(255,252,240,.85)';fctx.lineWidth=2.2;fctx.beginPath();fctx.moveTo(m.a.x,m.a.y);fctx.lineTo(m.b.x,m.b.y);fctx.stroke()}
    else{m.f=(m.f||1)-dt*.8;if(m.f>0){fctx.strokeStyle=`rgba(255,255,255,${m.f*.35})`;fctx.lineWidth=1;fctx.beginPath();fctx.moveTo(m.a.x,m.a.y);fctx.lineTo(m.b.x,m.b.y);fctx.stroke()}}});
  marks=marks.filter(m=>m.soft||m.f>0);
  drops.forEach(d=>{d.t+=dt;const y=d.y0+(d.y-d.y0)*Math.min(1,(d.t/.35)**2);fctx.fillStyle='rgba(235,240,220,.9)';fctx.beginPath();fctx.ellipse(d.x,y,4,6,0,0,7);fctx.fill();if(d.t>=.35&&!d.done){d.done=1;landDrop(d)}});
  drops=drops.filter(d=>!d.done);
  bubbles.forEach(b=>{if(b.delay>0){b.delay-=dt;return}b.life+=dt;b.y+=b.vy*dt;b.x+=(Math.random()-.5)*12*dt*10;
    if(b.sand){fctx.fillStyle='rgba(225,205,160,.9)';fctx.beginPath();fctx.arc(b.x,b.y,b.r,0,7);fctx.fill();return}
    const a=1-b.life/b.max;fctx.strokeStyle=`rgba(255,255,255,${.95*a})`;fctx.lineWidth=1.6;fctx.beginPath();fctx.arc(b.x,b.y,b.r,0,7);fctx.stroke();fctx.fillStyle=`rgba(255,255,255,${.25*a})`;fctx.fill()});
  bubbles=bubbles.filter(b=>b.life<b.max);
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);
window.addEventListener('resize',()=>sizeFx());

/* ---------- field guide ---------- */
function buildGuide(){const g=$('#guideGrid');g.innerHTML='';
  ORDER.forEach(id=>{const R=ROCKS[id];const c=document.createElement('article');c.className='gcard paper';
    c.innerHTML=`<button class="gphoto" style="background-image:url(assets/field-${id}.jpg)" aria-label="See photo"><span class="where">📍 ${R.where}</span><span class="spec"><img src="assets/${id}.webp" alt=""></span></button>
      <div class="gbody"><h3>${R.name.split(' (')[0]}<span class="chip ${R.type}">${TYPES[R.type].name}</span></h3>
      <p class="look">Hunt tip: ${R.hunt}</p><p>${R.whereText}</p>
      <button class="found-btn ${found.has(id)?'on':''}" data-id="${id}">${found.has(id)?'Found it!':'I found one!'}</button></div>`;
    onTap($('.found-btn',c),e=>{const b=e.currentTarget;if(found.has(id)){found.delete(id)}else{found.add(id);chime();toast(`You found ${R.name.split(' (')[0]}! ⭐`)}
      LS.set('rocklab.found',[...found]);b.classList.toggle('on',found.has(id));b.textContent=found.has(id)?'Found it!':'I found one!';countFound()});onTap(
    $('.gphoto',c),()=>openModal(`<button class="mx" aria-label="Close">×</button><h2>${R.name.split(' (')[0]}</h2><img src="assets/field-${id}.jpg" alt="" style="width:100%;border-radius:14px;max-height:60vh;object-fit:contain;background:#111"><p style="font-size:15px;margin-top:8px">${FIELD_CAP[id]}</p>`));
    g.appendChild(c)});countFound()}
function countFound(){$('#foundCount').textContent=`${found.size} of 8 found`}
$$('.tab').forEach(b=>onTap(b,()=>{$$('.tab').forEach(x=>x.classList.toggle('on',x===b));$$('.view').forEach(v=>v.classList.toggle('on',v.id===b.dataset.tab));if(b.dataset.tab==='lab')sizeFx()}));

/* ---------- credits ---------- */onTap(
$('#creditsBtn'),()=>openModal(`<button class="mx" aria-label="Close">×</button><div class="credits"><h2>Photo credits</h2><ul>${(window.CREDITS||[]).map(c=>`<li><b>${c.title.replace(/\.(jpe?g|png|tif)$/i,'')}</b> — ${c.artist}. ${c.license}${c.licurl?` (<a href="${c.licurl}" target="_blank" rel="noopener">license</a>)`:''}. <a href="${c.page}" target="_blank" rel="noopener">Source</a>${c.note?'. '+c.note:''}</li>`).join('')}<li>Sounds are made in the browser. Fonts: Fraunces and Nunito (SIL Open Font License).</li></ul></div>`));

buildGuide(); refreshDrawer(); pick('granite');
window.__ready=true;
