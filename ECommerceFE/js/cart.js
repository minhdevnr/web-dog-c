/**
 * Xử lý giỏ hàng
 */

// Khởi tạo giỏ hàng từ localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Hiển thị số lượng sản phẩm trong giỏ hàng
function updateCartCount() {
  const cartCount = document.querySelector('.cart-count');
  if (cartCount) {
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  }
}

// Thêm sản phẩm vào giỏ hàng
function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }
  
  // Lưu giỏ hàng vào localStorage
  saveCart();
  
  // Cập nhật UI
  updateCartCount();
  renderCartItems();
  
  // Hiển thị thông báo
  showSuccess('Đã thêm sản phẩm vào giỏ hàng');
}

// Xóa sản phẩm khỏi giỏ hàng
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  
  // Lưu giỏ hàng vào localStorage
  saveCart();
  
  // Cập nhật UI
  updateCartCount();
  renderCartItems();
  
  // Cập nhật trang giỏ hàng nếu đang ở trang đó
  if (document.querySelector('.cart-section')) {
    renderCartPage();
  }
}

// Cập nhật số lượng sản phẩm
function updateQuantity(productId, quantity) {
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
      saveCart();
      updateCartCount();
      renderCartItems();
      
      // Cập nhật trang giỏ hàng nếu đang ở trang đó
      if (document.querySelector('.cart-section')) {
        renderCartPage();
      }
    }
  }
}

