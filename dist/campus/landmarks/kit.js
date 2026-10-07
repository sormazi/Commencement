import * as T from '../../vendor/three.module.js';
// Landmark construction kit. Everything is built as real geometry in a landmark's local frame
// (metres, +y up) and merged into one mesh per material. Faces get flat normals and planar UVs in
// metres, so stone textures keep a constant scale (1 UV unit = 1 m) on every surface.
//
// Conventions
//  - A Face is a plane with axes ux (right) and vy (up); its outward normal is ux × vy.
//    face.at(u,v,d) is the point u right, v up and d out of the face.
//  - Profiles are lists of [d,h] pairs (d = projection out of the surface, h = height along the
//    run's up vector), ordered from the bottom wall contact to the top wall contact.
//  - Every polygon helper takes a hint normal and fixes its own winding, so callers never have to.
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const add=(a,b,s=1)=>[a[0]+b[0]*s,a[1]+b[1]*s,a[2]+b[2]*s];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const norm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};
export const vec={add,sub,cross,dot,norm};

export class Face{
 constructor(origin,ux,vy){this.o=origin;this.u=norm(ux);this.v=norm(vy);this.n=norm(cross(this.u,this.v));}
 at(u,v,d=0){return [this.o[0]+this.u[0]*u+this.v[0]*v+this.n[0]*d,this.o[1]+this.u[1]*u+this.v[1]*v+this.n[1]*d,this.o[2]+this.u[2]*u+this.v[2]*v+this.n[2]*d];}
 // Matrix placing geometry authored in (x=u, y=v, z=d) at face coordinates (u,v,d).
 matrix(u=0,v=0,d=0,rot=0,s=1){const m=new T.Matrix4().makeBasis(V(...this.u),V(...this.v),V(...this.n));m.setPosition(V(...this.at(u,v,d)));
  if(rot)m.multiply(new T.Matrix4().makeRotationZ(rot));if(s!==1)m.multiply(typeof s==='number'?new T.Matrix4().makeScale(s,s,s):new T.Matrix4().makeScale(...s));return m;}
 // The same plane seen from behind (for the opposite face of a slab), sharing u.
 offset(d){return new Face(this.at(0,0,d),this.u,this.v);}
}

