'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,rnd=(a,b)=>a+Math.random()*(b-a);
const isPhone=()=>innerWidth<720;
// tap helper: fires on pointerup if the finger didn't travel (so scrolling strips still scroll)
function onTap(el,fn){if(!el)return;let sx=0,sy=0,id=null;
  el.addEventListener('pointerdown',e=>{id=e.pointerId;sx=e.clientX;sy=e.clientY});
  el.addEventListener('pointerup',e=>{if(e.pointerId!==id)return;id=null;if(Math.hypot(e.clientX-sx,e.clientY-sy)<14){unlockAudio();fn(e)}});
  el.addEventListener('pointercancel',()=>{id=null});
  el.addEventListener('click',e=>{if(e.detail===0){unlockAudio();fn(e)}}); // keyboard
}
// stop iOS pinch/double-tap zoom and rubber-banding
document.addEventListener('gesturestart',e=>e.preventDefault());
document.addEventListener('dblclick',e=>e.preventDefault());
document.addEventListener('contextmenu',e=>e.preventDefault());
// keep Safari's edge swipe (back / forward) from leaving the app by accident
document.addEventListener('touchstart',e=>{const t=e.touches[0];if(t&&(t.clientX<24||t.clientX>innerWidth-24))e.preventDefault()},{passive:false});

/* ---------- sound (all made in the browser) ---------- */
let AC=null,MASTER=null;
function ac(){if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AC=new C();MASTER=AC.createGain();MASTER.gain.value=.8;MASTER.connect(AC.destination)}if(AC.state==='suspended')AC.resume();return AC}
function unlockAudio(){if(!unlockAudio.sp&&'speechSynthesis' in window){unlockAudio.sp=true;try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u)}catch(e){}}const c=ac();if(c&&!unlockAudio.done){const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(MASTER);s.start(0);unlockAudio.done=true}}
let NOISE=null;function noiseBuf(){const c=ac();if(!NOISE){NOISE=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const d=NOISE.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}return NOISE}
function env(g,t,a,peak,dec,end=0.0001){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(end,t+a+dec)}
function noise({t=0,dur=.4,type='lowpass',f=1200,f2=null,q=1,vol=.5,a=.01}={}){const c=ac();if(!c)return;const T=c.currentTime+t;const s=c.createBufferSource();s.buffer=noiseBuf();s.loop=true;
  const fl=c.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,T);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,T+dur);fl.Q.value=q;const g=c.createGain();env(g,T,a,vol,dur);s.connect(fl);fl.connect(g);g.connect(MASTER);s.start(T,Math.random());s.stop(T+a+dur+.05)}
