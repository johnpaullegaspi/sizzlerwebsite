# Sizzlers Website

A static site for Sizzlers steakhouse, built so restaurant staff can update photos, menu items,
prices, hours, and text themselves through a login screen — no code required.

## How it works

- All editable content lives in `/data/*.json` (site settings, menu, testimonials, gallery, services).
- `build.js` is a small, dependency-free Node script that reads those JSON files and generates
  `dist/index.html` and `dist/menu.html`, copying over `css/`, `js/`, `img/`, `admin/`, and `menu.pdf`.
- `/admin` is [Decap CMS](https://decapcms.org) — a free, open-source visual editor. When deployed
  on Netlify with Identity + Git Gateway enabled, staff log in at `yoursite.com/admin`, edit content
  through form fields (not code), and hit "Publish." That commits the updated JSON back to this repo,
  which triggers Netlify to rebuild and redeploy the site automatically — usually live within a minute.

## Local development

No install step needed — the build script has zero dependencies.

```bash
node build.js          # generates ./dist
npx http-server dist   # preview locally (requires internet access for this one command)
```

## Deploying (one-time setup)

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In Netlify: "Add new site" → "Import an existing project" → pick this repo.
   Netlify will auto-detect `netlify.toml` (build command `node build.js`, publish dir `dist`).
3. In the Netlify site dashboard: **Site configuration → Identity → Enable Identity**.
   Under Identity settings, set registration to **Invite only** (recommended) so random people
   can't sign up as editors.
4. **Identity → Services → Git Gateway → Enable Git Gateway.** This is what lets the admin panel
   commit changes back to the repo without each staff member needing their own GitHub account.
5. **Identity → Invite users** — invite yourself and any staff who should be able to edit the site.
   They'll get an email to set a password.
6. Visit `https://yoursite.netlify.app/admin/`, log in, and start editing.

## What staff can edit from `/admin`

- **Site Settings** — hero photo/text, "Our Story" section, reservation banner, contact info, hours,
  social links, the downloadable menu PDF.
- **Menu** — the 6 homepage signature dishes, and the full categorized menu on the Menu page.
- **Guest Reviews** — testimonial quotes, names, and photos.
- **Gallery** — the auto-playing photo strip.
- **Services** — the private dining / catering / brunch cards.

Every field has a plain-English label, and photos use a drag-and-drop image picker — no file paths
or code involved. There's an editorial workflow enabled by default (Draft → Review → Publish) so
changes can be reviewed before they go live; this can be turned off in `admin/config.yml` by removing
the `publish_mode: editorial_workflow` line if instant publishing is preferred.

## Notes

- Current photography is curated, freely-licensed stock (Unsplash), used as placeholders until real
  Sizzlers photography is available. Staff can already replace any of them from the CMS.
- Address, phone, and the Google Maps pin are placeholders (Makati, Metro Manila) — update these from
  **Site Settings → Visit / Contact Info** as soon as the real details are available.
- The reservation form on the homepage shows a confirmation message but does not yet send email —
  it needs a form backend (e.g. Netlify Forms) wired up to actually deliver submissions.
