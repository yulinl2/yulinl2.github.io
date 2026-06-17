// ── RENDER ────────────────────────────────────────────────────────────────────
// All HTML generation. Pure with respect to app logic: emits onclick="fn(...)"
// strings that resolve against window at click-time (see app.js window-attach),
// so this module never imports event handlers — that keeps the graph acyclic.
import { esc, _jsq, prepTex, stripTex } from './util.js';
import { renderK } from './katex.js';
import { S, isBM, getBMs } from './state.js';
import { DS } from './registry.js';

// ── RENDER: TABS ──────────────────────────────────────────────────────────────
export function renderTabs(){
  const bmc=getBMs().length;
  document.getElementById('tabs').innerHTML=
    DS.map(d=>`<button class="tab${S.tab===d.id&&!S.bkTab?' on':''}" style="--tc:${d.color}" onclick="switchTab('${d.id}')"><span class="dot"></span>${d.label}<span class="cnt">${d.count.toLocaleString()}</span></button>`).join('')+
    `<button class="tab${S.bkTab?' on':''}" style="--tc:#fbbf24" onclick="showBkTab()">★ Bookmarks<span class="cnt">${bmc}</span></button>`;
}

// ── HERO BG PATTERN (per-bench SVG tile) ─────────────────────────────────────
export function getBgPattern(d){
  const c=d.color;
  // Solid-color SVG tiles, one per benchmark theme
  const tiles={
    'CMT-Benchmark':
      "<svg xmlns='http://www.w3.org/2000/svg' width='32' height='56'>" +
      "<polygon points='16,1 31,10 31,28 16,37 1,28 1,10' fill='none' stroke='"+c+"' stroke-width='0.7' opacity='0.13'/>" +
      "<polygon points='16,37 31,46 31,64 16,73 1,64 1,46' fill='none' stroke='"+c+"' stroke-width='0.7' opacity='0.13'/>" +
      "</svg>",
    'HARDMath':
      "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='22'>" +
      "<path d='M0,11 C15,-1 15,23 30,11 C45,-1 45,23 60,11' fill='none' stroke='"+c+"' stroke-width='0.9' opacity='0.13'/>" +
      "</svg>",
    'MathTrap-public':
      "<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36'>" +
      "<line x1='9' y1='14' x2='27' y2='14' stroke='"+c+"' stroke-width='1.1' stroke-linecap='round' opacity='0.14'/>" +
      "<line x1='9' y1='22' x2='27' y2='22' stroke='"+c+"' stroke-width='1.1' stroke-linecap='round' opacity='0.14'/>" +
      "<line x1='11' y1='7' x2='25' y2='29' stroke='"+c+"' stroke-width='1.1' stroke-linecap='round' opacity='0.14'/>" +
      "</svg>",
    'PRBench':
      "<svg xmlns='http://www.w3.org/2000/svg' width='22' height='22'>" +
      "<line x1='0' y1='0' x2='22' y2='22' stroke='"+c+"' stroke-width='0.5' opacity='0.12'/>" +
      "<line x1='11' y1='0' x2='22' y2='11' stroke='"+c+"' stroke-width='0.5' opacity='0.12'/>" +
      "<line x1='0' y1='11' x2='11' y2='22' stroke='"+c+"' stroke-width='0.5' opacity='0.12'/>" +
      "</svg>",
    'StatEval-public':
      "<svg xmlns='http://www.w3.org/2000/svg' width='44' height='28'>" +
      "<path d='M0,24 Q5,24 11,12 Q22,-1 33,12 Q39,24 44,24' fill='none' stroke='"+c+"' stroke-width='0.9' opacity='0.13'/>" +
      "</svg>",
    'StatQA-mini':
      "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'>" +
      "<circle cx='12' cy='12' r='1.4' fill='"+c+"' opacity='0.17'/>" +
      "<circle cx='0' cy='0' r='0.8' fill='"+c+"' opacity='0.1'/>" +
      "<circle cx='24' cy='0' r='0.8' fill='"+c+"' opacity='0.1'/>" +
      "<circle cx='0' cy='24' r='0.8' fill='"+c+"' opacity='0.1'/>" +
      "<circle cx='24' cy='24' r='0.8' fill='"+c+"' opacity='0.1'/>" +
      "</svg>",
  };
  const svg=tiles[d.id]||("<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='1' fill='"+c+"' opacity='0.1'/></svg>");
  return 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
}