function tone({t=0,f=440,f2=null,dur=.3,type='sine',vol=.3,a=.01}={}){const c=ac();if(!c)return;const T=c.currentTime+t;const o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f,T);if(f2)o.frequency.exponentialRampToValueAtTime(f2,T+dur);const g=c.createGain();env(g,T,a,vol,dur);o.connect(g);g.connect(MASTER);o.start(T);o.stop(T+a+dur+.05)}
const SFX={
 tap(){tone({f:660,f2:880,dur:.08,type:'triangle',vol:.12})},
 splash(sz=1){noise({dur:.5*sz+.2,f:2600,f2:500,vol:.45*Math.min(1.3,sz),a:.005});noise({t:.03,dur:.35,type:'bandpass',f:900,q:.8,vol:.25});for(let i=0;i<5;i++)tone({t:.08+i*.06+Math.random()*.05,f:rnd(500,1100),f2:rnd(1200,2000),dur:.06,vol:.06})},
 plop(){tone({f:300,f2:900,dur:.09,vol:.3});noise({dur:.12,f:1500,vol:.12})},
 glug(){for(let i=0;i<7;i++)tone({t:i*.11+Math.random()*.04,f:rnd(160,260),f2:rnd(380,620),dur:.07,vol:.22})},
 bubble(){tone({f:rnd(400,700),f2:rnd(900,1400),dur:.05,vol:.07})},
 chime(){[784,988,1175,1568].forEach((f,i)=>{tone({t:i*.08,f,dur:.5,type:'sine',vol:.16});tone({t:i*.08,f:f*2,dur:.3,vol:.04})})},
 oops(){tone({f:330,f2:250,dur:.22,type:'triangle',vol:.18});tone({t:.18,f:262,f2:200,dur:.3,type:'triangle',vol:.16})},
 hammer(n=3){for(let i=0;i<n;i++){const t=i*.18;tone({t,f:180,f2:90,dur:.09,type:'square',vol:.12});noise({t,dur:.08,type:'bandpass',f:1800,q:2,vol:.4,a:.002});tone({t,f:1250,f2:1100,dur:.12,vol:.05})}},
 wood(){noise({dur:.1,type:'bandpass',f:600,q:3,vol:.4,a:.002});tone({f:220,f2:160,dur:.12,type:'triangle',vol:.15})},
 creak(){const c=ac();if(!c)return;const T=c.currentTime;const o=c.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(70,T);o.frequency.linearRampToValueAtTime(110,T+.5);o.frequency.linearRampToValueAtTime(80,T+.9);const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=700;f.Q.value=6;const g=c.createGain();env(g,T,.05,.2,.9);o.connect(f);f.connect(g);g.connect(MASTER);o.start(T);o.stop(T+1)},
 wind(dur=1.6,vol=.35){noise({dur,type:'bandpass',f:400,f2:1100,q:1.2,vol,a:dur*.4});noise({t:.2,dur:dur*.8,type:'bandpass',f:900,f2:500,q:2,vol:vol*.5,a:dur*.3})},
 waves(){for(let i=0;i<3;i++)noise({t:i*.9,dur:.9,f:700,f2:300,vol:.3,a:.35})},
 oars(){for(let i=0;i<4;i++){noise({t:i*.55,dur:.25,f:1800,f2:600,vol:.35,a:.02});noise({t:i*.55+.12,dur:.2,type:'bandpass',f:500,q:2,vol:.15})}},
 horn(dur=1.6,f=110){const c=ac();if(!c)return;const T=c.currentTime;[1,1.5,2].forEach((m,i)=>{const o=c.createOscillator();o.type='sawtooth';o.frequency.value=f*m*(1+i*.003);const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=900;const g=c.createGain();g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(.16/(i+1),T+.12);g.gain.setValueAtTime(.16/(i+1),T+dur-.2);g.gain.exponentialRampToValueAtTime(.0001,T+dur);o.connect(fl);fl.connect(g);g.connect(MASTER);o.start(T);o.stop(T+dur+.05)})},
 liner(){SFX.horn(2.2,82)},
 whistle(){const c=ac();if(!c)return;const T=c.currentTime;[523,659,784].forEach(f=>{const o=c.createOscillator();o.type='triangle';o.frequency.value=f;const g=c.createGain();g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(.08,T+.08);g.gain.setValueAtTime(.08,T+1.1);g.gain.exponentialRampToValueAtTime(.0001,T+1.4);o.connect(g);g.connect(MASTER);o.start(T);o.stop(T+1.5)});noise({dur:1.3,type:'bandpass',f:2500,q:3,vol:.08,a:.08})},
 steam(){for(let i=0;i<6;i++)noise({t:i*.28,dur:.18,type:'highpass',f:1500,vol:.25,a:.01});setTimeout(()=>SFX.whistle(),1700)},
 cannon(){tone({f:90,f2:30,dur:.9,type:'sine',vol:.6,a:.005});noise({dur:1.1,f:900,f2:120,vol:.7,a:.003})},
 jet(){noise({dur:2.2,type:'bandpass',f:600,f2:3200,q:.7,vol:.4,a:.6});tone({dur:2,f:180,f2:900,type:'sawtooth',vol:.03,a:.5})},
 sonar(){[0,1.4].forEach(t=>{tone({t,f:1320,dur:1.2,vol:.18,a:.005});tone({t:t+.25,f:1320,dur:.8,vol:.05,a:.005})})},
 ice(){for(let i=0;i<9;i++)noise({t:i*.09+Math.random()*.06,dur:.08,type:'highpass',f:rnd(1500,4000),vol:.35,a:.002});tone({f:70,f2:40,dur:.6,vol:.3})},
 chain(){for(let i=0;i<14;i++){const t=i*.07;noise({t,dur:.05,type:'bandpass',f:rnd(2500,4200),q:6,vol:.35,a:.002});tone({t,f:rnd(1800,2600),dur:.05,vol:.04})}},
 chug(n=6){for(let i=0;i<n;i++){noise({t:i*.3,dur:.16,type:'lowpass',f:500,vol:.4,a:.01});noise({t:i*.3+.15,dur:.12,type:'highpass',f:2500,vol:.12})}},
 engine(){const c=ac();if(!c)return;const T=c.currentTime;const o=c.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(45,T);o.frequency.linearRampToValueAtTime(70,T+1.2);const l=c.createOscillator();l.frequency.value=14;const lg=c.createGain();lg.gain.value=12;l.connect(lg);lg.connect(o.frequency);const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=400;const g=c.createGain();env(g,T,.3,.3,1.8);o.connect(f);f.connect(g);g.connect(MASTER);o.start(T);l.start(T);o.stop(T+2.2);l.stop(T+2.2)},
 gull(){[0,.35,.6].forEach(t=>tone({t,f:1500,f2:900,dur:.22,type:'triangle',vol:.07}))},
 flap(){for(let i=0;i<5;i++)noise({t:i*.07,dur:.05,type:'bandpass',f:900,q:1.5,vol:.18,a:.003})},
 whoosh(){noise({dur:.5,type:'bandpass',f:500,f2:2000,q:1,vol:.3,a:.1})},
 cheer(){SFX.chime();setTimeout(()=>{[523,659,784,1047].forEach((f,i)=>tone({t:i*.12,f,dur:.35,type:'triangle',vol:.14}))},350)}
};
function shipSound(k){(SFX[k]||SFX.waves)()}

