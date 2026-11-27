'use strict';
(()=>{
const cv=$('#sea'),cx=cv.getContext('2d');let W=0,H=0,DPR=1,K=1;
const TAU=Math.PI*2,wrap=a=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI},deg=r=>r*180/Math.PI;
const boat={x:0,y:0,th:0,v:0,rud:0,rope:.45,flap:0,drive:0};
let BG=null,wind=Math.PI*.5,buoys=[],island={x:0,y:0,r:70},glints=[],wake=[],level=0,running=false,last=0,won=false,input={l:0,r:0,wheel:0,wheelHeld:false};
const hint={t:0,kind:null,said:0};
function resize(){const r=cv.parentElement.getBoundingClientRect();DPR=Math.min(2,devicePixelRatio||1);W=r.width;H=r.height;cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px';K=clamp(Math.min(W,H)/640,.6,1.4);
  if(!glints.length)glints=Array.from({length:170},()=>({x:Math.random(),y:Math.random(),s:rnd(.5,1.3),p:Math.random()*TAU}));if(!buoys.length)newLevel(true)}
const onRs=()=>{if(CUR==='sail'&&mode==='game'){const ox=W,oy=H;resize();if(ox&&oy){const sx=W/ox,sy=H/oy;[boat,island,...buoys].forEach(o=>{o.x*=sx;o.y*=sy})}}};addEventListener('resize',onRs);if(window.ResizeObserver)new ResizeObserver(onRs).observe(cv.parentElement);
function newLevel(first){won=false;level++;const phone=W<600;
  const isles=[[.8,.26],[.2,.32],[.55,.22],[.82,.5]],starts=[[.3,.62],[.72,.62],[.5,.66],[.25,.55]],c=isles[level%4],b0=starts[level%4];
  island={x:W*c[0],y:H*c[1],r:62*K};boat.x=W*b0[0];boat.y=H*b0[1];boat.v=0;boat.rud=0;
  wind=[Math.PI*.5,Math.PI,Math.PI*1.25,0,Math.PI*.75][level%5]; // direction the wind blows TO
  boat.th=wrap(wind+Math.PI*.5);// start on a beam reach
  buoys=[];let tries=0;while(buoys.length<3&&tries++<400){const b={x:rnd(.14,.86)*W,y:rnd(phone?.22:.18,phone?.66:.72)*H,got:false,ph:Math.random()*TAU};
    if(Math.hypot(b.x-island.x,b.y-island.y)<island.r+90*K)continue;if(Math.hypot(b.x-boat.x,b.y-boat.y)<120*K)continue;if(buoys.some(o=>Math.hypot(o.x-b.x,o.y-b.y)<110*K))continue;buoys.push(b)}
  wake=[];updCount();setWindUI();if(!first){speak('New wind! Sail to the three buoys, then go to the island.')}}
function updCount(){$('#buoyCount').innerHTML=buoys.map(b=>`<i class="${b.got?'got':''}"></i>`).join('')+`<b class="isle ${buoys.every(b=>b.got)?'ready':''}"></b>`}
function setWindUI(){$('#windArrow').style.transform=`translate(-50%,-50%) rotate(${deg(wind)+180}deg)`}
/* ---------- physics ---------- */
function sailNumbers(){const from=wind+Math.PI,rel=wrap(from-boat.th),a=Math.abs(deg(rel));const sOpt=clamp((a-20)/1.8,5,88),s=8+boat.rope*82;
  let p=a<38?0:a<60?(a-38)/22*.8:.8+.2*Math.sin(a*Math.PI/180);const e=s-sOpt;let eff=1,state='good';
  if(a<38){state='nogo';eff=0}else if(e>14){eff=Math.max(0,1-(e-14)/26);state='loose'}else if(e<-14){eff=Math.max(.2,1-(-e-14)/40);state='tight'}
  return{rel,a,s,sOpt,p,eff,state}}
function step(dt){const N=sailNumbers();const maxV=150*K;
  let r=input.r-input.l;if(input.wheelHeld)r=input.wheel;else{input.wheel*=Math.pow(.02,dt)}boat.rud=lerp(boat.rud,r,Math.min(1,dt*6));
  boat.drive=N.p*N.eff;const V=maxV*boat.drive;boat.v+=(V-boat.v)*Math.min(1,dt*(V<boat.v?1.5:.9));
  boat.th=wrap(boat.th+boat.rud*1.5*(.4+boat.v/maxV)*dt);
  boat.x+=Math.sin(boat.th)*boat.v*dt+Math.sin(wind)*6*K*dt;boat.y+=-Math.cos(boat.th)*boat.v*dt-Math.cos(wind)*6*K*dt;
  const m=24*K;if(boat.x<m||boat.x>W-m||boat.y<m||boat.y>H-m){boat.x=clamp(boat.x,m,W-m);boat.y=clamp(boat.y,m,H-m);boat.v*=.9}
  const di=Math.hypot(boat.x-island.x,boat.y-island.y);if(di<island.r+22*K){const ang=Math.atan2(boat.y-island.y,boat.x-island.x);boat.x=island.x+Math.cos(ang)*(island.r+22*K);boat.y=island.y+Math.sin(ang)*(island.r+22*K);boat.v*=.6;
    if(buoys.every(b=>b.got)&&!won)win()}
  buoys.forEach(b=>{if(!b.got&&Math.hypot(b.x-boat.x,b.y-boat.y)<38*K){b.got=true;SFX.chime();updCount();const left=buoys.filter(x=>!x.got).length;speak(left?`Got it! ${left} more.`:'You got all the buoys! Now sail to the island.')}});
  boat.flap+=dt*(N.state==='nogo'||N.state==='loose'?28:4);
  if(boat.v>8){const sx=boat.x-Math.sin(boat.th)*38*K,sy=boat.y+Math.cos(boat.th)*38*K,px=Math.cos(boat.th)*9*K,py=Math.sin(boat.th)*9*K;wake.push({x:sx+px,y:sy+py,r:2.5*K,a:.6*Math.min(1,boat.v/80)},{x:sx-px,y:sy-py,r:2.5*K,a:.6*Math.min(1,boat.v/80)})}
  wake=wake.filter(w=>{w.r+=dt*7*K;w.a-=dt*.35;return w.a>0});
  // hints
  const bad=N.state!=='good'&&!won;if(bad&&N.state===hint.kind)hint.t+=dt;else{hint.t=0;hint.kind=bad?N.state:null}
  const sh=$('#sailHint');const show=hint.t>1.6;const k2=show?hint.kind:'';if(sh.dataset.k!==k2){sh.dataset.k=k2;sh.className='sail-hint'+(show?' show '+k2:'');sh.innerHTML=!show?'':k2==='nogo'?'<svg><use href="#i-wind"/></svg><svg class="arr"><use href="#i-left"/></svg><svg><use href="#i-sail"/></svg>':k2==='loose'?'<svg><use href="#i-sail"/></svg><svg class="arr up"><use href="#i-right"/></svg>':'<svg><use href="#i-sail"/></svg><svg class="arr down"><use href="#i-right"/></svg>'}
  $('#rope').classList.toggle('glow',show&&(hint.kind==='loose'||hint.kind==='tight'));
  if(show&&performance.now()-hint.said>9000){hint.said=performance.now();SFX.flap();speak({nogo:'You can\u2019t sail straight into the wind. Turn the wheel a little, and zig zag.',loose:'The sail is flapping. Pull the rope in!',tight:'The sail is pulled too tight. Let the rope out a little.'}[hint.kind])}
}
function win(){won=true;SFX.horn(1.6,120);setTimeout(()=>SFX.cheer(),900);confetti(80);speak('Land ho! You made it to the island! You sailed with the wind, like a real sailor.');setTimeout(()=>{if(CUR==='sail')newLevel()},5200)}
/* ---------- drawing ---------- */
function drawIsland(t){const {x,y,r}=island;let g=cx.createRadialGradient(x,y,r*.6,x,y,r*1.9);g.addColorStop(0,'rgba(120,230,220,.9)');g.addColorStop(1,'rgba(120,230,220,0)');cx.fillStyle=g;cx.beginPath();cx.arc(x,y,r*1.9,0,TAU);cx.fill();
  cx.beginPath();for(let i=0;i<=40;i++){const a=i/40*TAU,rr=r*(1+.12*Math.sin(a*3+1)+.07*Math.sin(a*5));cx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}cx.fillStyle='#ecd9a0';cx.fill();
  cx.beginPath();for(let i=0;i<=40;i++){const a=i/40*TAU,rr=r*.66*(1+.15*Math.sin(a*4+2));cx.lineTo(x+Math.cos(a)*rr-r*.08,y+Math.sin(a)*rr-r*.05)}g=cx.createRadialGradient(x-r*.2,y-r*.2,2,x,y,r*.8);g.addColorStop(0,'#6fbf5a');g.addColorStop(1,'#2f7d3a');cx.fillStyle=g;cx.fill();
  // palm trees from above
  [[-.25,-.15,1],[.2,.1,.8],[-.05,.3,.7]].forEach(([dx,dy,s])=>{const px=x+dx*r,py=y+dy*r;for(let k=0;k<7;k++){const a=k/7*TAU+t*.2*s;cx.save();cx.translate(px,py);cx.rotate(a);cx.fillStyle=k%2?'#2e6b2a':'#3f8a35';cx.beginPath();cx.ellipse(r*.22*s,0,r*.22*s,r*.06*s,0,0,TAU);cx.fill();cx.restore()}cx.fillStyle='#7a5a2e';cx.beginPath();cx.arc(px,py,r*.05,0,TAU);cx.fill()});
  // dock
  const ready=buoys.every(b=>b.got);cx.save();cx.translate(x,y);const da=Math.atan2(H/2-y,W/2-x);cx.rotate(da);cx.fillStyle='#8a6038';cx.fillRect(r*.85,-8*K,r*.75,16*K);cx.strokeStyle='#5b3d20';cx.lineWidth=2;for(let i=0;i<6;i++){cx.beginPath();cx.moveTo(r*.85+i*r*.13,-8*K);cx.lineTo(r*.85+i*r*.13,8*K);cx.stroke()}
  if(ready){cx.fillStyle='#ffd34d';cx.beginPath();cx.arc(r*1.6,0,9*K+Math.sin(t*5)*3,0,TAU);cx.fill()}cx.restore()}
function drawBuoy(b,t){if(b.got)return;const s=1+Math.sin(t*3+b.ph)*.06;cx.save();cx.translate(b.x,b.y);
  cx.strokeStyle='rgba(255,255,255,.5)';cx.lineWidth=2;const rr=(t*30+b.ph*10)%30;cx.beginPath();cx.arc(0,0,(14+rr)*K,0,TAU);cx.globalAlpha=1-rr/30;cx.stroke();cx.globalAlpha=1;
  cx.scale(s,s);cx.fillStyle='rgba(0,0,0,.25)';cx.beginPath();cx.arc(3*K,4*K,15*K,0,TAU);cx.fill();
  cx.fillStyle='#e74c3c';cx.beginPath();cx.arc(0,0,15*K,0,TAU);cx.fill();cx.fillStyle='#fff';cx.beginPath();cx.arc(0,0,10*K,0,TAU);cx.fill();cx.fillStyle='#e74c3c';cx.beginPath();cx.arc(0,0,5.5*K,0,TAU);cx.fill();
  cx.strokeStyle='#333';cx.lineWidth=2;cx.beginPath();cx.moveTo(0,0);cx.lineTo(0,-26*K);cx.stroke();cx.fillStyle='#ffd34d';cx.beginPath();cx.moveTo(0,-26*K);cx.lineTo(16*K,-21*K+Math.sin(t*6)*2);cx.lineTo(0,-16*K);cx.fill();cx.restore()}
function drawBoat(t,N){const L=42*K;cx.save();cx.translate(boat.x,boat.y);cx.rotate(boat.th);
  cx.fillStyle='rgba(0,30,60,.3)';cx.beginPath();cx.ellipse(4*K,6*K,L*.42,L*1.02,0,0,TAU);cx.fill();
  // hull
  cx.beginPath();cx.moveTo(0,-L*1.15);cx.bezierCurveTo(L*.55,-L*.5,L*.5,L*.6,L*.32,L*.95);cx.lineTo(-L*.32,L*.95);cx.bezierCurveTo(-L*.5,L*.6,-L*.55,-L*.5,0,-L*1.15);
  let g=cx.createLinearGradient(-L*.5,0,L*.5,0);g.addColorStop(0,'#f4f1ea');g.addColorStop(.5,'#ffffff');g.addColorStop(1,'#d9d4c9');cx.fillStyle=g;cx.fill();cx.strokeStyle='#1f3a5a';cx.lineWidth=2.5;cx.stroke();
  cx.beginPath();cx.moveTo(0,-L*.95);cx.bezierCurveTo(L*.42,-L*.4,L*.38,L*.55,L*.25,L*.82);cx.lineTo(-L*.25,L*.82);cx.bezierCurveTo(-L*.38,L*.55,-L*.42,-L*.4,0,-L*.95);
  g=cx.createLinearGradient(0,-L,0,L);g.addColorStop(0,'#d7a466');g.addColorStop(1,'#b47c3e');cx.fillStyle=g;cx.fill();cx.strokeStyle='rgba(90,55,20,.5)';cx.lineWidth=1;for(let i=-2;i<=2;i++){cx.beginPath();cx.moveTo(i*L*.08,-L*.7);cx.lineTo(i*L*.08,L*.8);cx.stroke()}
  cx.fillStyle='#2c3e50';cx.fillRect(-L*.22,L*.35,L*.44,L*.3);// cockpit
  // rudder / tiller
  cx.strokeStyle='#5b3d20';cx.lineWidth=3*K;cx.beginPath();cx.moveTo(0,L*.92);cx.lineTo(Math.sin(-boat.rud*.6)*L*.35,L*.92+Math.cos(boat.rud*.6)*L*.35);cx.stroke();
  // boom + sail
  const side=N.rel>0?-1:1;const s=N.s*Math.PI/180*side;const mast=[0,-L*.35],bl=L*1.15;  const boomX=Math.sin(s)*bl,boomY=mast[1]+Math.cos(s)*bl;
  const flapping=N.state==='nogo'||N.state==='loose';const bulge=(flapping?Math.sin(boat.flap)*6*K:(8+14*boat.drive)*K)*-side;
  const mx=(boomX)/2,my=(mast[1]+boomY)/2,nx=Math.cos(s),ny=-Math.sin(s);
  cx.beginPath();cx.moveTo(mast[0],mast[1]);cx.quadraticCurveTo(mx+nx*bulge*(flapping?1:-1),my+ny*bulge*(flapping?1:-1),boomX,boomY);cx.lineTo(mast[0],mast[1]);
  g=cx.createLinearGradient(mast[0],mast[1],boomX,boomY);g.addColorStop(0,'rgba(255,255,255,.96)');g.addColorStop(1,'rgba(230,226,214,.96)');cx.fillStyle=g;cx.fill();cx.strokeStyle='#8a8577';cx.lineWidth=1.5;cx.stroke();
  cx.strokeStyle='#6b4a2a';cx.lineWidth=4*K;cx.lineCap='round';cx.beginPath();cx.moveTo(mast[0],mast[1]);cx.lineTo(boomX,boomY);cx.stroke();
  cx.fillStyle='#3b2a1d';cx.beginPath();cx.arc(mast[0],mast[1],4.5*K,0,TAU);cx.fill();
  // little flag at mast top shows the wind
  cx.save();cx.translate(mast[0],mast[1]);cx.rotate(wind-boat.th);cx.fillStyle='#e74c3c';cx.beginPath();cx.moveTo(0,0);cx.lineTo(-4*K,-14*K+Math.sin(t*12)*2);cx.lineTo(4*K,-14*K+Math.sin(t*12+1)*2);cx.fill();cx.restore();
  cx.restore()}
function draw(){const t=performance.now()/1000,N=sailNumbers();cx.setTransform(DPR,0,0,DPR,0,0);
  if(!BG||BG.w!==W||BG.h!==H){BG=document.createElement('canvas');BG.w=W;BG.h=H;BG.width=Math.ceil(W/2);BG.height=Math.ceil(H/2);const b=BG.getContext('2d');b.scale(.5,.5);
    let g=b.createLinearGradient(0,0,W,H);g.addColorStop(0,'#1c6ea4');g.addColorStop(.5,'#16598c');g.addColorStop(1,'#0f4774');b.fillStyle=g;b.fillRect(0,0,W,H);
    for(let i=0;i<7;i++){const bx=Math.random()*W,by=Math.random()*H;g=b.createRadialGradient(bx,by,0,bx,by,W*.3);g.addColorStop(0,i%2?'rgba(60,160,210,.2)':'rgba(5,40,80,.2)');g.addColorStop(1,'rgba(0,0,0,0)');b.fillStyle=g;b.fillRect(0,0,W,H)}}
  cx.drawImage(BG,0,0,W,H);
  const wx=Math.sin(wind),wy=-Math.cos(wind);
  cx.lineCap='round';cx.lineWidth=1.6;for(let q=0;q<4;q++){cx.strokeStyle=`rgba(220,240,255,${.07+q*.06})`;cx.beginPath();for(let i=q;i<glints.length;i+=4){const p=glints[i];p.x=(p.x+wx*.012*p.s/60+1)%1;p.y=(p.y+wy*.012*p.s/60+1)%1;const X=p.x*W,Y=p.y*H,R=7*K*p.s*(1+.15*Math.sin(t*2+p.p));cx.moveTo(X+Math.cos(Math.PI*1.15+wind)*R,Y+Math.sin(Math.PI*1.15+wind)*R);cx.arc(X,Y,R,Math.PI*1.15+wind,Math.PI*1.85+wind)}cx.stroke()}
  // wind streaks
  cx.strokeStyle='rgba(255,255,255,.28)';cx.lineWidth=2;for(let i=0;i<14;i++){const ph=((t*.35+i*.37)%1),sx=((i*.618)%1)*W,sy=((i*.371)%1)*H;const X=(sx+wx*ph*W*.5+W)%W,Y=(sy+wy*ph*H*.5+H)%H;cx.globalAlpha=Math.sin(ph*Math.PI);cx.beginPath();cx.moveTo(X,Y);cx.lineTo(X+wx*60*K,Y+wy*60*K);cx.stroke()}cx.globalAlpha=1;
  wake.forEach(w=>{cx.fillStyle=`rgba(235,248,255,${w.a*.45})`;cx.beginPath();cx.arc(w.x,w.y,w.r,0,TAU);cx.fill()});
  drawIsland(t);buoys.forEach(b=>drawBuoy(b,t));drawBoat(t,N);
  $('#wheelG').setAttribute('transform',`rotate(${boat.rud*120} 60 60)`)}
function loop(t){if(!running)return;const dt=Math.min(.05,(t-last)/1000||.016);last=t;step(dt);draw();
  // sail sound: gentle flap when luffing
  requestAnimationFrame(loop)}
/* ---------- controls ---------- */
const hold=(el,k)=>{el.addEventListener('pointerdown',e=>{unlockAudio();e.preventDefault();input[k]=1;el.classList.add('down');el.setPointerCapture(e.pointerId)});['pointerup','pointercancel','lostpointercapture'].forEach(n=>el.addEventListener(n,()=>{input[k]=0;el.classList.remove('down')}))};
hold($('#steerL'),'l');hold($('#steerR'),'r');
const wh=$('#wheel');let wa0=0,wv0=0;
wh.addEventListener('pointerdown',e=>{unlockAudio();e.preventDefault();const r=wh.getBoundingClientRect();wa0=Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2));wv0=input.wheel;input.wheelHeld=true;wh.setPointerCapture(e.pointerId)});
wh.addEventListener('pointermove',e=>{if(!input.wheelHeld)return;const r=wh.getBoundingClientRect();const a=Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2));input.wheel=clamp(wv0+wrap(a-wa0)/(Math.PI*.66),-1,1)});
['pointerup','pointercancel'].forEach(n=>wh.addEventListener(n,()=>{input.wheelHeld=false}));
const track=$('#ropeTrack'),knob=$('#ropeKnob');function setRope(v){boat.rope=clamp(v,0,1);knob.style.top=boat.rope*100+'%'}setRope(boat.rope);
let ropeHeld=false;track.addEventListener('pointerdown',e=>{unlockAudio();e.preventDefault();ropeHeld=true;track.setPointerCapture(e.pointerId);mvRope(e);SFX.creak()});
function mvRope(e){const r=track.getBoundingClientRect();setRope((e.clientY-r.top)/r.height)}
track.addEventListener('pointermove',e=>{if(ropeHeld)mvRope(e)});['pointerup','pointercancel'].forEach(n=>track.addEventListener(n,()=>{ropeHeld=false}));
const comp=$('#compass');let compHeld=false,compMoved=false,c0=null;
comp.addEventListener('pointerdown',e=>{unlockAudio();e.preventDefault();compHeld=true;compMoved=false;c0=[e.clientX,e.clientY];comp.setPointerCapture(e.pointerId)});
comp.addEventListener('pointermove',e=>{if(!compHeld)return;if(Math.hypot(e.clientX-c0[0],e.clientY-c0[1])>8)compMoved=true;if(!compMoved)return;const r=comp.getBoundingClientRect();wind=Math.atan2(e.clientX-(r.left+r.width/2),-(e.clientY-(r.top+r.height/2)));setWindUI()});
comp.addEventListener('pointerup',()=>{if(compHeld&&!compMoved){wind=wrap(wind+Math.PI/4);setWindUI()}compHeld=false;SFX.wind(1.2,.25)});
addEventListener('keydown',e=>{if(CUR!=='sail')return;if(e.key==='ArrowLeft')input.l=1;if(e.key==='ArrowRight')input.r=1;if(e.key==='ArrowUp')setRope(boat.rope-.1);if(e.key==='ArrowDown')setRope(boat.rope+.1)});
addEventListener('keyup',e=>{if(e.key==='ArrowLeft')input.l=0;if(e.key==='ArrowRight')input.r=0});
/* ---------- ways ships go ---------- */
const POWER=[
 {id:'oars',img:'go-oars.jpg',t:3.4,snd:'oars',say:'Oars! People pull the oars through the water. They push the water back, and the boat moves forward. It is hard work!'},
 {id:'sail',img:'go-sail.jpg',t:2.4,snd:'wind',say:'Sails! The wind pushes on the sail. No food or fuel needed. Just wind!'},
 {id:'wheel',img:'go-steam.jpg',t:2,snd:'steam',say:'A paddle wheel! A steam engine spins the big wheel. Its paddles push the water back, splash, splash, splash.'},
 {id:'prop',img:'go-prop.jpg',t:1.2,snd:'engine',say:'A propeller! An engine spins it very fast, under the water. It pushes the water back, and the ship zooms forward. Most big ships use propellers today.'}];
