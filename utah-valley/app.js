import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {POIS,FLY,SOURCES} from './facts.js';

const $=id=>document.getElementById(id);
const Q=new URLSearchParams(location.search);
const IS_MOBILE=matchMedia('(pointer:coarse)').matches||/iPhone|iPad|Android/i.test(navigator.userAgent);
// ---------------------------------------------------------------- geography
const NX=2048,NY=2624,CELL=37.5,X0=393000,Y1=4495400,WKM=76.8,DKM=98.4;
const BASE_M=1300,PROVO_M=1445,BONN_M=1551.4,LAKE_M=1368.3,WALL_Y=-0.35;const F1=n=>Number(n).toFixed(1);
function ll2utm(lat,lon){const a=6378137,f=1/298.257223563,k0=.9996,e2=f*(2-f),ep2=e2/(1-e2);
 const p=lat*Math.PI/180,l=(lon+111)*Math.PI/180,s=Math.sin(p),c=Math.cos(p),tn=Math.tan(p);
 const N=a/Math.sqrt(1-e2*s*s),T=tn*tn,C=ep2*c*c,A=c*l,e4=e2*e2,e6=e4*e2;
 const M=a*((1-e2/4-3*e4/64-5*e6/256)*p-(3*e2/8+3*e4/32+45*e6/1024)*Math.sin(2*p)+(15*e4/256+45*e6/1024)*Math.sin(4*p)-(35*e6/3072)*Math.sin(6*p));
 const E=500000+k0*N*(A+(1-T+C)*A**3/6+(5-18*T+T*T+72*C-58*ep2)*A**5/120);
 const Nn=k0*(M+N*tn*(A*A/2+(5-T+9*C+4*C*C)*A**4/24+(61-58*T+T*T+600*C-330*ep2)*A**6/720));return[E,Nn]}
