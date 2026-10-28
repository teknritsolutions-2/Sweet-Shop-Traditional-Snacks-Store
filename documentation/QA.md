# Repair QA — 28 October 2026

Baseline: GitHub main and the local checkout both matched `95bd2b8e8dd24993f6338733d4663a5ebbd5815c` before editing. Existing Home 2 and Contact screenshots were inspected alongside the source-confirmed audit.

## Executed verification

- `NODE_PATH=/private/tmp/sweet-qa/node_modules node tests/browser.cjs` using actual headless Brave and Playwright: **158 / 158 checks passed**, no JavaScript exceptions.
- **660 page/viewport/theme/direction combinations**: every HTML page, plus Contact bulk mode, at 320, 360, 390, 430, 640, 768, 820, 1024, 1280, 1440 and 1920 px in light/LTR, dark/LTR, light/RTL and dark/RTL. No detected horizontal overflow or clipped headings/action controls.
- Google Fonts CSS and actual font files returned HTTP 200. DM Serif Display regular/italic and Manrope loaded; computed typography checked on the core pages at desktop, tablet and mobile sizes. All fourteen HTML pages have valid, unmodified font-axis declarations.
- `python3 tests/check-links.py`: local links, assets, cross-page anchors and Google Fonts URL syntax pass across fourteen HTML pages.
- JavaScript syntax checks and `git diff --check` pass.

## Browser coverage

Correct desktop utility order and equal control dimensions; textual direction control; hidden empty badge; sticky navbar after actual scrolling; dropdown hover/click/focus/Escape/outside click; mobile utility reparenting, drawer scroll lock and right-side RTL drawer; hero switching; anatomy controls; preserved 24-record catalog, filters, search, sorting and empty state; quantity-aware cart addition, persistence and subtotal changes; contextual related products across all four categories; gifting filters and Contact handoff; selected product, occasion, quantity and packaging prefill; conditional business details; required fields, past dates and zero-quantity validation; honest general/bulk review and a real enquiry download; mode switching without losing entered values.

## Visual evidence

Full-page screenshots in `tests/screenshots/` cover Home 1, Home 2, About, Products, Product Details, Bulk Orders, Contact, Contact bulk mode and Cart at 1440, 820 and 390 px. Additional captures include populated cart, dark-mode pages, dark RTL navigation, and viewport-sized mobile detail views. Representative desktop/tablet/mobile screenshots were visually inspected, including About storytelling, four-card gifting/dry-fruit rows, anatomy integration, bulk discovery, contact fields, dark surfaces and cart controls.

Visual review caught a responsive drawer transition flash that the original overflow checks missed. Closed mobile drawers now use explicit visibility and inert states; eighteen additional assertions cover their visibility. Browser-native checks confirmed hidden bulk fieldsets disable descendants and exclude them from FormData in General mode.

## Limits

The photography is genuine and licensed, with public attribution. Gift photographs are labeled as assortment inspiration because exact client packaging is unverified; no package specifications are claimed from the photographs. The site remains frontend-only: enquiry delivery, payments, approved commercial pricing, inventory and fulfilment are not represented as operational.

## Branding and final layout refinement

After the client clarified the naming instruction, the original identity **Mithloya** was added to the header, footer and page titles. The symbol remains consistent. Shared container gutters now govern navigation and footer, while desktop navigation is independently centered. Header collapse occurs before controls become crowded.

Latest browser run: **165 / 165 checks passed**, with the same **660** all-page responsive/theme/direction cases and no JavaScript exceptions. New checks verify exact navigation centering, equal header/footer/section gutters, visible brand text, full-subject product photo rendering, and quantity increment/decrement behavior. Card quantities retain direct numeric input but replace browser spinner arrows with explicit aligned minus/plus buttons. Bulk and gift photos use natural dimensions to remove artificial white bars. The Familiar Flavors section uses compact vertical spacing and naturally proportioned photography.

The Familiar Flavors photograph was pulled to the page edge by a legacy `margin: 0` rule overriding its container margins. That rule was removed, and an explicit gutter-alignment assertion now covers the section.

## Saanvoya / Home 2 and uniform image refinement

The current brand is **Saanvoya**. Home 2 now follows a six-section gifting sequence with one coherent photographic hero, four featured gifts, three occasion pathways, four dry-fruit products, a savory feature and a compact enquiry close. The tablet hero stacks before its text column becomes cramped.

The former inset/contain card presentation is superseded by consistently cropped **1200 × 900** photo assets displayed edge to edge in 4:3 frames. A newly licensed cashew-kernel photo replaces the bag photograph. The accurate existing brown-almond photo is retained with a matching crop. There are no stretched images, padding borders or differently sized card photo areas. The preparation script and source/derivative map are retained for repeatability. These photographic derivatives retain their source licenses.

The browser suite checks all 24 catalog photos for exact natural dimensions and the full-frame cover treatment. Latest run: **165 / 165 functional checks**, **660 page/width/theme/direction cases**, no JavaScript exceptions. Home 2 desktop/tablet/mobile and the merchandise rows were visually inspected; review led to the tablet-hero and almond-selection corrections.

Photo preparation now normalizes EXIF orientation before cropping; this corrected an almond image that browsers otherwise interpreted as portrait. Browser image checks wait for actual loading to complete before evaluating natural dimensions. The runtime remains buildless; Pillow is only an optional asset-preparation dependency.

## Home 2 banner refinement

Replaced the dark split banner with a light editorial hero, a shorter heading, a restrained offset gold photo outline and a compact personalization link. The change is scoped to Home 2 and its component styles. Desktop/tablet/mobile screenshots were refreshed and visually reviewed; the existing 165-check browser suite and 660-case responsive/theme matrix remain the regression gate.

## Store-name refinement

Current identity: **Mithmora — Sweets & Snacks**. Updated the shared header/footer identity, page titles and dynamic product title, with a compact descriptive line beneath the wordmark. Brand presence and overflow were checked across all fourteen pages at 320px and 1440px (28 page/viewport checks). Static link/font validation and JavaScript syntax checks also passed.

## Selected brand

The selected storefront name is **Mithola — Sweets & Snacks**. Updated header/footer lockups, page titles, dynamic product titles and the catalog asset version. Branding and header overflow checked across fourteen pages at desktop and narrow mobile widths.
