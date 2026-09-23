/**
 * ECommerce Day 2026 — shared ticket prices
 * غيّر الأرقام هنا فقط؛ باقي الصفحات تحدّث نفسها عبر الـ classnames.
 *
 * Classnames:
 *   .price-ct          → Control Tower unit price (number + optional EGP via data-suffix)
 *   .price-fj          → Full Journey unit price
 *   .price-unit        → unit price of the active ticket (checkout)
 *   .price-total       → line/order total
 *   .price-discount    → discount amount (shown with leading − when data-minus="1")
 *   .price-ticket-name → ticket display name
 *   .price-qty         → quantity
 *
 * Optional attributes:
 *   data-suffix=" EGP" | " EGP each"  — appended after the number
 *   data-prefix="− "                  — prepended (discount rows)
 *   data-minus="1"                    — same as data-prefix="− "
 */
(function (global) {
  "use strict";

  // ========== عيّن الأسعار النهائية هنا (EGP) ==========
  // ضع الرقم النهائي بدل null — مثال: controlTower: 2500
  var PRICES = {
    controlTower: 2500,
    fullJourney: 4500,
    currency: "EGP",
    /** نسبة خصم كود LAUNCH (0.1 = 10%). اجعلها 0 لإيقاف الخصم */
    launchDiscountRate: 0.1,
  };

  var TICKETS = {
    ct: {
      id: "ct",
      name: "Conference Pass",
      tagline: "See the whole system.",
      priceKey: "controlTower",
    },
    fj: {
      id: "fj",
      name: "All Access Pass",
      tagline: "Learn it. Work on it. Apply it.",
      priceKey: "fullJourney",
    },
  };

  function getRawPrice(ticketId) {
    var t = TICKETS[ticketId] || TICKETS.fj;
    var val = PRICES[t.priceKey];
    return typeof val === "number" && !isNaN(val) && val > 0 ? val : null;
  }

  function formatNumber(n) {
    if (n == null || isNaN(n)) return "[Final Price]";
    try {
      return Number(n).toLocaleString("en-EG");
    } catch (e) {
      return String(n);
    }
  }

  function formatMoney(n, opts) {
    opts = opts || {};
    if (n == null || isNaN(n)) {
      return (
        (opts.prefix || "") +
        "[Final Price]" +
        (opts.suffix != null ? opts.suffix : " " + PRICES.currency)
      );
    }
    var prefix = opts.prefix || "";
    var suffix =
      opts.suffix != null ? opts.suffix : " " + PRICES.currency;
    return prefix + formatNumber(n) + suffix;
  }

  function getTicket(ticketId) {
    return TICKETS[ticketId] || TICKETS.fj;
  }

  function calcDiscount(unit, qty, promoCode) {
    var code = (promoCode || "").toUpperCase();
    if (code === "LAUNCH" && PRICES.launchDiscountRate > 0 && unit != null) {
      return Math.round(unit * qty * PRICES.launchDiscountRate);
    }
    return 0;
  }

  function calcTotals(ticketId, qty, promoCode) {
    var unit = getRawPrice(ticketId);
    var q = Math.max(1, parseInt(qty, 10) || 1);
    var discount = calcDiscount(unit, q, promoCode);
    var subtotal = unit == null ? null : unit * q;
    var total = subtotal == null ? null : Math.max(0, subtotal - discount);
    return {
      ticketId: ticketId,
      ticket: getTicket(ticketId),
      unit: unit,
      qty: q,
      discount: discount,
      subtotal: subtotal,
      total: total,
      promoCode: (promoCode || "").toUpperCase(),
    };
  }

  function fillEl(el, value) {
    if (!el) return;
    var suffix = el.getAttribute("data-suffix");
    var prefix = el.getAttribute("data-prefix") || "";
    if (el.getAttribute("data-minus") === "1") prefix = "− ";
    if (suffix == null) suffix = "";
    if (value == null || (typeof value === "number" && isNaN(value))) {
      el.textContent = prefix + "[Final Price]" + suffix;
      return;
    }
    if (typeof value === "number") {
      el.textContent = prefix + formatNumber(value) + suffix;
      return;
    }
    el.textContent = prefix + String(value) + suffix;
  }

  function setStaticPriceEl(el, ticketId) {
    var num = getRawPrice(ticketId);
    var label = num == null ? "[Final Price]" : formatNumber(num);
    var currency = el.querySelector(".currency");
    if (currency) {
      el.innerHTML = "";
      el.appendChild(document.createTextNode(label + " "));
      el.appendChild(currency);
      return;
    }
    // Preserve a trailing currency <span> that is not .currency (e.g. index hero)
    var span = el.querySelector("span");
    if (span && /EGP/i.test(span.textContent || "")) {
      el.innerHTML = "";
      el.appendChild(document.createTextNode(label + " "));
      el.appendChild(span);
      return;
    }
    fillEl(el, num);
  }

  /** Fill static CT / FJ price tags site-wide */
  function applyStaticPrices() {
    document.querySelectorAll(".price-ct").forEach(function (el) {
      setStaticPriceEl(el, "ct");
    });
    document.querySelectorAll(".price-fj").forEach(function (el) {
      setStaticPriceEl(el, "fj");
    });
  }

  /**
   * Update dynamic checkout/confirmation price fields.
   * totals: return value of calcTotals()
   */
  function applyTotals(totals) {
    if (!totals) return;
    document.querySelectorAll(".price-unit").forEach(function (el) {
      fillEl(el, totals.unit);
    });
    document.querySelectorAll(".price-total").forEach(function (el) {
      fillEl(el, totals.total);
    });
    document.querySelectorAll(".price-discount").forEach(function (el) {
      fillEl(el, totals.discount || 0);
    });
    document.querySelectorAll(".price-ticket-name").forEach(function (el) {
      el.textContent = totals.ticket.name;
    });
    document.querySelectorAll(".price-qty").forEach(function (el) {
      el.textContent = String(totals.qty);
    });
  }

  /** Persist booking for confirmation page */
  var STORAGE_KEY = "ecd2026_booking";

  function saveBooking(booking) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(booking));
    } catch (e) {}
  }

  function loadBooking() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function makeOrderId() {
    var n = Math.floor(1000 + Math.random() * 9000);
    return "ECD26-" + n;
  }

  function checkoutUrl(ticketId) {
    var id = ticketId === "ct" ? "ct" : "fj";
    return "checkout.html?ticket=" + id;
  }

  /** Wire any [data-checkout="ct|fj"] links/buttons */
  function bindCheckoutLinks() {
    document.querySelectorAll("[data-checkout]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        var id = el.getAttribute("data-checkout");
        if (!id) return;
        e.preventDefault();
        window.location.href = checkoutUrl(id);
      });
    });
  }

  /** Last packages payload from GET /content (source of truth after hydrate). */
  var PACKAGES = { ct: null, fj: null };
  var packagesReady = false;
  var packagesReadyWaiters = [];

  function notifyPackagesReady() {
    packagesReady = true;
    var waiters = packagesReadyWaiters.slice();
    packagesReadyWaiters = [];
    waiters.forEach(function (resolve) {
      resolve(PACKAGES);
    });
  }

  function whenPackagesReady() {
    if (packagesReady) {
      return Promise.resolve(PACKAGES);
    }
    return new Promise(function (resolve) {
      packagesReadyWaiters.push(resolve);
    });
  }

  function getPackage(ticketId) {
    var id = ticketId === "ct" ? "ct" : "fj";
    return PACKAGES[id] || null;
  }

  /** Hydrate prices + names from GET /api/ecd/content packages. */
  function applyFromPackages(packages, activeTicketId) {
    if (!packages) return;
    PACKAGES.ct = packages.ct || null;
    PACKAGES.fj = packages.fj || null;

    if (packages.ct) {
      if (typeof packages.ct.priceEgp === "number") {
        PRICES.controlTower = packages.ct.priceEgp;
      }
      if (packages.ct.displayName) TICKETS.ct.name = packages.ct.displayName;
      if (packages.ct.tagline) TICKETS.ct.tagline = packages.ct.tagline;
    }
    if (packages.fj) {
      if (typeof packages.fj.priceEgp === "number") {
        PRICES.fullJourney = packages.fj.priceEgp;
      }
      if (packages.fj.displayName) TICKETS.fj.name = packages.fj.displayName;
      if (packages.fj.tagline) TICKETS.fj.tagline = packages.fj.tagline;
    }
    applyStaticPrices();
    document.querySelectorAll(".ticket-chip[data-ticket]").forEach(function (btn) {
      var id = btn.getAttribute("data-ticket");
      var t = TICKETS[id];
      if (t) btn.textContent = t.name;
    });

    var activeId = activeTicketId;
    if (activeId !== "ct" && activeId !== "fj") {
      try {
        var params = new URLSearchParams(global.location.search);
        activeId = params.get("ticket") === "ct" ? "ct" : "fj";
      } catch (e) {
        activeId = "fj";
      }
    }
    var active = TICKETS[activeId];
    document.querySelectorAll(".price-ticket-name").forEach(function (el) {
      el.textContent = active.name;
    });
    var nameEl = document.getElementById("desktopTicketName");
    var tagEl = document.getElementById("desktopTicketTag");
    if (nameEl) nameEl.textContent = active.name;
    if (tagEl) tagEl.textContent = active.tagline;

    notifyPackagesReady();
    try {
      global.dispatchEvent(
        new CustomEvent("ecd:packages-ready", {
          detail: { packages: PACKAGES, activeTicketId: activeId },
        }),
      );
    } catch (e) {}
  }

  function boot() {
    applyStaticPrices();
    bindCheckoutLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  global.EventPrices = {
    PRICES: PRICES,
    TICKETS: TICKETS,
    PACKAGES: PACKAGES,
    getRawPrice: getRawPrice,
    getTicket: getTicket,
    getPackage: getPackage,
    formatNumber: formatNumber,
    formatMoney: formatMoney,
    calcTotals: calcTotals,
    applyStaticPrices: applyStaticPrices,
    applyTotals: applyTotals,
    applyFromPackages: applyFromPackages,
    whenPackagesReady: whenPackagesReady,
    saveBooking: saveBooking,
    loadBooking: loadBooking,
    makeOrderId: makeOrderId,
    checkoutUrl: checkoutUrl,
  };
})(window);
