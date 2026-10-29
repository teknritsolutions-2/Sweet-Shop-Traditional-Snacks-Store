# Mithola — Sweets & Snacks

A static storefront for Indian sweets, savories, dry fruits and gifting. Built with HTML, CSS and vanilla JavaScript. The site includes two homepages, a searchable 24-product catalog, product details, a local shopping bag, gift discovery, an enquiry form, and light/dark and LTR/RTL views.

## Preview

Run `python3 -m http.server 4173 --bind 127.0.0.1` from the project root, then open `http://127.0.0.1:4173/`. The root `index.html` is the homepage. No build step or package installation is needed.

## Structure

```text
Sweet-Shop-Traditional-Snacks-Store/
├── index.html                 # only HTML page at the project root
├── assets/
│   ├── brand/                # SVG logo and favicon
│   ├── css/                  # style.css, dark-mode.css, rtl.css
│   ├── js/                   # main.js, product and storefront scripts
│   │   └── plugins/
│   ├── images/
│   └── fonts/
├── pages/                    # all other HTML pages
├── documentation/            # configuration and photo records
├── README.md
├── robots.txt
├── sitemap.xml
└── .nojekyll                 # required by this GitHub Pages setup
```

The empty `fonts/` and `js/plugins/` directories are reserved for future assets. The SVG logo lives in `assets/brand/`; there is no dashboard or extra homepage in `pages/`.

## Content and ordering

Edit `assets/js/products.js` to update products, packs and indicative prices. Product photographs have consistent 1200 × 900 derivatives in `assets/images/catalog/`; their source mappings are in `documentation/catalog-image-map.json`. Image authors and licenses are recorded in `documentation/photo-sources.json` and linked from the public Photo credits page.

The shopping bag is stored in the visitor's browser. The enquiry form validates entries and prepares a review and downloadable request; it does not send orders or take payments. Before accepting orders, add verified store contact details, product specifications, prices and an enquiry delivery service. See `documentation/CONFIGURATION.md`.

## Hosting

GitHub Pages serves the project directly from the repository root. Keep `index.html`, `pages/`, `assets/`, `robots.txt`, `sitemap.xml` and `.nojekyll` at the root. Relative links work under the GitHub Pages project path. Update sitemap URLs if the hosting domain changes.
