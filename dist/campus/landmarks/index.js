import {buildBobst,BOBST} from './bobst.js?v=18';
import {buildSilver,SILVER} from './silver-center.js?v=18';
// Registry of detailed landmark buildings, keyed by NYC BIN. Each entry builds a Three.js group in
// world coordinates (x east, y up, z = -north) that replaces the footprint massing.
export const LANDMARK_BUILDINGS={[BOBST.bin]:{name:'Bobst Library',build:buildBobst},[SILVER.bin]:{name:'Silver Center',build:buildSilver}};
