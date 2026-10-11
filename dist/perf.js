// Performance switches (performance pass after Step B). Every fix is on by default; ?perf-off=msaa,matrix,...
// turns named fixes off so each one's effect can be measured on the same build (dist/dev/bench.js).
export const PERF_OFF=new Set(((globalThis.location?.search||'').match(/[?&]perf-off=([a-z0-9,]+)/)||[])[1]?.split(',')||[]);
export const perfOn=k=>!PERF_OFF.has(k)&&!PERF_OFF.has('all');
