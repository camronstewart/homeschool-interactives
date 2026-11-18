'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const NS='http://www.w3.org/2000/svg';
const LS={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let __lastTap=0;
function onTap(el,fn){let d=null;
  el.addEventListener('pointerdown',e=>{d={x:e.clientX,y:e.clientY,id:e.pointerId}});
  el.addEventListener('pointerup',e=>{if(d&&d.id===e.pointerId&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<14){__lastTap=Date.now();fn(e)}d=null});
  el.addEventListener('pointercancel',()=>d=null);
  el.addEventListener('click',e=>{if(Date.now()-__lastTap<700)return;fn(e)})}

/* ---------------- content ---------------- */
const T={
 smith:{name:'Blacksmith',sign:'anvil',signWord:'anvil',lot:[560,340,230,165],kind:'smithy',
  photo:'smith.jpg',cap:'A blacksmith at his forge, Old Sturbridge Village',
  story:['Clang, clang! The blacksmith heats iron in a roaring fire until it glows orange. Then he hammers it into shape on his heavy anvil.','Every horse needed shoes, and every farm needed nails, hinges, pots, and plow blades.'],
  made:['Horseshoes','Nails','Hinges','Pots & kettles','Plow blades','Tools'],
  objs:[['made-smith.webp','A horseshoe']],
  how:'A farmer might pay the blacksmith with a load of firewood or a ham instead of coins.',
  need:'Shoes for the horse',needImg:'made-smith.webp',paid:'Paid with a load of firewood',
  act:'Hammer the iron!',snd:'clang'},
 printer:{name:'Printer',sign:'book',signWord:'open book',lot:[1080,320,230,165],kind:'shop',
  photo:'printer.jpg',cap:'Inking the type on a hand press',
  story:['The printer sets tiny metal letters, one at a time, to spell every word. He dabs them with ink and presses paper down on them with a big wooden press.','Benjamin Franklin started out as a printer! Printers spread the news about liberty all through the colonies.'],
  made:['Newspapers','Almanacs','Books','Posters'],
  objs:[['made-printer.jpg','Franklin’s Pennsylvania Gazette']],
  how:'A newspaper was passed from family to family and read out loud at the tavern, so everyone could hear the news.',
  need:'The news!',needImg:'made-printer.jpg',paid:'A few pennies, then shared with the neighbors',
  act:'Pull the press!',snd:'press'},
 silver:{name:'Silversmith',sub:'Paul Revere',sign:'teapot',signWord:'teapot',lot:[1080,640,230,165],kind:'shop',
  photo:'silver.jpg',cap:'Paul Revere, painted by John Singleton Copley around 1768',
  story:['Paul Revere was a silversmith in Boston. He hammered silver into shining teapots, spoons, and cups. In this painting he is holding a teapot he made!','In 1775 he rode through the night to warn that British soldiers were coming.'],
  made:['Teapots','Spoons','Cups','Buckles'],
  objs:[['made-silver.webp','A teapot made by Paul Revere'],['made-spoon.jpg','A Revere spoon']],
  how:'There were no banks nearby. Families saved silver coins by having them made into spoons and cups, and could sell the silver if they needed money.',
  need:'A silver spoon for the baby',needImg:'made-spoon.jpg',paid:'Paid with old silver coins, melted down',
  act:'Tap the silver!',snd:'tink'},
 cooper:{name:'Cooper',sign:'barrel',signWord:'barrel',lot:[560,650,230,165],kind:'shop',
  photo:'cooper.jpg',cap:'A cooper at work, Colonial Williamsburg',
  story:['The cooper makes barrels, buckets, and tubs. He shapes curved wooden boards called staves and holds them tight with hoops.','A good barrel does not leak a single drop!'],
  made:['Barrels','Buckets','Tubs','Churns'],objs:[],
  how:'There were no refrigerators. Families packed meat in salt and kept flour, apples, and cider in barrels from the cooper.',
  need:'A barrel for salt pork',needImg:'tok-cooper.jpg',paid:'Paid with a basket of apples',
  act:'Knock on the hoops!',snd:'knock'},
 farmer:{name:'Farmer',sign:'wheat',signWord:'wheat',lot:[1350,80,225,300],kind:'farm',
  photo:'farmer.jpg',cap:'A team of oxen and their driver',
  story:['Almost every family farmed. Strong oxen pulled the plow, and children helped plant, weed, and pick.','Farms grew wheat and corn, kept cows and sheep, and grew flax to make linen.'],
  made:['Wheat & corn','Milk & butter','Wool','Flax','Eggs'],
  objs:[['made-farmer.jpg','Plowing, from an encyclopedia of the 1700s']],
  how:'Families grew most of their own food and traded what they had extra with their neighbors.',
  need:'Wheat and corn to eat',needImg:'made-farmer.jpg',paid:'Grown by our own hands',
  act:'Ring the cowbell!',snd:'cowbell'},
 miller:{name:'Miller',sign:'wheel',signWord:'water wheel',lot:[300,290,215,160],kind:'mill',
  photo:'miller.jpg',cap:'A water-powered gristmill, Old Sturbridge Village',
  story:['Rushing water turns the big wheel. The wheel turns two heavy millstones that grind wheat and corn into flour.','That is why the mill is always built beside a river!'],
  made:['Flour','Cornmeal'],
  objs:[['made-miller.jpg','Millstones inside a mill'],['provo-mill.jpg','A pioneer millstone in Provo, Utah']],
  how:'Farmers brought sacks of grain to the mill. The miller kept a small share of the grain as his pay. It was called the toll.',
  need:'Flour for bread',needImg:'made-miller.jpg',paid:'The miller kept a share of the grain',
  act:'Open the water gate!',snd:'water'},
 weaver:{name:'Weaver',sign:'shuttle',signWord:'shuttle',lot:[1350,650,225,170],kind:'cottage',
  photo:'weaver.jpg',cap:'A wooden hand loom',
  story:['At home, mothers and girls spun wool and flax into thread on a spinning wheel. The weaver used a big loom to weave the thread into cloth.','Before the war, many families wore homespun cloth instead of buying British cloth, to show they wanted to be free.'],
  made:['Wool cloth','Linen','Blankets','Coverlets'],
  objs:[['made-weaver.jpg','Weaving on a hand loom']],
  how:'Cloth was precious. Clothes were mended, handed down to younger brothers and sisters, and made over again.',
  need:'Cloth for a new coat',needImg:'made-weaver.jpg',paid:'Paid with yarn Mother spun, plus some butter',
  act:'Throw the shuttle!',snd:'loom'}
};
const ORDER=['smith','miller','farmer','cooper','printer','weaver','silver'];
let done=new Set(LS.get('ct.done',[]).filter(k=>T[k]));

/* ---------------- audio ---------------- */
let AC=null;
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
window.addEventListener('pointerdown',()=>ac(),{once:true});
function noiseBuf(sec){const a=ac();const b=a.createBuffer(1,a.sampleRate*sec,a.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b}
function tone(f,t0,dur,vol,type='sine',dest){const a=ac();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;
  g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.004);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(g).connect(dest||a.destination);o.start(t0);o.stop(t0+dur+.05)}
function burst(t0,dur,vol,f,q,type='bandpass'){const a=ac();if(!a)return;const s=a.createBufferSource();s.buffer=noiseBuf(dur+.05);const bq=a.createBiquadFilter();bq.type=type;bq.frequency.value=f;bq.Q.value=q;
  const g=a.createGain();g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);s.connect(bq).connect(g).connect(a.destination);s.start(t0)}
