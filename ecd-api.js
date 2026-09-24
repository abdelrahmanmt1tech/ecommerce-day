/**
 * ECommerce Day 2026: backend bridge for static HTML pages.
 * Talks to trafficmena `/api/ecd/*` with a temporary checkout token (not Better Auth).
 *
 * Configure API_BASE for your environment. Package prices/names come from
 * GET /content (ecd-content.js → EventPrices.applyFromPackages); server re-validates on session/pay.
 */
(function (global) {
  "use strict";

  var CONFIG = {
    API_BASE: "https://www.trafficmena.com/api/ecd",
    STORAGE_TOKEN: "ecd2026_checkout_token",
    STORAGE_PUBLIC: "ecd2026_public_token",
    STORAGE_BOOKING: "ecd2026_booking",
    EVENT: {
      title: "ECommerce Day 2026",
      startIso: "2026-11-05T10:00:00+02:00",
      endIso: "2026-11-05T18:00:00+02:00",
      location: "Creativa Innovation Hub, Giza",
    },
  };

  function getToken() {
    try {
      return sessionStorage.getItem(CONFIG.STORAGE_TOKEN) || "";
    } catch (e) {
      return "";
    }
  }

  function setSession(payload) {
    try {
      if (payload.checkoutToken) {
        sessionStorage.setItem(CONFIG.STORAGE_TOKEN, payload.checkoutToken);
      }
      if (payload.publicToken) {
        sessionStorage.setItem(CONFIG.STORAGE_PUBLIC, payload.publicToken);
      }
      sessionStorage.setItem(
        CONFIG.STORAGE_BOOKING,
        JSON.stringify({
          orderCode: payload.orderCode,
          bookingId: payload.bookingId,
          publicToken: payload.publicToken,
          checkoutToken: payload.checkoutToken,
          ticketType: payload.ticketType,
          qty: payload.qty,
          totalCents: payload.totalCents,
        }),
      );
    } catch (e) {}
  }

  function getStoredBooking() {
    try {
      var raw = sessionStorage.getItem(CONFIG.STORAGE_BOOKING);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function getPublicToken() {
    try {
      return sessionStorage.getItem(CONFIG.STORAGE_PUBLIC) || "";
    } catch (e) {
      return "";
    }
  }

  function api(path, options) {
    options = options || {};
    var headers = Object.assign(
      { "Content-Type": "application/json" },
      options.headers || {},
    );
    var token = options.token !== undefined ? options.token : getToken();
    if (token) headers.Authorization = "Bearer " + token;

    return fetch(CONFIG.API_BASE + path, {
      method: options.method || "GET",
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: "omit",
    }).then(async function (res) {
      var json = null;
      try {
        json = await res.json();
      } catch (e) {
        json = null;
      }
      if (!res.ok) {
        var err = new Error(
          (json && json.error && json.error.message) ||
            "Request failed (" + res.status + ")",
        );
        err.status = res.status;
        err.code = json && json.error && json.error.code;
        err.payload = json;
        throw err;
      }
      return json && json.data !== undefined ? json.data : json;
    });
  }

  function createSession(payload) {
    return api("/session", { method: "POST", body: payload, token: "" }).then(
      function (data) {
        setSession(data);
        return data;
      },
    );
  }

  function fetchPaymentMethods() {
    return api("/payment-methods");
  }

  function pay(payload) {
    return api("/pay", { method: "POST", body: payload });
  }

  function verify(bookingId) {
    return api("/verify", {
      method: "POST",
      body: bookingId ? { bookingId: bookingId } : {},
    });
  }

  function fetchBooking(orderCode, publicToken, accessToken) {
    var token = getToken();
    var q = publicToken || getPublicToken();
    var access =
      accessToken ||
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("access")
        : "") ||
      "";
    try {
      if (!access) access = sessionStorage.getItem("ecd2026_access") || "";
    } catch (e) {}
    var path = "/booking/" + encodeURIComponent(orderCode);
    var qs = [];
    if (q) qs.push("publicToken=" + encodeURIComponent(q));
    if (access) qs.push("access=" + encodeURIComponent(access));
    if (qs.length) path += "?" + qs.join("&");
    return api(path, { token: token || "" }).then(function (data) {
      try {
        if (access) sessionStorage.setItem("ecd2026_access", access);
      } catch (e) {}
      return data;
    });
  }

  function fetchMyBooking() {
    return api("/me/booking");
  }

  /** Public CMS payload: partners, speakers, packages (ct/fj). */
  function fetchContent() {
    return api("/content", { token: "" });
  }

  /**
   * Persist FJ workshop picks for a paid booking.
   * Auth: Bearer checkout token and/or publicToken / access query.
   */
  function reserveWorkshops(orderCode, sessionSlugs) {
    var q = getPublicToken();
    var access = "";
    try {
      access = sessionStorage.getItem("ecd2026_access") || "";
    } catch (e) {}
    if (!access && typeof window !== "undefined") {
      access = new URLSearchParams(window.location.search).get("access") || "";
    }
    var path = "/booking/" + encodeURIComponent(orderCode) + "/workshops";
    var qs = [];
    if (q) qs.push("publicToken=" + encodeURIComponent(q));
    if (access) qs.push("access=" + encodeURIComponent(access));
    if (qs.length) path += "?" + qs.join("&");
    return api(path, {
      method: "POST",
      body: { sessionSlugs: sessionSlugs || [] },
    });
  }

  /** Partnership inquiry from become-a-sponsor.html */
  function submitSponsorInquiry(payload) {
    return api("/sponsor-inquiries", {
      method: "POST",
      body: payload,
      token: "",
    });
  }

  function buildIcs(event) {
    event = event || CONFIG.EVENT;
    function fmt(iso) {
      var d = new Date(iso);
      return (
        d.getUTCFullYear() +
        pad(d.getUTCMonth() + 1) +
        pad(d.getUTCDate()) +
        "T" +
        pad(d.getUTCHours()) +
        pad(d.getUTCMinutes()) +
        pad(d.getUTCSeconds()) +
        "Z"
      );
    }
    function pad(n) {
      return String(n).padStart(2, "0");
    }
    var uid = "ecd26-" + Date.now() + "@trafficmena.com";
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//TrafficMENA//ECommerce Day 2026//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + uid,
      "DTSTAMP:" + fmt(new Date().toISOString()),
      "DTSTART:" + fmt(event.startIso),
      "DTEND:" + fmt(event.endIso),
      "SUMMARY:" + (event.title || CONFIG.EVENT.title),
      "LOCATION:" + (event.location || CONFIG.EVENT.location),
      "DESCRIPTION:ECommerce Day 2026 by TrafficMENA",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
  }

  function downloadIcs(event) {
    var ics = buildIcs(event);
    var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "ecommerce-day-2026.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function centsFromPricesJs(ticketId, qty, promoCode) {
    if (!global.EventPrices) return null;
    var totals = global.EventPrices.calcTotals(ticketId, qty, promoCode);
    if (!totals || totals.total == null) return null;
    return Math.round(Number(totals.total) * 100);
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(CONFIG.STORAGE_TOKEN);
      sessionStorage.removeItem(CONFIG.STORAGE_PUBLIC);
      sessionStorage.removeItem(CONFIG.STORAGE_BOOKING);
    } catch (e) {}
  }

  global.EcdApi = {
    CONFIG: CONFIG,
    createSession: createSession,
    fetchPaymentMethods: fetchPaymentMethods,
    pay: pay,
    verify: verify,
    fetchBooking: fetchBooking,
    fetchMyBooking: fetchMyBooking,
    getToken: getToken,
    getPublicToken: getPublicToken,
    getStoredBooking: getStoredBooking,
    setSession: setSession,
    clearSession: clearSession,
    buildIcs: buildIcs,
    downloadIcs: downloadIcs,
    centsFromPricesJs: centsFromPricesJs,
    fetchContent: fetchContent,
    reserveWorkshops: reserveWorkshops,
    submitSponsorInquiry: submitSponsorInquiry,
  };
})(window);
