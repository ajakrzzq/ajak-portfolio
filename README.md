# ajak.Web — Portfolio Website Guide

This is your finished 5-page portfolio site. It's plain HTML, CSS and
JavaScript — no build tools, no installs. You can open it, edit it,
and publish it with nothing more than a text editor and a web browser.

---

## 1. What each file does

```
ajak-portfolio/
├── index.html          → Home page
├── about.html           → About page
├── services.html        → Services page
├── work.html             → My Work page (your portfolio — most important page)
├── contact.html          → Contact page
├── css/
│   └── style.css          → ALL styling for every page (colors, fonts, spacing, layout)
├── js/
│   └── script.js           → ALL interactivity (mobile menu, filters, lightbox, contact form)
├── images/
│   ├── brand/favicon.svg      → The small icon shown in the browser tab
│   └── projects/                → Your sample project screenshots, sorted by project
│       ├── restaurant/
│       ├── oilgas/
│       ├── furniture/
│       └── novae/
├── demos/                  → Demo/alternate project pages currently stored in the repository
│   └── madani/               → Standalone live-demo build of the Madani site
├── novae/                  → NOVAÉ live demo website (linked from its "Live Demo" button)
└── kingshallcafe/           → Existing project/demo directory (not currently linked from the main portfolio pages)
```

Every page (`index.html`, `about.html`, etc.) links to the *same*
`css/style.css` and `js/script.js` files. That means if you change a
color or button style once in `style.css`, it updates on **all five
pages automatically** — you never have to repeat a style change five
times.

---

## 2. Where your portfolio images live

All screenshots are in `images/projects/`, organized into one folder
per project:

- `images/projects/restaurant/` — Chicken Rice Syukran screenshots
- `images/projects/oilgas/` — Madani Sdn. Bhd. screenshots
- `images/projects/furniture/` — Royale Chesterfield screenshots
- `images/projects/novae/` — NOVAÉ screenshots. NOVAÉ also has its own
  standalone live-demo build in the `novae/` folder, linked from its
  "Live Demo" button on `work.html`.

Each image is referenced by filename inside `work.html` (and a couple
also appear on `index.html` in the "Featured Work" cards). To swap a
picture, replace the file in the folder **using the exact same
filename**, and it'll update wherever it's used. If you use a
different filename, search `work.html` and `index.html` for the old
filename and update the `src="..."` path.

---

## 3. How to add another portfolio project

Open `work.html` and:

1. **Add a filter button** (near the top of the page) next to the
   existing ones, e.g.:
   ```html
   <button class="filter-btn" data-filter="landing-page" aria-pressed="false">Landing Page</button>
   ```
2. **Find the existing project section/article structure.** Each
   project is a labelled HTML comment followed by an `<article
   class="work-project" ...>` block — for example, search for
   `<!-- CHICKEN RICE SYUKRAN -->` to find the Restaurant project.
3. **Copy the block that most closely matches your new project**
   (a `work-project` block, or the flagship `work-feature` block used
   by Madani if you want its fuller Project Summary + gallery layout)
   and paste your copy right before the `<!-- FINAL CTA -->` comment,
   alongside the other project sections.
4. In your pasted copy, update:
   - `id="restaurant"` → a new unique id, e.g. `id="landing-page"`
   - `data-category="food-beverage"` → matches the `data-filter` value
     you used in step 1 (e.g. `data-category="landing-page"`)
   - The title, category text, description text, and CTA links
5. **Add a matching image folder** under
   `images/projects/<project-name>/` and drop your screenshots in.
6. **Update the gallery/image references** inside your pasted block so
   every `src="..."` and `data-lightbox="..."` path points at your new
   folder.
7. If the project isn't real client work, keep the existing "Concept
   Project" labelling convention (see "A couple of things worth
   knowing" below) so the portfolio stays honest.
8. **Preview the page locally** (see "How to preview the website"
   below) and check it before publishing.

---

## 4. How to change your contact details

Your WhatsApp number, email and LinkedIn appear in **several places**
across all five pages (header, footer, hero buttons, contact page).
The fastest way to update them everywhere:

