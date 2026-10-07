import {buildBobst,BOBST} from './bobst.js?v=18';
import {buildSilver,SILVER} from './silver-center.js?v=18';
import {buildKimmel,KIMMEL} from './kimmel.js?v=18';
import {buildJudson,JUDSON} from './judson.js?v=18';
import {buildRow,ROW_BINS} from './row.js?v=18';
import {buildWeinstein,WEINSTEIN} from './weinstein.js?v=18';
import {buildBrown,BROWN} from './brown.js?v=18';
// Registry of detailed landmark buildings, keyed by NYC BIN. Each entry builds a Three.js group in
// world coordinates (x east, y up, z = -north) that replaces the footprint massing.
export const LANDMARK_BUILDINGS={[BOBST.bin]:{name:'Bobst Library',build:buildBobst},[SILVER.bin]:{name:'Silver Center',build:buildSilver},[KIMMEL.bin]:{name:'Kimmel Center',build:buildKimmel},[JUDSON.bin]:{name:'Judson Memorial Church',build:buildJudson,also:[JUDSON.hallBin]},[ROW_BINS[0]]:{name:'The Row, Washington Square North',build:buildRow,also:ROW_BINS.slice(1)},[WEINSTEIN.bin]:{name:'Weinstein Hall',build:buildWeinstein},[BROWN.bin]:{name:'Brown Building and Triangle Fire Memorial',build:buildBrown,preserve:true}};
