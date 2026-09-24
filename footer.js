/* ============================================================
   footer.js: Reusable site footer web component
   Usage: <site-footer></site-footer>
   ============================================================ */

class SiteFooter extends HTMLElement {
  connectedCallback() {
    const year = new Date().getFullYear();

    this.innerHTML = `
      <style>
        site-footer { 
          display: block; 
        }

        .site-footer {
          padding: 44px 0;
          border-top: 1px solid var(--line, #E6EAEE);
          background: var(--bg, #fff);
          font-family: inherit;
        }

        .container {
          max-width: var(--max-w, 1280px);
          margin: 0 auto;
          padding: 0 var(--pad-x, 24px);
        }

        .footer-top {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .footer-brand img {
          height: 52px;
          width: auto;
          display: block;
        }

        .footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          font-size: 13px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .footer-links a {
          color: var(--ink-soft, #4A5568);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-links a:hover {
          color: var(--ink, #1A202C);
        }

        .footer-social {
          display: flex;
          gap: 12px;
        }

        .footer-social a {
          width: 36px;
          height: 36px;
          border: 1px solid var(--line-strong, #CBD5E0);
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ink, #1A202C);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .footer-social a:hover {
          background-color: var(--line, #F7FAFC);
          border-color: var(--ink, #1A202C);
        }

        .footer-bottom {
          border-top: 1px solid var(--line, #E6EAEE);
          margin-top: 28px;
          padding-top: 20px;
          font-size: 12px;
          color: var(--muted, #718096);
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 10px;
        }

        @media (max-width: 768px) {
          .footer-top {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .footer-bottom {
            flex-direction: column;
            gap: 6px;
          }
        }
      </style>

      <footer class="site-footer">
        <div class="container">
          <div class="footer-top">
            <a href="index.html" class="footer-brand">
              <img src="assets/trafficmena-logo.png" alt="TrafficMENA" />
            </a>
            <ul class="footer-links">
              <li><a href="index.html#experience">Experience</a></li>
              <li><a href="speakers.html">Speakers</a></li>
              <li><a href="tickets.html">Tickets</a></li>
              <!-- Hidden until the FAQ page content is updated: <li><a href="faq.html">FAQ</a></li> -->
              <li><a href="mailto:info@trafficmena.com">Contact</a></li>
              <li><a href="https://wa.me/201505437979?text=I%20need%20help%20for%20Ecommerce%20Day%202026" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp (opens in a new tab)">WhatsApp</a></li>
              <li><a href="policy.html">Privacy Policy</a></li>
            </ul>
            <div class="footer-social">
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17" cy="7" r="1" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path
                    d="M7 10v7M7 7v.01M12 17v-4.5c0-1.4 1-2.5 2.5-2.5S17 11.1 17 12.5V17"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© ${year} TrafficMENA. All rights reserved.</span>
            <span>info@trafficmena.com · <a href="https://wa.me/201505437979?text=I%20need%20help%20for%20Ecommerce%20Day%202026" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp (opens in a new tab)" style="color: inherit">WhatsApp</a></span>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define("site-footer", SiteFooter);
