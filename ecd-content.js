/**
 * ECommerce Day: hydrate partners / speakers / packages from GET /api/ecd/content.
 * Requires prices.js then ecd-api.js before this file.
 */
(function (global) {
  "use strict";

  function el(tag, attrs) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else if (k === "html") node.innerHTML = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    return node;
  }

  function checkSvg() {
    return (
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#04C44E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>'
    );
  }

  function xSvg() {
    return (
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9AA3AD" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
    );
  }

  function silhouetteSvg() {
    return (
      '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D5DAE0" stroke-width="1.4"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>'
    );
  }

  function renderPartners(partners) {
    var wrap = document.getElementById("partnersMarquee");
    if (!wrap) return;
    wrap.innerHTML = "";
    var list = (partners || []).filter(function (p) {
      return p.showOnHome !== false;
    });
    if (!list.length) {
      wrap.appendChild(
        el("div", {
          class: "partner-tile",
          html: "<span>Partners announced soon</span>",
        }),
      );
      return;
    }

    function makeTile(p) {
      var inner;
      if (p.logoUrl) {
        inner = el("img", {
          src: p.logoUrl,
          alt: p.name || "Partner",
          loading: "lazy",
        });
        inner.style.maxHeight = "40px";
        inner.style.maxWidth = "120px";
        inner.style.objectFit = "contain";
      } else {
        inner = el("span", { text: p.name || "Partner" });
      }

      if (p.websiteUrl) {
        var a = el("a", {
          href: p.websiteUrl,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "partner-tile",
        });
        a.style.textDecoration = "none";
        a.style.color = "inherit";
        a.style.display = "flex";
        a.style.alignItems = "center";
        a.style.justifyContent = "center";
        a.appendChild(inner);
        return a;
      }

      var tile = el("div", { class: "partner-tile" });
      tile.appendChild(inner);
      return tile;
    }

    var frag = document.createDocumentFragment();
    // Duplicate strip for CSS marquee loop
    list.concat(list).forEach(function (p) {
      frag.appendChild(makeTile(p));
    });
    wrap.appendChild(frag);
  }

  function wireSpeakerCarousel(track) {
    var prev = document.getElementById("prevSpeaker");
    var next = document.getElementById("nextSpeaker");
    if (!prev || !next || track.dataset.carouselBound) return;
    track.dataset.carouselBound = "1";
    function scrollByCard(dir) {
      var card = track.firstElementChild;
      var amount =
        (card ? card.getBoundingClientRect().width + 20 : 280) * dir;
      track.scrollBy({ left: amount, behavior: "smooth" });
    }
    function updateButtons() {
      var atStart = track.scrollLeft <= 4;
      var atEnd =
        track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
      prev.disabled = atStart;
      next.disabled = atEnd;
    }
    prev.addEventListener("click", function () {
      scrollByCard(-1);
    });
    next.addEventListener("click", function () {
      scrollByCard(1);
    });
    track.addEventListener("scroll", updateButtons, { passive: true });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollByCard(1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollByCard(-1);
      }
    });
    setTimeout(updateButtons, 0);
  }

  function renderSpeakers(speakers) {
    var track = document.getElementById("speakersTrack");
    if (!track) return;
    track.innerHTML = "";
    if (!speakers || !speakers.length) {
      var empty = el("article", { class: "speaker-card" });
      empty.appendChild(
        el("div", { class: "speaker-photo", html: silhouetteSvg() }),
      );
      var info = el("div", { class: "speaker-info" });
      info.appendChild(
        el("div", { class: "speaker-name", text: "More speakers will be announced soon" }),
      );
      info.appendChild(el("div", { class: "speaker-role", text: "" }));
      empty.appendChild(info);
      track.appendChild(empty);
      wireSpeakerCarousel(track);
      return;
    }
    speakers.forEach(function (s) {
      var card = el("article", { class: "speaker-card" });
      var photo = el("div", { class: "speaker-photo" });
      if (s.photoUrl) {
        var img = el("img", {
          src: s.photoUrl,
          alt: s.name || "Speaker",
          loading: "lazy",
        });
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        photo.appendChild(img);
      } else {
        photo.innerHTML = silhouetteSvg();
      }
      var info = el("div", { class: "speaker-info" });
      info.appendChild(el("div", { class: "speaker-name", text: s.name || "" }));
      var roleLine = [s.role, s.company].filter(Boolean).join(", ");
      info.appendChild(el("div", { class: "speaker-role", text: roleLine }));
      card.appendChild(photo);
      card.appendChild(info);
      track.appendChild(card);
    });
    wireSpeakerCarousel(track);
  }

  function fillFeatureList(listEl, features, kind) {
    if (!listEl) return;
    listEl.innerHTML = "";
    (features || [])
      .filter(function (f) {
        return f.kind === kind;
      })
      .forEach(function (f) {
        var weight = f.emphasis ? 700 : 400;
        var icon = kind === "excluded" ? xSvg() : checkSvg();
        listEl.appendChild(
          el("li", {
            html:
              icon +
              '<span style="font-weight:' +
              weight +
              '">' +
              f.label +
              "</span>",
          }),
        );
      });
  }

  function applyPackageCard(ticketType, pkg) {
    if (!pkg) return;
    var card = document.querySelector('[data-ticket-card="' + ticketType + '"]');
    if (!card) return;

    var eyebrow = card.querySelector("[data-pkg-eyebrow]");
    var title = card.querySelector("[data-pkg-title]");
    var desc = card.querySelector("[data-pkg-desc]");
    var badge = card.querySelector("[data-pkg-badge]");
    var cta = card.querySelector("[data-pkg-cta]");

    if (eyebrow) eyebrow.textContent = pkg.eyebrow || pkg.displayName;
    if (title) title.textContent = pkg.title;
    if (desc) desc.textContent = pkg.description;
    if (cta) cta.textContent = pkg.ctaLabel || ("Get " + pkg.displayName);
    if (badge) {
      if (pkg.badge) {
        badge.hidden = false;
        badge.textContent = pkg.badge;
      } else {
        badge.hidden = true;
      }
    }

    if (ticketType === "ct") {
      fillFeatureList(document.getElementById("confIncluded"), pkg.features, "included");
      fillFeatureList(document.getElementById("confExcluded"), pkg.features, "excluded");
    } else {
      fillFeatureList(document.getElementById("allAccess"), pkg.features, "included");
    }
  }

  function hydrate(content, activeTicketId) {
    if (!content) return;
    if (global.EventPrices && global.EventPrices.applyFromPackages) {
      global.EventPrices.applyFromPackages(content.packages, activeTicketId);
    }
    renderPartners(content.partners);
    renderSpeakers(content.speakers);
    if (content.packages) {
      applyPackageCard("ct", content.packages.ct);
      applyPackageCard("fj", content.packages.fj);
      // tickets.html card titles (no data-ticket-card markup)
      if (content.packages.ct && content.packages.ct.displayName) {
        document.querySelectorAll(".ticket-name.standard, .ticket-card.standard .ticket-name").forEach(function (el) {
          el.textContent = content.packages.ct.displayName;
        });
      }
      if (content.packages.fj && content.packages.fj.displayName) {
        document.querySelectorAll(".ticket-name.featured, .ticket-card.featured .ticket-name").forEach(function (el) {
          el.textContent = content.packages.fj.displayName;
        });
        document.querySelectorAll(".avail-title").forEach(function (el) {
          if (/full journey/i.test(el.textContent || "")) {
            el.textContent = content.packages.fj.displayName;
          }
        });
      }
    }
  }

  var readyPromise = null;

  function boot(activeTicketId) {
    if (!global.EcdApi || typeof global.EcdApi.fetchContent !== "function") {
      return Promise.reject(new Error("EcdApi.fetchContent unavailable"));
    }
    if (readyPromise) return readyPromise;
    readyPromise = global.EcdApi.fetchContent()
      .then(function (content) {
        hydrate(content, activeTicketId);
        return content;
      })
      .catch(function (err) {
        console.warn("[ecd-content] fetch failed; using static fallback", err);
        // Unblock checkout with static prices.js fallback
        if (global.EventPrices && global.EventPrices.applyFromPackages) {
          var fallback = {
            ct: {
              priceEgp: global.EventPrices.PRICES.controlTower,
              displayName: global.EventPrices.TICKETS.ct.name,
              tagline: global.EventPrices.TICKETS.ct.tagline,
              description: "",
              features: [],
            },
            fj: {
              priceEgp: global.EventPrices.PRICES.fullJourney,
              displayName: global.EventPrices.TICKETS.fj.name,
              tagline: global.EventPrices.TICKETS.fj.tagline,
              description: "",
              features: [],
            },
          };
          global.EventPrices.applyFromPackages(fallback, activeTicketId);
          return { partners: [], speakers: [], packages: fallback };
        }
        throw err;
      });
    return readyPromise;
  }

  function resolveActiveTicket() {
    try {
      var params = new URLSearchParams(global.location.search);
      return params.get("ticket") === "ct" ? "ct" : "fj";
    } catch (e) {
      return "fj";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      boot(resolveActiveTicket());
    });
  } else {
    boot(resolveActiveTicket());
  }

  global.EcdContent = {
    hydrate: hydrate,
    boot: boot,
    ready: function () {
      return readyPromise || boot(resolveActiveTicket());
    },
  };
})(window);