export class Parts{
 constructor(){this.m={};this.tris=0;}
 buf(name){return this.m[name]||(this.m[name]={pos:[],nor:[],uv:[]});}
 // One triangle with a flat normal; the winding is flipped to agree with hint if given.
 tri(name,a,b,c,hint){let n=cross(sub(b,a),sub(c,a));const l=Math.hypot(...n);if(l<1e-10)return;n=[n[0]/l,n[1]/l,n[2]/l];
  if(hint&&dot(n,hint)<0){[b,c]=[c,b];n=[-n[0],-n[1],-n[2]];}this.push(name,[a,b,c],[n,n,n]);}
 push(name,pts,nors,uvs){const B=this.buf(name);for(let i=0;i<pts.length;i++){const p=pts[i],n=nors[i];B.pos.push(p[0],p[1],p[2]);B.nor.push(n[0],n[1],n[2]);
   if(uvs){B.uv.push(uvs[i][0],uvs[i][1]);continue;}
   // Planar UV in metres on the dominant axis; u runs horizontally, v follows height on walls.
   const ax=Math.abs(n[0]),ay=Math.abs(n[1]),az=Math.abs(n[2]);
   if(ay>.72)B.uv.push(p[0],-p[2]);else if(ax>az)B.uv.push(n[0]>0?-p[2]:p[2],p[1]);else B.uv.push(n[2]>0?p[0]:-p[0],p[1]);}
  this.tris+=pts.length/3;}
 // Rectangle on a face with UVs spanning 0..1 (for panels carrying a whole texture, e.g. inscriptions).
 panel(name,face,u0,u1,v0,v1,d=0){const n=face.n,P=[face.at(u0,v0,d),face.at(u1,v0,d),face.at(u1,v1,d),face.at(u0,v1,d)],U=[[0,0],[1,0],[1,1],[0,1]];
  this.push(name,[P[0],P[1],P[2],P[0],P[2],P[3]],[n,n,n,n,n,n],[U[0],U[1],U[2],U[0],U[2],U[3]]);}
 quad(name,a,b,c,d,hint){this.tri(name,a,b,c,hint);this.tri(name,a,c,d,hint);}
 // Flat polygon (with holes) given in 2D face coordinates.
 poly(name,face,outer,holes=[],d=0){const o=outer.map(p=>new T.Vector2(p[0],p[1])),h=holes.map(r=>r.map(p=>new T.Vector2(p[0],p[1])));let f;
  try{f=T.ShapeUtils.triangulateShape(o,h);}catch{return;}const all=[...o,...h.flat()].map(p=>face.at(p.x,p.y,d));for(const [i,j,k] of f)this.tri(name,all[i],all[j],all[k],face.n);}
 rect(name,face,u0,u1,v0,v1,d=0){this.quad(name,face.at(u0,v0,d),face.at(u1,v0,d),face.at(u1,v1,d),face.at(u0,v1,d),face.n);}
 // Raised block standing on a face (front plus four sides; the back is hidden against the face).
 block(name,face,u0,u1,v0,v1,d0,d1,{skip=[]}={}){const P=(u,v,d)=>face.at(u,v,d);const n=face.n,nu=face.u,nv=face.v,neg=a=>a.map(x=>-x);
  this.quad(name,P(u0,v0,d1),P(u1,v0,d1),P(u1,v1,d1),P(u0,v1,d1),n);
  if(!skip.includes('bottom'))this.quad(name,P(u0,v0,d0),P(u1,v0,d0),P(u1,v0,d1),P(u0,v0,d1),neg(nv));
  if(!skip.includes('top'))this.quad(name,P(u0,v1,d0),P(u1,v1,d0),P(u1,v1,d1),P(u0,v1,d1),nv);
  if(!skip.includes('left'))this.quad(name,P(u0,v0,d0),P(u0,v1,d0),P(u0,v1,d1),P(u0,v0,d1),neg(nu));
  if(!skip.includes('right'))this.quad(name,P(u1,v0,d0),P(u1,v1,d0),P(u1,v1,d1),P(u1,v0,d1),nu);}
 // Axis-aligned box in local coordinates (all six faces unless skipped).
 box(name,x0,y0,z0,x1,y1,z1,skip=[]){const f=[[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1],'front'],[[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1],'back'],[[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0],'right'],[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0],'left'],[[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],[0,1,0],'top'],[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,-1,0],'bottom']];
  for(const [a,b,c,d,n,k] of f)if(!skip.includes(k))this.quad(name,a,b,c,d,n);}
 // A recess cut into a face: four reveal walls and a back. The face itself must leave a hole.
 recess(name,face,u0,u1,v0,v1,depth,backName=name){const P=(u,v,d)=>face.at(u,v,d),nu=face.u,nv=face.v,neg=a=>a.map(x=>-x);
  this.quad(name,P(u0,v0,0),P(u1,v0,0),P(u1,v0,-depth),P(u0,v0,-depth),nv);this.quad(name,P(u0,v1,0),P(u1,v1,0),P(u1,v1,-depth),P(u0,v1,-depth),neg(nv));
  this.quad(name,P(u0,v0,0),P(u0,v1,0),P(u0,v1,-depth),P(u0,v0,-depth),nu);this.quad(name,P(u1,v0,0),P(u1,v1,0),P(u1,v1,-depth),P(u1,v0,-depth),neg(nu));
  this.rect(backName,face,u0,u1,v0,v1,-depth);}
 // Sweep a profile along a path of frames {p, o (outward, may be a mitre vector), u (profile up)}.
 sweep(name,profile,path,{closed=false,caps=true}={}){const N=path.length,M=profile.length;const pt=(i,j)=>{const f=path[i%N],[d,h]=profile[j];return add(add(f.p,f.o,d),f.u,h);};
  const segs=closed?N:N-1;for(let i=0;i<segs;i++){const f=path[i],g=path[(i+1)%N],t=sub(g.p,f.p);
   for(let j=0;j<M-1;j++){const a=pt(i,j),b=pt(i+1,j),c=pt(i+1,j+1),d=pt(i,j+1);
    // Outward hint: the profile segment's normal in the (o,u) plane of this path segment.
    const o=norm(add(f.o,g.o)),u=norm(add(f.u,g.u)),dd=profile[j+1][0]-profile[j][0],dh=profile[j+1][1]-profile[j][1];
    const hint=add(add([0,0,0],o,dh),u,-dd);this.quad(name,a,b,c,d,dot(hint,hint)>1e-9?hint:cross(t,u));}}
  if(!closed&&caps){for(const [i,s] of [[0,-1],[N-1,1]]){const f=path[i],t=i===0?sub(path[1].p,f.p):sub(f.p,path[N-2].p),n=norm(t).map(x=>x*s);
    const pts=profile.map(([d,h])=>[d,h]);pts.push([0,profile[M-1][1]],[0,profile[0][1]]);const P=pts.map(([d,h])=>add(add(f.p,norm(f.o),d),f.u,h));
    let tr;try{tr=T.ShapeUtils.triangulateShape(pts.map(p=>new T.Vector2(p[0],p[1])),[]);}catch{continue;}for(const [a,b,c] of tr)this.tri(name,P[a],P[b],P[c],n);}}}
 // Merge any BufferGeometry (positions + normals; UVs are regenerated in metres).
 geo(name,g,matrix){const src=g.index?g.toNonIndexed():g;const p=src.attributes.position,n=src.attributes.normal;if(!n)src.computeVertexNormals();
  const nm=new T.Matrix3().getNormalMatrix(matrix),v=V(),w=V();const pts=[],nors=[];
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(matrix);w.fromBufferAttribute(src.attributes.normal,i).applyMatrix3(nm).normalize();pts.push([v.x,v.y,v.z]);nors.push([w.x,w.y,w.z]);}
  this.push(name,pts,nors);if(src!==g)src.dispose();g.dispose();}
 // Relief silhouette on a face: a 2D outline (face coordinates) extruded out of the face with a
 // rounded bevel, so carved figures catch light and cast shadows.
 relief(name,face,outline,depth,{d=0,bevel=.45,holes=[],seg=2}={}){const s=new T.Shape(outline.map(p=>new T.Vector2(p[0],p[1])));for(const h of holes)s.holes.push(new T.Path(h.map(p=>new T.Vector2(p[0],p[1]))));
  const b=Math.min(depth*bevel,.25);const g=new T.ExtrudeGeometry(s,{depth:Math.max(.005,depth-b),bevelEnabled:b>.004,bevelThickness:b,bevelSize:b*.8,bevelOffset:-b*.8,bevelSegments:seg,curveSegments:6});
  this.geo(name,g,face.matrix(0,0,d+b));}
 // Lathe (revolved profile [[r,y],...]) placed with a matrix.
 lathe(name,profile,matrix,seg=12,phiStart=0,phiLength=Math.PI*2){this.geo(name,new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(Math.max(r,0),y)),seg,phiStart,phiLength),matrix);}
 sphere(name,r,matrix,ws=10,hs=7){this.geo(name,new T.SphereGeometry(r,ws,hs),matrix);}
 cyl(name,r0,r1,h,matrix,seg=10){this.geo(name,new T.CylinderGeometry(r1,r0,h,seg),matrix);}
 torus(name,r,tube,matrix,arc=Math.PI*2,seg=24){this.geo(name,new T.TorusGeometry(r,tube,6,seg,arc),matrix);}
 // Build one mesh per material. Missing materials fall back to the first one given.
 build(materials,{shadows=true}={}){const g=new T.Group(),first=Object.values(materials)[0];
  for(const [name,B] of Object.entries(this.m)){if(!B.pos.length||name[0]==='_')continue;const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(B.pos,3));geo.setAttribute('normal',new T.Float32BufferAttribute(B.nor,3));geo.setAttribute('uv',new T.Float32BufferAttribute(B.uv,2));geo.computeBoundingSphere();
   const mesh=new T.Mesh(geo,materials[name]||first);mesh.name=name;mesh.castShadow=shadows;mesh.receiveShadow=true;g.add(mesh);}
  return g;}
 summary(){return Object.fromEntries(Object.entries(this.m).map(([k,b])=>[k,b.pos.length/9]));}
}

