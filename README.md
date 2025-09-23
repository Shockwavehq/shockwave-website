README ShockwaveHQ Website Repository Impact on Contact — Premium AI Automation Agency Purpose: Production-ready frontend assets for ShockwaveHQ’s AI automation site. Engine-driven (manifest), GoHighLevel-compatible, fast to iterate, and easy to debug.

Important compliance note

Any numeric claims (e.g., “≤60s response”, “200–500% ROI”) must be verified before public use. In code/copy, mark unverified claims with [VERIFY] or use neutral phrasing. Do not publish unverified numbers on the live site.
Repository architecture

CDN base (jsDelivr)
https://cdn.jsdelivr.net/gh/shockwavehq/shockwave-website@main
Engine + Plugins
shockwave-engine.js — Section loader (reads sections/manifest.json, lazy-loads sections CSS/JS, normalizes analytics)
shockwave-live.js — “Alive counters” plugin (optional, activity-style metrics)
shockwave-live.css — Global tokens/utilities/buttons/fadeUp + counter styles
Sections (one CSS/JS per section)
sections/manifest.json — Module registry (selectors, files, events)
sections/hero.css, sections/hero.js
sections/roi.css, sections/roi.js
sections/demo.css, sections/demo.js
sections/problem.css, sections/problem.js
sections/solutions.css, sections/solutions.js
sections/verticals.css, sections/verticals.js
sections/value.css, sections/value.js
sections/process.css, sections/process.js
sections/testimonials.css, sections/testimonials.js
sections/pricing.css, sections/pricing.js
sections/integrations.css, sections/integrations.js
sections/faq.css, sections/faq.js
sections/final-cta.css, sections/final-cta.js
Docs (developer references)
docs/INDEX.md — File roles, selectors, events, load order
docs/INTEGRATION.md — GHL snippets and setup
docs/SECTIONS.md — Per-section hooks and events
Legacy/sandbox
legacy/shockwave-styles.legacy.css (archived; not used in prod)
sandbox/test.html (local dev sandbox)
GoHighLevel integration (copy-paste) Head (global)

Keep head lean to prevent FOUC. Load global tokens and above-the-fold section styles (hero).
Copy<!-- HEAD (Global styles) -->
<link rel="preconnect" href="https://cdn.jsdelivr.net">

<!-- Global tokens + buttons + fadeUp + counters -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/shockwavehq/shockwave-website@main/shockwave-live.css?v=20250923">

<!-- Critical above-the-fold section styles (Hero) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/shockwavehq/shockwave-website@main/sections/hero.css?v=20250923">

<!-- Optional: Preload LCP hero image -->
<link rel="preload" as="image"
      href="https://cdn.jsdelivr.net/gh/shockwavehq/shockwave-website@main/assets/hero/hero-mock-desktop.webp"
      imagesrcset="https://cdn.jsdelivr.net/gh/shockwavehq/shockwave-website@main/assets/hero/hero-mock-mobile.webp 560w, https://cdn.jsdelivr.net/gh/shockwavehq/shockwave-website@main/assets/hero/hero-mock-desktop.webp 720w"
      imagesizes="(max-width: 768px) 92vw, 560px"
      fetchpriority="high">
Footer (global)

Order matters: set manifest path → engine → your global UI → live counters.
Copy<!-- FOOTER (Scripts; order matters) -->
<script>
  window.SW_MANIFEST_PATH = "https://cdn.jsdelivr.net/gh/shockwavehq/shockwave-website@main/sections/manifest.json?v=20250923";
</script>

<!-- Engine: loads per-section CSS/JS from manifest -->
<script defer src="https://cdn.jsdelivr.net/gh/shockwavehq/shockwave-website@main/shockwave-engine.js?v=20250923"></script>

<!-- Your global UI (calendar modal, sticky CTA, smooth scroll) -->
<script defer src="https://cdn.jsdelivr.net/gh/shockwavehq/shockwave-website@main/shockwave-functions.js?v=20250923"></script>

