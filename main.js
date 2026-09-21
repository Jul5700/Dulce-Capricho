/* =============================================================
   DULCE CAPRICHO — main.js
   Vanilla JS, patrón IIFE. Cada init() está aislado con safe()
   para que si uno falla, el resto del sitio siga funcionando.
   No usa módulos ni librerías externas: funciona igual abriendo
   el archivo directamente (file://) que subido a hosting.
   ============================================================= */
(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    var toggle = $("#navToggle");
    var links = $("#navLinks");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    $$("a", links).forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Sticky nav: transparent -> solid ---------- */
  function initNavSolidify() {
    var header = $("header[data-nav]");
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 40) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Smooth anchor scrolling (accounts for fixed header) ---------- */
  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var top = el.getBoundingClientRect().top + window.scrollY - 82;
      window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Reveal on scroll (universal, with safety net) ---------- */
  function initReveals() {
    var els = $$("[data-reveal]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-revealed"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(function (el) { io.observe(el); });

    // Safety net: after 6s, reveal anything still hidden above the fold
    setTimeout(function () {
      els.forEach(function (el) {
        if (!el.classList.contains("is-revealed") && el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-revealed");
        }
      });
    }, 6000);
  }

  /* ---------- Tilt 3D subtle (cards) ---------- */
  function initTilt() {
    if (!fineHover) return;
    $$(".flavor-card, .team-card").forEach(function (card) {
      var MAX = 6;
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      card.classList.add("has-tilt");
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        tx = -py * MAX; ty = px * MAX;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener("mouseleave", function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      function loop() {
        cx += (tx - cx) * 0.15; cy += (ty - cy) * 0.15;
        card.style.setProperty("--rx", cx.toFixed(2) + "deg");
        card.style.setProperty("--ry", cy.toFixed(2) + "deg");
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(loop) : null;
      }
       /* Mostrar al equipo en 1 sola fila horizontal de 5 columnas */
  .team-grid {
    display: grid !important;
    grid-template-columns: repeat(5, 1fr) !important;
    gap: 15px;
    align-items: stretch;
  }

  /* Reducir el tamaño de los avatares para que entren cómodamente */
  .team-avatar {
    width: 80px;
    height: 80px;
    margin: 0 auto;
  }

  /* Ajustar el espacio interno de las tarjetas */
  .team-card {
    padding: 15px 10px;
  }

  /* Adaptar a 2 o 3 columnas en pantallas más pequeñas (celulares/tablets) */
  @media (max-width: 900px) {
    .team-grid {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }

  @media (max-width: 600px) {
    .team-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
    });
  }

  /* ---------- Custom cursor (two clean circles) ---------- */
  function initCursor() {
    var root = $("[data-cursor-root]");
    if (!root || !fineHover) return;
    document.documentElement.classList.add("has-cursor");
    var ring = $(".cursor-ring", root);
    var dot = $(".cursor-dot", root);
    var tx = 0, ty = 0, rx = 0, ry = 0, firstMove = false;

    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (dot) dot.style.transform = "translate3d(" + tx + "px," + ty + "px,0)";
      if (!firstMove) {
        firstMove = true; rx = tx; ry = ty;
        if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
        root.classList.add("is-ready");
      }
    }, { passive: true });

    function tick() {
      rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18;
      if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    var HOVERABLES = "a, button, .flavor-card, .team-card, [data-cursor]";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(HOVERABLES)) root.classList.add("is-interactive");
    });
    document.addEventListener("mouseout", function (e) {
      var related = e.relatedTarget;
      if (e.target.closest && e.target.closest(HOVERABLES)) {
        if (!related || !(related.closest && related.closest(HOVERABLES))) {
          root.classList.remove("is-interactive");
        }
      }
    });
  }

  /* ---------- Story video: respect reduced motion, pause off-screen ---------- */
  function initStoryVideo() {
    var video = $("[data-story-video]");
    if (!video) return;

    if (reduced) {
      // Autoplay looping video counts as intrusive motion — don't force it.
      video.removeAttribute("autoplay");
      video.pause();
      video.setAttribute("controls", "");
      return;
    }

    // Pause when scrolled out of view, resume when visible (saves battery/CPU).
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) video.play().catch(function () {});
          else video.pause();
        });
      }, { threshold: 0.25 });
      io.observe(video);
    }
  }

  /* ---------- Footer year from manifest (enrichment only) ---------- */
  function initFooterYear() {
    var el = $("[data-year]");
    if (!el || !data.foundedYear) return;
    var now = new Date().getFullYear();
    el.textContent = now > data.foundedYear ? now : data.foundedYear;
  }

  function boot() {
    safe(initMobileNav, "initMobileNav");
    safe(initNavSolidify, "initNavSolidify");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initReveals, "initReveals");
    safe(initTilt, "initTilt");
    safe(initCursor, "initCursor");
    safe(initStoryVideo, "initStoryVideo");
    safe(initFooterYear, "initFooterYear");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
