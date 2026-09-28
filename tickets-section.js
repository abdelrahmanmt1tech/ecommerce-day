/**
 * Shared "Choose Your Access" tickets section (Home + Agenda).
 * Edit this file once and both pages update.
 *
 * Usage: <script src="tickets-section.js"></script> in <head> (NOT deferred,
 * so the markup exists before page scripts, prices.js and ecd-content.js run),
 * then <ecd-tickets></ecd-tickets> where the section should appear.
 *
 * Backend hooks kept intact (do not rename):
 *   [data-ticket-card="ct|fj"], [data-pkg-*]     → ecd-content.js (names, copy, badge, CTA)
 *   #confIncluded, #confExcluded, #allAccess     → ecd-content.js (feature lists)
 *   .price-ct, .price-fj                         → prices.js (prices from API)
 *   [data-checkout="ct|fj"]                      → prices.js (checkout links)
 * The lists below are only the fallback shown until the API responds.
 */
(function () {
  if (customElements.get("ecd-tickets")) return;

  var COPY = {
    eyebrow: "Choose Your Access",
    title: "Find the Pass That Fits Your Goals",
    sub: "Access both live stages, or go further with workshops and extended content.",
    note: "Workshop access remains subject to capacity and booking rules.",
  };

  var CT_INCLUDED = [
    "Main Stage",
    "Second Stage",
    "Keynotes and panels",
    "Ecommerce case studies",
    "Sponsor activations",
    "General networking",
  ];
  var CT_EXCLUDED = ["Workshops", "Workshop templates and files"];
  var FJ_INCLUDED = [
    { t: "Everything in the Standard Pass", w: 700 },
    { t: "Up to five workshops", w: 400 },
    { t: "Presentation slides", w: 400 },
    { t: "Workshop templates and files", w: 400 },
  ];
  var COMPARE = [
    { f: "Both stages and networking", c: "Yes" },
    { f: "Keynotes, panels, and case studies", c: "Yes" },
    { f: "Sponsor activations", c: "Yes" },
    { f: "Up to five workshops", c: "No" },
    { f: "Workshop templates and files", c: "No" },
  ];

  var CHECK =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#04C44E" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="flex:none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
  var CROSS =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B7BEB8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex:none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  var CSS = [
    "ecd-tickets{display:block;font-family:Manrope,system-ui,-apple-system,sans-serif;color:#1e2422}",
    "ecd-tickets *,ecd-tickets *::before,ecd-tickets *::after{box-sizing:border-box}",
    ".ecdt-eyebrow{display:inline-flex;align-items:center;gap:10px;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#7a827d;margin:0 0 14px}",
    ".ecdt-title{font-size:clamp(28px,4vw,38px);line-height:1.15;font-weight:800;letter-spacing:-.01em;margin:0 0 14px;color:#1e2422}",
    ".ecdt-sub{font-size:17px;line-height:1.7;color:#4b534e;max-width:60ch;margin:0 0 32px}",
    ".ecdt-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}",
    ".ecdt-card{background:#fff;border:1px solid #e6eaee;border-radius:16px;padding:34px 30px;display:flex;flex-direction:column;position:relative;box-shadow:0 2px 10px rgba(16,16,16,.05)}",
    ".ecdt-card.featured{background:linear-gradient(180deg,#f7fffa,#fff);border:2px solid #04c44e}",
    ".ecdt-badge{position:absolute;top:-14px;right:26px;background:#05ef62;color:#12291b;font-weight:800;font-size:11px;letter-spacing:.06em;text-transform:uppercase;border-radius:999px;padding:6px 14px}",
    ".ecdt-badge[hidden]{display:none}",
    ".ecdt-card-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#7a827d;margin:0 0 10px}",
    ".ecdt-card-title{font-size:22px;font-weight:800;line-height:1.3;margin:0 0 10px;color:#1e2422}",
    ".ecdt-card-desc{font-size:14px;color:#4b534e;line-height:1.6;margin:0 0 22px}",
    ".ecdt-list{display:flex;flex-direction:column;gap:11px;margin:0 0 20px;padding:0;list-style:none}",
    ".ecdt-list li{display:flex;align-items:center;gap:10px;font-size:14px;margin:0}",
    ".ecdt-list.excluded{color:#7a827d}",
    ".ecdt-price{font-size:32px;font-weight:800;line-height:1.2;margin:10px 0 20px;color:#1e2422}",
    ".ecdt-price-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin:10px 0 20px}",
    ".ecdt-price-row .ecdt-price{margin:0}",
    ".ecdt-limited{display:inline-flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#c81e1e;background:#fef2f2;border:1px solid #fbd0d0;border-radius:999px;padding:5px 10px;white-space:nowrap}",
    ".ecdt-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 26px;border-radius:12px;font-family:inherit;font-weight:700;font-size:15px;border:1.5px solid transparent;cursor:pointer;white-space:nowrap;text-decoration:none;transition:background .15s,color .15s,box-shadow .15s}",
    ".ecdt-btn-primary{background:#05ef62;border-color:#05ef62;color:#12291b}",
    ".ecdt-btn-primary:hover{background:#20f374;box-shadow:0 14px 40px rgba(16,16,16,.08);color:#12291b}",
    ".ecdt-btn-outline{background:#fff;border-color:#1e2422;color:#1e2422}",
    ".ecdt-btn-outline:hover{background:#1e2422;color:#fff}",
    ".ecdt-btn-full{width:100%}",
    ".ecdt-card .ecdt-btn{margin-top:auto}",
    ".ecdt-btn:focus-visible,.ecdt-close:focus-visible{outline:3px solid #2f6fed;outline-offset:2px}",
    ".ecdt-btn:hover,.ecdt-btn:active,.ecdt-close:hover,.ecdt-close:active{opacity:1;transform:none}",
    ".ecdt-actions{text-align:center;margin-top:24px}",
    ".ecdt-note{text-align:center;font-size:13px;color:#7a827d;margin:18px 0 0}",
    ".ecdt-backdrop{position:fixed;inset:0;background:rgba(20,24,21,.5);display:flex;align-items:center;justify-content:center;z-index:500;padding:20px}",
    ".ecdt-backdrop[hidden]{display:none}",
    ".ecdt-modal{background:#fff;border-radius:20px;max-width:640px;width:100%;max-height:85vh;overflow:auto;padding:30px;box-shadow:0 30px 70px rgba(16,16,16,.12)}",
    ".ecdt-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin:0 0 18px}",
    ".ecdt-modal-head h3{font-size:20px;font-weight:800;margin:0;color:#1e2422}",
    ".ecdt-close{width:40px;height:40px;border-radius:999px;border:1px solid #d5dae0;background:#fff;color:#1e2422;display:flex;align-items:center;justify-content:center;flex:none;cursor:pointer;padding:0}",
    ".ecdt-table{width:100%;border-collapse:collapse}",
    ".ecdt-table th{text-align:left;font-size:12px;color:#7a827d;padding:0 0 8px;font-weight:600}",
    ".ecdt-table td{padding:10px 0;border-bottom:1px solid #e6eaee;font-size:14px}",
    ".ecdt-table tr:last-child td{border-bottom:none}",
    "@media (max-width:900px){.ecdt-grid{grid-template-columns:1fr}}",
  ].join("\n");

  function injectStyles() {
    if (document.getElementById("ecdt-styles")) return;
    var style = document.createElement("style");
    style.id = "ecdt-styles";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function listItems(items, icon) {
    return items
      .map(function (i) {
        var text = typeof i === "string" ? i : i.t;
        var weight = typeof i === "string" ? "" : ' style="font-weight:' + i.w + '"';
        return "<li>" + icon + "<span" + weight + ">" + text + "</span></li>";
      })
      .join("");
  }

  function compareRows() {
    return COMPARE.map(function (m) {
      var isNo = m.c === "No";
      return (
        "<tr><td>" +
        m.f +
        '</td><td style="font-weight:' +
        (isNo ? 400 : 700) +
        ";color:" +
        (isNo ? "#7A827D" : "#1E2422") +
        '">' +
        m.c +
        '</td><td style="font-weight:700">Yes</td></tr>'
      );
    }).join("");
  }

  function template() {
    return (
      '<div class="ecdt-eyebrow">' + COPY.eyebrow + "</div>" +
      '<h2 class="ecdt-title" data-reveal>' + COPY.title + "</h2>" +
      '<p class="ecdt-sub" data-reveal>' + COPY.sub + "</p>" +
      '<div class="ecdt-grid">' +
      // Standard Pass (ct)
      '<article class="ecdt-card" data-ticket-card="ct" data-reveal>' +
      '<div class="ecdt-card-eyebrow" data-pkg-eyebrow>Standard Pass</div>' +
      '<h3 class="ecdt-card-title" data-pkg-title>The Live Stage Experience</h3>' +
      '<p class="ecdt-card-desc" data-pkg-desc>Market perspectives, case studies, industry conversations, and networking.</p>' +
      '<ul class="ecdt-list" id="confIncluded" aria-label="Included in the Standard Pass">' + listItems(CT_INCLUDED, CHECK) + "</ul>" +
      '<ul class="ecdt-list excluded" id="confExcluded" aria-label="Not included in the Standard Pass">' + listItems(CT_EXCLUDED, CROSS) + "</ul>" +
      '<div class="ecdt-price price-ct" data-suffix=" EGP">[Final Price] EGP</div>' +
      '<button type="button" class="ecdt-btn ecdt-btn-outline ecdt-btn-full" data-checkout="ct" data-pkg-cta>Get Standard Pass</button>' +
      "</article>" +
      // All Access Pass (fj)
      '<article class="ecdt-card featured" data-ticket-card="fj" data-reveal>' +
      '<span class="ecdt-badge" data-pkg-badge>Complete Access</span>' +
      '<div class="ecdt-card-eyebrow" data-pkg-eyebrow>All Access Pass</div>' +
      '<h3 class="ecdt-card-title" data-pkg-title>The Full ECommerce Day Experience</h3>' +
      '<p class="ecdt-card-desc" data-pkg-desc>Workshops, deeper application, and continued learning after the event.</p>' +
      '<ul class="ecdt-list" id="allAccess" aria-label="Included in the All Access Pass">' + listItems(FJ_INCLUDED, CHECK) + "</ul>" +
      '<div class="ecdt-price-row">' +
      '<div class="ecdt-price price-fj" data-suffix=" EGP">[Final Price] EGP</div>' +
      '<span class="ecdt-limited">Limited Tickets</span>' +
      "</div>" +
      '<button type="button" class="ecdt-btn ecdt-btn-primary ecdt-btn-full" data-checkout="fj" data-pkg-cta>Get All Access Pass</button>' +
      "</article>" +
      "</div>" +
      '<div class="ecdt-actions">' +
      '<button type="button" class="ecdt-btn ecdt-btn-outline" id="openCompare" aria-haspopup="dialog">Compare Passes' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
      "</button></div>" +
      '<p class="ecdt-note">' + COPY.note + "</p>" +
      // Compare modal
      '<div class="ecdt-backdrop" id="compareModal" hidden role="dialog" aria-modal="true" aria-label="Compare Passes">' +
      '<div class="ecdt-modal">' +
      '<div class="ecdt-modal-head"><h3>Compare Passes</h3>' +
      '<button type="button" class="ecdt-close" id="closeCompare" aria-label="Close comparison">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      "</button></div>" +
      '<table class="ecdt-table"><thead><tr><th>Feature</th><th>Standard</th><th>All Access</th></tr></thead>' +
      '<tbody id="cmpModalBody">' + compareRows() + "</tbody></table>" +
      "</div></div>"
    );
  }

  class EcdTickets extends HTMLElement {
    connectedCallback() {
      if (this._rendered) return;
      this._rendered = true;
      injectStyles();
      this.innerHTML = template();

      var modal = this.querySelector("#compareModal");
      var openBtn = this.querySelector("#openCompare");
      var closeBtn = this.querySelector("#closeCompare");

      function open() {
        modal.hidden = false;
        closeBtn.focus();
      }
      function close() {
        if (modal.hidden) return;
        modal.hidden = true;
        openBtn.focus();
      }

      openBtn.addEventListener("click", open);
      closeBtn.addEventListener("click", close);
      modal.addEventListener("click", function (e) {
        if (e.target === modal) close();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") close();
      });
    }
  }

  customElements.define("ecd-tickets", EcdTickets);
})();