const PIC={oars:'<svg viewBox="0 0 60 60" class="pw-ani oars"><path d="M8 40h44l-6 8H14z" fill="#8a5a2b"/><g class="oar"><path d="M30 40L14 56" stroke="#5d3a1d" stroke-width="4"/><ellipse cx="12" cy="57" rx="6" ry="3" fill="#5d3a1d"/></g></svg>',
 sail:'<svg viewBox="0 0 60 60" class="pw-ani sail"><path d="M30 6v38" stroke="#3b2a1d" stroke-width="3"/><path class="puff" d="M32 8c12 10 16 22 16 34H32z" fill="#fff"/><path d="M8 46h44l-6 8H14z" fill="#8a5a2b"/></svg>',
 wheel:'<svg viewBox="0 0 60 60" class="pw-ani wheel"><g class="spin"><circle cx="30" cy="30" r="20" fill="none" stroke="#c0392b" stroke-width="4"/><g stroke="#c0392b" stroke-width="5"><path d="M30 6v48M6 30h48M13 13l34 34M47 13L13 47"/></g></g></svg>',
 prop:'<svg viewBox="0 0 60 60" class="pw-ani prop"><g class="spin"><ellipse cx="30" cy="16" rx="7" ry="14" fill="#d4a017"/><ellipse cx="30" cy="16" rx="7" ry="14" fill="#d4a017" transform="rotate(120 30 30)"/><ellipse cx="30" cy="16" rx="7" ry="14" fill="#d4a017" transform="rotate(240 30 30)"/><circle cx="30" cy="30" r="6" fill="#8a6a10"/></g></svg>'};