// ---------- path helpers ----------
// Closed rectangle loop in the horizontal plane at height y with mitred corners; outward normals.
// Ordered so that travel × up = outward (south face west→east, east face south→north, ...).
export function rectLoop(x0,x1,z0,z1,y){const c=[[x0,z1],[x1,z1],[x1,z0],[x0,z0]],out=[];
 for(let i=0;i<4;i++){const p=c[i],a=c[(i+3)%4],b=c[(i+1)%4];const n1=segNormal(a,p),n2=segNormal(p,b),m=[n1[0]+n2[0],n1[1]+n2[1]],k=1+n1[0]*n2[0]+n1[1]*n2[1];
  out.push({p:[p[0],y,p[1]],o:[m[0]/k,0,m[1]/k],u:[0,1,0]});}return out;}
// Open horizontal run along a polyline in plan [[x,z],...] at height y (outward on the travel-left
// in plan when viewed from above with +z toward the viewer, i.e. travel × up).
export function planRun(pts,y){return pts.map((p,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];
 const n1=i>0?segNormal(a,p):segNormal(p,b),n2=i<pts.length-1?segNormal(p,b):n1,m=[n1[0]+n2[0],n1[1]+n2[1]],k=1+n1[0]*n2[0]+n1[1]*n2[1];return {p:[p[0],y,p[1]],o:[m[0]/k,0,m[1]/k],u:[0,1,0]};});}
