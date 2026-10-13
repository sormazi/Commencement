import * as T from '../../vendor/three.module.js';
// Tree species (vegetation survey, 13 Oct 2026). Every tree in the NYC Parks forestry data carries its species
// and trunk diameter (DBH, inches); this module turns them into a crown shape, a size and colours.
// Shapes, one crown mesh each (per-tree rotation and proportions keep any two trees from matching):
//   broad    London planetree, oaks other than pin oak, hackberry, sweetgum, Kentucky coffeetree: wide, lumpy, high
//   vase     American and other elms, zelkovas: narrow at the base, fanning out to a wide top
//   pyramid  pin oak: broad skirt of drooping lower limbs, tapering to a point
//   oval     lindens, Callery pear, hornbeam, cherries, magnolias, basswood: dense egg shape
//   airy     thornless honeylocust, Japanese pagoda tree, goldenrain tree: open, umbrella-like clumps
//   columnar ginkgo (narrow and upright while young), dawn redwood (a narrow cone)
// Size: height and crown width grow with DBH along rough curves for each shape (my estimates from typical New York
// street trees, to be checked against the USDA Urban Tree Database, Northeast region); street trees are limbed up
// to a clear trunk of 2.2 to 3.2 m, and the crown fills the height above it. Colour: a summer green for each species, and autumn colour by date (honeylocust
// and linden turn yellow from early October, ginkgo bright yellow in early November, pin oak russet, Callery pear
// red, zelkova orange-brown, London plane a dull yellow-brown, all in November). Bare winter crowns are still to come.
const P=(shape,hsl,fall,fallStart,bark,sz)=>({shape,hsl,fall,fallStart,bark,sz});
// sz: [height base m, height per inch DBH, crown width base m, width per inch, crown height / width]
const SZ={broad:[5,.42,2,.4,.8],vase:[5,.45,1.8,.42,.85],pyramid:[5,.46,1.6,.3,1.25],oval:[4,.38,1.4,.28,1.15],airy:[4.5,.4,1.8,.4,.65],columnar:[4.5,.42,1,.16,1.9]};
const SPECIES=[
 [/plane/i,P('broad',[.22,.38,.26],[.11,.45,.36],305,0xb3ab92,SZ.broad)],
 [/honeylocust|honey locust/i,P('airy',[.2,.48,.34],[.14,.75,.5],285,0x3b3029,SZ.airy)],
 [/pagoda/i,P('airy',[.24,.42,.28],[.15,.6,.42],300,0x5a5248,SZ.airy)],
 [/goldenrain/i,P('airy',[.2,.42,.3],[.12,.6,.42],295,0x5d5145,SZ.airy)],
 [/ginkgo|maidenhair/i,P('columnar',[.23,.45,.33],[.15,.85,.52],310,0x5e554b,SZ.columnar)],
 [/redwood|bald ?cypress/i,P('columnar',[.27,.35,.28],[.07,.5,.36],305,0x6b4a35,SZ.columnar)],
 [/pin oak/i,P('pyramid',[.24,.4,.24],[.05,.55,.3],310,0x4d4740,SZ.pyramid)],
 [/oak/i,P('broad',[.23,.38,.24],[.07,.5,.32],310,0x4a443d,SZ.broad)],
 [/elm/i,P('vase',[.24,.4,.26],[.13,.55,.42],300,0x55493f,SZ.vase)],
 [/zelkova/i,P('vase',[.25,.4,.27],[.06,.55,.38],305,0x7a7365,SZ.vase)],
 [/linden|basswood/i,P('oval',[.22,.42,.28],[.13,.6,.45],285,0x4f463d,SZ.oval)],
 [/pear/i,P('oval',[.25,.45,.25],[.01,.55,.3],315,0x463d36,SZ.oval)],
 [/cherry|plum/i,P('oval',[.24,.38,.27],[.03,.5,.34],295,0x5b3a33,SZ.oval)],
 [/hornbeam|magnolia|maple|hackberry|sweetgum|coffeetree|catalpa|horsechestnut|ash/i,P('broad',[.23,.4,.27],[.08,.55,.38],298,0x50473f,SZ.broad)],
];
const DEFAULT=P('oval',[.23,.38,.27],[.1,.5,.38],300,0x4f463d,SZ.oval);
export const SHAPES=Object.keys(SZ);
export function profile(sp){if(!sp)return DEFAULT;for(const [re,p] of SPECIES)if(re.test(sp))return p;return DEFAULT;}
const h=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
// Size of a tree from its profile and DBH; boost scales the 2126 growth. Returns crown width and height, crown
// centre height and trunk radius (metres).
export function treeSize(tr,boost){const p=profile(tr.sp),[h0,hk,w0,wk,ratio]=p.sz,dbh=Math.max(2,tr.dbh||8),b=boost||{height:1,crown:1,trunk:1};
 if(tr.landmark)return {w:18*b.crown,hgt:14*b.crown,cy:13,r:.72*b.trunk,p};
 const H=Math.min(26,h0+hk*dbh)*b.height,W=Math.min(16,w0+wk*dbh)*b.crown,clear=Math.min(3.2,2.2+dbh*.04),Hc=Math.max(1.2,Math.min(H-clear,W*ratio*1.45)),cy=H-Hc/2;
 return {w:W,hgt:Hc,cy,r:Math.max(.07,dbh*.0254/2)*b.trunk,p};}
