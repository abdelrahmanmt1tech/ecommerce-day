/* ============================================================
   navbar.js: Reusable site navigation web component
   Usage: <site-navbar current="tickets"></site-navbar>

   Rendered in the regular DOM (no Shadow DOM) so Google Tag Manager's
   built-in click, link and visibility triggers see the real link or
   button that was clicked. Styles stay isolated by prefix instead: every
   class and id starts with "ecdnav-" and every rule is scoped under
   site-navbar. Keep new classes and ids prefixed, or page CSS and older
   page scripts (e.g. index.html's #menuToggle handler) will reach them.
   ============================================================ */

// Main TrafficMENA platform (the logo goes to the ECommerce Day home page).
const PLATFORM_URL = "https://www.trafficmena.com/";

const EXTERNAL_ICON =
  '<svg class="ecdnav-ext-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';

const NAVBAR_CSS = `
  site-navbar {
    display: block;
    width: 100%;
    position: sticky;
    top: 0;
    z-index: 1000;
  }

  site-navbar *,
  site-navbar *::before,
  site-navbar *::after {
    box-sizing: border-box;
  }

  site-navbar .ecdnav-header {
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--line, #E6EAEE);
    font-family: "Manrope", sans-serif;
  }

  site-navbar .ecdnav-inner {
    max-width: var(--max-w, 1280px);
    margin: 0 auto;
    padding: 18px var(--pad-x, 24px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: auto;
    min-height: 70px;
  }

  site-navbar .ecdnav-brand {
    display: flex;
    align-items: center;
    text-decoration: none;
    flex-shrink: 0;
  }

  site-navbar .ecdnav-brand img {
    height: 38px;
    width: auto;
    display: block;
  }

  site-navbar .ecdnav-desktop ul {
    display: flex;
    gap: clamp(16px, 1.7vw, 28px);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  site-navbar .ecdnav-desktop a {
    font-size: 14px;
    font-weight: 600;
    padding: 6px 2px;
    color: var(--ink, #101010);
    text-decoration: none;
    white-space: nowrap;
    border-bottom: 2px solid transparent;
    transition: border-color 0.2s ease, color 0.2s ease;
  }

  site-navbar .ecdnav-desktop a:hover,
  site-navbar .ecdnav-desktop a.ecdnav-active {
    border-bottom-color: var(--green, #04C44E);
  }

  site-navbar .ecdnav-platform {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  site-navbar .ecdnav-desktop .ecdnav-platform {
    color: var(--secondary, #4A5563);
  }

  site-navbar .ecdnav-desktop .ecdnav-platform:hover {
    color: var(--ink, #101010);
  }

  site-navbar .ecdnav-ext-icon {
    flex-shrink: 0;
  }

  site-navbar .ecdnav-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  site-navbar .ecdnav-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    transition: all 0.2s ease;
    line-height: 1;
  }

  site-navbar .ecdnav-btn-primary {
    background-color: var(--green, #04C44E);
    color: #fff;
    border: 1px solid transparent;
  }

  site-navbar .ecdnav-btn-primary:hover {
    opacity: 0.9;
  }

  /* Secondary CTA: white with black outline, fills black on hover */
  site-navbar .ecdnav-btn-ghost {
    background-color: #fff;
    color: #101010;
    border: 1px solid #101010;
  }

  site-navbar .ecdnav-btn-ghost:hover {
    background-color: #101010;
    color: #fff;
  }

  site-navbar .ecdnav-btn:focus-visible,
  site-navbar .ecdnav-desktop a:focus-visible,
  site-navbar .ecdnav-mobile a:focus-visible,
  site-navbar .ecdnav-toggle:focus-visible {
    outline: 2px solid #101010;
    outline-offset: 2px;
  }

  /* Icon + "Menu" label inside one outlined button */
  site-navbar .ecdnav-toggle {
    display: none;
    background: #fff;
    border: 1px solid var(--line-strong, #CBD5E0);
    border-radius: 10px;
    height: 44px;
    padding: 0 14px 0 12px;
    gap: 8px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--ink, #101010);
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
  }

  site-navbar .ecdnav-toggle .ecdnav-icon-close {
    display: none;
  }

  site-navbar .ecdnav-toggle[aria-expanded="true"] .ecdnav-icon-open {
    display: none;
  }

  site-navbar .ecdnav-toggle[aria-expanded="true"] .ecdnav-icon-close {
    display: block;
  }

  site-navbar .ecdnav-mobile {
    display: none;
    border-top: 1px solid var(--line, #E6EAEE);
    background: var(--white, #fff);
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    max-height: calc(100vh - 100%);
    max-height: calc(100dvh - 100%);
    overflow-y: auto;
  }

  site-navbar .ecdnav-mobile.ecdnav-open {
    display: block;
  }

  site-navbar .ecdnav-mobile ul {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 24px 20px;
    list-style: none;
    margin: 0;
  }

  site-navbar .ecdnav-mobile a {
    display: block;
    padding: 12px 4px;
    font-weight: 700;
    font-size: 16px;
    color: var(--ink, #101010);
    text-decoration: none;
    border-bottom: 1px solid var(--line, #E6EAEE);
  }

  site-navbar .ecdnav-mobile a.ecdnav-active {
    color: var(--green, #04C44E);
  }

  site-navbar .ecdnav-mobile .ecdnav-platform {
    display: flex;
    gap: 6px;
  }

  site-navbar .ecdnav-mobile .ecdnav-btn {
    border-bottom: none;
    margin-top: 10px;
    width: 100%;
    box-sizing: border-box;
    text-align: center;
  }

  site-navbar .ecdnav-mobile .ecdnav-btn-ghost {
    border: 1px solid #101010;
    background-color: #fff;
    color: #101010;
  }

  site-navbar .ecdnav-mobile .ecdnav-btn-ghost:hover {
    background-color: #101010;
    color: #fff;
  }

  /* Below this width the links + buttons no longer fit on one row */
  @media (max-width: 992px) {
    site-navbar .ecdnav-desktop {
      display: none;
    }

    site-navbar .ecdnav-cta {
      display: none;
    }

    site-navbar .ecdnav-toggle {
      display: inline-flex;
    }
  }
`;

