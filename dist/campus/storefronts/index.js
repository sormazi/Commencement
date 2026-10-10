// Real storefronts (Step 4B, Tier B), one module per block face, each record observed on Street View
// (looked at, not saved; `seen` gives where and the imagery date). Ground floors only: the upper floors
// keep the facade kits. Record fields (map metres, x east, n north):
//  id, name (the business as signed), addr, a and b (the shopfront's ends on the building line, left to
//  right as seen from the street), h (top of the sign band above the curb), door {at: 0..1 along a->b,
//  w}, mullions (glass divisions), bulkhead (sill height), frame (paint colour), awning {type: none, flat,
//  slope or barrel, color, depth}, sign {lines, bg, fg, font, size [w, h], border}, shutter (true where the
//  roll-down grille was down), seen. Names are shown as plain lettering in the sign's colours; no logos.
import {MACDOUGAL} from './macdougal.js?v=24';
import {BLEECKER} from './bleecker.js?v=24';
export const STOREFRONTS=[...MACDOUGAL,...BLEECKER];
