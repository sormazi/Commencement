import * as T from '../../vendor/three.module.js';
import {Parts,Face,brickTextures,grainTextures,canvas} from './kit.js?v=18';
import {pieces,walls,roofs,v3} from './facade.js?v=18';
import model3d from '../data/campus-3d.js?v=18';
// Brown Building (former Asch Building, site of the Triangle Shirtwaist Factory fire of 1911),
// 23–29 Washington Place at Greene Street (John Woolley, 1900–01; LPC LP-2128, quoted in the
// checklist). Kept intact and dignified in every phase: never decayed, never used in a joke,
// billboard or banner (Avi, 2026-10-07). The flag below lets later phases skip it.
// Tripartite: two-storey base of granite and limestone piers, a transitional third storey, six
// storeys of tan brick with stone sill and lintel courses, an arcaded tenth storey under a strongly
// projecting bracketed cornice. Washington Pl front 101 ft in a 3-1-2-2-1-3 window pattern, Greene
// St front 100 ft in 3-1-1-1-1-3. The Triangle Shirtwaist Factory Fire Memorial (2023) runs along
// the base: a textured stainless-steel ribbon over the storefronts with the victims' names cut
// through it, and a dark reflective panel at hip height below.
export const BROWN={bin:1008823,preserve:true,corner:[151.8,-148.8],wash:[125.7,-132],greene:[168.8,-122.5],
 levels:{ground:5.0,base:9.0,third:13.0,mid:37.2,top:41.6,cornice:42.9},
 groupsW:[3,1,2,2,1,3],groupsG:[3,1,1,1,1,3]};