- **WhatsApp number** — find and replace `60176146502` (appears in
  `wa.me/60176146502` links and inside `js/script.js` as
  `WHATSAPP_NUMBER`)
- **Email** — find and replace `ajakrzzq@gmail.com`
- **LinkedIn** — find and replace `linkedin.com/in/ajakrzzq` (and the
  full URL `https://www.linkedin.com/in/ajakrzzq`)

Most code editors (like VS Code) have a "Find and Replace in Files"
feature — use that to update all five HTML files at once instead of
opening each one individually.

---

## 5. How to change website text

Just open the relevant `.html` file in a text editor and edit the
words between the tags. For example, in `index.html` you'll find:

```html
<h1>Websites That Help Your Business Get Noticed.</h1>
```

Change the sentence between `<h1>` and `</h1>` and save. The same
applies to paragraphs (`<p>...</p>`) and buttons (`<a>...</a>`). Don't
delete the `<...>` tags themselves — just the text inside them.

---

## 6. How to preview the website

You don't need any special software:

- **Easiest:** double-click `index.html` — it opens directly in your
  browser (Chrome, Edge, Safari, etc.), and you can click through to
  the other pages normally.
- **More accurate preview:** if you have
  [VS Code](https://code.visualstudio.com/), install the "Live
  Server" extension, right-click `index.html`, and choose "Open with
  Live Server." This is closer to how it'll behave once published.

To check mobile view, open the page in Chrome, press `F12` (or
`Cmd+Option+I` on Mac) to open Developer Tools, then click the
phone/tablet icon to preview different screen sizes.

---

## 7. Where it's currently published

This portfolio is already live, deployed on **[Vercel](https://vercel.com/)**, at:

**https://ajakweb.vercel.app/**

That's also the canonical URL used in each page's SEO metadata
(`<link rel="canonical">` and `og:url`). No custom domain is currently
configured — the site runs on Vercel's default `.vercel.app` address.

If you ever need to redeploy or move hosts, the whole repository is a
complete, ready-to-host static site. A couple of other beginner-friendly
free options:

- **[Netlify Drop](https://app.netlify.com/drop)** — drag the whole
  project folder onto the page, and it's live in seconds with a free
  `.netlify.app` address.
- **[GitHub Pages](https://pages.github.com/)** — upload the folder
  contents to a GitHub repository and turn on Pages in the repo
  settings.

Whichever host you use, make sure `index.html` stays in the **top
level** of whatever you upload (not inside an extra subfolder), since
that's the file every host looks for first.

---

## 8. How to connect a custom domain later

Once you own a domain (e.g. `ajakweb.my`), every host above has a
"Custom Domain" or "Domains" section in its dashboard:

1. Add your domain there.
2. The host will show you 1–2 DNS records to add (usually a `CNAME`
   or `A` record).
3. Add those records wherever you bought the domain (Namecheap, GoDaddy,
   Exabytes, etc. — Malaysian registrars all support this the same way).
4. DNS changes can take a few hours to a day to fully activate.

---

## 9. A couple of things worth knowing

- **The contact form** doesn't have a backend — hitting "Send
  Enquiry" opens WhatsApp with the message pre-filled instead. This
  was a deliberate choice so the form is genuinely useful without
  needing a server. If you later want real form submissions (e.g. to
  your email), a free service like [Formspree](https://formspree.io/)
  can be dropped in without much extra work.
- **The map on the Contact page** is a live Google Maps embed — it
  needs an internet connection to load, same as any map.
- All the sample project screenshots keep their original honesty
  labels ("Sample Project," placeholder pricing, placeholder reviews)
  exactly as you specified — nothing was presented as real client
  work.
- **"Concept Project" entries** — every case study in `work.html`
  (Madani, Restaurant, Furniture and NOVAÉ) is labelled a "Concept
  Project" in its Project Summary or project tag. These are presented
  to demonstrate design, structure and implementation capabilities,
  and should not be interpreted as claims of work completed for the
  named business unless explicitly stated.
