import {campusLocation} from './campus/campus.js?v=23';
import {CampusWorld} from './campus/campus-world.js?v=23';
// NightView has one location: Washington Square, the free-roam campus world. (Times Square, SoHo and
// Shibuya were removed in Step 10; they remain in git history and on the main branch.)
export const locations=[campusLocation];
export function createWorld(id='washington-square'){if(id!==campusLocation.id)throw Error('Unknown location');return new CampusWorld(campusLocation);}
