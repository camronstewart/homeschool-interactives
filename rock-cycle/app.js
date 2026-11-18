'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
let __lastTap=0;
function onTap(el,fn){let d=null;el.addEventListener('pointerdown',e=>{d={x:e.clientX,y:e.clientY,id:e.pointerId}});
  el.addEventListener('pointerup',e=>{if(d&&d.id===e.pointerId&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<16){__lastTap=Date.now();fn(e)}d=null});
  el.addEventListener('pointercancel',()=>d=null);el.addEventListener('click',e=>{if(Date.now()-__lastTap<700)return;fn(e)})}
const S={
 magma:{name:'Magma',fam:'magma',famLabel:'Melted rock',node:'magma',about:'Magma is rock so hot it has melted into a glowing liquid.'},
 granite:{name:'Granite',fam:'igneous',famLabel:'Igneous rock',node:'igneous',img:'granite.webp',about:'Granite has speckled crystals that grew as magma cooled slowly underground.'},
 sand:{name:'Sand',fam:'sediment',famLabel:'Sediment',node:'sediment',about:'Sand is rock broken into tiny grains.'},
 mud:{name:'Shells & Lime Mud',fam:'sediment',famLabel:'Sediment',node:'sediment',about:'On the sea floor, shells and lime mud pile up.'},
 sandstone:{name:'Sandstone',fam:'sedimentary',famLabel:'Sedimentary rock',node:'sedimentary',img:'sandstone.webp',about:'Sandstone is sand grains glued together.'},
 limestone:{name:'Limestone',fam:'sedimentary',famLabel:'Sedimentary rock',node:'sedimentary',img:'limestone.webp',about:'Limestone is made from shells and lime mud pressed into rock.'},
 quartzite:{name:'Quartzite',fam:'metamorphic',famLabel:'Metamorphic rock',node:'metamorphic',img:'quartzite.webp',about:'Quartzite is sandstone baked so hard the grains fused together.'},
 marble:{name:'Marble',fam:'metamorphic',famLabel:'Metamorphic rock',node:'metamorphic',img:'marble.webp',about:'Marble is limestone changed by heat and squeezing.'},
 gneiss:{name:'Gneiss',fam:'metamorphic',famLabel:'Metamorphic rock',node:'metamorphic',img:'gneiss.webp',about:'Gneiss (say “nice”) is granite squeezed into stripes.'}
};
const ORDER=['magma','granite','sand','sandstone','quartzite','mud','limestone','marble','gneiss'];
const N=k=>S[k].name.toLowerCase();
function rule(a,k){const s=S[k];
  if(a==='melt'){if(k==='magma')return{hint:'It’s already melted! Try Cool.'};return{to:'magma',say:`It got so hot deep underground that the ${N(k)} melted into glowing magma.`}}
  if(a==='cool'){if(k==='magma')return{to:'granite',say:'The magma cooled slowly, deep underground. Crystals grew big enough to see. Now it is granite, an igneous rock: made by fire!'};return{hint:`The ${N(k)} is already cool and hard. Try Melt first!`}}
  if(a==='weather'){if(k==='magma')return{hint:'Magma is too hot for rain! Cool it first.'};if(k==='sand')return{to:'mud',say:'The river carried the tiny pieces all the way to a warm sea. Sea creatures used minerals from the worn-away rock to build their shells. Now shells and lime mud pile up on the sea floor.'};if(k==='mud')return{hint:'It’s already in tiny pieces! Try Press.'};
    if(k==='limestone'||k==='marble')return{to:'mud',say:`Rain slowly wore the ${N(k)} away and washed it into the sea. Sea creatures used it to build their shells. Now shells and lime mud pile up on the sea floor.`};
    return{to:'sand',say:`Rain, ice, and wind broke the ${N(k)} into tiny grains. Rivers carried the sand away and dropped it in layers.`}}
  if(a==='press'){if(k==='magma')return{hint:'Magma is too hot! Cool it first.'};
    if(k==='sand')return{to:'sandstone',say:'Layer after layer piled on top. The heavy weight pressed the sand, and minerals glued the grains together. Now it is sandstone, a sedimentary rock: made in layers!'};
    if(k==='mud')return{to:'limestone',say:'More layers piled on top and pressed the shells and lime mud into hard rock. Now it is limestone, a sedimentary rock!'};
    return{hint:'Press only works on loose sand or mud. Try Weather first!'}}
  if(a==='heat'){if(k==='magma')return{hint:'Magma is already melted! Try Cool.'};if(s.fam==='sediment')return{hint:'Press it into rock first!'};
    if(k==='sandstone')return{to:'quartzite',say:'Deep underground, heat and squeezing baked the sandstone until its grains fused together. Now it is quartzite, a metamorphic rock: changed!'};
    if(k==='limestone')return{to:'marble',say:'Heat and squeezing changed the limestone into sparkly marble, a metamorphic rock!'};
    if(k==='granite')return{to:'gneiss',say:'Heat and squeezing pushed the granite’s crystals into stripes. Now it is gneiss, a metamorphic rock!'};
    return{to:'magma',say:`Even more heat and squeezing! The ${N(k)} got so hot it melted. It is magma again, and the cycle starts over!`,fx:'melt'}}
}
/* audio */
let AC=null;function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
window.addEventListener('pointerdown',()=>ac(),{once:true});
function nz(dur,f0,f1,vol,type='lowpass',q=.8){const a=ac();if(!a)return;const t=a.currentTime;const b=a.createBuffer(1,a.sampleRate*dur,a.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);
  const g=a.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+dur*.25);g.gain.linearRampToValueAtTime(0,t+dur);s.connect(f).connect(g).connect(a.destination);s.start(t)}