// ── RENDER: BANNER (flat hero) ────────────────────────────────────────────────
export function renderBanner(d){
  const el=document.getElementById('bnr');
  if(!d){el.innerHTML='';el.style.backgroundImage='';return}
  // Set --ac globally so all elements (chips, search, etc.) inherit benchmark color
  document.documentElement.style.setProperty('--ac',d.color);
  el.style.backgroundImage=getBgPattern(d);
  el.style.backgroundRepeat='repeat';
  el.style.backgroundPosition='0 0';
  el.innerHTML=`${d.symbol?`<span class="bwm" aria-hidden="true">${d.symbol}</span>`:''}
    <div class="bnrc">
      <div class="bt">${d.label}</div>
      <div class="bd">${esc(d.desc)}</div>
      <div class="bl">
        ${d.arxiv?`<a class="pl" href="https://arxiv.org/abs/${d.arxiv}" target="_blank" rel="noopener">📄 arXiv:${d.arxiv}</a>`:''}
        ${d.hf?`<a class="pl" href="https://huggingface.co/datasets/${d.hf}" target="_blank" rel="noopener">🤗 HuggingFace</a>`:''}
        <a class="pl" href="https://github.com/yulinl2/AI4StatMath-Problem-Bank/tree/claude/parquet-ndjson-export-nyz7ia/data/ndjson" target="_blank" rel="noopener">💾 NDJSON source</a>
      </div>
    </div>`;
}

// ── RENDER: FILTER BAR ────────────────────────────────────────────────────────
export function renderFB(d,rows){
  const fb=document.getElementById('fb');
  if(!d||!rows){fb.innerHTML='';return}
  let h='';
  const orAndTip='Within a group: selecting multiple values matches any (OR). Across groups: all groups must match (AND).';
  (d.filters||[]).forEach(f=>{
    const vals=[...new Set(rows.map(r=>f.get(r)).filter(v=>v!=null&&String(v).trim()))].sort();
    if(vals.length<2) return;
    const fs=S.filt[f.key]||new Set();
    h+=`<div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center">
      <span class="flbl"><span class="filtip" title="${esc(orAndTip)}">ⓘ</span> ${esc(f.label)}:</span>`;
    vals.forEach(v=>{
      const sv=String(v);
      const displaySv=sv.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
      const cnt=rows.filter(r=>{const rv=f.get(r);return rv!=null&&String(rv)===sv}).length;
      const desc=d.filterDescriptions?.[f.key]?.[sv];
      const tip=desc?`<span class="filtip" style="pointer-events:none">ⓘ</span> `:'';
      h+=`<button class="chip${fs.has(sv)?' on':''}" onclick="togFilt('${_jsq(f.key)}','${_jsq(sv)}')"${desc?` title="${esc(desc)}"`:''} >${tip}${esc(displaySv)}<span class="chipc">${cnt}</span></button>`;
    });
    h+='</div>';
  });
  h+=`<div class="fsp"></div>
    <select class="ss" onchange="setSort(this.value)">
      <option value="default"${S.sort==='default'?' selected':''}>Default order</option>
      <option value="shuffle"${S.sort==='shuffle'?' selected':''}>Shuffle</option>
      <option value="ia"${S.sort==='ia'?' selected':''}>ID ↑</option>
      <option value="id"${S.sort==='id'?' selected':''}>ID ↓</option>
    </select>
    <button class="cmpbtn${S.cmp?' on':''}" onclick="togCmp()">⬜ Compact</button>`;
  fb.innerHTML=h;
}

