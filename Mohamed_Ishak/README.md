# Mohamed Ishak H — Business Analytics Portfolio

A production-ready static portfolio site. No build step, no dependencies, no framework —
open `index.html` and it runs.

```
index.html                 all markup and page content
robots.txt
assets/
  css/styles.css           design tokens, both themes, all components
  js/main.js               theme, nav, reveals, capability map, filters, form
  favicon.svg              MI monogram
  img/
    mohamed-ishak.jpg      hero portrait (900px, 100 KB)
    mohamed-ishak-sm.jpg   phone portrait (520px, 37 KB)
    og-cover.jpg           1200x630 link-preview card
  resume/
    Mohamed_Ishak_H_Resume.docx       "Download Resume" target
    Mohamed_Ishak_H_Academic_CV.docx  "Academic CV" target
.claude/                   local preview server (not part of the site)
```

## Preview locally

```bash
node .claude/serve.js
```

Then open <http://localhost:5321>. Opening `index.html` directly as a file works too;
a server is only needed so the `.docx` downloads get the right content type.

## Deploy

Any static host — the whole site is files.

- **GitHub Pages** — push the folder to a repo, then Settings → Pages → deploy from
  branch `main`, folder `/root`.
- **Netlify / Vercel / Cloudflare Pages** — drag the folder onto the dashboard, or
  connect the repo. No build command, publish directory `.`.

### One thing to do after deploying

Open Graph images need absolute URLs. In `index.html`, change the two image tags to the
live domain:

```html
<meta property="og:image" content="https://yourdomain.com/assets/img/og-cover.jpg">
<meta name="twitter:image" content="https://yourdomain.com/assets/img/og-cover.jpg">
```

## Contact form

By default the form validates input and then opens the visitor's mail client with the
message pre-filled — that works on any static host with zero setup.

To receive messages directly in an inbox instead, create a free form endpoint
(Formspree, Getform, Basin) and paste the URL at the top of `assets/js/main.js`:

```js
var FORM_ENDPOINT = 'https://formspree.io/f/xxxxxxx';
```

The form then POSTs JSON `{name, email, subject, message}` and shows a success or
failure message in place.

## Editing content

All copy lives in `index.html` as plain HTML — no templating to learn.

- **Projects** — duplicate a `.card--work` block in `#workGrid`. Its `data-cat`
  attribute drives the filter buttons; add a new filter by copying a `.filter` button
  and matching the category name.
- **Capability map** — the node labels are in the SVG in `#skills`; the tools each node
  reveals are in the `HUB` object in `assets/js/main.js`, keyed by the node's `data-key`.
- **Colours** — every colour is a token in `:root` (dark) and `:root[data-theme="light"]`
  at the top of `styles.css`. Change a token, both themes stay consistent.
- **Timeline / research / certifications** — copy an existing `<li>` or `<article>`.

## Things deliberately left off the site

The site only shows facts that are verifiable from the two resumes:

- **No invented metrics.** The corporate resume states outcomes as `[X]%`, `[Y]+
  categories` and similar placeholders. Those are not published as achievements —
  the experience and project sections describe the work qualitatively instead. Once real
  figures exist they can be added to the bullets in `#experience` and to the
  `Outcome` row of the case study.
- **UGC NET and Ph.D. candidature are not shown.** The academic resume lists these with
  `[Month Year]` and `[University Name]` unfilled. Add them to `#certifications` once the
  status and dates are confirmed.
- **The statistical percentages** (SPSS 88%, Regression 85%, …) are labelled
  *self-assessed proficiency* on the page, not certified scores.
- **Hero chart is abstract** and tagged `Illustrative` — it carries no numeric claims.
- **No credential links** on the certification cards, since none were supplied. Wrap a
  card's `<h3>` in an `<a>` when a verification URL exists.

> The two `.docx` files in `assets/resume/` are the originals and still contain those
> `[X]%` placeholders. Fill them in before pointing recruiters at the download.

## Accessibility & behaviour notes

- Works without JavaScript: the `no-js` class on `<html>` keeps all content visible and
  expands every collapsed panel.
- Reveal animations use a scroll sweep rather than an IntersectionObserver, so a fast
  flick-scroll can never leave a section stuck invisible.
- `prefers-reduced-motion` disables all motion and shows the final state.
- Theme choice persists in `localStorage`, falls back to the OS preference, and is
  wrapped in try/catch for private-browsing mode.
- Single `<h1>`, semantic landmarks, skip link, visible focus rings, labelled form
  fields with inline error messages, and `Person` JSON-LD for search results.