function tone(f,dt,dur,vol,type='sine'){const a=ac();if(!a)return;const t=a.currentTime+dt;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(a.destination);o.start(t);o.stop(t+dur+.05)}
const SND={melt(){nz(1.6,200,1800,.35)},cool(){nz(1.4,6000,1500,.18,'highpass')},weather(){nz(1.6,900,500,.3,'bandpass',.6);for(let i=0;i<14;i++)tone(1800+Math.random()*1500,Math.random()*1.4,.05,.04,'triangle')},
  press(){tone(60,.5,.6,.5,'sine');nz(.5,400,80,.4)},heat(){tone(110,0,1.5,.12,'sawtooth');nz(1.5,300,900,.2)},
  done(){[523,659,784].forEach((f,i)=>tone(f,.05+i*.09,.7,.12))},nope(){tone(330,0,.18,.12,'triangle');tone(262,.13,.25,.12,'triangle')}};
/* speech */
let voice=null;function pickVoice(){const vs=speechSynthesis.getVoices();voice=vs.find(v=>/Samantha|Karen|Moira|Daniel/.test(v.name))||vs.find(v=>/^en[-_]US/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
let autoRead=false;
function speak(text,btn){if(!('speechSynthesis' in window)){toast('Reading aloud is not available here');return}speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);if(voice)u.voice=voice;u.rate=.92;speechSynthesis.speak(u)}
let toastT;function toast(m,ms=2400){const t=$('#toast');t.innerHTML=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),ms)}
/* material rendering */
const ch=$('#chamber'),img=$('#matImg'),mc=$('#matCv'),mx=mc.getContext('2d'),fc=$('#fxCv'),fx=fc.getContext('2d');
let cur='magma',size=0,dpr=1;
function resize(){const r=ch.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);size=Math.round(r.width*dpr);[mc,fc].forEach(c=>{c.width=c.height=size});drawStatic()}
new ResizeObserver(resize).observe(ch);
let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
function drawPile(kind){mx.clearRect(0,0,size,size);seed=kind==='sand'?5:9;const W=size,cx=W/2,base=W*.78,hw=W*.37,ht=W*.36;
  // shadow
  const g=mx.createRadialGradient(cx,base,0,cx,base,hw*1.1);g.addColorStop(0,'rgba(0,0,0,.5)');g.addColorStop(1,'rgba(0,0,0,0)');mx.fillStyle=g;mx.beginPath();mx.ellipse(cx,base,hw*1.1,W*.05,0,0,7);mx.fill();
  const yTop=x=>base-ht*Math.max(0,1-((x-cx)/hw)**2)**.8;
  mx.fillStyle=kind==='sand'?'#b8935a':'#a9a69a';mx.beginPath();mx.moveTo(cx-hw,base);for(let x=cx-hw;x<=cx+hw;x+=2)mx.lineTo(x,yTop(x));mx.lineTo(cx+hw,base);mx.closePath();mx.fill();
  const n=kind==='sand'?Math.round(9000*(size/800)**2):6000*(size/800)**2;
  for(let i=0;i<n;i++){const x=cx-hw+rnd()*hw*2,yt=yTop(x);if(yt>=base)continue;const y=yt+rnd()*(base-yt);const r=(kind==='sand'?.8+rnd()*1.8:.6+rnd()*1.4)*size/500;
    const sh=1-.35*((y-yt)/(base-yt+1))-(x-cx)/hw*.12;
    const c=kind==='sand'?[[226,196,140],[200,160,100],[240,226,196],[170,120,80],[120,100,90]][Math.floor(rnd()*5)]:[[214,210,198],[190,186,176],[232,228,218],[160,156,148]][Math.floor(rnd()*4)];
    mx.fillStyle=`rgb(${c.map(v=>Math.round(v*sh)).join(',')})`;mx.beginPath();mx.ellipse(x,y,r,r*.8,rnd()*3,0,7);mx.fill()}
  if(kind==='mud'){for(let i=0;i<26;i++){const x=cx-hw*.85+rnd()*hw*1.7,yt=yTop(x);const y=yt+6*dpr+rnd()*(base-yt)*.7;const r=(8+rnd()*12)*size/500;mx.save();mx.translate(x,y);mx.rotate(rnd()*6.28);
      if(rnd()<.6){mx.fillStyle='#f1e9d8';mx.strokeStyle='#8f8676';mx.lineWidth=size/600;mx.beginPath();mx.moveTo(0,r*.5);for(let k=0;k<=8;k++){const a=Math.PI*(1.1+.8*k/8);mx.lineTo(Math.cos(a)*r,Math.sin(a)*r+r*.5)}mx.closePath();mx.fill();mx.stroke();
        for(let k=1;k<8;k++){const a=Math.PI*(1.1+.8*k/8);mx.beginPath();mx.moveTo(0,r*.5);mx.lineTo(Math.cos(a)*r*.95,Math.sin(a)*r*.95+r*.5);mx.stroke()}}
      else{mx.strokeStyle='#d8c9a8';mx.lineWidth=size/250;mx.beginPath();for(let t=0;t<14;t+=.2){const rr=r*.08*t;mx.lineTo(Math.cos(t)*rr,Math.sin(t)*rr)}mx.stroke()}mx.restore()}}}
