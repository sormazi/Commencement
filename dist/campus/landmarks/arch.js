import * as T from '../../vendor/three.module.js';
import {Parts,Face,rectLoop,planRun,arcPath,star,circle,smooth,xf,mirrorX,cymaRecta,ovolo,stack,out,up,step,stoneTextures,grainTextures,inscriptionTextures,meanderTextures} from './kit.js?v=24';
import {washington,reliefFigure,eagle,victory} from './sculpture.js?v=24';
// Washington Square Arch (McKim, Mead & White, 1889–92; LPC 489 p.107). Tuckahoe marble.
// Built in the arch's own frame: x across the arch (east +), y up, z through the opening
// (south face at +z, the north face with the two Washington statue groups at -z).
// Dimensions: 77 ft (23.47 m) high, 30 ft (9.14 m) opening, 47 ft (14.33 m) to the crown of the
// intrados, plan 19.1 × 7.0 m from the NYC footprint. Zone heights are measured from Commons
// photographs (RESEARCH/reference/commons, see RESEARCH/checklists/arch.md) against those totals.
export const ARCH={
 W:9.30,          // half width of the pier shafts
 D:3.20,          // half depth of the pier shafts
 o:9.14/2,        // half opening
 spring:9.76,     // springing line (crown 14.33 minus radius)
 R:9.14/2,        // intrados radius
 archivolt:.84,   // archivolt band width
 architrave:15.6, frieze:16.45, cornice:17.75, attic:18.95, top:23.47,
 pedestal:{u0:4.95,u1:8.92,h:2.9,proj:1.05},
 statuePanel:{u0:5.0,u1:8.87,v0:2.9,v1:8.5,depth:.3},
 trophy:{u0:5.65,u1:8.25,v0:10.5,v1:15.1,depth:.22},
};
export const INSCRIPTION={
 north:['LET US RAISE A STANDARD TO WHICH THE WISE AND','THE HONEST CAN REPAIR. THE EVENT IS IN THE','HAND OF GOD. WASHINGTON'],
 south:['TO COMMEMORATE THE ONE HUNDREDTH ANNIVERSARY','OF THE INAUGURATION OF GEORGE WASHINGTON','AS FIRST PRESIDENT OF THE UNITED STATES'],
};
// Geometry only (no textures), so tests can count and probe it in Node.
export function archParts(){const A=ARCH,{W,D,o,spring,R}=A,P=new Parts();
 const S=new Face([0,0,D],[1,0,0],[0,1,0]),N=new Face([0,0,-D],[-1,0,0],[0,1,0]),E=new Face([W,0,0],[0,0,-1],[0,1,0]),Wf=new Face([-W,0,0],[0,0,1],[0,1,0]);
 const EI=new Face([o,0,0],[0,0,1],[0,1,0]),WI=new Face([-o,0,0],[0,0,-1],[0,1,0]);
 // ---- main faces: piers and spandrels up to the cornice, opening cut out ----
 const arc=[];for(let i=0;i<=40;i++){const t=Math.PI-Math.PI*i/40;arc.push([R*Math.cos(t),spring+R*Math.sin(t)]);}
 const outline=[[-W,0],[-o,0],...arc,[o,0],[W,0],[W,A.cornice],[-W,A.cornice]];
 const tp=A.trophy,sp=A.statuePanel,rect=(u0,u1,v0,v1)=>[[u0,v0],[u1,v0],[u1,v1],[u0,v1]];
 const trophyHoles=[rect(-tp.u1,-tp.u0,tp.v0,tp.v1),rect(tp.u0,tp.u1,tp.v0,tp.v1)];
 P.poly('stone',S,outline,trophyHoles);P.poly('stone',N,outline,[...trophyHoles,rect(-sp.u1,-sp.u0,sp.v0,sp.v1),rect(sp.u0,sp.u1,sp.v0,sp.v1)]);
 for(const f of [S,N])for(const s of [-1,1])P.recess('stone',f,s>0?tp.u0:-tp.u1,s>0?tp.u1:-tp.u0,tp.v0,tp.v1,tp.depth);
 for(const s of [-1,1])P.recess('stone',N,s>0?sp.u0:-sp.u1,s>0?sp.u1:-sp.u0,sp.v0,sp.v1,sp.depth);
 // Outer side faces with a sunk panel in the upper pier; inner faces of the opening up to the springing.
for(const f of [E,Wf]){P.poly('stone',f,[[-D,0],[D,0],[D,A.cornice],[-D,A.cornice]],[rect(-1.9,1.9,10.35,15.2)]);P.recess('stone',f,-1.9,1.9,10.35,15.2,.12);}
 for(const f of [EI,WI])P.rect('stone',f,-D,D,0,spring);
 // ---- coffered barrel vault (9 coffers across the depth × 23 around the arc) ----
 const nA=23,nZ=9,z0=-D+.42,z1=D-.42,cz=(z1-z0)/nZ,t0=.035,t1=Math.PI-.035,ct=(t1-t0)/nA,rib=.075,step1=.06,deep=.17;
 const Pv=(r,t,z)=>[-r*Math.cos(t),spring+r*Math.sin(t),z],inward=t=>[Math.cos(t),-Math.sin(t),0];
 // Plain soffit bands at each face and at the springing.
 for(const [za,zb] of [[-D,z0],[z1,D]])for(let i=0;i<32;i++){const a=i/32*Math.PI,b=(i+1)/32*Math.PI;P.quad('stone',Pv(R,a,za),Pv(R,b,za),Pv(R,b,zb),Pv(R,a,zb),inward((a+b)/2));}
 for(const [ta,tb] of [[0,t0],[t1,Math.PI]])P.quad('stone',Pv(R,ta,z0),Pv(R,tb,z0),Pv(R,tb,z1),Pv(R,ta,z1),inward((ta+tb)/2));
 for(let i=0;i<nA;i++)for(let j=0;j<nZ;j++){const ta=t0+i*ct,tb=ta+ct,za=z0+j*cz,zb=za+cz,tm=(ta+tb)/2,zm=(za+zb)/2,h=inward(tm);
  const e1=rib/R,e2=(rib+step1)/R,e3=(rib+step1*2)/R;
  // Rib surface (frame around the coffer at the soffit radius).
  const ring=(r,et,ez)=>[Pv(r,ta+et,za+ez),Pv(r,tb-et,za+ez),Pv(r,tb-et,zb-ez),Pv(r,ta+et,zb-ez)];
  const a0=[Pv(R,ta,za),Pv(R,tb,za),Pv(R,tb,zb),Pv(R,ta,zb)],a1=ring(R,e1,rib),a2=ring(R+deep*.45,e2,rib+step1),a3=ring(R+deep,e3,rib+step1*2);
  for(const [p,q] of [[a0,a1],[a1,a2],[a2,a3]])for(let k=0;k<4;k++){const k2=(k+1)%4;P.quad(p===a0?'stone':'orn',p[k],p[k2],q[k2],q[k],h);}
  P.quad('orn',...a3,h);
  // Rosette in the coffer.
  const c=Pv(R+deep-.02,tm,zm),m=new T.Matrix4().lookAt(new T.Vector3(...c),new T.Vector3(...c).add(new T.Vector3(...h)),new T.Vector3(0,0,1));m.setPosition(...c);
  P.lathe('orn',[[0,.075],[.06,.07],[.12,.035],[.13,0]],m.multiply(new T.Matrix4().makeRotationX(Math.PI/2)),8);}
 // Crown hook block under the soffit (lantern / flag fixing seen at the crown).
 P.box('orn',-.18,spring+R-.22,-.18,.18,spring+R,.18,['top']);
 // ---- base: plinth and torus around each pier; statue pedestals on the north face ----
 const base=stack(out(.24),up(.32),[[-.04,.04]],[[-.02,.1],[-.05,.16]],[[-.06,.05]],up(.05),[[-.07,.0]]);
 for(const s of [-1,1]){const x0=s>0?o:-W,x1=s>0?W:-o;P.sweep('stone',base,rectLoop(x0,x1,-D,D,0),{closed:true});
  // Impost: Greek-key fascia under a crowning ovolo and corona, wrapping the whole pier.
  P.sweep('meander',[[0,0],[.07,0],[.07,.36],[0,.36]],rectLoop(x0,x1,-D,D,9.06),{closed:true});
  P.sweep('orn',stack(out(.07),ovolo(.1,.1),up(.03),out(.04),up(.13),cymaRecta(.08,.12),[[-.32,0]]),rectLoop(x0,x1,-D,D,9.42),{closed:true});}
 const pd=A.pedestal;for(const s of [-1,1]){const u0=s>0?pd.u0:-pd.u1,u1=s>0?pd.u1:-pd.u0;P.block('stone',N,u0,u1,0,pd.h,0,pd.proj,{skip:['bottom']});
  // Mouldings return around the three exposed sides of the pedestal (north face: x = -u).
  const pts=[[-u0,-D],[-u0,-D-pd.proj],[-u1,-D-pd.proj],[-u1,-D]];P.sweep('orn',stack(out(.1),up(.18),[[-.03,.03]],cymaRecta(-.07,.12)),planRun(pts.slice().reverse(),0),{caps:true});
  P.sweep('orn',stack(cymaRecta(.12,.14),out(.04),up(.12),[[-.16,0]]),planRun(pts.slice().reverse(),pd.h-.26),{caps:true});
  P.box('stone',Math.min(-u0,-u1)+.7,pd.h,-D-pd.proj+.25,Math.max(-u0,-u1)-.7,pd.h+.22,-D-.05,['bottom']);}
 // ---- archivolt on both faces, and the keystone console at the crown ----
 const av=[[0,0],[.1,0],[.1,.2],[.15,.22],[.15,.24],[.1,.26],[.1,.27],[.17,.3],[.17,.5],[.22,.53],[.22,.6],[.27,.64],[.29,.7],[.29,.76],[.2,.82],[0,A.archivolt]];
 P.sweep('orn',av,arcPath(0,spring,R,D,1,48));P.sweep('orn',av,arcPath(0,spring,R,-D,-1,48));
 const consoleShape=new T.Shape([[0,0],[.3,0],[.37,.12],[.3,.28],[.36,.55],[.5,1.0],[.6,1.45],[.62,1.8],[.72,1.84],[.72,2.08],[.0,2.08]].map(p=>new T.Vector2(...p)));
 for(const f of [S,N]){const g=new T.ExtrudeGeometry(consoleShape,{depth:.95,bevelEnabled:false,curveSegments:4});const m=new T.Matrix4().makeBasis(new T.Vector3(...f.n),new T.Vector3(...f.v),new T.Vector3(...f.u).negate());m.setPosition(...f.at(.475,spring+R-.05,0));P.geo('orn',g,m);
  // Volutes on the console sides and an acanthus leaf on its face.
  for(const s of [-1,1]){P.torus('orn',.13,.05,f.matrix(s*.49,spring+R+.28,.22,0).multiply(new T.Matrix4().makeRotationY(Math.PI/2)),Math.PI*2,14);P.torus('orn',.18,.05,f.matrix(s*.49,spring+R+1.55,.42,0).multiply(new T.Matrix4().makeRotationY(Math.PI/2)),Math.PI*2,14);}
  P.relief('orn',f,smooth([[-.3,spring+R+.35],[0,spring+R+.25],[.3,spring+R+.35],[.25,spring+R+1.1],[.0,spring+R+1.45],[-.25,spring+R+1.1]],3),.08,{d:.5});}
 // ---- spandrel Victories (MacMonnies, 1895): two per face ----
 for(const f of [S,N])for(const mirror of [false,true])victory(P,'orn',f,0,spring,R+A.archivolt,{mirror,top:A.architrave-.08});
 // ---- trophy panels on the upper piers: roundel with shield, swags above, crossed arms below ----
 for(const f of [S,N])for(const s of [-1,1]){const cu=s*(tp.u0+tp.u1)/2,cv=12.75,dd=-tp.depth;
  P.relief('orn',f,circle(1.02,40).map(([x,y])=>[cu+x,cv+y]),.1,{d:dd});P.torus('orn',1.02,.08,f.matrix(cu,cv,dd+.1),Math.PI*2,40);P.torus('orn',.82,.04,f.matrix(cu,cv,dd+.12),Math.PI*2,32);
  P.relief('orn',f,xf(smooth([[-.42,.5],[.42,.5],[.42,-.05],[.3,-.35],[0,-.55],[-.3,-.35],[-.42,-.05]],2),{dx:cu,dy:cv}),.14,{d:dd+.1});
  P.relief('orn',f,xf([[-.42,.5],[.42,.5],[.42,.3],[-.42,.3]],{dx:cu,dy:cv}),.06,{d:dd+.24});
  for(let k=-2;k<=2;k++)P.relief('orn',f,xf([[k*.16-.04,.28],[k*.16+.04,.28],[k*.16+.04,-.3],[k*.16-.04,-.3]],{dx:cu,dy:cv}),.04,{d:dd+.24});
  // Above the roundel: a plumed helmet over crossed spears, with laurel sprays (trophy of arms).
  for(const r of [-.75,.75])P.relief('orn',f,xf([[-1.0,-.04],[1.0,-.04],[1.0,.04],[-1.0,.04]],{rot:r,dx:cu,dy:cv+1.75}),.07,{d:dd});
  P.relief('orn',f,xf(smooth([[-.36,0],[-.34,.3],[-.16,.5],[.16,.5],[.34,.3],[.36,0],[.18,-.08],[-.18,-.08]],3),{dx:cu,dy:cv+1.6}),.16,{d:dd+.04});
  P.relief('orn',f,xf(smooth([[-.06,.48],[.0,.95],[.35,1.05],[.5,.85],[.18,.7],[.08,.45]],3),{dx:cu,dy:cv+1.6}),.1,{d:dd+.04});
  for(const m of [-1,1])P.relief('orn',f,xf(smooth([[0,0],[.45,.1],[.85,.38],[.8,.48],[.4,.25],[0,.12]],2),{sx:m,dx:cu+m*.4,dy:cv+1.25}),.07,{d:dd});
  // Crossed swords and fasces below.
  for(const r of [-.6,.6])P.relief('orn',f,xf([[-1.15,-.05],[1.15,-.05],[1.15,.05],[-1.15,.05]],{rot:r,dx:cu,dy:cv-1.7}),.08,{d:dd});
  P.relief('orn',f,xf([[-.14,-.6],[.14,-.6],[.14,.6],[-.14,.6]],{dx:cu,dy:cv-1.75}),.12,{d:dd+.04});
  for(const m of [-1,1])P.relief('orn',f,xf(smooth([[0,0],[.5,.25],[1.0,.2],[1.05,.35],[.5,.45],[0,.15]],2),{sx:m,dx:cu+m*.15,dy:cv-2.15}),.08,{d:dd});}
 // ---- entablature: architrave fasciae, frieze with wreaths and stars, dentilled modillion cornice ----
 const all=rectLoop(-W,W,-D,D,A.architrave);
 P.sweep('orn',stack(out(.03),up(.24),out(.04),up(.27),out(.04),up(.22),ovolo(.07,.08),up(.04),[[-.18,0]]),all,{closed:true});
 const wreath=(f,u,v)=>{P.torus('orn',.36,.08,f.matrix(u,v,.04),Math.PI*2,24);for(let k=0;k<12;k++){const a=k/12*Math.PI*2;P.sphere('orn',.07,f.matrix(u+Math.cos(a)*.36,v+Math.sin(a)*.36,.1,a,[1.6,.8,.7]),5,4);}P.relief('orn',f,star(.22).map(([x,y])=>[u+x,v+y]),.06,{d:.02});};
 const fv=(A.frieze+A.cornice)/2+.02;
 for(const f of [S,N]){for(const u of [-8.15,-5.95,-3.75,-1.75,1.75,3.75,5.95,8.15])wreath(f,u,fv);
  // Laurel and oak sprays linking the wreaths.
  for(const u of [-7.05,-4.85,-2.75,2.75,4.85,7.05])for(const m of [-1,1])P.relief('orn',f,xf(smooth([[0,0],[.35,.12],[.7,.06],[.72,.16],[.35,.24],[0,.1]],2),{sx:m*.9,dx:u,dy:fv-.08}),.06,{d:0});}
 // Cornice: bed ovolo, dentil band, modillion zone under the corona, cyma recta crown.
 const cor=stack(ovolo(.1,.1),out(.05),up(.05),up(.25),out(.05),up(.08),up(.22),out(.78),up(.24),out(.04),up(.04),cymaRecta(.17,.2),[[-1.23,0]]);
 P.sweep('stone',cor,rectLoop(-W,W,-D,D,A.cornice),{closed:true});

 // Dentils (0.13 m blocks at 0.22 m pitch) and scrolled modillions (0.62 m pitch) on all four sides.
 const sides=[[S,W,D],[N,W,D],[E,D,W],[Wf,D,W]];
 for(const [f,half] of sides){for(let u=-half+.15;u<=half-.1;u+=.22)P.block('orn',f,u-.065,u+.065,A.cornice+.15,A.cornice+.4,.15,.29,{skip:['top']});
  const ms=new T.Shape([[0,0],[.12,0],[.2,.06],[.55,.08],[.72,.12],[.78,.2],[.78,.26],[0,.26]].map(p=>new T.Vector2(...p)));
  for(let u=-half+.3;u<=half-.25;u+=.62){const g=new T.ExtrudeGeometry(ms,{depth:.18,bevelEnabled:false,curveSegments:3});const m=new T.Matrix4().makeBasis(new T.Vector3(...f.n),new T.Vector3(...f.v),new T.Vector3(...f.u).negate());m.setPosition(...f.at(u+.09,A.cornice+.47,.2));P.geo('orn',g,m);}}
 // ---- eagles over the keystones (Martiny, 1892) ----
 for(const f of [S,N])eagle(P,'orn',f,0,A.frieze-.02,2.7,{d:.0});
 // ---- attic: base moulding, die with inscription and relief panels, crowning cornice ----
 const aW=W-.25,aD=D-.25,aS=new Face([0,0,aD],[1,0,0],[0,1,0]),aN=new Face([0,0,-aD],[-1,0,0],[0,1,0]),aE=new Face([aW,0,0],[0,0,-1],[0,1,0]),aWf=new Face([-aW,0,0],[0,0,1],[0,1,0]);
 const a0=A.attic+.02,a1=A.top-.58;
 // Top of the main cornice between the attic and the cornice lip (walkable ledge).
 P.poly('stone',new Face([0,A.attic,0],[1,0,0],[0,0,-1]),[[-W-1.03,-D-1.03],[W+1.03,-D-1.03],[W+1.03,D+1.03],[-W-1.03,D+1.03]],[[[-aW,-aD],[aW,-aD],[aW,aD],[-aW,aD]]]);
 const ins=[-5.0,5.0,19.75,22.45],side2=[5.55,8.6];
 for(const f of [aS,aN])P.poly('stone',f,[[-aW,a0],[aW,a0],[aW,a1],[-aW,a1]],[rect(ins[0],ins[1],ins[2],ins[3]),rect(-side2[1],-side2[0],ins[2],ins[3]),rect(side2[0],side2[1],ins[2],ins[3])]);
 for(const f of [aE,aWf])P.poly('stone',f,[[-aD,a0],[aD,a0],[aD,a1],[-aD,a1]],[rect(-2.1,2.1,ins[2],ins[3])]);
 P.panel('inscS',aS,ins[0],ins[1],ins[2],ins[3],-.04);P.panel('inscN',aN,ins[0],ins[1],ins[2],ins[3],-.04);
 for(const f of [aS,aN]){P.recess('stone',f,ins[0],ins[1],ins[2],ins[3],.04,'_hidden');
  for(const s of [-1,1]){const u0=s>0?side2[0]:-side2[1],u1=s>0?side2[1]:-side2[0],cu=(u0+u1)/2,cv=(ins[2]+ins[3])/2;P.recess('stone',f,u0,u1,ins[2],ins[3],.1);
   // Wreath with streaming ribbons and crossed palms in each side panel.
   P.torus('orn',.58,.1,f.matrix(cu,cv+.1,-.06),Math.PI*2,28);for(const m of [-1,1]){P.relief('orn',f,xf(smooth([[0,0],[.4,-.3],[.9,-.45],[1.25,-.85],[1.2,-.6],[.8,-.3],[.35,-.15]],2),{sx:m,dx:cu,dy:cv-.5}),.06,{d:-.1});
    P.relief('orn',f,xf(smooth([[0,0],[.5,.3],[1.1,.9],[1.15,1.0],[.45,.45]],2),{sx:m,dx:cu,dy:cv-.7}),.07,{d:-.1});}}
  // Raised moulded frame around the inscription tablet.
  for(const [u0,u1,v0,v1] of [[ins[0]-.14,ins[1]+.14,ins[2]-.14,ins[2]],[ins[0]-.14,ins[1]+.14,ins[3],ins[3]+.14],[ins[0]-.14,ins[0],ins[2],ins[3]],[ins[1],ins[1]+.14,ins[2],ins[3]]])P.block('orn',f,u0,u1,v0,v1,0,.07);}
 for(const f of [aE,aWf])P.recess('stone',f,-2.1,2.1,ins[2],ins[3],.06);
 P.sweep('stone',stack(out(.08),up(.3),[[-.03,.03]],cymaRecta(-.05,.12),[[0,0]]),rectLoop(-aW,aW,-aD,aD,A.attic),{closed:true});
 P.sweep('stone',stack(ovolo(.08,.08),up(.06),out(.04),up(.14),out(.12),up(.16),cymaRecta(.09,.12),[[-.33,0]]),rectLoop(-aW,aW,-aD,aD,a1),{closed:true});
 P.poly('stone',new Face([0,A.top,0],[1,0,0],[0,0,-1]),[[-aW-.33,-aD-.33],[aW+.33,-aD-.33],[aW+.33,aD+.33],[-aW-.33,aD+.33]]);
 // ---- statue groups on the north piers (local x = -u on the north face) ----
 for(const s of [-1,1]){const cu=s*(sp.u0+sp.u1)/2,peace=s>0,back=-sp.depth;
  // Background relief: two allegorical figures and an arched frame behind Washington's head.
  reliefFigure(P,'orn',N,cu-1.38,sp.v0+.3,4.45,{d:back,attr:peace?['helmet','palm']:['wreath','palm']});
  reliefFigure(P,'orn',N,cu+1.38,sp.v0+.3,4.45,{d:back,flip:true,attr:peace?['sword','scales']:['helmet','sword']});
  const nich=[[-.95,2.6]];for(let k=0;k<=12;k++){const t=Math.PI*k/12;nich.push([-.95*Math.cos(t),4.55+.95*Math.sin(t)]);}nich.push([.95,2.6]);
  P.relief('orn',N,xf(nich,{dx:cu,dy:sp.v0}),.07,{d:back});P.torus('orn',.95,.06,N.matrix(cu,sp.v0+4.55,back+.07),Math.PI,24);
  if(peace){// The hand holding an open book inscribed EXITUS ACTA PROBAT, over the Peace group.
   for(const m of [-1,1])P.block('orn',N,cu+(m<0?-.62:0),cu+(m<0?0:.62),sp.v1-.95,sp.v1-.48,.0,.12);P.panel('inscBook',N,cu-.6,cu+.6,sp.v1-.93,sp.v1-.5,.125);P.sphere('orn',.16,N.matrix(cu,sp.v1-1.1,.12,0,[1.4,1,.8]),8,6);}
  const statue=new T.Matrix4().makeBasis(new T.Vector3(...N.u),new T.Vector3(0,1,0),new T.Vector3(...N.n));statue.setPosition(...N.at(cu,pd.h+.22,.68));statue.multiply(new T.Matrix4().makeScale(1.2,1.1,1.25));
  washington(P,'statue',statue,peace?{pose:'book',hat:false,cloak:false}:{pose:'sword',hat:true,cloak:true});}
 return P;}

