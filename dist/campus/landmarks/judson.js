import * as T from '../../vendor/three.module.js';
import {Parts,Face,arcPath,arcOnFace,reveal,circle,brickTextures,grainTextures} from './kit.js?v=18';
import {pieces,walls,roofs,punched} from './facade.js?v=18';
import model3d from '../data/campus-3d.js?v=18';
// Judson Memorial Church, 55 Washington Square South at Thompson Street (McKim, Mead & White,
// 1888–93; LPC LP-0196) with its campanile (1895–96) and the porch between them.
// Local frame: origin at the corner of Washington Sq S and Thompson St, +x west along the square,
// +z north (out of the square front), y up; the church runs south along Thompson St to z = -30.8.
// Proportions measured on Commons photos (judson_east, judson_west, judson_square) against the
// footprint: north front 19.7 m (5 bays), east side 30.8 m (7 bays, LPC), eave 12.8 m, pediment
// apex 20.2 m (3D model roof 20.6 m incl. cross base). Campanile height is an ESTIMATE (40 m)
// from the same photos, scaled on Judson Hall's surveyed 21 m cornice.
export const JUDSON={bin:1008717,hallBin:1082205,corner:[-93.7,-107.3],west:[-120,-90.3],W:19.7,D:30.8,eave:12.8,apex:20.2,
 porch:[19.7,23.3],tower:{x0:23.3,x1:30.8,d:7.5,h:40}};
