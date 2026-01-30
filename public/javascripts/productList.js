// productList.js - loads products and renders grid
(function(){
  const grid = document.getElementById('productGrid');
  const toastEl = document.getElementById('msgToast');
  let toast;
  if(toastEl) toast = new bootstrap.Toast(toastEl);

  const priceRange = document.getElementById('priceRange');
  const priceRangeVal = document.getElementById('priceRangeVal');
  const applyFilterBtn = document.getElementById('applyFilterBtn');
  const clearFilterBtn = document.getElementById('clearFilterBtn');
  const sortSelect = document.getElementById('sortSelect');

  let allProducts = [];

  function showMsg(msg){
    if(toastEl){ toastEl.querySelector('.toast-body').textContent = msg; toast.show(); }
    else alert(msg);
  }

  function createCard(p){
    const col = document.createElement('div'); col.className='col-12 col-sm-6 col-md-4 col-lg-3';
    col.innerHTML = `
      <div class="card h-100">
        <img src="${p.image}" class="card-img-top" alt="${escapeHtml(p.title)}" />
        <div class="card-body d-flex flex-column">
          <h6 class="card-title">${escapeHtml(p.title)}</h6>
          <p class="mb-1 text-primary fw-bold">₹${p.price}</p>
          <p class="small text-muted">Rating: ${p.rating && p.rating.rate ? p.rating.rate : '-'}</p>
          <div class="mt-auto d-flex gap-2">
            <a href="/productView.html?id=${p.id}" class="btn btn-sm btn-outline-secondary">View Details</a>
            <button class="btn btn-sm btn-primary add-btn" data-id="${p.id}">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
    return col;
  }

  function escapeHtml(s){ return String(s).replace(/[&<>\"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"})[c]); }

  function bindAddButtons(){
    grid.querySelectorAll('.add-btn').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const id = btn.getAttribute('data-id');
        const p = await fetchProductById(id);
        CartStorage.addItem(p,1);
        showMsg('Product added to cart');
        if(window.updateCartCount) window.updateCartCount();
      });
    });
  }

  async function fetchProducts(){
    const res = await fetch('/data/productdata.json');
    return await res.json();
  }

  async function fetchProductById(id){
    if(allProducts && allProducts.length){
      return allProducts.find(x=>String(x.id)===String(id));
    }
    const prods = await fetchProducts();
    return prods.find(x=>String(x.id)===String(id));
  }

  function applyFiltersSort(){
    let list = allProducts.slice();
    // categories
    const checked = Array.from(document.querySelectorAll('.cat-checkbox:checked')).map(i=>i.value);
    if(checked.length) list = list.filter(p=> checked.includes((p.category||'').toString()));
    // price
    const maxPrice = priceRange ? Number(priceRange.value) : NaN;
    if(!isNaN(maxPrice) && maxPrice>0) list = list.filter(p=> Number(p.price) <= maxPrice);
    // sort
    const sort = sortSelect ? sortSelect.value : '';
    if(sort==='price_asc') list.sort((a,b)=>a.price-b.price);
    else if(sort==='price_desc') list.sort((a,b)=>b.price-a.price);
    else if(sort==='rating_desc') list.sort((a,b)=> (b.rating?.rate||0) - (a.rating?.rate||0));

    renderProducts(list);
  }

  function renderProducts(list){
    grid.innerHTML = '';
    list.forEach(p=> grid.appendChild(createCard(p)));
    bindAddButtons();
  }

  function initUI(){
    if(priceRange){
      priceRange.addEventListener('input', ()=>{ priceRangeVal.textContent = priceRange.value==0? 'Any' : 'Rs. '+priceRange.value; });
    }
    if(applyFilterBtn) applyFilterBtn.addEventListener('click', applyFiltersSort);
    if(clearFilterBtn) clearFilterBtn.addEventListener('click', ()=>{
      document.querySelectorAll('.cat-checkbox').forEach(c=>c.checked=false);
      if(priceRange) priceRange.value = priceRange.max || 1000; priceRangeVal.textContent = 'Any';
      if(sortSelect) sortSelect.value = '';
      renderProducts(allProducts);
    });
    if(sortSelect) sortSelect.addEventListener('change', applyFiltersSort);
  }

  async function init(){
    try{
      allProducts = await fetchProducts();
      // ensure priceRange max based on products
      if(priceRange){
        const maxP = Math.ceil(Math.max(...allProducts.map(p=>Number(p.price)||0)));
        priceRange.max = maxP || 1000; priceRange.value = 0; priceRangeVal.textContent = 'Any';
      }
      initUI();
      renderProducts(allProducts);
    }catch(e){ console.error(e); grid.innerHTML = '<div class="col-12">Failed to load products</div>' }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
