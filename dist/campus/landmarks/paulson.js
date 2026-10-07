import * as T from '../../vendor/three.module.js';
import {Parts,Face} from './kit.js?v=21';
import {v3,signPanel} from './facade.js?v=21';
// John A. Paulson Center, 181 Mercer St (BIN 1090263; completed 2022). Not in the 2014 NYC 3D model:
// the plan is the NYC footprint (a 65.7 x 115.6 m rectangle between Mercer St, Bleecker St and W
// Houston St). Heights from CTBUH (skyscrapercenter.com complex 5988): the student residence tower at the
// Bleecker St (north) end 68.6 m / 16 floors, the faculty tower at the Houston St (south) end 91 m /
// 23 floors; a podium of six storeys. Form from Commons photos pc_0..pc_009, pc_mercer, pc_flickr
// (2023-26) and Street View (Mercer and Bleecker, Apr 2026):
//  - podium: reflective glass curtain wall with slim dark vertical fins and dark floor bands, cantilevered over a recessed
//    ground floor with a dark soffit; the name in tall letters down a corner mullion;
//  - student tower: a pixelated stack of glass boxes, some sliding out over the edges with copper-orange
//    undersides, and notches where boxes are missing;
//  - faculty tower: a plain slab of green-tinted glass with fine vertical fins and two shallow setbacks.
// Tower plans (shares of the site) are estimates read from the photos and aerial imagery.
export const PAULSON={bin:1090263,podium:27,ground:5.6,cant:2.8,towerN:68.6,towerS:91,
 // Tower plans in the site's (s along the long axis from Houston St, t across from Mercer St) frame, metres.
 faculty:{s:[0,30],t:[18,65.7]},student:[{s:[85,115.6],t:[0,30],h:68.6},{s:[80,111],t:[34,62],h:60.9}]};
// Site frame from the footprint: origin at the Mercer/Houston corner, s north along Mercer, t east.
export function paulsonFrame(ring){const GU=[.837,-.547],GV=[.547,.837],gu=p=>p[0]*GU[0]+p[1]*GU[1],gv=p=>p[0]*GV[0]+p[1]*GV[1];
 const us=ring.map(gu),vs=ring.map(gv),u0=Math.min(...us),u1=Math.max(...us),v0=Math.min(...vs),v1=Math.max(...vs);
 const at=(s,t)=>[(u0+t)*GU[0]+(v0+s)*GV[0],(u0+t)*GU[1]+(v0+s)*GV[1]];return {at,L:v1-v0,W:u1-u0,GU,GV};}
const hash=(i)=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
// Axis-aligned (site frame) box with all six faces; per-face material names.
function box(P,F,s0,s1,t0,t1,y0,y1,{side='glass',top='roof',bottom=null}={}){const c=[[s0,t0],[s1,t0],[s1,t1],[s0,t1]].map(([s,t])=>F.at(s,t));
 // Faces: south (s0), east (t1), north (s1), west (t0); ring c is s0t0 -> s1t0 -> s1t1 -> s0t1.
 // Edges walked clockwise in map space (b -> a of the CCW ring) so each face's normal points outward.
 const faces=[];for(const [a,b] of [[c[1],c[0]],[c[2],c[1]],[c[3],c[2]],[c[0],c[3]]]){const dx=b[0]-a[0],dn=b[1]-a[1],L=Math.hypot(dx,dn),f=new Face(v3(a),[dx,0,-dn],[0,1,0]);faces.push({f,L});P.rect(side,f,0,L,y0,y1,0);}
 const flat=(y,up,name)=>{const p=c.map(q=>v3(q,y));if(up)P.quad(name,p[0],p[1],p[2],p[3],[0,1,0]);else P.quad(name,p[0],p[3],p[2],p[1],[0,-1,0]);};
 if(top)flat(y1,true,top);if(bottom)flat(y0,false,bottom);return faces;}
