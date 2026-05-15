/* StatsUpAI revamp — minimal vanilla JS */
(function () {
  "use strict";

  // Mobile nav
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Quote rotator (accessible, pauses on hover/focus, respects reduced motion)
  var qbox = document.querySelector(".quotes");
  if (qbox) {
    var qs = Array.prototype.slice.call(qbox.querySelectorAll(".q"));
    var dotsWrap = document.querySelector(".quote-dots");
    var i = 0, timer = null;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    qs.forEach(function (_, idx) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show quote " + (idx + 1));
      b.addEventListener("click", function () { show(idx); restart(); });
      dotsWrap.appendChild(b);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function show(n) {
      i = (n + qs.length) % qs.length;
      qs.forEach(function (q, idx) { q.classList.toggle("active", idx === i); });
      dots.forEach(function (d, idx) { d.setAttribute("aria-selected", String(idx === i)); });
    }
    function restart() {
      if (reduce) return;
      clearInterval(timer);
      timer = setInterval(function () { show(i + 1); }, 6500);
    }
    show(0);
    restart();
    qbox.addEventListener("mouseenter", function () { clearInterval(timer); });
    qbox.addEventListener("mouseleave", restart);
    qbox.addEventListener("focusin", function () { clearInterval(timer); });
    qbox.addEventListener("focusout", restart);
  }

  // Team rendering
  var grid = document.getElementById("team-grid");
  var roster = document.getElementById("team-roster");
  if (grid && window.STATSUPAI_TEAM) {
    var team = window.STATSUPAI_TEAM;
    grid.innerHTML = team.map(function (m) {
      var img = '<img src="assets/img/team/' + m.img + '" alt="' + m.name +
        '" width="96" height="96" loading="lazy" decoding="async">';
      var inner =
        img +
        '<h3>' + m.name + '</h3>' +
        '<p class="role">' + m.role + '</p>' +
        '<p class="aff">' + m.aff + '</p>';
      return '<div class="member">' +
        (m.url ? '<a href="' + m.url + '" style="color:inherit" target="_blank" rel="noopener">' + inner + '</a>' : inner) +
        '</div>';
    }).join("");
  }
  if (roster && window.STATSUPAI_TEAM) {
    roster.innerHTML = window.STATSUPAI_TEAM
      .slice()
      .sort(function (a, b) { return a.name.localeCompare(b.name); })
      .map(function (m) {
        return '<li><strong>' + m.name + '</strong>, ' + m.role + ' — ' + m.aff + '</li>';
      }).join("");
  }

  // Footer year
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
