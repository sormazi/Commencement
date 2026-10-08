// Livery of the player's car, NYU Campus Safety unit 4: every part is its own decal with its own PNG in
// assets/signage/, like the rest of the signage, so it can be swapped for a better image of the same name.
// Matched to Avi's two reference photos of the NYU Campus Safety electric crossover (side and rear, Oct 2026;
// looked at only, not kept in the repository). Plain lettering only: the NYU torch and the maker's badges on
// the real car are left out.
//
// Fields: id; file; kind 'livery'; size [width, height] in metres; seen (source note); draw(g, w, h, spec)
// renders the fallback (and the PNG, via tools/make-signage.py); placements: side 'right' | 'left' | 'rear' |
// 'rear-window', u = metres back from the front of the car (sides) or h = metres right of centre (rear),
// v = height of the decal centre above the ground, rot = in-plane rotation (radians, counter-clockwise as seen).
export const LIVERY_COLORS={violet:'#57068c',band:'#5b1590',text:'#b3c9d9',phone:'#6c2a96',green:'#4f9a1c',electric:'#2ac32a',white:'#ffffff'};
const C=LIVERY_COLORS,SANS='"Avenir Next", "Montserrat", "Futura", Helvetica, Arial, sans-serif';
// The car's side outline (u back from the nose, v up), shared with the body model so the band is clipped to it.
export const SIDE_PROFILE=[[.1,.22],[0,.4],[-.01,.6],[.03,.77],[.11,.87],[.28,.94],[1.16,1.15],[2.6,1.19],[4.25,1.23],[4.5,1.2],[4.57,1.05],[4.58,.6],[4.52,.3],[4.42,.24]];
export const BAND_SLOPE=.206;// the band rises 0.206 m per metre toward the rear (about 11.6 degrees)
// The violet band in side coordinates: its top edge runs from the tail light down to the front door, its
// lower edge follows the black sill and the rear wheel arch, and it stops short of the white rear corner.
export const BAND=(()=>{const p=[[4.17,1.2],[1.33,.615],[1.3,.43],[3.13,.43]];for(let a=172;a>=34;a-=6){const r=a*Math.PI/180;p.push([3.66+.53*Math.cos(r),.36+.53*Math.sin(r)]);}p.push([4.07,.7]);return p;})();
function text(g,s,{x,y,size,weight=600,color,spacing=0,align='center'}){g.save();g.fillStyle=color;g.font=`${weight} ${size}px ${SANS}`;g.textAlign=align;g.textBaseline='middle';try{g.letterSpacing=spacing+'px';}catch{}g.fillText(s,x,y);g.restore();}
// The plug icon after "100% electric": a curved cord ending in a two-pin plug.
function plug(g,x,y,s,color){g.save();g.strokeStyle=color;g.fillStyle=color;g.lineWidth=s*.13;g.lineCap='round';g.beginPath();g.moveTo(x,y+s*.25);g.quadraticCurveTo(x+s*.45,y+s*.32,x+s*.62,y);g.stroke();
 g.fillRect(x+s*.6,y-s*.22,s*.42,s*.44);g.fillRect(x+s*1.0,y-s*.17,s*.3,s*.1);g.fillRect(x+s*1.0,y+s*.07,s*.3,s*.1);g.restore();}
const band=side=>(g,w,h)=>{g.clearRect(0,0,w,h);const u0=1.25,u1=4.6,v0=.27,v1=1.25,X=u=>side==='right'?(u1-u)/(u1-u0)*w:(u-u0)/(u1-u0)*w,Y=v=>(v1-v)/(v1-v0)*h;
 g.save();g.beginPath();SIDE_PROFILE.forEach(([u,v],i)=>i?g.lineTo(X(u),Y(v)):g.moveTo(X(u),Y(v)));g.closePath();g.clip();
 g.fillStyle=C.band;g.beginPath();BAND.forEach(([u,v],i)=>i?g.lineTo(X(u),Y(v)):g.moveTo(X(u),Y(v)));g.closePath();g.fill();g.restore();};
