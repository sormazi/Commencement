// Browser storage for Commencement. Every key lives under the "commencement." prefix. The game was called
// NightView until October 2026; migrateStorage() moves anything saved under the old "nightview." prefix
// (the FPS counter today, and any future progress such as whether the 2026 to 2126 shift has happened)
// to the new prefix once, without overwriting a newer value, then removes the old key.
const PREFIX='commencement.',OLD=['nightview.','nightView.','NightView.'];
export function migrateStorage(ls=globalThis.localStorage){try{if(!ls)return 0;let moved=0;const keys=[];for(let i=0;i<ls.length;i++)keys.push(ls.key(i));
 for(const k of keys){const old=OLD.find(p=>k&&k.startsWith(p));if(!old)continue;const nk=PREFIX+k.slice(old.length);if(ls.getItem(nk)===null)ls.setItem(nk,ls.getItem(k));ls.removeItem(k);moved++;}return moved;}catch{return 0;}}
export const store={get(k){try{return localStorage.getItem(PREFIX+k);}catch{return null;}},set(k,v){try{localStorage.setItem(PREFIX+k,v);}catch{}}};