// Vertical fins on a face: every `pitch` m, `depth` out, from y0 to y1.
function fins(P,name,f,L,y0,y1,{pitch=1.2,depth=.45,w=.08}={}){for(let u=pitch/2;u<L;u+=pitch)P.block(name,f,u-w/2,u+w/2,y0,y1,0,depth,{skip:['bottom']});}
// Curtain grid lines (mullions and floor lines) as thin proud strips.
function grid(P,name,f,L,y0,y1,{mw=1.5,floor=3.9,d=.06}={}){const n=Math.max(1,Math.round(L/mw));for(let i=1;i<n;i++){const u=L*i/n;P.block(name,f,u-.03,u+.03,y0,y1,0,d,{skip:['top','bottom']});}
 for(let y=y0+floor;y<y1-.2;y+=floor)P.block(name,f,0,L,y-.04,y+.04,0,d,{skip:['left','right']});}
export function paulsonParts(b){const K=PAULSON,P=new Parts(),F=paulsonFrame(b.rings[0]),L=F.L,W=F.W,G=K.ground,c=K.cant,info={pixels:0,towers:0};
 // Ground floor: glazing set back under the cantilevered podium, dark soffit, columns at the corners.
 const g=box(P,F,c,L-c,c,W-c,0,G,{side:'glassLobby',top:null});
 P.quad('soffit',v3(F.at(0,0),G),v3(F.at(0,W),G),v3(F.at(L,W),G),v3(F.at(L,0),G),[0,-1,0]);
 for(const [s,t] of [[c+.4,c+.4],[c+.4,W-c-.4],[L-c-.4,c+.4],[L-c-.4,W-c-.4]]){P.cyl('fin',.3,.3,G,new T.Matrix4().makeTranslation(...v3(F.at(s,t),G/2)),10);}
 // Podium: glass behind dense bronze fins, a dark band at each floor every third storey.
 const pod=box(P,F,0,L,0,W,G,K.podium,{side:'glassPodium',top:'roof',bottom:'soffit'});
 for(const {f,L:l} of pod){fins(P,'fin',f,l,G,K.podium,{pitch:1.5,depth:.28,w:.07});for(const y of [G+.2,G+10.7,K.podium-.6])P.block('fin',f,0,l,y-.2,y+.2,0,.55,{skip:['left','right']});}
 // Faculty tower at the Houston St end: green-tinted glass, fine fins, two shallow setbacks.
 const fa=K.faculty;const t0=box(P,F,fa.s[0],fa.s[1],fa.t[0],fa.t[1],K.podium,K.towerS-8,{side:'glassGreen',top:'roof'});
 const t1=box(P,F,fa.s[0]+2,fa.s[1]-2,fa.t[0]+3,fa.t[1],K.towerS-8,K.towerS,{side:'glassGreen',top:'roof'});info.towers++;
 for(const {f,L:l} of t0){fins(P,'finLight',f,l,K.podium,K.towerS-8,{pitch:1.5,depth:.25,w:.06});grid(P,'mullion',f,l,K.podium,K.towerS-8,{mw:3,floor:3.9});}
 for(const {f,L:l} of t1){fins(P,'finLight',f,l,K.towerS-8,K.towerS,{pitch:1.5,depth:.25,w:.06});}
 box(P,F,fa.s[0]+8,fa.s[1]-8,fa.t[0]+12,fa.t[1]-10,K.towerS,K.towerS+4,{side:'mech',top:'roof'});
 // Student towers at the Bleecker St end: stacked glass boxes in a 4.2 m pixel grid; some cells are
 // left out (dark notches) and some slide 1.5-3 m out with copper undersides (C pc_002, pc_004, pc_008).
 const px=4.2,fl=3.9;let k=0;
 for(const S of K.student){info.towers++;const ns=Math.floor((S.s[1]-S.s[0])/px),nt=Math.floor((S.t[1]-S.t[0])/px),ny=Math.floor((S.h-K.podium)/fl);
  const core=box(P,F,S.s[0]+px,S.s[1]-px,S.t[0]+px,S.t[1]-px,K.podium,S.h,{side:'glassStudent',top:'roof'});for(const {f,L:l} of core)grid(P,'mullion',f,l,K.podium,S.h,{mw:1.4,floor:fl});
  for(let i=0;i<ns;i++)for(let j=0;j<nt;j++){if(i>0&&i<ns-1&&j>0&&j<nt-1)continue;// perimeter ring of cells only
   for(let y=0;y<ny;y+=2){k++;const r=hash(k),s0=S.s[0]+i*px,t0c=S.t[0]+j*px,y0=K.podium+y*fl,y1=Math.min(S.h,y0+2*fl);
    // Columns of cells: the top rows step down toward the edges to break up the silhouette.
    const edgeDrop=(i===0||i===ns-1)&&(j===0||j===nt-1)&&y>=ny-4;if(edgeDrop&&hash(k*7)<.6)continue;
    if(r<.1){box(P,F,s0+.9,s0+px-.9,t0c+.9,t0c+px-.9,y0,y1,{side:'notch',top:null});continue;}// missing box: a dark recess
    let ds=0,dt=0;if(r>.86){const out=1.5+hash(k*3)*1.5;if(i===0)ds=-out;else if(i===ns-1)ds=out;else if(j===0)dt=-out;else dt=out;info.pixels++;}
    box(P,F,s0+ds,s0+px+ds,t0c+dt,t0c+px+dt,y0,y1,{side:'glassStudent',top:'roof',bottom:ds||dt?'copper':null});}}}
 // The name down the corner mullion at Mercer and Bleecker (C pc_006).
 const cf=new Face(v3(F.at(L-c-.9,c-.02)),(()=>{const a=F.at(L-c-.9,c),b2=F.at(L-c-.9-1,c);return [b2[0]-a[0],0,-(b2[1]-a[1])];})(),[0,1,0]);
 P.panel('nameSign',cf,0,.6,.8,5.0,-.01);
 return {P,info,F};}