const SND={
 clang(){const a=ac();if(!a)return;const t=a.currentTime;[1,2.76,5.4,8.93].forEach((m,i)=>tone(620*m,t,1.4/(i+1),.18/(i+1),'sine'));burst(t,.05,.5,3000,1)},
 press(){const a=ac();if(!a)return;const t=a.currentTime;burst(t,.25,.6,180,1,'lowpass');tone(70,t,.3,.4);burst(t+.32,.08,.3,1200,3)},
 tink(){const a=ac();if(!a)return;const t=a.currentTime;[0,.18].forEach(d=>{[1,2.4,4.1].forEach((m,i)=>tone(1900*m,t+d,.6/(i+1),.08/(i+1)))})},
 knock(){const a=ac();if(!a)return;const t=a.currentTime;[0,.16,.32].forEach(d=>{burst(t+d,.09,.7,500,4);tone(160,t+d,.12,.25)})},
 cowbell(){const a=ac();if(!a)return;const t=a.currentTime;[0,.35].forEach(d=>{tone(545,t+d,.6,.12,'square');tone(815,t+d,.6,.08,'square')})},
 water(){const a=ac();if(!a)return;const t=a.currentTime;const s=a.createBufferSource();s.buffer=noiseBuf(2.5);const bq=a.createBiquadFilter();bq.type='lowpass';bq.frequency.value=900;
  const g=a.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.35,t+.4);g.gain.linearRampToValueAtTime(0,t+2.4);s.connect(bq).connect(g).connect(a.destination);s.start(t);tone(55,t+.3,2,.2)},
 loom(){const a=ac();if(!a)return;const t=a.currentTime;[0,.22,.6,.82].forEach(d=>burst(t+d,.07,.8,900,5))},
 chime(){const a=ac();if(!a)return;const t=a.currentTime;[523,659,784,1047].forEach((f,i)=>tone(f,t+i*.09,.9,.12))},
 nope(){const a=ac();if(!a)return;const t=a.currentTime;tone(330,t,.2,.12,'triangle');tone(262,t+.14,.3,.12,'triangle')}
};

/* ---------------- speech ---------------- */
let voice=null;
function pickVoice(){const vs=speechSynthesis.getVoices();voice=vs.find(v=>/Samantha|Karen|Moira|Daniel/.test(v.name))||vs.find(v=>/^en[-_]US/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
function speak(text,btn){
  if(!('speechSynthesis' in window)){toast('Reading aloud is not available here');return}
  if(speechSynthesis.speaking){speechSynthesis.cancel();$$('.speaking').forEach(b=>b.classList.remove('speaking'));if(btn&&btn._on){btn._on=false;return}}
  const u=new SpeechSynthesisUtterance(text.replace(/\s+/g,' '));if(voice)u.voice=voice;u.rate=.92;
  if(btn){btn.classList.add('speaking');btn._on=true;u.onend=u.onerror=()=>{btn.classList.remove('speaking');btn._on=false}}
  speechSynthesis.speak(u)}
function hush(){if('speechSynthesis' in window)speechSynthesis.cancel()}
let toastT;function toast(m,ms=2600){const t=$('#toast');t.innerHTML=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),ms)}

