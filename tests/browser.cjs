const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const base = (process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/?$/, '/');
const output = path.join(__dirname, 'screenshots');
const checks = [], errors = [], fontResponses = [];
function check(name, pass, details) {
  checks.push({ name, pass: !!pass, ...(details ? { details } : {}) });
  if (!pass) console.log('FAIL:', name, details || '');
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : process.platform === 'darwin' ? { executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser' } : {}),
    headless: true
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(response.url())) fontResponses.push({ url: response.url(), status: response.status() });
  });
  const visit = async url => {
    await page.goto(base + url);
    await page.evaluate(() => Promise.all([
      document.fonts.ready,
      ...[...document.images].map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); })
    ]));
  };
  const shot = name => page.screenshot({ path: path.join(output, name + '.png'), fullPage: true });
  const corePages = [
    ['home1', ''], ['home2', 'pages/home2.html'], ['about', 'pages/about.html'],
    ['products', 'pages/products.html'], ['detail', 'pages/product-details.html?id=0'],
    ['bulk', 'pages/bulk-festival-orders.html'], ['contact', 'pages/contact.html'],
    ['contact-bulk', 'pages/contact.html?enquiry=bulk'], ['cart', 'pages/cart.html']
  ];
  for (const [name, url] of corePages) {
    for (const [device, width] of [['desktop', 1440], ['tablet', 820], ['mobile', 390]]) {
      await page.setViewportSize({ width, height: 1000 });
      await visit(url);
      if (width < 1280) check(name + ' ' + device + ' closed drawer invisible', !await page.locator('header nav').isVisible());
      await shot(name + '-' + device);
      check(name + ' ' + device + ' photos load', await page.evaluate(() => [...document.images].every(image => image.naturalWidth > 0)));
      check(name + ' ' + device + ' fonts loaded', await page.evaluate(async () => {
        await Promise.all([document.fonts.load('400 16px "DM Serif Display"'), document.fonts.load('italic 400 16px "DM Serif Display"'), document.fonts.load('400 16px Manrope')]);
        return document.fonts.check('400 16px "DM Serif Display"') && document.fonts.check('400 16px Manrope') && getComputedStyle(document.body).fontFamily.startsWith('Manrope') && getComputedStyle(document.querySelector('h1')).fontFamily.includes('DM Serif Display');
      }));
    }
  }
  // Every HTML page at every requested width in all four visual modes.
  const files = ['', ...fs.readdirSync(path.join(__dirname, '../pages')).filter(file => file.endsWith('.html')).map(file => 'pages/' + file), 'pages/contact.html?enquiry=bulk'];
  const widths = [320, 360, 390, 430, 640, 768, 820, 1024, 1280, 1440, 1920];
  const matrix = [];
  for (const url of files) {
    await visit(url);
    const fontUrl = await page.locator('link[href*="fonts.googleapis.com/css2"]').getAttribute('href');
    check(url + ' valid font URL', fontUrl.includes('ital@0;1') && fontUrl.includes('wght@400;500;600;700;800'));
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      for (const mode of ['light-ltr', 'dark-ltr', 'light-rtl', 'dark-rtl']) {
        await page.evaluate(mode => { const [theme, dir] = mode.split('-'); document.documentElement.dataset.theme = theme; document.documentElement.dir = dir; }, mode);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const layout = await page.evaluate(() => {
          const outside = [...document.querySelectorAll('main h1, main h2, main h3, .card-actions, .enquiry-panel')].filter(element => {
            const rect = element.getBoundingClientRect();
            return rect.width && (rect.left < -1 || rect.right > innerWidth + 1 || element.scrollWidth > element.clientWidth + 2);
          }).map(element => element.className || element.tagName);
          return { overflow: document.documentElement.scrollWidth > innerWidth, outside };
        });
        matrix.push({ url, width, mode, ...layout });
      }
    }
    const failures = matrix.filter(item => item.url === url && (item.overflow || item.outside.length));
    check(url + ' all widths / themes / directions', failures.length === 0, failures.length ? failures : undefined);
  }
  fs.writeFileSync(path.join(__dirname, 'mode-results.json'), JSON.stringify(matrix, null, 2));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit('');
  await page.locator('.theme').click(); // Matrix ended in dark, persisted preference remains default light after navigation.
  check('Theme button changes appearance', await page.locator('html').getAttribute('data-theme') === 'dark');
  await shot('home1-dark');
  await page.locator('.rtl').click();
  check('RTL control displays destination letters', await page.locator('.rtl').textContent() === 'LTR');
  await shot('home1-dark-rtl');
  await page.locator('.rtl').click();
  await page.locator('.theme').click();
  const aligned = await page.evaluate(() => {
    const header = document.querySelector('.header-inner').getBoundingClientRect();
    const nav = document.querySelector('.site-header nav').getBoundingClientRect();
    const footer = document.querySelector('.footer-inner').getBoundingClientRect();
    const content = document.querySelector('.categories').getBoundingClientRect();
    return { centered: Math.abs(nav.x + nav.width / 2 - (header.x + header.width / 2)) < 1, gutters: header.x === content.x && footer.x === content.x && header.width === content.width && footer.width === content.width };
  });
  check('Navigation centered across the overall page', aligned.centered);
  check('Header footer and sections share gutters', aligned.gutters);
  check('Familiar Flavors uses the same section gutters', await page.evaluate(() => document.querySelector('.tradition').getBoundingClientRect().x === document.querySelector('.header-inner').getBoundingClientRect().x));
  check('Mithloya branding visible in header and footer', await page.locator('.logo .brand-name').textContent() === 'Mithloya' && await page.locator('.footer-brand .brand-name').textContent() === 'Mithloya');
  const order = await page.locator('.header-end').evaluate(element => [...element.querySelectorAll('button, a')].map(node => node.className));
  check('Desktop utility order: theme, RTL, bag, shop', /theme/.test(order[0]) && /rtl/.test(order[1]) && /cart-link/.test(order[2]) && /button/.test(order[3]), order);
  check('Empty bag badge hidden', !await page.locator('.cart-count').isVisible());
  const themeBox = await page.locator('.theme').boundingBox(), rtlBox = await page.locator('.rtl').boundingBox();
  check('Utility controls identical dimensions', themeBox.width === rtlBox.width && themeBox.height === rtlBox.height && themeBox.y === rtlBox.y);
  await page.locator('.home-toggle').click();
  check('Dropdown click opens', await page.locator('.dropdown').isVisible());
  await page.keyboard.press('Escape');
  check('Escape closes dropdown', !await page.locator('.dropdown').isVisible());
  await page.mouse.move(1200, 800);
  await page.locator('.home-toggle').hover();
  check('Dropdown hover opens', await page.locator('.dropdown').isVisible());
  await page.locator('h1').click();
  check('Outside click closes dropdown', !await page.locator('.dropdown').isVisible());
  await page.locator('.home-toggle').focus();
  check('Keyboard focus opens dropdown', await page.locator('.dropdown').isVisible());
  await page.keyboard.press('Escape');
  await page.evaluate(() => scrollTo(0, 1400));
  await page.waitForTimeout(250);
  check('Header sticks after scrolling', Math.abs((await page.locator('.site-header').boundingBox()).y) < 1);
  await page.evaluate(() => scrollTo(0, 0));
  await page.locator('[data-hero="1"]').click();
  check('Hero switches photo and information', (await page.locator('#hero-image').getAttribute('src')).includes('/1.jpg') && await page.locator('#hero-product').textContent() === 'Motichoor Laddu');
  await page.locator('[data-anatomy="2"]').click();
  check('Anatomy controls update copy', (await page.locator('.anatomy-description').textContent()).includes('texture'));
  check('Home 1 has no full explorer', await page.locator('.gift-explorer').count() === 0);
  await visit('pages/about.html');
  check('About has six distinct sections', await page.locator('main > section').count() === 6);
  check('About has no duplicate anatomy', await page.locator('[data-anatomy]').count() === 0);
  await visit('pages/home2.html');
  check('Four distinct featured gift cards', await page.locator('.gift-collection .product-card').count() === 4 && await page.locator('.gift-collection .product-image img').evaluateAll(images => new Set(images.map(image => image.src)).size) === 4);
  check('All four dry fruits displayed', await page.locator('.dry-collection .product-card').count() === 4);
  check('Home 2 has no full explorer', await page.locator('.gift-explorer').count() === 0);
  for (const id of [0, 8, 14, 18]) {
    await visit('pages/product-details.html?id=' + id);
    const related = await page.locator('#related-products .product-card').evaluateAll(elements => elements.map(element => Number(element.dataset.productId)));
    const categoryMatch = await page.evaluate(({ id, related }) => related.every(other => PRODUCTS[other].category === PRODUCTS[id].category && other !== id), { id, related });
    check('Contextual related products for category at ' + id, categoryMatch && related.length === (id === 14 ? 3 : 4), related);
  }
  await visit('pages/products.html');
  check('Product photographs show full subject', await page.locator('.product-image img').evaluateAll(images => images.every(image => getComputedStyle(image).objectFit === 'contain')));
  check('All 24 product records preserved', await page.locator('.product-card').count() === 24);
  await page.locator('[data-category="Savories"]').click();
  check('Category filter', await page.locator('.product-card').count() === 6);
  await page.locator('#search').fill('chakli');
  check('Catalog search', await page.locator('.product-card').count() === 1);
  await page.locator('#search').fill('no-matches');
  check('Catalog empty state', await page.locator('.empty-state').isVisible());
  await page.locator('#clear-filters').click();
  await page.locator('#sort').selectOption('low');
  check('Price sorting', await page.locator('.product-card h3').first().textContent() === 'Banana Chips');
  await page.locator('.product-card[data-product-id="0"] input').fill('2');
  await page.locator('.product-card[data-product-id="0"] [data-step="1"]').click();
  check('Card plus increases quantity', await page.locator('.product-card[data-product-id="0"] input').inputValue() === '3');
  await page.locator('.product-card[data-product-id="0"] [data-step="-1"]').click();
  check('Card minus decreases quantity', await page.locator('.product-card[data-product-id="0"] input').inputValue() === '2');
  await page.locator('[data-add="0"]').click();
  await page.locator('[data-add="1"]').click();
  check('Bag badge displays nonzero quantity', await page.locator('.cart-count').textContent() === '3' && await page.locator('.cart-count').isVisible());
  await visit('pages/cart.html');
  check('Cart persists quantities and subtotal', await page.locator('.cart-item').count() === 2 && await page.locator('.subtotal').textContent() === 'Subtotal₹1,280');
  await page.locator('[data-change="0"][data-delta="1"]').click();
  check('Cart increment calculation', await page.locator('.subtotal').textContent() === 'Subtotal₹1,760');
  await shot('cart-populated-desktop');
  await page.setViewportSize({ width: 390, height: 900 });
  await shot('cart-populated-mobile');
  await page.locator('.menu-toggle').click();
  check('Mobile utilities are inside drawer', await page.locator('nav .utilities').count() === 1 && await page.locator('.header-end .utilities').count() === 0);
  check('Drawer locks scrolling', await page.evaluate(() => document.body.style.overflowY === 'hidden'));
  await page.locator('nav .rtl').click();
  await page.locator('nav .theme').click();
  await shot('drawer-mobile-dark-rtl');
  check('RTL drawer opens from right', await page.locator('nav').evaluate(element => Math.abs(element.getBoundingClientRect().right - innerWidth) < 2));
  await page.keyboard.press('Escape');
  check('Drawer closes and restores scroll', await page.evaluate(() => document.body.style.overflowY === ''));
  await page.locator('.menu-toggle').click();
  await page.locator('.rtl').click();
  await page.locator('.theme').click();
  await page.keyboard.press('Escape');
  await visit('pages/contact.html?cart=1');
  check('Cart enquiry keeps all selected items', (await page.locator('[name="message"]').inputValue()).includes('Kaju Katli × 3'));
  check('General mode disables bulk-only fields', await page.locator('.bulk-fields').evaluate(fieldset => fieldset.disabled && [...fieldset.querySelectorAll('input, select, textarea')].every(input => input.matches(':disabled'))));
  const future = new Date(); future.setDate(future.getDate() + 30);
  const date = [future.getFullYear(), String(future.getMonth() + 1).padStart(2, '0'), String(future.getDate()).padStart(2, '0')].join('-');
  async function commonFields() {
    await page.locator('[name="name"]').fill('Test Customer');
    await page.locator('[name="email"]').fill('test@example.com');
    await page.locator('[name="phone"]').fill('9876543210');
    await page.locator('[name="date"]').fill(date);
  }
  await commonFields();
  await page.locator('button[type="submit"]').click();
  check('General enquiry review is honest', (await page.locator('.enquiry-review').textContent()).includes('has not been sent'));
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download enquiry', exact: true }).click();
  const download = await downloadEvent;
  check('Enquiry download works', download.suggestedFilename() === 'sweet-order-enquiry.txt' && !(await download.failure()));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit('pages/bulk-festival-orders.html');
  check('Bulk duplicate form removed', await page.locator('form, #bulk-enquiry').count() === 0 && !(await page.locator('main').textContent()).includes('LET’S MAKE IT MEMORABLE'));
  await page.locator('[data-occasion="Corporate Gifting"]').click();
  check('Occasion changes collection', await page.locator('#gift-name').textContent() === 'Corporate Gift Assortment');
  await page.locator('#gift-budget').selectOption('1200');
  check('Gift budget filtering', await page.locator('#gift-name').textContent() === 'Assorted Mithai Box');
  await page.locator('#gift-category').selectOption('Dry Fruits');
  check('Gift category filtering', await page.locator('#gift-name').textContent() === 'Premium Almonds');
  await page.locator('#gift-category').selectOption('All');
  await page.locator('#gift-budget').selectOption('99999');
  await page.locator('#gift-qty').fill('25');
  await page.locator('#gift-packaging').selectOption('Hamper');
  const giftUrl = await page.locator('#gift-enquire').getAttribute('href');
  check('Gift handoff targets Contact bulk mode', giftUrl.includes('contact.html?') && giftUrl.includes('enquiry=bulk') && giftUrl.includes('packaging=Hamper') && giftUrl.includes('quantity=25'));
  await page.locator('#gift-enquire').click();
  check('Bulk mode prefill is editable and complete', await page.locator('.enquiry-form').getAttribute('data-type') === 'bulk' && await page.locator('[name="product"]').inputValue() === 'Corporate Gift Assortment' && await page.locator('[name="occasion"]').inputValue() === 'Corporate Gifting' && await page.locator('[name="quantity"]').inputValue() === '25' && await page.locator('[name="packaging"]').inputValue() === 'Hamper');
  await page.locator('[name="customer"]').selectOption('Business');
  check('Business name conditionally required', await page.locator('[name="business"]').isVisible() && await page.locator('[name="business"]').getAttribute('required') !== null);
  await commonFields();
  await page.locator('[name="business"]').fill('QA Company');
  await page.locator('[name="city"]').fill('Hyderabad');
  await page.locator('[name="date"]').fill('2020-01-01');
  check('Past dates rejected', await page.locator('[name="date"]').evaluate(input => !input.checkValidity()));
  await page.locator('[name="date"]').fill(date);
  await page.locator('[name="quantity"]').fill('0');
  check('Zero quantities rejected', await page.locator('[name="quantity"]').evaluate(input => !input.checkValidity()));
  await page.locator('[name="quantity"]').fill('25');
  await page.locator('button[type="submit"]').click();
  check('Bulk enquiry review includes selected gift and packaging', (await page.locator('.enquiry-review').textContent()).includes('Corporate Gift Assortment') && (await page.locator('.enquiry-review').textContent()).includes('Hamper'));
  await page.locator('[data-enquiry-mode="general"]').click();
  check('Switching to general disables bulk validation', await page.locator('.bulk-fields').evaluate(fieldset => fieldset.disabled && [...fieldset.querySelectorAll('input, select, textarea')].every(input => input.matches(':disabled'))));
  await page.locator('[data-enquiry-mode="bulk"]').click();
  check('Switching modes preserves editable values', await page.locator('[name="city"]').inputValue() === 'Hyderabad' && await page.locator('[name="packaging"]').inputValue() === 'Hamper');
  for (const [name, url, width] of [['about-dark-tablet', 'pages/about.html', 820], ['contact-bulk-dark-mobile', 'pages/contact.html?enquiry=bulk', 390], ['products-dark-desktop', 'pages/products.html', 1440]]) {
    await page.setViewportSize({ width, height: 1000 }); await visit(url); await page.locator('.menu-toggle').evaluate(button => { if (innerWidth < 1280) button.click(); }); await page.locator('.theme').click(); await page.keyboard.press('Escape'); await shot(name);
    const colors = await page.locator('main').evaluate(element => ({ text: getComputedStyle(element).color, background: getComputedStyle(document.body).backgroundColor }));
    check(name + ' neutral light text on dark background', colors.text === 'rgb(250, 247, 240)' && colors.background === 'rgb(24, 25, 29)');
    await page.evaluate(() => localStorage.setItem('sweet-theme', 'light'));
  }
  check('Font CSS and actual font resources return HTTP 200', fontResponses.some(response => response.url.includes('fonts.googleapis.com') && response.status === 200) && fontResponses.some(response => response.url.includes('fonts.gstatic.com') && response.status === 200) && fontResponses.every(response => response.status < 400));
  check('No JavaScript errors', errors.length === 0, errors.length ? errors : undefined);
  fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({ checks, errors, fontResponses, matrixCases: matrix.length }, null, 2));
  console.log(JSON.stringify({ passed: checks.filter(item => item.pass).length, total: checks.length, matrixCases: matrix.length, failures: checks.filter(item => !item.pass), errors }, null, 2));
  await browser.close();
  if (checks.some(item => !item.pass)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exit(1); });
