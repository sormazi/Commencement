// Washington Square · NYU free-roam location: data, collision and street graph (no rendering).
import data from './data/campus-data.js?v=21';
import {CampusCollision} from './collision.js?v=21';
import {StreetGraph} from './streets.js?v=21';
export const campusLocation={id:'washington-square',name:'Washington Square · NYU',city:'New York',street:'Free roam · Greenwich Village',freeRoam:true,halfWidth:12,length:1,spawn:0};
let cached=null;
export function campus(){if(cached)return cached;const collision=new CampusCollision(data),streets=new StreetGraph(data);
 // Default spawn: on Fifth Avenue just north of Washington Square North, facing south through the Arch.
 const axis=[Math.sin(.506),Math.cos(.506)],probe=[axis[0]*72,axis[1]*72],road=streets.nearest(probe[0],probe[1],40);
 let yaw=road?road.yaw:Math.PI+.506;const toArch=Math.atan2(-road.point[0],-road.point[1]);if(Math.cos(yaw-toArch)<0)yaw+=Math.PI;
 const spawn={x:road.point[0],z:road.point[1],yaw};
 cached={data,collision,streets,spawn,surface:(x,z)=>collision.surface(x,z)};return cached;}
// Re-centre a stuck or reset car on the nearest street, keeping the closest street direction to its heading.
export function snapToStreet(c,x,z,yaw){const r=c.streets.nearest(x,z,400);if(!r)return c.spawn;let y=r.yaw;if(Math.cos(y-yaw)<0)y+=Math.PI;return {x:r.point[0],z:r.point[1],yaw:y};}
