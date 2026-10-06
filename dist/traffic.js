// Shared world positions for rendering and collision detection.
export function trafficCount(level){return level==='none'?0:level==='busy'?18:10;}
export function trafficPose(i,time,position,width){
 const police=i%6===0, direction=i%4===0?-1:1, velocity=direction*(police?15:7+i%3*3);
 const phase=(time+i*2)%40, stopped=!police&&phase>26&&phase<34;
 // Integral of stop intervals prevents cars teleporting when the light changes.
 const cycles=Math.floor((time+i*2)/40), within=(time+i*2)%40;
 const travel=time-Math.max(0,cycles*8+Math.max(0,Math.min(8,within-26))-Math.max(0,i*2-26));
 const z=((i*91+85+(police?time:travel)*velocity-position+30)%1400+1400)%1400-30;
 return {z,x:(direction<0?-1:(i%2?1:0))*width*.52,velocity:stopped?0:velocity,police,direction};
}