export function buildPaulson(b){const {P}=paulsonParts(b);const S=o=>new T.MeshStandardMaterial(o);
 const vert=(()=>{const c=document.createElement('canvas');c.width=64;c.height=512;const g=c.getContext('2d');g.fillStyle='#1e1f22';g.fillRect(0,0,64,512);g.save();g.translate(40,500);g.rotate(-Math.PI/2);g.fillStyle='#e8e4dc';g.font='600 30px Helvetica,Arial,sans-serif';g.fillText('JOHN A. PAULSON CENTER',0,0);g.font='14px Helvetica,Arial,sans-serif';g.fillText('NEW YORK UNIVERSITY',0,18);g.restore();const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;})();
 const materials={glassLobby:S({color:0x323a40,emissive:0x2a2418,emissiveIntensity:.25,roughness:.08,metalness:.6}),soffit:S({color:0x2a2426,roughness:.7}),
  glassPodium:S({color:0x6c8ea0,roughness:.05,metalness:.8}),fin:S({color:0x3d3f44,roughness:.45,metalness:.6}),glassGreen:S({color:0x5f8a82,roughness:.06,metalness:.7}),
  finLight:S({color:0x9fb3ad,roughness:.4,metalness:.6}),mullion:S({color:0x2c3438,roughness:.4,metalness:.6}),glassStudent:S({color:0x34506a,roughness:.05,metalness:.8}),
  notch:S({color:0x1a2128,roughness:.3,metalness:.4}),copper:S({color:0xb0582b,roughness:.45,metalness:.6}),mech:S({color:0x6c7072,roughness:.7}),roof:S({color:0x6f6d68,roughness:.95}),
  nameSign:S({map:vert,roughness:.5})};
 const g=P.build(materials);g.name='John A. Paulson Center';g.position.y=.15;g.userData.tris=P.tris;g.userData.materials=Object.values(materials);return g;}
