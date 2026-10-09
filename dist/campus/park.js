import * as T from '../vendor/three.module.js';
import {pointInRing} from './geometry.js?v=24';
// Park details (Phase 2, Step 4): the fountain, the chess tables, the three kinds of lamp post and the
// banners on them. Sources, all looked at on Google Maps and not saved (dates are the imagery dates):
// - Fountain plaza: user photospheres in the plaza (Sep 2015, Jul 2017). The plaza is flush with the
//   paths, paved in light granite with darker radial bands. The fountain has a low granite rim with a
//   coping, about 0.6 m above the plaza, three broad steps down on the inside to the basin floor, about
//   eight wedge-shaped spout blocks set on the rim, and a round stepped pedestal for the centre jet.
// - Lamp posts: three kinds. Round the fountain plaza, black cast-iron posts carrying a cluster of five
//   white globes (Sep 2015). Along the park paths, black posts with a six-sided lantern head and a cap
//   (Jul 2017). On the streets round the park, tall grey steel poles with an arm and a flat head (May 2026).
// - Chess tables: the place Google Maps names "Washington Square West Chess Tables" (40.73105, -73.99915)
//   in the park's south-west corner. Square tables with inlaid boards on single pedestals, in two rows
//   along the planted edges of a small plaza paved in hexagonal asphalt blocks, round a fenced planted
//   bed, each with a short bench either side (Jul 2017). I counted 13 tables.
// - Banners: three lamp posts round the park carry them (NYU on Washington Sq W, the park's own banners on
//   Washington Sq W and N); the rest carry nothing. They are decals listed in assets/signage/manifest.js.
export const GU=[.837,-.547],GV=[.547,.837];
const gu=p=>p[0]*GU[0]+p[1]*GU[1],gv=p=>p[0]*GV[0]+p[1]*GV[1],mp=(u,v)=>[u*GU[0]+v*GV[0],u*GU[1]+v*GV[1]];
export const PLAZA_RADIUS=36;// the plaza lamps stand in rings 18 m and 34 m from the fountain centre
export const LAMP_HEAD={park:3.95,plaza:4.15,street:7.5};
// Which of the three lamp types stands at p.
export function lampKind(p,park,fountain){if(park&&pointInRing(p,park))return fountain&&Math.hypot(p[0]-fountain[0],p[1]-fountain[1])<PLAZA_RADIUS?'plaza':'park';return 'street';}
// Unit vector from p toward the nearest street centreline (street lamp arms reach over the road).
export function towardRoad(p,streets){let best=null;for(const s of streets.segments)for(let i=1;i<s.pts.length;i++){const a=s.pts[i-1],b=s.pts[i],dx=b[0]-a[0],dn=b[1]-a[1],L=dx*dx+dn*dn;let t=L?((p[0]-a[0])*dx+(p[1]-a[1])*dn)/L:0;t=Math.max(0,Math.min(1,t));const q=[a[0]+dx*t,a[1]+dn*t],d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(!best||d<best.d)best={d,q};}
 if(!best||best.d<.01)return [0,1];return [(best.q[0]-p[0])/best.d,(best.q[1]-p[1])/best.d];}
// Every lamp with its kind and the position of its light (map x, height above the curb, map n).
export function lampLayout(d,park,fountain){return d.lamps.map(l=>{const kind=lampKind(l.p,park,fountain);let head=[l.p[0],LAMP_HEAD[kind],l.p[1]],dir=null;
 if(kind==='street'){dir=towardRoad(l.p,d.streets);head=[l.p[0]+dir[0]*1.5,LAMP_HEAD.street,l.p[1]+dir[1]*1.5];}return {p:l.p,kind,head,dir};});}
// Chess tables: thirteen, the number I counted (Jul 2017 photospheres), in two rows along the planted edges
// of the little plaza in the south-west corner (grid u -147..-117, v -112..-87, between OSM lawns): eight
// along its south edge and five along its west edge. Each record: position, row axis (map unit vector).
export const CHESS_CENTRE=[-173,-21];
export function chessLayout(){const out=[];
 for(let i=0;i<8;i++)out.push({p:mp(-139+i*3.1,-110.5),row:'s',axis:GU});
 for(let j=0;j<5;j++)out.push({p:mp(-142.5,-107.5+j*3.1),row:'w',axis:GV});return out;}
