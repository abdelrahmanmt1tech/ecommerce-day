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
- Times (Cairo, UTC+2 in November): registration opens 10:00 AM, program 10:30 AM to 7:00 PM. Calendar entries (.ics, emails) use 10:30 AM to 7:00 PM, always written with +02:00 (never +03:00, which shows an hour early).
- Capacities (label as draft/subject to venue): Control Tower 500 · CLICKED 80 · CONFIRMED 200 · DELIVERED 100.
- Contact: info@trafficmena.com · 01118111793 · trafficmena.com · WhatsApp https://wa.me/201505437979?text=I%20need%20help%20for%20Ecommerce%20Day%202026 (show a WhatsApp button wherever contact details appear). Floating WhatsApp button on every page comes from `ecd-whatsapp.js` (green 56px circle, bottom-left, same as the main app). It lifts above any sticky bottom bar marked `data-ecd-bottom-bar`; mark every new sticky bottom bar with it.
- Social (same as trafficmena.com footer, in this order): X https://x.com/trafficmena · Facebook https://facebook.com/trafficmena · LinkedIn https://linkedin.com/company/trafficmena · Instagram https://instagram.com/trafficmena · TikTok https://tiktok.com/@trafficmena · Threads https://threads.net/@trafficmena. Footer tiles: 36px, 10px radius, ink icon, hover ink bg + green icon.
- Refunds: full refund until the end of 30 October 2026 (five days before the event), requested by email from the booking email. No refunds after that date. Tickets are non-transferable. Approved refunds go back through the original payment method.

## HARD RULES (never violate)
1. Exactly two tickets: "Standard Pass" and "All Access Pass" (formerly Control Tower Pass / Conference Pass and Full Journey Pass; never use the old names). No Group/VIP/third product, no group discount.
2. No Certificate anywhere.
3. NO RECORDINGS: never mention recordings of any kind (Main Stage, Second Stage, workshops, "sessions are recorded") on any page. There is no Recording & Photography policy. Standard Pass: full-day Main Stage + Second Stage. All Access Pass: both stages + up to 5 workshops + Workshop Templates & Files + complete session resources.
4. NO PLATFORM / CONTENT LIBRARY (removed 28 Sep 2026, the limited tickets carrying it sold out): never mention the premium content library, "6 months" access, a platform, Content Hub, account activation or login for any pass, on any page (including booking confirmation and policies). Content included with a pass (Workshop Templates & Files, summaries, Action Pack, report) is sent by email after the event.
5. Workshops are offline-only for All Access Pass holders. Workshop booking opens 7-10 days before the event; we announce how to book (never "after payment" or "during ticket booking"). Up to 5 workshops, subject to availability; workshops at the same time cannot be selected together; selections are final once confirmed. The pass does NOT auto-reserve. The Booking Confirmation reserve step stays hidden until `WORKSHOP_BOOKING_OPEN = true` in booking-confirmation.html.
6. Prices come ONLY from the database (admin panel); prices.js fallbacks stay null. ONE final price per ticket (EGP). No range, no strikethrough unless real dated offer. Unapproved price → token "[Final Price] EGP".
7. Venue CONFIRMED: "Creativa Innovation Hub, Giza". Google Maps: https://maps.app.goo.gl/LxbaM9baBAA8t9Pv9 . Use this exact name everywhere; link it to the map where it is clickable.
8. No sponsorship prices anywhere.
9. No fake urgency: no countdowns, no "X seats left" unless live capacity data. Exception (user decision, 30 Sep 2026): on checkout the policies box and the newsletter box both start ticked; no other box may be pre-ticked.
10. Speakers: only confirmed names. Unannounced → single block "More speakers will be announced soon" — no silhouettes/dummy cards. Once speakers are listed, the Speakers page box under the grid reads "The lineup is impressive. More speakers will be announced soon." Featured Speakers = published speakers with the admin "Featured" switch on (max 6, by Featured sort).
11. Session times: "Slot 1 / Slot 2 / Slot 3" or approved Main Stage grid; never working times as final.
12. Unresolved items show "Coming Soon" / "Announced soon" — never hidden or guessed.

