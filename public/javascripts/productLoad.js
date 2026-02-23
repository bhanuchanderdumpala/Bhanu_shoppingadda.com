var singleProductTemplate;
var allProducts = [];

var jwtToken = sessionStorage.getItem("jwtToken"); 
console.log(jwtToken);// Adjust if you use another method

const isDeletePage = window.location.pathname.includes("deleteProduct.html");
const isviewcartpage= window.location.pathname.includes("viewcartdetails.html");

// Load and compile Handlebars template
axios.get('templates/singleProductTmplt.htm')
  .then((response) => {
    singleProductTemplate = Handlebars.compile(response.data);
  })
  .catch((error) => {
    console.error("Failed to load product template", error);
  });

// Reusable function to render product cards
var renderProducts = (products) => {
    $("#productDetailsContainer").html('');
    console.log(products.length + " products found");

     $("#totalProducts").text(products.length);

     const totalPrice = products.reduce((sum, p) => sum + Number(p.price || 0), 0).toFixed(2);
     $("#totalPrice").text(totalPrice);

    
    
    products.forEach((product, index) => {
        product.title = product.title.substr(0, 50);
       
        product.category = (product.category || '').substr(0, 20);
        if (product.category) {
          product.category = product.category.charAt(0).toUpperCase() + product.category.slice(1);
        } 
        
        product.description = product.description.substr(0, 85) + '...';
        product.index = index;
        product.isDeletePage = isDeletePage;
        product.isviewcartpage = isviewcartpage;


        $("#productDetailsContainer").append(singleProductTemplate(product));

        var ratingContainer = `#rating_${index}`;
        addRatingStarsToContainer(product.rating.rate, ratingContainer);
       
    });
};

// Load products from backend
var loadProductsToPage = (userQuery = {}) => {
    $("#productDetailsContainer").html('');

    axios.post('/get/productDetails', userQuery, {headers: { "Authorization": `Bearer ${jwtToken}` }
    }).then((result) => {
        console.log(result.data);
        allProducts = result.data;
        renderProducts(allProducts);
         renderCart();
    }).catch((err) => {
        console.error("Failed to load products", err);
    });
};

// Filter: Price range
var setPriceRange = () => {
    $("#selectedPrice").text($("#priceRangeBar").val());
};

// Filter: Category + Price
var applyFilter = () => {
 
    var userQuery = {};
    userQuery.priceRange = $("#priceRangeBar").val();
    userQuery.categoryList = [];

    var selectedCategory = document.querySelectorAll("#categoryList input:checked");
    selectedCategory.forEach((element) => {
        userQuery.categoryList.push(element.value);
    });

    loadProductsToPage(userQuery);
    
};

var clearFilter = () => {
    
  
    $("#priceRangeBar").val(100);
    $("#selectedPrice").text(100);

    
    $("#categoryList input[type='checkbox']").prop('checked', false);

    // Clear the search input
    $("#search").val("");

    // Reload all products
    loadProductsToPage({});
    window.scrollTo(0, 0);
// Optionally
  alert("Filters cleared")
  
};
// Load category filter checkboxes
var fillCategoryListUnderFilter = () => {
    axios.get('/category/list').then((response) => {
        var categoryList = response.data;
        categoryList.sort((a, b) => a.localeCompare(b));
        categoryList.forEach((category) => {
            var divTag = $("<div/>").addClass("form-check");
            var checkbox = $(`<input type="checkbox" value="${category}" class="form-check-input"/>`);
            var label = $(`<label class="form-check-label">${category}</label>`);
            divTag.append(checkbox).append(label);

            $("#categoryList").append(divTag);
            
           
        });
         const defaultPrice = $("#priceRangeBar").val();
            $("#selectedPrice").text(defaultPrice);

    }).catch((err) => {
        console.error("Failed to load categories", err);
    });
};
// Sort by Title
var sortByTitle = (order) => {
    if (!order || !allProducts) return;

    allProducts.sort((a, b) => {
        const titleA = a.title.toUpperCase();
        const titleB = b.title.toUpperCase();
        return order === 'asc' ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
    });

    renderProducts(allProducts);
    
};

