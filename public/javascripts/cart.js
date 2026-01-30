// cart.js - render cart page and handle place order
(function(){
  const area = document.getElementById('cartArea');

  function formatRow(i, item){
    return `<tr data-id="${item.id}">
      <th scope="row">${i+1}</th>
      <td>${escapeHtml(item.title)}</td>
      <td>₹${Number(item.price).toFixed(2)}</td>
      <td><input type="number" min="1" value="${item.qty}" class="form-control qty-input" style="width:90px" /></td>
      <td>₹${(Number(item.price)*Number(item.qty)).toFixed(2)}</td>
      <td><button class="btn btn-danger btn-sm remove-btn">Remove</button></td>
    </tr>`;
  }

  function escapeHtml(s){ return String(s).replace(/[&<>\"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"})[c]); }

  function render(){
    const cart = CartStorage.getCart();
    if(!cart || cart.length===0){
      area.innerHTML = `<div class="alert alert-info">Your cart is empty. <a href="/productList.html">Add products</a></div>`; return;
    }

    const totals = CartStorage.getTotals();
    let html = `
      <div class="table-responsive">
      <table class="table table-bordered">
        <thead class="table-light"><tr><th>S.No</th><th>Product</th><th>Price</th><th>Qty</th><th>Item Total</th><th>Action</th></tr></thead>
        <tbody>
          ${cart.map((it,i)=>formatRow(i,it)).join('')}
        </tbody>
      </table>
      </div>
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <strong>Total Items:</strong> ${totals.totalItems}
        </div>
        <div>
          <strong>Total Amount:</strong> ₹${totals.totalAmount.toFixed(2)}
          <button id="placeOrderBtn" class="btn btn-success ms-3">Place Order</button>
          <a href="/productList.html" class="btn btn-outline-secondary ms-2">Add More Products</a>
        </div>
      </div>
    `;
    area.innerHTML = html;
    bind();
    if(window.updateCartCount) window.updateCartCount();
  }

  function bind(){
    area.querySelectorAll('.remove-btn').forEach(b=>{
      b.addEventListener('click', e=>{
        const tr = e.target.closest('tr'); const id = tr.getAttribute('data-id');
        CartStorage.removeItem(id); render();
      });
    });

    area.querySelectorAll('.qty-input').forEach(inp=>{
      inp.addEventListener('change', e=>{
        const tr = e.target.closest('tr'); const id = tr.getAttribute('data-id');
        const v = Number(e.target.value) || 1; CartStorage.updateQty(id, v); render();
      });
    });

    const placeBtn = document.getElementById('placeOrderBtn');
    if(placeBtn){
      placeBtn.addEventListener('click', ()=>{
        const totals = CartStorage.getTotals();
        if(totals.totalItems===0){ alert('Cart is empty'); return; }
        // Simulate order placement
        if(confirm(`Place order for ₹${totals.totalAmount.toFixed(2)}?`)){
          CartStorage.clearCart();
          area.innerHTML = `<div class="alert alert-success">Order placed successfully. <a href="/productList.html">Continue shopping</a></div>`;
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', render);
})();
