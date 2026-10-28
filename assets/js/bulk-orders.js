// One enquiry form, with optional celebration fields. No network submission.
(() => {
  const form = document.querySelector('.enquiry-form');
  if (!form) return;
  const params = new URLSearchParams(location.search);
  const bulkFields = form.querySelector('.bulk-fields');
  const modeButtons = document.querySelectorAll('[data-enquiry-mode]');
  const date = form.elements.date;
  const now = new Date();
  date.min = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');

  function updateBusiness() {
    const isBusiness = form.dataset.type === 'bulk' && form.elements.customer.value === 'Business';
    const business = form.elements.business;
    business.closest('label').hidden = !isBusiness;
    business.disabled = !isBusiness;
    business.required = isBusiness;
  }
  function setMode(mode, updateUrl = true) {
    const bulk = mode === 'bulk';
    form.dataset.type = bulk ? 'bulk' : 'general';
    form.elements.enquiry.value = form.dataset.type;
    bulkFields.hidden = !bulk;
    bulkFields.disabled = !bulk;
    modeButtons.forEach(button => {
      const active = button.dataset.enquiryMode === form.dataset.type;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.getElementById('enquiry-heading').innerHTML = bulk ? 'Your celebration.<br><em>Every detail.</em>' : 'Your next<br><em>sweet moment.</em>';
    document.getElementById('enquiry-intro').textContent = bulk ? 'Plan the occasion, quantity and presentation in one place. Your chosen collection stays editable throughout.' : 'Choose a product, quantity and preferred date. You can review every detail before downloading your enquiry.';
    document.getElementById('product-label').textContent = bulk ? 'Selected product or collection' : 'Product of interest';
    document.getElementById('quantity-label').textContent = bulk ? 'Estimated quantity' : 'Quantity';
    document.getElementById('date-label').textContent = bulk ? 'Required date' : 'Preferred date';
    updateBusiness();
    form.querySelector('.enquiry-review').replaceChildren();
    if (updateUrl) {
      const url = new URL(location.href);
      if (bulk) url.searchParams.set('enquiry', 'bulk');
      else url.searchParams.delete('enquiry');
      history.replaceState(null, '', url);
    }
  }
  modeButtons.forEach(button => button.addEventListener('click', () => setMode(button.dataset.enquiryMode)));
  form.elements.customer.addEventListener('change', updateBusiness);
  const product = params.has('product') ? PRODUCTS.find(p => p.id === Number(params.get('product'))) : null;
  if (product) {
    form.elements.product.value = product.name;
    form.elements.category.value = product.category;
  }
  if (params.has('quantity')) {
    const quantity = Number(params.get('quantity'));
    if (Number.isFinite(quantity)) form.elements.quantity.value = Math.max(1, Math.min(10000, Math.floor(quantity)));
  }
  for (const key of ['occasion', 'packaging']) {
    const value = params.get(key);
    if (value && [...form.elements[key].options].some(option => option.value === value)) form.elements[key].value = value;
  }
  form.elements.product.addEventListener('change', () => {
    const selected = PRODUCTS.find(p => p.name === form.elements.product.value);
    if (selected) form.elements.category.value = selected.category;
  });
  setMode(params.get('enquiry') === 'bulk' ? 'bulk' : 'general', false);
  if (form.dataset.type === 'bulk' && !product) {
    form.elements.product.value = PRODUCTS[18].name;
    form.elements.category.value = PRODUCTS[18].category;
  }
  if (params.has('cart') && cart.length) {
    form.elements.message.value = 'Selected items:\n' + cart.map(item => {
      const product = PRODUCTS[item.id];
      return product.name + ' × ' + item.qty + ' (' + product.pack + ')';
    }).join('\n');
    form.elements.quantity.value = cart.reduce((sum, item) => sum + item.qty, 0);
    form.elements.product.value = PRODUCTS[cart[0].id].name;
    form.elements.category.value = PRODUCTS[cart[0].id].category;
  }
  const labels = { enquiry: 'Enquiry mode', name: 'Full name', email: 'Email', phone: 'Phone', product: 'Product or collection', quantity: 'Quantity', date: 'Preferred date', customer: 'Ordering for', business: 'Business name', occasion: 'Occasion', category: 'Product category', city: 'Delivery city', packaging: 'Packaging preference', personalization: 'Personalization request', message: 'Additional message' };
  form.addEventListener('input', () => form.querySelector('.enquiry-review').replaceChildren());
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = [...new FormData(form)].filter(([, value]) => String(value).trim());
    const target = form.querySelector('.enquiry-review');
    target.replaceChildren();
    const title = document.createElement('h3');
    title.textContent = 'Review your enquiry';
    target.append(title);
    const list = document.createElement('dl');
    let text = 'ORDER ENQUIRY — NOT SUBMITTED\n\n';
    data.forEach(([key, value]) => {
      const term = document.createElement('dt');
      const detail = document.createElement('dd');
      term.textContent = key === 'date' && form.dataset.type === 'bulk' ? 'Required date' : labels[key] || key;
      detail.textContent = key === 'enquiry' ? (value === 'bulk' ? 'Bulk & Festival Enquiry' : 'General Order Enquiry') : value;
      list.append(term, detail);
      text += term.textContent + ': ' + detail.textContent + '\n';
    });
    target.append(list);
    const note = document.createElement('p');
    note.className = 'fine';
    note.textContent = 'Your enquiry has not been sent. Download a copy to keep or share through an agreed contact channel.';
    target.append(note);
    const download = document.createElement('button');
    download.type = 'button';
    download.className = 'button secondary';
    download.textContent = 'Download enquiry';
    download.addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'sweet-order-enquiry.txt';
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    target.append(download);
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
})();
