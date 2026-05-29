/* FaiREE decision board — vanilla. Loads roadmap.json, renders kanban columns,
   filters, edits in-memory, autosaves to localStorage, and on Save commits the
   JSON back to the repo via the GitHub Contents API using a user-supplied PAT. */
(() => {
  const DATA_URL = 'assets/data/roadmap.json';
  const LS_DATA  = 'fairee-board:state:v1';
  const LS_SET   = 'fairee-board:settings:v1';
  const LS_DIRTY = 'fairee-board:dirty:v1';
  const DEFAULT_SETTINGS = {
    pat: '', owner: 'yulinl2', repo: 'yulinl2.github.io',
    branch: 'claude/recover-dev-intent-eQY0u',
    path: 'fairee-board/assets/data/roadmap.json',
    message: 'board: update roadmap.json from web UI'
  };

  let state = null;          // current in-memory roadmap object
  let baseSha = null;        // current file SHA on the target branch (for PUT)
  let settings = loadSettings();
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // ---------- bootstrapping ----------
  init();

  async function init(){
    bindUI();
    const cached = localStorage.getItem(LS_DATA);
    const dirty  = localStorage.getItem(LS_DIRTY) === '1';
    let initial;
    try {
      const resp = await fetch(DATA_URL + '?v=' + Date.now(), { cache: 'no-store' });
      initial = await resp.json();
    } catch (e){
      toast('Could not load roadmap.json from disk', 'err');
      initial = { schema_version:1, items:[], statuses:['proposed','in-progress','blocked','decided','done'], priorities:['high','med','low'], owners:['you','claude','copilot'], groups:[] };
    }
    if (cached && dirty){
      try { state = JSON.parse(cached); markDirty(true, 'restored unsaved edits'); }
      catch { state = initial; }
    } else {
      state = initial;
      // mirror to localStorage so future reloads see a baseline
      try { localStorage.setItem(LS_DATA, JSON.stringify(state)); } catch{}
      markDirty(false, 'in sync with repo');
    }
    renderAll();
    // Best-effort: fetch the current file SHA up-front so Save is one click
    refreshBaseSha().catch(() => {});
  }

  function loadSettings(){
    try { return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(localStorage.getItem(LS_SET) || '{}')); }
    catch { return { ...DEFAULT_SETTINGS }; }
  }
  function saveSettings(s){ settings = s; localStorage.setItem(LS_SET, JSON.stringify(s)); }

  // ---------- rendering ----------
  function renderAll(){
    renderHeader();
    renderFilters();
    renderColumns();
  }

  function renderHeader(){
    const p = state.project || {};
    $('#projectSummary').textContent = p.summary || '';
    $('#chipUpdated').textContent   = 'updated ' + (state.updated || '—');
    const ms = p.manuscript || {};
    $('#chipManuscript').textContent = 'manuscript: arxiv ' + (ms.arxiv_anchor || '—') + ' + Overleaf · ' + (ms.status || '');
    $('#chipBranch').textContent     = 'save target: ' + settings.owner + '/' + settings.repo + '@' + settings.branch;
  }

  function renderFilters(){
    const g = $('#fGroup');   keepFirst(g); (state.groups || []).forEach(x => g.appendChild(opt(x.id, x.name + ' — ' + (x.repo || ''))));
    const s = $('#fStatus');  keepFirst(s); (state.statuses || []).forEach(x => s.appendChild(opt(x, x)));
    const o = $('#fOwner');   keepFirst(o); (state.owners   || []).forEach(x => o.appendChild(opt(x, x)));
    const p = $('#fPriority');keepFirst(p); (state.priorities||[]).forEach(x => p.appendChild(opt(x, x)));
    const r = $('#fRepo');    keepFirst(r); uniqueRepos().forEach(x => r.appendChild(opt(x, x)));
  }
  function keepFirst(sel){ while (sel.children.length > 1) sel.removeChild(sel.lastChild); }
  function opt(v,l){ const o = document.createElement('option'); o.value = v; o.textContent = l; return o; }
  function uniqueRepos(){ return Array.from(new Set((state.items||[]).map(i => i.repo).filter(Boolean))).sort(); }

  function currentFilters(){
    return {
      q: ($('#q').value || '').toLowerCase().trim(),
      group: $('#fGroup').value, status: $('#fStatus').value,
      owner: $('#fOwner').value, priority: $('#fPriority').value, repo: $('#fRepo').value,
      groupView: $('#fViewGroup').checked
    };
  }

  function filtered(){
    const f = currentFilters();
    return (state.items || []).filter(i => {
      if (f.group    && i.group    !== f.group)    return false;
      if (f.status   && i.status   !== f.status)   return false;
      if (f.owner    && i.owner    !== f.owner)    return false;
      if (f.priority && i.priority !== f.priority) return false;
      if (f.repo     && i.repo     !== f.repo)     return false;
      if (f.q){
        const hay = [i.id, i.title, i.detail, i.category, (i.refs||[]).join(' ')].join(' ').toLowerCase();
        if (!hay.includes(f.q)) return false;
      }
      return true;
    });
  }

  function renderColumns(){
    const cols = $('#columns'); cols.innerHTML = '';
    const counts = $('#counts'); counts.innerHTML = '';
    const items = filtered();
    const groupBy = currentFilters().groupView;
    const groupOrder = (state.groups || []).slice().sort((a,b) => (a.order||0) - (b.order||0));
    const groupName = id => (state.groups || []).find(g => g.id === id)?.name || id;

    (state.statuses || []).forEach(st => {
      const col = document.createElement('div');
      col.className = 'col'; col.dataset.st = st;
      const colItems = items.filter(i => i.status === st);
      col.innerHTML = '<h2><strong>' + esc(st) + '</strong><span class="n">' + colItems.length + '</span></h2>';
      if (groupBy) {
        groupOrder.forEach(g => {
          const sub = colItems.filter(i => i.group === g.id);
          if (!sub.length) return;
          const h = document.createElement('div'); h.className = 'grouphd'; h.textContent = g.name; col.appendChild(h);
          sub.forEach(i => col.appendChild(card(i)));
        });
      } else {
        colItems.forEach(i => col.appendChild(card(i)));
      }
      cols.appendChild(col);
      const c = document.createElement('span'); c.className = 'c'; c.textContent = st + ': ' + colItems.length; counts.appendChild(c);
    });
    const total = document.createElement('span'); total.className = 'c'; total.textContent = 'shown: ' + items.length + ' / ' + (state.items||[]).length; counts.appendChild(total);
  }

  function card(i){
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'card'; b.dataset.st = i.status; b.dataset.id = i.id;
    const refs = (i.refs && i.refs.length) ? '<span class="tag refs">' + esc(i.refs.join(' · ')) + '</span>' : '';
    b.innerHTML = '<h3><span class="id">' + esc(i.id) + '</span>' + esc(i.title) + '</h3>'
      + '<div class="row">'
      + (i.repo ? '<span class="tag repo">' + esc(i.repo) + '</span>' : '')
      + (i.priority ? '<span class="tag prio ' + esc(i.priority) + '">' + esc(i.priority) + '</span>' : '')
      + (i.owner ? '<span class="tag owner">' + esc(i.owner) + '</span>' : '')
      + (i.category ? '<span class="tag">' + esc(i.category) + '</span>' : '')
      + refs + '</div>'
      + (i.detail ? '<div class="det">' + esc(i.detail) + '</div>' : '');
    b.addEventListener('click', ev => {
      // Single click expands detail; double-click (or click on already-open) opens editor
      if (b.classList.contains('open')) openEdit(i.id);
      else b.classList.add('open');
      ev.stopPropagation();
    });
    b.addEventListener('dblclick', () => openEdit(i.id));
    return b;
  }

  function esc(s){ return (s == null ? '' : String(s)).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

  // ---------- editing ----------
  function openEdit(id){
    const i = (state.items || []).find(x => x.id === id);
    if (!i) return;
    const dlg = $('#editDlg');
    $('#edTitle').textContent = 'Edit — ' + i.id;
    $('#edId').value = i.id; $('#edTitleI').value = i.title || '';
    fillSelect($('#edGroup'),    (state.groups || []).map(g => ({v:g.id, l:g.name})));
    fillSelect($('#edStatus'),   (state.statuses || []).map(v => ({v, l:v})));
    fillSelect($('#edPriority'), (state.priorities || []).map(v => ({v, l:v})));
    fillSelect($('#edOwner'),    (state.owners || []).map(v => ({v, l:v})));
    $('#edGroup').value = i.group || ''; $('#edStatus').value = i.status || '';
    $('#edPriority').value = i.priority || ''; $('#edOwner').value = i.owner || '';
    $('#edRepo').value = i.repo || ''; $('#edCategory').value = i.category || '';
    $('#edRefs').value = (i.refs || []).join(', ');
    $('#edDetail').value = i.detail || '';
    dlg.returnValue = '';
    dlg.showModal();
    dlg.addEventListener('close', () => {
      if (dlg.returnValue === 'save') applyEdit(id);
      else if (dlg.returnValue === 'delete') deleteItem(id);
    }, { once: true });
  }
  function fillSelect(sel, items){
    sel.innerHTML = '';
    items.forEach(({v,l}) => sel.appendChild(opt(v, l)));
  }
  function applyEdit(id){
    const idx = (state.items || []).findIndex(x => x.id === id);
    if (idx < 0) return;
    const refs = $('#edRefs').value.split(',').map(s => s.trim()).filter(Boolean);
    state.items[idx] = {
      ...state.items[idx],
      title: $('#edTitleI').value.trim(),
      group: $('#edGroup').value,
      category: $('#edCategory').value.trim(),
      status: $('#edStatus').value,
      priority: $('#edPriority').value,
      owner: $('#edOwner').value,
      repo: $('#edRepo').value.trim(),
      refs,
      detail: $('#edDetail').value
    };
    touch();
  }
  function deleteItem(id){
    if (!confirm('Delete item ' + id + '?')) return;
    state.items = (state.items || []).filter(x => x.id !== id);
    touch();
  }
  function newItem(){
    const id = nextId();
    const i = { id, group: (state.groups[0]?.id || ''), title: 'New item', category: '', status: 'proposed', priority: 'med', owner: 'you', repo: '', refs: [], detail: '' };
    state.items = state.items || []; state.items.push(i);
    touch();
    openEdit(id);
  }
  function nextId(){
    // simple monotonic: max numeric suffix per group prefix, else N-001
    const ids = (state.items || []).map(x => x.id);
    let n = 1; while (ids.includes('N-' + String(n).padStart(3, '0'))) n++;
    return 'N-' + String(n).padStart(3, '0');
  }

  function touch(){
    state.updated = new Date().toISOString().slice(0, 10);
    try { localStorage.setItem(LS_DATA, JSON.stringify(state)); localStorage.setItem(LS_DIRTY, '1'); } catch {}
    markDirty(true, 'unsaved changes');
    renderAll();
  }

  function markDirty(d, msg){
    const el = $('#saveState');
    el.classList.remove('ok','err','dirty');
    if (d){ el.classList.add('dirty'); el.textContent = msg || 'unsaved'; $('#chipDirty').hidden = false; }
    else  { el.classList.add('ok');    el.textContent = msg || 'saved';   $('#chipDirty').hidden = true; }
  }

  // ---------- GitHub Contents API ----------
  async function refreshBaseSha(){
    if (!settings.pat) return null;
    const u = ghUrl();
    const r = await fetch(u + '?ref=' + encodeURIComponent(settings.branch), { headers: ghHeaders() });
    if (r.status === 404) { baseSha = null; return null; }
    if (!r.ok) throw new Error('GET ' + r.status);
    const j = await r.json(); baseSha = j.sha || null; return baseSha;
  }
  function ghUrl(){ return 'https://api.github.com/repos/' + encodeURIComponent(settings.owner) + '/' + encodeURIComponent(settings.repo) + '/contents/' + settings.path.split('/').map(encodeURIComponent).join('/'); }
  function ghHeaders(){ return { 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Authorization': 'Bearer ' + settings.pat }; }

  async function saveToGitHub(){
    if (!settings.pat){ openSettings(); toast('Add a PAT in Settings to enable Save', 'err'); return; }
    try {
      await refreshBaseSha();
      const body = {
        message: settings.message || 'board: update roadmap.json',
        content: b64utf8(JSON.stringify(state, null, 2) + '\n'),
        branch: settings.branch
      };
      if (baseSha) body.sha = baseSha;
      const r = await fetch(ghUrl(), { method: 'PUT', headers: ghHeaders(), body: JSON.stringify(body) });
      if (!r.ok){
        const t = await r.text();
        throw new Error(r.status + ' ' + t.slice(0, 200));
      }
      const j = await r.json(); baseSha = j.content?.sha || baseSha;
      localStorage.setItem(LS_DIRTY, '0');
      markDirty(false, 'saved to ' + settings.branch);
      toast('Committed roadmap.json to ' + settings.owner + '/' + settings.repo + '@' + settings.branch, 'ok');
    } catch (e){
      console.error(e);
      markDirty(true, 'save failed');
      toast('Save failed: ' + e.message, 'err');
    }
  }
  function b64utf8(s){
    // UTF-8 safe base64 for the Contents API
    return btoa(unescape(encodeURIComponent(s)));
  }

  // ---------- settings / import / export ----------
  function openSettings(){
    $('#setPat').value = settings.pat || '';
    $('#setOwner').value = settings.owner; $('#setRepo').value = settings.repo;
    $('#setBranch').value = settings.branch; $('#setPath').value = settings.path;
    $('#setMsg').value = settings.message;
    const dlg = $('#setDlg'); dlg.showModal();
    dlg.addEventListener('close', () => {
      if (dlg.returnValue === 'save'){
        saveSettings({
          pat: $('#setPat').value.trim(),
          owner: $('#setOwner').value.trim() || 'yulinl2',
          repo: $('#setRepo').value.trim() || 'yulinl2.github.io',
          branch: $('#setBranch').value.trim() || 'main',
          path: $('#setPath').value.trim() || DEFAULT_SETTINGS.path,
          message: $('#setMsg').value.trim() || DEFAULT_SETTINGS.message
        });
        renderHeader();
        toast('Settings saved', 'ok');
        refreshBaseSha().catch(() => {});
      } else if (dlg.returnValue === 'forget'){
        saveSettings({ ...settings, pat: '' });
        toast('PAT forgotten', 'ok');
      }
    }, { once: true });
  }
  function exportJson(){
    const blob = new Blob([JSON.stringify(state, null, 2) + '\n'], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'roadmap-' + (state.updated || 'snapshot') + '.json'; a.click();
  }
  function importJson(){
    $('#impText').value = '';
    const dlg = $('#impDlg'); dlg.showModal();
    dlg.addEventListener('close', () => {
      if (dlg.returnValue !== 'apply') return;
      try {
        const parsed = JSON.parse($('#impText').value);
        if (!parsed.items) throw new Error('missing items[]');
        state = parsed; touch();
        toast('Imported', 'ok');
      } catch (e){ toast('Import failed: ' + e.message, 'err'); }
    }, { once: true });
  }

  // ---------- UI wiring ----------
  function bindUI(){
    ['q','fGroup','fStatus','fOwner','fPriority','fRepo','fViewGroup'].forEach(id => {
      $('#' + id).addEventListener('input',  renderColumns);
      $('#' + id).addEventListener('change', renderColumns);
    });
    $('#btnSave').addEventListener('click', saveToGitHub);
    $('#btnSettings').addEventListener('click', openSettings);
    $('#btnExport').addEventListener('click', exportJson);
    $('#btnImport').addEventListener('click', importJson);
    $('#btnNew').addEventListener('click', newItem);
    window.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's'){ e.preventDefault(); saveToGitHub(); }
    });
  }

  let toastTimer = null;
  function toast(msg, kind){
    const t = $('#toast'); t.textContent = msg; t.className = 'toast' + (kind ? ' ' + kind : '');
    t.hidden = false; clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 3500);
  }
})();
