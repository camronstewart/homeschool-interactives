'use strict';
(()=>{
const cv=$('#tank'),cx=cv.getContext('2d');
let W=0,H=0,DPR=1,T={};// tank geometry
const IM={};window.OBJECTS.forEach(o=>{const i=new Image();i.src='assets/obj-'+o.id+'.webp';IM[o.id]=i});
let mode='objects',bodies=[],parts=[],bubbles=[],cols=[],running=false,last=0,held=null,pending=null;
const results={float:new Set(),sink:new Set()};
function resize(){const r=cv.parentElement.getBoundingClientRect();DPR=Math.min(2,devicePixelRatio||1);W=r.width;H=r.height;cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px';
  const m=Math.max(14,W*.04);const tw=Math.min(W-2*m,H*1.25);T.x0=(W-tw)/2;T.x1=T.x0+tw;T.y0=Math.max(70,H*.2);T.y1=H-Math.max(40,H*.09);T.h=T.y1-T.y0;T.w=tw;T.s=clamp(T.h/480,.55,1.3);
  T.base=T.y0+T.h*.36;const n=Math.round(tw/8);if(cols.length!==n){cols=Array.from({length:n},()=>({h:0,v:0}))}
  bodies.forEach(b=>{b.w=b.bw*T.s;b.h=b.bh*T.s;b.x=clamp(b.x,T.x0+b.w/2+8,T.x1-b.w/2-8)})}
addEventListener('resize',()=>{if(CUR==='float')resize()});
if(window.ResizeObserver)new ResizeObserver(()=>{if(CUR==='float')resize()}).observe(cv.parentElement);
/* ---------- bodies ---------- */
function mkBody(o,x,y){return{o,id:o.id,x,y,bw:o.w,bh:o.h,w:o.w*T.s,h:o.h*T.s,vy:0,rot:0,state:'fall',still:0,done:false,guess:null,wasIn:false,floorHit:false}}
function clayCap(b){return [6400,6400,14500,26000][b.shape]}
function displaced(b,surf){const bot=b.y+b.h/2,sub=clamp(bot-surf,0,b.h),f=sub/b.h;b.frac=f;
  if(b.clay){if(b.flooded||b.shape<2)return 6400*f+b.pennies*140*f;return clayCap(b)*f}
  return b.w*b.h*.72*f*(1/T.s/T.s)}
function massOf(b){return b.clay?11000+b.pennies*1000:b.w*b.h*.72*b.o.d/T.s/T.s}
function surfY(){let v=0;bodies.forEach(b=>{if(b.state!=='hover')v+=displaced(b,T.base-T.rise||T.base)});return v}
T.rise=0;
function step(dt){
  // water level from displaced volume (exaggerated so the rise is easy to see)
  let disp=0;bodies.forEach(b=>{if(b.state!=='hover'&&b.state!=='held'||b.state==='held')disp+=displaced(b,T.base-T.rise)});
  const target=disp/Math.max(700,T.w/T.s)*T.s*1.3;T.rise+=(target-T.rise)*Math.min(1,dt*3);
  const surf=T.base-T.rise;
  for(const b of bodies){
    if(b.state==='hover'){b.y=T.y0-b.h*.2-6+Math.sin(performance.now()/300)*4;continue}
    if(b.state==='held'){b.vy=0;continue}
    const g=1500,m=massOf(b),D=displaced(b,surf),f=b.frac;
    let a=Math.max(-2*g,g*(1-D/m));
    const inW=f>0;
    a-=b.vy*(inW?((b.clay&&b.shape===1?7:4.2)+Math.abs(b.vy)*.006)*Math.max(.8,f)*1.4:.15);
    b.vy+=a*dt;b.y+=b.vy*dt;
    const bot=b.y+b.h/2;
    // splash when entering
    if(!b.wasIn&&bot>surf){b.wasIn=true;const sp=Math.abs(b.vy);if(sp>120){const sz=clamp(sp/900*Math.sqrt(m/8000),.3,1.6);SFX.splash(sz);splash(b.x,surf,sz,b.w);poke(b.x,sp*.5*sz)}}
    if(bot<surf-4)b.wasIn=false;
    if(inW&&Math.abs(b.vy)>60&&Math.random()<.25)bubbles.push({x:b.x+rnd(-b.w/3,b.w/3),y:b.y,r:rnd(1.5,4),vy:rnd(-40,-90)});
    const floor=T.y1-10;
    if(b.y+b.h/2>floor){b.y=floor-b.h/2;if(b.vy>80&&!b.floorHit){b.floorHit=true;(b.o&&b.o.d>5?SFX.wood:SFX.wood)();if(b.o&&b.o.d>5)tone({f:1900,f2:1700,dur:.15,vol:.08})}b.vy=b.vy>80?-b.vy*.15:0}
    // gentle rocking
    b.rot=lerp(b.rot,(inW&&f<.98?Math.sin(performance.now()/700+b.x)*.05:0),dt*3);
    if(Math.abs(b.vy)<10)b.still+=dt;else b.still=0;
    if(!b.done&&b.still>.6&&b.wasIn)settle(b,surf);
    if(b.clay&&!b.flooded&&b.shape>=2&&b.frac>=.995&&b.still>.05){flood(b)}
  }
  // keep things from stacking on top of each other
  for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){const a=bodies[i],c=bodies[j];if(a.state==='hover'||c.state==='hover')continue;
    const ox=(a.w+c.w)/2*.82-Math.abs(a.x-c.x),oy=(a.h+c.h)/2*.8-Math.abs(a.y-c.y);if(ox>0&&oy>0){const s=(a.x<c.x?-1:1)*Math.min(ox,200*dt)/2;if(a.state!=='held')a.x+=s;if(c.state!=='held')c.x-=s}}
  bodies.forEach(b=>{b.x=clamp(b.x,T.x0+b.w/2+8,T.x1-b.w/2-8)});
  // surface waves
  for(let k=0;k<2;k++){for(let i=0;i<cols.length;i++){const c=cols[i],l=cols[i-1]||c,r=cols[i+1]||c;c.v+=((l.h+r.h)/2-c.h)*.5-c.h*.02;c.v*=.985}for(const c of cols)c.h+=c.v*.5}
  parts=parts.filter(p=>{p.vy+=1400*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;return p.y<surf+4});
  bubbles=bubbles.filter(p=>{p.y+=p.vy*dt;p.x+=Math.sin(p.y/9)*.3;return p.y>surf+2});
}
function poke(x,amp){const i=Math.round((x-T.x0)/T.w*(cols.length-1));for(let k=-2;k<=2;k++){const c=cols[i+k];if(c)c.v+=amp*.05*(3-Math.abs(k))/3}}
function splash(x,y,sz,w){const n=Math.round(14+sz*22);for(let i=0;i<n;i++){parts.push({x:x+rnd(-w/2,w/2),y,vx:rnd(-160,160)*sz,vy:-rnd(150,520)*Math.sqrt(sz),r:rnd(1.5,4)})}for(let i=0;i<10;i++)bubbles.push({x:x+rnd(-w/2,w/2),y:y+rnd(5,40),r:rnd(2,5),vy:rnd(-30,-70)})}
/* ---------- announcing ---------- */
function msg(html,ms=4200){const m=$('#floatMsg');m.innerHTML=html;m.classList.add('show');clearTimeout(msg.t);msg.t=setTimeout(()=>m.classList.remove('show'),ms)}
function settle(b){b.done=true;if(b.clay)return claySettle(b);
  const fl=b.o.d<1;const k=fl?'float':'sink';let pre='';
  if(b.guess){if(b.guess===k){pre='You were right! ';SFX.chime()}else{pre='Surprise! ';SFX.oops()}}else if(fl)SFX.plop();else SFX.glug();
  if(!results[k].has(b.id)){results[k].add(b.id);const box=$(fl?'#resFloat .res-items':'#resSink .res-items');const im=document.createElement('img');im.src='assets/obj-'+b.id+'.webp';im.alt=b.o.name;box.appendChild(im)}
  msg(`<svg><use href="#i-${k}"/></svg><img src="assets/obj-${b.id}.webp" alt="">${b.guess?`<span class="${b.guess===k?'ok':'no'}"></span>`:''}`);
  speak(pre+b.o.say);
  if(results.float.size+results.sink.size===window.OBJECTS.length&&!settle.all){settle.all=true;setTimeout(()=>{confetti();SFX.cheer();speak('You tested everything! Things that are light for their size float. Things that are heavy for their size sink. Now try making a clay boat!');$('#floatMode [data-m=clay]').classList.add('glow')},3200)}}
/* ---------- tray ---------- */
const tray=$('#tray');
tray.innerHTML=window.OBJECTS.map(o=>`<button class="obj" data-id="${o.id}" aria-label="${o.name}"><img src="assets/obj-${o.id}.webp" alt="" draggable="false"></button>`).join('');
function trayState(){$$('.obj',tray).forEach(b=>{b.classList.toggle('used',bodies.some(x=>x.id===b.dataset.id));b.classList.toggle('tested',results.float.has(b.dataset.id)||results.sink.has(b.dataset.id))})}
let ghost=null;
$$('.obj',tray).forEach(btn=>{
  btn.addEventListener('pointerdown',e=>{unlockAudio();if(btn.classList.contains('used'))return;e.preventDefault();const o=window.OBJECTS.find(x=>x.id===btn.dataset.id);
    const sx=e.clientX,sy=e.clientY;let moved=false;btn.setPointerCapture(e.pointerId);
    const mv=ev=>{if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>12){moved=true;ghost=document.createElement('img');ghost.className='drag-ghost';ghost.src='assets/obj-'+o.id+'.webp';ghost.style.width=o.w*T.s+'px';document.body.appendChild(ghost)}
      if(ghost){ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px'}};
    const up=ev=>{btn.removeEventListener('pointermove',mv);btn.removeEventListener('pointerup',up);btn.removeEventListener('pointercancel',up);
      if(ghost){ghost.remove();ghost=null;const r=cv.getBoundingClientRect();const x=ev.clientX-r.left,y=ev.clientY-r.top;
        if(x>T.x0&&x<T.x1&&y>0&&y<T.y1){clearHover();const b=mkBody(o,clamp(x,T.x0+40,T.x1-40),Math.min(y,T.base-o.h*T.s));bodies.push(b);SFX.whoosh();trayState()}}
      else if(!moved){hoverObj(o)}};
    btn.addEventListener('pointermove',mv);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up)})});
function clearHover(){bodies=bodies.filter(b=>b.state!=='hover');$('#guess').classList.remove('show');pending=null;trayState()}
function hoverObj(o){clearHover();SFX.tap();const free=freeX(o.w*T.s);const b=mkBody(o,free,T.y0-40);b.state='hover';bodies.push(b);pending=b;trayState();
  $('#guess').classList.add('show');positionGuess();speak(o.name+'. Will it float, or sink?')}
function freeX(w){let best=(T.x0+T.x1)/2,bs=-1;for(let k=0;k<12;k++){const x=lerp(T.x0+w/2+10,T.x1-w/2-10,k/11);const d=Math.min(...bodies.filter(b=>b.state!=='hover').map(b=>Math.abs(b.x-x)-b.w/2),9999);if(d>bs){bs=d;best=x}}return best}
function positionGuess(){const g=$('#guess');if(!pending)return;g.style.top=Math.max(4,T.y0+18)+'px'}
$$('.guess-btn').forEach(b=>onTap(b,()=>{if(!pending)return;const p=pending;p.guess=b.dataset.g;p.state='fall';p.vy=0;pending=null;$('#guess').classList.remove('show');SFX.whoosh();stopSpeak()}));
onTap($('#emptyTank'),()=>{SFX.glug();bodies=[];clearHover();T.rise=0;$('#floatMsg').classList.remove('show')});
/* ---------- grab things in the tank ---------- */
cv.addEventListener('pointerdown',e=>{unlockAudio();const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  const b=[...bodies].reverse().find(b=>Math.abs(x-b.x)<b.w/2+14&&Math.abs(y-b.y)<b.h/2+14);if(!b)return;
  if(b.state==='hover'){b.state='held'}
  if(b.clay&&mode==='clay'&&b.state!=='held'&&!b.flooded&&b.still>.3&&false)return;
  held={b,dx:b.x-x,dy:b.y-y,px:x,py:y,t:performance.now(),moved:false,vy:0};b.state='held';b.done=false;b.still=0;cv.setPointerCapture(e.pointerId);
  if(b===pending){pending=null;$('#guess').classList.remove('show')}});
cv.addEventListener('pointermove',e=>{if(!held)return;const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,b=held.b;
  if(Math.hypot(x-held.px,y-held.py)>6)held.moved=true;const now=performance.now(),ny=clamp(y+held.dy,20,T.y1-10-b.h/2);held.vy=(ny-b.y)/Math.max(.008,(now-held.t)/1000);held.t=now;b.x=x+held.dx;b.y=ny});
const rel=e=>{if(!held)return;const b=held.b;b.state='fall';b.vy=clamp(held.vy,-900,900)*.6;b.done=b.clay?false:false;b.floorHit=false;
  if(b.clay&&!held.moved)nextShape();held=null};
cv.addEventListener('pointerup',rel);cv.addEventListener('pointercancel',rel);
/* ---------- clay boat ---------- */
let clay=null,best=+localStorage.getItem('clay-best')||0;$('#bestN').textContent=best;
const CLAYSZ=[[96,96],[180,30],[170,62],[230,70]];
function newClay(shape){bodies=bodies.filter(b=>!b.clay);clay={clay:true,shape,pennies:0,flooded:false,x:(T.x0+T.x1)/2,y:T.y0-30,bw:CLAYSZ[shape][0],bh:CLAYSZ[shape][1],vy:0,rot:0,state:'fall',still:0,done:false,wasIn:false,floorHit:false,o:{d:1.7}};
  clay.w=clay.bw*T.s;clay.h=clay.bh*T.s;bodies.push(clay);T.rise=T.rise*.3;updPenny();
  $$('#shapes button').forEach(b=>b.classList.toggle('on',+b.dataset.s===shape))}
function nextShape(){SFX.creak();newClay((clay.shape+1)%4)}
$$('#shapes button').forEach(b=>onTap(b,()=>{SFX.creak();newClay(+b.dataset.s);$$('#shapes button').forEach(x=>x.classList.remove('glow'))}));
function updPenny(){$('#pennyN').textContent=clay?clay.pennies:0;$('#addPenny').classList.toggle('off',!clay||clay.shape<2||clay.flooded)}
onTap($('#addPenny'),()=>{if(!clay)return;if(clay.shape<2){speak('Make a bowl or a boat first.');$$('#shapes button').forEach((b,i)=>b.classList.toggle('glow',i>=2));return}
  if(clay.flooded){speak('Your boat sank! Tap start over to try again.');return}
  clay.pennies++;clay.done=false;clay.still=0;SFX.plop();tone({t:.05,f:2100,f2:1900,dur:.12,vol:.06});clay.vy+=60;updPenny();
  if(clay.pennies>best&&!clay.flooded){}});
onTap($('#clayReset'),()=>{SFX.tap();newClay(clay?clay.shape:0)});
function flood(b){b.flooded=true;b.done=true;SFX.glug();setTimeout(SFX.glug,500);splash(b.x,T.base-T.rise,.6,b.w);updPenny();
  const n=b.pennies-1;msg(`<svg><use href="#i-sink"/></svg><svg><use href="#i-penny"/></svg><b>${Math.max(0,n)}</b>`,6000);
  if(n>best){best=n;localStorage.setItem('clay-best',best);$('#bestN').textContent=best;setTimeout(()=>{SFX.cheer();confetti(40)},600)}
  speak(`Too heavy! The water came over the side, and the boat sank. It held ${Math.max(0,n)} ${n===1?'penny':'pennies'}. Tap start over, and try again!`)}
function claySettle(b){if(b.flooded)return;const s=b.shape,fl=s>=2;
  if(b.pennies>0){if(b.pennies>best){best=b.pennies;localStorage.setItem('clay-best',best);$('#bestN').textContent=best}
    if(b.pennies%3===0)speak(b.pennies+' pennies, and still floating! See the water go up?');b.done=true;return}
  const say=['The ball of clay sinks! Clay is heavy for its size. Tap a new shape to squish it.','The flat clay still sinks. It has no sides to hold back the water. Try a bowl!','It floats! The bowl shape pushes away lots of water. Tap the penny to add cargo.','The boat shape floats best! It is wide, with tall sides. Load it up with pennies!'][s];
  if(fl)SFX.chime();else SFX.glug();msg(`<svg><use href="#i-clay-${['ball','flat','bowl','boat'][s]}"/></svg><svg><use href="#i-${fl?'float':'sink'}"/></svg>`);speak(say);
  if(!fl)$$('#shapes button').forEach((x,i)=>x.classList.toggle('glow',i===s+1));else $$('#shapes button').forEach(x=>x.classList.remove('glow'));
  if(fl)$('#addPenny').classList.add('glow');b.done=true}
/* ---------- drawing ---------- */
const clayTex=Array.from({length:40},()=>({x:Math.random(),y:Math.random(),r:rnd(.03,.09),a:rnd(.05,.14)}));
function drawClay(b){const w=b.w,h=b.h,s=b.shape;cx.save();cx.translate(b.x,b.y);cx.rotate(b.rot);
  const g=cx.createLinearGradient(0,-h/2,0,h/2);g.addColorStop(0,'#6cc497');g.addColorStop(.5,'#44a074');g.addColorStop(1,'#2a6e4f');
  cx.beginPath();
  if(s===0){cx.ellipse(0,0,w/2,h/2,0,0,7)}
  else if(s===1){cx.ellipse(0,0,w/2,h/2,0,0,7)}
  else if(s===2){cx.moveTo(-w/2,-h/2);cx.bezierCurveTo(-w/2,h*.7,w/2,h*.7,w/2,-h/2);cx.closePath()}
  else{cx.moveTo(-w/2,-h/2);cx.lineTo(w/2,-h/2);cx.quadraticCurveTo(w*.44,h*.45,w*.3,h/2);cx.lineTo(-w*.3,h/2);cx.quadraticCurveTo(-w*.44,h*.45,-w/2,-h/2);cx.closePath()}
  cx.fillStyle=g;cx.fill();cx.save();cx.clip();
  if(s===0){const rg=cx.createRadialGradient(-w*.18,-h*.2,2,0,0,w*.6);rg.addColorStop(0,'rgba(255,255,255,.35)');rg.addColorStop(.4,'rgba(255,255,255,0)');rg.addColorStop(1,'rgba(0,0,0,.25)');cx.fillStyle=rg;cx.fillRect(-w,-h,w*2,h*2)}
  clayTex.forEach(t=>{cx.fillStyle=`rgba(20,60,40,${t.a})`;cx.beginPath();cx.ellipse((t.x-.5)*w,(t.y-.5)*h,t.r*w*.6,t.r*h*.5,t.x*3,0,7);cx.fill()});cx.restore();
  if(s>=2){// opening + pennies + flood water
    const ow=w*(s===2?.5:.5)-4,oh=Math.max(5,h*.12);cx.beginPath();cx.ellipse(0,-h/2,ow,oh,0,0,7);cx.fillStyle='#24573f';cx.fill();
    for(let i=0;i<b.pennies;i++){const row=Math.floor(i/6),col=i%6;const px=(col-2.5)*ow*.3+(row%2)*6,py=-h/2+oh*.2-row*4;cx.beginPath();cx.ellipse(px,py,9*T.s,4*T.s,0,0,7);cx.fillStyle='#c57a45';cx.fill();cx.strokeStyle='#7a3f1f';cx.lineWidth=1;cx.stroke()}
    if(b.flooded){cx.beginPath();cx.ellipse(0,-h/2,ow,oh,0,0,7);cx.fillStyle='rgba(60,150,210,.7)';cx.fill()}
    cx.beginPath();cx.ellipse(0,-h/2,ow+3,oh+2,0,0,7);cx.strokeStyle='#5bb589';cx.lineWidth=3;cx.stroke()}
  cx.restore()}
function draw(){const now=performance.now()/1000;cx.setTransform(DPR,0,0,DPR,0,0);cx.clearRect(0,0,W,H);
  const surf=T.base-T.rise;
  // table
  const tg=cx.createLinearGradient(0,T.y1,0,H);tg.addColorStop(0,'#8a5a32');tg.addColorStop(1,'#5b3a20');cx.fillStyle=tg;cx.fillRect(0,T.y1+6,W,H);
  cx.fillStyle='rgba(0,0,0,.25)';cx.beginPath();cx.ellipse((T.x0+T.x1)/2,T.y1+10,T.w*.55,14,0,0,7);cx.fill();
  // back glass
  cx.fillStyle='rgba(200,230,240,.10)';cx.fillRect(T.x0,T.y0,T.w,T.h);
  // start line + ruler
  cx.save();cx.setLineDash([10,8]);cx.strokeStyle='rgba(255,170,60,.9)';cx.lineWidth=2.5;cx.beginPath();cx.moveTo(T.x0-14,T.base);cx.lineTo(T.x0+30,T.base);cx.stroke();cx.restore();
  for(let y=T.y1-10,i=0;y>T.y0+10;y-=12*T.s,i++){cx.fillStyle='rgba(255,255,255,.55)';cx.fillRect(T.x0+4,y,i%5===0?16:8,1.5)}
  // bodies
  bodies.forEach(b=>{if(b.clay)return drawClay(b);const im=IM[b.id];if(!im.complete)return;cx.save();cx.translate(b.x,b.y);cx.rotate(b.rot);
    if(b.state==='hover'||b.state==='held'){cx.shadowColor='rgba(0,0,0,.35)';cx.shadowBlur=18;cx.shadowOffsetY=10}
    const ar=im.naturalWidth/im.naturalHeight;let dw=b.w,dh=b.w/ar;if(dh>b.h){dh=b.h;dw=b.h*ar}cx.drawImage(im,-dw/2,-dh/2,dw,dh);cx.restore()});
  // water body
  const n=cols.length,dx=T.w/(n-1);cx.beginPath();cx.moveTo(T.x0,T.y1);for(let i=0;i<n;i++){const y=surf+cols[i].h+Math.sin(now*2+i*.35)*1.3;cx.lineTo(T.x0+i*dx,y)}cx.lineTo(T.x1,T.y1);cx.closePath();
  const wg=cx.createLinearGradient(0,surf,0,T.y1);wg.addColorStop(0,'rgba(70,170,225,.42)');wg.addColorStop(1,'rgba(12,78,140,.66)');cx.fillStyle=wg;cx.fill();
  cx.save();cx.clip();cx.globalCompositeOperation='lighter';for(let k=0;k<7;k++){const x=T.x0+((k*137+now*18)%T.w);cx.fillStyle='rgba(180,230,255,.05)';cx.beginPath();cx.moveTo(x,surf);cx.lineTo(x+40,surf);cx.lineTo(x-30+Math.sin(now+k)*20,T.y1);cx.lineTo(x-80+Math.sin(now+k)*20,T.y1);cx.fill()}
  bubbles.forEach(p=>{cx.strokeStyle='rgba(230,248,255,.75)';cx.lineWidth=1.2;cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.stroke()});cx.restore();
  // surface line
  cx.beginPath();for(let i=0;i<n;i++){const y=surf+cols[i].h+Math.sin(now*2+i*.35)*1.3;i?cx.lineTo(T.x0+i*dx,y):cx.moveTo(T.x0,y)}cx.strokeStyle='rgba(235,250,255,.85)';cx.lineWidth=2.2;cx.stroke();
  // level marker
  cx.fillStyle='#ffb347';cx.beginPath();cx.moveTo(T.x0-4,surf);cx.lineTo(T.x0-18,surf-8);cx.lineTo(T.x0-18,surf+8);cx.fill();
  // splash drops
  parts.forEach(p=>{cx.fillStyle='rgba(200,235,255,.9)';cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fill()});
  // glass front
  const gg=cx.createLinearGradient(T.x0,0,T.x1,0);gg.addColorStop(0,'rgba(255,255,255,.28)');gg.addColorStop(.04,'rgba(255,255,255,.06)');gg.addColorStop(.12,'rgba(255,255,255,0)');gg.addColorStop(.85,'rgba(255,255,255,0)');gg.addColorStop(.93,'rgba(255,255,255,.14)');gg.addColorStop(1,'rgba(255,255,255,.3)');
  cx.fillStyle=gg;cx.fillRect(T.x0,T.y0,T.w,T.h);
  cx.strokeStyle='rgba(220,240,250,.75)';cx.lineWidth=4;cx.strokeRect(T.x0,T.y0,T.w,T.h);
  cx.fillStyle='#2b3a44';cx.fillRect(T.x0-8,T.y1-2,T.w+16,12);
  cx.fillStyle='rgba(255,255,255,.35)';cx.fillRect(T.x0+10,T.y0+12,5,T.h*.55);
}
function loop(t){if(!running)return;const dt=Math.min(.04,(t-last)/1000||.016);last=t;step(dt);draw();requestAnimationFrame(loop)}
function setMode(m){mode=m;$$('#floatMode button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));$('#fsObjects').classList.toggle('on',m==='objects');$('#fsClay').classList.toggle('on',m==='clay');
  bodies=[];T.rise=0;clearHover();$('#floatMsg').classList.remove('show');stopSpeak();if(m==='clay'){$('#floatMode [data-m=clay]').classList.remove('glow');newClay(0);setTimeout(()=>speak('Here is a ball of clay. Will it float? Watch! Then tap a new shape to squish it into a boat.'),300)}trayState()}
$$('#floatMode button').forEach(b=>onTap(b,()=>{SFX.tap();setMode(b.dataset.m)}));
registerView('float',{t:'Float or Sink',ico:'i-drop',help:()=>mode==='clay'?'Make the clay into a boat shape. Then tap the penny to load it. How many pennies can your boat hold before it sinks?':'Tap a thing, then guess. Will it float, or sink? You can also drag things into the water, and push them down.',
  enter(){resize();running=true;last=performance.now();requestAnimationFrame(loop)},leave(){running=false;stopSpeak()}});
window.FLOAT={get bodies(){return bodies},T,setMode};
})();