/* ---------------- svg helpers ---------------- */
function el(tag,attrs={},parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e}
let seed=17;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
const INK='#4a3420',WASH_RED='#b4654a',WASH_GREEN='#86a05e',WASH_BLUE='#8fb0b8';
/* sign icons, 40x40 */
function icon(name,g,color=INK){
  const P=(d,f=color)=>el('path',{d,fill:f},g), L=(d,w=2.4,c=color)=>el('path',{d,fill:'none',stroke:c,'stroke-width':w,'stroke-linecap':'round'},g);
  if(name==='anvil'){P('M3 11h24c1 4 5 6 11 6v3H27c-2 0-4 2-4 4v3h4v5H10v-5h4v-3c0-2-2-4-4-4H6C4 17 3 14 3 11z')}
  if(name==='book'){P('M20 11C15 7 8 7 3 9v23c5-2 12-2 17 2c5-4 12-4 17-2V9c-5-2-12-2-17 2z');L('M20 12v21',1.6,'#f1dfb6');L('M7 15h9M7 20h9M7 25h9M24 15h9M24 20h9M24 25h9',1.2,'#f1dfb6')}
  if(name==='teapot'){el('circle',{cx:20,cy:7,r:2.4,fill:color},g);P('M12 13c0-3 4-5 8-5s8 2 8 5z');P('M10 14h20c1.5 6 1 12-2 17H12c-3-5-3.5-11-2-17z');P('M11 18 2 10l1.5-1.5 9 6z');P('M29 16c6 0 8 3 8 6.5S35 29 29 29v-3c3 0 4.5-1.5 4.5-3.5S32 19 29 19z')}
  if(name==='barrel'){P('M10 5h20c3 4 4.5 9 4.5 15S33 31 30 35H10c-3-4-4.5-9-4.5-15S7 9 10 5z');L('M7 12h26M6.5 28h27',2.6,'#f1dfb6')}
  if(name==='wheat'){L('M20 38V12M20 38 11 15M20 38l9-23',2);[[20,12],[11,15],[29,15]].forEach(([x,y])=>{const a=Math.atan2(y-38,x-20)*180/Math.PI+90;for(let i=0;i<4;i++){const t=i*4.2;const dx=Math.sin(a*Math.PI/180)*t,dy=-Math.cos(a*Math.PI/180)*t;
    el('ellipse',{cx:x-dx-2.2,cy:y-dy+.5,rx:2,ry:3.6,fill:color,transform:`rotate(${a-28} ${x-dx-2.2} ${y-dy+.5})`},g);el('ellipse',{cx:x-dx+2.2,cy:y-dy+.5,rx:2,ry:3.6,fill:color,transform:`rotate(${a+28} ${x-dx+2.2} ${y-dy+.5})`},g)}})}
  if(name==='wheel'){el('circle',{cx:20,cy:20,r:13,fill:'none',stroke:color,'stroke-width':3},g);el('circle',{cx:20,cy:20,r:3,fill:color},g);
    for(let i=0;i<12;i++){const a=i*Math.PI/6;el('rect',{x:18.5,y:2,width:3,height:6,fill:color,transform:`rotate(${i*30} 20 20)`},g);if(i%2==0)L(`M20 20L${20+Math.cos(a)*13} ${20+Math.sin(a)*13}`,1.8)}}
  if(name==='shuttle'){P('M2 20C10 13 30 13 38 20C30 27 10 27 2 20z');P('M13 18h14v4H13z','#f1dfb6');L('M27 20c4 0 6 3 10 8',1.4)}
}
/* little ink buildings */
function building(g,x,y,w,h,{roof=WASH_RED,walls='#efdfb9',chim=true,door=true,win=2}={}){
  const rh=h*.45;
  el('rect',{x,y:y+rh,width:w,height:h-rh,fill:walls,stroke:INK,'stroke-width':2},g);
  el('path',{d:`M${x-6} ${y+rh}L${x+w*.5} ${y}L${x+w+6} ${y+rh}Z`,fill:roof,stroke:INK,'stroke-width':2,'stroke-linejoin':'round'},g);
  for(let i=1;i<6;i++)el('path',{d:`M${x+w*.5-i*w*.09} ${y+rh*i/6}L${x+w*.5+i*w*.09} ${y+rh*i/6}`,stroke:'rgba(60,30,15,.35)','stroke-width':1},g);
  if(chim)el('rect',{x:x+w*.72,y:y+rh*.18,width:w*.09,height:rh*.5,fill:'#9a5b40',stroke:INK,'stroke-width':1.5},g);
  if(door)el('rect',{x:x+w*.44,y:y+h-h*.3,width:w*.12,height:h*.3,fill:'#5b3a22',stroke:INK,'stroke-width':1.5},g);
  const ww=w*.12;for(let i=0;i<win;i++){const wx=i%2?x+w*.72:x+w*.16;el('rect',{x:wx,y:y+rh+(h-rh)*.25,width:ww,height:ww*1.1,fill:'#cfdde0',stroke:INK,'stroke-width':1.4},g);
    el('path',{d:`M${wx+ww/2} ${y+rh+(h-rh)*.25}v${ww*1.1}M${wx} ${y+rh+(h-rh)*.25+ww*.55}h${ww}`,stroke:INK,'stroke-width':.9},g)}
}