let blobs=[];for(let i=0;i<14;i++)blobs.push({x:Math.random(),y:Math.random(),r:.12+Math.random()*.22,vx:(Math.random()-.5)*.03,vy:(Math.random()-.5)*.03,h:Math.random()});
let bubbles=[];
function drawMagma(t){const W=size;mx.globalCompositeOperation='source-over';const g=mx.createRadialGradient(W/2,W/2,0,W/2,W/2,W/2);g.addColorStop(0,'#c2310c');g.addColorStop(.75,'#7a1606');g.addColorStop(1,'#300602');
  mx.fillStyle=g;mx.beginPath();mx.arc(W/2,W/2,W/2,0,7);mx.fill();mx.globalCompositeOperation='lighter';
  blobs.forEach(b=>{b.x+=b.vx*.016;b.y+=b.vy*.016;if(b.x<.1||b.x>.9)b.vx*=-1;if(b.y<.1||b.y>.9)b.vy*=-1;const gg=mx.createRadialGradient(b.x*W,b.y*W,0,b.x*W,b.y*W,b.r*W);
    gg.addColorStop(0,b.h>.5?'rgba(255,200,60,.55)':'rgba(255,120,20,.5)');gg.addColorStop(1,'rgba(255,60,0,0)');mx.fillStyle=gg;mx.beginPath();mx.arc(b.x*W,b.y*W,b.r*W,0,7);mx.fill()});
  mx.globalCompositeOperation='source-over';
  if(Math.random()<.08)bubbles.push({x:.25+Math.random()*.5,y:.3+Math.random()*.45,r:0,max:.02+Math.random()*.03});
  bubbles=bubbles.filter(b=>{b.r+=.0012;const p=b.r/b.max;if(p>1)return false;mx.strokeStyle=`rgba(255,230,150,${.8*(1-p)})`;mx.lineWidth=W/300;mx.beginPath();mx.arc(b.x*W,b.y*W,b.r*W,0,7);mx.stroke();return true});
  if(fxKind==='cool'){const k=Math.min(1,1-(fxUntil-performance.now())/1400);mx.fillStyle=`rgba(40,36,38,${.85*k})`;mx.beginPath();mx.arc(W/2,W/2,W/2,0,7);mx.fill()}
  // clip to circle edge vignette
  const v=mx.createRadialGradient(W/2,W/2,W*.3,W/2,W/2,W/2);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');mx.fillStyle=v;mx.beginPath();mx.arc(W/2,W/2,W/2,0,7);mx.fill()}
function drawStatic(){if(!size)return;if(cur==='sand'||cur==='mud')drawPile(cur);else if(cur!=='magma')mx.clearRect(0,0,size,size)}
function show(k){cur=k;const s=S[k];if(s.img){img.src='assets/'+s.img;img.style.display='block'}else{img.style.display='none'}drawStatic()}
/* fx particles */
let parts=[],fxKind=null,fxUntil=0;
function spawn(kind){const W=size;for(let i=0;i<6;i++){
  if(kind==='melt')parts.push({x:W*(.2+Math.random()*.6),y:W*(.95),vx:(Math.random()-.5)*W*.002,vy:-W*(.006+Math.random()*.006),r:W*(.02+Math.random()*.04),life:1,c:'fire'});
  if(kind==='cool'&&Math.random()<.5)parts.push({x:W*Math.random(),y:W*Math.random(),vx:0,vy:W*.0015,r:W*(.006+Math.random()*.01),life:1,c:'snow'});
  if(kind==='weather')parts.push({x:W*(Math.random()*1.2-.1),y:-10,vx:W*.004,vy:W*(.018+Math.random()*.01),r:W*.004,life:1,c:'rain'});
  if(kind==='heat'&&Math.random()<.4)parts.push({x:W*(.2+Math.random()*.6),y:W*(.2+Math.random()*.6),vx:0,vy:-W*.002,r:W*(.05+Math.random()*.05),life:1,c:'glow'});
  if(kind==='crumble'&&Math.random()<.6)parts.push({x:W*(.35+Math.random()*.3),y:W*(.45+Math.random()*.2),vx:(Math.random()-.5)*W*.004,vy:W*.002,r:W*(.004+Math.random()*.006),life:1,c:'grain',g:W*.0006});}}
function fxFrame(){fx.clearRect(0,0,size,size);fx.save();fx.beginPath();fx.arc(size/2,size/2,size/2,0,7);fx.clip();
  if(fxKind==='cool'){fx.fillStyle='rgba(120,200,255,.18)';fx.fillRect(0,0,size,size)}
  if(fxKind==='melt'){const g=fx.createLinearGradient(0,size,0,size*.3);g.addColorStop(0,'rgba(255,90,0,.5)');g.addColorStop(1,'rgba(255,90,0,0)');fx.fillStyle=g;fx.fillRect(0,0,size,size)}
  parts=parts.filter(p=>{p.x+=p.vx;p.y+=p.vy;if(p.g)p.vy+=p.g;p.life-=p.c==='rain'?.02:.018;if(p.life<=0||p.y>size+20)return false;
    if(p.c==='fire'){const g=fx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);g.addColorStop(0,`rgba(255,230,120,${p.life})`);g.addColorStop(.5,`rgba(255,110,20,${p.life*.7})`);g.addColorStop(1,'rgba(255,50,0,0)');fx.fillStyle=g;fx.beginPath();fx.arc(p.x,p.y,p.r,0,7);fx.fill()}
    if(p.c==='snow'){fx.fillStyle=`rgba(230,248,255,${p.life})`;fx.beginPath();fx.arc(p.x,p.y,p.r,0,7);fx.fill()}
    if(p.c==='rain'){fx.strokeStyle=`rgba(190,225,255,${.8*p.life})`;fx.lineWidth=p.r;fx.beginPath();fx.moveTo(p.x,p.y);fx.lineTo(p.x-p.vx*3,p.y-p.vy*3);fx.stroke()}
    if(p.c==='glow'){const g=fx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);g.addColorStop(0,`rgba(255,80,40,${.35*p.life})`);g.addColorStop(1,'rgba(255,80,40,0)');fx.fillStyle=g;fx.beginPath();fx.arc(p.x,p.y,p.r,0,7);fx.fill()}
    if(p.c==='grain'){fx.fillStyle=`rgba(200,170,120,${p.life})`;fx.beginPath();fx.arc(p.x,p.y,p.r,0,7);fx.fill()}
    return true});fx.restore()}
