// ── DATA LOADING ──────────────────────────────────────────────────────────────
// Fetches gzip+base64 NDJSON, decodes client-side via DecompressionStream.
import { esc } from './util.js';
import { S } from './state.js';
import { showStatus } from './render.js';

export async function decompB64Gz(b64){
  const bin=Uint8Array.from(atob(b64.trim()),c=>c.charCodeAt(0));
  const ds=new DecompressionStream('gzip');
  const w=ds.writable.getWriter(); w.write(bin); w.close();
  return new Response(ds.readable).text();
}

export async function load(id){
  if(S.data[id]) return S.data[id];
  if(S.loading[id]) return null;
  S.loading[id]=true; delete S.errors[id];
  showStatus(`<div class="spin"></div><div>Loading ${id}…</div>`);
  try{
    const r=await fetch('data/'+id+'.ndjson.gz.b64');
    if(!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
    const t=await decompB64Gz(await r.text());
    S.data[id]=t.split('\n').filter(Boolean).map(l=>{
      const row=JSON.parse(l);
      if(typeof row.native==='string'){try{row.native=JSON.parse(row.native)}catch{}}
      return row;
    });
    S.loading[id]=false; return S.data[id];
  }catch(err){
    S.loading[id]=false; S.errors[id]=err.message;
    showStatus(`<div class="ebox"><strong>Failed to load ${esc(id)}</strong><br>
      <small style="color:var(--mu)">${esc(err.message)}</small><br>
      <button class="rbtn" onclick="retryLoad('${id}')">↻ Retry</button></div>`);
    return null;
  }
}