/* ---------- read aloud (device voice) ---------- */
let VOICE=null;
function pickVoice(){const v=speechSynthesis.getVoices();VOICE=v.find(x=>/Samantha|Karen|Moira|Daniel/.test(x.name)&&/^en/.test(x.lang))||v.find(x=>/^en[-_]US/i.test(x.lang)&&/Google|Natural|Enhanced|Premium/i.test(x.name))||v.find(x=>/^en[-_]US/i.test(x.lang))||v.find(x=>/^en/i.test(x.lang))||null}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
let speakBtn=null;
function stopSpeak(){if('speechSynthesis' in window)speechSynthesis.cancel();if(speakBtn){speakBtn.classList.remove('speaking');speakBtn=null}}
function speak(text,btn,opts={}){if(!('speechSynthesis' in window)||!text)return;
  if(btn&&btn===speakBtn&&speechSynthesis.speaking){stopSpeak();return}
  stopSpeak();const u=new SpeechSynthesisUtterance(text);if(VOICE)u.voice=VOICE;u.rate=opts.rate||.9;u.pitch=opts.pitch||1.05;
  if(btn){btn.classList.add('speaking');speakBtn=btn;u.onend=u.onerror=()=>{btn.classList.remove('speaking');if(speakBtn===btn)speakBtn=null}}
  speechSynthesis.speak(u)}
function speakBtnHTML(cls='mini-speak'){return `<button class="${cls}" aria-label="Read aloud"><svg><use href="#i-speak"/></svg></button>`}

