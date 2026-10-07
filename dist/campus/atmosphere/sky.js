// Real New York time of day for Washington Square. Everything here is computed locally: the clock comes
// from the browser's Intl time-zone data (so daylight saving is handled whatever zone the player is in),
// the sun from NOAA's solar position equations (Meeus, as used in the NOAA Solar Calculator), and the moon
// from a standard low-precision series (about a degree, plenty for a disc in the sky). No network calls.
// Pure functions only, no three.js, so the tests can run them in Node.
export const WSP={lat:40.7308,lon:-73.9973};// Washington Square Park
export const TZ='America/New_York';
const rad=Math.PI/180,deg=180/Math.PI,clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
let fmt=null;
// Wall-clock parts of an instant in New York.
export function nyParts(date){fmt??=new Intl.DateTimeFormat('en-US',{timeZone:TZ,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'});
 const o={};for(const p of fmt.formatToParts(date))if(p.type!=='literal')o[p.type]=+p.value;return {y:o.year,m:o.month,d:o.day,hh:o.hour%24,mm:o.minute,ss:o.second};}
// Minutes New York is ahead of UTC at that instant: -300 (EST) or -240 (EDT).
export function nyOffset(date){const p=nyParts(date);return Math.round((Date.UTC(p.y,p.m-1,p.d,p.hh,p.mm,p.ss)-Math.floor(date.getTime()/1000)*1000)/60000);}
// The instant at which New York's clocks read y-m-d hh:mm. Two passes settle the offset across a DST change.
export function nyDate(y,m,d,hh=0,mm=0,ss=0){const wall=Date.UTC(y,m-1,d,hh,mm,ss);let t=wall-nyOffset(new Date(wall))*60000;t=wall-nyOffset(new Date(t))*60000;return new Date(t);}
// NOAA solar position. Returns degrees: elevation (with refraction), geometric elevation, azimuth from true north, clockwise.
export function sunPosition(date,lat=WSP.lat,lon=WSP.lon){const jd=date.getTime()/86400000+2440587.5,T=(jd-2451545)/36525;
 const L0=((280.46646+T*(36000.76983+T*.0003032))%360+360)%360,M=357.52911+T*(35999.05029-.0001537*T),e=.016708634-T*(.000042037+.0000001267*T);
 const C=Math.sin(M*rad)*(1.914602-T*(.004817+.000014*T))+Math.sin(2*M*rad)*(.019993-.000101*T)+Math.sin(3*M*rad)*.000289;
 const om=125.04-1934.136*T,lambda=L0+C-.00569-.00478*Math.sin(om*rad);
 const eps=23+(26+(21.448-T*(46.815+T*(.00059-T*.001813)))/60)/60+.00256*Math.cos(om*rad);
 const decl=Math.asin(Math.sin(eps*rad)*Math.sin(lambda*rad));
 const y=Math.tan(eps*rad/2)**2,eqt=4*deg*(y*Math.sin(2*L0*rad)-2*e*Math.sin(M*rad)+4*e*y*Math.sin(M*rad)*Math.cos(2*L0*rad)-.5*y*y*Math.sin(4*L0*rad)-1.25*e*e*Math.sin(2*M*rad));
 const utcMin=((date.getTime()%86400000)+86400000)%86400000/60000;let tst=(utcMin+eqt+4*lon)%1440;if(tst<0)tst+=1440;
 const ha=(tst/4<0?tst/4+180:tst/4-180)*rad,phi=lat*rad;
 const cz=clamp(Math.sin(phi)*Math.sin(decl)+Math.cos(phi)*Math.cos(decl)*Math.cos(ha),-1,1),geo=90-Math.acos(cz)*deg;
 let ref=0;if(geo<=85){const te=Math.tan(geo*rad);ref=geo>5?58.1/te-.07/te**3+.000086/te**5:geo>-.575?1735+geo*(-518.2+geo*(103.4+geo*(-12.79+geo*.711))):-20.772/te;ref/=3600;}
 let az=Math.atan2(Math.sin(ha),Math.cos(ha)*Math.sin(phi)-Math.tan(decl)*Math.cos(phi))*deg+180;az=(az+360)%360;
 return {elevation:geo+ref,geometric:geo,azimuth:az,declination:decl*deg,eqTime:eqt,lambda};}
// Sunrise and sunset for a New York calendar date, as Date instants (upper limb at the horizon with standard
// refraction, zenith 90.833 degrees, the definition used by NOAA, USNO and timeanddate). Found by scanning the
// local day in 10-minute steps and bisecting each crossing, so it shares one solar model with the lighting.
export function sunTimes(y,m,d,lat=WSP.lat,lon=WSP.lon){const start=nyDate(y,m,d).getTime(),end=nyDate(y,m,d+1).getTime(),f=t=>sunPosition(new Date(t),lat,lon).geometric+.833;
 const out={sunrise:null,sunset:null};let t0=start,v0=f(t0);for(let t=start+600000;t<=end;t+=600000){const v=f(t);if((v0<0)!==(v<0)){let a=t0,b=t,fa=v0;for(let i=0;i<30;i++){const c=(a+b)/2,fc=f(c);if((fa<0)===(fc<0)){a=c;fa=fc;}else b=c;}out[v0<0?'sunrise':'sunset']=new Date((a+b)/2);}t0=t;v0=v;}return out;}
// Low-precision moon: azimuth/altitude in degrees, illuminated fraction 0..1, waxing flag.
export function moonPosition(date,lat=WSP.lat,lon=WSP.lon){const dd=date.getTime()/86400000+2440587.5-2451545;
 const L=(218.316+13.176396*dd)*rad,M=(134.963+13.064993*dd)*rad,F=(93.272+13.22935*dd)*rad,l=L+6.289*rad*Math.sin(M),b=5.128*rad*Math.sin(F),e=23.4397*rad;
 const ra=Math.atan2(Math.sin(l)*Math.cos(e)-Math.tan(b)*Math.sin(e),Math.cos(l)),dec=Math.asin(Math.sin(b)*Math.cos(e)+Math.cos(b)*Math.sin(e)*Math.sin(l));
 const H=(280.16+360.9856235*dd)*rad+lon*rad-ra,phi=lat*rad;
 const alt=Math.asin(Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(H));
 let az=Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(phi)-Math.tan(dec)*Math.cos(phi))*deg+180;az=(az+360)%360;
 const sunLon=sunPosition(date,lat,lon).lambda*rad,dl=((l-sunLon)%(2*Math.PI)+2*Math.PI)%(2*Math.PI),elong=Math.acos(Math.cos(b)*Math.cos(l-sunLon));
 return {altitude:alt*deg,azimuth:az,illumination:(1-Math.cos(elong))/2,waxing:dl<Math.PI,age:dl/(2*Math.PI)*29.53};}
// Look keyframes by sun elevation. Night is the existing "Dead of night" preset exactly; the day is deliberately
// hazy and washed out (pale grey-green haze, desaturated, soft sun) so the abandoned campus never looks cheerful.
// sun = light intensity, bg = sky/background, fog/density = FogExp2, hemi = sky/ground fill, desat = post grade,
// lamps = surviving street lamps lit, cards = low ground-fog cards.
export const KEYS=[
 {e:-12,sun:.2,sunC:0x9fb4d6,bg:0x05070c,fog:0x0a0e15,density:.021,hemi:.24,sky:0x3c4a64,ground:0x15130f,exposure:1.0,desat:0,cards:1},
 {e:-6,sun:.2,sunC:0x9fb4d6,bg:0x151b29,fog:0x1a2130,density:.016,hemi:.5,sky:0x4d5872,ground:0x1b1915,exposure:1.0,desat:.05,cards:.85},
 {e:-1,sun:.5,sunC:0xff9d66,bg:0x5d5866,fog:0x5f5a63,density:.0105,hemi:.85,sky:0x8f8792,ground:0x372f28,exposure:1.02,desat:.15,cards:.45},
 {e:6,sun:2.1,sunC:0xffc890,bg:0x9f9583,fog:0x9a9282,density:.0078,hemi:.9,sky:0xbbb4a2,ground:0x4a4336,exposure:1.03,desat:.25,cards:.18},
 {e:20,sun:3.0,sunC:0xf3e6d0,bg:0xa1a6a2,fog:0xa0a5a1,density:.0058,hemi:.95,sky:0xc0c6c2,ground:0x524b3f,exposure:1.03,desat:.33,cards:.06},
 {e:50,sun:3.2,sunC:0xf6efe2,bg:0xaab0ad,fog:0xa9afac,density:.005,hemi:1.0,sky:0xc8cecb,ground:0x564f43,exposure:1.03,desat:.35,cards:.04}];
const COLORS=['sunC','bg','fog','sky','ground'];
const lerpHex=(a,b,t)=>{let o=0;for(const s of [16,8,0]){const x=(a>>s)&255,y=(b>>s)&255;o|=Math.round(x+(y-x)*t)<<s;}return o;};
export function lookAt(elev){let i=0;while(i<KEYS.length-2&&elev>KEYS[i+1].e)i++;const a=KEYS[i],b=KEYS[i+1],t=clamp((elev-a.e)/(b.e-a.e),0,1),o={};
 for(const k in a){if(k==='e')continue;o[k]=COLORS.includes(k)?lerpHex(a[k],b[k],t):a[k]+(b[k]-a[k])*t;}
 // Lamps switch on through dusk (sun from +2 down to -4 degrees) and off again through dawn.
 o.lamps=smooth(2,-4,elev);return o;}
// Unit vector (map frame: x east, y up, n north) toward an azimuth/elevation.
export function dirFrom(az,el){return {x:Math.sin(az*rad)*Math.cos(el*rad),y:Math.sin(el*rad),n:Math.cos(az*rad)*Math.cos(el*rad)};}
// Everything the renderer needs at an instant.
export function skyAt(date){const s=sunPosition(date),mo=moonPosition(date),look=lookAt(s.elevation);
 // Below the horizon the key light becomes moonlight (from the moon if it is up, otherwise a dim sky glow from high in the south).
 const sunUp=s.elevation>-.5,moonUp=mo.altitude>2;
 const light=sunUp?dirFrom(s.azimuth,Math.max(s.elevation,1.5)):moonUp?dirFrom(mo.azimuth,Math.max(mo.altitude,8)):dirFrom(200,55);
 if(!sunUp)look.sun*=moonUp?.55+.75*mo.illumination:.6;
 return {date,ny:nyParts(date),offset:nyOffset(date),sun:s,moon:mo,look,light,shadows:s.elevation>.5};}
// Clock: real now, or a preview from the URL (?time=19:30, ?date=2026-12-21, ?speed=60 for a time-lapse).
// A previewed time holds still unless ?speed is given; the real clock always runs at real speed.
export function makeClock(search='',now=()=>new Date()){const q=new URLSearchParams(search),time=q.get('time'),date=q.get('date'),speed=+q.get('speed')||0;
 if(!time&&!date&&!speed)return {preview:false,now};
 const today=nyParts(now()),[y,m,d]=date&&/^\d{4}-\d{1,2}-\d{1,2}$/.test(date)?date.split('-').map(Number):[today.y,today.m,today.d];
 const [hh,mm]=time&&/^\d{1,2}:\d{2}$/.test(time)?time.split(':').map(Number):[today.hh,today.mm];
 const start=nyDate(y,m,d,hh,mm).getTime(),t0=now().getTime(),rate=speed||0;
 return {preview:true,now:()=>new Date(start+(now().getTime()-t0)*rate)};}
// Short human description for the options screen.
export function describe(sky){const p=sky.ny,h=p.hh%12||12,ap=p.hh<12?'am':'pm',dirs=['N','NE','E','SE','S','SW','W','NW'],e=sky.sun.elevation;
 const phase=e>6?'day':e>-.833?(Math.abs(e)<1.5?(p.hh<12?'sunrise':'sunset'):'golden hour'):e>-6?(p.hh<12?'dawn':'dusk'):e>-12?'twilight':'night';
 return `New York ${h}:${String(p.mm).padStart(2,'0')} ${ap} ${sky.offset===-240?'EDT':'EST'} · ${phase} · sun ${e.toFixed(0)}° ${dirs[Math.round(sky.sun.azimuth/45)%8]}`;}
