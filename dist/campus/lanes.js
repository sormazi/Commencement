// Bike and bus lanes on the roadway (roads survey (b)), from data/street-lanes.js (tools/build-street-lanes.mjs).
// Each lane is drawn as flat road-marking pieces between its 3 m samples, using the shared 'stripe' instances:
// protected lanes green with a white line on the traffic side and a buffer line beyond; painted lanes as two
// white lines (a third for a buffer); green skip-dashes where any bike lane crosses an intersection; red bus
// lanes stop at intersections. Colours multiply the stripe material's off-white (0xe9e7df).
import {STREET_LANES} from './data/street-lanes.js?v=24';
export const LANE_COLORS={green:[.34,.6,.4],red:[.7,.28,.24]};
// Marking pieces: [a, b, width, colour name or null for white]; a and b are [east, north] map points.
export function laneMarks(lanes=STREET_LANES){const out=[];
 for(const l of lanes){const P=l.pts;
  for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.5||L>6)continue;
   const t=[(b[0]-a[0])/L,(b[1]-a[1])/L],u=[-t[1],t[0]];// u: across the lane
   // Which side of the lane is the traffic side: the samples were offset from the street centreline towards the
   // curb, so the traffic side is the one facing the centre of the street (stored as the sign of 'side' below).
   const s=l.side||1,off=(p,d)=>[p[0]+u[0]*d*s,p[1]+u[1]*d*s];
   const x=a[2]&&b[2];
   if(l.kind==='bus'){if(!x)out.push([a,b,l.w,'red']);continue;}
   if(x){// green skip marking through the intersection: 1.5 m on, 1.5 m off
    if(i%2)out.push([a,[a[0]+t[0]*Math.min(1.5,L),a[1]+t[1]*Math.min(1.5,L)],l.w,'green']);continue;}
   const h=l.w/2;
   if(l.style==='protected')out.push([a,b,l.w,'green']);else out.push([off(a,-h),off(b,-h),.15,null]);
   out.push([off(a,h),off(b,h),.15,null]);
   if(l.buffer)out.push([off(a,h+l.buffer),off(b,h+l.buffer),.15,null]);}}
 return out;}
