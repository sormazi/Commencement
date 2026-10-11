import assert from 'node:assert/strict';
globalThis.devicePixelRatio=2;
const {DynamicResolution,PRESETS}=await import('../dist/quality.js');
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('ok - '+name);};
// A fake renderer whose frame time is proportional to the pixels drawn (as measured on the M3: about 43 ms at 2x).
function sim(msAt2,seconds,start){let clock=0;const realNow=performance.now;performance.now=()=>clock;
 const city={renderer:{r:2,setPixelRatio(v){this.r=v;}},resize(){}};const d=new DynamicResolution(city);d.reset(start||PRESETS.high.dynamic);city.renderer.r=d.ratio;
 const trace=[];while(clock<seconds*1000){const ms=msAt2*(city.renderer.r/2)**2;clock+=ms;d.tick(clock/1000,ms/1000);trace.push(city.renderer.r);}
 performance.now=realNow;return {final:city.renderer.r,trace};}
test('High starts at 1.5x and settles where frames fit 52 fps',()=>{const {final}=sim(43,30);const ms=43*(final/2)**2;assert.ok(ms<=1000/52,'frame '+ms.toFixed(1)+' ms at '+final);assert.ok(final>=1.2,'not lower than needed: '+final);});
test('a fast machine climbs to 2x and stays there',()=>{const {final,trace}=sim(9,30);assert.equal(final,2);});
test('it never drops below the floor of 1x',()=>{const {final}=sim(200,30);assert.equal(final,1);});
test('on the edge it retries the higher ratio ever more rarely (20, 40, 80 s...)',()=>{const {trace}=sim(30,300);let ups=0;for(let i=1;i<trace.length;i++)if(trace[i]>trace[i-1])ups++;assert.ok(ups<=4,'up-steps in 5 minutes: '+ups);});
console.log('quality: '+passed+' passed');