// ── STATUS ────────────────────────────────────────────────────────────────────
export function showStatus(h){
  document.getElementById('cc').innerHTML=`<div id="stb">${h}</div>`;
  document.getElementById('sl').innerHTML='';
  document.getElementById('pg').innerHTML='';
  document.getElementById('fnav').style.display='none';
}

// ── FILTER + SORT ─────────────────────────────────────────────────────────────
export function applyFS(rows,d){
  let r=rows;
  if(S.q.trim()){const q=S.q.toLowerCase();r=r.filter(x=>x.stem&&x.stem.toLowerCase().includes(q))}
  Object.entries(S.filt).forEach(([k,vs])=>{
    if(!vs||!vs.size) return;
    const f=d.filters?.find(x=>x.key===k); if(!f) return;
    r=r.filter(x=>{const v=f.get(x);return v&&vs.has(String(v))});
  });
  if(S.sort==='shuffle') r=[...r].sort(()=>Math.random()-.5);
  else if(S.sort==='ia') r=[...r].sort((a,b)=>(a.source_id||'').localeCompare(b.source_id||''));
  else if(S.sort==='id') r=[...r].sort((a,b)=>(b.source_id||'').localeCompare(a.source_id||''));
  return r;
}

// ── RENDER: CARDS ─────────────────────────────────────────────────────────────
export function renderCards(d,rows,animate){
  const cc=document.getElementById('cc');
  if(animate){cc.innerHTML='';cc.classList.remove('anim');void cc.offsetWidth;cc.classList.add('anim');}
  const filtered=applyFS(rows,d);
  const total=filtered.length;
  const allTotal=rows.length;
  const pages=Math.max(1,Math.ceil(total/S.pageSize));
  if(S.page>pages) S.page=pages;
  const s=(S.page-1)*S.pageSize, e=Math.min(s+S.pageSize,total);
  // Sticky count bar: active filter chips + count
  const hasFilter=Object.values(S.filt).some(vs=>vs&&vs.size>0)||S.q.trim().length>0;
  const chips=Object.entries(S.filt)
    .flatMap(([k,vs])=>[...vs].map(v=>`<button class="atag" onclick="togFilt('${_jsq(k)}','${_jsq(v)}')" title="Remove filter">✕ ${esc(String(v))}</button>`)).join('');
  document.getElementById('sl').innerHTML=chips+(
    total===0?'<span style="color:var(--mu)">no matches</span>'
    :hasFilter?`<span style="color:var(--mu)">${total.toLocaleString()} matched of ${allTotal.toLocaleString()}</span>`
    :`<span style="color:var(--mu)">${s+1}–${e} of <strong>${total.toLocaleString()}</strong></span>`
  );
  if(total===0){
    document.getElementById('cc').innerHTML=`<div id="stb"><div style="color:var(--mu)">No problems match your filters.</div><button class="rbtn" onclick="clearF()">Clear filters</button></div>`;
    document.getElementById('pg').innerHTML=''; return;
  }
  document.getElementById('cc').innerHTML=filtered.slice(s,e).map((row,i)=>cardHTML(row,d,s+i)).join('');
  document.getElementById('pg').innerHTML=pages>1?`
    <button class="pbtn" onclick="goPage(${S.page-1})" ${S.page<=1?'disabled':''}>← Prev</button>
    <span class="pi">Page ${S.page} of ${pages}</span>
    <button class="pbtn" onclick="goPage(${S.page+1})" ${S.page>=pages?'disabled':''}>Next →</button>`:'';
  renderNav(total,pages);
}

// ── CARD HTML ─────────────────────────────────────────────────────────────────
function metaPreviewText(row,d){
  const n=row.native||{};
  return (d.metaPreview||[])
    .map(k=>n[k])
    .filter(v=>v!=null&&String(v).trim().length>0&&String(v).length<60)
    .slice(0,2).map(v=>String(v).replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())).join(' · ');
}