// One street front. a → b runs left to right as seen from the street.
function front(P,a,b,groups,{entranceGroup,greene}){const B=BROWN,L=B.levels,dx=b[0]-a[0],dn=b[1]-a[1],len=Math.hypot(dx,dn),f=new Face(v3(a),[dx,0,-dn],[0,1,0]);
 const corner=1.55,pier=.9,mull=.3,n=groups.reduce((s,g)=>s+g,0),intra=groups.reduce((s,g)=>s+g-1,0),ww=(len-2*corner-(groups.length-1)*pier-intra*mull)/n;
 // Window columns: [u0,u1,group index].
 const cols=[];let u=corner;groups.forEach((g,gi)=>{for(let k=0;k<g;k++){cols.push([u,u+ww,gi]);u+=ww+(k<g-1?mull:0);}u+=pier;});
 const pav=gi=>gi===0||gi===groups.length-1;
 // ---- upper wall: 3rd to 10th storeys with real window openings ----
 const rows=[];rows.push({y0:L.base+.9,y1:L.third-.7,kind:'third'});for(let k=0;k<6;k++){const y=L.third+k*4.03;rows.push({y0:y+.85,y1:y+3.35,kind:'mid',k});}rows.push({y0:L.mid+.6,y1:L.top-.5,kind:'top'});
 const holes=[];for(const r of rows)for(const [u0,u1] of cols){if(r.kind==='top'){const h=[[u0,r.y0],[u1,r.y0]];const rr=(u1-u0)/2,sp=r.y1-rr;for(let i=0;i<=8;i++){const t=Math.PI*i/8;h.push([(u0+u1)/2+rr*Math.cos(t),sp+rr*Math.sin(t)]);}holes.push(h);}else holes.push([[u0,r.y0],[u1,r.y0],[u1,r.y1],[u0,r.y1]]);}
 P.poly('brick',f,[[0,L.base],[len,L.base],[len,L.top],[0,L.top]],holes,0);
 const back=new Face(f.at(0,0,0),f.u,f.v);
 for(const h of holes){let cu=0,cv=0;for(const p of h){cu+=p[0];cv+=p[1];}cu/=h.length;cv/=h.length;
  for(let k=0;k<h.length;k++){const p=h[k],q=h[(k+1)%h.length],mu=(p[0]+q[0])/2-cu,mv=(p[1]+q[1])/2-cv;P.quad('stone',f.at(p[0],p[1],0),f.at(q[0],q[1],0),f.at(q[0],q[1],-.3),f.at(p[0],p[1],-.3),[-(f.u[0]*mu),-mv,-(f.u[2]*mu)]);}
  P.poly('glass',new Face(f.at(0,0,-.3),f.u,f.v),h);
  const xs=h.map(p=>p[0]),ys=h.map(p=>p[1]),u0=Math.min(...xs),u1=Math.max(...xs),v0=Math.min(...ys),v1=Math.max(...ys);
  P.block('sash',f,u0,u1,v0+(v1-v0)*.5-.04,v0+(v1-v0)*.5+.04,-.3,-.24);P.block('sash',f,(u0+u1)/2-.03,(u0+u1)/2+.03,v0,v1,-.3,-.25);}
 // Stone sill and lintel courses across the brick mid-section; recessed brick spandrel panels with
 // egg-and-dart borders in the corner pavilions (and between 5th/6th and 7th/8th in the centre).
 for(const r of rows.filter(r=>r.kind==='mid')){P.block('stone',f,0,len,r.y0-.22,r.y0,0,.1,{skip:['left','right']});P.block('stone',f,0,len,r.y1,r.y1+.3,0,.08,{skip:['left','right']});
  for(const [gi,g] of groups.entries()){const cs=cols.filter(c=>c[2]===gi);if(!pav(gi)&&!(r.k===1||r.k===3))continue;const u0=cs[0][0],u1=cs[cs.length-1][1];P.block('terra',f,u0,u1,r.y0-.95,r.y0-.3,-.08,0,{skip:['bottom','top']});
   P.block('terra',f,u0,u1,r.y0-.95,r.y0-.88,0,.05);P.block('terra',f,u0,u1,r.y0-.37,r.y0-.3,0,.05);}}
 // Centre-bay window columns: fluted Corinthian cast-iron columns between windows (3rd–9th storeys).
 for(const [gi,g] of groups.entries()){if(pav(gi)||g<2)continue;const cs=cols.filter(c=>c[2]===gi);for(let k=0;k<cs.length-1;k++){const c=(cs[k][1]+cs[k+1][0])/2;P.cyl('iron',.13,.13,L.mid-L.base-1,f.matrix(c,(L.base+L.mid)/2,.05),10);}}
 // Corner pavilions: banded rustication on the brick piers and cartouches at the third storey.
 for(const [u0,u1] of [[0,corner],[len-corner,len]]){for(let y=L.base;y<L.top-.5;y+=.62)P.block('brick',f,u0,u1,y,y+.5,0,.06,{skip:[]});P.block('stone',f,u0,u1,L.third-.6,L.third,0,.18);
  P.geo('terra',new T.SphereGeometry(.5,10,8),f.matrix((u0+u1)/2,L.third-1.4,.1,0,[1,1.25,.35]));}
 for(const [gi,g] of groups.entries())if(pav(gi)){const cs=cols.filter(c=>c[2]===gi);for(const uu of [cs[0][0]-.45,cs[cs.length-1][1]+.45])P.geo('terra',new T.SphereGeometry(.38,10,8),f.matrix(uu,L.third-1.2,.08,0,[1,1.3,.35]));}
 // Third-storey cornice (leaf-and-dart and paterae), base frieze with fret band (Greek key).
 P.block('terra',f,0,len,L.third-.25,L.third,0,.3,{skip:['left','right']});P.block('terra',f,0,len,L.third,L.third+.12,0,.38,{skip:['left','right']});
 P.panel('fret',f,0,len,L.base-.4,L.base,.2);P.block('terra',f,0,len,L.base-.55,L.base-.4,0,.32);P.block('terra',f,0,len,L.base,L.base+.18,0,.4,{skip:['left','right']});
 // Tenth storey: arched windows with keystones; fluted Ionic pilasters in the outer bays.
 for(const h of holes.slice(-cols.length)){const xs=h.map(p=>p[0]),u0=Math.min(...xs),u1=Math.max(...xs);P.block('stone',f,(u0+u1)/2-.17,(u0+u1)/2+.17,L.top-.75,L.top-.2,0,.15);}
 for(const [gi] of groups.entries())if(pav(gi)){const cs=cols.filter(c=>c[2]===gi);for(const c of cs.slice(0,-1).map((c,k)=>(c[1]+cs[k+1][0])/2))P.block('stone',f,c-.18,c+.18,L.mid,L.top,0,.12);}
 // Crowning cornice: galvanized iron, strongly projecting on scrolled brackets.
 P.block('cornice',f,0,len,L.top,L.top+.35,0,.25,{skip:['left','right']});P.block('cornice',f,0,len,L.cornice-.55,L.cornice,0,1.25,{skip:['left','right']});
 for(let uu=.4;uu<len-.2;uu+=1.0){P.block('cornice',f,uu,uu+.22,L.top+.35,L.cornice-.55,.05,1.0,{skip:['top']});}
 for(let uu=.2;uu<len;uu+=.3)P.block('cornice',f,uu,uu+.14,L.cornice-.75,L.cornice-.55,.95,1.15,{skip:['top']});
 // ---- two-storey base: massive banded piers, storefronts, entrance ----
 const majors=[];{const gpos=[];let k=0;for(const [gi] of groups.entries()){const cs=cols.filter(c=>c[2]===gi);gpos.push([cs[0][0],cs[cs.length-1][1]]);}
  // Base piers: at both corners and between the major bays (greene: 7 piers, washington: 5).
  const mid=i=>(gpos[i][1]+gpos[i+1][0])/2,piers=greene?[0,...gpos.slice(0,-1).map((g,i)=>mid(i)),len]:[0,mid(0),mid(2),mid(4),len];
  for(const [pi,c] of piers.entries()){const w=pi===0||pi===piers.length-1?corner:1.2,u0=pi===0?0:pi===piers.length-1?len-w:c-w/2,u1=u0+w;
   P.block('granite',f,u0-.05,u1+.05,0,1.2,0,.35);for(let y=1.2;y<L.base-.6;y+=.9){P.block('limestone',f,u0,u1,y,y+.72,0,.28);P.block('granite',f,u0+.04,u1-.04,y+.72,y+.9,0,.2);}
   P.block('terra',f,u0-.1,u1+.1,L.base-.75,L.base-.55,0,.38);}
  for(let i=0;i<piers.length-1;i++)majors.push([piers[i]+(i===0?corner:.6),piers[i+1]-(i+1===piers.length-1?corner:.6)]);}
 for(const [mi,[u0,u1]] of majors.entries()){// Storefront: granite bulkhead, louvred panel, glass-block infill, signboard; second-storey triplets.
  const ent=mi===entranceGroup;P.block('granite',f,u0,u1,0,.7,-.35,0);
  if(ent){const c=(u0+u1)/2;P.rect('door',f,c-1.0,c+1.0,0,3.2,-.6);P.panel('entranceSign',f,c-1.0,c+1.0,3.25,4.4,-.55);for(const s of [-1,1]){P.panel('bullseye',f,s<0?u0:c+1.15,s<0?c-1.15:u1,.7,3.2,-.4);P.block('iron',f,c+s*1.08-.08,c+s*1.08+.08,0,4.5,-.6,-.2);}
   if(!greene){P.panel('nyuFrieze',f,u0-.1,u1+.1,4.55,5.1,.12);P.block('terra',f,u0-.2,u1+.2,5.1,5.3,0,.3);}}
  else{P.panel('bullseye',f,u0,u1,.7,3.6,-.35);P.block('louvre',f,u0,u1,3.6,4.35,-.36,-.3);}
  P.rect('stone',f,u0,u1,4.35,L.ground,-.1);P.block('stone',f,u0,u1,L.ground-.1,L.ground+.05,0,.2);
  // Second storey: each major bay divided into three window bays by cast-iron mullions.
  P.rect('glass',f,u0,u1,L.ground+.35,L.base-.75,-.25);for(const t of [1/3,2/3])P.block('iron',f,u0+(u1-u0)*t-.09,u0+(u1-u0)*t+.09,L.ground+.35,L.base-.75,-.25,-.05);
  P.block('stone',f,u0,u1,L.ground+.05,L.ground+.35,-.25,0,{skip:['bottom']});P.block('stone',f,u0,u1,L.base-.75,L.base-.55,-.25,0,{skip:['top']});}
 return {f,len};}
