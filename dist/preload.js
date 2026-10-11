// Asset tracking for the opening: the title card stays up until every image the first view needs has
// arrived (signage and livery PNGs, the branding slot), so the game starts without pop-in.
const state={pending:0,done:0};
export function trackImage(img){state.pending++;const fin=()=>{state.pending--;state.done++;};img.addEventListener('load',fin,{once:true});img.addEventListener('error',fin,{once:true});return img;}
export const assetState=()=>({...state});
// Any other promise the opening should wait for (the 2026 soundtrack file, so the music can rise on the click).
export function trackPromise(pr){state.pending++;const fin=()=>{state.pending--;state.done++;};pr.then(fin,fin);return pr;}
