'use strict';
(()=>{
const P=window.PARTS,inner=$('#spInner');
P.forEach(p=>{const b=document.createElement('button');b.className='hot';b.dataset.id=p.id;b.style.left=p.x*100+'%';b.style.top=p.y*100+'%';b.setAttribute('aria-label',p.name);b.innerHTML='<i></i><span class="lbl">'+p.name+'</span>';inner.appendChild(b);onTap(b,()=>hit(p,b))});
let mode='learn',target=null,stars=0,asked=[];
function fit(){const box=$('#shipPhoto');const W=box.clientWidth,H=box.clientHeight,ar=1600/1067;let w=W,h=W/ar;if(h>H){h=H;w=H*ar}inner.style.width=w+'px';inner.style.height=h+'px'}
addEventListener('resize',()=>{if(CUR==='parts')fit()});
function flash(b,cls){b.classList.remove('ok','no','show');void b.offsetWidth;b.classList.add(cls);setTimeout(()=>b.classList.remove(cls),2200)}
function hit(p,b){if(mode==='learn'){SFX.tap();flash(b,'show');speak(p.name+'. '+p.say);return}
  if(!target)return ask();
  if(p.id===target.id){stars++;SFX.chime();flash(b,'ok');renderStars();speak(`Yes! That is the ${p.name.toLowerCase()}.`);target=null;if(stars%5===0){confetti(50);SFX.cheer()}setTimeout(()=>{if(mode==='quiz'&&CUR==='parts')ask()},2300)}
  else{SFX.oops();flash(b,'no');speak(`That is the ${p.name.toLowerCase()}. Find the ${target.name.toLowerCase()}!`)}}
function renderStars(){$('#quizStars').innerHTML=Array.from({length:Math.max(5,Math.ceil(stars/5)*5)},(_,i)=>`<svg class="${i<stars?'on':''}"><use href="#i-star"/></svg>`).join('')}
function ask(){if(asked.length>=P.length)asked=[];const left=P.filter(p=>!asked.includes(p.id));target=left[Math.floor(Math.random()*left.length)];asked.push(target.id);speak(`Find the ${target.name.toLowerCase()}!`,$('#quizSay'))}
onTap($('#quizSay'),()=>{if(target)speak(`Find the ${target.name.toLowerCase()}!`,$('#quizSay'));else ask()});
function setMode(m){mode=m;$$('#partsMode button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));$('#v-parts').classList.toggle('quiz',m==='quiz');stopSpeak();target=null;if(m==='quiz'){renderStars();setTimeout(ask,300)}}
$$('#partsMode button').forEach(b=>onTap(b,()=>{SFX.tap();setMode(b.dataset.m)}));
$$('#portStar .side').forEach(g=>onTap(g,()=>{const s=g.dataset.side;g.classList.remove('blink');void g.getBoundingClientRect();g.classList.add('blink');SFX.tap();
  speak(s==='port'?'Port! When you face the front of the ship, port is your left side. Port has a red light.':'Starboard! When you face the front of the ship, starboard is your right side. Starboard has a green light.')}));
onTap($('#anchorBtn'),()=>{const a=$('#anchorDrop');a.classList.remove('drop');void a.offsetWidth;a.classList.add('drop');SFX.chain();setTimeout(()=>SFX.splash(.8),1100);speak('Drop the anchor! The heavy anchor digs into the sea floor, so the ship stays still.')});
onTap($('#hornBtn'),()=>{stopSpeak();SFX.horn(1.4,92);setTimeout(()=>SFX.horn(.5,92),1700)});
registerView('parts',{t:'Parts of a Ship',ico:'i-anchor',help:()=>mode==='quiz'?'Listen, then tap the part of the ship. Tap the speaker to hear it again.':'Tap the glowing dots to learn the parts of a real ship. This is the U S S Constitution. Tap the magnifying glass to play a finding game.',
  enter(){fit();requestAnimationFrame(fit)}});
window.PARTSAPP={setMode,get target(){return target}};
})();
window.addEventListener('load',()=>{window.__ready=true});
