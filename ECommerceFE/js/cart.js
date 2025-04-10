/**
 * cart.js - Quản lý giỏ hàng
 */

// Class Cart
class Cart {
  /**
   * Khởi tạo giỏ hàng
   */
  static init() {
    console.log('Khởi tạo giỏ hàng');
    // Tải dữ liệu giỏ hàng từ localStorage
    this.loadCart();
    
    // Thiết lập sự kiện giỏ hàng
    this.setupCartEvents();
    
    // Cập nhật UI giỏ hàng
    this.updateCartUI();
    
    console.log('Đã khởi tạo giỏ hàng với', this.items.length, 'sản phẩm');
  }

  /**
   * Tải dữ liệu giỏ hàng từ localStorage
   */
  static loadCart() {
    try {
      // Lấy dữ liệu giỏ hàng từ localStorage
      const cartData = localStorage.getItem('cart');
      
      // Nếu có dữ liệu giỏ hàng
      if (cartData) {
        this.items = JSON.parse(cartData);
      } else {
        this.items = [];
      }
    } catch (error) {
      console.error('Lỗi khi tải giỏ hàng:', error);
      this.items = [];
    }
  }

  /**
   * Lưu giỏ hàng vào localStorage
   */
  static saveCart() {
    try {
      localStorage.setItem('cart', JSON.stringify(this.items));
    } catch (error) {
      console.error('Lỗi khi lưu giỏ hàng:', error);
      UI.createNotification('Không thể lưu giỏ hàng. Vui lòng thử lại sau.', 'error');
    }
  }