/* ---------------- map ---------------- */
const map=$('#map');
const RIVER='M120 -30 C 250 160, 150 330, 250 470 S 430 760, 330 1030';
const MAINROAD='M-20 575 C 380 610, 700 545, 900 545 S 1300 515, 1620 530';
const CROSS='M905 -20 C 880 200, 925 380, 900 545 S 885 800, 915 1020';
function inRect(x,y,r,p=0){return x>r[0]-p&&x<r[0]+r[2]+p&&y>r[1]-p&&y<r[1]+r[3]+p}
function drawMap(){
  map.innerHTML='';seed=17;
  const defs=el('defs',{},map);
  const f=el('filter',{id:'rough',x:'-5%',y:'-5%',width:'110%',height:'110%'},defs);
  el('feTurbulence',{type:'fractalNoise',baseFrequency:'.035',numOctaves:'2',seed:'3',result:'n'},f);
  el('feDisplacementMap',{in:'SourceGraphic',in2:'n',scale:'3.5'},f);
  Object.keys(T).forEach(k=>{const p=el('pattern',{id:'tok-'+k,patternContentUnits:'objectBoundingBox',width:1,height:1},defs);el('image',{href:'assets/tok-'+k+'.jpg',width:1,height:1,preserveAspectRatio:'xMidYMid slice'},p)});
  const bg=el('g',{filter:'url(#rough)'},map);
  // border
  el('rect',{x:18,y:18,width:1564,height:964,fill:'none',stroke:INK,'stroke-width':3},bg);
  el('rect',{x:28,y:28,width:1544,height:944,fill:'none',stroke:INK,'stroke-width':1.2},bg);
  // hills (hachures) along top-left
  for(let i=0;i<9;i++){const cx=330+i*26+rnd()*10,cy=60+rnd()*20;for(let j=0;j<7;j++){const a=Math.PI*(.15+.7*j/6);el('path',{d:`M${cx+Math.cos(a)*40} ${cy+40-Math.sin(a)*30}l${Math.cos(a)*14} ${-Math.sin(a)*10}`,stroke:INK,'stroke-width':1.3,'stroke-linecap':'round'},bg)}}
  // fields
  const fields=[[40,830,260,140,WASH_GREEN],[470,40,380,230,'#c9b56a'],[1350,80,225,300,'#c9b56a'],[960,840,250,130,WASH_GREEN],[1450,410,130,150,WASH_GREEN]];
  fields.forEach(([x,y,w,h,c],i)=>{el('rect',{x,y,width:w,height:h,fill:c,'fill-opacity':.32,stroke:INK,'stroke-width':1.6},bg);
    for(let k=10;k<(i%2?w:h);k+=13)el('path',{d:i%2?`M${x+k} ${y+4}v${h-8}`:`M${x+4} ${y+k}h${w-8}`,stroke:'rgba(74,52,32,.35)','stroke-width':1},bg)});
  // river
  el('path',{d:RIVER,stroke:INK,'stroke-width':78,fill:'none'},bg);
  el('path',{d:RIVER,stroke:'#cfdcd6','stroke-width':72,fill:'none'},bg);
  el('path',{d:RIVER,stroke:WASH_BLUE,'stroke-width':72,fill:'none','stroke-opacity':.75},bg);
  [-22,-8,8,22].forEach(o=>el('path',{d:RIVER,stroke:'rgba(40,70,90,.35)','stroke-width':1.2,fill:'none','stroke-dasharray':'26 18','transform':`translate(${o} 0)`},bg));
  // roads
  [MAINROAD,CROSS].forEach(d=>{el('path',{d,stroke:INK,'stroke-width':36,fill:'none'},bg);el('path',{d,stroke:'#ecd9ad','stroke-width':31,fill:'none'},bg);
    el('path',{d,stroke:'rgba(120,90,50,.35)','stroke-width':1,fill:'none','stroke-dasharray':'3 9'},bg)});
  // bridge
  const br=el('g',{transform:'translate(250 590) rotate(4)'},bg);el('rect',{x:-60,y:-24,width:120,height:48,fill:'#c79c66',stroke:INK,'stroke-width':2},br);
  for(let i=-50;i<=50;i+=12)el('path',{d:`M${i} -24v48`,stroke:INK,'stroke-width':1},br);
  // green + meeting house
  el('rect',{x:930,y:385,width:120,height:130,rx:8,fill:WASH_GREEN,'fill-opacity':.45,stroke:INK,'stroke-width':1.6},bg);
  const mh=el('g',{},bg);building(mh,955,415,70,70,{roof:'#6f6f66',walls:'#f4ecd6',chim:false,win:2});el('path',{d:'M984 415v-34l6-14 6 14v34z',fill:'#f4ecd6',stroke:INK,'stroke-width':1.8},mh);
  // decorative houses (red-washed footprints) along roads
  const lots=Object.values(T).map(t=>t.lot).concat([[930,385,120,130],[40,830,260,140],[470,40,380,230],[960,840,250,130],[1450,410,130,150]]);
  const houses=[[180,650],[110,700],[420,640],[430,500],[800,620],[790,460],[1000,600],[1010,700],[1330,470],[1250,460],[960,300],[840,300],[850,760],[970,780],[700,860],[1470,600],[160,520]];
  houses.forEach(([x,y],i)=>{if(lots.some(r=>inRect(x,y,r,10)))return;const w=26+rnd()*14,h=18+rnd()*10;el('rect',{x,y,width:w,height:h,fill:WASH_RED,'fill-opacity':.7,stroke:INK,'stroke-width':1.6,transform:`rotate(${(rnd()-.5)*8} ${x} ${y})`},bg)});
  // trees
  const riverPts=[];const rp=el('path',{d:RIVER},map);const L=rp.getTotalLength();for(let s=0;s<=L;s+=20){const p=rp.getPointAtLength(s);riverPts.push([p.x,p.y])}rp.remove();
  const roadPts=[];[MAINROAD,CROSS].forEach(d=>{const r=el('path',{d},map);const l=r.getTotalLength();for(let s=0;s<=l;s+=20){const p=r.getPointAtLength(s);roadPts.push([p.x,p.y])}r.remove()});
  const near=(x,y,pts,d)=>pts.some(([a,b])=>Math.hypot(a-x,b-y)<d);
  let n=0;for(let i=0;i<900&&n<170;i++){const x=40+rnd()*1520,y=40+rnd()*920;
    if(lots.some(r=>inRect(x,y,r,22))||near(x,y,riverPts,58)||near(x,y,roadPts,38)||inRect(x,y,[560,830,470,140])||inRect(x,y,[1140,820,200,170])||inRect(x,y,[300,30,300,110]))continue;
    const r=9+rnd()*7;el('ellipse',{cx:x+4,cy:y+r*.8,rx:r,ry:r*.35,fill:'rgba(60,40,20,.18)'},bg);
    el('circle',{cx:x,cy:y,r,fill:WASH_GREEN,'fill-opacity':.75,stroke:INK,'stroke-width':1.3},bg);el('path',{d:`M${x-r*.4} ${y-r*.2}q${r*.3} ${-r*.4} ${r*.7} 0`,stroke:INK,'stroke-width':.8,fill:'none'},bg);n++}
  // compass rose
  const cr=el('g',{transform:'translate(1240 905)'},bg);el('circle',{r:52,fill:'none',stroke:INK,'stroke-width':1.4},cr);el('circle',{r:44,fill:'none',stroke:INK,'stroke-width':.8},cr);
  for(let i=0;i<8;i++){const len=i%2?28:50;el('path',{d:`M0 ${-len}L7 0L0 ${len*.0}L-7 0Z`,fill:i%2?'#e8d4a6':INK,stroke:INK,'stroke-width':1,transform:`rotate(${i*45})`},cr)}
  el('text',{y:-58,'text-anchor':'middle',class:'lbl','font-size':22},cr).textContent='N';
  // cartouche
  const ca=el('g',{transform:'translate(560 860)'},bg);el('path',{d:'M0 10Q0 0 10 0H440Q450 0 450 10V100Q450 110 440 110H10Q0 110 0 100Z',fill:'#f3e4c0',stroke:INK,'stroke-width':2.4},ca);
  el('path',{d:'M8 18Q8 8 18 8H432Q442 8 442 18V92Q442 102 432 102H18Q8 102 8 92Z',fill:'none',stroke:INK,'stroke-width':1},ca);
  const t1=el('text',{x:225,y:44,'text-anchor':'middle',class:'lbl','font-size':30},ca);t1.textContent='A PLAN of LIBERTY VILLAGE';
  const t2=el('text',{x:225,y:80,'text-anchor':'middle',class:'lbl','font-size':20,'font-style':'italic'},ca);t2.textContent='in the Province of Pennsylvania · 1774';
  // labels along paths
  const lp=el('path',{id:'rl',d:'M150 40 C 260 200, 160 330, 255 460'},defs);
  const rt=el('text',{class:'lbl','font-size':24,'font-style':'italic'},bg);const tp=el('textPath',{href:'#rl',startOffset:'10%'},rt);tp.textContent='Mill River';
  el('path',{id:'kr',d:'M420 598 C 600 590, 720 548, 860 548'},defs);
  const kt=el('text',{class:'lbl','font-size':22,'font-style':'italic',dy:-22},bg);el('textPath',{href:'#kr',startOffset:'5%'},kt).textContent="The King’s Highway";
  const mlab=el('text',{x:990,y:534,'text-anchor':'middle',class:'lbl','font-size':17,'font-style':'italic'},bg);mlab.textContent='Meeting House';
  // parcels
  const pg=el('g',{id:'parcels'},map);
  ORDER.forEach(k=>{const t=T[k];const [x,y,w,h]=t.lot;const g=el('g',{class:'parcel','data-id':k},pg);
    el('rect',{class:'lot',x,y,width:w,height:h,rx:6},g);
    const b=el('g',{class:'built'},g);drawBuilt(b,k,x,y,w,h);
    el('text',{class:'q',x:x+w*.45,y:y+h*.62},g).textContent='?';
    // hanging sign at top-right
    const sx=x+w-66,sy=y+12;const s=el('g',{class:'sign'},g);
    el('path',{d:`M${sx+60} ${sy-6}v14M${sx-4} ${sy}h66`,stroke:INK,'stroke-width':3,fill:'none'},s);
    el('path',{d:`M${sx+6} ${sy}v8M${sx+50} ${sy}v8`,stroke:INK,'stroke-width':1.5},s);
    el('rect',{x:sx-2,y:sy+8,width:60,height:52,rx:6,fill:'#c89a5e',stroke:INK,'stroke-width':2.2},s);
    const ig=el('g',{transform:`translate(${sx+6} ${sy+12}) scale(1.1)`},s);icon(t.sign,ig);
    // pin (shown when done)
    const pin=el('g',{class:'pin built'},g);const px=x+w*.3,py=y+h*.36;
    el('circle',{cx:px,cy:py+4,r:46,fill:'rgba(0,0,0,.25)'},pin);el('circle',{cx:px,cy:py,r:46,fill:'#e9cf94',stroke:'#6e4a22','stroke-width':3},pin);
    el('circle',{cx:px,cy:py,r:40,fill:`url(#tok-${k})`},pin);
    const rib=el('g',{},pin);el('path',{d:`M${px-62} ${py+38}h124l-8 14 8 14h-124l8-14z`,fill:'#7a2e1f',stroke:INK,'stroke-width':1.5},rib);
    el('text',{x:px,y:py+58,'text-anchor':'middle','font-family':'IM Fell,Georgia,serif','font-size':19,fill:'#fff4dc'},rib).textContent=t.name;
    onTap(g,()=>{if(done.has(k))openTrade(k);else{flash(k);toast(`Who works here? Look at the sign: ${aOr(t.signWord)}!`);}});
  });
  refreshParcels();
}
const aOr=w=>(/^[aeiou]/i.test(w)?'an ':'a ')+w;
function drawBuilt(g,k,x,y,w,h){
  if(k==='farmer'){const bx=x+w*.5,by=y+h*.55;building(g,bx-10,by,100,90,{roof:'#8a3d2a',walls:'#b45a3c',chim:false,win:0});
    el('path',{d:`M${bx+30} ${by+90}v-34h20v34`,fill:'#5b3a22',stroke:INK,'stroke-width':1.5},g);
    el('ellipse',{cx:x+w*.75,cy:y+h*.9,rx:24,ry:16,fill:'#d9b45a',stroke:INK,'stroke-width':1.5},g);return}
  if(k==='miller'){building(g,x+w*.5,y+h*.32,95,100,{roof:'#6f6f66',walls:'#d9cbb0',win:2});
    const cx=x+w*.47,cy=y+h*.72;el('circle',{cx,cy,r:34,fill:'none',stroke:INK,'stroke-width':4},g);
    for(let i=0;i<12;i++)el('rect',{x:cx-3,y:cy-40,width:6,height:12,fill:'#7a5230',stroke:INK,'stroke-width':1,transform:`rotate(${i*30} ${cx} ${cy})`},g);
    for(let i=0;i<6;i++)el('path',{d:`M${cx} ${cy}l${Math.cos(i*Math.PI/3)*34} ${Math.sin(i*Math.PI/3)*34}`,stroke:INK,'stroke-width':2},g);return}
  const bw=Math.min(110,w*.5);building(g,x+w-bw-24,y+h-bw*.92-8,bw,bw*.92,{win:2,roof:k==='smith'?'#5d5a55':k==='weaver'?'#8a5a3a':WASH_RED});
  if(k==='smith'){for(let i=0;i<3;i++)el('path',{d:`M${x+w-48+i*6} ${y+h-bw-8}q-10 -14 0 -26q10 -12 0 -24`,stroke:'rgba(60,60,60,.5)','stroke-width':2,fill:'none'},g)}
}
function refreshParcels(){$$('.parcel').forEach(p=>p.classList.toggle('done',done.has(p.dataset.id)));
  $$('.tok').forEach(t=>t.classList.toggle('used',done.has(t.dataset.id)));
  $$('#needList li').forEach(li=>li.classList.toggle('done',done.has(li.dataset.id)));
  $('.needcount').textContent=`${done.size}/7`}
