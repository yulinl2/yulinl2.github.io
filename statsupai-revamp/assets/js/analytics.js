/* Privacy-respecting analytics loader.
   Disabled by default. To enable on the production domain, set MEASUREMENT_ID
   to the GA4 id (the original site used "G-ZF2MZCZ03F"). Honors Do Not Track
   and only loads on the production host so preview/forks don't pollute stats. */
(function () {
  "use strict";
  var MEASUREMENT_ID = "";                       // e.g. "G-ZF2MZCZ03F"
  var PROD_HOSTS = ["statsupai.org", "www.statsupai.org"];

  if (!MEASUREMENT_ID) return;
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
  if (PROD_HOSTS.indexOf(location.hostname) === -1) return;

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID, { anonymize_ip: true });
})();