function ll2w(lat,lon){const[E,N]=ll2utm(lat,lon);return[(E-X0)/1000-WKM/2,(Y1-N)/1000-DKM/2]}
// ---------------------------------------------------------------- renderer
const canvas=$('c');
const R=new THREE.WebGLRenderer({canvas,antialias:devicePixelRatio<2&&!IS_MOBILE,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
let PR=Math.min(devicePixelRatio||1,IS_MOBILE?2:2);R.setPixelRatio(PR);R.setClearColor(0xaec6dc);
const gl=R.getContext();const MAXANI=Math.min(R.capabilities.getMaxAnisotropy(),IS_MOBILE?4:8);
const S=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(45,1,.05,420);
const ctl=new OrbitControls(cam,canvas);
ctl.enableDamping=true;ctl.dampingFactor=.09;ctl.screenSpacePanning=true;ctl.minDistance=.9;ctl.maxDistance=170;ctl.maxPolarAngle=1.5;
ctl.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};ctl.rotateSpeed=IS_MOBILE?.75:.6;ctl.zoomSpeed=.9;ctl.panSpeed=.9;
// ---------------------------------------------------------------- state
const ST={season:'summer',hour:16.2,exag:1.6,layer:0,contour:0,shadows:1,bonnOn:false,bonnLvl:1371,bench:0,benchTarget:0,benchPulse:0,labels:true};
const SEASONS={
 summer:{snow:3400,fall:0,spring:0,winter:0,decl:23.4,hazeK:.55,info:'Summer: bare rock and green forests. Only tiny snow patches hide in the shadiest high cliffs.'},
 fall:{snow:3050,fall:1,spring:0,winter:0,decl:-9.5,hazeK:.5,info:'Fall: oak turns red and aspens turn gold. The first snow dusts the very top of the peaks.'},
 winter:{snow:1850,fall:0,spring:0,winter:1,decl:-23.4,hazeK:.7,info:'Winter: snow reaches low onto the foothills, and the lowest valley is cold and hazy.'},
 spring:{snow:2450,fall:0,spring:1,winter:0,decl:11.5,hazeK:.6,info:'Spring: snow melts from the bottom up, and everything turns bright green.'}};
// ---------------------------------------------------------------- GLSL
const NOISE=`float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vnoise(p);p=p*2.03+vec2(7.1,3.7);a*=.5;}return s;}
vec3 aces(vec3 x){return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.,1.);}`;
const SKY=`uniform vec3 uSunDir,uSunCol,uHorizon,uZenith;uniform float uGlow,uExposure;
vec3 skyBase(vec3 d){float y=clamp(d.y,0.,1.);vec3 c=mix(uHorizon,uZenith,pow(y,.48));float cs=max(dot(d,uSunDir),0.);
 c+=uSunCol*uGlow*(pow(cs,4.)*.10+pow(cs,28.)*.22);return c;}`;
const VERT=`uniform sampler2D uHeight;uniform vec2 uTex;uniform vec2 uWorld;uniform float uExag,uWater;
attribute float aSkirt;varying vec3 vW;varying float vSk;varying vec3 vWn;varying float vHg;varying float vTop;
float hAt(vec2 uv){vec2 p=uv*uTex-.5;vec2 i=floor(p);vec2 f=fract(p);ivec2 ip=ivec2(i);ivec2 mx=ivec2(uTex)-1;
 float a=texelFetch(uHeight,clamp(ip,ivec2(0),mx),0).r;float b=texelFetch(uHeight,clamp(ip+ivec2(1,0),ivec2(0),mx),0).r;
 float c=texelFetch(uHeight,clamp(ip+ivec2(0,1),ivec2(0),mx),0).r;float d=texelFetch(uHeight,clamp(ip+ivec2(1,1),ivec2(0),mx),0).r;
 return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
void main(){vec4 wp=modelMatrix*vec4(position,1.);vec2 uv=clamp((wp.xz+uWorld*.5)/uWorld,0.,1.);
 float hm=hAt(uv);float y=(max(hm,uWater)-1300.)*.001*uExag;vTop=y;vHg=hm;vSk=0.;vWn=vec3(0.);
 if(aSkirt>.5){bool ox=abs(abs(wp.x)-uWorld.x*.5)<.002,oz=abs(abs(wp.z)-uWorld.y*.5)<.002;
  if(ox||oz){y=${WALL_Y.toFixed(2)};vSk=2.;if(ox)vWn.x=sign(wp.x);if(oz)vWn.z=sign(wp.z);}else{y-=.3;vSk=1.;}}
 vW=vec3(wp.x,y,wp.z);gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.);}`;
const FRAG=`uniform sampler2D uHeight,uColor,uGradF,uGradC,uShadow,uMask;uniform vec2 uTex,uWorld;uniform vec3 uCam;
uniform float uExag,uTime,uWater,uMode,uContour,uShadowOn,uSnow,uFall,uSpring,uWinter,uHaze,uFogD,uBench,uSunElev;
${SKY}${NOISE}
varying vec3 vW;varying float vSk;varying vec3 vWn;varying float vHg;varying float vTop;
float hAt(vec2 uv){vec2 p=uv*uTex-.5;vec2 i=floor(p);vec2 f=fract(p);ivec2 ip=ivec2(i);ivec2 mx=ivec2(uTex)-1;
 float a=texelFetch(uHeight,clamp(ip,ivec2(0),mx),0).r;float b=texelFetch(uHeight,clamp(ip+ivec2(1,0),ivec2(0),mx),0).r;
 float c=texelFetch(uHeight,clamp(ip+ivec2(0,1),ivec2(0),mx),0).r;float d=texelFetch(uHeight,clamp(ip+ivec2(1,1),ivec2(0),mx),0).r;
 return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
vec3 ramp(float h){vec3 c0=vec3(.12,.30,.18),c1=vec3(.33,.50,.22),c2=vec3(.62,.66,.30),c3=vec3(.78,.66,.40),c4=vec3(.60,.43,.30),c5=vec3(.58,.54,.52),c6=vec3(.95,.95,.97);
 if(h<1500.)return mix(c0,c1,smoothstep(1270.,1500.,h));if(h<1900.)return mix(c1,c2,(h-1500.)/400.);if(h<2300.)return mix(c2,c3,(h-1900.)/400.);
 if(h<2750.)return mix(c3,c4,(h-2300.)/450.);if(h<3150.)return mix(c4,c5,(h-2750.)/400.);return mix(c5,c6,clamp((h-3150.)/480.,0.,1.));}
float contourL(float h,float stp,float w){float d=abs(fract(h/stp-.5)-.5)*stp;float fw=fwidth(h)+1e-4;return 1.-smoothstep(0.,fw*w,d);}
vec3 wavesN(vec2 p,float dist){float t=uTime;vec2 a=vec2(vnoise(p*1.3+vec2(t*.05,0.)),vnoise(p*1.3+vec2(5.2,t*.045)));
 vec2 b=vec2(vnoise(p*4.1+vec2(-t*.11,3.)),vnoise(p*4.1+vec2(1.,t*.1)));vec2 g=(a-.5)*.8+(b-.5)*.5;g*=1.-smoothstep(10.,60.,dist)*.85;return normalize(vec3(g.x*.35,1.,g.y*.35));}
void main(){
 vec3 Vv=uCam-vW;float dist=length(Vv);vec3 V=Vv/dist;vec2 uv=clamp((vW.xz+uWorld*.5)/uWorld,0.,1.);
 vec3 col;vec3 fogDir=normalize(vec3(-V.x,.04,-V.z));
 if(vSk>1.5){
  vec3 Nw=normalize(vWn+vec3(0.,.0001,0.));float hm=vW.y*1000./uExag+1300.;float nz=fbm(vec2(vW.x+vW.z,hm*.02)*3.);
  float bands=sin(hm*.05+nz*5.)*.5+.5;float lines=smoothstep(.92,1.,sin(hm*.31+nz*9.)*.5+.5);
  vec3 rock=mix(vec3(.30,.23,.17),vec3(.50,.42,.33),bands);rock=mix(rock,vec3(.16,.13,.11),lines*.55);
  rock*=.55+.45*smoothstep(${WALL_Y.toFixed(2)},.4,vW.y);
  if(uWater>0.&&hm>vHg+1.&&vW.y<=vTop+.0005&&hm>vHg){rock=mix(rock,vec3(.02,.12,.22),.9);}
  float nd=max(dot(Nw,uSunDir),0.);col=rock*(uSunCol*nd*.9+mix(uHorizon,uZenith,.5)*.55);
 }else{
  float h=hAt(uv);float md=texture(uMask,uv).r*255.;
  float lakeA=smoothstep(118.,138.,md);
  float depthB=uWater-h;float flood=uWater>0.?smoothstep(-.4,.4,depthB):0.;
  float waterA=max(lakeA,flood);
  vec2 g=mix(texture(uGradF,uv).rg,texture(uGradC,uv).rg,smoothstep(9.,34.,dist));
  vec3 N=normalize(vec3(-g.x*uExag,1.,-g.y*uExag));vec3 N0=normalize(vec3(-g.x,1.,-g.y));
  float dn=1.-smoothstep(1.5,14.,dist);vec2 np=vW.xz*70.;
  float n1=vnoise(np),n2=vnoise(np*4.1+3.);
  if(dn>0.){vec2 dg=vec2(vnoise(np+vec2(.4,0.))-n1,vnoise(np+vec2(0.,.4))-n1)*2.2+vec2(vnoise(np*4.1+vec2(3.4,3.))-n2,vnoise(np*4.1+vec2(3.,3.4))-n2)*1.4;
   N=normalize(N+vec3(-dg.x,0.,-dg.y)*.16*dn*smoothstep(.0,.5,1.-N0.y*1.2+.45));}
  vec3 alb=pow(texture(uColor,uv).rgb,vec3(1.));
  float lum=dot(alb,vec3(.2126,.7152,.0722));float greenness=alb.g-.5*(alb.r+alb.b);
  // season
  float elev=h;
  if(uFall>.5){float oak=smoothstep(1350.,1650.,elev)*(1.-smoothstep(2050.,2350.,elev));float asp=smoothstep(1900.,2250.,elev)*(1.-smoothstep(2800.,3100.,elev));
   float gm=smoothstep(.0,.035,greenness)*(1.-lakeA);float nv=vnoise(vW.xz*30.);
   vec3 oakC=mix(vec3(.55,.20,.06),vec3(.62,.34,.08),nv);vec3 aspC=mix(vec3(.78,.55,.08),vec3(.85,.66,.12),nv);
   vec3 tint=mix(oakC,aspC,asp/(oak+asp+1e-3));alb=mix(alb,tint*(.45+lum*2.2),clamp(gm*(oak+asp)*.85,0.,.85));
   alb=mix(alb,alb*vec3(1.1,.95,.75),.25*(1.-oak-asp));}
  if(uSpring>.5){float gm=smoothstep(-.01,.03,greenness);alb=mix(alb,vec3(.22,.5,.14)*(.5+lum*1.6),gm*.45);alb*=vec3(.98,1.04,.96);}
  if(uWinter>.5){alb=mix(alb,vec3(lum)*vec3(.95,.97,1.05)*1.05,.42);alb*=.9;}
  // snow
  float nsn=fbm(vW.xz*26.)*.9+fbm(vW.xz*110.)*.25;
  float asp2=clamp(-N0.z*.5,-.3,.5); // north-facing slopes hold snow longer
  float he=elev+(nsn-.55)*260.+asp2*300.-(1.-N0.y)*0.;
  float slopeOK=smoothstep(.40,.78,N0.y);
  float snow=smoothstep(uSnow-130.,uSnow+130.,he)*slopeOK;
  if(uWinter>.5){float vs=smoothstep(.88,.985,N0.y)*smoothstep(.38,.62,fbm(vW.xz*14.+3.))*(1.-lakeA);alb=mix(alb,vec3(.84,.86,.91),vs*.34);alb=mix(alb,vec3(.78,.80,.84),.12*(1.-snow));}
  snow*=1.-lakeA;
  // rock on steep slopes
  alb=mix(alb,vec3(.30,.27,.24)*(.7+lum*1.2),smoothstep(.62,.40,N0.y)*.33*(1.-snow));
  alb*=1.+(n1-.5)*.28*dn+(n2-.5)*.18*dn;
  alb=mix(alb,vec3(.93,.96,1.),snow);
  // lighting
  float sh=mix(1.,texture(uShadow,uv).r,uShadowOn);
  float ndl=max(dot(N,uSunDir),0.);
  vec3 direct=uSunCol*ndl*sh;
  float sky=.5+.5*N.y;vec3 amb=mix(uHorizon*.55,uZenith*.95,sky*.8)*(.40+.60*sky)*.9+vec3(.05,.045,.035)*(1.-sky)*uSunCol.r*.3;
  col=alb*(direct+amb);
  if(snow>.02){float sp=pow(max(dot(reflect(-uSunDir,N),V),0.),24.)*.14*sh;col+=uSunCol*sp*snow;}
  if(uMode>.5){vec3 rc=ramp(h);float sh2=(.42+.78*ndl)*(.55+.45*sh);col=rc*sh2*vec3(1.4);col=mix(col,vec3(1.8)*sh2,snow*0.0);}
  // water
  if(waterA>.001){
   vec3 Nw=wavesN(vW.xz*60.,dist);
   float F=.02+.98*pow(1.-max(dot(V,Nw),0.),5.);
   vec3 R3=reflect(-V,Nw);vec3 refl=skyBase(vec3(R3.x,abs(R3.y),R3.z));
   float depthF=max(flood>.5?depthB:0.,0.);float lakeD=clamp((md-128.)/127.,0.,1.);
   vec3 shallow=vec3(.10,.42,.46),deep=vec3(.015,.085,.16);
   float tdeep=flood>=lakeA?1.-exp(-depthF/28.):clamp(lakeD*.6,0.,1.);
   vec3 body=mix(shallow,deep,tdeep);
   if(lakeA>=flood){vec3 la=alb;body=mix(body*.7,la*1.05+body*.25,.55);}
   else{body=mix(body,alb*.6+body*.4,(1.-smoothstep(0.,12.,depthF))*.5);}
   float dif=(.35+.65*max(Nw.y,0.))*(.35+.65*clamp(sh*0.5+.5,0.,1.));
   vec3 wc=body*(uSunCol*.28*max(uSunDir.y,.05)+mix(uHorizon,uZenith,.4)*.55)*dif;
   float spec=pow(max(dot(R3,uSunDir),0.),520.)*5.+pow(max(dot(R3,uSunDir),0.),40.)*.25;
   wc=mix(wc,refl,F*.9)+uSunCol*spec*(uSunDir.y>0.?1.:0.);
   if(flood>.5){float foam=1.-smoothstep(0.,5.,depthF);wc=mix(wc,vec3(.9,.96,1.)*(.35+.65*uSunDir.y),foam*.4);}
   col=mix(col,wc,waterA);
  }
  // contours
  if(uContour>.5){float fine=1.-smoothstep(10.,40.,dist);float cm=contourL(h,100.,1.0)*.55+contourL(h,500.,1.6)*.45;float c50=contourL(h,50.,.9)*fine*.35;
   float cc=clamp(max(cm,c50),0.,1.)*(1.-waterA);col=mix(col,mix(vec3(.12,.07,.03),vec3(.85,.35,.05),uMode),cc*.75);}
  // shorelines of ancient lakes
  if(uBench>.01){float fw=fwidth(h)+.01;float lb=1.-smoothstep(0.,fw*1.6,abs(h-${F1(BONN_M)}));float lp=1.-smoothstep(0.,fw*1.6,abs(h-${F1(PROVO_M)}));
   float bb=smoothstep(${F1(BONN_M-4)},${F1(BONN_M)},h)*(1.-smoothstep(${F1(BONN_M)},${F1(BONN_M+9)},h));float bp=smoothstep(${F1(PROVO_M-6)},${F1(PROVO_M)},h)*(1.-smoothstep(${F1(PROVO_M)},${F1(PROVO_M+10)},h));
   vec3 gold=vec3(1.,.78,.12),cy=vec3(.2,.9,1.);float pulse=.75+.25*sin(uTime*3.);
   col=mix(col,gold*(1.5),clamp(lb*.9+bb*.28,0.,1.)*uBench*pulse*(1.-flood));col=mix(col,cy*(1.5),clamp(lp*.9+bp*.28,0.,1.)*uBench*pulse*(1.-flood));}
 }
 // atmosphere
 float fogA=1.-exp(-dist*uFogD);float hz=exp(-max(vW.y*1000./uExag,0.)/520.);float valleyHaze=uHaze*hz*(1.-exp(-dist*.025))*.38;
 vec3 fogC=skyBase(fogDir)*vec3(1.,1.0,1.0);
 col=mix(col,fogC,clamp(fogA+valleyHaze,0.,.96));
 col=aces(col*uExposure);col=pow(col,vec3(1./2.2));
 gl_FragColor=vec4(col,1.);}`;
const SKYV=`varying vec3 vD;void main(){vD=normalize(position);vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_Position.z=gl_Position.w*.999999;}`;
const SKYF=`varying vec3 vD;uniform float uTime;${SKY}${NOISE}
void main(){vec3 d=normalize(vD);vec3 c=skyBase(d);float cs=max(dot(d,uSunDir),0.);
 c+=uSunCol*pow(cs,1800.)*30.*step(0.,d.y);
 if(d.y>.005){vec2 p=d.xz/(d.y+.12)*1.35+vec2(uTime*.004,0.);float n=fbm(p*1.1+vec2(3.,1.));float cl=smoothstep(.52,.78,n)*smoothstep(.0,.2,d.y);
  float n2=fbm(p*3.+vec2(9.,4.));cl*=.55+.45*n2;
  vec3 cc=mix(uHorizon*1.2,vec3(1.)*(.55+.6*max(uSunDir.y,0.))*1.5,.65)*(.65+.5*pow(cs,3.)) ;cc=mix(cc,uHorizon*.85,.25);
  c=mix(c,cc,cl*.8);}
 c=aces(c*uExposure);c=pow(c,vec3(1./2.2));gl_FragColor=vec4(c,1.);}`;
// ---------------------------------------------------------------- uniforms
const V3=(a,b,c)=>new THREE.Vector3(a,b,c);
const U={uHeight:{value:null},uColor:{value:null},uGradF:{value:null},uGradC:{value:null},uShadow:{value:null},uMask:{value:null},
 uTex:{value:new THREE.Vector2(NX,NY)},uWorld:{value:new THREE.Vector2(WKM,DKM)},uCam:{value:cam.position},
 uExag:{value:ST.exag},uTime:{value:0},uWater:{value:0},uMode:{value:0},uContour:{value:0},uShadowOn:{value:1},
 uSnow:{value:3400},uFall:{value:0},uSpring:{value:0},uWinter:{value:0},uHaze:{value:.55},uFogD:{value:.011},uBench:{value:0},uSunElev:{value:.6},
 uSunDir:{value:V3(.5,.6,.3)},uSunCol:{value:V3(3,2.8,2.5)},uHorizon:{value:V3(.7,.8,.95)},uZenith:{value:V3(.2,.4,.8)},uGlow:{value:1},uExposure:{value:.85}};
// ---------------------------------------------------------------- loading helpers
const TIPS=['Timpanogos Cave has three caves joined by tunnels.','Utah Lake is only about 9 feet deep on average!','The big “Y” on Y Mountain is 380 feet tall.','Mount Nebo is the tallest peak in the Wasatch Range.','Lake Bonneville once covered about 20,000 square miles.','Mountain goats live on Timpanogos, and they were brought here in 1981.','Tap the glowing dots to learn about each place.','Try the waves button to flood the valley like Lake Bonneville!'];
let tipI=0;$('ltip').textContent=TIPS[0];const tipT=setInterval(()=>{tipI=(tipI+1)%TIPS.length;$('ltip').textContent=TIPS[tipI]},2600);
function prog(p,t){$('lfill').style.width=Math.round(p*100)+'%';$('lp').textContent=t||(Math.round(p*100)+'%')}
async function fetchBlob(url,p0,p1,label){const r=await fetch(url);if(!r.ok)throw new Error(url+' '+r.status);const len=+r.headers.get('content-length')||0;
 if(!r.body||!len){const b=await r.blob();prog(p1,label);return b}
 const rd=r.body.getReader();const parts=[];let got=0;for(;;){const{done,value}=await rd.read();if(done)break;parts.push(value);got+=value.length;prog(p0+(p1-p0)*got/len,label)}return new Blob(parts)}
async function toBitmap(blob){try{return await createImageBitmap(blob,{premultiplyAlpha:'none',colorSpaceConversion:'none'})}catch(e){const u=URL.createObjectURL(blob);const im=new Image();im.src=u;await im.decode();return im}}
// ---------------------------------------------------------------- terrain data
let HGT=null,MASK=null,MASK_TEX=null;
function groundM(x,z){const u=(x+WKM/2)/WKM*NX-.5,v=(z+DKM/2)/DKM*NY-.5;let i=Math.floor(u),j=Math.floor(v);const fx=u-i,fy=v-j;
 const cx=a=>a<0?0:a>NX-1?NX-1:a,cy=a=>a<0?0:a>NY-1?NY-1:a;
 const a=HGT[cy(j)*NX+cx(i)],b=HGT[cy(j)*NX+cx(i+1)],c=HGT[cy(j+1)*NX+cx(i)],d=HGT[cy(j+1)*NX+cx(i+1)];return(a*(1-fx)+b*fx)*(1-fy)+(c*(1-fx)+d*fx)*fy}
function surfY(x,z){let h=groundM(x,z);if(U.uWater.value>0&&h<U.uWater.value)h=U.uWater.value;return(h-BASE_M)*.001*ST.exag}
function buildGrad(h,w,hh,cell){const out=new Uint16Array(w*hh*2),tmp=new Float32Array(1),u32=new Uint32Array(tmp.buffer);
 const f2h=v=>{tmp[0]=v;const x=u32[0],s=(x>>16)&0x8000;let e=((x>>23)&0xff)-112,m=(x>>13)&0x3ff;if(e<=0)return s;if(e>=31)return s|0x7bff;return s|(e<<10)|m};
 for(let y=0;y<hh;y++){const y0=y>0?y-1:0,y1=y<hh-1?y+1:hh-1;for(let x=0;x<w;x++){const x0=x>0?x-1:0,x1=x<w-1?x+1:w-1;
  const gx=(h[y*w+x1]-h[y*w+x0])/((x1-x0)*cell),gz=(h[y1*w+x]-h[y0*w+x])/((y1-y0)*cell);const o=(y*w+x)*2;out[o]=f2h(gx);out[o+1]=f2h(gz)}}return out}
function downH(h,f){const w=NX/f,hh=NY/f,o=new Float32Array(w*hh);for(let y=0;y<hh;y++)for(let x=0;x<w;x++){let s=0;for(let j=0;j<f;j++)for(let i=0;i<f;i++)s+=h[(y*f+j)*NX+x*f+i];o[y*w+x]=s/(f*f)}return{o,w,hh}}
// ---------------------------------------------------------------- chunk meshes
const CX=8,CY=10,CW=WKM/CX,CD=DKM/CY;
const LODS=IS_MOBILE?[{n:64,d:5},{n:40,d:12},{n:24,d:26},{n:14,d:1e9}]:[{n:128,d:7},{n:64,d:16},{n:32,d:32},{n:16,d:1e9}];
function makeGeom(n){const pos=[],sk=[],idx=[];const dx=CW/n,dz=CD/n;
 for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){pos.push(-CW/2+i*dx,0,-CD/2+j*dz);sk.push(0)}
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+1,c=a+n+1,d=c+1;idx.push(a,c,b,b,c,d)}
 const ring=[];for(let i=0;i<=n;i++)ring.push(i);for(let j=1;j<=n;j++)ring.push(j*(n+1)+n);for(let i=n-1;i>=0;i--)ring.push(n*(n+1)+i);for(let j=n-1;j>=1;j--)ring.push(j*(n+1));
 const base=pos.length/3;for(const v of ring){pos.push(pos[v*3],0,pos[v*3+2]);sk.push(1)}
 for(let k=0;k<ring.length;k++){const k2=(k+1)%ring.length;const a=ring[k],b=ring[k2],a2=base+k,b2=base+k2;idx.push(a,a2,b,b,a2,b2)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aSkirt',new THREE.Float32BufferAttribute(sk,1));g.setIndex(idx);
 g.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,1.5,0),Math.hypot(CW,CD)/2+6);g.boundingBox=null;return g}
