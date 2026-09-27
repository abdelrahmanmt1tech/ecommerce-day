/**
 * ECommerce Day analytics: GTM bootstrap + dataLayer events.
 *
 * Extends the TrafficMENA data layer (main app: docs/events-tracking-data-model.md,
 * src/lib/analytics). Same GTM container, same event names and parameter shapes.
 * Reused events: global_variables, select_item, begin_checkout, apply_promo_code,
 * select_payment_method, purchase, add_to_calendar.
 * ECD-only events: checkout_step (checkout steps 1-2), generate_lead (sponsor form).
 *
 * Load first in <head> on every page (not deferred):
 *   <script src="ecd-analytics.js?v=..."></script>
 * Page scripts call window.EcdAnalytics.*; every call is wrapped so analytics
 * can never break the page.
 */
(function (global) {
  "use strict";

  var GTM_ID = "GTM-5DMGVFZS";
  var CURRENCY = "EGP";
  var EVENT_ITEM = { item_id: "ecd2026", item_name: "ECommerce Day 2026" };
  // Stable reporting names (admin display names may change; these must not).
  var PASSES = {
    ct: { item_id: "ecd2026_standard", item_name: "Standard Pass", ticket_type: "standard", index: 0 },
    fj: { item_id: "ecd2026_all_access", item_name: "All Access Pass", ticket_type: "all_access", index: 1 },
  };
  var PURCHASE_WINDOW_MS = 24 * 60 * 60 * 1000;
  var PURCHASE_STORAGE_PREFIX = "ecd_tracked_purchase_";

  var PAGE_TYPES = {
    "": "ecd_home",
    "ecommerce-day": "ecd_home",
    index: "ecd_home",
    agenda: "ecd_agenda",
    speakers: "ecd_speakers",
    tickets: "ecd_tickets",
    checkout: "ecd_checkout",
    "booking-confirmation": "ecd_booking_confirmation",
    sponsors: "ecd_sponsors",
    "become-a-sponsor": "ecd_become_a_sponsor",
    faq: "ecd_faq",
    policy: "ecd_policy",
  };

  function push(data) {
    try {
      global.dataLayer = global.dataLayer || [];
      global.dataLayer.push(data);
    } catch (e) {
      // Silent fail: analytics must never break the page
    }
  }

  function safe(fn) {
    return function () {
      try {
        return fn.apply(null, arguments);
      } catch (e) {
        return undefined;
      }
    };
  }

  function getPageType(pathname) {
    var parts = String(pathname || "").replace(/\/+$/, "").split("/");
    var slug = parts[parts.length - 1].replace(/\.html$/, "");
    return PAGE_TYPES[slug] || "ecd_other";
  }

  // Same rule as the main app's normalizeAnalyticsPaymentMethod.
  function normalizePaymentMethod(name) {
    if (!name) return "";
    return String(name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function passId(ticketId) {
    return ticketId === "ct" ? "ct" : "fj";
  }

  /** Current single-ticket price in EGP from prices.js (database), or null. */
  function unitPrice(ticketId) {
    var prices = global.EventPrices;
    if (!prices || !prices.calcTotals) return null;
    var unit = prices.calcTotals(passId(ticketId), 1, "").unit;
    return typeof unit === "number" && unit > 0 ? unit : null;
  }

  function buildItem(ticketId, price) {
    var pass = PASSES[passId(ticketId)];
    var item = {
      item_id: pass.item_id,
      item_name: pass.item_name,
      item_category: EVENT_ITEM.item_name,
      currency: CURRENCY,
    };
    if (typeof price === "number") item.price = price;
    return item;
  }

  /* ---------- global_variables + GTM bootstrap ---------- */

  // User-scoped fields (login_status, customer_type, subscription_status,
  // user_role) are deliberately omitted: this static site cannot know them,
  // and pushing placeholders would overwrite the real values the main app
  // sets for the same visitor.
  push({
    event: "global_variables",
    event_source: "Web",
    page_type: getPageType(global.location.pathname),
    page_path: global.location.pathname,
    currency: CURRENCY,
  });

  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ "gtm.start": Date.now(), event: "gtm.js" });
    var f = d.getElementsByTagName(s)[0];
    var j = d.createElement(s);
    j.async = true;
    j.src = "https://www.googletagmanager.com/gtm.js?id=" + i;
    if (f && f.parentNode) f.parentNode.insertBefore(j, f);
    else d.head.appendChild(j);
  })(global, document, "script", "dataLayer", GTM_ID);

  /* ---------- select_item: any [data-checkout="ct|fj"] pass button ---------- */

  // Capture phase so it runs before prices.js navigates to checkout.
  document.addEventListener(
    "click",
    safe(function (e) {
      var el = e.target && e.target.closest && e.target.closest("[data-checkout]");
      if (!el) return;
      var id = passId(el.getAttribute("data-checkout"));
      var inPasses = !!el.closest("ecd-tickets");
      var item = buildItem(id, unitPrice(id));
      item.index = PASSES[id].index;
      push({
        event: "select_item",
        item_list_id: inPasses ? "ecd_passes" : "ecd_page_cta",
        item_list_name: inPasses ? "Find the Pass That Fits Your Goals" : "Page CTA",
        items: [item],
      });
    }),
    true,
  );

  /* ---------- Checkout funnel (checkout.html) ---------- */

  var firedCheckoutSteps = {};
  var beginCheckoutFired = false;

  /** Once per page load, after prices arrive (or 5s without them). */
  function beginCheckout(getTicketId) {
    if (beginCheckoutFired) return;
    var done = false;
    function fire() {
      if (done || beginCheckoutFired) return;
      done = true;
      beginCheckoutFired = true;
      var id = getTicketId();
      var price = unitPrice(id);
      var data = {
        event: "begin_checkout",
        currency: CURRENCY,
        item_type: "event_ticket",
        items: [buildItem(id, price)],
      };
      if (price != null) data.value = price;
      push(data);
    }
    var prices = global.EventPrices;
    if (prices && prices.whenPackagesReady) {
      prices.whenPackagesReady().then(safe(fire), safe(fire));
    }
    setTimeout(safe(fire), 5000);
  }

  /** Step completed (validation passed). Each step counts once per page load. */
  function checkoutStep(stepNumber, stepName, ticketId) {
    if (firedCheckoutSteps[stepNumber]) return;
    firedCheckoutSteps[stepNumber] = true;
    push({
      event: "checkout_step",
      step_number: stepNumber,
      step_name: stepName,
      event_source: "Web",
      item_type: "event_ticket",
      items: [buildItem(ticketId, unitPrice(ticketId))],
    });
  }

  /** status from POST /promo/validate: "valid" maps to the main app's "success". */
  function applyPromoCode(p) {
    var status = String(p.status || "invalid").toLowerCase();
    push({
      event: "apply_promo_code",
      promo_code: String(p.code || "").toUpperCase(),
      status: status === "valid" ? "success" : status,
      discount_percent: status === "valid" ? Number(p.discountPercent) || 0 : 0,
      item_type: "event_ticket",
      item_id: PASSES[passId(p.ticketId)].item_id,
    });
  }

  /** Pay clicked with a method selected. value = amount after discount. */
  function selectPaymentMethod(p) {
    var value = typeof p.value === "number" ? p.value : null;
    var data = {
      event: "select_payment_method",
      currency: CURRENCY,
      payment_type: normalizePaymentMethod(p.paymentMethodName),
      item_type: "event_ticket",
      coupon: p.coupon || "",
      items: [buildItem(p.ticketId, value)],
    };
    if (value != null) data.value = value;
    push(data);
  }

  /* ---------- purchase (booking-confirmation.html) ---------- */

  function purchaseSkipReason(booking) {
    if (!booking) return "no_booking";
    if (String(booking.paymentStatus || "").toLowerCase() !== "paid") return "not_paid";
    var method = String(booking.paymentMethodName || "");
    // Admin panel tickets (complimentary or manual) and simulated payments.
    if (/^ADMIN_/i.test(method)) return "admin_ticket";
    if (/ECD_SIMULATE/i.test(method)) return "test_payment";
    if (!(Number(booking.totalCents) > 0)) return "zero_total";
    if (booking.paidAt) {
      var paidMs = Date.parse(booking.paidAt);
      if (!isNaN(paidMs) && Date.now() - paidMs > PURCHASE_WINDOW_MS) return "paid_over_24h_ago";
    }
    return "";
  }

  function purchaseTransactionId(booking) {
    var t = booking && booking.tickets && booking.tickets[0];
    return (t && t.serial) || (booking && booking.orderCode) || "";
  }

  /**
   * Fires purchase once per ticket ID, only for real website payments.
   * Returns the skip reason ("" when pushed) to make QA easy.
   */
  function purchase(booking) {
    var reason = purchaseSkipReason(booking);
    var transactionId = purchaseTransactionId(booking);
    if (!reason && !transactionId) reason = "no_ticket_id";
    var key = PURCHASE_STORAGE_PREFIX + transactionId;
    if (!reason) {
      try {
        if (global.localStorage.getItem(key)) reason = "already_tracked";
        else global.localStorage.setItem(key, String(Date.now()));
      } catch (e) {
        // Storage blocked: still track (GA4 dedupes by transaction_id).
      }
    }
    if (reason) return reason;

    var id = passId(booking.ticketType);
    var qty = Math.max(1, parseInt(booking.qty, 10) || 1);
    var value = booking.totalCents / 100;
    var method = String(booking.paymentMethodName || "");
    if (method.indexOf(":") > -1) method = method.split(":").pop();
    var item = buildItem(id, value / qty);
    item.quantity = qty;

    push({
      event: "purchase",
      transaction_id: transactionId,
      event_id: transactionId,
      currency: CURRENCY,
      value: value,
      item_type: "event_ticket",
      payment_type: normalizePaymentMethod(method),
      ticket_type: PASSES[id].ticket_type,
      coupon: booking.promoCode || "",
      discount: (Number(booking.discountCents) || 0) / 100,
      original_value: ((Number(booking.unitPriceCents) || 0) * qty) / 100,
      items: [item],
    });
    return "";
  }

  /* ---------- Engagement ---------- */

  function addToCalendar(calendarType) {
    push({
      event: "add_to_calendar",
      item_id: EVENT_ITEM.item_id,
      item_name: EVENT_ITEM.item_name,
      calendar_type: calendarType || "ics_download",
    });
  }

  /** Become a Sponsor form submitted successfully. No PII, no budget. */
  function generateLead(p) {
    push({
      event: "generate_lead",
      lead_type: "sponsorship",
      form_name: "become_a_sponsor",
      lead_id: p.leadId || "",
      sponsor_level: p.sponsorLevel || "",
      event_source: "Web",
    });
  }

  global.EcdAnalytics = {
    beginCheckout: safe(beginCheckout),
    checkoutStep: safe(checkoutStep),
    applyPromoCode: safe(applyPromoCode),
    selectPaymentMethod: safe(selectPaymentMethod),
    purchase: safe(purchase),
    addToCalendar: safe(addToCalendar),
    generateLead: safe(generateLead),
  };
})(window);
