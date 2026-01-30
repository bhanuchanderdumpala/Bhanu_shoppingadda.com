// productView.js - render one product from query string
(function(){
  const container = document.getElementById('productContainer');
  const toastEl = document.getElementById('msgToast');
  let toast;
  if(toastEl) toast = new bootstrap.Toast(toastEl);

  function showMsg(msg){ if(toastEl){ toastEl.querySelector('.toast-body').textContent = msg; toast.show(); } else alert(msg); }

  function qs(name){
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  async function fetchProducts(){
    const res = await fetch('/data/productdata.json');
    return await res.json();
  }

  async function init(){
    const id = qs('id');
    if(!id){ container.innerHTML = '<div class="col-12">Product id missing</div>'; return; }
    const prods = await fetchProducts();
    const p = prods.find(x=>String(x.id)===String(id));
    if(!p){ container.innerHTML = '<div class="col-12">Product not found</div>'; return; }

    container.innerHTML = `
      <div class="col-md-5">
        <img src="${p.image}" class="product-img" alt="${p.title}" />
      </div>
      <div class="col-md-7">
        <h3>${p.title}</h3>
        <p class="text-muted">Category: ${p.category || ''}</p>
        <h4 class="text-primary">₹${p.price}</h4>
        <p>${p.description}</p>
        <div class="d-flex gap-2 mt-3">
          <button id="addToCartBtn" class="btn btn-primary">Add to Cart</button>
          <a class="btn btn-outline-secondary" href="/productList.html">Back to Products</a>
        </div>
      </div>
    `;

    document.getElementById('addToCartBtn').addEventListener('click', ()=>{
      CartStorage.addItem(p,1);
      showMsg('Product added to cart');
      if(window.updateCartCount) window.updateCartCount();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
