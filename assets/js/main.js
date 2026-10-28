const root = document.documentElement;
try {
  root.dataset.theme = localStorage.getItem('sweet-theme') || 'light';
  root.dir = localStorage.getItem('sweet-dir') || 'ltr';
} catch { /* Browser privacy settings may disable storage. */ }
const sun = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>';
const moon = '<path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z"/>';
function updateUtilities() {
  document.querySelectorAll('.theme').forEach(button => {
    const dark = root.dataset.theme === 'dark';
    button.querySelector('svg').innerHTML = dark ? moon : sun;
    button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    button.setAttribute('aria-pressed', String(dark));
  });
  document.querySelectorAll('.rtl').forEach(button => {
    const rtl = root.dir === 'rtl';
    button.textContent = rtl ? 'LTR' : 'RTL';
    button.setAttribute('aria-label', rtl ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout');
    button.setAttribute('aria-pressed', String(rtl));
  });
}
document.querySelectorAll('.theme').forEach(button => button.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('sweet-theme', root.dataset.theme); } catch {}
  updateUtilities();
}));
document.querySelectorAll('.rtl').forEach(button => button.addEventListener('click', () => {
  root.dir = root.dir === 'rtl' ? 'ltr' : 'rtl';
  try { localStorage.setItem('sweet-dir', root.dir); } catch {}
  updateUtilities();
}));
updateUtilities();

const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-toggle');
const nav = header.querySelector('nav');
const utilities = header.querySelector('.utilities');
const desktopUtilities = header.querySelector('.header-end');
const drawerUtilities = header.querySelector('.drawer-utilities');
let previousFocus;
function moveUtilities() {
  const target = innerWidth < 1280 ? drawerUtilities : desktopUtilities;
  if (utilities.parentElement !== target) target.prepend(utilities);
  nav.inert = innerWidth < 1280 && !header.classList.contains('drawer-open');
}
function setDrawer(open) {
  nav.inert = !open && innerWidth < 1280;
  header.classList.toggle('drawer-open', open);
  menu.setAttribute('aria-expanded', String(open));
  document.body.style.overflowY = open ? 'hidden' : '';
  if (open) {
    previousFocus = document.activeElement;
    nav.querySelector('button').focus();
  } else previousFocus?.focus();
}
moveUtilities();
menu.addEventListener('click', () => setDrawer(true));
header.querySelector('.close-menu').addEventListener('click', () => setDrawer(false));
header.querySelector('.scrim').addEventListener('click', () => setDrawer(false));
addEventListener('resize', () => {
  if (innerWidth >= 1280 && header.classList.contains('drawer-open')) setDrawer(false);
  moveUtilities();
});
const home = header.querySelector('.home-menu');
const homeButton = home.querySelector('.home-toggle');
let homePinned = false;
function toggleHome(open) {
  home.classList.toggle('open', open);
  homeButton.setAttribute('aria-expanded', String(open));
}
homeButton.addEventListener('click', () => { homePinned = !homePinned; toggleHome(homePinned); });
home.addEventListener('mouseenter', () => { if (innerWidth >= 1280) toggleHome(true); });
home.addEventListener('mouseleave', () => { if (innerWidth >= 1280 && !homePinned) toggleHome(false); });
home.addEventListener('focusin', () => { if (innerWidth >= 1280) toggleHome(true); });
home.addEventListener('focusout', event => {
  if (!home.contains(event.relatedTarget)) { homePinned = false; toggleHome(false); }
});
document.addEventListener('click', event => {
  if (!home.contains(event.target)) { homePinned = false; toggleHome(false); }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    homePinned = false;
    toggleHome(false);
    if (header.classList.contains('drawer-open')) setDrawer(false);
  }
  if (event.key === 'Tab' && header.classList.contains('drawer-open')) {
    const elements = [...nav.querySelectorAll('a, button')].filter(element => element.getClientRects().length);
    const first = elements[0], last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
document.querySelector('.back-top').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

// Product switching remains exclusive to the product-first homepage.
document.querySelectorAll('[data-hero]').forEach(button => {
  button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  button.addEventListener('click', () => {
    const product = PRODUCTS[Number(button.dataset.hero)];
    const image = document.getElementById('hero-image');
    image.src = storePath + product.image;
    image.alt = product.name;
    document.getElementById('hero-product').textContent = product.name;
    document.getElementById('hero-price').textContent = money(product.price) + ' / ' + product.pack;
    document.getElementById('hero-shop').href = document.getElementById('hero-detail').href = storePath + 'pages/product-details.html?id=' + product.id;
    document.querySelectorAll('[data-hero]').forEach(other => {
      other.classList.toggle('active', other === button);
      other.setAttribute('aria-pressed', String(other === button));
    });
  });
});
const anatomyCopy = [
  'Kaju katli is traditionally a cashew-based sweet. Ask for the exact ingredient and allergen details of your chosen assortment.',
  'Traditional mithai making brings careful preparation, cooking and shaping together. Methods vary by region and recipe.',
  'Kaju katli is known for its fine, smooth texture and distinctive diamond shape. Texture varies with preparation.',
  'A sweet shared is a welcome, a thank-you or a celebration. Serve a small assortment so everyone can discover a favorite.'
];
document.querySelectorAll('[data-anatomy]').forEach(button => {
  button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  button.addEventListener('click', () => {
    document.querySelector('.anatomy-description').textContent = anatomyCopy[Number(button.dataset.anatomy)];
    document.querySelectorAll('[data-anatomy]').forEach(other => {
      other.classList.toggle('active', other === button);
      other.setAttribute('aria-pressed', String(other === button));
    });
  });
});
const heroArt = document.querySelector('.hero-art');
if (heroArt && matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
  heroArt.addEventListener('pointermove', event => {
    if (innerWidth < 1280) return;
    const bounds = heroArt.getBoundingClientRect();
    heroArt.style.setProperty('--tilt-x', ((.5 - (event.clientY - bounds.top) / bounds.height) * 5) + 'deg');
    heroArt.style.setProperty('--tilt-y', (((event.clientX - bounds.left) / bounds.width - .5) * 5) + 'deg');
  });
  heroArt.addEventListener('pointerleave', () => {
    heroArt.style.setProperty('--tilt-x', '0deg');
    heroArt.style.setProperty('--tilt-y', '0deg');
  });
}