function flash(k){const p=$(`.parcel[data-id=${k}]`);p.classList.remove('hint');void p.getBoundingClientRect();p.classList.add('hint');setTimeout(()=>p.classList.remove('hint'),3100);
  // scroll map so parcel is visible on phones
  const mw=$('#mapwrap');if(mw.scrollWidth>mw.clientWidth+4){const r=p.getBoundingClientRect(),m=mw.getBoundingClientRect();mw.scrollBy({left:(r.left+r.width/2)-(m.left+m.width/2),behavior:'smooth'})}}

/* ---------------- tray + drag ---------------- */
function buildTray(){const tray=$('#tray');tray.innerHTML='';
  ORDER.forEach(k=>{const t=T[k];const b=document.createElement('div');b.className='tok';b.dataset.id=k;b.setAttribute('role','button');b.setAttribute('aria-label',t.name);
    b.innerHTML=`<div class="disc" style="background-image:url(assets/tok-${k}.jpg)"></div><div class="badge"><svg viewBox="0 0 40 40"></svg></div><div class="nm">${t.name}</div>`;
    icon(t.sign,$('svg',b),'#f6e2b8');tray.appendChild(b);b.addEventListener('pointerdown',e=>startDrag(e,k,b))});}
const dragEl=$('#drag');
function startDrag(e,k,tok){e.preventDefault();ac();const sx=e.clientX,sy=e.clientY;let moved=false,over=null;
  dragEl.style.backgroundImage=`url(assets/tok-${k}.jpg)`;
  const pos=(x,y)=>{dragEl.style.left=x+'px';dragEl.style.top=y+'px'};
  const move=ev=>{if(ev.pointerId!==e.pointerId)return;if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>10){moved=true;dragEl.style.display='block';tok.style.opacity=.35}
    if(!moved)return;pos(ev.clientX,ev.clientY);const hit=document.elementFromPoint(ev.clientX,ev.clientY);const p=hit&&hit.closest&&hit.closest('.parcel');
    if(p!==over){if(over)over.classList.remove('over');over=p&&!done.has(p.dataset.id)?p:null;if(over)over.classList.add('over')}};
  const up=ev=>{if(ev.pointerId!==e.pointerId)return;window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);
    dragEl.style.display='none';tok.style.opacity='';if(over)over.classList.remove('over');
    if(!moved){toast(`Drag the ${T[k].name} to the shop with ${aOr(T[k].signWord)} sign.`);flash(k);return}
    if(!over)return;const id=over.dataset.id;
    if(id===k)place(k);else{SND.nope();over.classList.add('shake');const o=over;setTimeout(()=>o.classList.remove('shake'),500);
      toast(`Not this one! The ${T[k].name} looks for ${aOr(T[k].signWord)} sign.`);flash(k)}};
  window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up)}
