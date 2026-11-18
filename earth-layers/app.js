'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
let __lastTap=0;
function onTap(el,fn){let d=null;el.addEventListener('pointerdown',e=>{d={x:e.clientX,y:e.clientY,id:e.pointerId}});
  el.addEventListener('pointerup',e=>{if(d&&d.id===e.pointerId&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<14){__lastTap=Date.now();fn(e)}d=null});
  el.addEventListener('pointercancel',()=>d=null);el.addEventListener('click',e=>{if(Date.now()-__lastTap<700)return;fn(e)})}
const L=[
 {id:'surface',name:'The Surface',depth:'0 km down',temp:'50°F',r:100},
 {id:'soil',name:'Soil',range:'0 to 2 meters',depth:'1 meter down',temp:'55°F',tex:'soil',r:99.6,
  text:'Soil is rock that has been broken into tiny bits, mixed with old leaves and roots. Worms, ants, and roots live here. It is the only layer where things grow!',
  utah:'<b>Utah clue:</b> Look up at the mountains above Spanish Fork and American Fork. See the long flat shelves? Those are old beaches of <b>Lake Bonneville</b>, a giant lake that once covered our whole valley.',
  find:{img:'find-bonneville.jpg',title:'An old lake beach!',text:'This flat bench above American Fork Canyon was the shoreline of Lake Bonneville. Dig into a bench and you find smooth, round beach pebbles, far from any lake today.',cap:'American Fork Canyon and the Bonneville terrace, U.S. Geological Survey'}},
 {id:'lake',name:'Lake Mud & Ice Age Bones',range:'2 to 100 meters',depth:'50 meters down',temp:'55°F',tex:'lake',r:99.2,
  text:'Under the soil are layers of mud and sand that settled at the bottom of Lake Bonneville. During the Ice Age, giant animals walked here.',
  utah:'<b>Utah clue:</b> In 1988, workers building a dam high in Huntington Canyon found the bones of a mammoth, almost 9,000 feet up the mountain!',
  find:{img:'find-mammoth.jpg',title:'A Columbian mammoth!',text:'Mammoths were giant cousins of elephants, with long curved tusks. This one was found in Utah and now stands in a museum in Price.',cap:'Huntington Mammoth, Prehistoric Museum, Price, Utah'}},
 {id:'sediment',name:'Layers of Sedimentary Rock',range:'100 meters to 3 km',depth:'1 km down',temp:'85°F',tex:'sediment',r:98.6,
  text:'Deeper down, the sand and mud have been pressed into rock: sandstone, shale, and limestone, stacked like the pages of a giant book. The oldest pages are at the bottom.',
  utah:'<b>Utah clue:</b> Canyon walls are a window into these layers. In Provo Canyon and Spanish Fork Canyon you can see stripes of rock that formed long, long ago.',
  find:{img:'find-bones.jpg',title:'Dinosaur bones!',text:'Some sedimentary layers hold dinosaur bones. At Dinosaur National Monument in eastern Utah, you can touch a whole wall of real bones still in the rock.',cap:'The Wall of Bones, Dinosaur National Monument, Utah'},
  extra:{img:'canyon-layers.jpg',cap:'Provo Canyon, photographed by C. R. Savage in the 1800s'}},
 {id:'sea',name:'An Ancient Sea Floor',range:'deeper layers',depth:'2 km down',temp:'110°F',tex:'sea',r:98.2,
  text:'Long before dinosaurs, a warm, shallow sea covered western Utah. Shells and tiny sea creatures piled up on the sea floor and turned into limestone and shale.',
  utah:'<b>Utah clue:</b> Rock hunters still find these sea creatures, called trilobites, in the hills near Delta, Utah.',
  find:{img:'find-trilobite.webp',cutout:1,title:'A trilobite!',text:'Trilobites crawled on the sea floor over 500 million years ago. They had hard shells and many legs, a little like a pill bug. This one is from Utah.',cap:'Elrathia kingii trilobite, Wheeler Shale, Utah'}},
 {id:'bedrock',name:'Granite Bedrock',range:'3 to 15 km',depth:'10 km down',temp:'400°F',tex:'granite',r:97.4,
  text:'Below the layers is hard bedrock. Much of it is granite, made when hot melted rock cooled very slowly deep underground. It is hot down here, hotter than an oven!',
  utah:'<b>Utah clue:</b> Granite from Little Cottonwood Canyon was carried by ox teams to build the Salt Lake Temple.',
  find:{img:'find-granite.jpg',title:'Speckled granite',text:'See the salt-and-pepper specks? Those are crystals that grew as the rock cooled. Big crystals mean it cooled slowly, deep underground.',cap:'Granite boulder in Little Cottonwood Canyon'}},
 {id:'crust',name:'The Deep Crust',range:'15 to 40 km',depth:'30 km down',temp:'1,000°F',tex:'gneiss',r:96.5,
  text:'The crust is Earth’s rocky skin. Down at its bottom, rocks are squeezed and heated so much that they slowly bend into stripes without melting.',
  utah:'<b>Did you know?</b> The crust under us is about 25 miles thick. Compared to the whole Earth, that is thinner than the skin on an apple!',
  find:{img:'find-gneiss.jpg',title:'Striped gneiss',text:'Gneiss (you say “nice”) is a metamorphic rock. Heat and pressure squeezed its minerals into wavy bands.',cap:'Gneiss, photographed by James St. John'}},
 {id:'mantle',name:'The Mantle',range:'40 to 2,900 km',depth:'1,000 km down',temp:'3,000°F',tex:'mantle',r:75,
  text:'The mantle is the biggest layer of all. Its rock is so hot it can flow, very, very slowly, like super thick taffy. Where it melts, magma rises up to make volcanoes.',
  utah:'<b>Did you know?</b> Volcanoes sometimes carry chunks of the mantle up to the surface. The green rock in the dig spot came from the mantle!',
  find:{img:'find-peridotite.webp',cutout:1,title:'A piece of the mantle!',text:'The green crystals are olivine, in a mantle rock called peridotite. A volcano carried it up inside dark lava rock.',cap:'Peridotite mantle xenolith in basalt, James St. John'},
  extra:{img:'find-lava.jpg',cap:'Glowing lava, U.S. Geological Survey'}},
 {id:'outer',name:'The Outer Core',range:'2,900 to 5,150 km',depth:'4,000 km down',temp:'8,000°F',tex:'outer',r:40,
  text:'Now we reach liquid metal! The outer core is melted iron and nickel, swirling around and around as Earth spins.',
  utah:'<b>Did you know?</b> The swirling iron makes Earth a giant magnet. That is why a compass needle points north!',
  find:{img:'find-aurora.jpg',title:'The northern lights',text:'Earth’s magnetic field shields us from wind from the sun. Near the poles, some of that wind sneaks in and lights up the sky in green curtains.',cap:'Aurora over Alaska, U.S. Air Force'}},
 {id:'inner',name:'The Inner Core',range:'5,150 to 6,371 km',depth:'6,371 km: the center!',temp:'9,400°F',tex:'inner',r:12,
  text:'You made it to the center! The inner core is a solid ball of iron and nickel, about as hot as the surface of the sun. It stays solid because the weight of the whole Earth presses on it.',
  utah:'<b>How far?</b> If you could drive straight down at freeway speed, it would take almost 3 days to get here!',
  find:{img:'find-iron.jpg',title:'An iron meteorite',text:'Nobody can visit the core. But some meteorites that fall from space are made of iron and nickel, much like Earth’s core.',cap:'Iron meteorite, photographed by Daderot'}}
];
/* audio */
let AC=null;function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
window.addEventListener('pointerdown',()=>ac(),{once:true});
let scrapeG=null;
function scrapeOn(){const a=ac();if(!a||scrapeG)return;const b=a.createBuffer(1,a.sampleRate*2,a.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const s=a.createBufferSource();s.buffer=b;s.loop=true;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=1400;f.Q.value=.7;scrapeG=a.createGain();scrapeG.gain.value=0;s.connect(f).connect(scrapeG).connect(a.destination);s.start()}
function scrape(v){scrapeOn();if(scrapeG&&AC)scrapeG.gain.setTargetAtTime(v,AC.currentTime,.03)}
function chime(){const a=ac();if(!a)return;const t=a.currentTime;[659,784,988,1319].forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain();o.frequency.value=f;g.gain.setValueAtTime(0,t+i*.08);g.gain.linearRampToValueAtTime(.12,t+i*.08+.01);g.gain.exponentialRampToValueAtTime(.0001,t+i*.08+1);o.connect(g).connect(a.destination);o.start(t+i*.08);o.stop(t+i*.08+1.1)})}
function rumble(){const a=ac();if(!a)return;const t=a.currentTime;const o=a.createOscillator(),g=a.createGain();o.type='triangle';o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(40,t+.8);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.0001,t+.9);o.connect(g).connect(a.destination);o.start(t);o.stop(t+1)}
/* speech */
let voice=null;function pickVoice(){const vs=speechSynthesis.getVoices();voice=vs.find(v=>/Samantha|Karen|Moira|Daniel/.test(v.name))||vs.find(v=>/^en[-_]US/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
function speak(text,btn){if(!('speechSynthesis' in window)){toast('Reading aloud is not available here');return}
  if(speechSynthesis.speaking){speechSynthesis.cancel();$$('.speaking').forEach(b=>b.classList.remove('speaking'));if(btn&&btn._on){btn._on=false;return}}
  const u=new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g,'').replace(/\s+/g,' '));if(voice)u.voice=voice;u.rate=.92;
  if(btn){btn.classList.add('speaking');btn._on=true;u.onend=u.onerror=()=>{btn.classList.remove('speaking');btn._on=false}}speechSynthesis.speak(u)}