function loop(t){if(cur==='magma'&&size)drawMagma(t);if(fxKind&&performance.now()<fxUntil){spawn(fxKind);if(fxKind==='weather')spawn('crumble')}else fxKind=null;if(parts.length||fxKind)fxFrame();else if(fc._dirty!==false){fx.clearRect(0,0,size,size);fc._dirty=false}if(parts.length)fc._dirty=true;requestAnimationFrame(loop)}
requestAnimationFrame(loop);
/* cycle diagram */
const NODES={magma:[200,285,'Magma'],igneous:[52,170,'Igneous'],sediment:[110,48,'Sediment'],sedimentary:[290,48,'Sedimentary'],metamorphic:[348,170,'Metamorphic']};
const EDGES=[['magma','igneous','Cool',98,268],['igneous','sediment','Weather',34,100],['sediment','sedimentary','Press',200,26],['sedimentary','metamorphic','Heat',370,100],['metamorphic','magma','Melt',302,268]];
function buildCycle(){const sv=$('#cycle');const NS='http://www.w3.org/2000/svg';const el=(t,a,p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p.appendChild(e);return e};
  const defs=el('defs',{},sv);[['ah','rgba(255,255,255,.4)'],['ah2','#f2b84b']].forEach(([id,c])=>{const m=el('marker',{id,viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:5,markerHeight:5,orient:'auto'},defs);el('path',{d:'M0 0L10 5L0 10z',fill:c},m)});
  const imgs={magma:null,igneous:'granite.webp',sediment:null,sedimentary:'sandstone.webp',metamorphic:'gneiss.webp'};
  EDGES.forEach(([a,b,l,lx,ly])=>{const[x1,y1]=NODES[a],[x2,y2]=NODES[b];const dx=x2-x1,dy=y2-y1,d=Math.hypot(dx,dy);const ux=dx/d,uy=dy/d;const sx=x1+ux*42,sy=y1+uy*42,ex=x2-ux*44,ey=y2-uy*44;
    const mx_=(sx+ex)/2-uy*-22,my=(sy+ey)/2+ux*-22;const cxp=(sx+ex)/2+uy*24,cyp=(sy+ey)/2-ux*24;
    el('path',{class:'arrow',id:`e-${a}-${b}`,d:`M${sx} ${sy}Q${cxp} ${cyp} ${ex} ${ey}`},sv);const t=el('text',{class:'alab',x:lx,y:ly},sv);t.textContent=l});
  Object.entries(NODES).forEach(([k,[x,y,l]])=>{const g=el('g',{class:'node',id:'n-'+k},sv);el('circle',{class:'bg',cx:x,cy:y,r:36},g);
    if(k==='magma'){const rg=el('radialGradient',{id:'mg'},defs);el('stop',{offset:0,'stop-color':'#ffd060'},rg);el('stop',{offset:1,'stop-color':'#c2310c'},rg);el('circle',{cx:x,cy:y,r:30,fill:'url(#mg)'},g)}
    else if(k==='sediment'){for(let i=0;i<40;i++){const a=Math.random()*6.28,r=Math.sqrt(Math.random())*26;el('circle',{cx:x+Math.cos(a)*r,cy:y+Math.sin(a)*r*.8+4,r:2.2,fill:['#e2c48c','#c8a064','#f0e2c4'][i%3]},g)}}
    else el('image',{href:'assets/'+imgs[k],x:x-30,y:y-30,width:60,height:60,preserveAspectRatio:'xMidYMid meet'},g);
    const t=el('text',{x,y:y+(k==='magma'?-44:54)},g);t.textContent=l})}