$('#power').innerHTML=POWER.map(p=>`<button class="pw-card" data-id="${p.id}" aria-label="${p.id}"><span class="pw-img" style="background-image:url(assets/${p.img})"></span>${PIC[p.id]}<span class="lane"><i class="lane-boat"><svg><use href="#i-sail"/></svg></i></span></button>`).join('');
$$('.pw-card').forEach(c=>onTap(c,()=>{const p=POWER.find(x=>x.id===c.dataset.id);$$('.pw-card').forEach(x=>x.classList.remove('go'));const lb=$('.lane-boat',c);lb.style.transition='none';lb.style.left='0%';void lb.offsetWidth;
  c.classList.add('go');lb.style.transition=`left ${p.t}s linear`;lb.style.left='calc(100% - 44px)';shipSound(p.snd);speak(p.say);setTimeout(()=>c.classList.remove('go'),p.t*1000+300)}));
let mode='game';
function setMode(m){mode=m;$$('#sailMode button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));$('#seaWrap').classList.toggle('off',m!=='game');$('#power').classList.toggle('on',m==='power');stopSpeak();
  if(m==='game'){resize();if(!running){running=true;last=performance.now();requestAnimationFrame(loop)}}else{running=false;speak('How do ships move? Tap each one. Which is the fastest?')}}
$$('#sailMode button').forEach(b=>onTap(b,()=>{SFX.tap();setMode(b.dataset.m)}));
registerView('sail',{t:'Sail It',ico:'i-sail',help:()=>mode==='power'?'Tap each picture to see and hear how it pushes a ship.':'Sail to the three buoys, then to the island. Turn the wheel to steer. Slide the rope to move the sail. The arrow shows where the wind blows. Tap it to change the wind.',
  enter(){setMode(mode)},leave(){running=false}});
window.SAIL={boat,get wind(){return wind},set wind(v){wind=v;setWindUI()},get buoys(){return buoys},sailNumbers,setRope,input,get island(){return island}};
})();
