# ajak.Web — Portfolio Website Guide

This is your finished 5-page portfolio site. It's plain HTML, CSS and
JavaScript — no build tools, no installs. You can open it, edit it,
and publish it with nothing more than a text editor and a web browser.

---

## 1. What each file does

```
ajakweb/
├── index.html          → Home page
├── about.html           → About page
├── services.html        → Services page
├── work.html             → My Work page (your portfolio — most important page)
├── contact.html          → Contact page
├── css/
│   └── style.css          → ALL styling for every page (colors, fonts, spacing, layout)
├── js/
│   └── script.js           → ALL interactivity (mobile menu, filters, lightbox, contact form)
└── images/
    ├── brand/favicon.svg      → The small icon shown in the browser tab
    └── projects/                → Your sample project screenshots, sorted by project
        ├── restaurant/
        ├── oilgas/
        └── furniture/
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
2. **Copy one whole `<article class="project reveal" ...>` block**
   (search for `<!-- PROJECT 01 — RESTAURANT -->` to find where one
   starts and ends) and paste it right before `</div>` that closes the
   projects list.
3. In your pasted copy, update:
   - `id="restaurant"` → a new unique id, e.g. `id="landing-page"`
   - `data-category="restaurant"` → matches the `data-filter` value
     you used in step 1
   - The title, category text, image paths, and description text
4. Add a matching image folder under `images/projects/` and drop your
   screenshots in.

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

## 7. How to publish it online

The whole `ajakweb` folder is a complete, ready-to-host static
website. A few beginner-friendly free options:

- **[Netlify Drop](https://app.netlify.com/drop)** — drag the whole
  `ajakweb` folder onto the page, and it's live in seconds with a free
  `.netlify.app` address.
- **[GitHub Pages](https://pages.github.com/)** — upload the folder
  contents to a GitHub repository and turn on Pages in the repo
  settings.
- **[Vercel](https://vercel.com/)** — similar drag-and-drop / GitHub
  import flow to Netlify.

Whichever you choose, make sure `index.html` stays in the **top
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

## A couple of things worth knowing

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
