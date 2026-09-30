/**
 * ECommerce Day analytics: GTM bootstrap + dataLayer events.
 *
 * Extends the TrafficMENA data layer (main app: docs/events-tracking-data-model.md,
 * src/lib/analytics). Same GTM container, same event names and parameter shapes.
 * Reused events: global_variables, select_item, begin_checkout, apply_promo_code,
 * select_payment_method, purchase, add_to_calendar.
 * ECD-only events: checkout_step (1 your_details, 2 payment), booking_complete
 * (registration saved, not paid yet), generate_lead (sponsor form).
 *
 * booking_complete and purchase carry user_data: the buyer's booking form in
 * plain text (for the CRM) plus SHA-256 hashes of first name, last name, email
 * and phone (for Meta, Google Ads, Snapchat and TikTok). In GTM the plain
 * values must only feed CRM tags, never GA4 or ad pixels. If the browser
 * cannot hash, the hashed fields are empty and the event still fires.
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
  var BOOKING_STORAGE_PREFIX = "ecd_tracked_booking_";

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

  /* ---------- user_data (booking_complete + purchase) ---------- */

  function text(value) {
    return value == null ? "" : String(value).trim();
  }

  /** Hex SHA-256 of value; "" for an empty value, null when the browser cannot hash. */
  function sha256(value) {
    if (!value) return Promise.resolve("");
    var subtle = global.crypto && global.crypto.subtle;
    if (!subtle || typeof global.TextEncoder !== "function") return Promise.resolve(null);
    return subtle.digest("SHA-256", new global.TextEncoder().encode(value)).then(
      function (buf) {
        return Array.prototype.map
          .call(new Uint8Array(buf), function (b) {
            return ("0" + b.toString(16)).slice(-2);
          })
          .join("");
      },
      function () {
        return null;
      },
    );
  }

  /**
   * Plain + hashed buyer details. Every key is always present ("" when empty)
   * so GTM never keeps a previous buyer's value in its data model.
   * Hash inputs follow the ad platforms' rules: trimmed and lowercased; phone
   * as +201002754217 (Google, TikTok) and 201002754217 (Meta).
   * Name split: first word is the first name, the rest the last name.
   */
  function buildUserData(b) {
    var fullName = text(b.name).replace(/\s+/g, " ");
    var firstName = fullName.split(" ")[0] || "";
    var lastName = fullName.split(" ").slice(1).join(" ");
    var email = text(b.email).toLowerCase();
    // b.mobile: a full international number, or "" when it could not be
    // recognised; then the plain fields keep b.mobileAsTyped and no phone is hashed.
    var phoneDigits = text(b.mobile).replace(/\D/g, "");
    var phoneWithPlus = phoneDigits ? "+" + phoneDigits : "";
    return Promise.all([
      sha256(firstName.toLowerCase()),
      sha256(lastName.toLowerCase()),
      sha256(email),
      sha256(phoneWithPlus),
      sha256(phoneDigits),
    ]).then(function (h) {
      return {
        user_id: h[2] || email,
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_with_plus: phoneWithPlus || text(b.mobileAsTyped),
        phone_without_plus: phoneDigits || text(b.mobileAsTyped).replace(/\D/g, ""),
        country: text(b.country),
        job_title: text(b.jobTitle),
        company: text(b.company),
        store: text(b.store),
        linkedin: text(b.linkedin),
        facebook: text(b.facebook),
        newsletter_opt_in: !!b.newsOptIn,
        sha256_first_name: h[0] || "",
        sha256_last_name: h[1] || "",
        sha256_email: h[2] || "",
        sha256_phone_with_plus: h[3] || "",
        sha256_phone_without_plus: h[4] || "",
      };
    });
  }

  // National number rules per country, same as checkout.html.
  var COUNTRY_PHONE = {
    Egypt: { cc: "20", national: /^1[0125]\d{8}$/ },
    "Saudi Arabia": { cc: "966", national: /^5\d{8}$/ },
    UAE: { cc: "971", national: /^5\d{8}$/ },
    Kuwait: { cc: "965", national: /^[4569]\d{7}$/ },
    Qatar: { cc: "974", national: /^[3567]\d{7}$/ },
    Jordan: { cc: "962", national: /^7[789]\d{7}$/ },
  };

  /**
   * Free-text phone → international digits (201002754217), or "" when it
   * cannot be recognised. +… and 00… are international; a local number is
   * completed with the selected country's code.
   */
  function internationalPhone(raw, country) {
    var s = text(raw)
      .replace(/[٠-٩]/g, function (d) {
        return String(d.charCodeAt(0) - 0x0660);
      })
      .replace(/[۰-۹]/g, function (d) {
        return String(d.charCodeAt(0) - 0x06f0);
      });
    var digits = s.replace(/\D/g, "");
    var intl = "";
    if (s.charAt(0) === "+") intl = digits;
    else if (digits.indexOf("00") === 0) intl = digits.slice(2);
    if (intl) {
      // +20 0100… style: drop the trunk 0 after a known country code.
      Object.keys(COUNTRY_PHONE).forEach(function (k) {
        var r = COUNTRY_PHONE[k];
        if (intl.indexOf(r.cc + "0") === 0 && r.national.test(intl.slice(r.cc.length + 1))) {
          intl = r.cc + intl.slice(r.cc.length + 1);
        }
      });
      return intl.length >= 8 && intl.length <= 15 ? intl : "";
    }
    var rule = COUNTRY_PHONE[text(country)];
    if (!rule) return "";
    var national = digits.replace(/^0/, "");
    if (rule.national.test(national)) return rule.cc + national;
    // Country code typed without + or 00 (201002754217).
    if (digits.indexOf(rule.cc) === 0) {
      national = digits.slice(rule.cc.length).replace(/^0/, "");
      if (rule.national.test(national)) return rule.cc + national;
    }
    return "";
  }

  // Hashing is async; events with user_data are pushed in the order they were
  // called, so the first registration is the one that counts.
  var userDataQueue = Promise.resolve();

  /** Adds user_data to data and pushes it, unless shouldPush(userData) is false. */
  function pushWithUserData(data, buyer, shouldPush) {
    var ready = buildUserData(buyer);
    userDataQueue = userDataQueue
      .then(function () {
        return ready;
      })
      .then(
        safe(function (userData) {
          if (shouldPush && !shouldPush(userData)) return;
          data.user_data = userData;
          push(data);
        }),
      );
  }

  /** Order fields shared by booking_complete and purchase (amounts in EGP). */
  function bookingOrderData(booking) {
    var id = passId(booking.ticketType);
    var qty = Math.max(1, parseInt(booking.qty, 10) || 1);
    var value = (Number(booking.totalCents) || 0) / 100;
    var item = buildItem(id, value / qty);
    item.quantity = qty;
    return {
      booking_id: text(booking.bookingId),
      order_code: text(booking.orderCode),
      currency: CURRENCY,
      value: value,
      item_type: "event_ticket",
      ticket_type: PASSES[id].ticket_type,
      coupon: booking.promoCode || "",
      discount: (Number(booking.discountCents) || 0) / 100,
      original_value: ((Number(booking.unitPriceCents) || 0) * qty) / 100,
      items: [item],
    };
  }

  function assign(target, source) {
    Object.keys(source).forEach(function (k) {
      target[k] = source[k];
    });
    return target;
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

    var method = String(booking.paymentMethodName || "");
    if (method.indexOf(":") > -1) method = method.split(":").pop();
    var form = booking.form || {};
    var data = assign(
      { event: "purchase", transaction_id: transactionId, event_id: transactionId },
      bookingOrderData(booking),
    );
    data.payment_type = normalizePaymentMethod(method);
    data.payment_status = "paid";

    pushWithUserData(data, {
      name: booking.buyerName,
      email: booking.buyerEmail,
      mobile: booking.buyerMobile,
      country: form.country,
      jobTitle: form.jobTitle,
      company: form.company,
      store: form.store,
      linkedin: form.linkedinUrl,
      facebook: form.facebookUrl,
      newsOptIn: form.newsOptIn,
    });
    return "";
  }

  /* ---------- booking_complete (checkout.html) ---------- */

  var trackedBookings = {};

  /**
   * Registration saved (POST /session succeeded), payment not done yet.
   * booking: the /session response; request: the payload sent to it
   * (promoCode + buyer). Fires once per buyer (user_id) and pass: a new
   * registration after editing details or retrying Pay does not fire again.
   */
  function bookingComplete(booking, request) {
    if (!booking || !booking.bookingId) return;
    var buyer = (request && request.buyer) || {};
    var data = assign(
      { event: "booking_complete", event_id: String(booking.bookingId) },
      bookingOrderData(assign({ promoCode: request && request.promoCode }, booking)),
    );
    data.payment_status = "pending";
    data.event_source = "Web";

    pushWithUserData(
      data,
      {
        name: buyer.name,
        email: buyer.email,
        mobile: buyer.mobile,
        country: buyer.country,
        jobTitle: buyer.title,
        company: buyer.company,
        store: buyer.store,
        linkedin: buyer.linkedin,
        facebook: buyer.facebook,
        newsOptIn: buyer.newsOptIn,
      },
      function (userData) {
        var key = BOOKING_STORAGE_PREFIX + userData.user_id + "_" + data.ticket_type;
        if (trackedBookings[key]) return false;
        trackedBookings[key] = true;
        try {
          if (global.localStorage.getItem(key)) return false;
          global.localStorage.setItem(key, String(Date.now()));
        } catch (e) {
          // Storage blocked: the in-memory check still limits it to once per page.
        }
        return true;
      },
    );
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

  var trackedSponsorForms = {};

  /**
   * Become a Sponsor form saved (same moment as generate_lead), with the whole
   * form: contact in user_data (plain + hashed), the rest in sponsor_data.
   * p.requestCode: the server's request code; p.form: the payload sent to it.
   */
  function sponsorFormComplete(p) {
    var f = (p && p.form) || {};
    var requestCode = text(p && p.requestCode);
    if (!requestCode || trackedSponsorForms[requestCode]) return;
    trackedSponsorForms[requestCode] = true;
    var list = function (v) {
      return Array.isArray(v) ? v.slice() : [];
    };
    pushWithUserData(
      {
        event: "sponsor_form_complete",
        event_id: requestCode,
        lead_id: requestCode,
        lead_type: "sponsorship",
        form_name: "become_a_sponsor",
        event_source: "Web",
        sponsor_data: {
          company: text(f.company),
          website: text(f.website),
          sector: text(f.sector),
          country: text(f.country),
          company_size: text(f.companySize),
          job_title: text(f.contactTitle),
          preferred_contact: text(f.preferredContact),
          objectives: list(f.objectives),
          sponsorship_level: text(f.interestedLevel),
          interested_properties: list(f.interestedProperties),
          target_audience: text(f.targetAudience),
          timing: text(f.timing),
          notes: text(f.notes),
          budget_band: text(f.budgetBand),
        },
      },
      {
        name: f.contactName,
        email: f.contactEmail,
        mobile: internationalPhone(f.contactPhone, f.country),
        mobileAsTyped: f.contactPhone,
        country: f.country,
        jobTitle: f.contactTitle,
        company: f.company,
      },
    );
  }

  global.EcdAnalytics = {
    beginCheckout: safe(beginCheckout),
    checkoutStep: safe(checkoutStep),
    applyPromoCode: safe(applyPromoCode),
    selectPaymentMethod: safe(selectPaymentMethod),
    bookingComplete: safe(bookingComplete),
    purchase: safe(purchase),
    addToCalendar: safe(addToCalendar),
    generateLead: safe(generateLead),
    sponsorFormComplete: safe(sponsorFormComplete),
  };
})(window);
