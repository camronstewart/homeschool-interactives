'use strict';
(()=>{
const S=window.SHIPS.slice().sort((a,b)=>a.year-b.year);
const seen=new Set(JSON.parse(localStorage.getItem('ships-seen')||'[]'));
const xy=(lat,lon)=>[(lon+180)/360,(90-lat)/180];
const yearTxt=y=>y<0?(-y)+' BC':y<1200?'AD '+y:''+y;
const map=$('#map'),lines=$('#mapLines');
let L='';
S.forEach((s,i)=>{const [x,y]=xy(s.lat,s.lon),[dx,dy]=xy(s.dlat,s.dlon);
  L+=`<line x1="${x*1000}" y1="${y*500}" x2="${dx*1000}" y2="${dy*500}"/><circle cx="${x*1000}" cy="${y*500}" r="3.2"/>`;
  const p=document.createElement('button');p.className='pin';p.dataset.id=s.id;p.style.left=dx*100+'%';p.style.top=dy*100+'%';p.setAttribute('aria-label',s.name);
  p.innerHTML=`<img src="assets/th-${s.id}.jpg" alt="" draggable="false"><i class="tick"></i>`;map.appendChild(p);onTap(p,()=>openShip(s.id))});
lines.innerHTML=L;
const tl=$('#tlTrack');
tl.innerHTML=S.map((s,i)=>`<button class="tl-item" data-id="${s.id}" aria-label="${s.name}"><span class="tl-img"><img src="assets/th-${s.id}.jpg" alt="" draggable="false"><i class="tick"></i></span><span class="tl-year">${yearTxt(s.year)}</span></button>`).join('')+`<div class="tl-arrow"><span>long ago</span><b></b><span>today</span></div>`;
$$('.tl-item',tl).forEach(b=>onTap(b,()=>openShip(b.dataset.id)));
function fitMap(){const w=$('#mapWrap');const W=w.clientWidth-16,H=w.clientHeight-16;let mw=innerWidth<innerHeight?Math.max(W,Math.min(H*2,W*2.6)):Math.min(W,H*2);map.style.width=mw+'px';map.style.height=mw/2+'px'}
addEventListener('resize',()=>{if(CUR==='world')fitMap()});
function mark(){$$('.pin,.tl-item').forEach(p=>p.classList.toggle('seen',seen.has(p.dataset.id)));const c=$('#tbExtra');if(CUR==='world')c.innerHTML=`<span class="count"><svg><use href="#i-sail"/></svg>${seen.size}/${S.length}</span>`}
function openShip(id){const i=S.findIndex(s=>s.id===id),s=S[i];SFX.tap();
  seen.add(id);localStorage.setItem('ships-seen',JSON.stringify([...seen]));mark();
  const [x,y]=xy(s.lat,s.lon);const pos=i/(S.length-1);
  const card=openModal(`<button class="mx" aria-label="Close"><svg><use href="#i-close"/></svg></button>
   <div class="ship-card">
    <div class="sc-photo"><div class="sc-blur" style="background-image:url(assets/ship-${s.id}.jpg)"></div><img src="assets/ship-${s.id}.jpg" alt="${s.name}" draggable="false"></div>
    <div class="sc-info">
      <div class="sc-name"><h2>${s.name}</h2>${speakBtnHTML('mini-speak big')}</div>
      <div class="sc-facts">
        <div class="fact where"><div class="fact-ico"><svg><use href="#i-globe"/></svg></div><div class="mini-map"><img src="assets/world.jpg" alt=""><i style="left:${x*100}%;top:${y*100}%"></i></div><span>${s.place}</span></div>
        <div class="fact when"><div class="fact-ico clock"></div><div class="mini-tl"><b style="left:${pos*100}%"></b><em style="width:${pos*100}%"></em></div><span>${s.when}<em class="yr">${yearTxt(s.year)}</em></span></div>
      </div>
      <button class="sound-btn" aria-label="Hear the ship"><svg><use href="#i-sound"/></svg></button>
    </div>
    <button class="sc-nav prev" aria-label="Previous ship"><svg><use href="#i-left"/></svg></button><button class="sc-nav next" aria-label="Next ship"><svg><use href="#i-right"/></svg></button>
   </div>`,'ship');
  const text=`${s.name}. ${s.say}`;
  const sb=$('.mini-speak',card);onTap(sb,()=>speak(text,sb));
  onTap($('.where',card),()=>speak(s.place,sb));onTap($('.when',card),()=>speak(s.when,sb));
  onTap($('.sound-btn',card),()=>{stopSpeak();shipSound(s.sound)});
  onTap($('.prev',card),()=>openShip(S[(i-1+S.length)%S.length].id));
  onTap($('.next',card),()=>openShip(S[(i+1)%S.length].id));
  // swipe the photo to change ship
  let sx=null;const ph=$('.sc-photo',card);ph.addEventListener('pointerdown',e=>{sx=e.clientX});ph.addEventListener('pointerup',e=>{if(sx==null)return;const d=e.clientX-sx;sx=null;if(Math.abs(d)>60)openShip(S[(i+(d<0?1:-1)+S.length)%S.length].id)});
  setTimeout(()=>speak(text,sb),250);
  if(seen.size===S.length&&!openShip.done){openShip.done=true;setTimeout(()=>{confetti();SFX.cheer()},400)}
}
registerView('world',{t:'Ships of the World',ico:'i-globe',help:'Tap a ship on the map, or on the line at the bottom. The line goes from long, long ago, to today.',
  enter(){fitMap();mark();requestAnimationFrame(()=>{fitMap();const m=$('#mapWrap');if(m.scrollWidth>m.clientWidth&&!m.dataset.s){m.dataset.s=1;m.scrollLeft=(m.scrollWidth-m.clientWidth)*.22}})}});
window.openShip=openShip;
})();