function segNormal(a,b){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return [-dz/l,dx/l];}
// Semicircular (or partial) arc in a vertical face plane at z, centre (cx,cy), radius r.
// side=+1 for a face looking +z, -1 for -z. Profile d goes out of the face, h radially outward.
export function arcPath(cx,cy,r,z,side,steps=32,a0=0,a1=Math.PI){const out=[];for(let i=0;i<=steps;i++){const t=side>0?a1-(a1-a0)*i/steps:a0+(a1-a0)*i/steps;
 out.push({p:[cx+r*Math.cos(t),cy+r*Math.sin(t),z],o:[0,0,side],u:[Math.cos(t),Math.sin(t),0]});}return out;}

// ---------- shapes ----------
export function star(r,inner=.42,n=5,rot=Math.PI/2){const p=[];for(let i=0;i<n*2;i++){const a=rot+i*Math.PI/n,R=i%2?r*inner:r;p.push([Math.cos(a)*R,Math.sin(a)*R]);}return p;}
export function circle(r,n=16,cx=0,cy=0){const p=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;p.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return p;}
// Smooth closed outline through control points (Catmull-Rom), for hand-authored silhouettes.
export function smooth(pts,per=4,closed=true){const out=[],n=pts.length;for(let i=0;i<(closed?n:n-1);i++){const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
 for(let k=0;k<per;k++){const t=k/per,t2=t*t,t3=t2*t;out.push([0,1].map(j=>.5*((2*p1[j])+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3)));}}
 if(!closed)out.push(pts[n-1]);return out;}
export const mirrorX=pts=>pts.map(([x,y])=>[-x,y]).reverse();
export const xf=(pts,{dx=0,dy=0,s=1,sx=s,sy=s,rot=0}={})=>pts.map(([x,y])=>{const c=Math.cos(rot),si=Math.sin(rot),X=x*sx,Y=y*sy;return [X*c-Y*si+dx,X*si+Y*c+dy];});

// ---------- classical profiles ([d,h] from bottom wall contact to top wall contact) ----------
export function cymaRecta(w,h,steps=6){const p=[];for(let i=0;i<=steps;i++){const t=i/steps;p.push([w*(.5-.5*Math.cos(Math.PI*t)),h*t]);}return p;}
export function ovolo(w,h,steps=4){const p=[];for(let i=0;i<=steps;i++){const a=i/steps*Math.PI/2;p.push([w*Math.sin(a),h*(1-Math.cos(a))]);}return p;}
export function torusProfile(r,steps=6){const p=[];for(let i=0;i<=steps;i++){const a=-Math.PI/2+i/steps*Math.PI;p.push([r*Math.cos(a),r+r*Math.sin(a)]);}return p;}
// Concatenate profile segments stacked upward; each segment is relative to the end of the last.
export function stack(...segs){const out=[[0,0]];let d=0,h=0;for(const s of segs){for(const [sd,sh] of s){out.push([d+sd,h+sh]);}const e=s[s.length-1];d+=e[0];h+=e[1];}
 const clean=[out[0]];for(const p of out.slice(1)){const q=clean[clean.length-1];if(Math.abs(p[0]-q[0])>1e-6||Math.abs(p[1]-q[1])>1e-6)clean.push(p);}return clean;}
// Absolute helpers for stack(): step out, rise, curve.
export const out=d=>[[d,0]];
export const up=h=>[[0,h]];
export const step=(d,h)=>[[d,0],[d,h]];

