// Heading-up street map for the free-roam campus: streets at true width, park, buildings (NYU in violet),
// street names along the nearest segments and a north arrow.
export class CampusMinimap{
 constructor(data,streets){this.data=data;this.streets=streets;this.ready=typeof Path2D!=='undefined';if(!this.ready)return;
  const poly=(path,r)=>{r.forEach((p,i)=>i?path.lineTo(p[0],-p[1]):path.moveTo(p[0],-p[1]));path.closePath();};
  this.roads=new Map();for(const s of data.streets.segments){const w=Math.round(s.width);if(!this.roads.has(w))this.roads.set(w,new Path2D());const p=this.roads.get(w);s.pts.forEach((q,i)=>i?p.lineTo(q[0],-q[1]):p.moveTo(q[0],-q[1]));}
  this.park=new Path2D();this.grass=new Path2D();for(const a of data.areas){if(a.kind==='park')poly(this.park,a.ring);else if(a.kind==='grass'||a.kind==='dogrun'||a.kind==='playground')poly(this.grass,a.ring);}
  this.buildings=new Path2D();this.nyu=new Path2D();for(const b of data.buildings)poly(b.nyu?this.nyu:this.buildings,b.rings[0]);
  this.fountain=data.areas.filter(a=>a.kind==='fountain');}
 draw(ctx,w,h,x,n,yaw,scale=.55){if(!this.ready)return;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0b1418';ctx.fillRect(0,0,w,h);
  const cx=w/2,cy=h*.6;ctx.translate(cx,cy);ctx.rotate(-yaw);ctx.scale(scale,scale);ctx.translate(-x,n);
  ctx.fillStyle='#1b2a22';ctx.fill(this.park);ctx.fillStyle='#2c4630';ctx.fill(this.grass);ctx.fillStyle='#29323a';ctx.fill(this.buildings);ctx.fillStyle='#4a3d68';ctx.fill(this.nyu);
  ctx.strokeStyle='#5d6a74';ctx.lineCap='round';ctx.lineJoin='round';for(const [width,p] of this.roads){ctx.lineWidth=Math.max(4,width);ctx.stroke(p);}
  ctx.fillStyle='#6f8e96';for(const f of this.fountain){ctx.beginPath();f.ring.forEach((p,i)=>i?ctx.lineTo(p[0],-p[1]):ctx.moveTo(p[0],-p[1]));ctx.fill();}
  ctx.setTransform(1,0,0,1,0,0);
  // Street names: one label per street, placed on its nearest piece within view.
  const co=Math.cos(-yaw),si=Math.sin(-yaw),toScreen=(px,pn)=>{const dx=(px-x)*scale,dy=-(pn-n)*scale;return [cx+dx*co-dy*si,cy+dx*si+dy*co];};
  const best=new Map(),R=Math.max(w,h)/scale;for(const piece of this.streets.grid.query(x-R,n-R,x+R,n+R)){const s=this.streets.segments[piece.si],name=this.streets.names[s.street],mx=(piece.a[0]+piece.b[0])/2,mn=(piece.a[1]+piece.b[1])/2,len=Math.hypot(piece.b[0]-piece.a[0],piece.b[1]-piece.a[1]);if(len<25)continue;const d=Math.hypot(mx-x,mn-n);const cur=best.get(name);if(!cur||d<cur.d)best.set(name,{d,piece,mx,mn});}
  ctx.font='600 9px Inter,Arial,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';const placed=[];
  for(const [name,b] of [...best].sort((a,b)=>a[1].d-b[1].d).slice(0,9)){const [sx,sy]=toScreen(b.mx,b.mn);if(sx<10||sx>w-10||sy<10||sy>h-10)continue;if(placed.some(p=>Math.hypot(p[0]-sx,p[1]-sy)<26))continue;placed.push([sx,sy]);const [ax,ay]=toScreen(...b.piece.a),[bx,by]=toScreen(...b.piece.b);let ang=Math.atan2(by-ay,bx-ax);if(ang>Math.PI/2)ang-=Math.PI;if(ang<-Math.PI/2)ang+=Math.PI;ctx.save();ctx.translate(sx,sy);ctx.rotate(ang);ctx.lineWidth=3;ctx.strokeStyle='#0b1418';ctx.strokeText(name,0,0);ctx.fillStyle='#d6e2e6';ctx.fillText(name,0,0);ctx.restore();}
  // Player arrow and north arrow.
  ctx.fillStyle='#e9f3f6';ctx.beginPath();ctx.moveTo(cx,cy-7);ctx.lineTo(cx-5,cy+6);ctx.lineTo(cx,cy+3);ctx.lineTo(cx+5,cy+6);ctx.closePath();ctx.fill();
  const nx=-Math.sin(yaw),ny=-Math.cos(yaw),ox=w-16,oy=16;ctx.strokeStyle='#d6e2e6';ctx.lineWidth=1;ctx.beginPath();ctx.arc(ox,oy,10,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#e0685a';ctx.beginPath();ctx.moveTo(ox+nx*9,oy+ny*9);ctx.lineTo(ox-ny*3.5,oy+nx*3.5);ctx.lineTo(ox+ny*3.5,oy-nx*3.5);ctx.fill();ctx.fillStyle='#d6e2e6';ctx.font='700 8px Inter,Arial';ctx.fillText('N',ox+nx*17>w?ox:ox+nx*0,oy+ny*0+0.5);
  ctx.restore();}
}