## Tickets section (single source of truth)
- The "Choose Your Access" tickets section is ONE shared component, `tickets-section.js` (`<ecd-tickets>`), used on Home, Agenda and Tickets (#ticket-cards). Edit it there only; never copy its markup into a page.
- Names, descriptions, features, badge, CTA labels and prices come from the backend (`ecd_ticket_packages` / `ecd_ticket_features`, admin panel) via `ecd-content.js` + `prices.js`. The lists in `tickets-section.js` are only the fallback shown until the API responds.
- Title: "Find the Pass That Fits Your Goals". Subtitle: "Access both live stages, or go further with workshops and extended content." All Access price carries the red "Limited Tickets" label (user-approved).
- Taglines: Standard = "See the whole system." · All Access = "Learn it. Work on it. Apply it." All Access badge allowed: "Complete Access" or "Most Complete Experience" (never "Best Value").

## Sponsors & Community Partners (user decision, 30 Sep 2026)
- Logos come only from the admin panel's ECD Sponsors screen (`/api/ecd/content` partners). The admin tier decides the section: "community" (or no tier) → Community Partners; Top Player / Strategic / Innovation / Empowerment → Sponsors (sorted by tier order).
- Home: "Our Sponsors · The Sponsors Behind ECommerce Day" right under the hero (grid, "Become a Sponsor" button); "Community · Our Community Partners" right under the speakers (logo strip, "Become a Partner" button). "Show on Home" switch still filters Home.
- Sponsors page: "Our Sponsors" section under the hero; "Community · Our Community Partners" cards just above "Across TrafficMENA programs". "Featured" switch: on = full card; a community partner with it off still shows, as a small light logo tile under the cards (never hidden).
- Sponsors show 6 gray logo tiles (no text) until real sponsors fill them; each real sponsor replaces one gray tile. Rendering lives in ecd-content.js (Home) and the inline script in sponsors.html.

## Analytics (dataLayer)
- `ecd-analytics.js` (first script in `<head>` on every site page) loads GTM-5DMGVFZS (same container as the TrafficMENA app) and exposes `window.EcdAnalytics`. It extends the TrafficMENA data layer (main app `docs/events-tracking-data-model.md`): reuse its event names and params, never invent new ones without the user's approval.
- Funnel: global_variables (page view, `page_type` ecd_*) → select_item (any `[data-checkout]` button) → begin_checkout → checkout_step 1 `your_details` ("Continue to payment") → booking_complete → apply_promo_code → checkout_step 2 `payment` + select_payment_method (Pay) → purchase (booking-confirmation) → add_to_calendar. Sponsor form: generate_lead (no PII, for GA4) + sponsor_form_complete (same moment, once per request code). checkout_step, booking_complete, generate_lead and sponsor_form_complete are the only ECD-only events.
- sponsor_form_complete (user decision, 30 Sep 2026): `lead_id`/`event_id` = request code; `sponsor_data` = the rest of the form in plain text (company, website, sector, country, company_size, job_title, preferred_contact, objectives, sponsorship_level, interested_properties, target_audience, timing, notes, budget_band); contact name, email and phone in `user_data` with the same keys, plain + hashed, as booking_complete.
- booking_complete (user decision, 30 Sep 2026): fires when POST /session saves the registration (ECD registrations), `payment_status: "pending"`, `booking_id`, `order_code`, same order fields as purchase. Once per `user_data.user_id` + pass (localStorage); later registrations by the same buyer for the same pass do not fire again.
- user_data (booking_complete + purchase, user decision 30 Sep 2026): `user_id` (SHA-256 of the lowercased email), the whole booking form in plain text for the CRM (full/first/last name, email, phone_with_plus, phone_without_plus, country, job_title, company, store, linkedin, facebook, newsletter_opt_in), plus sha256_first_name, sha256_last_name, sha256_email, sha256_phone_with_plus, sha256_phone_without_plus for Meta / Google Ads / Snapchat / TikTok. Name split at the first space. If the browser cannot hash, hashed fields are "" (user_id falls back to the email) and the event still fires. purchase adds `payment_status: "paid"`.
- purchase: `transaction_id` = ticket serial. Fires only for real website payments: skips admin tickets (`ADMIN_*` payment method), `ECD_SIMULATE`, 0 EGP, payments older than 24h, and repeats (localStorage). No TrafficMENA backend changes for tracking (user decision).
- Buyer PII appears only inside `user_data` on booking_complete and purchase (user decision, 30 Sep 2026, overrides the old "no PII" rule). In GTM, plain user_data fields go to CRM tags only, hashed fields to ad platforms, never plain PII to GA4. No other ECD event carries PII; no user-scoped fields (customer_type etc.) in global_variables.
- GTM built-in triggers (clicks, link clicks, scroll depth, element visibility) need the page in the regular DOM: never use Shadow DOM in site components (navbar.js moved off it on 30 Sep 2026; inside a shadow root GTM only sees the host element, with no Click URL or Click Text). navbar.js keeps its styles isolated by prefix: every class and id starts with `ecdnav-`, every rule is scoped under `site-navbar` (index.html still has an old `#menuToggle` / `#navMobile` / `.site-header` script, so never reuse those names).
- The site has no `<form>` elements (checkout and sponsor forms are validated and sent by JS), so GTM's Form Submission trigger never fires; track forms with checkout_step / booking_complete / generate_lead.
- The `access=` token in booking-confirmation URLs is hidden from GA4/pixels inside GTM only (Custom JS variable). Never strip or rewrite the page URL in site code (user decision, critical).

## Caching (important)
- Shared scripts (navbar.js, footer.js, tickets-section.js, prices.js, ecd-api.js, ecd-content.js, ecd-analytics.js) are loaded with a version tag, e.g. `navbar.js?v=20260924a`. Whenever one of them changes, bump the tag on EVERY page, or browsers keep showing the old version.

## API environment (critical, broke live checkout on 28 Sep 2026)
- `ecd-api.js` picks API_BASE from the page host (`resolveApiBase()`): www → production API, staging.trafficmena.com → staging API, localhost → localhost:8080. Never hardcode one environment or commit a "switch to staging" edit: the backend rejects other origins (ECD_ORIGIN_DENIED), prices fall back to "[Final Price] EGP" and checkout fails with "Ticket price unavailable".
- A frontend feature that needs a new backend endpoint must not go live before that endpoint is deployed to the production backend.

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
- Component sheet → legacy-backup/component-sheet.html (archived with the other unused legacy files; nothing on the live site links to legacy-backup/)

## Breadcrumbs (Google breadcrumb guidelines)
- Every page except Home shows `<ecd-breadcrumb>` (breadcrumbs.js) right under the navbar, starting with "ECommerce Day": Agenda / Speakers / Tickets / Sponsors & Partners / Sponsors & Partners › Become a Sponsor / FAQ / Policies (visible shows the selected policy) / Tickets › Booking confirmation. Checkout renders its own step-aware trail.
- Public pages carry matching `BreadcrumbList` JSON-LD in <head> (absolute https://www.trafficmena.com/ecommerce-day/ URLs, last item without "item"). Keep the visible trail and the JSON-LD in sync when renaming pages.
- Checkout and Booking Confirmation are `noindex, nofollow` (private steps; confirmation URLs carry access codes) and have no breadcrumb schema.

## Global nav & footer (identical all pages)
- Nav: Home · Agenda · Speakers · Sponsors · Tickets · "TrafficMENA ↗" (desktop) / "TrafficMENA Platform ↗" (menu), linking to https://www.trafficmena.com/ in the same tab (the logo goes to the ECommerce Day home). FAQ link currently HIDDEN in navbar.js and footer.js, commented out, until the FAQ page content is updated. Right: "Become a Sponsor" (ghost) + "Get Your Ticket" (primary). Experience and Outcomes were removed from the nav on 30 Sep 2026 (too crowded); they stay in the footer / on the Home page. Below 992px: hamburger button with icon + "Menu" label.
- Section links (e.g. footer index.html#experience) are kept aligned by navbar.js while JS content loads; sections scroll to just under the sticky header (`--ecd-nav-h`). Policy links use policy.html#terms / #privacy / #refund / #ticket.

## Checkout (checkout.html)
- Two steps: 1 "Your details" (all fields: country, job title, name, email, mobile, company, store, LinkedIn/Facebook) → 2 "Payment". No accessibility needs field. Phones/tablets (≤1024px) get a sticky bottom bar: "Continue to payment →" on step 1, "Pay [total] EGP" on step 2 (hidden while a Fawry/wallet code is shown).
- Mobile number: the dropdown holds the code, the field the national number. Accept 1002754217, 01002754217, +201002754217, 00201002754217 and Arabic digits; always save one clean number (+201002754217, never +2001...). Per-country checks: +20 1[0125]+8 digits, +966/+971 5+8, +965 [4569]+7, +974 [3567]+7, +962 7[789]+7. Invalid numbers block Continue with a clear message. Website check only (the backend does not re-validate, user decision).
- Links (checkout step 1, user decision 30 Sep 2026): Store is required for everyone and must be the store's own website (social/link-in-bio sites refused, "none" refused). LinkedIn must be a personal profile (linkedin.com/in/...). Facebook must be a personal profile (facebook.com/name, profile.php?id=, /people/, app /share/ links; groups, pages paths, posts refused). One of LinkedIn/Facebook is still enough. https:// and www are optional when typing; the full https:// link is saved and shown after the field is left.
- No back links on checkout (user decision 30 Sep 2026): the breadcrumb at the top does that job ("ECommerce Day › Tickets › Your details", then "… › Your details › Payment" where "Your details" goes back). Phones keep "← Back" in the sticky bar, and the phone/browser Back button returns Payment → Your details (a same-URL history entry is pushed on entering Payment).
- A booking session is used for ONE Pay attempt (`state.sessionUsed`): any later Pay creates a fresh booking, except "Request new code", which keeps the same booking on purpose. Reusing a booking after a payment attempt makes the server answer "pending" with no code (this was the "error unless the newsletter is ticked" bug).
- Become a Sponsor mobile number (30 Sep 2026): same solution as checkout (code dropdown + national number, same per-country rules and accepted formats, saved as one clean +201002754217). The code starts on the step 1 country until changed by hand. Code "Other" (default for step 1 country "Other") takes the full international number starting with + or 00 (a number of one of the six listed countries must still pass that country's rule); saved as +<digits>. Checkout still has only the six codes.
- Footer: Navigation · Support (Contact, FAQ) · Social · Legal (Terms, Privacy, Refund & Cancellation, Ticket & Entry) · Sponsor Enquiries. TrafficMENA lockup + "© TrafficMENA 2026".
