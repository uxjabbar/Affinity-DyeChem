/* Affinity DyeChem — site script */
(function () {
  "use strict";

  var WA_NUMBER = "923066192111";
  var GBP_LINK = ""; // Google Business Profile link — founder to provide
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.add("js");

  /* WhatsApp links: data-wa="message" -> wa.me link */
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(a.getAttribute("data-wa"));
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* Google Business Profile link (hidden until we have it) */
  document.querySelectorAll("[data-gbp]").forEach(function (a) {
    if (GBP_LINK) { a.href = GBP_LINK; a.target = "_blank"; a.rel = "noopener"; }
    else { a.hidden = true; }
  });

  /* Header: solid white once we scroll off the navy hero */
  var header = document.querySelector("[data-header]");
  function onScroll() {
    if (header) header.classList.toggle("is-solid", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile menu */
  var menuBtn = document.querySelector("[data-menu-btn]");
  var menu = document.querySelector("[data-menu]");
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") !== "true";
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.hidden = !open;
      header.classList.toggle("menu-open", open);
    });
  }

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Count-up numbers */
  var counters = document.querySelectorAll("[data-count]");
  function countUp(el) {
    var end = parseInt(el.getAttribute("data-count"), 10);
    var start = null, dur = 1400;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && !reduceMotion) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { el.textContent = "0"; co.observe(el); });
  }

  /* Chemicals by process: highlight the line nearest the middle of the screen */
  var processItems = document.querySelectorAll("[data-process-list] li");
  if (processItems.length) {
    var ticking = false;
    function highlight() {
      ticking = false;
      var mid = window.innerHeight * 0.5, best = null, bestDist = Infinity;
      processItems.forEach(function (li) {
        var r = li.getBoundingClientRect();
        var d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestDist) { bestDist = d; best = li; }
      });
      processItems.forEach(function (li) { li.classList.toggle("is-active", li === best && bestDist < window.innerHeight * 0.35); });
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(highlight); }
    }, { passive: true });
    highlight();
  }

  /* Affinitone chips from data/products.json */
  var chipTrack = document.querySelector("[data-chips]");
  if (chipTrack) {
    fetch("data/products.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var html = data.affinitone.map(function (p) {
          var hex = data.shades[p.shade] || "transparent";
          var white = p.shade === "white" ? " is-white" : "";
          return '<li class="chip"><span class="chip-swatch' + white + '" style="background:' + hex + '"></span>' +
                 '<span><strong>Affinitone</strong> ' + p.name + ' <code>' + p.code + '</code></span></li>';
        }).join("");
        // Two copies so the loop is seamless
        chipTrack.innerHTML = html + html.replace(/<li class="chip">/g, '<li class="chip" aria-hidden="true">');
      })
      .catch(function () { chipTrack.parentElement.hidden = true; });
  }
})();
