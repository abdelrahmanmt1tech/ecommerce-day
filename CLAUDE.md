# ECommerce Day 2026 — Global Design Rules (PROMPT 0)

Designing website UX for "ECommerce Day 2026" — one-day offline event, Cairo, 22 Oct 2026, by TrafficMENA. Desktop 1440px + mobile 390px per screen. Production-ready UI, no lorem ipsum, no fake data.

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

## Layout & components
- Max width 1280px, 8pt grid. Cards: white, 1px #D5DAE0, 12–16px radius, shadow on hover only.
- Buttons: Primary #05EF62 fill + #101010 text, 10px radius, 600. Secondary/ghost: #101010 1px outline on white. Dark band CTA: #101010 bg with green primary button inside.
- Section header anatomy: mono kicker with 24px green rule → H2 → optional lede (max 60ch).
- Sticky translucent nav (white 85% + blur, 1px bottom #E6EAEE). Mobile: hamburger + persistent bottom "Book Your Ticket" bar.
- Tracks (label ALWAYS with color): The Control Tower ink #101010 (main stage) · CLICKED green #05EF62 · CONFIRMED blue #006681 · DELIVERED amber #FFB020.
- Status pills (text + color): Confirmed / Coming Soon / Almost Full / Fully Booked / Waitlist / Recorded / Templates Included / Full Journey Only / All Tickets.
- A11y: visible labels (no placeholder-as-label), 4.5:1 contrast, focus rings, real buttons, keyboard-navigable filters/accordions.

## Event facts
- ECommerce Day 2026, TrafficMENA, 22 Oct 2026, Cairo. One offline day: Main Stage "The Control Tower" + 3 workshop tracks (CLICKED, CONFIRMED, DELIVERED).
- Story: "Every order goes through three states: CLICKED → CONFIRMED → DELIVERED. The Control Tower sees the whole order."
- Promises: Control Tower = See the whole order and lead the system · CLICKED = Build the Acquisition Machine · CONFIRMED = Turn Visits into Orders · DELIVERED = Keep the Promise and the Margin.
- Capacities (label as draft/subject to venue): Control Tower 500 · CLICKED 80 · CONFIRMED 200 · DELIVERED 100.
- Contact: info@trafficmena.com · 01118111793 · trafficmena.com.

## HARD RULES (never violate)
1. Exactly two tickets: "Control Tower Pass" and "Full Journey Pass". No Group/VIP/third product, no group discount.
2. No Certificate anywhere.
3. All recordings AND Workshop Templates & Files included in BOTH tickets.
4. Platform access: 3 months (CT) vs 1 year (FJ). Platform = Content Hub only — no Speaker Directory, no messaging, no networking tool.
5. Workshops offline-only for Full Journey, require pre-reservation after payment, capacity-limited; pass does NOT auto-reserve.
6. ONE final price per ticket (EGP). No range, no strikethrough unless real dated offer. Unapproved price → token "[Final Price] EGP".
7. Venue unconfirmed → exact placeholder "Venue details will be announced soon." Never invent a venue.
8. No sponsorship prices anywhere.
9. No fake urgency: no countdowns, no "X seats left" unless live capacity data. No pre-checked consent boxes.
10. Speakers: only confirmed names. Unannounced → single block "More speakers will be announced soon" — no silhouettes/dummy cards.
11. Session times: "Slot 1 / Slot 2 / Slot 3" or approved Main Stage grid; never working times as final.
12. Unresolved items show "Coming Soon" / "Announced soon" — never hidden or guessed.

## Approved ticket comparison (verbatim wherever comparison appears)
Feature | Control Tower Pass | Full Journey Pass
Access to The Control Tower | Yes | Yes
Access to Workshop Tracks | No | Yes
Workshop seat reservation | No | Yes
Exercises & Live Builds | No | Yes
All session recordings | Yes | Yes
Workshop Templates & Files | Yes | Yes
Platform access duration | 3 months | 1 year
Session Summaries | Basic | Full
ECommerce Action Pack | Basic | Full
ECommerce Report | Summary | Full report
Taglines: CT = "See the whole system." · FJ = "Learn it. Work on it. Apply it." FJ badge allowed: "Most Complete Experience" (never "Best Value").

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
- /terms/ /privacy/ /refund-policy/ /ticket-policy/ /recording-policy/ (one template) → Policy Pages.dc.html
- Component sheet → Component Sheet.dc.html

## Global nav & footer (identical all pages)
- Nav: Agenda · Speakers · Tickets · Sponsors · FAQ. Right: "Become a Sponsor" (ghost) + "Book Your Ticket" (primary).
- Footer: Navigation · Support (Contact, FAQ) · Social · Legal (Terms, Privacy, Refund & Cancellation, Ticket & Entry, Recording & Photography) · Sponsor Enquiries. TrafficMENA lockup + "© TrafficMENA 2026".