const GEOMS=LODS.map(l=>makeGeom(l.n));
let terrainMat,chunks=[];
function buildTerrain(){
 terrainMat=new THREE.ShaderMaterial({uniforms:U,vertexShader:VERT,fragmentShader:FRAG,side:THREE.DoubleSide});
 for(let j=0;j<CY;j++)for(let i=0;i<CX;i++){const m=new THREE.Mesh(GEOMS[3],terrainMat);m.position.set(-WKM/2+CW*(i+.5),0,-DKM/2+CD*(j+.5));m.matrixAutoUpdate=false;m.updateMatrix();m.userData.lod=3;S.add(m);chunks.push(m)}}
const _v=new THREE.Vector3();
function updateLOD(){for(const m of chunks){const dx=cam.position.x-m.position.x,dz=cam.position.z-m.position.z;const ex=Math.max(Math.abs(dx)-CW/2,0),ez=Math.max(Math.abs(dz)-CD/2,0);const dy=Math.max(cam.position.y-1.2,0);const d=Math.hypot(ex,ez,dy*.6);
  let l=0;while(l<3&&d>LODS[l].d)l++;if(l!==m.userData.lod){m.userData.lod=l;m.geometry=GEOMS[l]}}}
// ---------------------------------------------------------------- sky
const skyMat=new THREE.ShaderMaterial({uniforms:U,vertexShader:SKYV,fragmentShader:SKYF,side:THREE.BackSide,depthWrite:false,depthTest:false});
const sky=new THREE.Mesh(new THREE.SphereGeometry(300,40,20),skyMat);sky.renderOrder=-10;sky.frustumCulled=false;S.add(sky);
// ---------------------------------------------------------------- sun / atmosphere
const LAT=40.2*Math.PI/180;
function sunVec(hour,decl){const d=decl*Math.PI/180,H=(hour-12)*15*Math.PI/180;
 const E=-Math.cos(d)*Math.sin(H),N=Math.sin(d)*Math.cos(LAT)-Math.cos(d)*Math.sin(LAT)*Math.cos(H),Up=Math.sin(d)*Math.sin(LAT)+Math.cos(d)*Math.cos(LAT)*Math.cos(H);return{E,N,Up}}
