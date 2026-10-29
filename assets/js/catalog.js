window.productCard = product => `
<article class="product-card" data-product-id="${product.id}">
  <a class="product-image" href="${storePath}pages/product-details.html?id=${product.id}">
    <img src="${storePath + product.image}" alt="${product.imageAlt || product.name}" loading="lazy">
    ${[0, 1, 3].includes(product.id) ? '<span class="tag">A TIMELESS FAVORITE</span>' : ''}
  </a>
  <div class="product-info">
    <p class="eyebrow">${product.category} · ${product.pack}</p>
    <a href="${storePath}pages/product-details.html?id=${product.id}"><h3>${product.name}</h3></a>
    <div class="product-bottom">
      <span class="price">${money(product.price)} <small>/ ${product.pack}</small></span>
      <div class="card-actions">
        <div class="card-stepper" role="group" aria-label="${product.name} quantity controls"><button type="button" data-step="-1" aria-label="Decrease ${product.name} quantity">−</button><input class="card-quantity" aria-label="${product.name} quantity" type="number" min="1" max="10000" value="1"><button type="button" data-step="1" aria-label="Increase ${product.name} quantity">+</button></div>
        <button class="add-cart" data-add="${product.id}" aria-label="Add ${product.name} to bag">Add to bag <span aria-hidden="true">+</span></button>
      </div>
    </div>
  </div>
</article>`;
document.querySelectorAll('[data-products]').forEach(el=>el.innerHTML=el.dataset.products.split(',').map(id=>productCard(PRODUCTS[Number(id)])).join(''));
const catalog=document.getElementById('catalog-grid');if(catalog){let category=new URLSearchParams(location.search).get('category')||'All';if(!['All','Sweets','Savories','Dry Fruits','Gift Boxes'].includes(category))category='All';const search=document.getElementById('search'),sort=document.getElementById('sort');const render=()=>{let list=PRODUCTS.filter(p=>(category==='All'||p.category===category)&&p.name.toLowerCase().includes(search.value.trim().toLowerCase()));if(sort.value==='low')list.sort((a,b)=>a.price-b.price);if(sort.value==='high')list.sort((a,b)=>b.price-a.price);if(sort.value==='name')list.sort((a,b)=>a.name.localeCompare(b.name));catalog.innerHTML=list.length?list.map(productCard).join(''):'<div class="empty-state"><h3>No favorites found just yet.</h3><p>Try another search or clear the filters.</p></div>';document.getElementById('result-count').textContent=list.length+' products';document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category===category);b.setAttribute('aria-pressed',b.dataset.category===category)})};document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;render()}));search.addEventListener('input',render);sort.addEventListener('change',render);document.getElementById('clear-filters').addEventListener('click',()=>{category='All';search.value='';sort.value='featured';render()});render()}
const detail=document.getElementById('product-detail');if(detail){const id=Number(new URLSearchParams(location.search).get('id')||0),p=PRODUCTS.find(p=>p.id===id);if(!p)detail.innerHTML='<h1>Product not found.</h1><a class="text-link" href="products.html">Back to collection ↗</a>';else{const related=document.getElementById('related-products');if(related){const matches=PRODUCTS.filter(other=>other.category===p.category&&other.id!==p.id).slice(0,4);related.innerHTML=matches.map(productCard).join('');related.classList.toggle('three-products',matches.length===3);}document.title=p.name+' · Mithola';detail.innerHTML=`<div class="detail-layout"><img src="${storePath+p.image}" alt="${p.imageAlt||p.name}"><div><a class="text-link" href="products.html?category=${encodeURIComponent(p.category)}">${p.category} ↗</a><h1>${p.name}</h1><p>${p.description}</p>${p.category==='Gift Boxes'?'<p class="fine">Assortment inspiration only. Exact contents and packaging are confirmed by enquiry.</p>':''}<p class="detail-price">${money(p.price)} <small>/ ${p.pack}</small></p><p class="fine">Indicative price. Final availability and price require confirmation.</p><div class="detail-actions"><div class="detail-quantity"><label for="detail-qty">Quantity</label><div class="card-stepper" role="group" aria-label="Quantity controls"><button type="button" data-step="-1" aria-label="Decrease quantity">−</button><input class="card-quantity" id="detail-qty" type="number" min="1" max="10000" value="1"><button type="button" data-step="1" aria-label="Increase quantity">+</button></div></div><button id="detail-add" class="button">Add to bag ↗</button></div><div class="product-guidance"><b>Before you order</b><p>Request verified ingredients, allergens and storage guidance for this product. Exact specifications and ${p.id>=18?'assortment contents and packaging':'pack availability'} are confirmed with your enquiry.</p><a class="text-link" href="contact.html?${p.category==='Gift Boxes'?'enquiry=bulk&':''}product=${p.id}">Ask about this product ↗</a></div></div></div>`;document.getElementById('detail-add').onclick=()=>{const q=document.getElementById('detail-qty');if(q.reportValidity())addCart(p.id,Number(q.value))}}}

// Keep sort options anchored to their field, including in responsive previews.
const sortSelect = document.getElementById('sort');
if (sortSelect) {
  const picker = sortSelect.parentElement;
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'sort-trigger';
  trigger.id = 'sort-trigger';
  trigger.setAttribute('aria-haspopup', 'menu');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'sort-options');
  trigger.setAttribute('aria-labelledby', 'sort-label sort-current');
  trigger.innerHTML = '<span id="sort-current"></span><span aria-hidden="true">⌄</span>';
  const menu = document.createElement('div');
  menu.id = 'sort-options';
  menu.className = 'sort-options';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-labelledby', 'sort-label');
  menu.hidden = true;
  const choices = [...sortSelect.options].map(option => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = option.textContent;
    button.setAttribute('role', 'menuitemradio');
    button.tabIndex = -1;
    button.addEventListener('click', () => {
      sortSelect.value = option.value;
      sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
      close(true);
    });
    menu.append(button);
    return button;
  });
  function sync() {
    trigger.firstElementChild.textContent = sortSelect.selectedOptions[0].textContent;
    choices.forEach((button, i) => button.setAttribute('aria-checked', String(i === sortSelect.selectedIndex)));
  }
  function close(restore = false) {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (restore) trigger.focus();
  }
  function open(index = sortSelect.selectedIndex) {
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    choices[index].focus();
  }
  trigger.addEventListener('click', () => menu.hidden ? open() : close());
  trigger.addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault(); open(event.key === 'ArrowDown' ? 0 : choices.length - 1);
    }
  });
  menu.addEventListener('keydown', event => {
    const i = choices.indexOf(document.activeElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1 : (i + (event.key === 'ArrowDown' ? 1 : -1) + choices.length) % choices.length;
      choices[next].focus();
    }
    if (event.key === 'Escape') { event.preventDefault(); close(true); }
    if (event.key === 'Tab') close();
  });
  document.addEventListener('click', event => { if (!picker.contains(event.target)) close(); });
  picker.addEventListener('focusout', event => { if (!picker.contains(event.relatedTarget)) close(); });
  sortSelect.addEventListener('change', sync);
  document.getElementById('clear-filters').addEventListener('click', () => { sync(); close(); });
  sortSelect.hidden = true;
  document.getElementById('sort-label').htmlFor = trigger.id;
  picker.append(trigger, menu);
  sync();
}