/* ---------- views ---------- */
const VIEWS={home:{t:'Ships Ahoy!',ico:'i-anchor',help:'Ahoy, sailor! Tap a picture to play. Tap the speaker any time to hear me talk.'}};
let CUR='home';document.body.dataset.view='home';
function registerView(id,cfg){VIEWS[id]=cfg}
function go(id){if(!VIEWS[id])return;stopSpeak();closeModal(true);
  if(VIEWS[CUR]&&VIEWS[CUR].leave)VIEWS[CUR].leave();
  $$('.view').forEach(v=>v.classList.toggle('on',v.id==='v-'+id));CUR=id;
  document.body.dataset.view=id;$('#tbTitle').textContent=VIEWS[id].t;$('#tbIco use').setAttribute('href','#'+VIEWS[id].ico);
  $('#tbExtra').innerHTML='';
  if(VIEWS[id].enter)VIEWS[id].enter();
  if(id!=='home'&&VIEWS[id].help&&!VIEWS[id].heard){VIEWS[id].heard=true;setTimeout(()=>{if(CUR===id&&!$('#modal').classList.contains('open'))speak(VIEWS[id].help,$('#helpBtn'))},350)}
}
onTap($('#homeBtn'),()=>{SFX.tap();go('home')});
onTap($('#helpBtn'),()=>{const v=VIEWS[CUR];speak(typeof v.help==='function'?v.help():v.help,$('#helpBtn'))});
onTap($('#homeSpeak'),()=>speak(VIEWS.home.help+' Ships of the world. Float or sink. Build a ship. Sail it. Parts of a ship.',$('#homeSpeak')));
$$('.tile').forEach(t=>onTap(t,()=>{SFX.tap();go(t.dataset.go)}));

/* ---------- modal / toast / confetti ---------- */
function openModal(html,cls=''){const m=$('#modal');$('#modalCard').className='modal-card '+cls;$('#modalCard').innerHTML=html;m.classList.add('open');m.setAttribute('aria-hidden','false');
  $$('.mx',m).forEach(b=>onTap(b,()=>closeModal()));return $('#modalCard')}
function closeModal(quiet){const m=$('#modal');if(!m.classList.contains('open'))return;m.classList.remove('open');m.setAttribute('aria-hidden','true');if(!quiet)stopSpeak();if(closeModal.cb){const f=closeModal.cb;closeModal.cb=null;f()}}
$('#modal').addEventListener('pointerdown',e=>{if(e.target.id==='modal')closeModal()});
let toastT=0;function toast(html,ms=2200){const t=$('#toast');t.innerHTML=html;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),ms)}
function confetti(n=70){const box=$('#confetti');const cols=['#f2c94c','#eb5757','#2d9cdb','#27ae60','#fff','#f2994a'];for(let i=0;i<n;i++){const s=document.createElement('i');s.style.left=rnd(0,100)+'%';s.style.background=cols[i%cols.length];s.style.animationDelay=rnd(0,.5)+'s';s.style.animationDuration=rnd(1.6,2.8)+'s';s.style.setProperty('--dx',rnd(-80,80)+'px');s.style.setProperty('--r',rnd(-720,720)+'deg');box.appendChild(s);setTimeout(()=>s.remove(),3600)}}

/* ---------- credits ---------- */
onTap($('#creditsBtn'),()=>openModal(`<button class="mx" aria-label="Close"><svg><use href="#i-close"/></svg></button><div class="credits"><h2>Photo credits</h2><ul>${(window.CREDITS||[]).map(c=>`<li><b>${c.title.replace(/\.(jpe?g|png|tiff?)$/i,'')}</b> \u2014 ${c.artist||'Unknown'}. ${c.license}${c.licurl?` (<a href="${c.licurl}" target="_blank" rel="noopener">license</a>)`:''}. <a href="${c.page}" target="_blank" rel="noopener">Source</a>${c.note?'. '+c.note:''}</li>`).join('')}<li>Drawings of the ship parts, the tank, the clay and the sailing sea are drawn by this app. Sounds are made in the browser. Read-aloud uses your device's voice. Fonts: Fraunces and Nunito (SIL Open Font License).</li></ul></div>`,'wide'));
