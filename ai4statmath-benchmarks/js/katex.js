// ── KATEX ──────────────────────────────────────────────────────
// Queue-based render: if KaTeX auto-render hasn't loaded yet, elements queue and
// are drained when the <head> script's onload fires window._flushKatex().
// window._flushKatex is assigned at module-eval time so the onload (which may run
// before OR after this module executes — see MIGRATION_SPEC G2) can find it.
const _kq=[];
function _rk(el){try{renderMathInElement(el,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false},{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false}],throwOnError:false})}catch{}}
function _flushKatex(){_kq.forEach(el=>_rk(el));_kq.length=0}

export function renderK(el){if(window._katexReady&&window.renderMathInElement)_rk(el);else _kq.push(el)}

// Expose for the head onload handler (order-independent flush).
window._flushKatex=_flushKatex;
// If KaTeX already finished loading before this module ran, drain immediately.
if(window._katexReady) _flushKatex();
