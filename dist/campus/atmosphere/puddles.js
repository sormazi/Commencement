import * as T from '../../vendor/three.module.js';
// Where rainwater collects (rain fix, 11 Oct). A one-channel map over the whole study area, half a metre per
// texel, built once from the street data: the post pass reads it to decide where puddles form, and the
// wetness level decides how far they spread. Real water pools where the ground is lowest:
//  - gutters: a band about a metre wide along every curb, on the roadway side (roads are crowned, so the
//    middle of the street drains to them);
//  - low spots at crosswalks: both ends of every marked crossing, where the curb ramps dip to the road;
//  - potholes and settled patches: a few small dips scattered along each street, fixed by a hash;
//  - the edges of park paths: a band along every lawn's edge, on the paving side.
// Values: 0 dry ground that drains, up to 1 the lowest point. The shader adds fine noise for the ragged edge.
const RES=.5;// metres per texel
const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
export function buildPoolMap(data){const B=data.meta.bounds,pad=20,minX=B.minX-pad,minN=B.minN-pad,w=Math.ceil((B.maxX-B.minX+2*pad)/RES),h=Math.ceil((B.maxN-B.minN+2*pad)/RES);
 const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,w,h);
 // Canvas y runs down; map north runs up.
 const P=p=>[(p[0]-minX)/RES,h-(p[1]-minN)/RES];
 const path=ring=>{g.beginPath();ring.forEach((p,i)=>{const [x,y]=P(p);i?g.lineTo(x,y):g.moveTo(x,y);});g.closePath();};
 g.lineJoin='round';g.lineCap='round';
 // Gutters: stroke every curb line (sidewalk, median and plaza outlines), then refill the raised slabs black
 // so only the roadway half of the stroke is left.
 const slabs=[...data.sidewalk,...data.median.filter((m,i)=>data.medianKind?.[i]!=='painted'),...(data.plazas||[])].map(p=>p[0]);
 g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=2.4/RES;for(const r of slabs){path(r);g.stroke();}
 g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.1/RES;for(const r of slabs){path(r);g.stroke();}
 // Crosswalk ends: the ramps at each curb.
 for(const cr of data.crossings||[]){const pts=cr.pts;if(!pts||pts.length<2)continue;for(const p of [pts[0],pts[pts.length-1]]){const [x,y]=P(p),rad=(1.4+hash(p[0]*3.1+p[1])*1.2)/RES;
  const gr=g.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,rad,0,7);g.fill();}}
 // Potholes and settled patches along the streets: about one every 30 m, placed across the carriageway.
 const S=data.streets;S.segments.forEach((s,si)=>{const half=Math.max(1,(s.width||9)/2-1.2);for(let i=1;i<s.pts.length;i++){const a=s.pts[i-1],b=s.pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<1)continue;
  const ux=(b[0]-a[0])/L,un=(b[1]-a[1])/L;for(let d=hash(si+i*.7)*30;d<L;d+=22+hash(si*13+d)*26){const k=si*101+i*7+d;if(hash(k)>.55)continue;const off=(hash(k+1)*2-1)*half;
   const p=[a[0]+ux*d-un*off,a[1]+un*d+ux*off],[x,y]=P(p),rad=(.5+hash(k+2)*1.3)/RES,str=.55+hash(k+3)*.4;
   const gr=g.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,`rgba(255,255,255,${str})`);gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.ellipse(x,y,rad*(1+hash(k+4)),rad,Math.atan2(-un,ux),0,7);g.fill();}}});
 // Refill the raised slabs (sidewalks drain to the gutter; only their ramps and odd dips hold water).
 g.fillStyle='#000';for(const r of slabs){path(r);g.fill();}
 // Park paths: water stands along the edges of the paving where it meets the lawns.
 g.lineWidth=1.4/RES;g.strokeStyle='rgba(255,255,255,.7)';const lawns=(data.areas||[]).filter(a=>a.kind==='grass'||a.kind==='pitch');for(const a of lawns){path(a.ring);g.stroke();}
 g.fillStyle='#000';for(const a of lawns){path(a.ring);g.fill();}
 // Soften (two box blurs) and keep one channel.
 const img=g.getImageData(0,0,w,h).data,v=new Uint8Array(w*h);for(let i=0;i<w*h;i++)v[i]=img[i*4];
 blur(v,w,h,2);blur(v,w,h,1);
 const tex=new T.DataTexture(v,w,h,T.RedFormat,T.UnsignedByteType);tex.minFilter=tex.magFilter=T.LinearFilter;tex.wrapS=tex.wrapT=T.ClampToEdgeWrapping;tex.flipY=false;tex.needsUpdate=true;
 // box: world (x, n) of texel row 0 (south) and metres per map unit. Texture row 0 is the canvas's top (north),
 // so v runs from north to south.
 return {texture:tex,box:new T.Vector4(minX,minN+h*RES,1/(w*RES),1/(h*RES)),size:[w,h]};}
function blur(v,w,h,r){const t=new Uint8Array(v.length),n=2*r+1;
 for(let y=0;y<h;y++){let s=0;const o=y*w;for(let x=-r;x<=r;x++)s+=v[o+Math.min(w-1,Math.max(0,x))];for(let x=0;x<w;x++){t[o+x]=s/n;s+=v[o+Math.min(w-1,x+r+1)]-v[o+Math.max(0,x-r)];}}
 for(let x=0;x<w;x++){let s=0;for(let y=-r;y<=r;y++)s+=t[Math.min(h-1,Math.max(0,y))*w+x];for(let y=0;y<h;y++){v[y*w+x]=s/n;s+=t[Math.min(h-1,y+r+1)*w+x]-t[Math.max(0,y-r)*w+x];}}}
