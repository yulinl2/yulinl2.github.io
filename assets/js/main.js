// Minimal, dependency-free interactions.
(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Reveal-on-scroll for cards / timeline items
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = document.querySelectorAll("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.style.opacity = 1; });
    return;
  }
  targets.forEach(function (el) {
    el.style.opacity = 0;
    el.style.transform = "translateY(9px)";
    el.style.transition = "opacity .45s ease, transform .45s ease";
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        var el = en.target;
        var d = el.getAttribute("data-reveal") || 0;
        el.style.transitionDelay = (d * 40) + "ms";
        el.style.opacity = 1;
        el.style.transform = "none";
        io.unobserve(el);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach(function (el) { io.observe(el); });
})();