const SEEN='NYU Campus Safety electric crossover, unit 4: Avi\'s reference photos of the side and rear (Oct 2026), looked at only';
const sides=(u,v,rot=0)=>[{side:'right',u,v,rot:-rot},{side:'left',u,v,rot}];
export const LIVERY=[
 {id:'livery-band-right',file:'assets/signage/livery-band-right.png',kind:'livery',size:[3.35,.98],seen:SEEN,draw:band('right'),placements:[{side:'right',u:2.925,v:.76,rot:0}]},
 {id:'livery-band-left',file:'assets/signage/livery-band-left.png',kind:'livery',size:[3.35,.98],seen:SEEN,draw:band('left'),placements:[{side:'left',u:2.925,v:.76,rot:0}]},
 {id:'livery-campus-safety',file:'assets/signage/livery-campus-safety.png',kind:'livery',size:[2.15,.2],seen:SEEN,
  draw:(g,w,h)=>{g.clearRect(0,0,w,h);text(g,'CAMPUS SAFETY',{x:w/2,y:h*.54,size:h*.86,weight:600,color:C.text,spacing:h*.1});},placements:sides(2.42,.665,BAND_SLOPE)},
 {id:'livery-phone-side',file:'assets/signage/livery-phone-side.png',kind:'livery',size:[1.0,.12],seen:SEEN+'; the real Campus Safety number',
  draw:(g,w,h)=>{g.clearRect(0,0,w,h);text(g,'212-998-2222',{x:w/2,y:h*.54,size:h*.95,weight:700,color:C.phone});},placements:sides(1.93,.80,BAND_SLOPE)},
 {id:'livery-nyu-side',file:'assets/signage/livery-nyu-side.png',kind:'livery',size:[.3,.09],seen:SEEN+'; the torch square beside it is left out',
  draw:(g,w,h)=>{g.clearRect(0,0,w,h);text(g,'NYU',{x:w/2,y:h*.55,size:h*.92,weight:600,color:C.white});},placements:sides(2.96,.59)},
 {id:'livery-unit-4',file:'assets/signage/livery-unit-4.png',kind:'livery',size:[.34,.46],seen:SEEN+'; unit number on both rear quarters and the tailgate',
  draw:(g,w,h)=>{g.clearRect(0,0,w,h);text(g,'4',{x:w/2,y:h*.56,size:h*1.12,weight:800,color:C.green});},
  placements:[...sides(4.33,.8),{side:'rear',h:.5,v:.84,rot:0,scale:.66}]},
 {id:'livery-electric',file:'assets/signage/livery-electric.png',kind:'livery',size:[.62,.085],seen:SEEN+'; on both front wings and the rear window',
  draw:(g,w,h)=>{g.clearRect(0,0,w,h);g.save();g.font=`600 ${h*.84}px ${SANS}`;const t='100% electric',tw=g.measureText(t).width,s=h*.62,x0=(w-tw-s*1.5)/2;g.restore();
   text(g,t,{x:x0,y:h*.52,size:h*.84,weight:600,color:C.electric,align:'left'});plug(g,x0+tw+s*.1,h*.5,s,C.electric);},
  placements:[...sides(.94,1.04),{side:'rear-window',h:0,v:1.43,rot:0,scale:.75}]},
 {id:'livery-tailgate-strip',file:'assets/signage/livery-tailgate-strip.png',kind:'livery',size:[1.26,.085],seen:SEEN+'; the maker\'s badge in the middle of the strip is left out',
  draw:(g,w,h)=>{g.fillStyle=C.violet;g.fillRect(0,0,w,h);text(g,'CAMPUS',{x:w*.3,y:h*.54,size:h*.72,weight:600,color:C.white,spacing:h*.06});text(g,'SAFETY',{x:w*.7,y:h*.54,size:h*.72,weight:600,color:C.white,spacing:h*.06});},
  placements:[{side:'rear',h:0,v:.965,rot:0}]},
 {id:'livery-phone-rear',file:'assets/signage/livery-phone-rear.png',kind:'livery',size:[.68,.095],seen:SEEN,
  draw:(g,w,h)=>{g.clearRect(0,0,w,h);text(g,'212-998-2222',{x:w/2,y:h*.54,size:h*.95,weight:700,color:C.phone});},placements:[{side:'rear',h:-.02,v:.76,rot:0}]},
 {id:'livery-nyu-rear',file:'assets/signage/livery-nyu-rear.png',kind:'livery',size:[.075,.105],seen:SEEN+'; plain lettering on violet, no torch',
  draw:(g,w,h)=>{g.fillStyle=C.violet;g.fillRect(0,0,w,h);text(g,'NYU',{x:w/2,y:h*.72,size:h*.3,weight:700,color:C.white});},placements:[{side:'rear',h:-.6,v:.87,rot:0}]},
];
export function liveryPixels(size){const k=Math.min(600,2048/Math.max(...size));return [Math.max(8,Math.round(size[0]*k)),Math.max(8,Math.round(size[1]*k))];}
