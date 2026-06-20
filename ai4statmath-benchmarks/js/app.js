// ── APP ENTRY ─────────────────────────────────────────────────────────────────
// Event handlers, global wiring, init, and the single window-attach block.
// This is the only <script> the page loads; it pulls in the whole module graph.
import { DS } from './registry.js';
import { S, cloneFilt, curDS, toggleBM } from './state.js';
import { renderK } from './katex.js';
import { load } from './data.js';
import {
  renderTabs, renderBanner, renderFB, renderCards, renderBkTab,
  showModal, closeModal, applyFS,
} from './render.js';

// ── TAB SWITCH ────────────────────────────────────────────────────────────────
async function switchTab(id){
  // Remember page and filter state before leaving this bench
  if(!S.bkTab&&S.tab!==id&&S.data[S.tab]){S.savedPage[S.tab]=S.page;S.savedFilt[S.tab]=cloneFilt(S.filt);}
  S.tab=id;S.bkTab=false;S.page=S.savedPage[id]||1;S.filt=cloneFilt(S.savedFilt[id]||{});S.focused=-1;
  document.getElementById('cc').classList.remove('has-exp');
  renderTabs();
  const d=DS.find(x=>x.id===id);
  renderBanner(d);renderFB(d,null);
  if(!S.data[id]){const r=await load(id);if(!r) return}
  renderFB(d,S.data[id]);renderCards(d,S.data[id],true);
  window.scrollTo({top:0,behavior:'smooth'});  // Reveal full hero on bench switch
}
function showBkTab(){S.bkTab=true;S.tab='__bk__';renderTabs();renderBkTab()}
async function retryLoad(id){delete S.loading[id];delete S.errors[id];await switchTab(id)}

// ── CARD EXPAND / SPOILERS / META ─────────────────────────────────────────────
function expCard(idx){
  const c=document.getElementById('c'+idx);if(!c) return;
  _clearNavFocus();  // Manual expand clears nav-focus highlight
  const wasExp=c.classList.contains('exp');
  c.classList.toggle('exp');S.focused=idx;
  const cc=document.getElementById('cc');
  if(!wasExp){
    cc.classList.add('has-exp');
    c.querySelectorAll('.katex-c').forEach(el=>renderK(el));
  } else {
    if(!cc.querySelector('.card.exp')) cc.classList.remove('has-exp');
  }
}

function togSpl(hEl){
  const s=hEl.closest('.spl');s.classList.toggle('rv');
  if(s.classList.contains('rv')){
    const b=s.querySelector('.spb');if(b) renderK(b);
    const h=hEl.querySelector('.sphn');if(h) h.textContent='';
  } else {
    const h=hEl.querySelector('.sphn');if(h) h.textContent='(tap to reveal)';
  }
}
function togSplClose(btn){
  const s=btn.closest('.spl');s.classList.remove('rv');
  const h=s.querySelector('.sphn');if(h) h.textContent='(tap to reveal)';
}

function togCardAns(idx){
  const b=document.getElementById('ans'+idx);if(!b) return;
  const open=b.classList.toggle('rv');
  if(open) renderK(b);
  const chev=document.querySelector('#c'+idx+' .ansbtn .abchev');
  if(chev) chev.style.transform=open?'rotate(180deg)':'';
}

function tapMeta(idx){
  const c=document.getElementById('c'+idx);if(!c) return;
  if(!c.classList.contains('exp')) expCard(idx);
  const m=document.getElementById('m'+idx);
  if(m&&!m.classList.contains('op')) setTimeout(()=>togMeta(idx),60);
}

function togMeta(idx){
  const m=document.getElementById('m'+idx);if(!m) return;
  m.classList.toggle('op');
  const b=m.querySelector('.mtog');if(b) b.textContent=m.classList.contains('op')?'▾ Metadata':'▸ Metadata';
}

// ── FILTER / SORT / COMPACT ───────────────────────────────────────────────────
function togFilt(key,val){
  if(!S.filt[key]) S.filt[key]=new Set();
  S.filt[key].has(val)?S.filt[key].delete(val):S.filt[key].add(val);
  S.page=1;refresh();
}
function clearF(){S.filt={};S.q='';document.getElementById('si').value='';refresh()}
function setSort(v){S.sort=v;S.page=1;refresh()}
function togCmp(){S.cmp=!S.cmp;document.body.classList.toggle('cmp',S.cmp);refresh()}