// ---------- textures (browser only) ----------
const hash=n=>{const v=Math.sin(n*127.1+31.7)*43758.5453;return v-Math.floor(v);};
export function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
// Normal map from a height canvas (white = high).
export function normalMap(src,strength=2){const w=src.width,h=src.height,s=src.getContext('2d').getImageData(0,0,w,h).data,c=canvas(w,h),g=c.getContext('2d'),o=g.createImageData(w,h);
 const H=(x,y)=>s[(((y+h)%h)*w+((x+w)%w))*4]/255;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dx=(H(x+1,y)-H(x-1,y))*strength,dy=(H(x,y+1)-H(x,y-1))*strength,l=Math.hypot(dx,dy,1),i=(y*w+x)*4;
  o.data[i]=(-dx/l*.5+.5)*255;o.data[i+1]=(dy/l*.5+.5)*255;o.data[i+2]=(1/l*.5+.5)*255;o.data[i+3]=255;}g.putImageData(o,0,0);return c;}
function tex(c,srgb=true,rx=1,ry=1){const t=new T.CanvasTexture(c);if(srgb)t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=4;return t;}
// Stone with coursed ashlar joints. One texture tile covers tileW × (courses·course) metres.
export function stoneTextures({base='#e4e0d6',vary=.05,course=.61,courses=4,block=1.6,tileW=4.8,px=256,joint=.012,grain=1,seed=1,jointAlpha=.35,jointDepth=1}={}){
 const H=Math.round(px*courses*course/tileW),col=canvas(px,H),ht=canvas(px,H),g=col.getContext('2d'),q=ht.getContext('2d'),ppm=px/tileW;
 g.fillStyle=base;g.fillRect(0,0,px,H);q.fillStyle='#fff';q.fillRect(0,0,px,H);
 for(let r=0;r<courses;r++){const y0=H-(r+1)*course*ppm,off=(r%2)*block*.5*ppm;for(let x=-off;x<px;x+=block*ppm){const k=hash(seed*31+r*17+x);g.fillStyle=`rgba(${k>.5?255:0},${k>.5?250:0},${k>.5?240:0},${Math.abs(k-.5)*vary*2})`;g.fillRect(x,y0,block*ppm,course*ppm);}}
 for(let i=0;i<px*H*.06*grain;i++){const x=hash(i*1.3+seed)*px,y=hash(i*2.1+seed)*H,v=hash(i*3.7);g.fillStyle=`rgba(${v>.5?255:40},${v>.5?255:40},${v>.5?250:45},${.04+v*.05})`;g.fillRect(x,y,1+hash(i)*2,1);q.fillStyle=`rgba(0,0,0,${.05*hash(i*5.1)})`;q.fillRect(x,y,1,1);}
 const jw=Math.max(1,joint*ppm);g.fillStyle=`rgba(90,86,78,${jointAlpha})`;q.fillStyle=`rgba(0,0,0,${jointDepth})`;
 for(let r=0;r<courses;r++){const y0=H-(r+1)*course*ppm,off=(r%2)*block*.5*ppm;g.fillRect(0,y0,px,jw);q.fillRect(0,y0,px,jw);for(let x=-off;x<px;x+=block*ppm){g.fillRect(x,y0,jw,course*ppm);q.fillRect(x,y0,jw,course*ppm);}}
 const map=tex(col,true,1/tileW,1/(courses*course)),nmap=tex(normalMap(ht,3),false,1/tileW,1/(courses*course));return {map,normalMap:nmap};}
// Plain stone (no joints) for carved ornament.
export function grainTextures({base='#e6e2d8',px=128,size=1.5,seed=2}={}){const c=canvas(px,px),g=c.getContext('2d'),ht=canvas(px,px),q=ht.getContext('2d');g.fillStyle=base;g.fillRect(0,0,px,px);q.fillStyle='#fff';q.fillRect(0,0,px,px);
 for(let i=0;i<px*px*.12;i++){const x=hash(i*1.7+seed)*px,y=hash(i*2.9+seed)*px,v=hash(i*4.3);g.fillStyle=`rgba(${v>.5?255:60},${v>.5?255:58},${v>.5?250:52},${.03+v*.05})`;g.fillRect(x,y,2,2);q.fillStyle=`rgba(0,0,0,${.12*hash(i*7.7)})`;q.fillRect(x,y,2,2);}
 return {map:tex(c,true,1/size,1/size),normalMap:tex(normalMap(ht,1.5),false,1/size,1/size)};}