// Sort by Price
var sortByPrice = (order) => {
    if (!order || !allProducts) return;

    allProducts.sort((a, b) => {
        return order === 'lowHigh' ? a.price - b.price : b.price - a.price;
    });

    renderProducts(allProducts);
   
};

function toggleCart() {
  const cartSection = document.getElementById('cartSection');
  const toggleBtn = document.getElementById('toggleCartBtn');

  const isHidden = cartSection.style.display === 'none' || cartSection.style.display === '';

  if (isHidden) {
    renderCart();
    cartSection.style.display = 'block';
    toggleBtn.textContent = "❌ Close Cart";
  } else {
    cartSection.style.display = 'none';
    toggleBtn.textContent = "🛒 View Cart";
  }
}

function addToCart(id, title, price) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, title, price: parseFloat(price), quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  if (cart.length > 0) {
    document.getElementById('cartSection').style.display = 'block';
    document.getElementById('toggleCartBtn').textContent = "❌ Close Cart";
  }
  renderCart();
  

  
  alert(`${title} added to cart`);
  const isHidden = cartSection.style.display === 'none' || cartSection.style.display === '';
  if (isHidden) toggleCart();
}

function renderCart() {
  const cartBody = document.getElementById('cartBody');
  const totalItemsEl = document.getElementById('totalItems');
  const totalAmountEl = document.getElementById('totalAmount');
  

  cartBody.innerHTML = '';
  let totalItems = 0;
  let totalAmount = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.title}</td>
      <td>₹ ${item.price.toFixed(2)}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="updateQuantity('${item.id}', -1)">➖</button>
        <span style="margin: 0 8px;">${item.quantity}</span>
        <button class="btn btn-sm btn-secondary" onclick="updateQuantity('${item.id}', 1)">➕</button>
      </td>
      <td>₹ ${itemTotal.toFixed(2)}</td>
      <td>
        <button onclick="removeFromCart('${item.id}')" class="btn btn-sm btn-danger">🗑️</button>
      </td>
    `;
    cartBody.appendChild(row);

    totalItems += item.quantity;
    totalAmount += itemTotal;
  });

  totalItemsEl.textContent = totalItems;
  totalAmountEl.textContent = totalAmount.toFixed(2);
  
ensureCartVisibleIfItemsExist();






}
function updateQuantity(id, delta) {
  const item = cart.find(p => p.id === id);
  if (!item) return;

  item.quantity += delta;


  if (item.quantity < 1) {
    if (confirm("Quantity is 0. Do you want to remove this item?")) {
      cart = cart.filter(p => p.id !== id);
    } else {
      item.quantity = 1;
    }
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart(); // refresh UI
}



function ensureCartVisibleIfItemsExist() {
const cart = JSON.parse(localStorage.getItem('cart')) || [];
if (cart.length > 0) {
document.getElementById('cartSection').style.display = 'block';
document.getElementById('toggleCartBtn').textContent = "❌ Close Cart"; }
}


cart = JSON.parse(localStorage.getItem('cart')) || [];
$(document).ready(() => {
  renderCart();
  // Avoid loading product lists on the Add New Product page
  const path = window.location.pathname || '';
  if (!path.includes('addNewProduct.html')) {
    fillCategoryListUnderFilter();
    loadProductsToPage();
  }
});


function clearCart() {
  // Clear cart data from memory and localStorage
  cart = [];
  
  localStorage.removeItem('cart');

  // Clear cart UI
  const cartBody = document.getElementById('cartBody');
  const totalItemsEl = document.getElementById('totalItems');
  const totalAmountEl = document.getElementById('totalAmount');
  const cartSection = document.getElementById('cartSection');
  const toggleBtn = document.getElementById('toggleCartBtn');

  if (cartBody) cartBody.innerHTML = '';
  if (totalItemsEl) totalItemsEl.textContent = '0';
  if (totalAmountEl) totalAmountEl.textContent = '0.00';
  if (cartSection) cartSection.style.display = 'none';
  if (toggleBtn) toggleBtn.textContent = "🛒 View Cart";
}