// ---- Browser only ----------------------------------------------------------------------------
// The fountain as one lathe: outer rim and coping, three steps down inside, the basin floor. r = OSM radius.
export function fountainProfile(r){const s=.5;return [[0,.04],[r-1.95,.04],[r-1.95,.17],[r-1.45,.17],[r-1.45,.31],[r-.95,.31],[r-.95,.45],[r-.45,.45],[r-.45,.62],[r+.12,.62],[r+.12,.54],[r+.04,.54],[r+.04,.08],[r+.16,.08],[r+.16,0]].map(([x,y])=>[Math.max(0,x),y]);}
export function buildFountain(r,mats){const g=new T.Group();g.name='fountain';
 const lathe=new T.LatheGeometry(fountainProfile(r).map(([x,y])=>new T.Vector2(x,y)),96);const body=new T.Mesh(lathe,mats.granite);body.name='fountain rim';body.castShadow=body.receiveShadow=true;g.add(body);
 const water=new T.Mesh(new T.CircleGeometry(r-1.95,72),mats.water);water.rotation.x=-Math.PI/2;water.position.y=.12;water.name='fountain water';g.add(water);
 // Centre pedestal for the jet.
 const ped=new T.Mesh(new T.LatheGeometry([[0,.04],[1.5,.04],[1.5,.3],[1.05,.3],[1.05,.52],[.55,.52],[.5,.75],[.18,.82],[0,.82]].map(([x,y])=>new T.Vector2(x,y)),48),mats.granite);ped.name='fountain pedestal';ped.castShadow=true;g.add(ped);
 // Spout blocks on the rim, pointing in.
 const sg=new T.BoxGeometry(.55,.32,1.0);for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8,b=new T.Mesh(sg,mats.granite);b.position.set(Math.sin(a)*(r-.3),.78,Math.cos(a)*(r-.3));b.rotation.y=a;b.castShadow=true;b.name='spout';g.add(b);}
 return g;}
// Instanced street furniture for one tile: call add(kind,...) for every lamp/table in it, then meshes().
export function furnitureGeometry(){return {
 parkPole:new T.CylinderGeometry(.055,.1,3.6,8).translate(0,1.8,0),parkLantern:new T.CylinderGeometry(.21,.14,.52,6).translate(0,3.95,0),parkCap:new T.ConeGeometry(.27,.22,6).translate(0,4.32,0),
 plazaPole:new T.CylinderGeometry(.07,.12,3.7,8).translate(0,1.85,0),plazaCrown:new T.CylinderGeometry(.42,.12,.2,8).translate(0,3.8,0),globe:new T.SphereGeometry(.2,12,8),
 streetPole:new T.CylinderGeometry(.075,.13,7.6,8).translate(0,3.8,0),streetArm:new T.BoxGeometry(.07,.07,1.6).translate(0,7.55,.8),streetHead:new T.BoxGeometry(.3,.1,.62).translate(0,7.5,1.55),
 chessBase:new T.CylinderGeometry(.16,.24,.7,10).translate(0,.35,0),chessTop:new T.BoxGeometry(.8,.06,.8).translate(0,.73,0),chessBench:new T.BoxGeometry(.9,.06,.32).translate(0,.44,0),chessBenchLegs:new T.BoxGeometry(.8,.42,.06).translate(0,.21,0)};}
export function furnitureMaterial(name){return {parkPole:'iron',parkLantern:'lamp',parkCap:'iron',plazaPole:'iron',plazaCrown:'iron',globe:'lamp',streetPole:'steel',streetArm:'steel',streetHead:'steel',chessBase:'granite',chessTop:'chessTop',chessBench:'wood',chessBenchLegs:'iron'}[name];}
// Placement records (position in three coordinates, yaw, scale) for each lamp.
export function lampParts(L,y0){const [x,n]=L.p,v=(dx,dy,dn)=>new T.Vector3(x+dx,y0+dy,-(n+dn));
 if(L.kind==='park')return [['parkPole',v(0,0,0),0],['parkLantern',v(0,0,0),0],['parkCap',v(0,0,0),0]];
 if(L.kind==='plaza'){const out=[['plazaPole',v(0,0,0),0],['plazaCrown',v(0,0,0),0],['globe',v(0,4.15+.12,0),0]];for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;out.push(['globe',v(Math.sin(a)*.36,3.98,Math.cos(a)*.36),0]);}return out;}
 // three.js yaw that turns +z (the arm) toward the map direction dir: three z is -n.
 const yaw=Math.atan2(L.dir[0],-L.dir[1]);return [['streetPole',v(0,0,0),0],['streetArm',v(0,0,0),yaw],['streetHead',v(0,0,0),yaw]];}
export function chessParts(t,y0){const [x,n]=t.p,v=(dx,dn,dy=0)=>new T.Vector3(x+dx,y0+dy,-(n+dn)),ax=t.axis,perp=[ax[1],-ax[0]],yaw=Math.atan2(ax[1],ax[0]);// box x axis along the row
 const out=[['chessBase',v(0,0),yaw],['chessTop',v(0,0),yaw]];for(const s of [-1,1]){const p=v(perp[0]*s*.78,perp[1]*s*.78);out.push(['chessBench',p,yaw],['chessBenchLegs',p,yaw]);}return out;}
// Checkerboard top: light and dark granite squares with a plain border (texture on the top face).
export function chessTopMaterial(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),s=128/10;g.fillStyle='#8f8b82';g.fillRect(0,0,128,128);
 for(let i=0;i<8;i++)for(let j=0;j<8;j++){g.fillStyle=(i+j)%2?'#3f3b36':'#c2b6a4';g.fillRect(s+i*s,s+j*s,s,s);}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;
 const side=new T.MeshStandardMaterial({color:0x8f8b82,roughness:.85}),top=new T.MeshStandardMaterial({map:t,roughness:.6});return [side,side,top,side,side,side];}