// Incised Roman capitals on a panel: returns textures sized to the panel (UVs must span 0..1).
export function inscriptionTextures(lines,{w=10,h=2.4,px=2048,base='#e2ded4',ink='rgba(70,66,58,.75)',font='"Times New Roman", Times, serif',spacing=.08}={}){
 const H=Math.round(px*h/w),c=canvas(px,H),g=c.getContext('2d'),ht=canvas(px,H),q=ht.getContext('2d');g.fillStyle=base;g.fillRect(0,0,px,H);q.fillStyle='#fff';q.fillRect(0,0,px,H);
 const lh=H/(lines.length+.6);for(const [i,line] of lines.entries()){let size=lh*.62;g.font=q.font=`600 ${size}px ${font}`;
  // Shrink to fit with letter spacing (drawn per glyph so the width can be controlled).
  const width=s=>{g.font=`600 ${s}px ${font}`;return [...line].reduce((a,ch)=>a+g.measureText(ch).width+s*spacing,0);};while(width(size)>px*.94&&size>4)size*=.97;
  const total=width(size);let x=(px-total)/2;const y=lh*(i+.8)+size*.36;g.font=q.font=`600 ${size}px ${font}`;g.fillStyle=ink;q.fillStyle='#000';
  for(const ch of line){g.fillText(ch,x,y);q.fillText(ch,x,y);x+=g.measureText(ch).width+size*spacing;}}
 const map=tex(c,true),nm=tex(normalMap(ht,4),false);map.wrapS=map.wrapT=nm.wrapS=nm.wrapT=T.ClampToEdgeWrapping;return {map,normalMap:nm};}
// Greek-key (meander) band; tiles horizontally every `pitch` metres, band height h.
export function meanderTextures({pitch=.5,h=.3,base='#e2ded4',px=128}={}){const H=Math.round(px*h/pitch),c=canvas(px,H),g=c.getContext('2d'),ht=canvas(px,H),q=ht.getContext('2d');
 g.fillStyle=base;g.fillRect(0,0,px,H);q.fillStyle='#000';q.fillRect(0,0,px,H);q.fillStyle='#fff';const u=px/10,v=H/10;
 // Raised fret: a squared spiral per pitch plus top and bottom fillets.
 const r=(x,y,w,hh)=>{q.fillRect(x*u,y*v,w*u,hh*v);};r(0,0,10,1);r(0,9,10,1);r(1,2,1,6);r(1,2,6,1);r(6,2,1,4);r(3,5,4,1);r(3,4,1,2);r(1,7,8,1);r(8,2,1,6);
 g.globalAlpha=.3;g.globalCompositeOperation='multiply';g.drawImage(ht,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;
 const map=tex(c,true,1/pitch,1/h),nm=tex(normalMap(ht,3),false,1/pitch,1/h);return {map,normalMap:nm,colorCanvas:c};}

// ---------- placing a landmark on its footprint ----------
// Minimum-area oriented rectangle of a map ring, returned as a local frame whose +x runs along the
// face looking most nearly north (west → east as seen from the north is -x; see below) and whose
// +z points away from that face into the building. Local (x,z) → map: corner + x*ex + z*ez.
export function footprintFrame(ring,{north='n'}={}){let best=null;
 for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<1)continue;const ux=(b[0]-a[0])/L,un=(b[1]-a[1])/L;
  let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const p of ring){const u=p[0]*ux+p[1]*un,v=-p[0]*un+p[1]*ux;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);}
  const A=(u1-u0)*(v1-v0);if(!best||A<best.A-1e-6)best={A,ux,un,u0,u1,v0,v1};}
 const {ux,un,u0,u1,v0,v1}=best;const P=(u,v)=>[u*ux-v*un,u*un+v*ux];
 // The four candidate faces with outward normals; choose the one facing most nearly the target.
 const faces=[{n:[-un,ux],a:P(u1,v1),b:P(u0,v1),len:u1-u0,dep:v1-v0},{n:[un,-ux],a:P(u0,v0),b:P(u1,v0),len:u1-u0,dep:v1-v0},{n:[ux,un],a:P(u1,v0),b:P(u1,v1),len:v1-v0,dep:u1-u0},{n:[-ux,-un],a:P(u0,v1),b:P(u0,v0),len:v1-v0,dep:u1-u0}];
 const tgt=north==='n'?[0,1]:north==='s'?[0,-1]:north==='e'?[1,0]:[-1,0];const f=faces.reduce((m,f)=>f.n[0]*tgt[0]+f.n[1]*tgt[1]>m.n[0]*tgt[0]+m.n[1]*tgt[1]?f:m);
 // Corner at the face's left end as seen from outside looking in is f.a→f.b runs right-to-left... use
 // b as origin so +x runs from b to a, i.e. along the face with the outward normal on the -z side.
 const ex=[(f.a[0]-f.b[0])/f.len,(f.a[1]-f.b[1])/f.len],ez=[-f.n[0],-f.n[1]];
 return {origin:f.b,ex,ez,lx:f.len,lz:f.dep,rotY:Math.atan2(ex[1],ex[0]),toMap:(x,z)=>[f.b[0]+ex[0]*x+ez[0]*z,f.b[1]+ex[1]*x+ez[1]*z]};}
