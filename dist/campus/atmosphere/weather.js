import * as T from '../../vendor/three.module.js';
import {DECAY} from './decay.js?v=24';
import {WIND,WIND_DIR} from './foliage.js?v=24';
import {SNOW_COVER} from './snow.js?v=24';
// Live New York weather (Step B). The weather follows the real current weather at Washington Square, the
// way the light follows the real time. Data: Open-Meteo (open-meteo.com, CC BY 4.0), with the US National
// Weather Service's Central Park station (api.weather.gov, KNYC, public domain) as a fallback. Refreshed
// every 12 minutes; every change glides in over about a minute. The game never waits for it: until data
// arrives, and silently if both sources fail, the sky is a plain overcast.
// Options > Weather picks Live NYC weather (default) or a fixed sky; ?weather=clear|overcast|rain|heavyrain|
// snow|fog|storm|live in the URL overrides, like ?time=.
export const WASHINGTON_SQ={lat:40.7308,lon:-73.9973};
// One weather state. All 0..1 except temp (C), windMs (m/s), windFrom (degrees, where the wind comes from).
const STATE0={cloud:.75,rain:0,snow:0,fog:0,storm:0,windMs:3,windFrom:270,temp:12,wet:0,snowCover:0};
export const MANUAL={
 clear:{cloud:.05,rain:0,snow:0,fog:0,storm:0,windMs:3,windFrom:290,temp:18,wet:0,snowCover:0,label:'Clear'},
 overcast:{cloud:.95,rain:0,snow:0,fog:.05,storm:0,windMs:4,windFrom:60,temp:10,wet:.1,snowCover:0,label:'Overcast'},
 rain:{cloud:1,rain:.45,snow:0,fog:.15,storm:0,windMs:5,windFrom:80,temp:9,wet:.7,snowCover:0,label:'Rain'},
 heavyrain:{cloud:1,rain:1,snow:0,fog:.3,storm:0,windMs:9,windFrom:100,temp:11,wet:1,snowCover:0,label:'Heavy rain'},
 snow:{cloud:1,rain:0,snow:.55,fog:.25,storm:0,windMs:4,windFrom:20,temp:-2,wet:.2,snowCover:.8,label:'Snow'},
 fog:{cloud:.9,rain:0,snow:0,fog:1,storm:0,windMs:1,windFrom:180,temp:8,wet:.35,snowCover:0,label:'Fog'},
 storm:{cloud:1,rain:.9,snow:0,fog:.2,storm:1,windMs:13,windFrom:250,temp:22,wet:1,snowCover:0,label:'Thunderstorm'}};
// WMO weather codes (Open-Meteo) to intensities.
export function fromCode(code){const c=code|0;
 if(c===0)return {cloud:.05};if(c===1)return {cloud:.25};if(c===2)return {cloud:.55};if(c===3)return {cloud:.95};
 if(c===45||c===48)return {cloud:.9,fog:.9};
 if(c>=51&&c<=55)return {cloud:1,rain:[.12,.2,.3][(c-51)/2|0],fog:.1};if(c===56||c===57)return {cloud:1,rain:.2,fog:.1};
 if(c>=61&&c<=65)return {cloud:1,rain:[.35,.6,.95][(c-61)/2|0]};if(c===66||c===67)return {cloud:1,rain:c===66?.35:.8};
 if(c>=71&&c<=75)return {cloud:1,snow:[.3,.6,.95][(c-71)/2|0],fog:.15};if(c===77)return {cloud:1,snow:.2};
 if(c>=80&&c<=82)return {cloud:.85,rain:[.4,.7,1][c-80]};if(c===85||c===86)return {cloud:.9,snow:c===85?.45:.9};
 if(c>=95)return {cloud:1,rain:c===95?.7:.95,storm:1};return {cloud:.6};}
export function describe(s){const parts=[];if(s.storm>.5)parts.push('thunderstorm');else if(s.rain>.75)parts.push('heavy rain');else if(s.rain>.3)parts.push('rain');else if(s.rain>.05)parts.push('drizzle');
 if(s.snow>.6)parts.push('heavy snow');else if(s.snow>.05)parts.push('snow');if(s.fog>.5)parts.push('fog');else if(s.fog>.2)parts.push('mist');
 if(!parts.length)parts.push(s.cloud>.85?'overcast':s.cloud>.45?'partly cloudy':s.cloud>.15?'mostly clear':'clear');
 return parts.join(', ')+`, ${Math.round(s.temp)}°C`+(s.windMs>8?', windy':'');}