function dayRange(decl){const d=decl*Math.PI/180;const c=-Math.tan(LAT)*Math.tan(d);const H0=Math.acos(Math.max(-1,Math.min(1,c)))*180/Math.PI/15;return[12-H0,12+H0]}
const lerp=(a,b,t)=>a+(b-a)*t,sstep=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
function applySun(){const sn=SEASONS[ST.season];const{E,N,Up}=sunVec(ST.hour,sn.decl);const sd=U.uSunDir.value.set(E,Up,-N).normalize();
 const el=Math.asin(Math.max(-1,Math.min(1,Up)));const elD=el*180/Math.PI;U.uSunElev.value=Up;
 const day=sstep(-3,16,elD),warm=1-sstep(4,30,elD);
 // sun colour & strength
 const str=lerp(0,3.4,sstep(-1,22,elD))*(0.4+0.6*sstep(2,18,elD)+0);
 U.uSunCol.value.set(lerp(1,1.0,1-warm)*str,lerp(.93,.62,warm)*str*(1-.1*warm),lerp(.85,.36,warm)*str*(1-.2*warm));
 const hz=new THREE.Vector3(.70,.80,.93),hzW=new THREE.Vector3(.98,.62,.40),hzN=new THREE.Vector3(.08,.11,.20);
 const hor=hzN.clone().lerp(hz.clone().lerp(hzW,warm*.85),day);const zn=new THREE.Vector3(.02,.035,.09).lerp(new THREE.Vector3(.16,.34,.78).lerp(new THREE.Vector3(.12,.25,.60),warm*.6),day);
 U.uHorizon.value.copy(hor.multiplyScalar(lerp(.12,1.0,day)));U.uZenith.value.copy(zn);U.uGlow.value=day*(.35+warm*.9);
 U.uExposure.value=lerp(1.3,.82,day);
 const s2=SEASONS[ST.season];U.uHaze.value=s2.hazeK*(0.8+0.5*warm);U.uFogD.value=.0034*(ST.season==='winter'?1.3:1);
 $('sunInfo').textContent=`Sun is ${Math.max(0,elD).toFixed(0)}° above the horizon, toward the ${compass(Math.atan2(E,N)*180/Math.PI)}.`}
function compass(b){b=(b+360)%360;return['north','north-east','east','south-east','south','south-west','west','north-west'][Math.round(b/45)%8]}
function clock(h){h=((h%24)+24)%24;const hh=Math.floor(h),mm=Math.round((h-hh)*60);let H=hh,M=mm;if(M===60){H++;M=0}const ap=H>=12&&H<24?'PM':'AM';const h12=H%12===0?12:H%12;return h12+':'+String(M).padStart(2,'0')+' '+ap}
function syncSunSlider(){const[sr,ss]=dayRange(SEASONS[ST.season].decl);const a=sr-.3,b=ss+.3;ST.hour=Math.min(b,Math.max(a,ST.hour));const t=(ST.hour-a)/(b-a);$('sunSl').value=Math.round(t*1000);$('sunLab').textContent=clock(ST.hour)}
function setHourFromSlider(){const[sr,ss]=dayRange(SEASONS[ST.season].decl);const a=sr-.3,b=ss+.3;ST.hour=a+(b-a)*($('sunSl').value/1000);$('sunLab').textContent=clock(ST.hour);applySun()}
function setSeason(s,quiet){{const r0=dayRange(SEASONS[ST.season].decl);const fr=Math.min(.72,Math.max(.25,(ST.hour-r0[0])/(r0[1]-r0[0])));ST.season=s;const r1=dayRange(SEASONS[s].decl);ST.hour=r1[0]+fr*(r1[1]-r1[0])}ST.season=s;const sn=SEASONS[s];U.uSnow.value=sn.snow;U.uFall.value=sn.fall;U.uSpring.value=sn.spring;U.uWinter.value=sn.winter;
 document.querySelectorAll('#seasonSeg .chip').forEach(c=>c.classList.toggle('on',c.dataset.s===s));$('seasonInfo').textContent=sn.info;syncSunSlider();applySun();requestShadow(false);
 if(!quiet)toast({summer:'☀️ Summer',fall:'🍂 Fall',winter:'❄️ Winter',spring:'🌱 Spring'}[s]+' · snow line about '+Math.round(sn.snow*3.28084/100)*100+' ft')}
// ---------------------------------------------------------------- shadows (worker)
let worker=null,shadowBusy=false,shadowPending=null,shadowTex=null,shadowId=0;
function workerMain(){let H=null,NXs=0,NYs=0,cell=0,hmax=0;
 self.onmessage=e=>{const m=e.data;if(m.type==='init'){H=new Float32Array(m.h);NXs=m.nx;NYs=m.ny;cell=m.cell;hmax=0;for(let i=0;i<H.length;i++)if(H[i]>hmax)hmax=H[i];return}
  const{id,sx,sz,tanE,exag,level,stride}=m;const w=Math.ceil(NXs/stride),h=Math.ceil(NYs/stride);const out=new Uint8Array(w*h);
  if(m.night){out.fill(0);self.postMessage({id,w,h,out},[out.buffer]);return}
  const lv=level>0?level:-1e9;const pen=.022;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const cx=x*stride,cy=y*stride;let h0=H[cy*NXs+cx];if(h0<lv)h0=lv;let ms=-1e9,d=stride;
   while(d<900){const px=Math.round(cx+sx*d),py=Math.round(cy+sz*d);if(px<0||py<0||px>=NXs||py>=NYs)break;let hs=H[py*NXs+px];if(hs<lv)hs=lv;
    const sl=(hs-h0)*exag/(d*cell);if(sl>ms)ms=sl;if((hmax-h0)*exag/(d*cell)<tanE-.05)break;d+=d<16?stride:d*.09}
   const t=Math.min(1,Math.max(0,(ms-(tanE-pen))/(2*pen)));const s=t*t*(3-2*t);out[y*w+x]=Math.round((1-s)*255)}
  self.postMessage({id,w,h,out},[out.buffer])}}
