// Local equirectangular projection for the Washington Square campus.
// Map space is metres: +x east, +n north, origin at the centre of the Washington Square Arch.
// Physics space uses the same axes (physics x = east, physics z = north). Three.js space is
// x = east, y = up, z = -north, so the renderer's forward (-z) is north.
// The NYC Open Data / OSM inputs are WGS84; over ~2 km the equirectangular error is < 2 cm.
export const ARCH_ORIGIN={lat:40.7312347,lon:-73.9971025};
export function metresPerDegree(lat){const p=lat*Math.PI/180;return {lat:111132.92-559.82*Math.cos(2*p)+1.175*Math.cos(4*p)-.0023*Math.cos(6*p),lon:111412.84*Math.cos(p)-93.5*Math.cos(3*p)+.118*Math.cos(5*p)};}
export function makeProjection(origin=ARCH_ORIGIN){const m=metresPerDegree(origin.lat);return {origin,m,
 toLocal(lat,lon){return [(lon-origin.lon)*m.lon,(lat-origin.lat)*m.lat];},
 toLatLon(x,n){return {lat:origin.lat+n/m.lat,lon:origin.lon+x/m.lon};}};}
export const toThree=(x,n)=>[x,-n];
