import * as T from '../../vendor/three.module.js';
import {smooth,circle,xf,mirrorX} from './kit.js?v=18';
// Sculpture kit: carved figures built from revolved and extruded primitives. These are stand-ins
// carved at the level of detail a passer-by reads from the pavement: pose, costume, attributes
// and silhouette. Faces and fine carving are left to the stone's grain texture.
const M=(x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=sx,sz=sx)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(sx,sy,sz));
// Cylinder from point a to point b (figure-local), radii r0 at a and r1 at b.
function limb(parts,name,base,a,b,r0,r1,seg=8){const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A),L=d.length();const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());
 const m=new T.Matrix4().compose(A.clone().add(B).multiplyScalar(.5),q,new T.Vector3(1,1,1));parts.cyl(name,r0,r1,L,base.clone().multiply(m),seg);parts.sphere(name,r1*1.02,base.clone().multiply(M(...b)),seg,5);}

// Free-standing figure of Washington in eighteenth-century dress, ~4 m tall at scale 1.
// pose 'sword': both hands on the hilt of a sword held point-down (MacNeil, "Washington at War").
// pose 'book': left hand resting on a book on a small pedestal, right arm lowered (Calder, "Peace").
export function washington(parts,name,base,{pose='sword',hat=true,cloak=true}={}){
 const L=(m)=>base.clone().multiply(m);
 // Shoes and stockinged legs.
 for(const s of [-1,1]){parts.sphere(name,.12,L(M(s*.16,.07,.08,0,0,0,1,.65,2)),8,5);limb(parts,name,base,[s*.16,.1,0],[s*.15,1.25,0],.11,.135);limb(parts,name,base,[s*.15,1.25,0],[s*.15,1.95,0],.135,.16);}
 // Coat skirts, open at the front, waistcoat and torso.
 parts.lathe(name,[[.33,2.2],[.38,1.95],[.47,1.5],[.54,1.08],[.56,1.0]],L(M()),18,.5,Math.PI*2-1);
 parts.lathe(name,[[0,1.85],[.3,1.86],[.33,2.15],[.37,2.6],[.41,2.95],[.43,3.2],[.35,3.34],[.13,3.43],[0,3.44]],L(M(0,0,0,0,0,0,1,1,.74)),14);
 // Coat lapels and buttons down the front edge.
 for(const s of [-1,1])limb(parts,name,base,[s*.12,2.15,.3],[s*.17,3.2,.26],.04,.05,5);
 parts.cyl(name,.1,.11,.22,L(M(0,3.48,0)),8);
 // Head: skull, jaw, nose and the tied-back hair (queue) with side rolls.
 parts.sphere(name,.24,L(M(0,3.75,.01,0,0,0,.88,1.08,.96)),12,9);parts.sphere(name,.05,L(M(0,3.72,.24,0,0,0,.7,1.3,1)),6,4);parts.sphere(name,.13,L(M(0,3.7,-.2,0,0,0,1,1.2,.8)),8,6);
 for(const s of [-1,1])parts.cyl(name,.06,.06,.22,L(M(s*.2,3.78,-.02,Math.PI/2,0,0)),6);
 if(hat){// Tricorn: three upturned brim lobes around a low crown.
  const tri=smooth(circle(.46,3).map(([x,y])=>[x,y]),5),s=new T.Shape(tri.map(p=>new T.Vector2(...p)));const g=new T.ExtrudeGeometry(s,{depth:.16,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:1,curveSegments:4});
  parts.geo(name,g,L(M(0,3.92,.02,-Math.PI/2,0,Math.PI/2)));parts.sphere(name,.22,L(M(0,3.98,0,0,0,0,1,.55,1)),10,6);}
 if(cloak){// Military cloak hanging from the shoulders, open at the front.
  parts.lathe(name,[[.5,3.3],[.58,3.0],[.64,2.4],[.73,1.5],[.83,.62],[.87,.3]],L(M()),18,.8,Math.PI*2-1.6);parts.torus(name,.42,.07,L(M(0,3.32,0,Math.PI/2,0,0,1,.8,1)),Math.PI*2,16);}
 else parts.lathe(name,[[.48,3.3],[.56,3.05],[.6,2.7],[.62,2.45]],L(M()),16,.9,Math.PI*2-1.8);
 if(pose==='sword'){
  for(const s of [-1,1]){limb(parts,name,base,[s*.43,3.22,0],[s*.42,2.62,.16],.14,.12);limb(parts,name,base,[s*.42,2.62,.16],[s*.09,2.36,.42],.12,.1);}
  parts.cyl(name,.035,.035,.3,L(M(0,2.32,.45)),6);parts.sphere(name,.06,L(M(0,2.5,.45)),6,4);parts.geo(name,new T.BoxGeometry(.34,.04,.06),L(M(0,2.16,.45)));
  parts.geo(name,new T.BoxGeometry(.06,1.85,.025),L(M(0,1.22,.47)));}
 else{// Weight on the right leg; left hand resting on the book, which stands at his left side.
  limb(parts,name,base,[-.43,3.22,0],[-.5,2.58,.05],.14,.12);limb(parts,name,base,[-.5,2.58,.05],[-.44,2.0,.18],.12,.1);parts.geo(name,new T.BoxGeometry(.22,.3,.06),L(M(-.44,1.85,.22)));
  limb(parts,name,base,[.43,3.22,0],[.6,2.62,.05],.14,.12);limb(parts,name,base,[.6,2.62,.05],[.84,2.5,.16],.12,.1);
  parts.cyl(name,.22,.19,2.32,L(M(.9,1.16,.06)),12);for(let k=0;k<8;k++){const a=k/8*Math.PI*2;parts.cyl(name,.03,.03,2.1,L(M(.9+Math.cos(a)*.2,1.1,.06+Math.sin(a)*.2)),4);}
  parts.geo(name,new T.BoxGeometry(.55,.12,.4),L(M(.9,2.38,.1,0,-.3,0)));parts.geo(name,new T.BoxGeometry(.5,.04,.36),L(M(.9,2.46,.1,0,-.3,.08)));}
}