function initWorker(){const blob=new Blob(['('+workerMain.toString()+')()'],{type:'application/javascript'});worker=new Worker(URL.createObjectURL(blob));
 const d=downH(HGT,2);worker.postMessage({type:'init',h:d.o.buffer,nx:d.w,ny:d.hh,cell:CELL*2},[d.o.buffer]);
 worker.onmessage=e=>{const{id,w,h,out}=e.data;const t=new THREE.DataTexture(out,w,h,THREE.RedFormat,THREE.UnsignedByteType);t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;t.unpackAlignment=1;t.needsUpdate=true;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
  if(shadowTex)shadowTex.dispose();shadowTex=t;U.uShadow.value=t;shadowBusy=false;if(shadowPending){const p=shadowPending;shadowPending=null;runShadow(p)}}}
function runShadow(fast){if(!worker)return;if(shadowBusy){shadowPending=fast;return}shadowBusy=true;
 const sd=U.uSunDir.value;const hl=Math.hypot(sd.x,sd.z)||1e-4;const elev=Math.asin(sd.y);
 worker.postMessage({id:++shadowId,sx:sd.x/hl,sz:sd.z/hl,tanE:Math.tan(Math.max(elev,.001)),exag:ST.exag,level:U.uWater.value,stride:fast?4:2,night:elev<.005})}
let shT=0;function requestShadow(fast){clearTimeout(shT);if(fast){runShadow(true);shT=setTimeout(()=>runShadow(false),260)}else shT=setTimeout(()=>runShadow(false),60)}
// ---------------------------------------------------------------- tween / camera
const TW={active:false};
function spherical(t,p){const d=_v.copy(p).sub(t);const r=d.length();return{r,az:Math.atan2(d.x,-d.z),el:Math.asin(d.y/r)}}
function posFrom(t,r,az,el,out){return out.set(t.x+r*Math.cos(el)*Math.sin(az),t.y+r*Math.sin(el),t.z-r*Math.cos(el)*Math.cos(az))}
function flyTo(target,r,azDeg,elDeg,opt={}){const t1=target.clone();const s0=spherical(ctl.target,cam.position);let az1=azDeg*Math.PI/180;let da=az1-s0.az;da=Math.atan2(Math.sin(da),Math.cos(da));
 const el1=elDeg*Math.PI/180;
 if(opt.instant){ctl.target.copy(t1);posFrom(t1,r,s0.az+da,el1,cam.position);ctl.update();return}
 const dist=ctl.target.distanceTo(t1);const dur=Math.min(3.4,Math.max(1.4,.9+dist*.045));
 TW.active=true;TW.t0=performance.now();TW.dur=dur*1000;TW.tf=ctl.target.clone();TW.tt=t1;TW.r0=s0.r;TW.r1=r;TW.az0=s0.az;TW.da=da;TW.el0=s0.el;TW.el1=el1;TW.lift=Math.min(1.1,dist*.03+Math.abs(Math.log(r/s0.r))*.2);ctl.enabled=false}
function stopTween(){if(TW.active){TW.active=false;ctl.enabled=true}}
canvas.addEventListener('pointerdown',stopTween);canvas.addEventListener('wheel',stopTween,{passive:true});
function stepTween(){if(!TW.active)return;const k=Math.min(1,(performance.now()-TW.t0)/TW.dur);const e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
 const tg=_v.copy(TW.tf).lerp(TW.tt,e);const r=Math.exp(lerp(Math.log(TW.r0),Math.log(TW.r1),e))*(1+TW.lift*Math.sin(Math.PI*e));
 const az=TW.az0+TW.da*e,el=lerp(TW.el0,TW.el1,e);ctl.target.copy(tg);posFrom(tg,r,az,el,cam.position);cam.lookAt(tg);
 if(k>=1){TW.active=false;ctl.enabled=true;ctl.update()}}
const PO={};function poiPos(p){return new THREE.Vector3(p.x,0,p.z)}
function flyPOI(p,opt){const t=new THREE.Vector3(p.x,surfY(p.x,p.z)+.05,p.z);flyTo(t,p.d,p.az,p.el,opt);toast((p.type==='peak'?'⛰️ ':p.e+' ')+p.w)}
// ---------------------------------------------------------------- hotspots
const hsl=$('hsl');const prioOf=p=>p.id==='here'?100:(p.id==='timp'||p.id==='nebo')?90:p.type==='peak'?72:p.type==='water'?60:p.type==='hist'?55:p.type==='geo'?55:45;
function buildHotspots(){for(const p of POIS){[p.x,p.z]=ll2w(p.lat,p.lon);p.pr=prioOf(p);PO[p.id]=p;
 const d=document.createElement('div');d.className='hs '+p.type;d.innerHTML='<i>'+p.e+'</i><s>'+p.w+(p.ft?'<small>'+p.ft.toLocaleString()+' ft</small>':'')+'</s>';
 d.addEventListener('pointerup',ev=>{ev.stopPropagation();d.classList.add('tap');setTimeout(()=>d.classList.remove('tap'),3000);openCard(p)});
 d.addEventListener('pointerdown',ev=>ev.stopPropagation());hsl.appendChild(d);p.dom=d}}
let hsFrame=0;const _p=new THREE.Vector3(),_s=new THREE.Vector3(),_r=new THREE.Vector3();
function occluded(p,y){const cx=cam.position.x,cy=cam.position.y,cz=cam.position.z;for(let i=1;i<=24;i++){const t=i/25;const x=cx+(p.x-cx)*t,z=cz+(p.z-cz)*t,ry=cy+(y-cy)*t;if(surfY(x,z)>ry+.03)return true}return false}
function updateHotspots(){hsFrame++;const W=innerWidth,H=innerHeight;const br=$('bar').getBoundingClientRect();const items=[];
 for(const p of POIS){const y=surfY(p.x,p.z);_p.set(p.x,y+.02,p.z);const dist=cam.position.distanceTo(_p);_s.copy(_p).project(cam);
  const vis=_s.z<1&&Math.abs(_s.x)<1.04&&Math.abs(_s.y)<1.04;p._vis=vis;if(!vis){p._show=false;continue}
  p._x=(_s.x+1)/2*W;p._y=(1-_s.y)/2*H;p._d=dist;if(hsFrame%7===0||p._occ===undefined)p._occ=occluded({x:p.x,z:p.z},y+.02);items.push(p)}
 items.sort((a,b)=>b.pr-a.pr);const kept=[];const minSep=IS_MOBILE?30:34;
 for(const p of items){let ok=true;for(const q of kept){const dx=p._x-q._x,dy=p._y-q._y;if(dx*dx+dy*dy<minSep*minSep){ok=false;break}}
  if(p._y>br.top-26&&p._x>br.left-10&&p._x<br.right+10)ok=false;
  if(ok&&p.pr<90&&p._d>115)ok=false;
  if(ok){kept.push(p);p._show=true}else p._show=false}
 const lr=[];for(const p of kept){p._lab=false;if(!(p._d<20||p.pr>=90))continue;const w=(p.w.length+(p.ft?7:0))*6.6+16;const r={x0:p._x-w/2,x1:p._x+w/2,y0:p._y+6,y1:p._y+30};let ok=true;
  for(const q of kept){if(q===p)continue;if(q._x>r.x0-14&&q._x<r.x1+14&&q._y>r.y0-14&&q._y<r.y1+14){ok=false;break}}
  if(ok)for(const o of lr){if(r.x0<o.x1&&r.x1>o.x0&&r.y0<o.y1&&r.y1>o.y0){ok=false;break}}
  if(ok){p._lab=true;lr.push(r)}}
 for(const p of POIS){const el=p.dom;if(!p._vis||!p._show||!ST.labels){if(p._on!==false){el.style.display='none';p._on=false}continue}
  if(p._on!==true){el.style.display='';p._on=true}
  const k=Math.max(.85,Math.min(1.2,16/p._d+.8));el.style.transform=`translate3d(${p._x.toFixed(1)}px,${p._y.toFixed(1)}px,0) translate(-50%,-12px) scale(${k.toFixed(2)})`;
  el.classList.toggle('near',!!p._lab);el.classList.toggle('occ',!!p._occ)}}