// Added once, at the end of <head>, so it wins ties with page CSS.
function ensureNavbarStyles() {
  if (document.getElementById("ecdnav-styles")) return;
  const style = document.createElement("style");
  style.id = "ecdnav-styles";
  style.textContent = NAVBAR_CSS;
  document.head.appendChild(style);
}

class SiteNavbar extends HTMLElement {
  connectedCallback() {
    // Render once; moving the element must not duplicate the document listeners.
    if (this.dataset.ecdnavReady) return;
    this.dataset.ecdnavReady = "1";
    ensureNavbarStyles();

    const currentPage = (this.getAttribute("current") || "").toLowerCase();

    const links = [
      { href: "index.html", label: "Home" },
      { href: "agenda.html", label: "Agenda" },
      { href: "speakers.html", label: "Speakers" },
      { href: "sponsors.html", label: "Sponsors" },
      { href: "tickets.html", label: "Tickets" },
      // Hidden until the FAQ page content is updated. Uncomment to restore:
      // { href: "faq.html", label: "FAQ" },
    ];

    const renderLink = (l) => {
      const isActive = l.label.toLowerCase() === currentPage;
      return `<li><a href="${l.href}"${isActive ? ' class="ecdnav-active" aria-current="page"' : ""}>${l.label}</a></li>`;
    };

    const platformLink = (label) =>
      `<li><a href="${PLATFORM_URL}" class="ecdnav-platform" aria-label="TrafficMENA Platform, the main TrafficMENA website">${label}${EXTERNAL_ICON}</a></li>`;

    const desktopLinks = links.map(renderLink).join("") + platformLink("TrafficMENA");
    const mobileLinks = links.map(renderLink).join("") + platformLink("TrafficMENA Platform");

    this.innerHTML = `
      <header class="ecdnav-header" id="top">
        <div class="ecdnav-inner">
          <a
            href="index.html"
            class="ecdnav-brand"
            aria-label="ECommerce Day home"
          >
            <img
              src="assets/ecommerce-day-logo.webp"
              width="83"
              height="38"
              alt="E-commerce Day by TrafficMENA"
            />
          </a>

          <nav class="ecdnav-desktop" aria-label="Primary">
            <ul>
              ${desktopLinks}
            </ul>
          </nav>

          <div class="ecdnav-actions">
            <a href="become-a-sponsor.html" class="ecdnav-btn ecdnav-btn-ghost ecdnav-cta">Become a Sponsor</a>
            <a href="tickets.html" class="ecdnav-btn ecdnav-btn-primary ecdnav-cta">Get Your Ticket</a>
            <button
              type="button"
              class="ecdnav-toggle"
              id="ecdnav-toggle"
              aria-expanded="false"
              aria-controls="ecdnav-menu"
            >
              <svg
                class="ecdnav-icon-open"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
              <svg
                class="ecdnav-icon-close"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
              <span>Menu</span>
            </button>
          </div>
        </div>

        <nav class="ecdnav-mobile" id="ecdnav-menu" aria-label="Menu">
          <ul>
            ${mobileLinks}
            <li>
              <a href="become-a-sponsor.html" class="ecdnav-btn ecdnav-btn-ghost">Become a Sponsor</a>
            </li>
            <li>
              <a href="tickets.html" class="ecdnav-btn ecdnav-btn-primary">Get Your Ticket</a>
            </li>
          </ul>
        </nav>
      </header>
    `;

    const toggleBtn = this.querySelector("#ecdnav-toggle");
    const mobileNav = this.querySelector("#ecdnav-menu");

    const closeMenu = () => {
      mobileNav.classList.remove("ecdnav-open");
      toggleBtn.setAttribute("aria-expanded", "false");
    };

    toggleBtn.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("ecdnav-open");
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileNav.classList.contains("ecdnav-open")) {
        closeMenu();
        toggleBtn.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 992) closeMenu();
    });

    trackHeaderHeight(this.querySelector(".ecdnav-header"));
  }
}

