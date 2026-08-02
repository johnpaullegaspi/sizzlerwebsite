#!/usr/bin/env node
/**
 * Sizzlers static site builder — plain Node, zero dependencies.
 * Reads JSON content from /data (the files Decap CMS edits) and
 * renders index.html + menu.html into /dist, alongside passthrough
 * copies of css/, js/, img/, admin/, and menu.pdf.
 *
 * Run: node build.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");

function readJSON(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "data", `${name}.json`), "utf8"));
}

const site = readJSON("site");
const menu = readJSON("menu");
const testimonials = readJSON("testimonials").testimonials;
const gallery = readJSON("gallery").gallery;
const services = readJSON("services").services;

// ---------------------------------------------------------------
// helpers
// ---------------------------------------------------------------
const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const nl2br = (s = "") => esc(s).replace(/\n/g, "<br>");

const ICONS = {
  "private-dining": `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 21v-7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v7"/><path d="M9 10V5a3 3 0 0 1 6 0v5"/><path d="M2 21h20"/></svg>`,
  catering: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7h18l-1.5 12.5a2 2 0 0 1-2 1.5H6.5a2 2 0 0 1-2-1.5L3 7Z"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/></svg>`,
  brunch: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>`,
};

function nav(active) {
  return `
<header class="site-nav${active === "menu" ? " scrolled" : ""}" id="site-nav">
  <div class="container">
    <a href="/" class="logo" aria-label="Sizzlers home">Sizzler<span class="flame">s</span></a>
    <button type="button" class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-drawer">
      <span class="nav-toggle-bars" aria-hidden="true"><span></span><span></span><span></span></span>
    </button>
    <nav class="nav-links" aria-label="Primary">
      <a href="/#menu">Menu</a>
      <a href="/#story">Our Story</a>
      <a href="/#gallery">Gallery</a>
      <a href="/#services">Private Dining</a>
      <a href="/#visit">Contact</a>
      <a href="/#reserve" class="btn btn-gold">Reserve</a>
    </nav>
  </div>
</header>
<div class="nav-backdrop" id="nav-backdrop"></div>
<div class="mobile-drawer" id="mobile-drawer" aria-hidden="true">
  <div class="mobile-drawer-head">
    <a href="/" class="logo" aria-label="Sizzlers home">Sizzler<span class="flame">s</span></a>
    <button type="button" class="drawer-close" id="drawer-close" aria-label="Close menu">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>
    </button>
  </div>
  <nav class="drawer-links" aria-label="Mobile">
    <a href="/#menu">Menu</a>
    <a href="/#story">Our Story</a>
    <a href="/#gallery">Gallery</a>
    <a href="/#services">Private Dining</a>
    <a href="/#visit">Contact</a>
    <a href="/#reserve" class="btn btn-gold">Reserve a Table</a>
  </nav>
  <div class="drawer-footer">
    <a href="tel:${esc(site.visit.phone_link)}" class="drawer-phone">${esc(site.visit.phone_display)}</a>
    <div class="social-icons">
      <a href="${esc(site.social.instagram)}" target="_blank" rel="noopener" aria-label="Sizzlers on Instagram">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
      </a>
      <a href="${esc(site.social.facebook)}" target="_blank" rel="noopener" aria-label="Sizzlers on Facebook">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 4h-2a4 4 0 0 0-4 4v3H7v4h2v6h4v-6h2.5l.5-4H13V8a1 1 0 0 1 1-1h2V4Z"/></svg>
      </a>
      <a href="${esc(site.social.tiktok)}" target="_blank" rel="noopener" aria-label="Sizzlers on TikTok">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 4v9.5a3.5 3.5 0 1 1-3-3.46"/><path d="M14 4c.5 2.5 2.2 4 5 4"/></svg>
      </a>
    </div>
  </div>
</div>`;
}

function footer() {
  return `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-logo">Sizzler<span style="color:var(--sizzle-red);">s</span></div>
        <p class="footer-tagline">${esc(site.brand.tagline)}.</p>
        <div class="social-icons">
          <a href="${esc(site.social.instagram)}" target="_blank" rel="noopener" aria-label="Sizzlers on Instagram">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
          </a>
          <a href="${esc(site.social.facebook)}" target="_blank" rel="noopener" aria-label="Sizzlers on Facebook">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 4h-2a4 4 0 0 0-4 4v3H7v4h2v6h4v-6h2.5l.5-4H13V8a1 1 0 0 1 1-1h2V4Z"/></svg>
          </a>
          <a href="${esc(site.social.tiktok)}" target="_blank" rel="noopener" aria-label="Sizzlers on TikTok">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 4v9.5a3.5 3.5 0 1 1-3-3.46"/><path d="M14 4c.5 2.5 2.2 4 5 4"/></svg>
          </a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="/menu.html">Menu</a></li>
          <li><a href="/#reserve">Reservations</a></li>
          <li><a href="/#services">Private Events</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Gift Cards</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Hours</h4>
        <ul>
          ${site.visit.hours.map((h) => `<li>${esc(h.label)}: ${esc(h.time)}</li>`).join("\n          ")}
        </ul>
      </div>
      <div class="footer-col">
        <h4>Sizzlers VIP List</h4>
        <p style="color:rgba(248,245,240,0.55);font-size:0.88rem;">Join the Sizzlers VIP list for exclusive offers.</p>
        <form class="newsletter-form" id="newsletter-form">
          <label for="nl-email" style="position:absolute;left:-9999px;">Email address</label>
          <input type="email" id="nl-email" name="email" placeholder="Your email" required>
          <button type="submit">Join</button>
        </form>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span class="current-year">2026</span> Sizzlers. All Rights Reserved.</span>
      <span><a href="mailto:${esc(site.visit.email)}">${esc(site.visit.email)}</a> · <a href="tel:${esc(site.visit.phone_link)}">${esc(site.visit.phone_display)}</a></span>
    </div>
  </div>
</footer>`;
}

// ---------------------------------------------------------------
// INDEX PAGE
// ---------------------------------------------------------------
function renderIndex() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: site.brand.name,
    image: site.hero.background_image,
    "@id": site.seo.site_url + "/",
    url: site.seo.site_url + "/",
    telephone: site.visit.phone_link,
    servesCuisine: ["American", "Steakhouse", "Contemporary"],
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.visit.address,
      addressCountry: "PH",
    },
    menu: site.seo.site_url + "/menu.html",
    acceptsReservations: "True",
    email: site.visit.email,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(site.seo.title)}</title>
<meta name="description" content="${esc(site.seo.description)}">
<link rel="canonical" href="${esc(site.seo.site_url)}/">
<meta property="og:type" content="restaurant.restaurant">
<meta property="og:title" content="${esc(site.seo.title)}">
<meta property="og:description" content="${esc(site.seo.description)}">
<meta property="og:image" content="${esc(site.hero.background_image)}">
<meta property="og:url" content="${esc(site.seo.site_url)}/">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Lato:wght@300;400;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
<a href="#main" class="skip-link">Skip to content</a>
${nav("home")}
<main id="main">

  <section class="hero" id="top">
    <div class="hero-bg" style="background-image:url('${esc(site.hero.background_image)}');" role="img" aria-label="${esc(site.hero.background_alt)}"></div>
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <p class="hero-eyebrow">${esc(site.hero.eyebrow)}</p>
      <h1>${esc(site.brand.name)}</h1>
      <p class="hero-sub">${esc(site.hero.subhead)}</p>
      <div class="hero-ctas">
        <a href="#reserve" class="btn btn-gold">${esc(site.hero.cta_reserve_label)}</a>
        <a href="#menu" class="btn btn-outline">${esc(site.hero.cta_menu_label)}</a>
      </div>
    </div>
    <div class="scroll-cue" aria-hidden="true"><span>Scroll</span><span class="line"></span></div>
  </section>

  <section class="section section-dark" id="story">
    <div class="container">
      <div class="story-grid">
        <div class="story-image reveal">
          <img src="${esc(site.story.image)}" alt="${esc(site.story.image_alt)}" loading="lazy" width="800" height="1000">
          <div class="story-badge">${nl2br(site.story.badge_text)}</div>
        </div>
        <div class="story-text reveal reveal-delay-2">
          <p class="section-label">${esc(site.story.label)}</p>
          <h2 class="section-heading">${esc(site.story.heading)}</h2>
          ${site.story.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("\n          ")}
          <a href="#story" class="btn btn-outline-gold" style="margin-top:0.5rem;">${esc(site.story.button_label)}</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section section-dark" id="menu">
    <div class="container">
      <div class="center" style="max-width:640px;">
        <p class="section-label">Signature Dishes</p>
        <h2 class="section-heading">Served Hot at Sizzlers</h2>
        <p class="section-sub center">A taste of what awaits — dry-aged steaks, handmade pasta, and craft cocktails, each dish built around fire and technique.</p>
      </div>
      <div class="menu-grid">
        ${menu.signature
          .map(
            (d, i) => `<article class="menu-card reveal reveal-delay-${(i % 3) + 1}">
          <div class="menu-card-img">
            <img src="${esc(d.image)}" alt="${esc(d.alt)}" loading="lazy" width="800" height="600">
          </div>
          <div class="menu-card-body">
            <div class="menu-card-top"><h3>${esc(d.name)}</h3><span class="menu-card-price">${esc(d.price)}</span></div>
            <p class="menu-card-desc">${esc(d.description)}</p>
          </div>
        </article>`
          )
          .join("\n        ")}
      </div>
      <div class="menu-cta reveal">
        <a href="/menu.html" class="btn btn-gold">See Full Sizzlers Menu</a>
        <a href="${esc(site.menu_pdf)}" class="btn btn-outline" download>Download Menu (PDF)</a>
      </div>
    </div>
  </section>

  <section class="section section-cream" id="services">
    <div class="container">
      <div class="center" style="max-width:640px;">
        <p class="section-label">Beyond the Table</p>
        <h2 class="section-heading">More Than Dinner</h2>
      </div>
      <div class="services-grid">
        ${services
          .map(
            (s, i) => `<div class="service-card reveal reveal-delay-${i + 1}">
          <div class="service-icon" aria-hidden="true">${ICONS[s.icon] || ICONS["private-dining"]}</div>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.description)}</p>
        </div>`
          )
          .join("\n        ")}
      </div>
      <div class="gallery-slider reveal" id="gallery" aria-label="Photo gallery of the Sizzlers dining room, bar, and dishes">
        <div class="gallery-track">
          ${gallery.map((g) => `<img src="${esc(g.image)}" alt="${esc(g.alt)}" loading="lazy">`).join("\n          ")}
          ${gallery.map((g) => `<img src="${esc(g.image)}" alt="" loading="lazy" aria-hidden="true">`).join("\n          ")}
        </div>
      </div>
    </div>
  </section>

  <section class="section section-dark">
    <div class="container">
      <div class="center" style="max-width:640px;">
        <p class="section-label">Testimonials</p>
        <h2 class="section-heading">What Guests Are Saying</h2>
      </div>
      <div class="testimonial-carousel reveal">
        ${testimonials
          .map(
            (t, i) => `<div class="testimonial-slide${i === 0 ? " active" : ""}">
          <p class="stars" aria-label="5 out of 5 stars">★★★★★</p>
          <p class="testimonial-quote">"${esc(t.quote)}"</p>
          <div class="testimonial-author">
            <img src="${esc(t.avatar)}" alt="Portrait of ${esc(t.name)}" loading="lazy">
            <div>
              <div class="testimonial-author-name">${esc(t.name)}</div>
              <div class="testimonial-author-loc">${esc(t.location)}</div>
            </div>
          </div>
        </div>`
          )
          .join("\n        ")}
        <div class="testimonial-dots" role="tablist" aria-label="Choose testimonial"></div>
      </div>
    </div>
  </section>

  <section class="section section-dark" id="visit">
    <div class="container">
      <div class="center" style="max-width:640px;">
        <p class="section-label">Visit Sizzlers</p>
        <h2 class="section-heading">Your Table Awaits</h2>
      </div>
      <div class="visit-grid">
        <div class="visit-map reveal">
          <iframe src="https://www.google.com/maps?q=${encodeURIComponent(site.visit.map_query)}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map showing the location of Sizzlers restaurant"></iframe>
        </div>
        <div class="visit-info reveal reveal-delay-2">
          <dl>
            <dt>Address</dt>
            <dd>${esc(site.visit.address)}</dd>
            <dt>Phone</dt>
            <dd><a href="tel:${esc(site.visit.phone_link)}">${esc(site.visit.phone_display)}</a></dd>
            <dt>Email</dt>
            <dd><a href="mailto:${esc(site.visit.email)}">${esc(site.visit.email)}</a></dd>
          </dl>
          <ul class="visit-hours">
            ${site.visit.hours.map((h) => `<li><span>${esc(h.label)}</span><span>${esc(h.time)}</span></li>`).join("\n            ")}
          </ul>
          <div class="visit-actions">
            <a href="https://www.google.com/maps?q=${encodeURIComponent(site.visit.map_query)}" class="btn btn-gold" target="_blank" rel="noopener">Get Directions</a>
            <a href="tel:${esc(site.visit.phone_link)}" class="btn btn-outline-gold">Call Sizzlers</a>
          </div>
        </div>
      </div>
      <div class="insta-strip reveal">
        <div class="insta-strip-head">
          <h3 style="margin:0;font-size:1.1rem;">Follow <a href="${esc(site.visit.instagram_url)}" target="_blank" rel="noopener" style="color:var(--gold);">${esc(site.visit.instagram_handle)}</a></h3>
          <a href="${esc(site.visit.instagram_url)}" target="_blank" rel="noopener" class="btn btn-outline-gold" style="padding:0.5rem 1.2rem;font-size:0.8rem;">View on Instagram</a>
        </div>
        <div class="insta-grid">
          ${gallery
            .concat(menu.signature.slice(0, 1))
            .slice(0, 6)
            .map(
              (g) =>
                `<a href="${esc(site.visit.instagram_url)}" target="_blank" rel="noopener" aria-label="View post on Instagram"><img src="${esc(g.image)}" alt="" loading="lazy"></a>`
            )
            .join("\n          ")}
        </div>
      </div>
    </div>
  </section>

  <section class="reserve-banner" style="background-image:url('${esc(site.reservation_banner.background_image)}');">
    <div class="container">
      <h2 class="reveal">${esc(site.reservation_banner.heading)}</h2>
      <p class="reveal reveal-delay-1">${esc(site.reservation_banner.subtext)}</p>
      <a href="#reserve" class="btn btn-gold reveal reveal-delay-2" style="padding:1.1rem 2.6rem;font-size:1.05rem;">${esc(site.reservation_banner.button_label)}</a>
    </div>
  </section>

  <section class="section reserve-form-section" id="reserve">
    <div class="container">
      <div class="reserve-form-wrap">
        <div class="reveal">
          <p class="section-label">Reservations</p>
          <h2 class="section-heading">Book Your Table</h2>
          <p style="color:rgba(26,26,26,0.65);">${esc(site.reservation.note)}</p>
          <a href="${esc(site.reservation.opentable_url)}" target="_blank" rel="noopener" class="btn btn-gold" style="margin-top:0.5rem;">Reserve via OpenTable</a>
          <p class="form-note" style="margin-top:1.5rem;">Or send a request below and our team will confirm within a few hours by phone or email.</p>
        </div>
        <form class="reserve-form reveal reveal-delay-2" id="reserve-form">
          <div class="form-row">
            <div class="form-field"><label for="rf-name">Full Name</label><input type="text" id="rf-name" name="name" required></div>
            <div class="form-field"><label for="rf-phone">Phone</label><input type="tel" id="rf-phone" name="phone" required></div>
          </div>
          <div class="form-row">
            <div class="form-field"><label for="rf-date">Date</label><input type="date" id="rf-date" name="date" required></div>
            <div class="form-field"><label for="rf-time">Time</label><input type="time" id="rf-time" name="time" required></div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label for="rf-guests">Guests</label>
              <select id="rf-guests" name="guests">
                <option>1</option><option>2</option><option selected>2–4</option><option>5–8</option><option>9+ (Private Dining)</option>
              </select>
            </div>
            <div class="form-field"><label for="rf-email">Email</label><input type="email" id="rf-email" name="email" required></div>
          </div>
          <div class="form-field"><label for="rf-notes">Special Requests</label><textarea id="rf-notes" name="notes" rows="3" placeholder="Allergies, celebrations, seating preference…"></textarea></div>
          <button type="submit" class="btn btn-gold btn-block">Request Reservation</button>
          <p class="form-note">Sends to ${esc(site.visit.email)} — we'll confirm shortly.</p>
          <p class="form-success" id="reserve-form-success" role="status"></p>
        </form>
      </div>
    </div>
  </section>

</main>
${footer()}
<script src="/js/main.js"></script>
<!-- Netlify Identity: required so invite/login emails redirect back into /admin -->
<script defer src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
<script>
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", (user) => {
      if (!user) {
        window.netlifyIdentity.on("login", () => {
          document.location.href = "/admin/";
        });
      }
    });
  }
</script>
</body>
</html>
`;
}

// ---------------------------------------------------------------
// MENU PAGE
// ---------------------------------------------------------------
function renderMenu() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Full Menu | ${esc(site.brand.name)} Steakhouse Manila</title>
<meta name="description" content="Explore the full ${esc(site.brand.name)} menu — starters, dry-aged steaks, handmade pasta, gourmet burgers, seafood, sides, desserts, and craft cocktails.">
<link rel="canonical" href="${esc(site.seo.site_url)}/menu.html">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Lato:wght@300;400;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
</head>
<body>
<a href="#main" class="skip-link">Skip to content</a>
${nav("menu")}
<main id="main">
  <section class="page-hero">
    <div class="container">
      <p class="section-label">The Full Menu</p>
      <h1 class="section-heading">Served Hot at ${esc(site.brand.name)}</h1>
      <p class="section-sub center">Dry-aged steaks, handmade pasta, and gourmet classics — crafted with fire and technique.</p>
      <a href="${esc(site.menu_pdf)}" class="btn btn-outline-gold" download style="margin-top:1.5rem;">Download PDF Menu</a>
    </div>
  </section>
  <section class="section section-dark menu-page-section">
    <div class="container" style="max-width:900px;">
      ${menu.categories
        .map(
          (cat) => `<h3 class="menu-category">${esc(cat.name)}</h3>
      ${cat.items
        .map(
          (it) => `<div class="menu-list-item"><div><h4>${esc(it.name)}</h4><p>${esc(it.description)}</p></div><span class="menu-list-price">${esc(it.price)}</span></div>`
        )
        .join("\n      ")}`
        )
        .join("\n      ")}
      <div class="text-center mt-lg">
        <a href="/#reserve" class="btn btn-gold">Reserve a Table</a>
      </div>
    </div>
  </section>
</main>
<footer class="site-footer">
  <div class="container">
    <div class="footer-bottom" style="border:none;padding-top:0;">
      <span>© <span class="current-year">2026</span> Sizzlers. All Rights Reserved.</span>
      <span><a href="/">Back to Home</a></span>
    </div>
  </div>
</footer>
<script src="/js/main.js"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------
// Copy helpers + build
// ---------------------------------------------------------------
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function build() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  fs.writeFileSync(path.join(DIST, "index.html"), renderIndex());
  fs.writeFileSync(path.join(DIST, "menu.html"), renderMenu());

  copyDir(path.join(ROOT, "css"), path.join(DIST, "css"));
  copyDir(path.join(ROOT, "js"), path.join(DIST, "js"));
  copyDir(path.join(ROOT, "img"), path.join(DIST, "img"));
  copyDir(path.join(ROOT, "admin"), path.join(DIST, "admin"));
  const pdfSrc = path.join(ROOT, "menu.pdf");
  if (fs.existsSync(pdfSrc)) fs.copyFileSync(pdfSrc, path.join(DIST, "menu.pdf"));

  console.log("Build complete -> dist/");
}

build();
