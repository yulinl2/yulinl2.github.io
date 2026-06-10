/* Data-driven rendering for resources (datasets/articles/pipelines) and events.
   Single source: assets/data/*.json. Progressive enhancement — static
   <noscript> fallbacks in the HTML stay crawlable if this never runs. */
(function () {
  "use strict";

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function getJSON(path) {
    return fetch(path, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(path + " " + r.status);
      return r.json();
    });
  }

  /* ---------------- Resources (search + filter) ---------------- */
  var resRoot = document.querySelector("[data-resources]");
  if (resRoot) {
    var kind = resRoot.getAttribute("data-resources"); // datasets|articles|pipelines
    getJSON("assets/data/resources.json").then(function (data) {
      var items = data[kind] || [];
      var tags = ["All"].concat(
        items.map(function (i) { return i.tag; })
          .filter(function (v, i, a) { return a.indexOf(v) === i; })
      );

      var controls = el("div", "res-controls");
      var search = el("input", "res-search");
      search.type = "search";
      search.placeholder = "Search " + kind + "…";
      search.setAttribute("aria-label", "Search " + kind);
      var filterWrap = el("div", "res-filters");
      filterWrap.setAttribute("role", "group");
      filterWrap.setAttribute("aria-label", "Filter by topic");
      controls.appendChild(search);
      controls.appendChild(filterWrap);

      var grid = el("div", "grid cols-3");
      resRoot.innerHTML = "";
      resRoot.appendChild(controls);
      resRoot.appendChild(grid);
      var empty = el("p", "res-empty", "No matches. Try a different search.");
      empty.hidden = true;
      resRoot.appendChild(empty);

      var activeTag = "All", q = "";
      tags.forEach(function (t) {
        var b = el("button", "chip" + (t === "All" ? " on" : ""), esc(t));
        b.type = "button";
        b.addEventListener("click", function () {
          activeTag = t;
          filterWrap.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("on"); });
          b.classList.add("on");
          paint();
        });
        filterWrap.appendChild(b);
      });

      function paint() {
        grid.innerHTML = "";
        var shown = items.filter(function (i) {
          var matchTag = activeTag === "All" || i.tag === activeTag;
          var hay = (i.title + " " + i.desc + " " + i.tag).toLowerCase();
          return matchTag && hay.indexOf(q) !== -1;
        });
        empty.hidden = shown.length !== 0;
        shown.forEach(function (i) {
          var c = el("article", "card");
          c.innerHTML =
            '<h3><a href="' + esc(i.url) + '" target="_blank" rel="noopener">' + esc(i.title) + "</a></h3>" +
            "<p>" + esc(i.desc) + "</p>" +
            '<ul class="tag-row"><li class="tag">' + esc(i.tag) + "</li></ul>" +
            '<a class="more" href="' + esc(i.url) + '" target="_blank" rel="noopener">Open resource</a>';
          grid.appendChild(c);
        });
      }
      search.addEventListener("input", function () { q = search.value.trim().toLowerCase(); paint(); });
      paint();

      // ItemList JSON-LD for crawlers
      var ld = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "StatsUpAI " + kind,
        itemListElement: items.map(function (i, n) {
          return { "@type": "ListItem", position: n + 1, url: i.url, name: i.title };
        })
      };
      var s = el("script");
      s.type = "application/ld+json";
      s.textContent = JSON.stringify(ld);
      document.head.appendChild(s);
    }).catch(function () { /* keep noscript fallback */ });
  }

  /* ---------------- Community feed ---------------- */
  var coRoot = document.querySelector("[data-community]");
  if (coRoot) {
    getJSON("assets/data/community.json").then(function (c) {
      var chips = c.categories.map(function (k) {
        return '<a class="chip" href="' + esc(c.feed) + '" target="_blank" rel="noopener">' +
          esc(k.name) + ' <b>' + k.count + "</b></a>";
      }).join("");
      var posts = c.recent.map(function (p) {
        return '<li class="co-post">' +
          '<span class="co-date">' + new Date(p.date + "T00:00:00").toLocaleDateString("en-US",
            { month: "short", day: "numeric", year: "numeric" }) + "</span>" +
          '<a href="' + esc(c.base + p.file) + '" target="_blank" rel="noopener">' + esc(p.title) + "</a>" +
          '<span class="co-cat">' + esc(p.cat) + "</span></li>";
      }).join("");
      coRoot.innerHTML = "";
      var wrap = el("div");
      wrap.innerHTML =
        '<div class="res-filters" style="margin-bottom:26px">' + chips + "</div>" +
        '<div class="ev-series-head"><h2>Latest posts</h2><span class="sub">' +
        c.total + " in the feed</span></div>" +
        '<ul class="co-list">' + posts + "</ul>" +
        '<p style="margin-top:22px"><a class="btn btn-primary" href="' + esc(c.feed) +
        '" target="_blank" rel="noopener">Browse the full community feed ↗</a></p>';
      coRoot.appendChild(wrap);
    }).catch(function () { /* keep noscript fallback */ });
  }

  /* ---------------- Review Articles (Zotero-driven) ---------------- */
  var arRoot = document.querySelector("[data-articles]");
  if (arRoot) {
    getJSON("assets/data/articles.json").then(function (cfg) {
      arRoot.innerHTML = "";
      var note = el("p", "res-empty");
      note.style.color = "var(--muted)";
      note.innerHTML = "Live from the StatsUpAI Zotero library — expand a topic to load its papers.";
      arRoot.appendChild(note);

      cfg.groups.forEach(function (g) {
        arRoot.appendChild(el("div", "ev-series-head", "<h2>" + esc(g.name) + "</h2>"));
        g.sections.forEach(function (sec) {
          var d = el("details", "ev-disc");
          d.style.borderTop = "0";
          d.innerHTML = '<summary><strong>' + esc(sec.title) +
            '</strong> &nbsp;<span style="color:var(--muted);font-weight:400" data-c>…</span></summary>' +
            '<div class="body" style="max-width:none"><p class="meta">Loading…</p></div>';
          var body = d.querySelector(".body");
          var cspan = d.querySelector("[data-c]");
          var loaded = false;
          d.addEventListener("toggle", function () {
            if (!d.open || loaded) return;
            loaded = true;
            fetch(cfg.api + sec.collection + "/items/top?format=json&sort=date&direction=desc&limit=100",
              { cache: "no-cache" })
              .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
              .then(function (items) {
                var rows = items.map(function (it) {
                  var x = it.data || {};
                  if (x.itemType === "note" || x.itemType === "attachment") return "";
                  var au = (x.creators || []).filter(function (c) { return c.creatorType === "author"; })[0] || {};
                  var who = au.lastName || au.name || "";
                  var pub = x.publicationTitle || x.bookTitle || x.repository || x.publisher || "";
                  var yr = (x.date || "").match(/\d{4}/);
                  var href = x.url || (x.DOI ? "https://doi.org/" + x.DOI : "");
                  var t = esc(x.title || "Untitled");
                  return "<li style=\"margin-bottom:9px\">" +
                    (href ? '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + t + "</a>" : t) +
                    '<br><span class="meta" style="font-size:.86rem">' +
                    (who ? esc(who) : "") + (pub ? " · " + esc(pub) : "") +
                    (yr ? " · " + yr[0] : "") + "</span></li>";
                }).filter(Boolean);
                cspan.textContent = rows.length + " papers";
                body.innerHTML = rows.length
                  ? '<ul style="padding-left:18px;margin:8px 0 0">' + rows.join("") + "</ul>" +
                    '<p style="margin-top:10px"><a href="' + esc(sec.source) +
                    '" target="_blank" rel="noopener">View on the StatsUpAI site ↗</a></p>'
                  : '<p class="meta">No papers in this collection yet. <a href="' +
                    esc(sec.source) + '" target="_blank" rel="noopener">Source ↗</a></p>';
              })
              .catch(function () {
                cspan.textContent = "";
                body.innerHTML = '<p class="meta">Couldn’t load the live list here. ' +
                  '<a href="' + esc(sec.source) + '" target="_blank" rel="noopener">' +
                  'View this topic on the StatsUpAI site ↗</a></p>';
              });
          });
          arRoot.appendChild(d);
        });
      });
    }).catch(function () { /* keep noscript fallback */ });
  }

  /* ---------------- Datasets directory ---------------- */
  var dsRoot = document.querySelector("[data-datasets]");
  if (dsRoot) {
    getJSON("assets/data/datasets-detail.json").then(function (data) {
      var cats = data.categories || [];
      var controls = el("div", "res-controls");
      var search = el("input", "res-search");
      search.type = "search";
      search.placeholder = "Search datasets…";
      search.setAttribute("aria-label", "Search datasets");
      controls.appendChild(search);
      var host = el("div");
      dsRoot.innerHTML = "";
      dsRoot.appendChild(controls);
      dsRoot.appendChild(host);
      var total = cats.reduce(function (n, c) { return n + (c.entries ? c.entries.length : 0); }, 0);
      var count = el("p", "res-empty");
      count.style.color = "var(--muted)";
      count.textContent = total + " resources across " + cats.length + " categories";
      controls.appendChild(count);

      function paint(q) {
        host.innerHTML = "";
        cats.forEach(function (c) {
          var entries = (c.entries || []).filter(function (e) {
            return !q || (e.name + " " + c.name + " " + c.tag).toLowerCase().indexOf(q) !== -1;
          });
          if (q && !entries.length && (c.name + c.intro).toLowerCase().indexOf(q) === -1) return;
          var d = el("details", "ev-disc");
          d.style.borderTop = "0";
          if (!q) d.open = false; else d.open = true;
          var rows = entries.map(function (e) {
            var pubs = (e.pubs || []).map(function (p, i) {
              return ' <a href="' + esc(p) + '" target="_blank" rel="noopener" style="font-size:.85em">[ref' +
                ((e.pubs.length > 1) ? " " + (i + 1) : "") + "]</a>";
            }).join("");
            return '<li style="margin-bottom:7px"><a href="' + esc(e.url) +
              '" target="_blank" rel="noopener">' + esc(e.name) + "</a>" + pubs + "</li>";
          }).join("");
          var body = c.external_only
            ? '<p>This category links to an external resource.</p>'
            : '<ul style="columns:2;column-gap:36px;margin:10px 0 0;padding-left:18px">' + rows + "</ul>";
          d.innerHTML =
            '<summary><strong>' + esc(c.name) + "</strong> &nbsp;<span style=\"color:var(--muted);font-weight:400\">" +
            (c.external_only ? "external" : entries.length + " resources") + "</span></summary>" +
            '<div class="body" style="max-width:none">' +
            "<p>" + esc(c.intro) + "</p>" + body +
            '<p style="margin-top:10px"><a href="' + esc(c.source) +
            '" target="_blank" rel="noopener">Full descriptions on the source page ↗</a></p></div>';
          host.appendChild(d);
        });
        if (!host.children.length) host.appendChild(el("p", "res-empty", "No matches."));
      }
      paint("");
      search.addEventListener("input", function () { paint(search.value.trim().toLowerCase()); });

      var ld = el("script");
      ld.type = "application/ld+json";
      ld.textContent = JSON.stringify({
        "@context": "https://schema.org", "@type": "ItemList",
        name: "StatsUpAI datasets",
        itemListElement: cats.map(function (c, i) {
          return { "@type": "ListItem", position: i + 1, name: c.name, url: c.source };
        })
      });
      document.head.appendChild(ld);
    }).catch(function () { /* keep noscript fallback */ });
  }

  /* ---------------- Events ---------------- */
  var evRoot = document.getElementById("events-root");
  if (evRoot) {
    var IC = {
      youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 12s0-3.2-.4-4.6a3 3 0 0 0-2.1-2.1C18.9 5 12 5 12 5s-6.9 0-8.5.3A3 3 0 0 0 1.4 7.4 32 32 0 0 0 1 12s0 3.2.4 4.6a3 3 0 0 0 2.1 2.1C5.1 19 12 19 12 19s6.9 0 8.5-.3a3 3 0 0 0 2.1-2.1c.4-1.4.4-4.6.4-4.6ZM10 15V9l5.2 3-5.2 3Z"/></svg>',
      zoom: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm15 2.2 3.4-2.3a.6.6 0 0 1 .9.5v9.2a.6.6 0 0 1-.9.5L18 14.8Z"/></svg>'
    };
    getJSON("assets/data/events.json").then(function (data) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var talks = (data.talks || []).slice().sort(function (a, b) {
        return a.date < b.date ? -1 : 1;
      });
      var upcoming = [], past = [];
      talks.forEach(function (t) {
        (new Date(t.date + "T00:00:00") >= today ? upcoming : past).push(t);
      });
      past.reverse();

      function fmt(d) {
        return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
          weekday: "short", month: "short", day: "numeric", year: "numeric"
        });
      }
      function ics(t) {
        var start = t.date.replace(/-/g, "");
        var lines = [
          "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//StatsUpAI//EN",
          "BEGIN:VEVENT",
          "UID:" + start + "-" + encodeURIComponent(t.speaker) + "@statsupai.org",
          "DTSTART;VALUE=DATE:" + start,
          "SUMMARY:" + t.title.replace(/[,;]/g, "") + " — " + t.speaker,
          "DESCRIPTION:" + (data.series[t.series] ? data.series[t.series].full : t.series) +
            (t.registration_link ? "\\nRegister: " + t.registration_link : ""),
          "END:VEVENT", "END:VCALENDAR"
        ];
        return "data:text/calendar;charset=utf-8," + encodeURIComponent(lines.join("\r\n"));
      }
      function disc(label, text) {
        if (!text) return "";
        return '<details class="ev-disc"><summary>' + esc(label) +
          '</summary><div class="body">' + esc(text) + "</div></details>";
      }
      function card(t, isUpcoming) {
        var sname = data.series[t.series] ? data.series[t.series].label : t.series;
        var spk = t.personal_website
          ? '<a href="' + esc(t.personal_website) + '" target="_blank" rel="noopener">' + esc(t.speaker_full || t.speaker) + "</a>"
          : esc(t.speaker_full || t.speaker);
        var platform = "";
        if (!isUpcoming && t.recording_link) {
          platform = '<span class="ev-platform">' + (IC[t.recording_platform] || "") +
            (t.recording_platform === "youtube" ? "Recording on YouTube" : "Recording available") + "</span>";
        } else if (isUpcoming && t.registration_link) {
          platform = '<span class="ev-platform">' + IC.zoom + "Online · Zoom (registration)</span>";
        }
        var cta = isUpcoming
          ? (t.registration_link
              ? '<a class="btn btn-primary btn-sm" href="' + esc(t.registration_link) + '" target="_blank" rel="noopener">Register</a>' : "") +
            '<a class="btn btn-ghost btn-sm" href="' + ics(t) + '" download="statsupai-' + t.date + '.ics">Add to calendar</a>'
          : (t.recording_link
              ? '<a class="btn btn-primary btn-sm" href="' + esc(t.recording_link) + '" target="_blank" rel="noopener">Watch recording</a>'
              : '<span class="ev-status">Recording TBA</span>');
        var c = el("article", "evcard s-" + esc(t.series) + (isUpcoming ? "" : " is-past"));
        c.innerHTML =
          '<div class="pad">' +
          '<div class="ev-top">' +
            '<span class="ev-chip">' + esc(sname) + "</span>" +
            '<span class="ev-when">' + fmt(t.date) + " · " + esc(t.time_et) + " ET</span>" +
            '<span class="ev-status ' + (isUpcoming ? "up" : "") + '">' + (isUpcoming ? "Upcoming" : "Past") + "</span>" +
          "</div>" +
          "<h3>" + esc(t.title) + "</h3>" +
          '<p class="ev-speaker">' + spk + ' <span class="aff">· ' + esc(t.affiliation) + "</span></p>" +
          (platform ? '<p style="margin:6px 0 0">' + platform + "</p>" : "") +
          disc("Abstract", t.abstract) +
          disc("Speaker bio", t.bio) +
          '<div class="ev-cta">' + cta + "</div>" +
          "</div>";
        return c;
      }
      function section(title, sub, arr, isUp, emptyMsg) {
        var wrap = el("div");
        wrap.innerHTML = '<div class="ev-series-head"><h2>' + esc(title) +
          '</h2><span class="sub">' + esc(sub) + "</span></div>";
        if (arr.length) {
          var list = el("div", "ev-list");
          arr.forEach(function (t) { list.appendChild(card(t, isUp)); });
          wrap.appendChild(list);
        } else {
          wrap.appendChild(el("p", "ev-empty", emptyMsg));
        }
        return wrap;
      }

      evRoot.innerHTML = "";
      evRoot.appendChild(section("Upcoming", upcoming.length + " scheduled", upcoming, true,
        "No upcoming talks scheduled — check back soon."));
      var pastWrap = section("Past talks", past.length + " in the archive", past, false,
        "Archive coming soon.");
      pastWrap.style.marginTop = "44px";
      evRoot.appendChild(pastWrap);

      // Event JSON-LD (Google event rich results)
      var ld = talks.map(function (t) {
        return {
          "@context": "https://schema.org",
          "@type": "Event",
          name: t.title,
          startDate: t.date,
          eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: { "@type": "VirtualLocation", url: t.registration_link || "https://statsupai.org/events/webinars/" },
          organizer: { "@type": "Organization", name: "StatsUpAI", url: "https://statsupai.org" },
          performer: { "@type": "Person", name: t.speaker },
          description: (data.series[t.series] ? data.series[t.series].label : t.series)
        };
      });
      var s = el("script");
      s.type = "application/ld+json";
      s.textContent = JSON.stringify(ld);
      document.head.appendChild(s);
    }).catch(function () { /* keep noscript fallback */ });
  }
})();