<!-- Alive counters plugin (optional; toggle via <body data-live="off">) -->
<script defer src="https://cdn.jsdelivr.net/gh/shockwavehq/shockwave-website@main/shockwave-live.js?v=20250923"></script>
Do not include in production

shockwave-styles.css (legacy). Move to /legacy and stop loading to avoid collisions.
Direct section JS in footer (hero.js, roi.js, etc.). The engine loads them via manifest.
Manifest (sections/manifest.json)

The engine reads this file to know which sections to load, when, and with which assets.
Copy{
  "name": "shockwavehq-site",
  "version": "1.1.0",
  "cdn_base": "https://cdn.jsdelivr.net/gh/shockwavehq/shockwave-website@main",
  "engine": { "css": "/shockwave-live.css", "js": "/shockwave-engine.js" },
  "brand_tokens": {
    "colors": { "primary": "#D12E1F", "primary_hover": "#B8271B", "text": "#000000", "muted": "#4A4A4A", "bg": "#FFFFFF", "divider": "#E7E7E7" },
    "fonts": { "head": "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
               "body": "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }
  },
  "sections": [
    { "id": "hero", "css": "/sections/hero.css", "js": "/sections/hero.js", "selector": "#hero", "events": ["hero_seen", "hero_primary_cta_click", "hero_secondary_cta_click"], "defer": false },
    { "id": "roi-calculator", "css": "/sections/roi.css", "js": "/sections/roi.js", "selector": "#roi-calculator", "events": ["roi_submit", "roi_result_view", "roi_email_submit", "roi_book_demo_click"], "defer": true }
  ],
  "motion": { "default": "fadeUp", "observer": { "rootMargin": "0px 0px -10% 0px", "threshold": 0.2, "once": true } },
  "flags": { "respect_reduced_motion": true, "defer_non_critical": true, "no_third_party_in_hero": true }
}
Example section markup (Hero)

Place this Custom HTML block at the top of your homepage.
Copy<section id="hero" class="section" role="region" aria-label="Hero">
  <div class="container">
    <div class="grid">
      <div class="copy fade-up" style="transition-delay: 50ms;">
        <p class="kicker">Impact on Contact™</p>
        <h1 class="title" aria-describedby="hero-subhead">Answer first. Book fast.</h1>
        <p id="hero-subhead" class="subhead">
          Done‑for‑you AI automations that reply across phone, web, and DMs—recovering missed revenue and booking more appointments.
          Integrated with your stack and deployed fast.
        </p>
        <div class="cta-row fade-up" style="transition-delay: 220ms;">
          <button class="btn btn-primary" data-cta="primary" data-action="open_calendar" aria-label="Open calendar to book a strategy call">Book 20‑min Strategy Call</button>
          <button class="btn btn-outline" data-cta="secondary" data-sw-scroll-to="#roi-calculator" aria-label="Scroll to ROI calculator">Get Free AI ROI Forecast</button>
        </div>
        <ul class="chips fade-up" style="transition-delay: 300ms;" role="list">
          <li class="chip" data-verify="≤60s first response">Fast first response</li>
          <li class="chip" data-verify="95%+ lead capture">High lead capture workflows</li>
          <li class="chip" data-verify="48‑hour pilot">48‑hour pilot available</li>
        </ul>
        <div class="trust fade-up" style="transition-delay: 360ms;">
          <div class="line">Trusted by leaders in Dental, HVAC, Legal, Med Spa, Plumbing, and Pest Control</div>
          <div class="logos">
            <img src="/assets/logos/n8n.svg" alt="n8n" width="72" height="24" data-evt="trust_logo">
            <img src="/assets/logos/twilio.svg" alt="Twilio" width="72" height="24" data-evt="trust_logo">
            <img src="/assets/logos/stripe.svg" alt="Stripe" width="72" height="24" data-evt="trust_logo">
            <img src="/assets/logos/google-calendar.svg" alt="Google Calendar" width="72" height="24" data-evt="trust_logo">
          </div>
        </div>
      </div>
      <div class="visual fade-up" style="transition-delay: 200ms;">
        <picture>
          <source srcset="/assets/hero/hero-mock-mobile.webp" media="(max-width: 768px)">
          <img class="image" src="/assets/hero/hero-mock-desktop.webp" alt="AI lead response automation preview" width="720" height="560" loading="eager" fetchpriority="high" sizes="(max-width: 768px) 92vw, 560px">
        </picture>
      </div>
    </div>
  </div>
</section>
Analytics events (dataLayer)

Emitted by modules/engine for GTM/GA4. Primary key: event.
Events

hero_seen
hero_primary_cta_click
hero_secondary_cta_click
hero_trust_logo_click
roi_submit
roi_result_view
roi_book_demo_click
sticky_cta_shown
calendar_opened
Alive counters plugin (optional)

File: shockwave-live.js; Styles: shockwave-live.css
Toggle globally:
Enable: default
Disable: or add ?live=off to the URL
Usage (examples):
Copy<!-- Open slots this month -->
<span class="sw-live-counter" data-sw-metric="spots_remaining" data-format="int"></span>

<!-- Calculator runs today -->
<span class="sw-live-counter" data-sw-metric="calculator_users" data-format="int"></span>

<!-- Average opportunity value -->
<span class="sw-live-counter" data-sw-metric="avg_opportunity" data-format="currency"></span>
Personalization (URL params)

Vertical-specific headline + subhead appends: ?vertical=dental|hvac|legal|plumbing|med-spa|pest-control
Source-based CTA label tweaks: ?source=googleads|linkedin|retargeting
Performance & accessibility budgets

Core Web Vitals targets: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1
Hero LCP image: WebP ≤ 180KB; preload with fetchpriority="high"
Motion: transform/opacity only; respect prefers-reduced-motion
Touch: 44px minimum targets; adequate spacing; no hover-only actions on mobile
Versioning & cache busting

Use query param versioning in GHL includes (e.g., ?v=20250923)
For locked versions, you can pin to a commit instead of @main:
https://cdn.jsdelivr.net/gh/shockwavehq/shockwave-website@/sections/hero.css
jsDelivr caches aggressively. If updates aren’t showing, bump ?v= or use a new commit hash.
Local dev (sandbox)

Use sandbox/test.html to test sections outside GHL.
Include:
shockwave-live.css
set window.SW_MANIFEST_PATH to /sections/manifest.json
shockwave-engine.js, shockwave-live.js
Place section markup (#hero, #roi-calculator) in body
Troubleshooting

Section not styling (FOUC)
Ensure the section’s CSS (e.g., sections/hero.css) is included in HEAD if it’s above-the-fold.
Section JS not running
Verify SW_MANIFEST_PATH is set and accessible (open the URL in a new tab).
Confirm selector matches markup (e.g., #hero).
Calendar not opening
Ensure a [data-sw-open="calendar"] element exists (from shockwave-functions.js modal implementation).
Primary CTA uses data-action="open_calendar" which aliases to the modal opener.
Counters not moving
Check ; remove to enable. Also ensure shockwave-live.js is included.
Original files (status)

README.md — You’re reading it (quickstart + references).
shockwave-styles.css — Archived; do not include in production (moved to /legacy).
test.html — Moved to /sandbox/test.html (dev only).
shockwave-functions.js — Keep; contains modal, sticky CTA, and smooth scroll. Load after engine.
Contributing

Branch from main; PRs with clear commit messages.
Keep sections self-contained: no cross-section CSS/JS leaks.
All new sections must be registered in sections/manifest.json and scoped to their selector.
License

Internal use for ShockwaveHQ properties and client work. Do not redistribute.
Contact

Maintainer: ShockwaveHQ (Vin + Spark)
Issues: Open a GitHub Issue on this repo with a descriptive title and steps to reproduce.
Done. This README reflects the engine architecture, GHL wiring, performance/accessibility standards, analytics, and optional counters. It’s the single source of truth for implementation and rapid iteration.
