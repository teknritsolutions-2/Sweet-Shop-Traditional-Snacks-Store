# Mithola — Sweets & Snacks

A static storefront for Indian sweets, savories, dry fruits and gifting. Built with HTML, CSS and vanilla JavaScript. The site includes two homepages, a searchable 24-product catalog, product details, a local shopping bag, gift discovery, an enquiry form, and light/dark and LTR/RTL views.

## Preview

Run `python3 -m http.server 4173 --bind 127.0.0.1` from the project root, then open `http://127.0.0.1:4173/`. The root `index.html` is the homepage. No build step or package installation is needed.

## Structure

- `index.html`: main homepage
- `pages/`: second homepage, catalog, product details, bulk orders, contact, bag, and supporting pages
- `assets/css/`: shared, dark-mode and RTL styles
- `assets/js/`: product data and storefront behavior
- `assets/images/`: original and prepared food photographs
- `assets/brand/`: symbol logo and favicon
- `documentation/`: store configuration and image source records
- `robots.txt`, `sitemap.xml`, `.nojekyll`: search and GitHub Pages files

## Content and ordering

Edit `assets/js/products.js` to update products, packs and indicative prices. Product photographs have consistent 1200 × 900 derivatives in `assets/images/catalog/`; their source mappings are in `documentation/catalog-image-map.json`. Image authors and licenses are recorded in `documentation/photo-sources.json` and linked from the public Photo credits page.

The shopping bag is stored in the visitor's browser. The enquiry form validates entries and prepares a review and downloadable request; it does not send orders or take payments. Before accepting orders, add verified store contact details, product specifications, prices and an enquiry delivery service. See `documentation/CONFIGURATION.md`.

## Hosting

GitHub Pages serves the project directly from the repository root. Keep `index.html`, `pages/`, `assets/`, `robots.txt`, `sitemap.xml` and `.nojekyll` at the root. Relative links work under the GitHub Pages project path. Update sitemap URLs if the hosting domain changes.