// Standing draped figure in low relief on a face, ~h tall, centred at u, feet at v.
// attr: 'palm' | 'wreath' | 'sword' | 'helmet' | 'torch' | 'scales'
export function reliefFigure(parts,name,face,u,v,h,{d=0,depth=.28,attr=[],flip=false}={}){const k=h/4,f=flip?-1:1;
 const body=smooth([[-.3,.0],[.3,.0],[.36,.9],[.34,1.9],[.42,2.6],[.48,3.1],[.32,3.32],[.12,3.4],[-.12,3.4],[-.32,3.32],[-.46,3.1],[-.4,2.6],[-.33,1.9],[-.36,.9]],3);
 parts.relief(name,face,xf(body,{dx:u,dy:v,s:k,sx:k*f}),depth,{d});parts.relief(name,face,xf(circle(.22,14),{dx:u,dy:v+3.62*k,s:k}),depth*1.15,{d,bevel:.6});
 // Drapery folds: long vertical ridges down the gown.
 for(const x of [-.18,0,.18])parts.relief(name,face,xf([[x-.04,.1],[x+.04,.1],[x+.05,2.6],[x-.03,2.6]],{dx:u,dy:v,s:k,sx:k*f}),.06,{d:d+depth*.75,bevel:.6});
 for(const a of attr){if(a==='palm')parts.relief(name,face,xf(smooth([[.42,1.2],[.5,1.25],[.62,3.0],[.75,4.1],[.55,4.2],[.5,3.0]],3),{dx:u,dy:v,s:k,sx:k*f}),depth*.6,{d});
  if(a==='wreath')parts.torus(name,.32*k,.06*k,face.matrix(u+f*.75*k,v+3.0*k,d+depth*.8));
  if(a==='sword')parts.relief(name,face,xf([[.46,1.6],[.53,1.6],[.53,3.5],[.62,3.5],[.62,3.56],[.37,3.56],[.37,3.5],[.46,3.5]],{dx:u,dy:v,s:k,sx:k*f}),depth*.5,{d:d+depth*.4});
  if(a==='helmet')parts.relief(name,face,xf(smooth([[-.26,3.62],[-.2,3.95],[0,4.12],[.2,3.95],[.27,3.62],[.05,3.75]],3),{dx:u,dy:v,s:k}),depth*1.3,{d,bevel:.5});
  if(a==='torch')parts.relief(name,face,xf([[.5,1.8],[.58,1.8],[.66,3.6],[.78,3.75],[.62,4.15],[.5,3.75],[.58,3.6]],{dx:u,dy:v,s:k,sx:k*f}),depth*.6,{d});
  if(a==='scales'){parts.relief(name,face,xf([[.5,2.6],[.55,2.6],[.55,3.7],[.5,3.7]],{dx:u,dy:v,s:k,sx:k*f}),depth*.4,{d});parts.relief(name,face,xf([[.2,3.65],[.85,3.65],[.85,3.7],[.2,3.7]],{dx:u,dy:v,s:k,sx:k*f}),depth*.4,{d});}}}