let lastEdge=null;
function updateCycle(prev){$$('#cycle .node').forEach(n=>n.classList.toggle('on',n.id==='n-'+S[cur].node));$$('#cycle .arrow').forEach(a=>a.classList.remove('on'));
  if(prev){const e=$(`#e-${S[prev].node}-${S[cur].node}`);if(e)e.classList.add('on')}}
/* collection */
let got=new Set(JSON.parse(localStorage.getItem('rc.got')||'["magma"]'));
function buildSlots(){const box=$('#slots');box.innerHTML='';ORDER.forEach(k=>{const d=document.createElement('div');d.className='slot';d.dataset.k=k;d.title=S[k].name;
  if(S[k].img)d.style.backgroundImage=`url(assets/${S[k].img})`;else if(k==='magma')d.style.background='radial-gradient(circle,#ffd060 0%,#ff6a1a 45%,#8a1a06 70%,transparent 72%)';
  else d.style.background=k==='sand'?'radial-gradient(circle at 50% 70%,#d9b77a 0 40%,transparent 42%)':'radial-gradient(circle at 50% 70%,#d8d4c6 0 40%,transparent 42%)';box.appendChild(d)});updateSlots()}
function updateSlots(nw){$$('.slot').forEach(s=>{s.classList.toggle('got',got.has(s.dataset.k));s.classList.toggle('cur',s.dataset.k===cur);if(s.dataset.k===nw){s.classList.remove('new');void s.offsetWidth;s.classList.add('new')}});$('#count').textContent=`${got.size}/9`}
/* ui */
function setLabel(say,hint){const s=S[cur];const f=$('#fam');f.className='fam '+s.fam;f.textContent=s.famLabel;$('#nm').textContent=s.name;const p=$('#say');p.textContent=say;p.classList.toggle('hint',!!hint)}
let busy=false;
function act(a,btn){if(busy)return;ac();const r=rule(a,cur);
  if(r.hint){SND.nope();btn.classList.remove('wiggle');void btn.offsetWidth;btn.classList.add('wiggle');ch.classList.remove('shake');void ch.offsetWidth;ch.classList.add('shake');setLabel(r.hint,true);if(autoRead)speak(r.hint);return}
  busy=true;$('#app').classList.add('busy');const kind=r.fx||a;SND[kind]();fxKind=kind;fxUntil=performance.now()+1400;
  if(a==='press')ch.classList.add('pressing'),setTimeout(()=>ch.classList.add('squish'),450);
  if(a==='heat')ch.classList.add('heating'),setTimeout(()=>ch.classList.add('squeezed'),300);
  if(a==='weather')setTimeout(()=>{img.style.filter='blur(2px) brightness(1.1)'},400);
  setTimeout(()=>{ch.classList.add('morph')},1000);
  setTimeout(()=>{const prev=cur;img.style.filter='';ch.classList.remove('squish','squeezed');show(r.to);ch.classList.remove('morph','pressing','heating');
    const isNew=!got.has(r.to);got.add(r.to);localStorage.setItem('rc.got',JSON.stringify([...got]));setLabel(r.say);updateCycle(prev);updateSlots(isNew?r.to:null);SND.done();
    if(isNew&&got.size===9)setTimeout(()=>toast('🏆 You made all 9! You are a rock cycle expert!',3500),500);else if(isNew)toast(`New! ${S[r.to].name} ⭐`);
    if(autoRead)speak(r.say);busy=false;$('#app').classList.remove('busy')},1500)}