// Lưu giỏ hàng vào localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Tính tổng giá trị đơn hàng
function calculateTotal() {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Hiển thị giỏ hàng trong dropdown
function renderCartItems() {
  const cartContainer = document.querySelector('.cart-item-container');
  
  if (!cartContainer) return;
  
  // Xóa tất cả sản phẩm hiện có
  const existingItems = cartContainer.querySelectorAll('.cart-item');
  existingItems.forEach(item => item.remove());
  
  // Thêm các sản phẩm mới
  if (cart.length === 0) {
    // Nếu giỏ hàng trống
    const emptyCart = document.createElement('div');
    emptyCart.className = 'empty-cart';
    emptyCart.innerHTML = '<p>Giỏ hàng trống</p>';
    
    // Thêm vào trước nút Thanh toán
    const checkoutButton = cartContainer.querySelector('.btn');
    cartContainer.insertBefore(emptyCart, checkoutButton);
    
    // Ẩn nút thanh toán
    if (checkoutButton) {
      checkoutButton.style.display = 'none';
    }
  } else {
    // Hiển thị các sản phẩm
    cart.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <span class="fa fa-times" data-id="${item.id}"></span>
        <img src="${item.image}" alt="${item.name}" width="100px" height="100px" />
        <div class="content">
          <h3>${item.name}</h3>
          <div class="price">${formatCurrency(item.price)} x ${item.quantity}</div>
          <div class="quantity-control">
            <button class="quantity-btn minus" data-id="${item.id}">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn plus" data-id="${item.id}">+</button>
          </div>
        </div>
      `;
      
      // Thêm vào trước nút Thanh toán
      const checkoutButton = cartContainer.querySelector('.btn');
      cartContainer.insertBefore(cartItem, checkoutButton);
      
      // Hiển thị nút thanh toán
      if (checkoutButton) {
        checkoutButton.style.display = 'block';
      }
    });
    
    // Thêm tổng tiền
    const totalElement = document.createElement('div');
    totalElement.className = 'cart-total';
    totalElement.innerHTML = `<span>Tổng tiền:</span> <span>${formatCurrency(calculateTotal())}</span>`;
    
    const checkoutButton = cartContainer.querySelector('.btn');
    cartContainer.insertBefore(totalElement, checkoutButton);
    
    // Đăng ký sự kiện click cho nút xóa
    document.querySelectorAll('.cart-item .fa-times').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        removeFromCart(productId);
      });
    });
    
    // Đăng ký sự kiện cho nút tăng/giảm số lượng
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        const item = cart.find(item => item.id === productId);
        if (item && item.quantity > 1) {
          updateQuantity(productId, item.quantity - 1);
        }
      });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        const item = cart.find(item => item.id === productId);
        if (item) {
          updateQuantity(productId, item.quantity + 1);
        }
      });
    });
  }
}

// Render trang giỏ hàng đầy đủ
function renderCartPage() {
  const cartItemsContainer = document.getElementById('cart-items');
  const itemCountElement = document.getElementById('item-count');
  const totalCostElement = document.getElementById('total-cost');
  const checkoutButton = document.getElementById('checkout-button');
  
  if (!cartItemsContainer) return;
  
  cartItemsContainer.innerHTML = '';
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart-message">Giỏ hàng của bạn đang trống</p>';
    itemCountElement.textContent = '0';
    totalCostElement.textContent = '0';
    checkoutButton.style.display = 'none';
  } else {
    let itemCount = 0;
    
    cart.forEach(item => {
      itemCount += item.quantity;
      const cartItemElement = document.createElement('div');
      cartItemElement.className = 'cart-product';
      cartItemElement.innerHTML = `
        <div class="cart-product-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-product-details">
          <h3>${item.name}</h3>
          <p class="cart-product-price">${formatCurrency(item.price)}</p>
        </div>
        <div class="cart-product-quantity">
          <button class="quantity-btn minus" data-id="${item.id}">-</button>
          <input type="number" value="${item.quantity}" min="1" max="99" data-id="${item.id}" class="quantity-input">
          <button class="quantity-btn plus" data-id="${item.id}">+</button>
        </div>
        <div class="cart-product-subtotal">
          ${formatCurrency(item.price * item.quantity)}
        </div>
        <button class="remove-product" data-id="${item.id}">
          <i class="fa fa-trash"></i>
        </button>
      `;
      
      cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Cập nhật tổng tiền và số lượng sản phẩm
    itemCountElement.textContent = itemCount;
    totalCostElement.textContent = formatCurrency(calculateTotal());
    checkoutButton.style.display = 'block';
    
    // Đăng ký sự kiện cho các nút
    document.querySelectorAll('.cart-product .remove-product').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        removeFromCart(productId);
      });
    });
    
    document.querySelectorAll('.cart-product .quantity-btn.minus').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        const item = cart.find(item => item.id === productId);
        if (item && item.quantity > 1) {
          updateQuantity(productId, item.quantity - 1);
        }
      });
    });
    
    document.querySelectorAll('.cart-product .quantity-btn.plus').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        const item = cart.find(item => item.id === productId);
        if (item) {
          updateQuantity(productId, item.quantity + 1);
        }
      });
    });
    
    document.querySelectorAll('.cart-product .quantity-input').forEach(input => {
      input.addEventListener('change', function() {
        const productId = this.getAttribute('data-id');
        const quantity = parseInt(this.value);
        if (!isNaN(quantity) && quantity > 0) {
          updateQuantity(productId, quantity);
        } else {
          this.value = 1;
          updateQuantity(productId, 1);
        }
      });
    });
  }
}

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  renderCartItems();
  
  // Kiểm tra nếu đang ở trang giỏ hàng
  if (document.querySelector('.cart-section')) {
    renderCartPage();
  }
  
  // Thêm sự kiện cho các nút "Thêm vào giỏ hàng"
  document.querySelectorAll('.box-menu .btn, .box .fa-shopping-cart').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const productElement = this.closest('.box-menu') || this.closest('.box');
      if (!productElement) return;
      
      const name = productElement.querySelector('h3')?.textContent;
      let price = productElement.querySelector('.price')?.textContent;
      const image = productElement.querySelector('img')?.src;
      
      // Xử lý giá: lấy số đầu tiên nếu có 2 số (ví dụ: "20.000 15.000" => lấy 15.000)
      if (price) {
        const priceNumbers = price.match(/(\d+[\d\.,]*)/g);
        if (priceNumbers && priceNumbers.length > 1) {
          price = priceNumbers[1].replace(/[^\d]/g, '');
        } else if (priceNumbers) {
          price = priceNumbers[0].replace(/[^\d]/g, '');
        }
      }
      
      if (name && price && image) {
        const product = {
          id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
          name: name,
          price: parseFloat(price),
          image: image
        };
        
        addToCart(product);
      }
    });
  });
  
  // Thêm sự kiện cho nút giỏ hàng
  const cartBtn = document.getElementById('cart-btn');
  if (cartBtn) {
    cartBtn.addEventListener('click', function() {
      const cartContainer = document.querySelector('.cart-item-container');
      if (cartContainer) {
        cartContainer.classList.toggle('active');
      }
    });
  }
}); 