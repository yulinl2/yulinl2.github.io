/* Decision board — renders roadmap.json into status columns with
   category filter + search, plus the reference-links.json paste log. */
(function () {
  "use strict";
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function get(p){return fetch(p,{cache:"no-cache"}).then(function(r){if(!r.ok)throw 0;return r.json();});}

  var board = document.getElementById("board");
  if (board) {
    get("assets/data/roadmap.json").then(function (data) {
      var items = data.items || [];
      var statuses = data.statuses || ["proposed","in-progress","blocked","decided","done"];
      var cats = items.map(function(i){return i.category;}).filter(function(v,i,a){return a.indexOf(v)===i;}).sort();
      var bar = document.getElementById("board-bar");
      var cols = document.getElementById("board-cols");
      var activeCat = "All", q = "";

      var stats = document.createElement("div");
      stats.className = "board-stats";
      var sel = document.createElement("select");
      sel.className = "res-search"; sel.style.flex = "0 0 auto";
      sel.setAttribute("aria-label", "Filter by category");
      ["All"].concat(cats).forEach(function(c){var o=document.createElement("option");o.value=c;o.textContent=c;sel.appendChild(o);});
      var search = document.createElement("input");
      search.type="search"; search.className="res-search"; search.placeholder="Search items…";
      search.setAttribute("aria-label","Search roadmap items");
      bar.appendChild(stats); bar.appendChild(sel); bar.appendChild(search);

      function paint() {
        var shown = items.filter(function(i){
          var mc = activeCat==="All"||i.category===activeCat;
          var hay = (i.id+" "+i.title+" "+i.detail+" "+i.category+" "+i.owner).toLowerCase();
          return mc && hay.indexOf(q)!==-1;
        });
        stats.innerHTML = statuses.map(function(s){
          var n = shown.filter(function(i){return i.status===s;}).length;
          return '<span class="pill"><b>'+n+'</b> '+esc(s)+'</span>';
        }).join("") + '<span class="pill"><b>'+shown.length+'</b> shown</span>';
        cols.innerHTML = statuses.map(function(s){
          var list = shown.filter(function(i){return i.status===s;});
          var tickets = list.map(function(i){
            return '<article class="ticket st-'+esc(i.status)+'">'+
              '<div class="tid">'+esc(i.id)+'</div>'+
              '<h3>'+esc(i.title)+'</h3>'+
              '<p>'+esc(i.detail)+'</p>'+
              '<div class="meta">'+
                '<span class="chip-sm">'+esc(i.category)+'</span>'+
                '<span class="chip-sm owner-'+esc(i.owner)+'">'+(i.owner==="you"?"needs you":"Claude")+'</span>'+
                '<span class="chip-sm pri-'+esc(i.priority)+'">'+esc(i.priority)+'</span>'+
              '</div></article>';
          }).join("");
          return '<div class="col" data-empty="'+(list.length?0:1)+'">'+
            '<h2>'+esc(s)+' <span class="n">'+list.length+'</span></h2>'+
            (tickets||'<p class="meta" style="color:var(--muted);font-size:.85rem">—</p>')+'</div>';
        }).join("");
      }
      sel.addEventListener("change",function(){activeCat=sel.value;paint();});
      search.addEventListener("input",function(){q=search.value.trim().toLowerCase();paint();});
      paint();
      var u=document.getElementById("rm-updated"); if(u&&data.updated)u.textContent=data.updated;
    }).catch(function(){ board.innerHTML="<p>Could not load roadmap.json.</p>"; });
  }

  var refsEl = document.getElementById("refs");
  if (refsEl) {
    get("assets/data/reference-links.json").then(function (data) {
      var refs = (data.refs||[]).concat(data.unsorted||[]);
      if (!refs.length) { refsEl.innerHTML = '<p class="meta" style="color:var(--muted)">No reference links yet.</p>'; return; }
      refsEl.innerHTML = refs.map(function(r){
        return '<li><span class="rd">'+esc(r.match_date||"unsorted")+'</span>'+
          '<a href="'+esc(r.url)+'" target="_blank" rel="noopener">'+esc(r.platform||"link")+'</a>'+
          (r.note?' — '+esc(r.note):'')+'</li>';
      }).join("");
    }).catch(function(){ refsEl.innerHTML='<p>Could not load reference-links.json.</p>'; });
  }
})();
