'use strict';
(()=>{
const STEPS=[
 {id:'keel',name:'Keel',bb:'190 415 480 30',say:'First, the keel. It is the backbone of the ship. A long, strong beam along the bottom.',photo:'real-keel.jpg',psay:'This is a real ship being built in Norway. The long beam at the bottom is the keel.'},
 {id:'ribs',name:'Ribs',bb:'190 290 480 150',say:'Next, the ribs. They give the ship its shape, just like the ribs in your body.',photo:'real-ribs.jpg',psay:'These are real wooden ribs, fitted onto the keel. Can you see the curve?'},
 {id:'planks',name:'Planks',bb:'175 285 500 155',say:'Now the planks. Builders bend long boards around the ribs to make the hull. They stuff the cracks so no water gets in.'},
 {id:'deck',name:'Deck',bb:'170 250 510 70',say:'The deck is the floor on top, where sailors walk. The captain\u2019s cabin is at the back.'},
 {id:'masts',name:'Masts',bb:'360 40 420 270',say:'Stand up the masts! These tall poles will hold the sails.'},
 {id:'sails',name:'Sails',bb:'300 60 470 230',say:'Tie on the sails. They catch the wind, like a kite.'},
 {id:'rudder',name:'Rudder',bb:'150 320 70 130',say:'The rudder goes at the back, under the water. It steers the ship left and right.'},
 {id:'flag',name:'Flag',bb:'370 10 80 55',say:'Last, raise the flag! Our ship is ready to launch.'}
];
const sheer=x=>{const t=(x-180)/(665-180);return (1-t)*(1-t)*300+2*(1-t)*t*326+t*t*292};
const HULL='M180 300 Q422 326 665 292 L642 352 Q626 424 598 433 L214 433 Q194 420 188 380 Z';
let ribs='';for(let x=232;x<=604;x+=31){const top=sheer(x)+2,bot=x>560?433-(x-560)*.9:433;const bow=x>540?(x-540)*.18:0;ribs+=`<path d="M${x} ${bot} C${x-6-bow} ${(top+bot)/2+10} ${x-4-bow} ${top+14} ${x+(x>540?-4:0)} ${top}" />`}
let strakes='';for(let i=0;i<9;i++){const y0=300+i*15;strakes+=`<path d="M175 ${y0+8} Q422 ${y0+34-i*1.2} 680 ${y0+i*4-4}" />`}
let rail='';for(let x=196;x<=650;x+=22){const y=sheer(x);rail+=`<path d="M${x} ${y} v-14"/>`}
const SAIL=(x1,y1,x2,y2,w,b)=>`<path d="M${x1-w/2} ${y1} L${x1+w/2} ${y1} C${x2+w*.56+b} ${(y1+y2)/2} ${x2+w*.58+b} ${y2-8} ${x2+w*.6} ${y2} L${x2-w*.6} ${y2} C${x2-w*.58+b} ${y2-8} ${x2-w*.56+b} ${(y1+y2)/2} ${x1-w/2} ${y1}Z" fill="url(#sailG)" stroke="#bfae8a" stroke-width="1.5"/>`;
const svg=`<svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid meet" id="yardSvg">
<defs>
 <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fbfe8"/><stop offset=".7" stop-color="#d9eef6"/><stop offset="1" stop-color="#f2efe2"/></linearGradient>
 <linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a8fc4"/><stop offset="1" stop-color="#114a75"/></linearGradient>
 <linearGradient id="groundG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b89b6c"/><stop offset="1" stop-color="#7d6440"/></linearGradient>
 <linearGradient id="hullShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
 <linearGradient id="sailG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9cfb4"/><stop offset=".45" stop-color="#fbf6e8"/><stop offset="1" stop-color="#cfc3a3"/></linearGradient>
 <linearGradient id="mastG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b4423"/><stop offset=".5" stop-color="#b98652"/><stop offset="1" stop-color="#5d3a1d"/></linearGradient>
 <pattern id="plankP" width="90" height="15" patternUnits="userSpaceOnUse"><rect width="90" height="15" fill="#8e5d33"/><rect width="90" height="1.6" y="13.4" fill="#4a2c14"/><rect x="58" width="1.4" height="15" fill="#5a361a" opacity=".7"/><circle cx="62" cy="7" r="1.1" fill="#3a2410"/><circle cx="20" cy="7" r="1.1" fill="#3a2410"/></pattern>
 <filter id="grain" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.35" numOctaves="3" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .25  0 0 0 0 .14  0 0 0 0 .05  0 0 0 .9 -.2" result="c"/><feComposite in="c" in2="SourceGraphic" operator="in" result="g"/><feBlend in="SourceGraphic" in2="g" mode="multiply"/></filter>
 <filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>
 <clipPath id="hullClip"><path d="${HULL}"/></clipPath>
</defs>
<rect x="-500" y="-700" width="2400" height="1260" fill="#7fbfe8"/><rect x="-500" y="0" width="2400" height="560" fill="url(#skyG)"/>
<g filter="url(#soft)" opacity=".85"><ellipse cx="180" cy="90" rx="90" ry="22" fill="#fff"/><ellipse cx="240" cy="78" rx="60" ry="22" fill="#fff"/><ellipse cx="760" cy="60" rx="110" ry="20" fill="#fff"/><ellipse cx="840" cy="50" rx="60" ry="18" fill="#fff"/></g>
<circle cx="880" cy="110" r="34" fill="#fff6d0"/><circle cx="880" cy="110" r="52" fill="#fff6d0" opacity=".3"/>
<path d="M-500 350 Q-300 310 -150 345 T0 360 Q120 300 260 340 T520 330 T780 320 T1000 335 T1300 325 T1600 340 T1900 330 V420 H-500Z" fill="#87a88c" opacity=".55"/>
<path d="M-500 380 Q-330 345 -160 372 T0 380 Q160 340 330 370 T700 360 T1000 370 T1400 365 T1900 372 V430 H-500Z" fill="#6f9576" opacity=".6"/>
<rect x="-500" y="420" width="2400" height="900" fill="#114a75"/><rect x="-500" y="420" width="2400" height="140" fill="url(#seaG)"/>
<g class="sea-lines" stroke="#cfe9f7" stroke-width="2" fill="none" opacity=".5"><path d="M520 450 q15 -6 30 0 t30 0 t30 0 M700 480 q15 -6 30 0 t30 0 M860 455 q15 -6 30 0 t30 0 t30 0 M600 520 q15 -6 30 0 t30 0 t30 0 M820 530 q15 -6 30 0 t30 0"/></g>
<path d="M-500 410 L520 410 L1468 1200 L-500 1200Z" fill="#7d6440"/><path d="M-500 410 L520 410 L700 560 L-500 560Z" fill="url(#groundG)"/>
<g stroke="#5a4428" stroke-width="2" opacity=".5"><path d="M-500 430h1040M-500 455h1060M-500 482h1090M-500 510h1125M-500 538h1150M-500 570h1190M-500 610h1240M-500 650h1290"/></g>
<path d="M150 446 L560 446 L830 620" stroke="#4b3a26" stroke-width="10" fill="none"/><path d="M150 452 L556 452 L822 620" stroke="#8a6a43" stroke-width="3" fill="none"/>
<g fill="#6b4a2a" stroke="#3e2a16" stroke-width="2"><rect x="230" y="433" width="40" height="14"/><rect x="340" y="433" width="40" height="14"/><rect x="450" y="433" width="40" height="14"/><rect x="545" y="433" width="36" height="14"/></g>
<g id="ghost" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="8 7" opacity=".85">
  <path d="${HULL}"/><path d="M380 312 V62 M520 305 V92 M650 296 L770 250"/><path d="M196 345 L170 350 L176 440 L206 436"/>
</g>
<g id="ship">
 <g class="slot" id="slot-rudder"><g id="g-rudder"><path d="M196 336 L164 344 Q158 400 172 446 L206 438 Z" fill="#7a4e28" stroke="#3e2512" stroke-width="2.5" filter="url(#grain)"/><path d="M178 352 v80" stroke="#3e2512" stroke-width="2" opacity=".6"/><rect x="170" y="352" width="30" height="6" fill="#2c2c2c"/><rect x="172" y="404" width="30" height="6" fill="#2c2c2c"/><path d="M198 300 L150 288" stroke="#5d3a1d" stroke-width="7" stroke-linecap="round"/></g></g>
 <g class="slot" id="slot-ribs"><g id="g-ribs" stroke="#a7743f" stroke-width="10" fill="none" stroke-linecap="round">${ribs}<g stroke="#6e4522" stroke-width="2.5">${ribs}</g></g></g>
 <g class="slot" id="slot-planks"><g id="g-planks"><g clip-path="url(#hullClip)"><rect x="170" y="280" width="510" height="160" fill="url(#plankP)" filter="url(#grain)"/><g stroke="#4a2c14" stroke-width="1.6" fill="none" opacity=".75">${strakes}</g><rect x="170" y="280" width="510" height="160" fill="url(#hullShade)"/><path d="M175 314 Q422 340 680 304" stroke="#2c1a0d" stroke-width="9" fill="none"/><path d="M175 323 Q422 349 680 314" stroke="#d6a548" stroke-width="5" fill="none"/></g><path d="${HULL}" fill="none" stroke="#3a2410" stroke-width="3"/>
   <g fill="#1f150c">${[250,300,350,400,450,500,550].map(x=>`<rect x="${x}" y="${sheer(x)+20}" width="18" height="14" rx="2"/>`).join('')}</g></g></g>
 <g class="slot" id="slot-keel"><g id="g-keel"><path d="M200 426 H608 Q632 420 646 360 L668 286 L678 288 L654 364 Q640 434 608 440 H200 Z" fill="#5d3a1d" stroke="#2d1a0b" stroke-width="2.5" filter="url(#grain)"/><path d="M200 428 L186 300 L196 298 L210 428Z" fill="#5d3a1d" stroke="#2d1a0b" stroke-width="2.5"/></g></g>
 <g class="slot" id="slot-deck"><g id="g-deck"><path d="M182 300 Q422 326 668 292 L666 284 Q422 318 180 292Z" fill="#c99a5f" stroke="#6b4423" stroke-width="2"/><g stroke="#6b4423" stroke-width="3" stroke-linecap="round">${rail}</g><path d="M182 286 Q422 312 668 278" stroke="#6b4423" stroke-width="4" fill="none"/>
   <path d="M178 300 L180 252 L292 252 L296 306 Z" fill="#7d4f28" stroke="#3a2410" stroke-width="2.5" filter="url(#grain)"/><path d="M174 252 H298" stroke="#3a2410" stroke-width="5"/><g fill="#f5d77a" stroke="#3a2410" stroke-width="2"><rect x="196" y="266" width="18" height="18" rx="3"/><rect x="226" y="266" width="18" height="18" rx="3"/><rect x="256" y="266" width="18" height="18" rx="3"/></g></g></g>
 <g class="slot" id="slot-masts"><g id="g-masts"><rect x="373" y="56" width="14" height="258" fill="url(#mastG)"/><rect x="514" y="88" width="12" height="220" fill="url(#mastG)"/><path d="M650 294 L772 248" stroke="#7a4e28" stroke-width="9" stroke-linecap="round"/>
   <g stroke="#5d3a1d" stroke-width="6" stroke-linecap="round"><path d="M318 120 H442 M300 205 H460 M470 145 H570 M456 222 H584"/></g><rect x="368" y="96" width="24" height="8" fill="#5d3a1d"/><rect x="510" y="130" width="20" height="7" fill="#5d3a1d"/>
   <g stroke="#3d3022" stroke-width="1.3" opacity=".75" fill="none"><path d="M380 60 L196 296 M380 60 L560 300 M520 92 L770 250 M520 92 L430 306 M380 60 L520 92"/></g></g></g>
 <g class="slot" id="slot-sails"><g id="g-sails">${SAIL(380,122,380,200,118,6)}${SAIL(380,208,380,292,150,8)}${SAIL(520,147,520,217,94,6)}${SAIL(520,224,520,290,120,7)}
   <path d="M522 100 L764 252 Q640 250 540 286 Q560 190 522 100Z" fill="url(#sailG)" stroke="#bfae8a" stroke-width="1.5"/><g stroke="#cbbd99" stroke-width="1" opacity=".8"><path d="M340 140 v58 M360 136 v64 M400 136 v64 M420 140 v58 M330 222 v68 M355 220 v72 M405 220 v72 M430 222 v68 M490 162 v52 M550 162 v52 M480 238 v50 M560 238 v50"/></g></g></g>
 <g class="slot" id="slot-flag"><g id="g-flag"><path d="M380 56 V18" stroke="#3a2410" stroke-width="3"/><path class="flagwave" d="M382 18 C398 12 410 26 428 18 C440 13 446 18 446 18 L446 44 C440 44 434 38 422 44 C406 52 396 38 382 44 Z" fill="#c0392b"/><path d="M382 26 C398 20 410 34 428 26 C440 21 446 26 446 26 M382 34 C398 28 410 42 428 34 C440 29 446 34 446 34" stroke="#fff" stroke-width="3" fill="none"/><rect x="382" y="18" width="24" height="14" fill="#1f3a8a"/></g></g>
</g>
<path id="frontWater" d="M520 424 L1900 424 L1900 1200 L1468 1200 Z" fill="#1d6aa0" opacity="0"/><g id="splashG" opacity="0"><g fill="#e6f6ff">${Array.from({length:16},(_,i)=>`<circle cx="${760+Math.cos(i)*80*Math.random()}" cy="${440-Math.random()*70}" r="${4+Math.random()*8}"/>`).join('')}</g></g>
</svg>
<button class="launch-btn" id="launchBtn" aria-label="Launch the ship"><svg><use href="#i-right"/></svg><svg><use href="#i-drop"/></svg></button>
<button class="round-btn again" id="buildAgain" aria-label="Build again"><svg><use href="#i-reset"/></svg></button>`;
$('#yard').innerHTML=svg;
const tray=$('#partsTray');
const order=[0,1,2,3,4,5,6,7];
tray.innerHTML=STEPS.map((s,i)=>`<button class="part-card" data-i="${i}" aria-label="${s.name}"><svg viewBox="${s.bb}"><use href="#g-${s.id}"/></svg><span class="pnum">${i+1}</span></button>`).join('');
let step=0;
function refresh(){$$('.part-card',tray).forEach((c,i)=>{c.classList.toggle('done',i<step);c.classList.toggle('next',i===step)});STEPS.forEach((s,i)=>$('#slot-'+s.id).classList.toggle('on',i<step));
  $('#ghost').style.opacity=step>=STEPS.length?0:.85;$('#launchBtn').classList.toggle('show',step>=STEPS.length&&!launched);$('#tbExtra').innerHTML=CUR==='build'?`<span class="count"><svg><use href="#i-hammer"/></svg>${Math.min(step,8)}/8</span>`:''}
function place(i){const s=STEPS[i];if(i<step)return;
  if(i!==step){SFX.oops();const nx=$(`.part-card[data-i="${step}"]`,tray);nx.classList.remove('nudge');void nx.offsetWidth;nx.classList.add('nudge');speak(`Not yet! First we need the ${STEPS[step].name.toLowerCase()}.`);return false}
  step++;refresh();const sl=$('#slot-'+s.id);sl.classList.add('drop');setTimeout(()=>sl.classList.remove('drop'),900);
  if(s.id==='sails')SFX.flap();else if(s.id==='flag')SFX.whoosh();else SFX.hammer(s.id==='planks'?5:3);
  speak(s.say);
  if(s.photo)setTimeout(()=>showPhoto(s),2600);
  if(step===STEPS.length)setTimeout(()=>{SFX.chime();$('#launchBtn').classList.add('show')},900);
  return true}
function showPhoto(s){if(CUR!=='build')return;const p=$('#photoPop');$('img',p).src='assets/'+s.photo;p.classList.add('show');p.dataset.say=s.psay;speak(s.psay,$('.mini-speak',p));clearTimeout(showPhoto.t);showPhoto.t=setTimeout(()=>p.classList.remove('show'),9000)}
onTap($('#photoPop img'),()=>$('#photoPop').classList.remove('show'));
onTap($('#photoPop .mini-speak'),()=>speak($('#photoPop').dataset.say,$('#photoPop .mini-speak')));
// drag or tap parts
let ghost=null;
$$('.part-card',tray).forEach(card=>{card.addEventListener('pointerdown',e=>{unlockAudio();const i=+card.dataset.i;if(i<step)return;e.preventDefault();const sx=e.clientX,sy=e.clientY;let moved=false;card.setPointerCapture(e.pointerId);
  const mv=ev=>{if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>12){moved=true;ghost=card.cloneNode(true);ghost.className='part-card drag-ghost';document.body.appendChild(ghost)}if(ghost){ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px'}};
  const up=ev=>{card.removeEventListener('pointermove',mv);card.removeEventListener('pointerup',up);card.removeEventListener('pointercancel',up);
    if(ghost){ghost.remove();ghost=null;const r=$('#yard').getBoundingClientRect();if(ev.clientX>r.left&&ev.clientX<r.right&&ev.clientY>r.top&&ev.clientY<r.bottom)place(i)}else if(!moved){place(i)}};
  card.addEventListener('pointermove',mv);card.addEventListener('pointerup',up);card.addEventListener('pointercancel',up)})});
let launched=false;
onTap($('#launchBtn'),()=>{if(launched)return;launched=true;$('#launchBtn').classList.remove('show');stopSpeak();SFX.creak();const sh=$('#ship');sh.classList.add('launch');pan(0,330,2300);
  setTimeout(()=>{SFX.splash(1.5);const sp=$('#splashG');sp.classList.remove('go');void sp.getBoundingClientRect();sp.classList.add('go')},1900);
  setTimeout(()=>{sh.classList.add('afloat');SFX.horn(1.8,98);confetti(60);speak('Splash! Your ship is floating. Hooray! Real ships are launched just like this, sliding down into the water.')},2600);
  setTimeout(()=>$('#buildAgain').classList.add('show'),4200)});
onTap($('#buildAgain'),()=>{SFX.tap();launched=false;step=0;const sh=$('#ship');sh.classList.remove('launch','afloat');pan(330,0,600);$('#buildAgain').classList.remove('show');refresh();speak(VIEWS.build.help)});
const VB=()=>innerWidth<innerHeight?[140,60,720,500]:[0,0,1000,560];function setVB(off){const v=VB();$('#yardSvg').setAttribute('viewBox',`${v[0]+off} ${v[1]} ${v[2]} ${v[3]}`)}
addEventListener('resize',()=>setVB(launched?330:0));
function pan(a,b,ms){const t0=performance.now();(function f(t){const k=clamp((t-t0)/ms,0,1),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;setVB(a+(b-a)*e);if(k<1)requestAnimationFrame(f)})(t0)}
refresh();
registerView('build',{t:'Build a Ship',ico:'i-hammer',help:()=>step>=STEPS.length?'Tap the big button to launch your ship!':`Build a wooden ship, one part at a time. Drag the glowing part onto the ship, or just tap it. Next is the ${STEPS[Math.min(step,7)].name.toLowerCase()}.`,
  enter(){refresh();setVB(launched?330:0)},leave(){$('#photoPop').classList.remove('show')}});
window.BUILD={get step(){return step},place};
})();
