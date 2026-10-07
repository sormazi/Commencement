import {Grid,closestOnSegment} from './geometry.js';
// Street graph built from NYC Centerline segments (street names, curb-to-curb widths, travel direction).
export class StreetGraph{
 constructor(data){this.names=data.streets.names;this.segments=data.streets.segments;this.nodes=data.streets.nodes;this.edges=data.streets.edges;this.grid=new Grid(25);this.pieces=[];
  this.adjacency=this.nodes.map(()=>[]);for(const [a,b,s,len] of this.edges){this.adjacency[a].push({to:b,segment:s,len});this.adjacency[b].push({to:a,segment:s,len});}
  this.segments.forEach((s,si)=>{for(let i=1;i<s.pts.length;i++){const a=s.pts[i-1],b=s.pts[i];const piece={si,a,b};this.pieces.push(piece);this.grid.insert(piece,[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])]);}});}
 nearest(x,n,radius=60){let best=null,bd=Infinity;for(const p of this.grid.query(x-radius,n-radius,x+radius,n+radius)){const c=closestOnSegment(x,n,p.a[0],p.a[1],p.b[0],p.b[1]);const d=Math.hypot(c.x-x,c.n-n);if(d<bd){bd=d;best={piece:p,point:[c.x,c.n],dist:d};}}
  if(!best||bd>radius)return null;const s=this.segments[best.piece.si],dx=best.piece.b[0]-best.piece.a[0],dn=best.piece.b[1]-best.piece.a[1];
  return {segment:s,index:best.piece.si,name:this.names[s.street],point:best.point,dist:bd,width:s.width,yaw:Math.atan2(dx,dn),dir:s.dir};}
 // Name of the street the point is on (within the carriageway plus sidewalk), else null.
 streetAt(x,n){const r=this.nearest(x,n,40);return r&&r.dist<r.width/2+5?r.name:null;}
 // Graph sanity helpers used by tests.
 componentSizes(){const seen=new Uint8Array(this.nodes.length),sizes=[];for(let i=0;i<this.nodes.length;i++){if(seen[i])continue;let stack=[i],c=0;seen[i]=1;while(stack.length){const k=stack.pop();c++;for(const e of this.adjacency[k])if(!seen[e.to]){seen[e.to]=1;stack.push(e.to);}}sizes.push(c);}return sizes.sort((a,b)=>b-a);}
 namesFor(nodeIndex){return [...new Set(this.adjacency[nodeIndex].map(e=>this.names[this.segments[e.segment].street]))];}
 // Breadth-first route length (metres) between the nodes nearest two points, along the graph.
 route(from,to){const near=p=>{let b=-1,bd=Infinity;this.nodes.forEach((q,i)=>{const d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<bd){bd=d;b=i;}});return b;};const s=near(from),t=near(to),dist=new Float64Array(this.nodes.length).fill(Infinity);dist[s]=0;const open=[s];while(open.length){open.sort((a,b)=>dist[b]-dist[a]);const k=open.pop();if(k===t)break;for(const e of this.adjacency[k]){const d=dist[k]+e.len;if(d<dist[e.to]){dist[e.to]=d;open.push(e.to);}}}return dist[t];}
}
