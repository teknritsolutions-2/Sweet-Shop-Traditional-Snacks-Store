// The full explorer lives only on the dedicated gifting page.
(() => {
  const giftName = document.getElementById('gift-name');
  if (!giftName) return;
  let occasion = 'Diwali';
  const category = document.getElementById('gift-category');
  const budget = document.getElementById('gift-budget');
  const quantity = document.getElementById('gift-qty');
  const packaging = document.getElementById('gift-packaging');
  const link = document.getElementById('gift-enquire');
  function update() {
    const preferred = { Diwali: 19, 'Raksha Bandhan': 18, Weddings: 23, 'Family Celebrations': 23, 'Corporate Gifting': 22 };
    const matches = PRODUCTS.filter(product => (category.value === 'Dry Fruits' ? product.category === 'Dry Fruits' : product.category === 'Gift Boxes') && product.price <= Number(budget.value));
    const product = matches.find(product => product.id === preferred[occasion]) || matches[0];
    document.getElementById('gift-occasion').textContent = occasion.toUpperCase() + ' COLLECTION';
    document.querySelectorAll('[data-occasion]').forEach(button => {
      const active = button.dataset.occasion === occasion;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    link.hidden = !product;
    if (!product) {
      giftName.textContent = 'Let’s find the right fit.';
      document.getElementById('gift-types').textContent = 'Try a wider budget or another category.';
      document.getElementById('gift-price').textContent = '';
      return;
    }
    giftName.textContent = product.name;
    document.getElementById('gift-types').textContent = product.types;
    document.getElementById('gift-price').textContent = money(product.price) + ' / ' + product.pack + ' · indicative';
    const image = document.querySelector('.gift-layout > img');
    image.src = storePath + product.image;
    image.alt = product.imageAlt || product.name;
    const params = new URLSearchParams({ enquiry: 'bulk', product: product.id, occasion, quantity: quantity.value, packaging: packaging.value });
    link.href = storePath + 'pages/contact.html?' + params;
  }
  document.querySelectorAll('[data-occasion]').forEach(button => button.addEventListener('click', () => { occasion = button.dataset.occasion; update(); }));
  [category, budget, packaging].forEach(input => input.addEventListener('change', update));
  quantity.addEventListener('input', update);
  link.addEventListener('click', event => { if (!quantity.reportValidity()) event.preventDefault(); });
  update();
})();