let toastT;function toast(m,ms=2400){const t=$('#toast');t.innerHTML=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),ms)}
const readSvg='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1A9 9 0 0 0 14 3.2z"/></svg>';
/* build */
const J=$('#journey');const found=new Set(JSON.parse(localStorage.getItem('el.found')||'[]'));
L.forEach((l,i)=>{const s=document.createElement('section');s.className='layer '+l.id;s.id='L-'+l.id;s.dataset.i=i;
  if(l.id==='surface'){s.style.background=`url(assets/surface.jpg) center/cover`;
    s.innerHTML=`<div class="info"><div class="tag">Spanish Fork, Utah · Field Trip</div><h1>Dig to the Center of the Earth</h1>
      <p>Grab your shovel! We are going to dig straight down, through soil, old lake beds, and solid rock, all the way to the hot iron center. At every layer, rub the dig spot to find a treasure.</p>
      <div class="btns"><button class="pill start">Start digging ↓</button><button class="pill ghost read">${readSvg}Read to me</button></div></div>
      <button class="creditsBtn">Photo credits</button>`;}
  else{s.style.backgroundImage=`url(assets/tex-${l.tex}.jpg)`;
    s.innerHTML=`<div class="info"><div class="tag">Layer ${i} of ${L.length-1}</div><h2>${l.name}</h2>
      <div class="chips"><span class="chip">↓ ${l.range}</span><span class="chip">🌡 ${l.temp}</span></div>
      <p>${l.text}</p><p class="utah">${l.utah}</p>
      <div class="btns"><button class="pill ghost read">${readSvg}Read to me</button></div></div>
      <div class="dig"><div class="spot"><img class="${l.find.cutout?'cutout':''}" src="assets/${l.find.img}" alt="${l.find.title}" draggable="false"><canvas></canvas><div class="hint"><i>☝️</i>Rub to dig!</div></div>
      <div class="found"><b>${l.find.title}</b><p>${l.find.text}</p><div class="cap">${l.find.cap}</div></div></div>`}
  if(i<L.length-1){const n=document.createElement('div');n.className='next';n.innerHTML=`<button class="pill ghost">${i===0?'':'Dig deeper ↓'}</button>`;if(i>0)s.appendChild(n)}
  else{const n=document.createElement('div');n.className='next';n.innerHTML='<button class="pill up">Back to the surface ↑</button>';s.appendChild(n)}
  J.appendChild(s)});