// Textured materials and the assembled group (browser only).
export function buildArch(){const P=archParts();
 const stone=stoneTextures({base:'#e3dfd5',course:.61,courses:4,block:1.55,tileW:4.65,vary:.06,seed:3}),grain=grainTextures({base:'#e5e1d7'});
 const mk=(t,extra={})=>new T.MeshStandardMaterial({color:0xffffff,map:t.map,normalMap:t.normalMap,normalScale:new T.Vector2(.6,.6),roughness:.72,...extra});
 const meander=meanderTextures({pitch:.36,h:.36,base:'#e3dfd5'});meander.map.offset.y=meander.normalMap.offset.y=-9.06/.36;
 const insc=k=>{const t=inscriptionTextures(INSCRIPTION[k],{w:10,h:2.7,base:'#e2ded4'});return mk(t);};
 const materials={stone:mk(stone),orn:mk(grain,{roughness:.66}),meander:mk(meander),statue:mk(grain,{side:T.DoubleSide,roughness:.64}),inscN:insc('north'),inscS:insc('south'),inscBook:mk(inscriptionTextures(['EXITUS','ACTA PROBAT'],{w:1.2,h:.43,px:512,base:'#e5e1d7'}))};
 const g=P.build(materials);g.name='Washington Square Arch';g.userData.tris=P.tris;g.userData.materials=Object.values(materials);return g;}
