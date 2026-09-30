/* ============================================================
   ecd-whatsapp.js: floating WhatsApp button (same look as the
   main TrafficMENA platform: green 56px circle, bottom-left).
   Usage: <script src="ecd-whatsapp.js?v=..." defer></script>

   It never covers a sticky bottom bar: any element marked with
   data-ecd-bottom-bar (Home "Get Ticket" bar, checkout pay bar)
   lifts the button above it while that bar is visible.
   ============================================================ */
(function () {
  "use strict";

  var WHATSAPP_URL =
    "https://wa.me/201505437979?text=I%20need%20help%20for%20Ecommerce%20Day%202026";
  var GAP = 16;

  function init() {
    if (document.getElementById("ecdWhatsApp")) return;

    var style = document.createElement("style");
    style.textContent =
      ".ecd-wa{position:fixed;z-index:190;" +
      "left:calc(" + GAP + "px + env(safe-area-inset-left, 0px));" +
      "bottom:calc(" + GAP + "px + var(--ecd-bottom-bar, 0px) + env(safe-area-inset-bottom, 0px));" +
      "width:56px;height:56px;border-radius:50%;background:#25D366;color:#fff;" +
      "display:flex;align-items:center;justify-content:center;" +
      "box-shadow:0 10px 24px rgba(16,16,16,.18);text-decoration:none;" +
      "transition:transform .2s ease,bottom .2s ease}" +
      ".ecd-wa:hover{transform:scale(1.05)}" +
      ".ecd-wa:focus-visible{outline:2px solid #101010;outline-offset:3px}" +
      ".ecd-wa svg{width:28px;height:28px;display:block}" +
      "@media (prefers-reduced-motion:reduce){.ecd-wa{transition:none}.ecd-wa:hover{transform:none}}" +
      "@media print{.ecd-wa{display:none}}";
    document.head.appendChild(style);

    var a = document.createElement("a");
    a.id = "ecdWhatsApp";
    a.className = "ecd-wa";
    a.href = WHATSAPP_URL;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute("aria-label", "Chat with us on WhatsApp (opens in a new tab)");
    a.innerHTML =
      '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false">' +
      '<path d="M19.11 17.27c-.28-.14-1.63-.8-1.88-.89-.25-.09-.43-.14-.61.14s-.7.89-.86 1.08c-.16.19-.31.21-.58.07-.28-.14-1.16-.43-2.2-1.37-.81-.72-1.35-1.62-1.5-1.89-.16-.28-.02-.43.12-.57.12-.12.28-.31.42-.47.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.61-1.48-.84-2.03-.22-.52-.45-.45-.61-.46h-.52c-.19 0-.49.07-.75.35-.25.28-.98.96-.98 2.35s1.01 2.73 1.15 2.91c.14.19 1.98 3.02 4.79 4.24.67.29 1.2.47 1.61.6.68.22 1.29.19 1.78.12.54-.08 1.63-.67 1.86-1.31.23-.63.23-1.17.16-1.28-.07-.12-.25-.19-.53-.33Z"/>' +
      '<path d="M16 .96C7.7.96.96 7.7.96 16c0 2.64.69 5.21 1.99 7.48L.96 31.04l7.76-1.95A14.95 14.95 0 0 0 16 31.04c8.3 0 15.04-6.74 15.04-15.04S24.3.96 16 .96Zm0 27.4c-2.31 0-4.57-.62-6.55-1.8l-.47-.28-4.61 1.16 1.23-4.49-.31-.46a12.27 12.27 0 0 1-1.88-6.5c0-6.78 5.52-12.29 12.31-12.29 3.29 0 6.37 1.28 8.7 3.61a12.2 12.2 0 0 1 3.61 8.68c0 6.79-5.52 12.31-12.29 12.31Z"/>' +
      "</svg>";
    document.body.appendChild(a);

    // Height of the tallest visible bar pinned to the bottom of the screen.
    var lastLift = -1;
    function update() {
      var lift = 0;
      var bars = document.querySelectorAll("[data-ecd-bottom-bar]");
      for (var i = 0; i < bars.length; i++) {
        var bar = bars[i];
        if (bar.hidden) continue;
        var cs = getComputedStyle(bar);
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        var rect = bar.getBoundingClientRect();
        if (!rect.height) continue;
        lift = Math.max(lift, Math.round(window.innerHeight - rect.top));
      }
      lift = Math.max(0, lift);
      if (lift === lastLift) return;
      lastLift = lift;
      a.style.setProperty("--ecd-bottom-bar", lift + "px");
    }

    var queued = false;
    function schedule() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        update();
      });
    }

    // Bars appear/disappear via the hidden attribute, a class or a
    // media query, so watch all of those.
    if ("MutationObserver" in window) {
      new MutationObserver(schedule).observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["hidden", "class", "style"],
      });
    }
    if ("ResizeObserver" in window) {
      var ro = new ResizeObserver(schedule);
      document.querySelectorAll("[data-ecd-bottom-bar]").forEach(function (bar) {
        ro.observe(bar);
      });
    }
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