// Heraldic eagle "displayed": body, raised spread wings, head turned, tail fan; on a face, standing at (u,v).
export function eagle(parts,name,face,u,v,span=2.6,{d=0}={}){const s=span/2.6;
 const wing=smooth([[.22,.95],[.55,1.25],[.95,1.4],[1.3,1.42],[1.25,1.2],[1.18,1.0],[1.05,.82],[.92,.66],[.75,.55],[.55,.5],[.3,.55]],3);
 for(const m of [1,-1]){const w=m>0?wing:mirrorX(wing);parts.relief(name,face,xf(w,{dx:u,dy:v,s}),.22*s,{d:d+.08});
  // Primary feathers: separate ridges for the fan of the wing tip.
  for(let i=0;i<5;i++){const x0=.62+i*.13,f=[[x0,.62+i*.07],[x0+.1,.66+i*.07],[x0+.16,1.15+i*.04],[x0+.06,1.18+i*.04]];parts.relief(name,face,xf(m>0?f:mirrorX(f),{dx:u,dy:v,s}),.08*s,{d:d+.08+.16*s,bevel:.5});}}
 parts.sphere(name,.3*s,face.matrix(u,v+.62*s,d+.2*s,0,[1,1.6,.85]),12,8);parts.sphere(name,.15*s,face.matrix(u+.1*s,v+1.12*s,d+.33*s),10,7);
 parts.cyl(name,.05*s,.02*s,.18*s,face.matrix(u+.24*s,v+1.08*s,d+.36*s,-Math.PI/2),6);
 parts.relief(name,face,xf([[-.28,.0],[.28,.0],[.16,.3],[-.16,.3]],{dx:u,dy:v,s}),.16*s,{d:d+.06});
 for(const m of [-1,1])parts.cyl(name,.05*s,.06*s,.3*s,face.matrix(u+m*.12*s,v+.18*s,d+.25*s),6);}

// Winged Victory reclining along an arch extrados (left spandrel; mirror=true for the right one).
// cx,cy is the arch centre, r the extrados radius; top is the architrave soffit and edge the |u| of
// the pier panel that bounds the spandrel. Angles a are degrees from the springing toward the crown.
export function victory(parts,name,face,cx,cy,r,{mirror=false,d=0,top,edge=5.55}={}){const m=mirror?-1:1;
 const pol=(a,rr)=>{const t=(180-a)*Math.PI/180;const x=rr*Math.cos(t);return [cx+(mirror?-x:x),cy+rr*Math.sin(t)];};
 const lim=(top??cy+r+1.0)-.07;
 // Draped body reclining along the arch: legs toward the springing, torso rising toward the crown.
 const thick=a=>a<24?.36:a<44?.36+(a-24)/20*.24:.6+Math.min(1,(a-44)/10)*.18;
 const inner=[],outer=[];for(let a=18;a<=58;a+=2.5){inner.push(pol(a,r+.05));outer.push(pol(a,r+.05+thick(a)));}
 parts.relief(name,face,smooth([pol(14,r+.22),...inner,pol(61,r+.4),...outer.reverse()],2),.34,{d});
 // Drapery folds across the legs.
 for(const a of [24,31,38])parts.relief(name,face,smooth([pol(a,r+.08),pol(a+3,r+.1),pol(a+5,r+.05+thick(a)-.05),pol(a+2,r+.05+thick(a)-.05)],2),.06,{d:d+.3,bevel:.6});
 // Head turned toward the keystone; the near arm reaches forward with a laurel wreath.
 const head=pol(62.5,r+.66);parts.sphere(name,.26,face.matrix(head[0],head[1],d+.27,0,[1,1.1,.9]),10,7);
 const sh=pol(56,r+.72),hand=pol(73,r+.42);parts.relief(name,face,[[sh[0],sh[1]-.09],[hand[0],hand[1]-.06],[hand[0],hand[1]+.07],[sh[0],sh[1]+.1]],.2,{d:d+.14});
 parts.torus(name,.22,.05,face.matrix(hand[0]+m*.18,hand[1]+.04,d+.32));
 // Wings: a fan of separate feathers from the shoulder, filling the spandrel corner toward the
 // pier. Each feather is clipped to stay under the architrave, inside the pier panel edge and
 // clear of the archivolt.
 const w0=pol(50,r+.98);const room=(x,y)=>y<lim&&Math.abs(x)>-1&&(mirror?x<edge:x>-edge)&&Math.hypot(x-cx,y-cy)>r+.12;
 const fan=[[150,2.0],[160,2.1],[170,2.15],[181,2.1],[192,2.0],[204,1.8],[217,1.5],[231,1.15]];
 fan.forEach(([ang,L0],k)=>{const t=ang*Math.PI/180,ux=m*Math.cos(t),uy=Math.sin(t);let len=L0;while(len>.3&&!room(w0[0]+ux*len,w0[1]+uy*len))len-=.05;
  const nx=-uy*m,ny=ux*m,wd=.17,tip=[w0[0]+ux*len,w0[1]+uy*len];
  const f=smooth([[w0[0]+nx*.05,w0[1]+ny*.05],[w0[0]+ux*len*.45+nx*wd,w0[1]+uy*len*.45+ny*wd],tip,[w0[0]+ux*len*.5-nx*wd*.7,w0[1]+uy*len*.5-ny*wd*.7],[w0[0]-nx*.05,w0[1]-ny*.05]],3,true);
  parts.relief(name,face,f,.1+.01*(fan.length-k),{d:d+.04+k*.01,bevel:.55});});
 // Coverts: the rounded upper wing over the feather roots.
 parts.relief(name,face,smooth([[w0[0]+m*.25,w0[1]-.1],[w0[0]+m*.05,w0[1]+.45],[w0[0]-m*.7,w0[1]+.5],[w0[0]-m*1.05,w0[1]+.05],[w0[0]-m*.6,w0[1]-.3]],3),.12,{d:d+.14,bevel:.6});}