// Leaf colour for a tree on a given day of the year (0..365): summer green, turning to the species' autumn colour
// over about three weeks from its start, with a little spread between trees; per-tree variation of lightness.
export function leafColour(p,day,seed){const t=Math.min(1,Math.max(0,(day-p.fallStart-(h(seed)-.5)*12)/22));const c=new T.Color().setHSL(...p.hsl);
 if(t>0)c.lerp(new T.Color().setHSL(...p.fall),t);const v=.88+h(seed+3)*.24;c.multiplyScalar(v);return c;}
// Crown meshes, unit size (about 1 across, centred), lumpy and soft-normalled like foliage.crownGeometry.
function vnoise(x,y,z){const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z),fx=x-ix,fy=y-iy,fz=z-iz,s=t=>t*t*(3-2*t),u=s(fx),v=s(fy),w=s(fz);
 const H=(i,j,k)=>h(ix+i+(iy+j)*57+(iz+k)*131),L=(a,b,t)=>a+(b-a)*t;
 return L(L(L(H(0,0,0),H(1,0,0),u),L(H(0,1,0),H(1,1,0),u),v),L(L(H(0,0,1),H(1,0,1),u),L(H(0,1,1),H(1,1,1),u),v),w);}
const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
const RADIUS={
 broad:d=>(1+.2*(vnoise(d.x*2.1+3,d.y*2.1,d.z*2.1)-.5)*2)*(d.y<-.3?.75+.25*(d.y+1):1),
 vase:d=>(1+.14*(vnoise(d.x*2.4,d.y*2.4+5,d.z*2.4)-.5)*2)*(.45+.55*sm(-.9,.35,d.y)),
 pyramid:d=>(1+.12*(vnoise(d.x*2.8,d.y*2.8,d.z*2.8+2)-.5)*2)*(1.05-.62*sm(-.6,1,d.y))*(d.y<-.55?.8:1),
 oval:d=>(1+.1*(vnoise(d.x*3,d.y*3,d.z*3+7)-.5)*2)*(.88+.12*d.y),
 airy:d=>(1+.38*(vnoise(d.x*1.7+9,d.y*1.7,d.z*1.7)-.5)*2)*(d.y<0?.55+.45*(d.y+1):1),
 columnar:d=>(1+.12*(vnoise(d.x*3.2,d.y*3.2+1,d.z*3.2)-.5)*2)*(1-.55*sm(.1,1,d.y)),
};
export function crownShapeGeometry(shape){const g=new T.IcosahedronGeometry(.5,3),p=g.attributes.position,v=new T.Vector3(),d=new T.Vector3(),n=new Float32Array(p.count*3);
 for(let i=0;i<p.count;i++){d.fromBufferAttribute(p,i).normalize();v.copy(d).multiplyScalar(.5*RADIUS[shape](d));p.setXYZ(i,v.x,v.y,v.z);n[i*3]=d.x;n[i*3+1]=d.y;n[i*3+2]=d.z;}
 g.computeVertexNormals();const fn=g.attributes.normal,a=new T.Vector3();for(let i=0;i<p.count;i++){a.set(n[i*3],n[i*3+1],n[i*3+2]).multiplyScalar(.7).add(new T.Vector3().fromBufferAttribute(fn,i).multiplyScalar(.3)).normalize();fn.setXYZ(i,a.x,a.y,a.z);}
 return g;}
export const dayOfYear=(date)=>{const d=date||new Date();return Math.floor((d-new Date(d.getFullYear(),0,0))/864e5);};
// Limbs: a tapered branch leaning 40 degrees out from vertical, its base at the origin, 1 m long. Instanced per
// tree, turned round the trunk and scaled to the crown, they show between the clear trunk and the leaves (and
// carry the crown in winter).
export function limbGeometry(){const g=new T.CylinderGeometry(.018,.045,1,6,1,true);g.translate(0,.5,0);g.rotateZ(-.7);return g;}
// Deciduous trees are bare from early December to early April (all the common species here are deciduous).
export const leafless=day=>day>=338||day<=95;