  /**
   * Thiết lập sự kiện giỏ hàng
   */
  static setupCartEvents() {
    // Thiết lập sự kiện cho dropdown giỏ hàng
    this.setupCartDropdownEvents();
    
    // Xử lý sự kiện trên trang chi tiết sản phẩm
    const addToCartBtn = document.getElementById('add-to-cart');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.addItemFromProductPage();
      });
    }

    // Xử lý sự kiện mở giỏ hàng
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
      cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleCartMenu();
      });
    }

    // Xử lý sự kiện trong trang giỏ hàng
    const cartPage = document.getElementById('cart-page');
    if (cartPage) {
      // Cập nhật giỏ hàng khi thay đổi số lượng
      const quantityInputs = document.querySelectorAll('.cart-quantity-input');
      quantityInputs.forEach(input => {
        input.addEventListener('change', (e) => {
          const itemId = e.target.dataset.id;
          const newQuantity = parseInt(e.target.value);
          
          if (newQuantity < 1) {
            e.target.value = 1;
            this.updateItemQuantity(itemId, 1);
          } else {
            this.updateItemQuantity(itemId, newQuantity);
          }
        });
      });

      // Xử lý nút xóa sản phẩm khỏi giỏ hàng
      const removeButtons = document.querySelectorAll('.remove-item-btn');
      removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const itemId = e.target.dataset.id;
          this.removeItem(itemId);
        });
      });

      // Xử lý nút tiếp tục mua sắm
      const continueShoppingBtn = document.getElementById('continue-shopping');
      if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
          window.location.href = 'products.html';
        });
      }

      // Xử lý nút thanh toán
      const checkoutBtn = document.getElementById('checkout-btn');
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
          this.proceedToCheckout();
        });
      }
    }
  }

  /**
   * Thêm sản phẩm vào giỏ hàng từ trang chi tiết sản phẩm
   */
  static addItemFromProductPage() {
    // Lấy thông tin sản phẩm từ trang chi tiết
    const productIdElement = document.getElementById('product-id');
    const productNameElement = document.getElementById('product-name');
    const productPriceElement = document.getElementById('product-price');
    const productImageElement = document.getElementById('product-main-image');
    const quantityElement = document.getElementById('product-quantity');
    
    if (!productIdElement) {
      console.error('Không tìm thấy element product-id');
      UI.createNotification('Không thể thêm sản phẩm vào giỏ hàng. Thiếu thông tin sản phẩm.', 'error');
      return;
    }

    const productId = productIdElement.value;
    
    if (!productId) {
      UI.createNotification('Không thể thêm sản phẩm vào giỏ hàng. ID sản phẩm không hợp lệ.', 'error');
      return;
    }

    // Kiểm tra các phần tử khác
    if (!productNameElement) {
      console.error('Không tìm thấy element product-name');
      UI.createNotification('Không thể thêm sản phẩm vào giỏ hàng. Thiếu tên sản phẩm.', 'error');
      return;
    }
    
    if (!productPriceElement) {
      console.error('Không tìm thấy element product-price');
      UI.createNotification('Không thể thêm sản phẩm vào giỏ hàng. Thiếu giá sản phẩm.', 'error');
      return;
    }
    
    if (!productImageElement) {
      console.error('Không tìm thấy element product-main-image');
      // Vẫn tiếp tục vì hình ảnh có thể không bắt buộc
    }

    const productName = productNameElement.textContent;
    const productPrice = productPriceElement.dataset.price ? 
      parseFloat(productPriceElement.dataset.price) : 
      parseFloat(productPriceElement.textContent.replace(/[^\d.-]/g, ''));
    const productImage = productImageElement ? productImageElement.src : 'img/default-product.jpg';
    const quantity = quantityElement ? parseInt(quantityElement.value || 1) : 1;

    // Kiểm tra số lượng hợp lệ
    if (isNaN(quantity) || quantity < 1) {
      UI.createNotification('Số lượng sản phẩm không hợp lệ.', 'error');
      return;
    }

    // Kiểm tra giá hợp lệ
    if (isNaN(productPrice) || productPrice < 0) {
      UI.createNotification('Giá sản phẩm không hợp lệ.', 'error');
      return;
    }

    // Thêm vào giỏ hàng
    this.addItem({
      id: productId,
      name: productName,
      price: productPrice,
      image: productImage,
      quantity: quantity
    });
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param {Object} item - Sản phẩm cần thêm vào giỏ hàng
   */
  static addItem(item) {
    if (!item || !item.id) {
      UI.createNotification('Không thể thêm sản phẩm vào giỏ hàng.', 'error');
      return;
    }

    // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
    const existingItem = this.items.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
      // Nếu sản phẩm đã tồn tại, tăng số lượng
      existingItem.quantity += item.quantity;
    } else {
      // Nếu sản phẩm chưa tồn tại, thêm vào giỏ hàng
      this.items.push(item);
    }

    // Lưu giỏ hàng
    this.saveCart();

    // Cập nhật UI
    this.updateCartUI();

    // Hiển thị thông báo
    UI.createNotification('Đã thêm sản phẩm vào giỏ hàng.', 'success');
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   * @param {string} itemId - ID của sản phẩm
   * @param {number} quantity - Số lượng mới
   */
  static updateItemQuantity(itemId, quantity) {
    if (!itemId) return;

    // Tìm sản phẩm trong giỏ hàng
    const itemIndex = this.items.findIndex(item => item.id === itemId);

    if (itemIndex !== -1) {
      // Cập nhật số lượng
      this.items[itemIndex].quantity = quantity;

      // Lưu giỏ hàng
      this.saveCart();

      // Cập nhật UI
      this.updateCartUI();
    }
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * @param {string} itemId - ID của sản phẩm
   */
  static removeItem(itemId) {
    if (!itemId) return;

    // Xác nhận xóa
    UI.confirmDialog('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?', () => {
      // Lọc ra danh sách sản phẩm không chứa sản phẩm cần xóa
      this.items = this.items.filter(item => item.id !== itemId);

      // Lưu giỏ hàng
      this.saveCart();

      // Cập nhật UI
      this.updateCartUI();

      // Hiển thị thông báo
      UI.createNotification('Đã xóa sản phẩm khỏi giỏ hàng.', 'success');
    });
  }

  /**
   * Xóa tất cả sản phẩm khỏi giỏ hàng
   */
  static clearCart() {
    // Xác nhận xóa tất cả
    UI.confirmDialog('Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?', () => {
      // Xóa tất cả sản phẩm
      this.items = [];

      // Lưu giỏ hàng
      this.saveCart();

      // Cập nhật UI
      this.updateCartUI();

      // Hiển thị thông báo
      UI.createNotification('Đã xóa tất cả sản phẩm khỏi giỏ hàng.', 'success');
    });
  }

  /**
   * Đếm số lượng sản phẩm trong giỏ hàng
   * @returns {number} - Tổng số sản phẩm trong giỏ hàng
   */
  static getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Lấy tổng số lượng sản phẩm trong giỏ hàng
   * @returns {number} Tổng số lượng
   */
  static getTotalQuantity() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Tính tổng giá trị giỏ hàng
   * @returns {number} - Tổng giá trị giỏ hàng
   */
  static getTotalPrice() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  /**
   * Hiển thị/ẩn menu giỏ hàng
   */
  static toggleCartMenu() {
    const cartMenu = document.getElementById('cart-dropdown');
    if (cartMenu) {
      cartMenu.classList.toggle('active');
    }
  }

  /**
   * Cập nhật UI giỏ hàng
   */
  static updateCartUI() {
    console.log('Cập nhật UI giỏ hàng');
    // Cập nhật biểu tượng giỏ hàng trong header
    this.updateCartIcon();
    
    // Cập nhật dropdown giỏ hàng trong header
    this.updateCartDropdown();

    // Cập nhật trang giỏ hàng (nếu đang ở trang giỏ hàng)
    this.updateCartPage();
  }

  /**
   * Cập nhật biểu tượng giỏ hàng trên header
   */
  static updateCartIcon() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      const totalQuantity = this.getTotalQuantity();
      cartCount.textContent = totalQuantity.toString();
      
      // Luôn hiển thị số lượng giỏ hàng (số 0 hoặc số lượng sản phẩm)
      cartCount.style.display = 'flex';
    } else {
      console.error('Không tìm thấy phần tử cart-count trong HTML');
    }
  }

  /**
   * Cập nhật dropdown giỏ hàng trong header
   */
  static updateCartDropdown() {
    const cartItemContainer = document.querySelector('.cart-dropdown .cart-item-container');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const cartTotalAmount = document.getElementById('cartTotalAmount');
    
    if (!cartItemContainer) return;
    
    // Xóa các sản phẩm hiện tại trong dropdown (trừ thông báo giỏ hàng trống)
    const existingItems = cartItemContainer.querySelectorAll('.cart-dropdown-item');
    existingItems.forEach(item => item.remove());
    
    // Hiển thị thông báo giỏ hàng trống nếu không có sản phẩm
    if (this.items.length === 0) {
      if (emptyCartMessage) {
        emptyCartMessage.style.display = 'block';
      }
    } else {
      if (emptyCartMessage) {
        emptyCartMessage.style.display = 'none';
      }
      
      // Thêm các sản phẩm vào dropdown
      this.items.slice(0, 3).forEach(item => { // Chỉ hiển thị tối đa 3 sản phẩm
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-dropdown-item';
        cartItem.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-details">
            <h4 class="cart-item-name">${item.name}</h4>
            <div class="cart-item-price">${this.formatCurrency(item.price)} x ${item.quantity}</div>
          </div>
          <button class="cart-item-remove" data-id="${item.id}">&times;</button>
        `;
        
        cartItemContainer.appendChild(cartItem);
      });
      
      // Thêm thông báo nếu có nhiều hơn 3 sản phẩm
      if (this.items.length > 3) {
        const moreItems = document.createElement('div');
        moreItems.className = 'more-items-message';
        moreItems.textContent = `+ ${this.items.length - 3} sản phẩm khác`;
        cartItemContainer.appendChild(moreItems);
      }
    }
    
    // Cập nhật tổng tiền
    if (cartTotalAmount) {
      cartTotalAmount.textContent = this.formatCurrency(this.getTotalPrice());
    }
    
    // Thiết lập sự kiện xóa sản phẩm
    const removeButtons = document.querySelectorAll('.cart-dropdown-item .cart-item-remove');
    removeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const itemId = button.getAttribute('data-id');
        this.removeItem(itemId);
      });
    });
  }

  /**
   * Thiết lập sự kiện cho dropdown giỏ hàng
   */
  static setupCartDropdownEvents() {
    const headerCart = document.querySelector('.header-cart');
    
    if (headerCart) {
      // Hiển thị dropdown khi hover vào giỏ hàng
      headerCart.addEventListener('mouseenter', () => {
        const dropdown = headerCart.querySelector('.cart-dropdown');
        if (dropdown) {
          dropdown.classList.add('active');
        }
      });
      
      // Ẩn dropdown khi rời khỏi giỏ hàng
      headerCart.addEventListener('mouseleave', () => {
        const dropdown = headerCart.querySelector('.cart-dropdown');
        if (dropdown) {
          dropdown.classList.remove('active');
        }
      });
    }
  }

  /**
   * Cập nhật trang giỏ hàng
   */
  static updateCartPage() {
    const cartPage = document.getElementById('cart-page');
    if (!cartPage) return;

    const cartTableBody = document.getElementById('cart-items');
    if (!cartTableBody) return;

    // Xóa nội dung cũ
    cartTableBody.innerHTML = '';

    if (this.items.length === 0) {
      // Hiển thị thông báo giỏ hàng trống
      cartPage.innerHTML = `
        <div class="empty-cart-page">
          <div class="empty-cart-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục.</p>
          <a href="products.html" class="btn btn-primary">Tiếp tục mua sắm</a>
        </div>
      `;
    } else {
      // Tạo HTML cho các sản phẩm trong giỏ hàng
      this.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="cart-image">
            <img src="${item.image}" alt="${item.name}">
          </td>
          <td class="cart-name">
            <h4>${item.name}</h4>
          </td>
          <td class="cart-price">${this.formatCurrency(item.price)}</td>
          <td class="cart-quantity">
            <div class="quantity-control">
              <button class="quantity-btn decrease" data-id="${item.id}">-</button>
              <input type="number" class="cart-quantity-input" data-id="${item.id}" value="${item.quantity}" min="1">
              <button class="quantity-btn increase" data-id="${item.id}">+</button>
            </div>
          </td>
          <td class="cart-total">${this.formatCurrency(itemTotal)}</td>
          <td class="cart-actions">
            <button class="remove-item-btn" data-id="${item.id}">&times;</button>
          </td>
        `;
        
        cartTableBody.appendChild(tr);
      });

      // Cập nhật tổng giá trị
      const subtotalElement = document.getElementById('cart-subtotal');
      const totalElement = document.getElementById('cart-total');
      
      if (subtotalElement) {
        subtotalElement.textContent = this.formatCurrency(this.getTotalPrice());
      }
      
      if (totalElement) {
        totalElement.textContent = this.formatCurrency(this.getTotalPrice());
      }

      // Thiết lập sự kiện nút tăng/giảm số lượng
      const decreaseButtons = document.querySelectorAll('.quantity-btn.decrease');
      const increaseButtons = document.querySelectorAll('.quantity-btn.increase');
      const quantityInputs = document.querySelectorAll('.cart-quantity-input');
      const removeButtons = document.querySelectorAll('.remove-item-btn');

      decreaseButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const itemId = e.target.dataset.id;
          const input = document.querySelector(`.cart-quantity-input[data-id="${itemId}"]`);
          
          if (input) {
            let value = parseInt(input.value) - 1;
            if (value < 1) value = 1;
            input.value = value;
            this.updateItemQuantity(itemId, value);
          }
        });
      });

      increaseButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const itemId = e.target.dataset.id;
          const input = document.querySelector(`.cart-quantity-input[data-id="${itemId}"]`);
          
          if (input) {
            let value = parseInt(input.value) + 1;
            input.value = value;
            this.updateItemQuantity(itemId, value);
          }
        });
      });

      quantityInputs.forEach(input => {
        input.addEventListener('change', (e) => {
          const itemId = e.target.dataset.id;
          let value = parseInt(e.target.value);
          
          if (isNaN(value) || value < 1) {
            value = 1;
            e.target.value = 1;
          }
          
          this.updateItemQuantity(itemId, value);
        });
      });

      removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const itemId = e.target.dataset.id;
          this.removeItem(itemId);
        });
      });
    }
  }

  /**
   * Định dạng tiền tệ
   * @param {number} amount - Số tiền cần định dạng
   * @returns {string} - Chuỗi đã định dạng
   */
  static formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Chuyển đến trang thanh toán
   */
  static proceedToCheckout() {
    // Kiểm tra xem giỏ hàng có sản phẩm không
    if (this.items.length === 0) {
      UI.createNotification('Giỏ hàng của bạn đang trống.', 'error');
      return;
    }

    // Kiểm tra đăng nhập trước khi thanh toán
    if (!Auth || !Auth.isLoggedIn()) {
      // Lưu URL để redirect sau khi đăng nhập
      localStorage.setItem('redirectAfterLogin', 'checkout.html');
      
      // Hiển thị thông báo và chuyển đến trang đăng nhập
      UI.createNotification('Vui lòng đăng nhập để tiếp tục thanh toán.', 'info');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
      return;
    }

    // Chuyển đến trang thanh toán
    window.location.href = 'checkout.html';
  }
}

// Khởi tạo giỏ hàng với một mảng rỗng
Cart.items = [];

// Khởi tạo giỏ hàng khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
});

// Export
window.Cart = Cart; 