// ---------------------------------------------------------------- UI: cards, panels, toasts
let toastT;function toast(t){const e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),2400)}
function srcHtml(ids){return 'Sources: '+ids.map(i=>`<a href="${SOURCES[i].u}" target="_blank" rel="noopener">${SOURCES[i].t.split(' – ')[0].replace(/^(Wikipedia|Peakbagger|NOAA National Geodetic Survey datasheet LO0769 \(Timpanogos summit mark\))$/,m=>m)}</a>`).join(' · ')}
function srcShort(id){const s=SOURCES[id];return s.t.length>46?s.t.slice(0,44)+'…':s.t}
let cardPOI=null;
function openCard(p){closePanels();$('credits').classList.remove('on');cardPOI=p;$('cE').textContent=p.e==='▲'?'⛰️':p.e;$('cH').textContent=p.h;$('cB').innerHTML='<p>'+p.t+'</p>';
 const a=$('cA');a.innerHTML='';const b=document.createElement('button');b.className='btn';b.textContent='🎥 Fly there';b.onclick=()=>flyPOI(p);a.appendChild(b);
 if(p.scan){const s=document.createElement('button');s.className='btn o';s.textContent='🌀 Spin the real 3D scan';s.onclick=()=>openViewer(p.scan);a.appendChild(s)}
 $('cS').innerHTML='Sources: '+p.src.map(i=>`<a href="${SOURCES[i].u}" target="_blank" rel="noopener">${srcShort(i)}</a>`).join(' · ');
 $('card').classList.add('on');$('card').scrollTop=0;
 const dist=cam.position.distanceTo(new THREE.Vector3(p.x,surfY(p.x,p.z),p.z));if(dist>p.d*3.2)flyPOI(p)}
function closeCard(){$('card').classList.remove('on');cardPOI=null}
function closePanels(){document.querySelectorAll('.panel.on').forEach(x=>x.classList.remove('on'));document.querySelectorAll('#bar .ib.on').forEach(x=>x.classList.remove('on'))}
function togglePanel(pid,btn){const el=$(pid);const was=el.classList.contains('on');closePanels();closeCard();$('credits').classList.remove('on');if(!was){el.classList.add('on');btn&&btn.classList.add('on')}}
document.querySelectorAll('[data-closep]').forEach(b=>b.onclick=closePanels);
document.querySelectorAll('[data-closec]').forEach(b=>b.onclick=()=>{b.parentNode.classList.remove('on');cardPOI=null});
canvas.addEventListener('pointerdown',()=>{closePanels()});
$('bFly').onclick=e=>togglePanel('panFly',e.currentTarget);$('bSun').onclick=e=>togglePanel('panSun',e.currentTarget);
$('bSeason').onclick=e=>{const o=['summer','fall','winter','spring'];setSeason(o[(o.indexOf(ST.season)+1)%4]);closePanels()};
$('bLayers').onclick=e=>togglePanel('panLay',e.currentTarget);
$('bHere').onclick=()=>{closePanels();const p=PO.here;flyPOI(p);openCard(p)};
$('credBtn').onclick=()=>{closePanels();closeCard();$('credits').classList.toggle('on')};
const SV='<svg viewBox="0 0 24 24" stroke-width="2.4"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.4" fill="#fff"/><circle cx="15" cy="17" r="2.4" fill="#fff"/></svg>',XV='<svg viewBox="0 0 24 24" stroke-width="2.8"><path d="M6 6l12 12M18 6 6 18"/></svg>';
$('tog').onclick=()=>{const b=$('bar'),m=b.classList.toggle('min');$('tog').innerHTML=m?SV:XV;$('tog').dataset.tip=m?'Show buttons':'Hide buttons';if(m)closePanels()};
function setLabels(v){ST.labels=v;$('hsl').classList.toggle('off',!v);$('bLab').style.opacity=v?1:.55;$('bLab').dataset.tip=v?'Hide info dots':'Show info dots';try{localStorage.setItem('uv_labels',v?'on':'off')}catch(e){}}
$('bLab').onclick=()=>setLabels(!ST.labels);try{setLabels(localStorage.getItem('uv_labels')!=='off')}catch(e){setLabels(true)}
// fly menu
(function(){const l=$('flyList');for(const g of FLY){const d=document.createElement('div');d.className='flyg';d.innerHTML='<small>'+g.g+'</small>';const s=document.createElement('div');s.className='seg';
 for(const id of g.ids){const p=POIS.find(x=>x.id===id);const b=document.createElement('button');b.className='chip';b.textContent=(p.type==='peak'?'▲ ':p.e+' ')+p.w.replace(' (Squaw Peak)','').replace(' (Maple Mountain)','').replace(' (Oquirrh Mts.)','');b.onclick=()=>{closePanels();flyPOI(PO[id]);if(id==='here')openCard(PO[id])};s.appendChild(b)}d.appendChild(s);l.appendChild(d)}})();
// sun & season
$('sunSl').addEventListener('input',()=>{setHourFromSlider();requestShadow(true)});$('sunSl').addEventListener('change',()=>{requestShadow(false)});
document.querySelectorAll('#seasonSeg .chip').forEach(c=>c.onclick=()=>setSeason(c.dataset.s));
// terrain
function setExag(v){const old=ST.exag;ST.exag=v;U.uExag.value=v;$('exLab').textContent=v.toFixed(1)+'× tall';
 const dy=(groundM(ctl.target.x,ctl.target.z)-BASE_M)*.001*(v-old);ctl.target.y+=dy;cam.position.y+=dy;requestShadow(true)}
$('exSl').addEventListener('input',e=>setExag(+e.target.value));$('exSl').addEventListener('change',()=>requestShadow(false));
function setLayer(l){ST.layer=l;U.uMode.value=l==='ramp'?1:0;document.querySelectorAll('#laySeg .chip').forEach(c=>c.classList.toggle('on',c.dataset.l===l));$('legend').classList.toggle('on',l==='ramp')}
document.querySelectorAll('#laySeg .chip').forEach(c=>c.onclick=()=>setLayer(c.dataset.l));
$('contBtn').onclick=()=>{ST.contour=ST.contour?0:1;U.uContour.value=ST.contour;$('contBtn').classList.toggle('on',!!ST.contour)};
$('shadBtn').classList.add('on');$('shadBtn').onclick=()=>{ST.shadows=ST.shadows?0:1;U.uShadowOn.value=ST.shadows;$('shadBtn').classList.toggle('on',!!ST.shadows)};
// Bonneville
let bonnAnim=null;
function ft(m){return Math.round(m*3.28084).toLocaleString()}
function setLevel(m,fromSlider){ST.bonnLvl=m;U.uWater.value=m>1372?m:0;$('bonnLab').textContent=m>1372?ft(m)+' ft':'4,489 ft';if(!fromSlider)$('bonnSl').value=m;
 const on=m>1372;ST.bonnOn=on;$('bBonn').classList.toggle('on',on&&false);$('bonnTog').classList.toggle('on',on);$('bonnTog').textContent=on?'Drain the lake':'Flood the valley'}
function bonnTo(target,instant){stopBonn();const from=ST.bonnLvl;if(instant){setLevel(target);requestShadow(false);return}
 const t0=performance.now(),dur=Math.abs(target-from)/180*5200+800;bonnAnim=requestAnimationFrame(function step(){const k=Math.min(1,(performance.now()-t0)/dur);const e=k*k*(3-2*k);setLevel(lerp(from,target,e));
  if(k<1)bonnAnim=requestAnimationFrame(step);else{bonnAnim=null;requestShadow(false);if(target<=1372){ST.benchPulse=8;if(!ST.benchTarget)toast('✨ Look! The old Lake Bonneville shorelines are glowing')}}})}
