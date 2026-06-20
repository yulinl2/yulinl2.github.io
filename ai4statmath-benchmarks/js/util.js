// ── UTILS ──────────────────────────────────────────────────────
// Pure helpers with no DOM or state dependencies.

export function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

export function _jsq(s){return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}

// ── LATEX PREPROCESS ───────────────────────────────────────────
// Strips display/inline math from preview text so raw LaTeX tokens ($x_0$)
// don't appear as noise in the collapsed card preview. Replaced with □.
export function stripTex(s){
  return String(s)
    .replace(/\$\$[\s\S]*?\$\$/g,'□')
    .replace(/\\\[[\s\S]*?\\\]/g,'□')
    .replace(/\\\([\s\S]*?\\\)/g,'□')
    .replace(/\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\}/g,'□')
    .replace(/\$[^$\n]{1,120}\$/g,'□');
}

// Wraps bare display-math environments in \[...\] so KaTeX auto-render finds them.
// Group 1 (already-delimited) is returned unchanged; group 2 (bare env) gets wrapped.
export function prepTex(s){
  return String(s).replace(
    /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])|(\\begin\{(?:equation|align|gather|multline|flalign)[*]?\}[\s\S]*?\\end\{(?:equation|align|gather|multline|flalign)[*]?\})/g,
    function(m,d){return d?m:'\\[\n'+m+'\n\\]';});
}