// Place a local-frame group (x along ex, y up, z along ez) in Three world coordinates.
export function placeOnFrame(group,frame,y=0){group.position.set(frame.origin[0],y,-frame.origin[1]);group.rotation.y=frame.rotY;
 // Three's rotation.y maps local z to (sin θ, cos θ) in (x, z_three) = map (sin θ, -cos θ); check it is ez.
 return group;}
// Running-bond brick: one tile covers tileW × tileH metres.
export function brickTextures({base='#c8c1b3',mortar='#d9d4ca',brick=[.2,.067],tileW=1.6,tileH=.804,px=256,vary=.06,seed=4}={}){const H=Math.round(px*tileH/tileW),c=canvas(px,H),g=c.getContext('2d'),ht=canvas(px,H),q=ht.getContext('2d'),ppm=px/tileW;
 g.fillStyle=mortar;g.fillRect(0,0,px,H);q.fillStyle='#000';q.fillRect(0,0,px,H);const bw=brick[0]*ppm,bh=brick[1]*ppm,j=Math.max(1,.01*ppm);let r=0;
 for(let row=0;row*bh<H;row++){const off=row%2?bw/2:0;for(let x=-off;x<px;x+=bw){const k=hash(seed+row*91+Math.round(x));const l=(k-.5)*vary*255;g.fillStyle=base;g.fillRect(x+j/2,row*bh+j/2,bw-j,bh-j);g.fillStyle=`rgba(${l>0?255:0},${l>0?255:0},${l>0?255:0},${Math.abs(l)/255})`;g.fillRect(x+j/2,row*bh+j/2,bw-j,bh-j);q.fillStyle='#fff';q.fillRect(x+j/2,row*bh+j/2,bw-j,bh-j);}}
 return {map:tex(c,true,1/tileW,1/tileH),normalMap:tex(normalMap(ht,2),false,1/tileW,1/tileH)};}
// Flag cloth with an emblem drawn by the caller.
export function clothTexture(draw,w=256,h=384){const c=canvas(w,h);draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
// Arc frames on any face: centre (cu,cv) in face coordinates, radius r, from angle a0 to a1
// (0 = face right, π = face left); profiles extrude out of the face (o = n) and radially (u).
export function arcOnFace(f,cu,cv,r,steps=16,a0=0,a1=Math.PI){const out=[];for(let i=0;i<=steps;i++){const t=a1-(a1-a0)*i/steps,c=Math.cos(t),s=Math.sin(t);
 out.push({p:f.at(cu+r*c,cv+r*s,0),o:f.n,u:[f.u[0]*c+f.v[0]*s,f.u[1]*c+f.v[1]*s,f.u[2]*c+f.v[2]*s]});}return out;}
// Reveal (jamb) walls around a hole outline in a face, `depth` deep, facing into the opening;
// with back !== null also fills the back of the opening with that material.
export function reveal(P,name,f,hole,depth,back=null){let cu=0,cv=0;for(const p of hole){cu+=p[0];cv+=p[1];}cu/=hole.length;cv/=hole.length;
 for(let k=0;k<hole.length;k++){const p=hole[k],q=hole[(k+1)%hole.length],mu=(p[0]+q[0])/2-cu,mv=(p[1]+q[1])/2-cv,h=[-(f.u[0]*mu+f.v[0]*mv),-(f.u[1]*mu+f.v[1]*mv),-(f.u[2]*mu+f.v[2]*mv)];
  P.quad(name,f.at(p[0],p[1],0),f.at(q[0],q[1],0),f.at(q[0],q[1],-depth),f.at(p[0],p[1],-depth),h);}
 if(back)P.poly(back,new Face(f.at(0,0,-depth),f.u,f.v),hole);}