async function getJSON(url,ms=8000){const ac=new AbortController(),t=setTimeout(()=>ac.abort(),ms);try{const r=await fetch(url,{signal:ac.signal,headers:{Accept:'application/json, application/geo+json'}});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json();}finally{clearTimeout(t);}}
export async function fetchOpenMeteo({lat,lon}=WASHINGTON_SQ){
 const u=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,rain,snowfall,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,visibility&hourly=precipitation,snowfall,snow_depth&past_hours=6&forecast_hours=1&wind_speed_unit=ms&timezone=America%2FNew_York`;
 const d=await getJSON(u),c=d.current,s={...STATE0,...fromCode(c.weather_code)};
 s.cloud=Math.max(s.cloud,(c.cloud_cover??s.cloud*100)/100*(s.rain||s.snow?1:.95));s.temp=c.temperature_2m;s.windMs=c.wind_speed_10m;s.windFrom=c.wind_direction_10m;
 if(c.visibility!=null&&c.visibility<5000)s.fog=Math.max(s.fog,Math.min(1,(5000-c.visibility)/4500));
 // Snow falling as rain codes at the freezing line: trust the temperature.
 if(s.rain>0&&c.temperature_2m<-.5&&c.snowfall>0){s.snow=s.rain;s.rain=0;}
 // Ground: wet from the last six hours of rain (recent hours count more); snow cover from the snow depth.
 const pr=d.hourly?.precipitation||[],sd=d.hourly?.snow_depth||[];let w=0;pr.forEach((p,i)=>{w+=(p||0)*Math.pow(.6,pr.length-1-i);});
 s.wet=Math.min(1,Math.max(s.rain*.9,w/1.5));const depth=sd.filter(x=>x!=null).pop()||0;s.snowCover=Math.min(1,Math.max(depth/.04,s.snow>.3?.3:0));
 return {state:s,source:'Open-Meteo'};}
export async function fetchNWS(){const d=await getJSON('https://api.weather.gov/stations/KNYC/observations/latest'),p=d.properties,s={...STATE0};
 const amt=(p.cloudLayers||[]).map(l=>({CLR:0,SKC:0,FEW:.2,SCT:.45,BKN:.75,OVC:1,VV:1}[l.amount]??.5));s.cloud=amt.length?Math.max(...amt):.6;
 for(const w of p.presentWeather||[]){const k=w.intensity==='heavy'?.95:w.intensity==='light'?.3:.6;
  if(/rain|drizzle|showers/.test(w.weather))s.rain=Math.max(s.rain,w.weather==='drizzle'?k*.4:k);if(/snow|ice/.test(w.weather))s.snow=Math.max(s.snow,k);
  if(/fog|mist|haze/.test(w.weather))s.fog=Math.max(s.fog,w.weather==='fog_mist'?.5:.8);if(/thunder/.test(w.weather)){s.storm=1;s.rain=Math.max(s.rain,.7);}}
 if(p.temperature?.value!=null)s.temp=p.temperature.value;if(p.windSpeed?.value!=null)s.windMs=p.windSpeed.value/3.6;if(p.windDirection?.value!=null)s.windFrom=p.windDirection.value;
 if(p.visibility?.value!=null&&p.visibility.value<5000)s.fog=Math.max(s.fog,Math.min(1,(5000-p.visibility.value)/4500));
 s.wet=s.rain>0?.8:.1;s.snowCover=s.snow>.3?.4:0;return {state:s,source:'National Weather Service'};}
// The live controller.
export class Weather{
 constructor({search=globalThis.location?.search||'',choice='live',fetchers=[fetchOpenMeteo,fetchNWS],now=()=>Date.now()}={}){
  this.fetchers=fetchers;this.now=now;this.cur={...STATE0};this.target={...STATE0};this.source=null;this.fetchedAt=0;this.failed=false;this.nextAt=0;this.busy=false;this.lightning='normal';this.born=now();this.flash=0;this.nextFlash=0;this.flashT=-1;
  const u=(search.match(/[?&]weather=([a-z]+)/)||[])[1];this.urlChoice=u&&(u==='live'||MANUAL[u])?u:null;this.set(this.urlChoice||choice);this.snap();}
 // Jump straight to the target (at load and when live data first arrives); later changes glide.
 snap(){this.cur={...this.target};}
 set(choice,{snap=false}={}){this.choice=choice==='live'||MANUAL[choice]?choice:'live';if(this.choice!=='live'){const m=MANUAL[this.choice];this.target={...m};delete this.target.label;}else{this.nextAt=0;if(this.live)this.target={...this.live};}if(snap)this.snap();}
 // Called every frame. dt seconds. Starts a fetch when one is due (never awaited by the game).
 update(dt){const t=this.now();if(this.choice==='live'&&!this.busy&&t>=this.nextAt)this.refresh();
  // Glide: a minute for the sky, a little faster for rain starting and stopping; wetness dries slowly.
  const k=1-Math.exp(-Math.min(dt,.5)/20),kr=1-Math.exp(-Math.min(dt,.5)/8);
  for(const n of ['cloud','fog','storm','windMs','temp','snowCover'])this.cur[n]+=(this.target[n]-this.cur[n])*k;
  for(const n of ['rain','snow'])this.cur[n]+=(this.target[n]-this.cur[n])*kr;
  const wantWet=Math.max(this.target.wet,this.cur.rain*.95);this.cur.wet+=(wantWet-this.cur.wet)*(wantWet>this.cur.wet?kr:1-Math.exp(-Math.min(dt,.5)/240));
  let dw=((this.target.windFrom-this.cur.windFrom+540)%360)-180;this.cur.windFrom=(this.cur.windFrom+dw*k+360)%360;
  WIND.value=Math.min(1,.12+this.cur.windMs/15);const to=(this.cur.windFrom+180)*Math.PI/180;WIND_DIR.value.set(Math.sin(to),-Math.cos(to));// x east, z = -north
  this.updateLightning(dt);}
 async refresh(){this.busy=true;for(const f of this.fetchers){try{const r=await f();const first=!this.fetchedAt;this.live=r.state;this.source=r.source;this.fetchedAt=this.now();this.failed=false;if(this.choice==='live'){this.target={...r.state};if(first&&this.now()-this.born<20000)this.snap();}break;}catch(e){this.failed=true;}}
  this.busy=false;this.nextAt=this.now()+(this.failed&&!this.fetchedAt?3*60e3:12*60e3);}
 // Lightning, photosensitivity-safe: single soft flashes (a 0.1 s rise and a 0.6 s fall, never a strobe),
 // at least 7 s apart and usually 10 to 30 s; Soft keeps only a gentle sky glow; Off removes them.
 updateLightning(dt){const s=this.cur.storm;this.flashT+=dt;if(this.lightning==='off'||s<.3){this.flash=0;return;}
  if(this.flashT>this.nextFlash){this.flashT=0;this.nextFlash=7+Math.random()*23/Math.max(.4,s);}
  const x=this.flashT,f=x<.1?x/.1:Math.exp(-(x-.1)/.25);this.flash=x<3?f*s*(this.lightning==='soft'?.3:1):0;}
 info(){return {choice:this.choice,source:this.source,fetchedAt:this.fetchedAt,failed:this.failed,state:{...this.cur},text:describe(this.cur)};}
 // Apply to the renderer after the sky has set its values for this frame (so nothing accumulates).
 apply(r){const s=this.cur,c=s.cloud,decay=DECAY.value,fog=r.scene.fog;
  const night=r.postMat.uniforms.uNight.value;
  r.sun.intensity*=1-.9*c;r.hemi.intensity*=1+.2*c-.15*s.rain;
  const grey=(col,amt,dark)=>{const l=col.r*.2126+col.g*.7152+col.b*.0722;col.r+=(l-col.r)*amt;col.g+=(l-col.g)*amt;col.b+=(l-col.b)*amt;col.multiplyScalar(dark);};
  if(r.scene.background?.isColor)grey(r.scene.background,.6*c,1-.22*c-.25*s.rain);grey(fog.color,.5*c,1-.18*c-.2*s.rain);
  // Snow brightens the haze by day; fog thickens the haze and the low layer.
  if(s.fog>0&&night<.5){fog.color.lerp(new T.Color(.7,.72,.74),.35*s.fog);if(r.scene.background?.isColor)r.scene.background.lerp(new T.Color(.68,.7,.72),.5*s.fog);}
  if(s.snow>0){const w=s.snow*.5*(1-night);fog.color.lerp(new T.Color(.78,.8,.84),w);if(r.scene.background?.isColor)r.scene.background.lerp(new T.Color(.74,.76,.8),w);}
  // Night haze is already thick (sky.js), so rain and snow add less of it after dark.
  fog.density*=1+(.9*s.rain+1.2*s.snow)*(1-.65*night)+7*s.fog*(1-.55*night)+.35*decay;if('height' in fog)fog.height*=1+1.5*s.rain+1.5*s.snow+5*s.fog+.6*decay;
  // 2126 haze on top: an olive cast in the air.
  if(decay>0){fog.color.lerp(new T.Color(.42,.44,.34).multiplyScalar(night>.5?.15:1),.18*decay);}
  // Overcast nights in Manhattan are not darker: low cloud reflects the city's light back down as a dull
  // orange glow. Not in 2126, when the city's lights are out.
  {const glow=night*c*(1-decay);if(glow>.01){r.hemi.intensity+=.32*glow;r.hemi.color.lerp(new T.Color(.62,.5,.4),.6*glow);if(r.scene.background?.isColor)r.scene.background.lerp(new T.Color(.075,.06,.05),.8*glow);fog.color.lerp(new T.Color(.07,.058,.05),.6*glow);}}
  r.postMat.uniforms.desat.value=Math.min(1,r.postMat.uniforms.desat.value+.12*c+.1*s.rain);
  r.renderer.toneMappingExposure*=1-.1*s.rain-.05*c;
  if(this.flash>0){const f=this.flash;r.hemi.intensity+=3.2*f;r.hemi.color.lerp(new T.Color(.75,.8,1),Math.min(1,f));if(r.scene.background?.isColor)r.scene.background.lerp(new T.Color(.55,.58,.72),Math.min(.8,f*.8));r.renderer.toneMappingExposure*=1+.35*f;}
  r.weatherWet=s.wet*(1-.7*s.snowCover);r.weatherRain=s.rain;SNOW_COVER.value=s.snowCover;}}
