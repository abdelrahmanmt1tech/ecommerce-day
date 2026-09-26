/* ============================================================
   navbar.js: Reusable site navigation web component
   Usage: <site-navbar current="tickets"></site-navbar>
   ============================================================ */

class SiteNavbar extends HTMLElement {
  constructor() {
    super();
    // 💡 تفعيل الـ Shadow DOM لعزل التنسيقات تماماً عن الـ Global CSS
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const currentPage = (this.getAttribute("current") || "").toLowerCase();

    const links = [
      { href: "agenda.html", label: "Agenda" },
      { href: "index.html#experience", label: "Experience" },
      { href: "speakers.html", label: "Speakers" },
      { href: "sponsors.html", label: "Sponsors" },
      { href: "index.html#outcomes", label: "Outcomes" },
      { href: "tickets.html", label: "Tickets" },
      // Hidden until the FAQ page content is updated. Uncomment to restore:
      // { href: "faq.html", label: "FAQ" },
    ];

    const renderLink = (l) => {
      const isActive = l.label.toLowerCase() === currentPage;
      return `<li><a href="${l.href}"${isActive ? ' class="active"' : ""}>${l.label}</a></li>`;
    };

    const desktopLinks = links.map(renderLink).join("");
    const mobileLinks = links.map(renderLink).join("");

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        *, *::before, *::after {
          box-sizing: border-box;
        }

        .site-header {
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--line, #E6EAEE);
          font-family: "Manrope", sans-serif;
        }

        .container {
          max-width: var(--max-w, 1280px);
          margin: 0 auto;
          padding: 0 var(--pad-x, 24px);
        }

        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          /* ✅ التأكيد المباشر للـ Padding الرأسي */
          padding-top: 18px !important;
          padding-bottom: 18px !important;
          height: auto;
          min-height: 70px;
        }

        .brand {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .brand img {
          height: 38px;
          width: auto;
          display: block;
        }

        .nav-desktop ul {
          display: flex;
          gap: 28px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-desktop a {
          font-size: 14px;
          font-weight: 600;
          padding: 6px 2px;
          color: var(--ink, #101010);
          text-decoration: none;
          border-bottom: 2px solid transparent;
          transition: border-color 0.2s ease, color 0.2s ease;
        }

        .nav-desktop a:hover,
        .nav-desktop a.active {
          border-bottom-color: var(--green, #04C44E);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          line-height: 1;
        }

        .btn-primary {
          background-color: var(--green, #04C44E);
          color: #fff;
          border: 1px solid transparent;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        /* Secondary CTA: white with black outline, fills black on hover */
        .btn-ghost {
          background-color: #fff;
          color: #101010;
          border: 1px solid #101010;
        }

        .btn-ghost:hover {
          background-color: #101010;
          color: #fff;
        }

        .btn:focus-visible {
          outline: 2px solid #101010;
          outline-offset: 2px;
        }

        .menu-toggle {
          display: none;
          background: none;
          border: 1px solid var(--line-strong, #CBD5E0);
          border-radius: 10px;
          width: 44px;
          height: 44px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--ink, #101010);
          padding: 0;
        }

        .nav-mobile {
          display: none;
          border-top: 1px solid var(--line, #E6EAEE);
          background: var(--white, #fff);
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }

        .nav-mobile.is-open {
          display: block;
        }

        .nav-mobile ul {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px 24px 20px;
          list-style: none;
          margin: 0;
        }

        .nav-mobile a {
          display: block;
          padding: 12px 4px;
          font-weight: 700;
          font-size: 16px;
          color: var(--ink, #101010);
          text-decoration: none;
          border-bottom: 1px solid var(--line, #E6EAEE);
        }

        .nav-mobile a.active {
          color: var(--green, #04C44E);
        }

        .nav-mobile .btn {
          border-bottom: none;
          margin-top: 10px;
          width: 100%;
          box-sizing: border-box;
          text-align: center;
        }

        .nav-mobile .btn-ghost {
          border: 1px solid #101010;
          background-color: #fff;
          color: #101010;
        }

        .nav-mobile .btn-ghost:hover {
          background-color: #101010;
          color: #fff;
        }

        @media (max-width: 992px) {
          .nav-desktop {
            display: none;
          }

          .nav-cta {
            display: none;
          }

          .menu-toggle {
            display: flex;
          }
        }
      </style>

      <header class="site-header" id="top">
        <div class="container header-inner">
          <a
            href="index.html"
            class="brand"
            aria-label="ECommerce Day home"
          >
            <img
              src="assets/ecommerce-day-logo.webp"
              width="83"
              height="38"
              alt="E-commerce Day by TrafficMENA"
            />
          </a>

          <nav class="nav-desktop" aria-label="Primary">
            <ul>
              ${desktopLinks}
            </ul>
          </nav>

          <div class="header-actions">
            <a href="become-a-sponsor.html" class="btn btn-ghost nav-cta">Become a Sponsor</a>
            <a href="tickets.html" class="btn btn-primary nav-cta">Get Your Ticket</a>
            <button
              class="menu-toggle"
              id="menuToggle"
              aria-expanded="false"
              aria-label="Open menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>

        <div class="nav-mobile" id="navMobile">
          <ul>
            ${mobileLinks}
            <li>
              <a href="become-a-sponsor.html" class="btn btn-ghost">Become a Sponsor</a>
            </li>
            <li>
              <a href="tickets.html" class="btn btn-primary">Get Your Ticket</a>
            </li>
          </ul>
        </div>
      </header>
    `;

    const toggleBtn = this.shadowRoot.querySelector("#menuToggle");
    const mobileNav = this.shadowRoot.querySelector("#navMobile");

    toggleBtn.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("is-open");
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("is-open");
        toggleBtn.setAttribute("aria-expanded", "false");
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 992) {
        mobileNav.classList.remove("is-open");
        toggleBtn.setAttribute("aria-expanded", "false");
      }
    });
  }
}

customElements.define("site-navbar", SiteNavbar);
