// Signage manifest: every flag, banner, sign and plaque in the Washington Square world is a separate decal
// with its own texture file in assets/signage/. To swap in your own image, replace the PNG with one of the
// same name (any size; keep the aspect ratio of `size`). Nothing here reproduces logo artwork: NYU appears
// as plain lettering on NYU violet, businesses as their names in a matching colour and lettering style.
//
// Fields: id; file; kind (pole-banner, flag, sign, plaque); size [width, height] in metres; the fallback
// drawing (bg, fg, lines of text, font) used until the PNG loads or if it is missing; seen (where and when
// it was observed on Street View; imagery date); placements: p [map x, map n] of the decal's centre,
// y = height of its bottom edge above the curb, normal = map direction the front faces, and where (words).
import {STOREFRONTS} from '../../campus/storefronts/index.js?v=23';
import {signDecal,resolveStorefronts} from '../../campus/storefronts.js?v=23';
import data from '../../campus/data/campus-data.js?v=23';
const FIXED=[
 {id:'nyu-pole-banner-violet',file:'assets/signage/nyu-pole-banner-violet.png',kind:'pole-banner',size:[.6,1.5],bg:'#57068c',fg:'#ffffff',lines:['NYU'],font:'sans-bold',
  seen:'Washington Sq W, building side, on the second lamp post north of W 4th St (Street View at 43 MacDougal St, May 2026)',
  placements:[{p:[-177.46,39.18],y:3.3,normal:[.542,.84],where:'Washington Sq W lamp post, west side, between Washington Pl and Waverly Pl'}]},
 {id:'nyu-pole-banner-white',file:'assets/signage/nyu-pole-banner-white.png',kind:'pole-banner',size:[.6,1.5],bg:'#ffffff',fg:'#57068c',lines:['NYU'],font:'sans-bold',
  seen:'Washington Sq W, building side, on the first lamp post north of W 4th St, below the park banner (May 2026)',
  placements:[{p:[-197.16,9.18],y:3.3,normal:[.542,.84],where:'Washington Sq W lamp post, west side, just north of W 4th St'}]},
 {id:'wsp-pole-banner',file:'assets/signage/wsp-pole-banner.png',kind:'pole-banner',size:[.6,1.5],bg:'#f4f1e8',fg:'#2f6b3a',lines:['WASHINGTON','SQUARE','PARK'],font:'sans-bold',band:'#2f6b3a',
  seen:'Washington Square Park banners (white with green lettering) on lamp posts at 43 MacDougal St and at 19 Washington Square North (May 2026); the park logo artwork on the real banners is left out',
  placements:[{p:[-197.16,9.18],y:5.0,normal:[.542,.84],where:'Washington Sq W lamp post, west side, just north of W 4th St (upper banner)'},
   {p:[-32.72,53.66],y:4.4,normal:[.839,-.543],where:'Washington Sq N lamp post in front of 19 Washington Square North'}]}];
// Shop signs: one decal per storefront record in campus/storefronts/ (placed on its sign band).
// The car's Campus Safety livery is part of this manifest too: see livery.js (decals placed on the car).
export {LIVERY} from './livery.js?v=23';
export const SIGNAGE=[...FIXED,...resolveStorefronts(data,STOREFRONTS).map(signDecal).filter(Boolean)];