function stopBonn(){if(bonnAnim){cancelAnimationFrame(bonnAnim);bonnAnim=null}}
function toggleBonn(){const on=ST.bonnLvl>1372;if(on)bonnTo(1371);else{bonnTo(BONN_M);toast('🌊 Lake Bonneville is rising to 5,090 ft…');if(cam.position.y<1.2)flyTo(ctl.target.clone(),Math.max(30,ctl.target.distanceTo(cam.position)),250,24)}}
$('bBonn').onclick=e=>{closeCard();$('credits').classList.remove('on');const p=$('panBonn');const was=p.classList.contains('on');if(!was||ST.bonnLvl<=1372){closePanels();p.classList.add('on');if(ST.bonnLvl<=1372)toggleBonn()}else closePanels()};
$('bonnTog').onclick=toggleBonn;$('bonnSl').addEventListener('input',e=>{stopBonn();setLevel(+e.target.value,true);requestShadow(true)});$('bonnSl').addEventListener('change',()=>requestShadow(false));
$('benchBtn').onclick=()=>{ST.benchTarget=ST.benchTarget?0:1;$('benchBtn').classList.toggle('on',!!ST.benchTarget)};
// compass & scale
$('compass').onclick=()=>{const t=ctl.target.clone();const s=spherical(ctl.target,cam.position);flyTo(t,s.r,180,Math.max(18,s.el*180/Math.PI))};
function updateCompass(){const f=_v.copy(ctl.target).sub(cam.position);const b=Math.atan2(f.x,-f.z)*180/Math.PI;$('needle').style.transform=`rotate(${(-b).toFixed(1)}deg)`}
let lastScale=-1;function updateScale(){const r=cam.position.distanceTo(ctl.target);const kmPerPx=2*r*Math.tan(cam.fov*Math.PI/360)/innerHeight;const opts=[.25,.5,1,2,5,10,20,50];let best=opts[0];for(const o of opts){if(o/kmPerPx<=110)best=o}
 const key=best+'_'+Math.round(best/kmPerPx);if(key===lastScale)return;lastScale=key;$('sbar').style.width=Math.round(best/kmPerPx)+'px';$('stxt').textContent=(best<1?best*1000+' m':best+' km')+' · '+(best*0.621371<1?Math.round(best*3280.84)+' ft':(best*0.621371).toFixed(best<4?1:0)+' mi')}
// ---------------------------------------------------------------- scan viewer
const SCANS={
 timp:{f:'assets/timp.glb',t:'Mount Timpanogos',cap:'3D photogrammetry “Mount Timpanogos Early 2017” by <a href="https://sketchfab.com/scottneb" target="_blank" rel="noopener">Scott Nebeker</a> · <a href="https://sketchfab.com/3d-models/mount-timpanogos-early-2017-af5dfd9ef50d4b68bbfcc1ed284985ae" target="_blank" rel="noopener">Sketchfab</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a> · simplified & recompressed',bg:[.78,.85,.93]},
 marker:{f:'assets/marker.glb',t:'Escalante Trail marker, Provo',cap:'3D scan “Escalante Trail No 1” by <a href="https://sketchfab.com/thorsted" target="_blank" rel="noopener">thorsted</a> · <a href="https://sketchfab.com/3d-models/escalante-trail-no-1-f206c02d447e4f14b79f7d84a922c3da" target="_blank" rel="noopener">Sketchfab</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a> · simplified & recompressed',bg:[.80,.86,.92]},
 rock:{f:'assets/rock.glb',t:'Rock art boulder',cap:'3D scan “Archaic Utah Lake Rock Art” by <a href="https://sketchfab.com/rbischoff" target="_blank" rel="noopener">Robert Bischoff</a> · <a href="https://sketchfab.com/3d-models/archaic-utah-lake-rock-art-a2752e7333dd4eee914c577b8267cf59" target="_blank" rel="noopener">Sketchfab</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a> · simplified & recompressed',bg:[.80,.86,.92]}};
let VW=null;
async function openViewer(key){const sc=SCANS[key];$('viewer').classList.add('on');$('vcap').innerHTML='Loading the 3D scan…';closeViewerGL();
 const r=new THREE.WebGLRenderer({canvas:$('vc'),antialias:true,alpha:true});r.setPixelRatio(Math.min(devicePixelRatio,2));r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
 const sc3=new THREE.Scene();sc3.add(new THREE.HemisphereLight(0xffffff,0x667788,key==='timp'?2.2:1.6));const dl=new THREE.DirectionalLight(0xfff2dd,key==='timp'?2.2:2.6);dl.position.set(3,5,2);sc3.add(dl);
 const vc=new THREE.PerspectiveCamera(40,1,.01,500);const oc=new OrbitControls(vc,$('vc'));oc.enableDamping=true;oc.autoRotate=true;oc.autoRotateSpeed=1.2;oc.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};
 VW={r,sc3,vc,oc,raf:0,obj:null};
 function size(){const b=$('vbox').getBoundingClientRect();r.setSize(b.width,b.height,false);vc.aspect=b.width/b.height;vc.updateProjectionMatrix()}size();VW.size=size;addEventListener('resize',size);
 try{const ld=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);const g=await ld.loadAsync(sc.f);if(!VW)return;const o=g.scene;sc3.add(o);const bb=new THREE.Box3().setFromObject(o),c=bb.getCenter(new THREE.Vector3()),s=bb.getSize(new THREE.Vector3());o.position.sub(c);
  const rad=Math.max(s.x,s.y,s.z)*.5;vc.position.set(rad*1.5,rad*.9,rad*2.1);oc.minDistance=rad*.5;oc.maxDistance=rad*6;oc.update();$('vcap').innerHTML=sc.cap;
 }catch(e){$('vcap').textContent='Could not load the scan: '+e.message}
 (function loop(){if(!VW)return;VW.raf=requestAnimationFrame(loop);VW.oc.update();VW.r.render(VW.sc3,VW.vc)})()}