function go(i){const s=$$('.layer')[i];if(s){J.scrollTo({top:s.offsetTop,behavior:'smooth'});rumble()}}
$$('.layer').forEach((s,i)=>{const n=$('.next .pill',s);if(n)onTap(n,()=>go(n.classList.contains('up')?0:i+1));
  const r=$('.read',s);if(r)onTap(r,()=>{const l=L[i];speak(i===0?$('p',s).textContent:`${l.name}. ${l.text} ${l.utah}${found.has(l.id)?' '+l.find.title+' '+l.find.text:''}`,r)})});
onTap($('.start'),()=>go(1));
onTap($('.creditsBtn'),()=>{$('#card').innerHTML=`<button class="mx" aria-label="Close">×</button><h2>Photo credits</h2><ul>${(window.CREDITS||[]).map(c=>`<li><b>${c.title.replace(/\.(jpe?g|png|tif)$/i,'')}</b> — ${c.artist||'Unknown'}. ${c.license}${c.licurl?` (<a href="${c.licurl}" target="_blank" rel="noopener">license</a>)`:''}. <a href="${c.page}" target="_blank" rel="noopener">Source</a>${c.note?'. '+c.note:''}</li>`).join('')}<li>Layer textures are drawn in code. Sounds are made in the browser. Depths and temperatures are rounded. Fonts: Fraunces and Nunito (SIL OFL).</li></ul>`;
  $('#modal').classList.add('open');onTap($('.mx',$('#card')),()=>$('#modal').classList.remove('open'))});