export function judsonParts(){const J=JUDSON,P=new Parts(),W=J.W,D=J.D;
 const N=new Face([0,0,0],[1,0,0],[0,1,0]),E=new Face([0,0,-D],[0,0,1],[0,1,0]),S=new Face([W,0,-D],[-1,0,0],[0,1,0]);
 const rect=(u0,u1,v0,v1)=>[[u0,v0],[u1,v0],[u1,v1],[u0,v1]];
 const archHole=(cu,w,v0,spring,seg=10)=>{const r=w/2,p=[[cu-r,v0],[cu+r,v0]];for(let k=0;k<=seg;k++){const t=Math.PI*k/seg;p.push([cu+r*Math.cos(t),spring+r*Math.sin(t)]);}return p;};
 // A front of n bays: banded ground storey with rectangular windows, marble sill panels, round-
 // headed stained glass (or blind) arches between pilasters, entablature with a dentil cornice.
 const front=(f,L,n,blind=[],ground=true)=>{const bw=L/n,holes=[],arches=[];
  for(let i=0;i<n;i++){const c=(i+.5)*bw,b=blind.includes(i);arches.push({c,b});holes.push(archHole(c,b?2.1:1.95,b?6.0:6.1,9.1));if(ground)holes.push(rect(c-.75,c+.75,1.4,3.9));}
  P.poly('brick',f,[[0,0],[L,0],[L,J.eave],[0,J.eave]],holes,0);
  for(const {c,b} of arches){const w=b?2.1:1.95,v0=b?6.0:6.1;// arch reveal and glass or blind back
   const hole=archHole(c,w,v0,9.1,12);reveal(P,'brick',f,hole,b?.12:.35,b?'brick':'stained');
   if(!b){P.block('lead',f,c-.03,c+.03,v0,9.1+w/2-.05,-.35,-.3);for(const v of [7.1,8.2])P.block('lead',f,c-w/2,c+w/2,v,v+.04,-.35,-.3);}
   P.sweep('terra',[[0,0],[.1,0],[.12,.08],[.1,.16],[0,.2]],arcOnFace(f,c,9.1,w/2,14));
   P.block('marble',f,c-1.15,c+1.15,4.85,5.75,-.04,.02);P.block('terra',f,c-1.3,c+1.3,4.75,4.85,0,.08);P.block('terra',f,c-1.25,c+1.25,v0-.12,v0,0,.12);
   if(ground){P.recess('brick',new Face(f.at(0,0,0),f.u,f.v),c-.75,c+.75,1.4,3.9,.25,'darkGlass');P.block('terra',f,c-.85,c+.85,1.25,1.4,0,.08);}}
  // Pilasters with capitals and bases between the bays (and at the corners).
  for(let i=0;i<=n;i++){const u=i*bw,u0=Math.max(0,u-.35),u1=Math.min(L,u+.35);P.block('brick',f,u0,u1,5.75,10.7,0,.16);P.block('terra',f,u0-.06,u1+.06,10.35,10.75,0,.24);P.block('terra',f,u0-.05,u1+.05,5.75,6.0,0,.2);}
  // Ground storey bands: terra-cotta courses alternating with recessed brick.
  if(ground)for(let v=.25;v<4.6;v+=.42)P.block('terra',f,0,L,v,v+.2,0,.05,{skip:['left','right']});
  P.block('terra',f,0,L,0,.25,0,.12);P.block('terra',f,0,L,4.6,4.75,0,.14);
  // Entablature: architrave, ornamented frieze, dentil and modillion cornice.
  P.block('terra',f,0,L,10.75,11.1,0,.12);P.block('frieze',f,0,L,11.1,11.85,0,.05);
  for(let u=.15;u<L-.1;u+=.24)P.block('terra',f,u,u+.12,11.9,12.08,.05,.2,{skip:['top']});
  P.block('terra',f,0,L,11.85,11.9,0,.22);P.block('terra',f,0,L,12.08,12.5,0,.55);P.block('terra',f,0,L,12.5,12.8,0,.7);
  for(let u=.3;u<L-.2;u+=.62)P.block('terra',f,u,u+.14,12.1,12.5,.2,.5,{skip:['top']});};
 front(N,W,5,[0,4],true);front(E,D,7,[],true);
 // Rear and west walls (west wall is hidden by the porch and tower below their heights).
 P.rect('brick',S,0,W,0,J.eave,0);
 // Pediment over the square front: tympanum, raking cornices, rose window and two roundels, cross.
 const apex=J.apex,mid=W/2;P.poly('brick',N,[[0,J.eave],[W,J.eave],[mid,apex]],[circle(1.35,24,mid,15.9),circle(.62,18,mid-3.6,14.4),circle(.62,18,mid+3.6,14.4)],0);
 for(const [c,r] of [[[mid,15.9],1.35],[[mid-3.6,14.4],.62],[[mid+3.6,14.4],.62]]){P.poly('stained',new Face(N.at(0,0,-.3),N.u,N.v),circle(r,24,c[0],c[1]));
  P.torus('terra',r+.06,.12,N.matrix(c[0],c[1],.04),Math.PI*2,24);}
 for(let k=0;k<8;k++){const a=k/8*Math.PI*2;P.geo('terra',new T.BoxGeometry(.08,1.3,.06),N.matrix(mid+Math.cos(a)*.66,15.9+Math.sin(a)*.66,-.2,a+Math.PI/2));}
 P.torus('terra',.42,.08,N.matrix(mid,15.9,-.18),Math.PI*2,16);
 const slope=Math.atan2(apex-J.eave,mid),rake=(x0,x1,s)=>{const L=Math.hypot(x1-x0,(apex-J.eave)),m=N.matrix((x0+x1)/2,(J.eave+apex)/2+.15,.28,s*slope);P.geo('terra',new T.BoxGeometry(L+.6,.5,.62),m);P.geo('terra',new T.BoxGeometry(L+.6,.18,.85),m.clone().multiply(new T.Matrix4().makeTranslation(0,.32,0)));};
 rake(0,mid,1);rake(mid,W,-1);
 // Roof: low-pitched gable running south from the pediment.
 const r0=[0,J.eave+.8,.7],r1=[W,J.eave+.8,.7],rTop=[mid,apex+.15,.7],b0=[0,J.eave+.8,-D-.5],b1=[W,J.eave+.8,-D-.5],bTop=[mid,apex+.15,-D-.5];
 P.quad('roof',[-.7,J.eave+.6,.7],rTop,bTop,[-.7,J.eave+.6,-D-.5],[-1,1,0]);P.quad('roof',[W+.7,J.eave+.6,.7],rTop,bTop,[W+.7,J.eave+.6,-D-.5],[1,1,0]);
 P.poly('brick',S,[[0,J.eave],[W,J.eave],[mid,apex]]);
 // Cross on the apex (copper).
 P.geo('copper',new T.BoxGeometry(.5,.5,.5),N.matrix(mid,apex+.4,.2));P.geo('copper',new T.BoxGeometry(.16,2.2,.16),N.matrix(mid,apex+1.7,.2));P.geo('copper',new T.BoxGeometry(1.1,.16,.16),N.matrix(mid,apex+2.25,.2));
 // ---- porch between church and tower: two-storey arched portico, columns, steps, tile roof ----
 const [p0,p1]=J.porch,pc=(p0+p1)/2,PN=new Face([p0,0,0],[1,0,0],[0,1,0]);
 P.poly('brick',PN,[[0,0],[p1-p0,0],[p1-p0,9],[0,9]],[archHole(pc-p0,2.5,0,5.9,12)],0);
 reveal(P,'terra',PN,archHole(pc-p0,2.5,0,5.9,12),1.8);
 for(const s of [-1,1]){P.cyl('marble',.2,.17,4.6,new T.Matrix4().makeTranslation(pc+s*1.0,1.0+2.3,.35),12);P.geo('terra',new T.BoxGeometry(.55,.3,.55),new T.Matrix4().makeTranslation(pc+s*1.0,5.75,.35));P.geo('marble',new T.BoxGeometry(.5,.35,.5),new T.Matrix4().makeTranslation(pc+s*1.0,1.17,.35));}
 P.sweep('terra',[[0,0],[.18,0],[.2,.12],[.14,.3],[0,.36]],arcPath(pc,5.9,1.25,.02,1,14).map(q=>({...q,p:[q.p[0],q.p[1],q.p[2]]})));
 P.rect('door',new Face([p0,0,-1.8],[1,0,0],[0,1,0]),pc-p0-.9,pc-p0+.9,1.0,4.6,0);
 for(let k=0;k<5;k++)P.geo('marble',new T.CylinderGeometry(2.1-k*.25,2.1-k*.25,.2,24,1,false,-Math.PI/2,Math.PI),new T.Matrix4().makeTranslation(pc,.1+k*.2,.05));
 P.block('terra',PN,0,p1-p0,8.6,9,0,.4);P.quad('tile',[p0-.2,9,.5],[p1+.2,9,.5],[p1+.2,10.4,-1.2],[p0-.2,10.4,-1.2],[0,1,1]);
 // ---- campanile ----
 const {x0,x1,d,h}=J.tower,tw=x1-x0,TF=[new Face([x0,0,0],[1,0,0],[0,1,0]),new Face([x1,0,0],[0,0,-1],[0,1,0]),new Face([x1,0,-d],[-1,0,0],[0,1,0]),new Face([x0,0,-d],[0,0,1],[0,1,0])];
 const stages=[14,19.5,25,30.5],belfry=[30.5,36.6];
 for(const [fi,f] of TF.entries()){const hidden=fi===3;// the side against the church porch
  const holes=[];if(!hidden){holes.push(rect(tw/2-.4,tw/2+.4,6,8),rect(tw/2-.4,tw/2+.4,10,12));
   for(let s=0;s<3;s++){const v0=stages[s]+.9,c=tw/2;holes.push(archHole(c,1.0,v0,stages[s+1]-1.6,10));}
   for(const c of [tw*.22,tw/2,tw*.78])holes.push(archHole(c,1.35,belfry[0]+.8,belfry[1]-1.3,10));}
  P.poly('brick',f,[[0,0],[tw,0],[tw,belfry[1]],[0,belfry[1]]],holes,0);
  if(hidden)continue;
  for(const hh of holes)reveal(P,'brick',f,hh,.4,hh.some(p=>p[1]>30)?'dark':'darkGlass');
  // Blind arcade flanking the open arch on each middle stage, and belfry columns.
  for(let s=0;s<3;s++)for(const c of [tw*.2,tw*.8]){const ah=archHole(c,1.0,stages[s]+.9,stages[s+1]-1.6,10);P.poly('brickDark',new Face(f.at(0,0,.01),f.u,f.v),ah);}
  for(const c of [tw*.36,tw*.64])P.cyl('marble',.12,.12,4.1,f.matrix(c,belfry[0]+.8+2.05,-.2),8);
  // Stage cornices with dentils, the ground storey bands, and the crowning cornice.
  for(const v of stages){P.block('terra',f,-.1,tw+.1,v-.2,v+.15,0,.3);for(let u=.1;u<tw;u+=.24)P.block('terra',f,u,u+.12,v-.4,v-.2,0,.18,{skip:['top']});}
  for(let v=.25;v<4.6;v+=.42)P.block('terra',f,0,tw,v,v+.2,0,.05,{skip:['left','right']});
  P.block('terra',f,-.15,tw+.15,belfry[1]-.1,belfry[1]+.35,0,.55);for(let u=.2;u<tw;u+=.5)P.block('terra',f,u,u+.14,belfry[1]-.45,belfry[1]-.1,.1,.45,{skip:['top']});}
 // Low pyramidal roof and cross.
 const ty=belfry[1]+.35,cx=(x0+x1)/2,cz=-d/2,o=.5,c4=[[x0-o,cz+d/2+o],[x1+o,cz+d/2+o],[x1+o,cz-d/2-o],[x0-o,cz-d/2-o]];for(let k=0;k<4;k++){const a=c4[k],b=c4[(k+1)%4];P.tri('tile',[a[0],ty,a[1]],[b[0],ty,b[1]],[cx,h-1.2,cz],[0,1,0]);}
 P.geo('copper',new T.BoxGeometry(.12,1.6,.12),new T.Matrix4().makeTranslation(cx,h-.4,cz));P.geo('copper',new T.BoxGeometry(.8,.12,.12),new T.Matrix4().makeTranslation(cx,h-.05,cz));
 return P;}