// The memorial: textured stainless ribbon over the storefronts, names cut through it, and a dark
// reflective panel at hip height below. Runs along both fronts and turns the corner.
function memorial(P,fronts){for(const {f,len} of fronts){P.panel('ribbon',f,0,len,4.38,4.99,.42);P.block('ribbonEdge',f,0,len,4.36,4.38,.3,.44);P.block('ribbonEdge',f,0,len,4.99,5.01,.3,.44);
  for(let u=1;u<len;u+=3.5)P.block('ribbonEdge',f,u,u+.06,4.4,4.97,0,.42,{skip:['top','bottom']});
  P.panel('reflect',f,.4,len-.4,.75,1.25,.42);P.block('ribbonEdge',f,.4,len-.4,.7,.75,.36,.46);}}
export function brownParts(b){const B=BROWN,P=new Parts();
 const W=front(P,B.wash,B.corner,B.groupsW,{entranceGroup:0,greene:false}),G=front(P,B.corner,B.greene,B.groupsG,{entranceGroup:5,greene:true});memorial(P,[W,G]);
 // Volume behind the fronts and the penthouse from the 3D model (street walls replaced).
 const m=model3d[b.bin];if(m){const ps=pieces(m);for(const w of walls(ps)){const onFront=[[B.wash,B.corner],[B.corner,B.greene]].some(([a,c])=>{const dx=c[0]-a[0],dn=c[1]-a[1],L=Math.hypot(dx,dn),d=p=>Math.abs(((p[0]-a[0])*dn-(p[1]-a[1])*dx)/L);return d(w.a)<1.6&&d(w.b)<1.6;});
  if(onFront&&w.y0<1)continue;P.rect(w.piece.z>B.levels.cornice+.5?'penthouse':'brickPlain',w.face,0,w.len,w.y0,w.piece.z,0);}roofs(P,ps,'roof');}
 return P;}