export function cardHTML(row,d,idx){
  const bid=`${d.id}::${row.source_id}`;
  const bm=isBM(bid);
  const tgs=d.tags(row);
  const stem=row.stem||'';
  const prev=stripTex(stem).slice(0,400); // strip LaTeX tokens → readable prose preview
  const stemTex=prepTex(stem);  // wrap bare display envs for KaTeX
  const answ=d.ans(row);
  const soln=d.sol(row);
  const solLabel=d.solLabel?d.solLabel(row):'Solution';
  const ctx=d.context?d.context(row):null;
  const meta=metaPreviewText(row,d);
  return `<div class="card" style="--cc:${d.color}" id="c${idx}" tabindex="0" data-id="${esc(bid)}" data-idx="${idx}">
  <div class="ch" onclick="expCard(${idx})">
    <span class="cid">${esc(row.source_id||'')}</span>
    <div class="ctags">${tgs.map(t=>`<span class="tag ${t.c}">${esc(t.l)}</span>`).join('')}</div>
    ${meta?`<span class="chmeta" onclick="event.stopPropagation();tapMeta(${idx})" title="${esc(meta)}">${esc(meta)}</span>`:'<span class="fsp"></span>'}
    <button class="bkm${bm?' on':''}" onclick="event.stopPropagation();bmTog('${esc(bid)}',${idx})" title="${bm?'Remove bookmark':'Bookmark'}">${bm?'★':'☆'}</button>
    <span class="exi">▼</span>
  </div>
  <div class="cbdy" onclick="expCard(${idx})"><div class="cprev">${esc(prev)}${prev.length<stem.length?'…':''}</div></div>
  <div class="cexp">
    <div class="cstem katex-c" onclick="expCard(${idx})">${esc(stemTex)}</div>
    ${ctx?`<div class="cctx">
      <div class="ctxhdr">◈ Original Problem${ctx.src?` <span class="ctxsrc">· from ${esc(ctx.src)}</span>`:''}
      </div><div class="ctxbdy katex-c">${esc(prepTex(ctx.text))}</div></div>`:''}
    ${soln?spoilerHTML(solLabel,soln):''}
    <div class="mac" id="m${idx}">
      <button class="mtog" onclick="togMeta(${idx})">▸ Metadata</button>
      ${metaHTML(row,d)}
    </div>
  </div>
  <div class="cft">
    ${answ?`<button class="ansbtn" onclick="event.stopPropagation();togCardAns(${idx})">Answer <span class="abchev">▾</span></button>`:''}
    <div class="fsp"></div>
    ${row.lookup_url?`<a class="srl" href="${esc(row.lookup_url)}" target="_blank" rel="noopener">Source ↗</a>`:''}
  </div>
  ${answ?`<div class="ansb" id="ans${idx}"><div class="spbc katex-c">${esc(String(answ))}</div><button class="spbclose" onclick="event.stopPropagation();togCardAns(${idx})">▲ collapse</button></div>`:''}</div>`;
}

export function spoilerHTML(label,content){
  if(!content) return '';
  return `<div class="spl">
  <div class="sph" onclick="togSpl(this)">
    ${label} <span class="sphn">(tap to reveal)</span><span class="splchev">▾</span>
  </div>
  <div class="spb katex-c"><div class="spbc">${esc(prepTex(String(content)))}</div>
    <button class="spbclose" onclick="togSplClose(this)">▲ collapse</button>
  </div>
</div>`;
}

function metaHTML(row,d){
  const n=row.native||{};
  const skip=new Set(['solution','answer_val','answer_excerpt','solution_excerpt','ground_truth_raw','original_solution','human_annotation','gpt4_annotation','rubric_buckets','relevant_column_raw','results_raw','in_mini']);
  const rows=[['source_id',row.source_id],['benchmark',row.source_benchmark],
    ['ingested_at',row.ingested_at?new Date(row.ingested_at).toLocaleDateString():null],
    ...Object.entries(n).filter(([k])=>!skip.has(k))].filter(([,v])=>v!=null&&v!=='');
  return `<table class="mtbl">${rows.map(([k,v])=>`<tr><td>${esc(k)}</td><td>${esc(String(v))}</td></tr>`).join('')}</table>`;
}

