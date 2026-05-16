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

  /* ---------------- Events ---------------- */
  var evRoot = document.getElementById("events-root");
  if (evRoot) {
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
          month: "short", day: "numeric", year: "numeric"
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
          "DESCRIPTION:" + (data.series[t.series] ? data.series[t.series].label : t.series) +
            (t.registration_link ? "\\nRegister: " + t.registration_link : ""),
          "END:VEVENT", "END:VCALENDAR"
        ];
        return "data:text/calendar;charset=utf-8," + encodeURIComponent(lines.join("\r\n"));
      }
      function card(t, isUpcoming) {
        var ser = data.series[t.series] ? data.series[t.series].label : t.series;
        var actions = isUpcoming
          ? (t.registration_link
              ? '<a class="btn btn-primary btn-sm" href="' + esc(t.registration_link) + '" target="_blank" rel="noopener">Register</a>'
              : "") +
            '<a class="btn btn-ghost btn-sm" href="' + ics(t) + '" download="statsupai-' + t.date + '.ics">Add to calendar</a>'
          : (t.recording_link
              ? '<a class="btn btn-ghost btn-sm" href="' + esc(t.recording_link) + '" target="_blank" rel="noopener">Watch recording</a>'
              : '<span class="meta">Recording TBA</span>');
        var d = el("div", "event");
        d.innerHTML =
          '<span class="date">' + fmt(t.date) + " · " + esc(t.time_et) + " ET</span>" +
          '<span class="badge">' + esc(t.series) + "</span>" +
          "<h3>" + esc(t.title) + "</h3>" +
          '<p class="meta">' + esc(t.speaker) + " · " + esc(t.affiliation) + " · <em>" + esc(ser) + "</em></p>" +
          '<div class="event-actions">' + actions + "</div>";
        return d;
      }

      var html = "";
      var up = el("div");
      up.appendChild(el("div", "section-head",
        '<div class="kicker">Upcoming</div><h2>Next talks</h2>'));
      if (upcoming.length) {
        var tl = el("div", "timeline");
        upcoming.forEach(function (t) { tl.appendChild(card(t, true)); });
        up.appendChild(tl);
      } else {
        up.appendChild(el("p", "meta", "No upcoming talks scheduled — check back soon."));
      }

      var pa = el("div");
      pa.style.marginTop = "48px";
      pa.appendChild(el("div", "section-head",
        '<div class="kicker">Archive</div><h2>Past talks</h2>'));
      if (past.length) {
        var tl2 = el("div", "timeline");
        past.forEach(function (t) { tl2.appendChild(card(t, false)); });
        pa.appendChild(tl2);
      } else {
        pa.appendChild(el("p", "meta", "Archive coming soon."));
      }

      evRoot.innerHTML = "";
      evRoot.appendChild(up);
      evRoot.appendChild(pa);

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