function textPanel(lines,{w=1024,h=96,bg,ink,font='600 50px "Times New Roman", serif',spacing=.12}={}){const c=canvas(w,h),g=c.getContext('2d');if(bg){g.fillStyle=bg;g.fillRect(0,0,w,h);}g.fillStyle=ink;g.textAlign='center';g.font=font;
 lines.forEach((l,i)=>g.fillText(l,w/2,h*(i+.75)/lines.length));const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
export function buildBrown(b){const P=brownParts(b);
 const brick=brickTextures({base:'#cdbf9f',mortar:'#ddd3c0',vary:.06,seed:51}),grain=grainTextures({base:'#d9cdb7'});
 const std=(t,x={})=>new T.MeshStandardMaterial({map:t.map,normalMap:t.normalMap,normalScale:new T.Vector2(.5,.5),roughness:.85,...x});
 // Fret (Greek key) frieze and the bull's-eye glass panels of the storefront infill.
 const fret=canvas(512,32),fg=fret.getContext('2d');fg.fillStyle='#d4c6ad';fg.fillRect(0,0,512,32);fg.strokeStyle='#8f8068';fg.lineWidth=3;for(let x=0;x<512;x+=32){fg.strokeRect(x+4,6,22,20);fg.beginPath();fg.moveTo(x+10,26);fg.lineTo(x+10,12);fg.lineTo(x+20,12);fg.lineTo(x+20,20);fg.stroke();}
 const ft=new T.CanvasTexture(fret);ft.colorSpace=T.SRGBColorSpace;ft.wrapS=T.RepeatWrapping;ft.repeat.set(12,1);
 const be=canvas(256,256),bg=be.getContext('2d');bg.fillStyle='#24262a';bg.fillRect(0,0,256,256);for(let y=0;y<4;y++)for(let x=0;x<4;x++){const gr=bg.createRadialGradient(32+x*64,32+y*64,4,32+x*64,32+y*64,24);gr.addColorStop(0,'#c9ced2');gr.addColorStop(1,'#5d6368');bg.fillStyle=gr;bg.beginPath();bg.arc(32+x*64,32+y*64,24,0,7);bg.fill();}
 const bt=new T.CanvasTexture(be);bt.colorSpace=T.SRGBColorSpace;bt.wrapS=bt.wrapT=T.RepeatWrapping;bt.repeat.set(6,4);
 // Memorial ribbon: textured steel with lines of cut lettering standing in for the 146 names and
 // ages (rendered as perforation, not legible text, so no name is misspelled or invented).
 const rb=canvas(2048,96),rg=rb.getContext('2d');rg.fillStyle='#4c5052';rg.fillRect(0,0,2048,96);for(let i=0;i<6000;i++){rg.fillStyle=`rgba(${Math.random()>.5?255:0},${Math.random()>.5?255:0},255,.05)`;rg.fillRect(Math.random()*2048,Math.random()*96,3,1);}
 rg.fillStyle='#d8dde0';for(let row=0;row<3;row++){let x=10+row*40;while(x<2030){const wl=60+((x*7+row*13)%70);for(let k=0;k<wl;k+=7)rg.fillRect(x+k,20+row*26,5,9);x+=wl+34;}}
 const rt=new T.CanvasTexture(rb);rt.colorSpace=T.SRGBColorSpace;rt.wrapS=T.RepeatWrapping;rt.repeat.set(3,1);
 const materials={brick:std(brick),brickPlain:std(brick,{color:0xe8e0d0}),stone:std(grain,{roughness:.7}),terra:std(grain,{color:0xe6dcc8,roughness:.7}),limestone:std(grain,{color:0xf2eee6,roughness:.6}),
  granite:new T.MeshStandardMaterial({color:0x4b4a4c,roughness:.35,metalness:.1}),glass:new T.MeshStandardMaterial({color:0x2c3439,roughness:.2,metalness:.4}),sash:new T.MeshStandardMaterial({color:0x34383b,roughness:.5}),
  iron:new T.MeshStandardMaterial({color:0x2a2b2d,roughness:.55,metalness:.5}),cornice:new T.MeshStandardMaterial({color:0x40463f,roughness:.6,metalness:.4}),door:new T.MeshStandardMaterial({color:0x24262b,roughness:.5,metalness:.3}),
  louvre:new T.MeshStandardMaterial({color:0x3a3c3f,roughness:.6,metalness:.4}),fret:new T.MeshStandardMaterial({map:ft,roughness:.7}),bullseye:new T.MeshStandardMaterial({map:bt,roughness:.35,metalness:.3}),
  entranceSign:new T.MeshStandardMaterial({map:textPanel(['BROWN BUILDING','BIOLOGY  CHEMISTRY','29'],{h:192,bg:'#2d2a2a',ink:'#b89b6a',font:'600 44px "Times New Roman", serif'}),roughness:.5}),
  nyuFrieze:new T.MeshStandardMaterial({map:textPanel(['NEW YORK UNIVERSITY'],{bg:'#e6dfd0',ink:'#3a342c'}),roughness:.6}),
  ribbon:new T.MeshStandardMaterial({map:rt,roughness:.35,metalness:.85}),ribbonEdge:new T.MeshStandardMaterial({color:0x5a5e60,roughness:.3,metalness:.9}),reflect:new T.MeshStandardMaterial({color:0x101214,roughness:.05,metalness:.9}),
  penthouse:new T.MeshStandardMaterial({color:0xb8a98f,roughness:.9}),roof:new T.MeshStandardMaterial({color:0x5f5a55,roughness:.95})};
 const g=P.build(materials);g.name='Brown Building';g.position.y=.15;g.userData.preserve=true;g.userData.tris=P.tris;g.userData.materials=Object.values(materials);return g;}
