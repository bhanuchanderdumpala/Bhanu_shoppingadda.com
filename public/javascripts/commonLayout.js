// commonLayout.js - injects header/footer and keeps cart count updated
(function(){
  function createHeader(){
    return `
      <header class="p-3 header1 fixed-top">
        <div class="container">
          <div class="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
            <a href="/" class="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none">
              <img src="/images/logo1.png" alt="Logo" class="pageLogo">
            </a>
            <span class="fs-4 text-white ms-2">ShopInHand</span>

            <ul class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0 listbold ms-4">
              <li><a href="/index.html" class="nav-link px-2 text-white">Home</a></li>
              <li><a href="#" class="nav-link px-2 text-white">Features</a></li>
              <li><a href="#" class="nav-link px-2 text-white">Pricing</a></li>
              <li><a href="#" class="nav-link px-2 text-white">FAQs</a></li>
              <li><a href="#" class="nav-link px-2 text-white">About</a></li>
            </ul>

            <form class="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3" onsubmit="event.preventDefault(); window.location='/productList.html';">
              <input type="search" id="siteSearch" class="form-control form-control-dark search1" placeholder="Search...Search for products">
            </form>

            <div class="text-end">
              <a class="btn btn-outline-primary position-relative me-2" href="/cart.html">
                Cart <span id="cartCountBadge" class="badge bg-danger ms-2">0</span>
              </a>
              <button class="btn btn-primary" id="loginBtn" data-bs-toggle="modal" data-bs-target="#loginModal">LOGIN</button>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  function createFooter(){
    const year = new Date().getFullYear();
    return `
      <footer class="container-fluid footer1 py-4 mt-5 border-top">
        <div class="container">
          <div class="row mb-4 text-center">
            <div class="col">
              <h5 class="text-primary">Connecting Buyers and Sellers, One Click at a Time!</h5>
            </div>
            <div class="footer-quote text-center text-light fs-5 fw-semibold mt-4">Discover Deals, Find Needs — All at Your Fingertips.</div>
          </div>
          <div class="row mb-4 text-center">
            <div class="col">
              <ul class="nav justify-content-center flex-wrap text-bold on-overflow-auto">
                <li class="nav-item"><a href="#" class="nav-link px-2 text-white">Home</a></li>
                <li class="nav-item"><a href="#" class="nav-link px-2 text-white">Features</a></li>
                <li class="nav-item"><a href="#" class="nav-link px-2 text-white">Pricing</a></li>
                <li class="nav-item"><a href="#" class="nav-link px-2 text-white">FAQs</a></li>
                <li class="nav-item"><a href="#" class="nav-link px-2 text-white">About</a></li>
              </ul>
            </div>
          </div>
          <div class="row right-end-footer">
            <div class="col text-right">
              <p class="text-body-secondary mb-0">© ${year} <strong>ShopInHand</strong>. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  function insertIfMissing(id, html, where='body', position='afterbegin'){
    let el = document.getElementById(id);
    if(!el){
      el = document.createElement('div'); el.id = id;
      if(where==='body') document.body.insertAdjacentElement(position, el);
      else document.querySelector(where).insertAdjacentElement(position, el);
    }
    el.innerHTML = html;
  }

  function updateCartCount(){
    try{
      if(typeof CartStorage !== 'undefined' && CartStorage.getTotals){
        const t = CartStorage.getTotals();
        const badge = document.getElementById('cartCountBadge');
        if(badge) badge.textContent = t.totalItems || 0;
      }
    }catch(e){ console.error(e); }
  }

  // wrap CartStorage methods to ensure badge updates when called
  function wrapCartMethods(){
    if(typeof CartStorage==='undefined') return;
    ['addItem','removeItem','updateQty','clearCart','saveCart'].forEach(name=>{
      if(typeof CartStorage[name]==='function'){
        const orig = CartStorage[name];
        CartStorage[name] = function(...args){
          const res = orig.apply(this,args);
          try{ updateCartCount(); }catch(e){}
          return res;
        };
      }
    });
  }

  function onLoad(){
    // insert header/footer
    insertIfMissing('siteHeader', createHeader());
    insertIfMissing('siteFooter', createFooter(), 'body', 'beforeend');
    // insert login/signup modals (if not already present)
    if(!document.getElementById('loginModal')){
      const modalHtml = `
        <div class="modal" tabindex="-1" id="loginModal">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header"><h5 class="modal-title">Login</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
              <div class="modal-body">
                <ul class="logincontrols">
                  <li><input id="userAccountId" type="text" class="form-control" placeholder="User Account Id"></li>
                  <li><input id="accountPassword" type="password" class="form-control" placeholder="Account Password"></li>
                  <li><input type="checkbox" id="rememberMeCheckbox" checked> Save My Credentials</li>
                  <li class="row"><div class="captchaBlock col"></div><i class="bi bi-arrow-clockwise col" onclick="addCaptchaText()"></i></li>
                  <li><input id="captchaText" type="text" class="form-control" placeholder="Enter Captcha"></li>
                </ul>
              </div>
              <div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="validateUserCredentials()">Login</button></div>
            </div>
          </div>
        </div>`;
      const tmp = document.createElement('div'); tmp.innerHTML = modalHtml; document.body.appendChild(tmp.firstElementChild);
    }
    // small offset fix so page content isn't hidden behind fixed header
    document.body.style.paddingTop = '70px';
    // register storage listener
    window.addEventListener('storage', (e)=>{ if(e.key==='shop_cart_v1') updateCartCount(); });
    wrapCartMethods();
    updateCartCount();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', onLoad);
  else onLoad();

  // expose for external use
  window.updateCartCount = updateCartCount;
})();