function closeViewerGL(){if(!VW)return;cancelAnimationFrame(VW.raf);removeEventListener('resize',VW.size);VW.oc.dispose();VW.sc3.traverse(o=>{if(o.isMesh){o.geometry.dispose();const m=o.material;['map','normalMap','roughnessMap','metalnessMap','aoMap','emissiveMap'].forEach(k=>m[k]&&m[k].dispose());m.dispose()}});VW.r.dispose();VW.r.forceContextLoss();VW=null}
function closeViewer(){closeViewerGL();$('viewer').classList.remove('on')}
$('vx').onclick=closeViewer;$('viewer').addEventListener('pointerdown',e=>{if(e.target===$('viewer'))closeViewer()});
// ---------------------------------------------------------------- credits
function buildCredits(){const L=(k)=>`<li><a href="${SOURCES[k].u}" target="_blank" rel="noopener">${SOURCES[k].t}</a></li>`;
 $('credBody').innerHTML=`<h4>Real data in this model</h4><ul>
<li><b>Terrain / elevation:</b> USGS 3D Elevation Program (3DEP) bare-earth DEM (1/3 arc-second, ~10 m; lidar-derived where available), served by <a href="https://www.usgs.gov/3d-elevation-program" target="_blank" rel="noopener">The National Map</a>. U.S. Government work, public domain. Resampled to a 37.5 m grid and re-encoded; extra detail near the camera is procedural noise.</li>
<li><b>Aerial imagery:</b> “Sentinel-2 cloudless 2024” by <a href="https://s2maps.eu" target="_blank" rel="noopener">EOX IT Services GmbH</a> (contains modified Copernicus Sentinel data 2024), <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>. This page is non-commercial and shares alike under the same license for the imagery. Fine detail from <a href="https://www.usgs.gov/centers/eros/science/usgs-eros-archive-aerial-photography-national-agriculture-imagery-program-naip" target="_blank" rel="noopener">USGS/USDA NAIP</a> aerial photos via The National Map (public domain). Both were merged, shading-corrected and baked into a single texture. Seasonal colors and snow are computed from elevation.</li>
<li><b>Shaded sun light, sky, haze and water:</b> made in code for this page (three.js, MIT). Shadows are computed from the real terrain.</li></ul>
<h4>Real 3D scans (all CC BY 4.0, from Sketchfab)</h4><ul>
<li>“Mount Timpanogos Early 2017” by <a href="https://sketchfab.com/scottneb" target="_blank" rel="noopener">Scott Nebeker</a>, <a href="https://sketchfab.com/3d-models/mount-timpanogos-early-2017-af5dfd9ef50d4b68bbfcc1ed284985ae" target="_blank" rel="noopener">link</a>. <i>Changes:</i> mesh simplified, textures resized and recompressed.</li>
<li>“Escalante Trail No 1” by <a href="https://sketchfab.com/thorsted" target="_blank" rel="noopener">thorsted</a>, <a href="https://sketchfab.com/3d-models/escalante-trail-no-1-f206c02d447e4f14b79f7d84a922c3da" target="_blank" rel="noopener">link</a>. <i>Changes:</i> mesh simplified, textures recompressed.</li>
<li>“Archaic Utah Lake Rock Art” by <a href="https://sketchfab.com/rbischoff" target="_blank" rel="noopener">Robert Bischoff</a>, <a href="https://sketchfab.com/3d-models/archaic-utah-lake-rock-art-a2752e7333dd4eee914c577b8267cf59" target="_blank" rel="noopener">link</a>. <i>Changes:</i> mesh simplified, textures recompressed.</li></ul>
<h4>How we checked the numbers</h4><p style="margin:4px 0">Peak heights come from published surveys (feet), and each was cross-checked against the 3DEP data in this model (it reads 0.1%–0.5% lower because it is smoothed to 37.5 m). Timpanogos 11,752 ft is the NGS summit mark (lidar says 11,753). Nebo 11,928 ft is the USGS map value (newer surveys: 11,933). Loafer Mountain is 10,696 ft by GPS/lidar (older maps: 10,687). Lone Peak 11,253 ft is the USGS/Wilderness.net value. Bonneville and Provo shoreline heights were also measured in the 3DEP data: flat benches show up at about 5,090 ft and about 4,740 ft in Utah Valley.</p>
<h4>Fact sources</h4><ul>${Object.keys(SOURCES).map(L).join('')}</ul>
<p style="opacity:.7;margin-top:10px">Built with <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a>. Places marked with pins are general locations, not exact addresses.</p>`}
// ---------------------------------------------------------------- loop
let frame=0,lastT=performance.now(),acc=0,nAcc=0,slowAt=0,idleAt=performance.now();
['pointerdown','wheel','touchstart','keydown'].forEach(ev=>addEventListener(ev,()=>idleAt=performance.now(),{passive:true}));
function resize(){R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.fov=cam.aspect<1?58:45;cam.updateProjectionMatrix()}
addEventListener('resize',resize);
function loop(){requestAnimationFrame(loop);const now=performance.now();const dt=Math.min(.1,(now-lastT)/1000);lastT=now;
 if(now-idleAt>14000&&!TW.active&&!bonnAnim&&(frame++%3))return;
 acc+=dt;nAcc++;if(nAcc>=100){const avg=acc/nAcc;acc=0;nAcc=0;if(avg>.034&&PR>1&&now-slowAt>2500){PR=Math.max(1,PR-.25);R.setPixelRatio(PR);R.setSize(innerWidth,innerHeight,false);slowAt=now;window.__pr=PR}}
 U.uTime.value+=dt;
 stepTween();ctl.update();
 // keep orbit target on the surface & inside the model
 const tx=Math.max(-WKM/2+1,Math.min(WKM/2-1,ctl.target.x)),tz=Math.max(-DKM/2+1,Math.min(DKM/2-1,ctl.target.z));ctl.target.x=tx;ctl.target.z=tz;
 if(!TW.active){const ty=surfY(tx,tz);ctl.target.y+=(ty-ctl.target.y)*.12}
 const gy=surfY(cam.position.x,cam.position.z)+.07;if(cam.position.y<gy)cam.position.y=gy;
 const dsurf=Math.max(.3,cam.position.y-surfY(cam.position.x,cam.position.z));cam.near=Math.min(2,Math.max(.03,Math.min(dsurf,cam.position.distanceTo(ctl.target))*.04));cam.far=420;cam.updateProjectionMatrix();
 sky.position.copy(cam.position);
 if(ST.benchPulse>0){ST.benchPulse-=dt}const bt=ST.benchTarget?1:(ST.benchPulse>0?1:0);ST.bench+=(bt-ST.bench)*Math.min(1,dt*3);U.uBench.value=ST.bench<.01?0:ST.bench;
 if(frame%2===0||true){updateLOD()}
 R.render(S,cam);
 updateHotspots();updateCompass();updateScale();
 if(!window.__ready){window.__ready=true}}
// ---------------------------------------------------------------- boot
async function boot(){
 resize();
 prog(.02,'Starting…');
 const [hb,cb]=await Promise.all([fetchBlob('assets/height.webp',.02,.3,'Loading real lidar elevation…'),fetchBlob('assets/color.webp',.02,.7,'Loading aerial photos…')]);
 prog(.72,'Decoding elevation…');
 const hbmp=await toBitmap(hb);const cv=document.createElement('canvas');cv.width=NX;cv.height=NY;const cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(hbmp,0,0);
 const px=cx.getImageData(0,0,NX,NY).data;HGT=new Float32Array(NX*NY);MASK=new Uint8Array(NX*NY);
 for(let i=0,j=0;i<HGT.length;i++,j+=4){HGT[i]=1200+((px[j]<<8)|px[j+1])*.5;MASK[i]=px[j+2]}
 await new Promise(r=>setTimeout(r,16));
 prog(.78,'Computing slopes…');
 const hT=new THREE.DataTexture(HGT,NX,NY,THREE.RedFormat,THREE.FloatType);hT.minFilter=hT.magFilter=THREE.NearestFilter;hT.generateMipmaps=false;hT.needsUpdate=true;U.uHeight.value=hT;
 const gF=buildGrad(HGT,NX,NY,CELL);const tF=new THREE.DataTexture(gF,NX,NY,THREE.RGFormat,THREE.HalfFloatType);tF.minFilter=tF.magFilter=THREE.LinearFilter;tF.generateMipmaps=false;tF.needsUpdate=true;U.uGradF.value=tF;
 await new Promise(r=>setTimeout(r,16));
 const dc=downH(HGT,4);const gC=buildGrad(dc.o,dc.w,dc.hh,CELL*4);const tC=new THREE.DataTexture(gC,dc.w,dc.hh,THREE.RGFormat,THREE.HalfFloatType);tC.minFilter=tC.magFilter=THREE.LinearFilter;tC.generateMipmaps=false;tC.needsUpdate=true;U.uGradC.value=tC;
 const mT=new THREE.DataTexture(MASK,NX,NY,THREE.RedFormat,THREE.UnsignedByteType);mT.minFilter=mT.magFilter=THREE.LinearFilter;mT.generateMipmaps=false;mT.unpackAlignment=1;mT.needsUpdate=true;U.uMask.value=mT;
 prog(.86,'Preparing the aerial photo…');
 const cbmp=await toBitmap(cb);const cT=new THREE.Texture(cbmp);cT.colorSpace=THREE.SRGBColorSpace;cT.flipY=false;cT.generateMipmaps=true;cT.minFilter=THREE.LinearMipmapLinearFilter;cT.magFilter=THREE.LinearFilter;cT.anisotropy=MAXANI;cT.wrapS=cT.wrapT=THREE.ClampToEdgeWrapping;cT.needsUpdate=true;U.uColor.value=cT;
 const st=new THREE.DataTexture(new Uint8Array([255]),1,1,THREE.RedFormat,THREE.UnsignedByteType);st.unpackAlignment=1;st.needsUpdate=true;U.uShadow.value=st;
 prog(.92,'Building the mountains…');
 buildTerrain();buildHotspots();buildCredits();initWorker();
 setSeason('summer',true);setLevel(1371);setExag(1.6);
 // initial view: west of Utah Lake looking east at the Wasatch
 const start={x:3,z:4,r:IS_MOBILE?68:56,az:IS_MOBILE?268:250,el:IS_MOBILE?40:24};
 ctl.target.set(start.x,surfY(start.x,start.z),start.z);posFrom(ctl.target,start.r,start.az*Math.PI/180,start.el*Math.PI/180,cam.position);ctl.update();
 runShadow(false);
 prog(.97,'Lighting the peaks…');
 loop();
 await new Promise(r=>{let n=0;(function w(){if(++n>6||shadowTex)r();else requestAnimationFrame(w)})()});
 prog(1,'Ready!');clearInterval(tipT);$('load').classList.add('gone');setTimeout(()=>$('load').remove(),800);
 window.__ready=true;
}
window.__api={ST,U,cam,ctl,PO,POIS,setSeason,setExag,setLayer,setHour:h=>{ST.hour=h;syncSunSlider();applySun();runShadow(false)},bonn:(on,instant)=>bonnTo(on?BONN_M:1371,instant),bonnLvl:m=>{setLevel(m);requestShadow(false)},setBench:v=>{ST.benchTarget=v},flyPOI:(id,instant)=>flyPOI(PO[id],{instant}),openCard:id=>openCard(PO[id]),
 setView:(t,r,az,el)=>{ctl.target.set(...t);posFrom(ctl.target,r,az*Math.PI/180,el*Math.PI/180,cam.position);ctl.update()},surfY,groundM,openViewer,setContour:v=>{ST.contour=v;U.uContour.value=v},render:()=>R.render(S,cam),setLabels,shadowReady:()=>!shadowBusy&&!!shadowTex,
 info:()=>R.info};
boot().catch(e=>{console.error(e);$('lp').textContent='Sorry, something went wrong: '+e.message;window.onerror(e.message,'app.js',0)});