$('#modal').addEventListener('pointerdown',e=>{if(e.target.id==='modal')e.currentTarget.classList.remove('open')});
/* scratch spots */
function setupSpot(sec,l){const spot=$('.spot',sec);if(!spot)return;const cv=$('canvas',spot),ctx=cv.getContext('2d');const tex=new Image();tex.src=`assets/tex-${l.tex}.jpg`;
  let W=0,H=0,dpr=1,strokes=0,last=null,opened=false;
  function paint(){const r=spot.getBoundingClientRect();if(!r.width)return;dpr=Math.min(2,window.devicePixelRatio||1);W=cv.width=Math.round(r.width*dpr);H=cv.height=Math.round(r.height*dpr);
    ctx.globalCompositeOperation='source-over';if(tex.complete&&tex.naturalWidth){const p=ctx.createPattern(tex,'repeat');ctx.fillStyle=p;ctx.save();ctx.scale(dpr*.6,dpr*.6);ctx.fillRect(0,0,W/dpr/.6,H/dpr/.6);ctx.restore()}else{ctx.fillStyle='#5a4030';ctx.fillRect(0,0,W,H)}
    const g=ctx.createRadialGradient(W/2,H/2,W*.1,W/2,H/2,W*.7);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.35)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
  function open(){if(opened)return;opened=true;spot.classList.add('open','started');$('.found',sec).classList.add('show');chime();scrape(0);found.add(l.id);localStorage.setItem('el.found',JSON.stringify([...found]));
    toast(`⭐ ${l.find.title}`);updateGauge()}
  if(found.has(l.id)){opened=true;spot.classList.add('open','started');$('.found',sec).classList.add('show')}
  tex.onload=()=>{if(!opened)paint()};
  new ResizeObserver(()=>{if(!opened)paint()}).observe(spot);
  const dig=(x,y)=>{const r=cv.getBoundingClientRect();const px=(x-r.left)*dpr,py=(y-r.top)*dpr;ctx.globalCompositeOperation='destination-out';
    const rad=Math.max(26,r.width*.075)*dpr;ctx.lineCap='round';ctx.lineWidth=rad*2;ctx.beginPath();ctx.moveTo(last?last[0]:px,last?last[1]:py);ctx.lineTo(px,py);ctx.stroke();last=[px,py];
    if(++strokes%8===0)check()};
  function check(){const d=ctx.getImageData(0,0,W,H).data;let clear=0,n=0;for(let i=3;i<d.length;i+=4*37){n++;if(d[i]<40)clear++}if(clear/n>.5)open()}
  cv.addEventListener('pointerdown',e=>{if(opened)return;ac();cv.setPointerCapture(e.pointerId);spot.classList.add('started');last=null;dig(e.clientX,e.clientY);scrape(.12)});
  cv.addEventListener('pointermove',e=>{if(opened||!cv.hasPointerCapture(e.pointerId))return;(e.getCoalescedEvents?e.getCoalescedEvents():[e]).forEach(v=>dig(v.clientX,v.clientY))});
  const end=()=>{last=null;scrape(0);if(!opened)check()};cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end)}
$$('.layer').forEach((s,i)=>{if(i>0)setupSpot(s,L[i])});
/* gauge globe */
const G=$('#globe');
G.innerHTML=`<defs><radialGradient id="gi"><stop offset="0" stop-color="#fff6d0"/><stop offset="1" stop-color="#ffc24a"/></radialGradient>
 <radialGradient id="go"><stop offset=".3" stop-color="#ffb03a"/><stop offset="1" stop-color="#e2641c"/></radialGradient>
 <radialGradient id="gm"><stop offset=".55" stop-color="#d4501a"/><stop offset="1" stop-color="#7a1d0c"/></radialGradient></defs>
 <circle cx="100" cy="100" r="96" fill="#5c4632"/><circle cx="100" cy="100" r="90" fill="url(#gm)"/><circle cx="100" cy="100" r="52" fill="url(#go)"/><circle cx="100" cy="100" r="19" fill="url(#gi)"/>
 <path d="M100 100 L100 2 A98 98 0 0 0 2 100 Z" fill="#2c6e9a" opacity=".0"/>
 <line x1="100" y1="4" x2="100" y2="100" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 3" opacity=".7"/>
 <g id="me"><circle cx="100" cy="4" r="8" fill="#fff" stroke="#1d140c" stroke-width="2.5"/><circle cx="100" cy="4" r="3.5" fill="#e53935"/></g>`;
function updateGauge(){const i=cur;const l=L[i];$('#gname').textContent=l.name.replace('Layers of ','');$('#gdepth').textContent=l.depth;$('#gtemp').textContent='🌡 '+l.temp+(found.size?` · ⭐ ${found.size}/${L.length-1}`:'');
  const y=100-(l.r/100)*96;$('#me').setAttribute('transform',`translate(0 ${y-4})`)}
let cur=0;
const secs=$$('.layer');let raf=0;
function onScroll(){raf=0;const y=J.scrollTop+J.clientHeight*.4;let i=0;secs.forEach((s,k)=>{if(s.offsetTop<=y)i=k});if(i!==cur){cur=i;updateGauge()}}
J.addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(onScroll)},{passive:true});
$('#me').style.transition='transform .6s cubic-bezier(.3,1.2,.4,1)';
updateGauge();
window.__ready=true;