// ── BOOKMARKS TAB ─────────────────────────────────────────────────────────────
export function renderBkTab(){
  const bms=getBMs();
  const el=document.getElementById('bnr');
  document.documentElement.style.setProperty('--ac','#fbbf24');
  el.innerHTML=`<div class="bnrc"><div class="bt" style="color:#fbbf24">★ Bookmarks</div><div class="bd">${bms.length} saved problem${bms.length!==1?'s':''}</div></div>`;
  document.getElementById('fb').innerHTML='';
  document.getElementById('pg').innerHTML='';
  document.getElementById('sl').innerHTML='';
  if(!bms.length){document.getElementById('cc').innerHTML='<div class="bem"><div>No bookmarks yet.</div><small>Click ☆ on any card to save it here.</small></div>';return}
  const cards=bms.map((bid,i)=>{
    const [dsId,sid]=bid.split('::');
    const ds=DS.find(d=>d.id===dsId);
    const rows=S.data[dsId]||[];
    const row=rows.find(r=>r.source_id===sid);
    if(!row||!ds) return '';
    return cardHTML(row,ds,9000+i);
  }).filter(Boolean);
  document.getElementById('cc').innerHTML=cards.length?cards.join(''):'<div class="bem">Bookmarked datasets not loaded yet — visit their tabs first.</div>';
  document.getElementById('fnav').style.display='none';
}

// ── FLOATING NAV ──────────────────────────────────────────────────────────────
export function renderNav(total,pages){
  const nav=document.getElementById('fnav');
  if(total<=0){nav.style.display='none';return}
  nav.style.display='flex';
  nav.innerHTML=
    `<button class="fnb" id="fnFirst" onclick="fnFirst()" title="First question (⤒)" aria-label="First question">⤒</button>`+
    `<button class="fnb" id="fnPrev" onclick="fnPrevQ()" title="Prev question (k/↑)" aria-label="Previous question">↑</button>`+
    `<div class="fndiv"></div>`+
    `<button class="fnb" id="fnPgPrev" onclick="goPage(${S.page-1})" ${S.page<=1?'disabled':''} title="Prev page (←)" aria-label="Previous page">‹</button>`+
    `<span id="fnpi">${pages>1?S.page+'/'+pages:total}</span>`+
    `<button class="fnb" id="fnPgNext" onclick="goPage(${S.page+1})" ${S.page>=pages?'disabled':''} title="Next page (→)" aria-label="Next page">›</button>`+
    `<div class="fndiv"></div>`+
    `<button class="fnb" id="fnNext" onclick="fnNextQ()" title="Next question (j/↓)" aria-label="Next question">↓</button>`+
    `<button class="fnb" id="fnLast" onclick="fnLast()" title="Last question (⤓)" aria-label="Last question">⤓</button>`;
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
export function showModal(row,d){
  const mc=document.getElementById('mc');
  const tgs=d.tags(row);const answ=d.ans(row);const soln=d.sol(row);
  mc.innerHTML=`<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:10px;border-bottom:1px solid var(--bd);padding-bottom:10px">
    <span style="color:${d.color};font-weight:600">● ${d.label}</span>
    <span class="cid">${esc(row.source_id||'')}</span>
    ${tgs.map(t=>`<span class="tag ${t.c}">${esc(t.l)}</span>`).join('')}
  </div>
  <div class="cstem katex-c" style="cursor:default;padding:0 0 10px">${esc(prepTex(row.stem||''))}</div>
  ${spoilerHTML('Answer',answ)}
  ${spoilerHTML('Solution',soln)}
  ${row.lookup_url?`<div style="margin-top:10px"><a class="srl" href="${esc(row.lookup_url)}" target="_blank" rel="noopener">Source ↗</a></div>`:''}`;
  document.getElementById('mo').classList.add('op');
  renderK(mc);
}
export function closeModal(){document.getElementById('mo').classList.remove('op')}