customElements.define("site-navbar", SiteNavbar);

/* ------------------------------------------------------------
   Section links (index.html#experience, #outcomes, ...)
   The browser jumps to the section as soon as the HTML arrives,
   but partners, speakers and other blocks above it are rendered
   later by JavaScript and push the section down, so the visitor
   lands one section too early. We keep the target aligned while
   the page is still settling, and stop the moment the visitor
   scrolls, taps or presses a key themselves.
   ------------------------------------------------------------ */

// Sections scroll to just below the sticky header, not under it.
function trackHeaderHeight(header) {
  const root = document.documentElement;
  const set = () => root.style.setProperty("--ecd-nav-h", header.offsetHeight + "px");
  set();
  if ("ResizeObserver" in window) new ResizeObserver(set).observe(header);
  if (!document.getElementById("ecd-anchor-offset")) {
    const style = document.createElement("style");
    style.id = "ecd-anchor-offset";
    style.textContent = "[id]{scroll-margin-top:var(--ecd-nav-h,80px)}";
    document.head.appendChild(style);
  }
}

(function keepHashTargetAligned() {
  const SETTLE_MS = 6000;
  let stop = null;

  // sameDocument: a section link clicked on this page. The browser's own
  // smooth scroll handles it, so we only correct real layout shifts.
  function settle(sameDocument) {
    if (stop) stop();
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id || id === "top") return;

    let done = false;
    let observer = null;
    let skipFirst = sameDocument === true;
    const align = () => {
      if (done) return;
      if (skipFirst) {
        skipFirst = false;
        return;
      }
      const target = document.getElementById(id);
      if (!target) return;
      const offset = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const delta = target.getBoundingClientRect().top - offset;
      if (Math.abs(delta) > 2) {
        window.scrollTo({ top: window.scrollY + delta, behavior: "instant" });
      }
    };
    const userEvents = ["wheel", "touchstart", "keydown", "mousedown"];
    stop = () => {
      done = true;
      userEvents.forEach((ev) => window.removeEventListener(ev, stop, true));
      if (observer) observer.disconnect();
      window.removeEventListener("load", align);
      clearTimeout(timer);
    };
    userEvents.forEach((ev) =>
      window.addEventListener(ev, stop, { capture: true, passive: true }),
    );
    if ("ResizeObserver" in window) {
      observer = new ResizeObserver(align);
      observer.observe(document.body);
    }
    window.addEventListener("load", align);
    const timer = setTimeout(stop, SETTLE_MS);
    if (!sameDocument) requestAnimationFrame(align);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => settle(false));
  } else {
    settle(false);
  }
  window.addEventListener("hashchange", () => settle(true));
})();