function goPage(p){
  const d=curDS();const r=S.data[S.tab];if(!d||!r) return;
  const pages=Math.max(1,Math.ceil(applyFS(r,d).length/S.pageSize));
  if(p<1){_bounceFnb('fnPgPrev');return}
  if(p>pages){_bounceFnb('fnPgNext');return}
  S.page=p;S.focused=-1;renderCards(d,r);
  document.getElementById('cc').scrollIntoView({behavior:'smooth',block:'start'});
}
function refresh(){
  if(S.bkTab){renderBkTab();return}
  const d=curDS();const r=S.data[S.tab];if(!d||!r) return;
  renderFB(d,r);renderCards(d,r);
}

// ── BOOKMARKS ─────────────────────────────────────────────────────────────────
function bmTog(id,idx){
  const on=toggleBM(id);
  const b=document.querySelector('#c'+idx+' .bkm');
  if(b){b.textContent=on?'★':'☆';b.classList.toggle('on',on);b.title=on?'Remove bookmark':'Bookmark'}
  renderTabs();
}

// ── RANDOM ────────────────────────────────────────────────────────────────────
async function doRandom(){
  const loaded=DS.filter(d=>S.data[d.id]);
  if(!loaded.length){await switchTab(DS[0].id);setTimeout(doRandom,200);return}
  const d=loaded[Math.floor(Math.random()*loaded.length)];
  showModal(d.data?.[Math.floor(Math.random()*d.data?.length)]||S.data[d.id][Math.floor(Math.random()*S.data[d.id].length)],d);
}

// ── THEME ─────────────────────────────────────────────────────────────────────
const SVG_MOON=`<svg id="ti" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const SVG_SUN=`<svg id="ti" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
function togTheme(){
  const nd=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',nd);
  document.getElementById('tbtn').innerHTML=nd==='dark'?SVG_MOON:SVG_SUN;
  try{localStorage.setItem('ai4sm_theme',nd)}catch{}
}

// ── QUESTION NAV ──────────────────────────────────────────────────────────────
function _cards(){return document.querySelectorAll('#cc .card')}
function _clearNavFocus(){document.querySelectorAll('#cc .card.nav-focus').forEach(c=>c.classList.remove('nav-focus'))}
function _bounceFnb(id){
  const b=document.getElementById(id);if(!b) return;
  b.classList.remove('bnc');void b.offsetWidth;b.classList.add('bnc');
  b.addEventListener('animationend',()=>b.classList.remove('bnc'),{once:true});
}
function _setNavFocus(cs,idx,block){
  _clearNavFocus();
  // Collapse any expanded card so nav-focus is the sole bright focus
  document.querySelectorAll('#cc .card.exp').forEach(c=>c.classList.remove('exp'));
  document.getElementById('cc').classList.remove('has-exp');
  S.focused=idx;
  if(block==='top') window.scrollTo({top:0,behavior:'smooth'});
  else cs[idx].scrollIntoView({behavior:'smooth',block:block||'center'});
  // Defer highlight by one frame so scroll starts before the card lights up
  requestAnimationFrame(()=>{
    cs[idx].classList.add('nav-focus');
    cs[idx].focus({preventScroll:true});
  });
}
function fnFirst(){const cs=_cards();if(cs.length) _setNavFocus(cs,0,'top')}
function fnLast(){const cs=_cards();if(cs.length) _setNavFocus(cs,cs.length-1,'end')}
function fnPrevQ(){
  const cs=_cards();if(!cs.length) return;
  if(S.focused<=0){_bounceFnb('fnPrev');return}
  _setNavFocus(cs,S.focused-1);
}
function fnNextQ(){
  const cs=_cards();if(!cs.length) return;
  if(S.focused>=cs.length-1){_bounceFnb('fnNext');return}
  _setNavFocus(cs,S.focused<0?0:S.focused+1);
}

