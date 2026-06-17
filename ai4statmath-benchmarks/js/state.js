// ── STATE ────────────────────────────────────────────────────────────────────
import { DS } from './registry.js';

export const S={tab:'CMT-Benchmark',bkTab:false,q:'',filt:{},sort:'default',cmp:false,
         page:1,pageSize:30,focused:-1,data:{},loading:{},errors:{},savedPage:{},savedFilt:{}};

// Deep-clone filter state (Map of Sets) so per-bench saved state isn't mutated.
export function cloneFilt(f){const c={};Object.entries(f).forEach(([k,vs])=>{c[k]=new Set(vs)});return c;}

export function curDS(){return DS.find(d=>d.id===S.tab)}

// ── BOOKMARKS ─────────────────────────────────────────────────────────────────
export function getBMs(){try{return JSON.parse(localStorage.getItem('ai4sm_bm')||'[]')}catch{return[]}}
export function setBMs(a){try{localStorage.setItem('ai4sm_bm',JSON.stringify(a))}catch{}}
export function isBM(id){return getBMs().includes(id)}
export function toggleBM(id){let a=getBMs();a.includes(id)?a=a.filter(x=>x!==id):a.push(id);setBMs(a);return a.includes(id)}