function place(k){done.add(k);LS.set('ct.done',[...done]);refreshParcels();SND.chime();
  setTimeout(()=>{if(done.size===7)openTrade(k,true);else openTrade(k)},650)}

/* ---------------- family list ---------------- */
function buildNeeds(){const ul=$('#needList');ul.innerHTML='';ORDER.forEach(k=>{const t=T[k];const li=document.createElement('li');li.dataset.id=k;
  li.innerHTML=`<img src="assets/${t.needImg}" alt=""><div><div class="t">${t.need}</div><div class="p">${t.paid}</div></div><div class="ck">✓</div>`;ul.appendChild(li);
  onTap(li,()=>{if(done.has(k))openTrade(k);else{flash(k);toast(`${t.need}? Find the ${T[k].name}!`)}})})}
onTap($('#needsBtn'),()=>{const on=document.body.classList.toggle('showneeds');if(!on)return;
  if(getComputedStyle($('#needs')).position!=='fixed')document.body.classList.remove('showneeds'),$('#needs').scrollIntoView({behavior:'smooth'}),toast('The Hale family list is on the right.')});
document.addEventListener('pointerdown',e=>{if(document.body.classList.contains('showneeds')&&!e.target.closest('#needs')&&!e.target.closest('#needsBtn'))document.body.classList.remove('showneeds')});