// ── SWIPE (bench switch) ──────────────────────────────────────────────────────
{
  let _tx=0,_ty=0,_swipeBlocked=false;
  const _mainEl=document.getElementById('main');
  _mainEl.addEventListener('touchstart',e=>{
    _tx=e.touches[0].clientX;_ty=e.touches[0].clientY;
    // Don't trigger bench-switch if the touch starts inside a horizontally scrollable element
    // (e.g. a wide katex-display). Walk up from the touch target to #main.
    _swipeBlocked=false;
    let el=e.target;
    while(el&&el!==_mainEl){
      if(el.scrollWidth>el.clientWidth+2){_swipeBlocked=true;break;}
      el=el.parentElement;
    }
  },{passive:true});
  _mainEl.addEventListener('touchend',e=>{
    if(_swipeBlocked) return;
    const dx=e.changedTouches[0].clientX-_tx,dy=e.changedTouches[0].clientY-_ty;
    if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.8&&!S.bkTab){
      if(dx<0) goPage(S.page+1);  // swipe left → next page
      else     goPage(S.page-1);  // swipe right → prev page
    }
  },{passive:true});
}

// ── KEYBOARD ──────────────────────────────────────────────────────────────────
document.addEventListener('keydown',e=>{
  if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)){if(e.key==='Escape') e.target.blur();return}
  if(document.getElementById('mo').classList.contains('op')){if(e.key==='Escape') closeModal();return}
  if(e.key==='/'){e.preventDefault();document.getElementById('si').focus()}
  else if(e.key==='r'||e.key==='R') doRandom();
  else if(e.key==='Escape') clearF();
  else if(e.key==='ArrowLeft'){e.preventDefault();goPage(S.page-1)}
  else if(e.key==='ArrowRight'){e.preventDefault();goPage(S.page+1)}
  else if(e.key==='ArrowUp'){e.preventDefault();fnPrevQ()}
  else if(e.key==='ArrowDown'){e.preventDefault();fnNextQ()}
  else if(e.key==='Home'){e.preventDefault();fnFirst()}
  else if(e.key==='End'){e.preventDefault();fnLast()}
  else if(e.key==='j'){e.preventDefault();fnNextQ()}
  else if(e.key==='k'){e.preventDefault();fnPrevQ()}
  else if(e.key==='Enter'&&S.focused>=0) expCard(S.focused);
});

// ── SEARCH ────────────────────────────────────────────────────────────────────
let _st;
document.getElementById('si').addEventListener('input',e=>{
  clearTimeout(_st);_st=setTimeout(()=>{S.q=e.target.value;S.page=1;refresh()},200);
});

// ── MODAL / BUTTON WIRING ─────────────────────────────────────────────────────
document.getElementById('mclose').addEventListener('click',closeModal);
document.getElementById('mo').addEventListener('click',e=>{if(e.target===document.getElementById('mo')) closeModal()});
document.getElementById('rbtn').addEventListener('click',doRandom);
document.getElementById('tbtn').addEventListener('click',togTheme);

// ── STICKY TOP CALIBRATION ────────────────────────────────────────────────────
// ResizeObserver keeps scroll-margin in sync with the sticky chrome height
(function(){
  const sticky=document.getElementById('sticky');
  function calibrate(){
    document.documentElement.style.setProperty('--scroll-top',sticky.offsetHeight+'px');
  }
  calibrate();
  new ResizeObserver(calibrate).observe(sticky);
  window.addEventListener('resize',calibrate);
})();

// ── DEPLOY TIMESTAMP ──────────────────────────────────────────────────────────
// Reads Last-Modified from the page's own HTTP headers — shows which build is live.
(function(){
  fetch(location.href,{method:'HEAD',cache:'no-cache'})
    .then(r=>{const d=r.headers.get('last-modified');const el=document.getElementById('build-ts');
      if(el&&d) el.textContent='Deployed: '+new Date(d).toISOString().replace('T',' ').slice(0,16)+' UTC';
    }).catch(()=>{});
})();

// ── WINDOW-ATTACH (G1: inline onclick handlers resolve against window) ─────────
// Single auditable surface for every function referenced from a generated
// onclick="…" / onchange="…" string. Adding such a handler? Add it here too.
Object.assign(window, {
  switchTab, showBkTab, togFilt, setSort, togCmp, retryLoad, clearF, goPage,
  expCard, tapMeta, bmTog, togMeta, togCardAns, togSpl, togSplClose,
  fnFirst, fnPrevQ, fnNextQ, fnLast,
});

// ── INIT ──────────────────────────────────────────────────────────────────────
(function init(){
  try{const t=localStorage.getItem('ai4sm_theme');if(t){document.documentElement.setAttribute('data-theme',t);document.getElementById('tbtn').innerHTML=t==='dark'?SVG_MOON:SVG_SUN}}catch{}
  renderTabs();
  switchTab('CMT-Benchmark');
})();
