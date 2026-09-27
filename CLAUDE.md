# ECommerce Day 2026 — Global Design Rules (PROMPT 0)

Designing website UX for "ECommerce Day 2026" — one-day offline event, Cairo, 5 Nov 2026, by TrafficMENA. Desktop 1440px + mobile 390px per screen. Production-ready UI, no lorem ipsum, no fake data.

## Brand
- Page bg pure white #FFFFFF; #F4F6F8 (fog) only for alternating bands/card wells. Never dark-mode pages.
- Ink/text/dark blocks #101010. Primary accent green #05EF62 (CTAs, active states, accent word). Balance 70% white / 20% ink / 10% green.
- Green small text on white: #04C44E. Mint callout bg #E6FBEE, soft green border #C3F7D7.
- Secondary blue #006681. Bright teal hover #00FDC2. Gradient (hero CTA/large accents only): linear-gradient(135deg,#05EF62,#29CF9F).
- Neutrals: borders #E6EAEE, card borders #D5DAE0, captions #6B747E, secondary #4A5563, body #1F2630.
- Never paragraph text on green/gradient bg.
- Logo: use uploaded TrafficMENA logo exactly (black squircle, white "t", green arrow). Never recreate/recolor/distort. Nav: icon + wordmark "TrafficMENA" in #101010. Min icon 24px.

## Typography
- SITE CONTENT LANGUAGE: ENGLISH on every page (user decision, overrides earlier bilingual spec). Manrope (700 headings, 400/500 body, 600 links). Keep IBM Plex Sans Arabic loaded only if Arabic ever needed.
- Eyebrows/labels/times/capacities/IDs: JetBrains Mono 11–12px uppercase, letter-spacing .08–.12em.
- Scale: H1 56/1.02 desktop (40 mobile), H2 36/1.1, H3 24, body 16/1.7, lede 18.
- No em dashes (—) or en dashes (–) anywhere on the site, in copy, titles, labels or comments. Use a comma, period, colon, parentheses or "·" instead; number ranges use a plain hyphen (1-10).