/* ---------------- modal ---------------- */
const modal=$('#modal'),card=$('#card');
function openModal(html){card.innerHTML=html;modal.classList.add('open');modal.setAttribute('aria-hidden','false');card.scrollTop=0;const x=$('.mx',card);if(x)onTap(x,closeModal)}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');hush();if(pendingFinale){pendingFinale=false;setTimeout(finale,350)}}
modal.addEventListener('pointerdown',e=>{if(e.target===modal)closeModal()});
const readSvg='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1A9 9 0 0 0 14 3.2z"/></svg>';
let pendingFinale=false;
function openTrade(k,last=false){const t=T[k];pendingFinale=last;
  openModal(`<button class="mx" aria-label="Close">×</button><div class="trade">
   <div class="ph" style="background-image:url(assets/${t.photo})"><div class="cap">${t.cap}</div></div>
   <div class="tx"><div class="tag">${t.sub?t.sub+' · ':''}The ${t.name}</div><h2>${t.sub||'The '+t.name}</h2>
   ${t.story.map(s=>`<p>${s}</p>`).join('')}
   ${t.objs.length?`<div class="objrow">${t.objs.map(([src,c])=>`<figure><img src="assets/${src}" alt="${c}"><figcaption>${c}</figcaption></figure>`).join('')}</div>`:''}
   <div class="made">${t.made.map(m=>`<span>${m}</span>`).join('')}</div>
   <div class="how"><b>No stores? Here’s how</b><p>${t.how}</p></div>
   <div class="btns"><button class="pill act">${t.act}</button><button class="pill light read">${readSvg}Read to me</button><button class="pill ghost back" style="color:var(--ink);box-shadow:inset 0 0 0 1.5px #b49a70">${last?'Finish ›':'Back to town'}</button></div>
   </div></div>`);
  onTap($('.act',card),()=>{SND[t.snd]();sparks($('.ph',card),t.snd)});
  onTap($('.read',card),e=>speak(`The ${t.name}. ${t.story.join(' ')} The ${t.name} made ${t.made.join(', ')}. ${t.how}`,$('.read',card)));
  onTap($('.back',card),closeModal);
  setTimeout(()=>SND[t.snd](),250)}
