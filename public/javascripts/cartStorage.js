// cartStorage.js - simple localStorage cart helper
(function(window){
  const KEY = 'shop_cart_v1';

  function getCart(){
    const raw = localStorage.getItem(KEY);
    try{
      return raw ? JSON.parse(raw) : [];
    }catch(e){
      return [];
    }
  }

  function saveCart(cart){
    localStorage.setItem(KEY, JSON.stringify(cart));
  }

  function findIndex(cart, id){
    return cart.findIndex(i=>Number(i.id)===Number(id));
  }

  function addItem(product, qty=1){
    const cart = getCart();
    const idx = findIndex(cart, product.id);
    if(idx>-1){
      cart[idx].qty = Number(cart[idx].qty)+Number(qty);
    } else {
      cart.push({id:product.id, title:product.title||product.name, price:product.price, image:product.image, qty:Number(qty)});
    }
    saveCart(cart);
    return cart;
  }

  function updateQty(id, qty){
    const cart = getCart();
    const idx = findIndex(cart, id);
    if(idx>-1){
      cart[idx].qty = Number(qty);
      if(cart[idx].qty<=0) cart.splice(idx,1);
      saveCart(cart);
    }
    return cart;
  }

  function removeItem(id){
    const cart = getCart();
    const idx = findIndex(cart, id);
    if(idx>-1){ cart.splice(idx,1); saveCart(cart); }
    return cart;
  }

  function clearCart(){ localStorage.removeItem(KEY); }

  function getTotals(){
    const cart = getCart();
    const totalItems = cart.reduce((s,i)=>s+Number(i.qty),0);
    const totalAmount = cart.reduce((s,i)=>s + Number(i.qty)*Number(i.price),0);
    return {totalItems, totalAmount};
  }

  window.CartStorage = { getCart, saveCart, addItem, updateQty, removeItem, clearCart, getTotals };
})(window);