$$('.ctl').forEach(b=>onTap(b,()=>act(b.dataset.a,b)));
onTap($('#readBtn'),()=>{autoRead=!autoRead;$('#readBtn').classList.toggle('speaking',autoRead);if(autoRead){speak(`${S[cur].name}. ${$('#say').textContent}`);toast('I will read each change out loud')}else{if('speechSynthesis' in window)speechSynthesis.cancel();toast('Reading off')}});
onTap($('#resetBtn'),()=>{if(busy)return;show('magma');setLabel('Back to magma! '+S.magma.about+' Push a button to see what happens!');updateCycle();updateSlots()});
onTap($('#creditsBtn'),()=>{$('#card').innerHTML=`<button class="mx" aria-label="Close">×</button><h2>Photo credits</h2><ul>${(window.CREDITS||[]).map(c=>`<li><b>${c.title.replace(/\.(jpe?g|png|tif)$/i,'')}</b> — ${c.artist||'Unknown'}. ${c.license}${c.licurl?` (<a href="${c.licurl}" target="_blank" rel="noopener">license</a>)`:''}. <a href="${c.page}" target="_blank" rel="noopener">Source</a>${c.note?'. '+c.note:''}</li>`).join('')}<li>Magma, sand, shells, and effects are drawn in code. Sounds are made in the browser. Fonts: Fraunces and Nunito (SIL OFL).</li></ul>`;
  $('#modal').classList.add('open');onTap($('.mx',$('#card')),()=>$('#modal').classList.remove('open'))});
$('#modal').addEventListener('pointerdown',e=>{if(e.target.id==='modal')e.currentTarget.classList.remove('open')});
buildCycle();buildSlots();show('magma');setLabel(S.magma.about+' Push a button to see what happens!');updateCycle();
window.__ready=true;