function sparks(ph,kind){const r=ph.getBoundingClientRect();const col={clang:'#ffb02e',tink:'#ffffff',water:'#bfe6ff',cowbell:'#f6d68c'}[kind]||'#f6d68c';
  for(let i=0;i<22;i++){const s=document.createElement('div');s.className='spark';s.style.background=`radial-gradient(${col},transparent 70%)`;
    const x=r.width*(.35+Math.random()*.3),y=r.height*(.45+Math.random()*.2);s.style.left=x+'px';s.style.top=y+'px';ph.appendChild(s);
    const a=Math.random()*Math.PI*2,d=40+Math.random()*120;s.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d-40}px) scale(.3)`,opacity:0}],{duration:700+Math.random()*500,easing:'cubic-bezier(.2,.8,.3,1)'}).onfinish=()=>s.remove()}}
function intro(){openModal(`<button class="mx" aria-label="Close">×</button><div class="intro"><div class="ph"><h2>Welcome to Liberty Village</h2></div><div class="tx">
  <p>In 1774 there were no stores like ours. Families grew their own food and made many things at home. For everything else, they went to the people in town who were very good at one job, called a <b>trade</b>.</p>
  <div class="steps"><div><i>👆</i>Drag a tradesperson onto the map.</div><div><i>🪧</i>Match the picture on the shop sign.</div><div><i>📜</i>Help the Hale family get what they need.</div></div>
  <div class="btns"><button class="pill go">Start exploring</button><button class="pill light read">${readSvg}Read to me</button>${done.size?'<button class="pill ghost reset" style="color:var(--ink);box-shadow:inset 0 0 0 1.5px #b49a70">Start over</button>':''}</div></div></div>`);
  onTap($('.go',card),closeModal);onTap($('.read',card),()=>speak($('.intro .tx p',card).textContent+' Drag a tradesperson onto the map. Match the picture on the shop sign. Help the Hale family get what they need.',$('.read',card)));
  const rs=$('.reset',card);if(rs)onTap(rs,()=>{done.clear();LS.set('ct.done',[]);refreshParcels();closeModal()})}
function finale(){SND.chime();setTimeout(SND.chime,400);
  openModal(`<button class="mx" aria-label="Close">×</button><div class="intro"><div class="ph"><h2>Market Day in Liberty Village!</h2></div><div class="tx">
  <p>Every shop is open, and the Hale family has everything they need: horseshoes, flour, a barrel, cloth, the news, food from the farm, and a silver spoon for the baby.</p>
  <p>No stores! Families <b>grew</b> food, <b>made</b> things at home, and <b>traded</b> with their neighbors. Everyone in town needed everyone else.</p>
  <div class="btns"><button class="pill go">Look at my village</button><button class="pill light read">${readSvg}Read to me</button><button class="pill ghost reset" style="color:var(--ink);box-shadow:inset 0 0 0 1.5px #b49a70">Play again</button></div></div></div>`);
  onTap($('.go',card),closeModal);onTap($('.read',card),()=>speak([...$$('.tx p',card)].map(p=>p.textContent).join(' '),$('.read',card)));
  onTap($('.reset',card),()=>{done.clear();LS.set('ct.done',[]);refreshParcels();closeModal()})}
onTap($('#helpBtn'),intro);
onTap($('#creditsBtn'),()=>openModal(`<button class="mx" aria-label="Close">×</button><div class="credits"><h2>Photo credits</h2><ul>${(window.CREDITS||[]).map(c=>`<li><b>${c.title.replace(/\.(jpe?g|png|tif)$/i,'')}</b> — ${c.artist||'Unknown'}. ${c.license}${c.licurl?` (<a href="${c.licurl}" target="_blank" rel="noopener">license</a>)`:''}. <a href="${c.page}" target="_blank" rel="noopener">Source</a>${c.note?'. '+c.note:''}</li>`).join('')}<li>The village map is drawn in code in the style of 1700s town plans. Liberty Village and the Hale family are made up. Sounds are made in the browser. Fonts: IM Fell (SIL OFL) and Nunito (SIL OFL).</li></ul></div>`));

drawMap();buildTray();buildNeeds();refreshParcels();
if(!LS.get('ct.seen',false)){intro();LS.set('ct.seen',true)}
window.__ready=true;