// Judson Hall (51–54 Washington Sq S, west of the campanile): six storeys of the same yellow brick
// with arched windows; volume from the 3D model, punched facade with arched heads approximated.
function hallParts(b,P){const m=model3d[b.bin];if(!m)return;const ps=pieces(m),W=walls(ps);
 for(const w of W){punched(P,w,w.y0,w.piece.z,{wall:'brickW',trim:'terraW',glass:'darkGlassW',frames:'leadW',pitch:3.0,floor:3.35,first:1.3,win:[1.15,2.1],surround:.12,parapet:1.4});P.block('terraW',w.face,0,w.len,w.piece.z-.6,w.piece.z,0,.45,{skip:['left','right']});}roofs(P,ps,'roofW');}
export function buildJudson(b,{campus}={}){const J=JUDSON,P=judsonParts();
 const brick=brickTextures({base:'#b5834f',mortar:'#c9b08a',brick:[.3,.052],tileW:1.8,tileH:.832,vary:.09,seed:9}),grain=grainTextures({base:'#c99c6c'});
 const std=(t,x={})=>new T.MeshStandardMaterial({map:t.map,normalMap:t.normalMap,normalScale:new T.Vector2(.5,.5),roughness:.85,...x});
 const materials={brick:std(brick),brickDark:std(brick,{color:0xd8ccc0}),terra:std(grain,{roughness:.75}),frieze:std(grain,{color:0xd9c2a2}),marble:new T.MeshStandardMaterial({color:0xe9e5dc,roughness:.55}),
  stained:new T.MeshStandardMaterial({color:0x34404c,roughness:.3,metalness:.2,emissive:0x1a1408}),lead:new T.MeshStandardMaterial({color:0x2a2a2a,roughness:.6}),darkGlass:new T.MeshStandardMaterial({color:0x23282c,roughness:.3,metalness:.3}),
  dark:new T.MeshStandardMaterial({color:0x16130f,roughness:1}),door:new T.MeshStandardMaterial({color:0x3b2618,roughness:.6}),roof:new T.MeshStandardMaterial({color:0x5b6064,roughness:.8,side:T.DoubleSide}),
  tile:new T.MeshStandardMaterial({color:0xa8573a,roughness:.85,side:T.DoubleSide}),copper:new T.MeshStandardMaterial({color:0x6f9a86,roughness:.6,metalness:.3})};
 const g=P.build(materials);g.name='Judson Memorial Church';g.userData.tris=P.tris;g.userData.materials=Object.values(materials);
 const ex=[J.west[0]-J.corner[0],J.west[1]-J.corner[1]],L=Math.hypot(...ex);g.position.set(J.corner[0],.15,-J.corner[1]);g.rotation.y=Math.atan2(ex[1]/L,ex[0]/L);
 // Judson Hall next door shares the brick.
 const out=new T.Group();out.add(g);const hall=campus?.data.buildings.find(x=>x.bin===J.hallBin);
 if(hall){const H=new Parts();hallParts(hall,H);const hm={brickW:materials.brick,terraW:materials.terra,darkGlassW:materials.darkGlass,leadW:materials.lead,roofW:materials.roof,frame:materials.lead,glass:materials.darkGlass};const hg=H.build(hm);hg.position.y=.15;out.add(hg);out.userData.hallTris=H.tris;}
 out.name='Judson';out.userData.materials=Object.values(materials);out.userData.tris=P.tris;return out;}
