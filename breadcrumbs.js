/* ============================================================
   breadcrumbs.js: visible breadcrumb trail (one shared look).
   Usage on a page, right under <site-navbar>:
     <ecd-breadcrumb
       data-trail='[["ECommerce Day","index.html"],["Speakers"]]'
       style="display:block;min-height:44px"></ecd-breadcrumb>
   The last item is the current page (no link, aria-current="page").
   Search engines read the BreadcrumbList JSON-LD in each page's <head>;
   keep the two trails in sync when a page changes.

   Pages that change the trail at runtime (checkout steps, policy
   switcher) call EcdBreadcrumb.render(el, items), where an item is
   { label, href } or { label, onClick }.
   ============================================================ */
(function () {
  "use strict";

  var STYLE_ID = "ecd-breadcrumb-style";

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      "ecd-breadcrumb,.ecd-bc-host{display:block;min-height:44px}" +
      ".ecd-bc{max-width:var(--max-w,1280px);margin:0 auto;padding:12px var(--pad-x,24px);" +
      "font-family:Manrope,sans-serif;font-size:13px;line-height:20px}" +
      ".ecd-bc ol{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;list-style:none;margin:0;padding:0}" +
      ".ecd-bc li{display:inline-flex;align-items:center;gap:8px;min-width:0}" +
      ".ecd-bc li+li::before{content:'\\203A';color:#9AA1A9;font-size:15px;line-height:1}" +
      ".ecd-bc a,.ecd-bc button{color:#4A5563;font:inherit;font-weight:500;text-decoration:none;" +
      "background:none;border:0;padding:2px 0;cursor:pointer;border-radius:4px}" +
      ".ecd-bc a:hover,.ecd-bc button:hover{color:#101010;text-decoration:underline;text-underline-offset:3px}" +
      ".ecd-bc a:focus-visible,.ecd-bc button:focus-visible{outline:2px solid #101010;outline-offset:2px}" +
      ".ecd-bc [aria-current]{color:#101010;font-weight:600}" +
      "@media (max-width:600px){.ecd-bc{padding:10px 16px;font-size:12px}}";
    document.head.appendChild(style);
  }

  function render(host, items) {
    if (!host) return;
    injectStyle();
    var nav = document.createElement("nav");
    nav.className = "ecd-bc";
    nav.setAttribute("aria-label", "Breadcrumb");
    var ol = document.createElement("ol");
    (items || []).forEach(function (item, i) {
      var li = document.createElement("li");
      var last = i === items.length - 1;
      var el;
      if (last) {
        el = document.createElement("span");
        el.setAttribute("aria-current", "page");
      } else if (item.onClick) {
        el = document.createElement("button");
        el.type = "button";
        el.addEventListener("click", item.onClick);
      } else {
        el = document.createElement("a");
        el.href = item.href;
      }
      el.textContent = item.label;
      li.appendChild(el);
      ol.appendChild(li);
    });
    nav.appendChild(ol);
    while (host.firstChild) host.removeChild(host.firstChild);
    host.appendChild(nav);
  }

  window.EcdBreadcrumb = { render: render };

  if (!customElements.get("ecd-breadcrumb")) {
    customElements.define(
      "ecd-breadcrumb",
      class extends HTMLElement {
        connectedCallback() {
          if (this.firstChild) return;
          var trail = [];
          try {
            trail = JSON.parse(this.getAttribute("data-trail") || "[]");
          } catch (e) {}
          render(
            this,
            trail.map(function (t) {
              return { label: t[0], href: t[1] };
            }),
          );
        }
      },
    );
  }
})();