## Layout & components
- Max width 1280px, 8pt grid. Cards: white, 1px #D5DAE0, 12–16px radius, shadow on hover only.
- Buttons: Primary #05EF62 fill + #101010 text, 10px radius, 600. Secondary/ghost: #101010 1px outline on white. Dark band CTA: #101010 bg with green primary button inside.
- Section header anatomy: mono kicker (text only, no green rule/bar before it) → H2 → optional lede (max 60ch).
- Sticky translucent nav (white 85% + blur, 1px bottom #E6EAEE). Mobile: hamburger + persistent bottom "Book Your Ticket" bar.
- Tracks (label ALWAYS with color): The Control Tower ink #101010 (main stage) · CLICKED green #05EF62 · CONFIRMED blue #006681 · DELIVERED amber #FFB020.
- Status pills (text + color): Confirmed / Coming Soon / Almost Full / Fully Booked / Waitlist / Templates Included / All Access Pass Only / All Tickets.
- A11y: visible labels (no placeholder-as-label), 4.5:1 contrast, focus rings, real buttons, keyboard-navigable filters/accordions.

## Event facts
- ECommerce Day 2026, TrafficMENA, 5 Nov 2026, Cairo. One offline day: Main Stage "The Control Tower" + "Second Stage" (never "Local Brands Stage") + 3 workshop tracks (CLICKED, CONFIRMED, DELIVERED). 15+ workshops in total (5 per workshop track).
- Story: "Every order goes through three states: CLICKED → CONFIRMED → DELIVERED. The Control Tower sees the whole order."
- Promises: Control Tower = See the whole order and lead the system · CLICKED = Build the Acquisition Machine · CONFIRMED = Turn Visits into Orders · DELIVERED = Keep the Promise and the Margin.
- Capacities (label as draft/subject to venue): Control Tower 500 · CLICKED 80 · CONFIRMED 200 · DELIVERED 100.
- Contact: info@trafficmena.com · 01118111793 · trafficmena.com · WhatsApp https://wa.me/201505437979?text=I%20need%20help%20for%20Ecommerce%20Day%202026 (show a WhatsApp button wherever contact details appear).
- Social (same as trafficmena.com footer, in this order): X https://x.com/trafficmena · Facebook https://facebook.com/trafficmena · LinkedIn https://linkedin.com/company/trafficmena · Instagram https://instagram.com/trafficmena · TikTok https://tiktok.com/@trafficmena · Threads https://threads.net/@trafficmena. Footer tiles: 36px, 10px radius, ink icon, hover ink bg + green icon.
- Refunds: full refund until the end of 30 October 2026 (five days before the event), requested by email from the booking email. No refunds after that date. Tickets are non-transferable. Approved refunds go back through the original payment method.

## HARD RULES (never violate)
1. Exactly two tickets: "Standard Pass" and "All Access Pass" (formerly Control Tower Pass / Conference Pass and Full Journey Pass; never use the old names). No Group/VIP/third product, no group discount.
2. No Certificate anywhere.
3. NO RECORDINGS: never mention recordings of any kind (Main Stage, Second Stage, workshops, "sessions are recorded") on any page. There is no Recording & Photography policy. Standard Pass: full-day Main Stage + Second Stage, no platform access. All Access Pass: both stages + up to 5 workshops + Workshop Templates & Files + complete session resources + 6 months of access to TrafficMENA's premium content library (All Access only).
4. Platform access: "6 months of access to TrafficMENA's premium content library", All Access Pass only; the Standard Pass has none. Platform = Content Hub only: no Speaker Directory, no messaging, no networking tool.
5. Workshops are offline-only for All Access Pass holders. Workshop booking opens 7-10 days before the event; we announce how to book (never "after payment" or "during ticket booking"). Up to 5 workshops, subject to availability; workshops at the same time cannot be selected together; selections are final once confirmed. The pass does NOT auto-reserve. The Booking Confirmation reserve step stays hidden until `WORKSHOP_BOOKING_OPEN = true` in booking-confirmation.html.
6. Prices come ONLY from the database (admin panel); prices.js fallbacks stay null. ONE final price per ticket (EGP). No range, no strikethrough unless real dated offer. Unapproved price → token "[Final Price] EGP".
7. Venue CONFIRMED: "Creativa Innovation Hub, Giza". Google Maps: https://maps.app.goo.gl/LxbaM9baBAA8t9Pv9 . Use this exact name everywhere; link it to the map where it is clickable.
8. No sponsorship prices anywhere.
9. No fake urgency: no countdowns, no "X seats left" unless live capacity data. No pre-checked consent boxes.
10. Speakers: only confirmed names. Unannounced → single block "More speakers will be announced soon" — no silhouettes/dummy cards. Once speakers are listed, the Speakers page box under the grid reads "The lineup is impressive. More speakers will be announced soon." Featured Speakers = published speakers with the admin "Featured" switch on (max 6, by Featured sort).
11. Session times: "Slot 1 / Slot 2 / Slot 3" or approved Main Stage grid; never working times as final.
12. Unresolved items show "Coming Soon" / "Announced soon" — never hidden or guessed.

## Tickets section (single source of truth)
- The "Choose Your Access" tickets section is ONE shared component, `tickets-section.js` (`<ecd-tickets>`), used on Home, Agenda and Tickets (#ticket-cards). Edit it there only; never copy its markup into a page.
- Names, descriptions, features, badge, CTA labels and prices come from the backend (`ecd_ticket_packages` / `ecd_ticket_features`, admin panel) via `ecd-content.js` + `prices.js`. The lists in `tickets-section.js` are only the fallback shown until the API responds.
- Title: "Find the Pass That Fits Your Goals". Subtitle: "Access both live stages, or go further with workshops and extended content." All Access price carries the red "Limited Tickets" label (user-approved).
- Taglines: Standard = "See the whole system." · All Access = "Learn it. Work on it. Apply it." All Access badge allowed: "Complete Access" or "Most Complete Experience" (never "Best Value").

## Analytics (dataLayer)
- `ecd-analytics.js` (first script in `<head>` on every site page) loads GTM-5DMGVFZS (same container as the TrafficMENA app) and exposes `window.EcdAnalytics`. It extends the TrafficMENA data layer (main app `docs/events-tracking-data-model.md`): reuse its event names and params, never invent new ones without the user's approval.
- Funnel: global_variables (page view, `page_type` ecd_*) → select_item (any `[data-checkout]` button) → begin_checkout → checkout_step 1/2 → apply_promo_code → select_payment_method → purchase (booking-confirmation) → add_to_calendar. Sponsor form: generate_lead. checkout_step and generate_lead are the only ECD-only events.
- purchase: `transaction_id` = ticket serial. Fires only for real website payments: skips admin tickets (`ADMIN_*` payment method), `ECD_SIMULATE`, 0 EGP, payments older than 24h, and repeats (localStorage). No TrafficMENA backend changes for tracking (user decision).
- No PII in ECD events; no user-scoped fields (customer_type etc.) in global_variables.
- The `access=` token in booking-confirmation URLs is hidden from GA4/pixels inside GTM only (Custom JS variable). Never strip or rewrite the page URL in site code (user decision, critical).

## Caching (important)
- Shared scripts (navbar.js, footer.js, tickets-section.js, prices.js, ecd-api.js, ecd-content.js, ecd-analytics.js) are loaded with a version tag, e.g. `navbar.js?v=20260924a`. Whenever one of them changes, bump the tag on EVERY page, or browsers keep showing the old version.

## Sitemap → project files
- / Home → Home Page.dc.html
- /agenda/ (tracks + venue live here) → Agenda Page.dc.html
- /speakers/ + /speakers/[slug]/ → Speakers Page.dc.html
- /tickets/ → Tickets Page.dc.html
- /checkout/ (no nav) → Checkout Page.dc.html
- /booking-confirmation/[token] → Booking Confirmation Page.dc.html
- /sponsors-partners/ → Sponsors Page.dc.html
- /become-a-sponsor/ (3-step form) → Become a Sponsor Page.dc.html
- /faq/ → FAQ Page.dc.html
- /terms/ /privacy/ /refund-policy/ /ticket-policy/ (one template) → Policy Pages.dc.html
- Component sheet → Component Sheet.dc.html

## Global nav & footer (identical all pages)
- Nav: Agenda · Speakers · Tickets · Sponsors · FAQ (FAQ link currently HIDDEN in navbar.js and footer.js, commented out, until the FAQ page content is updated). Right: "Become a Sponsor" (ghost) + "Book Your Ticket" (primary).
- Footer: Navigation · Support (Contact, FAQ) · Social · Legal (Terms, Privacy, Refund & Cancellation, Ticket & Entry) · Sponsor Enquiries. TrafficMENA lockup + "© TrafficMENA 2026".
