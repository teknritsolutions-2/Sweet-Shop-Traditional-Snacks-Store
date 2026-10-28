# Sweet Shop & Traditional Snacks Store

A buildless HTML5, CSS and vanilla JavaScript storefront with two distinct homepages, 24 centralized product records, catalog search/filter/sort, product details, persistent cart, gifting explorer, sweet anatomy, and a centralized general/bulk enquiry form on Contact. Includes light/dark modes and LTR/RTL layouts.

## Preview

Run `python3 -m http.server 4173 --bind 127.0.0.1` from this directory and open http://127.0.0.1:4173. The actual homepage is root `index.html`. No production dependencies or build are required. Files also work on GitHub Pages project paths.

## Content and ordering

Product data lives in `assets/js/products.js`. Prices and pack sizes are indicative configurable collection data, not client-approved commercial offers. Photography represents product types rather than verified store inventory. Product ingredients, allergens, storage guidance, exact gift contents, packaging, delivery coverage and availability must be confirmed by the store. Gift photography is labeled as assortment inspiration; it is not presented as verified store packaging. Mithmora is the original brand name created for this project at the client’s request. No address, hours, phone number, certifications, ratings or payment claims are invented.

The cart uses browser localStorage. Enquiry form modes validate details, provide a review and download a plain-text request. They do not transmit data, process payments or confirm orders. Add real store contact destinations and an appropriate submission service before enabling online enquiry delivery.

## Files

- `index.html`: product-first homepage
- `pages/home2.html`: editorial gifting homepage
- `pages/`: catalog, details, bulk orders, contact, cart and supporting pages
- `assets/brand/`: symbol-only SVG logo and favicon
- `documentation/photo-sources.json`: image source, author and license records
- `pages/photo-credits.html`: accessible public attribution
- `tests/browser.cjs`: actual Playwright browser regression suite
- `tests/screenshots/`: rendered responsive captures
- `tests/results.json`: latest automated results

## Browser verification

Install dev tools with `npm install`, run the preview server, then `npm test`. macOS defaults to installed Brave; use `BROWSER_PATH=/path/to/browser npm test` to select another Chromium executable. On other systems install Playwright Chromium with `npx playwright install chromium`. QA tools are not used by the site runtime.

Responsive page screenshots include About and both Contact modes at desktop 1440, tablet 820 and mobile 390. Every HTML page is checked in all four theme/direction combinations at 320, 360, 390, 430, 640, 768, 820, 1024, 1280, 1440 and 1920. Browser tests cover sticky header, navigation dropdown, mobile drawer, theme, RTL, product switching, anatomy, gifting filters, catalog search/sort, cart persistence/calculation and enquiry review.

## Hosting

Deploy root `index.html`, `pages/`, `assets/`, `robots.txt`, `sitemap.xml` and `.nojekyll` to GitHub Pages. Source has relative links and no redirect homepage. `dist/` is an equivalent static publication output for Sites. Update sitemap URLs if using another hosting domain. No dashboard, login, registration or backend is present.

## Photography

All food images are real photographs, not AI images. See the public Photo credits page for linked licenses and attribution. Resized, compressed and cropped image derivatives remain under their respective licenses. No endorsement by the photographers or photographed businesses is implied. Google Fonts provides DM Serif Display and Manrope with system font fallbacks when offline.

## Uniform photography

Catalog photographs use locally prepared 1200 × 900 (4:3) derivatives, with no image padding or letterboxing. Originals and their licenses remain available. Install the optional image tool with `python3 -m pip install -r scripts/requirements-images.txt`, then run `python3 scripts/prepare-catalog-images.py` to regenerate the cards. Source-to-derivative mappings are in `documentation/catalog-image-map.json`.
