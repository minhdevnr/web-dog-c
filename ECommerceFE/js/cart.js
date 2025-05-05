/**
 * cart.js - Quản lý giỏ hàng
 */

// Class Cart
class Cart {
  /**
   * Khởi tạo giỏ hàng
   */
  static init() {
    console.log('===== Khởi tạo giỏ hàng =====');

    // Đảm bảo Cart.items có giá trị mặc định
    if (!this.items) {
      console.log('DEBUG: Cart.items chưa được khởi tạo, tạo mảng rỗng');
      this.items = [];
    }

    // Tải dữ liệu giỏ hàng từ localStorage
    this.loadCart();

    // Thiết lập sự kiện giỏ hàng
    this.setupCartEvents();

    // Đảm bảo this.items là một mảng
    if (!Array.isArray(this.items)) {
      console.error('DEBUG: Sau khi tải, Cart.items không phải là mảng!');
      this.items = [];
    }

    // Cập nhật UI giỏ hàng sau khi header đã được tải
    if (document.querySelector('.cart-count') || document.getElementById('cart-count')) {
      // Header đã được tải, cập nhật UI ngay lập tức
      console.log('DEBUG: Header đã được tải, cập nhật UI ngay lập tức');
      this.updateCartCount();          // Cập nhật số lượng
      this.updateCartDropdown();       // Cập nhật dropdown
      this.updateCartPage();           // Cập nhật trang giỏ hàng nếu đang mở
      console.log('DEBUG: Đã khởi tạo giỏ hàng với', this.items.length, 'sản phẩm');
    } else {
      console.log('DEBUG: Chờ header được tải trước khi cập nhật giỏ hàng');
      // Lắng nghe sự kiện headerLoaded từ UI.js
      document.addEventListener('headerLoaded', () => {
        console.log('DEBUG: Header đã tải xong, cập nhật UI giỏ hàng');
        setTimeout(() => {
          this.updateCartCount();          // Cập nhật số lượng
          this.updateCartDropdown();       // Cập nhật dropdown
          this.updateCartPage();           // Cập nhật trang giỏ hàng nếu đang mở
          console.log('DEBUG: Đã khởi tạo giỏ hàng với', this.items.length, 'sản phẩm');
        }, 100); // Thêm độ trễ nhỏ để đảm bảo DOM đã được cập nhật
      });
    }

    // Cập nhật lại trang giỏ hàng sau khi tất cả nội dung được tải
    window.addEventListener('load', () => {
      console.log('DEBUG: Window loaded event, cập nhật trang giỏ hàng');
      setTimeout(() => {
        this.updateCartPage();
      }, 500);
    });

    console.log('===== Kết thúc khởi tạo giỏ hàng =====');
  }

  /**
   * Tải dữ liệu giỏ hàng từ localStorage
   */
  static loadCart() {
    console.log('DEBUG: Đang tải dữ liệu giỏ hàng từ localStorage');
    try {
      // Lấy dữ liệu giỏ hàng từ localStorage
      const cartData = localStorage.getItem('cart');
      console.log('DEBUG: Dữ liệu giỏ hàng raw từ localStorage:', cartData);

      // Nếu có dữ liệu giỏ hàng
      if (cartData) {
        try {
          const parsedData = JSON.parse(cartData);
          console.log('DEBUG: Đã phân tích dữ liệu giỏ hàng thành công, dữ liệu:', parsedData);
          
          if (Array.isArray(parsedData)) {
            this.items = parsedData;
            console.log('DEBUG: Số lượng sản phẩm đã tải:', this.items.length);
            
            // Kiểm tra dữ liệu sản phẩm và chuẩn hóa nếu cần
            this.items = this.items.map(item => {
              // Chuẩn hóa dữ liệu
              return {
                Id: item.Id || item.id || '',
                Name: item.Name || item.name || 'Sản phẩm không xác định',
                Price: item.Price || item.price || 0,
                ImageUrl: item.ImageUrl || item.image || item.imageUrl || 'img/default-product.jpg',
                Quantity: item.Quantity || item.quantity || 1
              };
            }).filter(item => item.Id); // Loại bỏ sản phẩm không có ID
            
            console.log('DEBUG: Đã chuẩn hóa dữ liệu giỏ hàng, số lượng hợp lệ:', this.items.length);
          } else {
            console.error('DEBUG: Dữ liệu giỏ hàng không phải là mảng:', parsedData);
            this.items = [];
          }
        } catch (parseError) {
          console.error('DEBUG: Lỗi khi phân tích dữ liệu giỏ hàng:', parseError);
          this.items = [];
        }
      } else {
        console.log('DEBUG: Không tìm thấy dữ liệu giỏ hàng trong localStorage');
        this.items = [];
      }

      // Đảm bảo items luôn là một mảng
      if (!Array.isArray(this.items)) {
        console.log('DEBUG: this.items không phải là mảng, đặt lại thành mảng rỗng');
        this.items = [];
      }
    } catch (error) {
      console.error('DEBUG: Lỗi khi tải giỏ hàng:', error);
      this.items = [];
    }
    
    // Log số lượng sản phẩm đã tải
    console.log('DEBUG: Đã tải xong giỏ hàng, số lượng sản phẩm:', this.items.length);
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

    // Thêm vào giỏ hàng với các thuộc tính chuẩn hóa
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
    if (!item) {
      UI.createNotification('Không thể thêm sản phẩm vào giỏ hàng.', 'error');
      return;
    }

    // Chuẩn hóa dữ liệu sản phẩm (xử lý cả viết hoa và viết thường)
    const normalizedItem = {
      Id: item.Id || item.id || '',
      Name: item.Name || item.name || 'Sản phẩm không xác định',
      Price: item.Price || item.price || 0,
      ImageUrl: item.ImageUrl || item.image || 'img/default-product.jpg',
      Quantity: item.Quantity || item.quantity || 1
    };

    if (!normalizedItem.Id) {
      UI.createNotification('Không thể thêm sản phẩm vào giỏ hàng. Thiếu ID sản phẩm.', 'error');
      return;
    }

    // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
    const existingItem = this.items.find(cartItem => cartItem.Id === normalizedItem.Id);

    if (existingItem) {
      // Nếu sản phẩm đã tồn tại, tăng số lượng
      existingItem.Quantity += normalizedItem.Quantity;
    } else {
      // Nếu sản phẩm chưa tồn tại, thêm vào giỏ hàng
      this.items.push(normalizedItem);
    }

    // Lưu giỏ hàng
    this.saveCart();

    // Cập nhật UI giỏ hàng
    this.updateCartDropdown(); // Cập nhật dropdown
    this.updateCartCount();    // Cập nhật số lượng
    this.updateCartPage();     // Cập nhật trang giỏ hàng nếu đang mở

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

    // Tìm sản phẩm trong giỏ hàng, kiểm tra nhiều loại ID có thể có
    const itemIndex = this.items.findIndex(item => 
      (item.id === itemId) || (item.Id === itemId) || (item.productId === itemId)
    );

    if (itemIndex !== -1) {
      // Xác định thuộc tính số lượng cần cập nhật
      if ('Quantity' in this.items[itemIndex]) {
        this.items[itemIndex].Quantity = quantity;
      } else if ('quantity' in this.items[itemIndex]) {
        this.items[itemIndex].quantity = quantity;
      } else {
        // Nếu không tìm thấy thuộc tính nào, thêm thuộc tính mới
        this.items[itemIndex].quantity = quantity;
      }

      // Lưu giỏ hàng
      this.saveCart();

      // Cập nhật UI
      this.updateCartDropdown(); // Cập nhật dropdown
      this.updateCartCount();    // Cập nhật số lượng
      this.updateCartPage();     // Cập nhật trang giỏ hàng nếu đang mở
    }
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * @param {string} itemId - ID của sản phẩm
   */
  static removeItem(itemId) {
    if (!itemId) return;

    // Xác nhận xóa
    if (typeof UI !== 'undefined' && typeof UI.confirmDialog === 'function') {
      UI.confirmDialog('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?', () => {
        this.doRemoveItem(itemId);
      });
    } else {
      // Nếu không có UI.confirmDialog, xóa trực tiếp
      this.doRemoveItem(itemId);
    }
  }
  
  /**
   * Thực hiện xóa sản phẩm khỏi giỏ hàng (không xác nhận)
   * @param {string} itemId - ID của sản phẩm
   * @private
   */
  static doRemoveItem(itemId) {
    // Lưu số lượng sản phẩm trước khi xóa
    const initialCount = this.items.length;
    console.log('DEBUG: Số lượng sản phẩm trước khi xóa:', initialCount);
    console.log('DEBUG: Đang xóa sản phẩm có ID:', itemId);

    // Lọc ra danh sách sản phẩm không chứa sản phẩm cần xóa
    this.items = this.items.filter(item => {
      // Kiểm tra tất cả các trường id có thể có
      const productId = item.id || item.Id || item.productId;
      // Không giữ lại sản phẩm có id khớp với itemId
      return productId !== itemId;
    });

    console.log('DEBUG: Số lượng sản phẩm sau khi xóa:', this.items.length);
    
    // Kiểm tra xem có xóa thành công không
    if (this.items.length === initialCount) {
      console.warn('DEBUG: Không tìm thấy sản phẩm để xóa với ID:', itemId);
    }

    // Lưu giỏ hàng
    this.saveCart();

    // Cập nhật UI
    this.updateCartDropdown(); // Cập nhật dropdown
    this.updateCartCount();    // Cập nhật số lượng
    this.updateCartPage();     // Cập nhật trang giỏ hàng nếu đang mở

    // Hiển thị thông báo
    if (typeof UI !== 'undefined' && typeof UI.createNotification === 'function') {
      UI.createNotification('Đã xóa sản phẩm khỏi giỏ hàng.', 'success');
    }
  }

  /**
   * Xóa tất cả sản phẩm khỏi giỏ hàng
   */
  static clearCart() {
    // Xác nhận xóa tất cả
    if (typeof UI !== 'undefined' && typeof UI.confirmDialog === 'function') {
      UI.confirmDialog('Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?', () => {
        this.doClearCart();
      });
    } else {
      // Nếu không có UI.confirmDialog, xóa trực tiếp
      this.doClearCart();
    }
  }
  
  /**
   * Thực hiện xóa tất cả sản phẩm khỏi giỏ hàng (không xác nhận)
   * @private
   */
  static doClearCart() {
    // Xóa tất cả sản phẩm
    this.items = [];

    // Lưu giỏ hàng
    this.saveCart();

    // Cập nhật UI
    this.updateCartDropdown(); // Cập nhật dropdown
    this.updateCartCount();    // Cập nhật số lượng
    this.updateCartPage();     // Cập nhật trang giỏ hàng nếu đang mở

    // Hiển thị thông báo
    if (typeof UI !== 'undefined' && typeof UI.createNotification === 'function') {
      UI.createNotification('Đã xóa tất cả sản phẩm khỏi giỏ hàng.', 'success');
    }
  }

  /**
   * Đếm số lượng sản phẩm duy nhất trong giỏ hàng (khác với tổng số lượng)
   * @returns {number} Số lượng sản phẩm
   */
  static getItemCount() {
    return this.items.length;
  }

  /**
   * Lấy tổng số lượng sản phẩm trong giỏ hàng
   * @returns {number} Tổng số lượng
   */
  static getTotalQuantity() {
    return this.items.reduce((total, item) => {
      // Kiểm tra các trường hợp khác nhau của thuộc tính số lượng
      const quantity = item.quantity || item.Quantity || 1;
      return total + quantity;
    }, 0);
  }

  /**
   * Tính tổng giá trị giỏ hàng
   * @returns {number} - Tổng giá trị giỏ hàng
   */
  static getTotalPrice() {
    return this.items.reduce((total, item) => {
      // Kiểm tra các trường hợp khác nhau của thuộc tính giá và số lượng
      const price = item.price || item.Price || 0;
      const quantity = item.quantity || item.Quantity || 1;
      return total + (price * quantity);
    }, 0);
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
   * Cập nhật biểu tượng giỏ hàng trên header
   */
  static updateCartIcon() {
    // Chỉ gọi phương thức updateCartCount để cập nhật số lượng
    this.updateCartCount();
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng ở tất cả các vị trí hiển thị
   * Phương thức này sẽ được gọi từ các phương thức khác trong Cart class
   * @param {number} retryCount - Số lần thử lại nếu phần tử chưa được tải
   */
  static updateCartCount(retryCount = 0) {
    const totalQuantity = this.getTotalQuantity();
    console.log('Cập nhật số lượng giỏ hàng:', totalQuantity);

    // Tìm phần tử hiển thị số lượng bằng nhiều cách khác nhau
    const cartCountElements = [
      document.querySelector('.cart-count'),
      document.getElementById('cart-count')
    ];

    // Phần tử hiển thị số lượng đầu tiên tìm thấy
    const cartCount = cartCountElements.find(el => el !== null);

    if (cartCount) {
      // Cập nhật số lượng
      cartCount.textContent = totalQuantity.toString();

      // Hiển thị/ẩn số lượng
      if (totalQuantity > 0) {
        cartCount.style.display = 'flex';
      } else {
        cartCount.style.display = 'none';
      }
    } else if (retryCount < 5) {
      // Thử lại sau nếu phần tử chưa được tải, tối đa 5 lần
      console.log(`Chưa tìm thấy phần tử hiển thị số lượng giỏ hàng. Thử lại lần ${retryCount + 1}/5`);
      setTimeout(() => this.updateCartCount(retryCount + 1), 200);
      return;
    }

    // Cập nhật số lượng trong các hàm cần đồng bộ hóa
    // 1. Gọi hàm updateCartCount trong header.html nếu có
    if (typeof window.updateCartCount === 'function') {
      try {
        window.updateCartCount();
      } catch (error) {
        console.error('Lỗi khi gọi window.updateCartCount:', error);
      }
    }

    // 2. Gọi hàm updateCartCount trong UI nếu có
    if (window.UI && typeof window.UI.updateCartCount === 'function') {
      try {
        window.UI.updateCartCount(totalQuantity);
      } catch (error) {
        console.error('Lỗi khi gọi UI.updateCartCount:', error);
      }
    }

    // 3. Cập nhật hàm updateCartCount trong app.js nếu có
    if (window.updateCartCount && window.updateCartCount !== window.Cart.updateCartCount) {
      try {
        window.updateCartCount(0); // Gọi với retryCount = 0
      } catch (error) {
        console.error('Lỗi khi gọi window.updateCartCount từ app.js:', error);
      }
    }
  }

  /**
   * Cập nhật dropdown giỏ hàng trong header
   */
  static updateCartDropdown() {
    const cartDropdownContainer = document.querySelector('#cart-container');
    const headerCartItems = document.getElementById('header-cart-items');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const cartTotalAmount = document.getElementById('cartTotalAmount');

    if (!cartDropdownContainer || !headerCartItems) {
      console.error('DEBUG: Không tìm thấy phần tử #cart-container hoặc #header-cart-items trong header');
      return;
    }

    console.log('DEBUG: Cập nhật dropdown giỏ hàng, container:', cartDropdownContainer);

    // Xóa các sản phẩm hiện tại trong dropdown (trừ thông báo giỏ hàng trống)
    const existingItems = headerCartItems.querySelectorAll('.cart-dropdown-item, .cart-item');
    existingItems.forEach(item => item.remove());

    // Hiển thị thông báo giỏ hàng trống nếu không có sản phẩm
    if (!this.items || this.items.length === 0) {
      console.log('DEBUG: Giỏ hàng trống, hiển thị thông báo trong dropdown');
      
      // Tìm hoặc tạo phần tử hiển thị thông báo giỏ hàng trống
      let emptyMessage = headerCartItems.querySelector('.empty-cart-message');
      if (!emptyMessage) {
        emptyMessage = document.createElement('div');
        emptyMessage.className = 'cart-empty empty-cart-message';
        emptyMessage.innerHTML = `
          <i class="fas fa-shopping-cart"></i>
          <p>Giỏ hàng của bạn đang trống</p>
        `;
        headerCartItems.appendChild(emptyMessage);
      } else {
        emptyMessage.style.display = 'block';
      }
      
      // Cập nhật tổng tiền
      if (cartTotalAmount) {
        cartTotalAmount.textContent = '0đ';
      }
    } else {
      console.log('DEBUG: Giỏ hàng có sản phẩm, hiển thị trong dropdown');
      
      // Ẩn thông báo giỏ hàng trống nếu có
      const emptyMessage = headerCartItems.querySelector('.empty-cart-message');
      if (emptyMessage) {
        emptyMessage.style.display = 'none';
      }

      // Thêm các sản phẩm vào dropdown
      this.items.slice(0, 3).forEach(item => { // Chỉ hiển thị tối đa 3 sản phẩm
        // Chuẩn hóa thuộc tính sản phẩm để đảm bảo tính nhất quán
        const productId = item.id || item.Id || item.productId || '';
        const productName = item.name || item.Name || item.productName || 'Sản phẩm không tên';
        const productPrice = item.price || item.Price || 0;
        const productQuantity = item.quantity || item.Quantity || 1;
        const productImage = item.image || item.ImageUrl || item.imageUrl || 'img/default-product.jpg';

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
          <span class="fa fa-times" data-id="${productId}"></span>
          <img src="${productImage}" alt="${productName}">
          <div class="content">
            <h3>${productName}</h3>
            <div class="price">${this.formatCurrency(productPrice)} x ${productQuantity}</div>
          </div>
        `;

        headerCartItems.appendChild(cartItem);
        
        // Thêm sự kiện xóa sản phẩm
        const removeBtn = cartItem.querySelector('.fa-times');
        if (removeBtn) {
          removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const itemId = removeBtn.getAttribute('data-id');
            if (itemId) {
              this.removeItem(itemId);
            }
          });
        }
      });

      // Thêm thông báo nếu có nhiều hơn 3 sản phẩm
      if (this.items.length > 3) {
        const moreItems = document.createElement('div');
        moreItems.className = 'more-items-message';
        moreItems.innerHTML = `<p>+ ${this.items.length - 3} sản phẩm khác</p>`;
        headerCartItems.appendChild(moreItems);
      }
      
      // Cập nhật tổng tiền
      const totalAmount = this.getTotalPrice();
      if (cartTotalAmount) {
        cartTotalAmount.textContent = this.formatCurrency(totalAmount);
      }
    }
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
    // Xác định đường dẫn hiện tại để biết có đang ở trang giỏ hàng không
    const currentPath = window.location.pathname;
    const isCartPage = currentPath.includes('index-cart.html') || currentPath.endsWith('/cart');
    
    console.log('===== DEBUG: Bắt đầu cập nhật trang giỏ hàng =====');
    console.log('DEBUG: Đường dẫn hiện tại:', currentPath);
    console.log('DEBUG: Là trang giỏ hàng:', isCartPage);
    console.log('DEBUG: Số lượng sản phẩm trong giỏ hàng:', this.items ? this.items.length : 0);

    try {
      // Chỉ cập nhật trang giỏ hàng, không cập nhật header
      const cartItemsContainer = document.getElementById('cart-items');
      const headerCartItems = document.getElementById('header-cart-items');
      
      // Không tìm thấy phần tử cart-items hoặc không phải trang giỏ hàng
      if (!cartItemsContainer || !isCartPage) {
        console.log('DEBUG: Không tìm thấy phần tử cart-items hoặc không phải trang giỏ hàng');
        return;
      }

      console.log('DEBUG: Đang cập nhật trang giỏ hàng');
      
      const itemCountElement = document.getElementById('item-count');
      const totalCostElement = document.getElementById('total-cost');
      const checkoutButton = document.getElementById('checkout-button');

      console.log('DEBUG: Elements found:', {
        cartItemsContainer: cartItemsContainer ? 'found' : 'not found',
        itemCountElement: itemCountElement ? 'found' : 'not found',
        totalCostElement: totalCostElement ? 'found' : 'not found',
        checkoutButton: checkoutButton ? 'found' : 'not found'
      });

      // Không tìm thấy cart-items, không cần tiếp tục
      if (!cartItemsContainer) {
        console.log('DEBUG: Không tìm thấy phần tử cart-items, có thể không phải trang giỏ hàng');
        return;
      }

      if (!this.items) {
        console.error('DEBUG: Cart.items không tồn tại hoặc chưa được khởi tạo');
        this.items = [];
      }

      console.log('DEBUG: Dữ liệu giỏ hàng:', JSON.stringify(this.items));

      // Xóa nội dung cũ
      console.log('DEBUG: Xóa nội dung cũ của cart-items');
      cartItemsContainer.innerHTML = '';

      if (!Array.isArray(this.items) || this.items.length === 0) {
        console.log('DEBUG: Giỏ hàng trống, hiển thị thông báo');
        // Hiển thị thông báo giỏ hàng trống
        cartItemsContainer.innerHTML = `
          <div class="empty-cart">
            <div class="empty-cart-icon">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <h3>Giỏ hàng của bạn đang trống</h3>
            <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục.</p>
          </div>
        `;
        
        // Disable checkout button if cart is empty
        if (checkoutButton) {
          checkoutButton.classList.add('disabled');
          checkoutButton.style.opacity = '0.5';
          checkoutButton.style.cursor = 'not-allowed';
        }
      } else {
        console.log('DEBUG: Giỏ hàng có sản phẩm, bắt đầu hiển thị');
        
        // Enable checkout button
        if (checkoutButton) {
          checkoutButton.classList.remove('disabled');
          checkoutButton.style.opacity = '1';
          checkoutButton.style.cursor = 'pointer';
        }
        
        // Tạo HTML cho các sản phẩm trong giỏ hàng
        this.items.forEach((item, index) => {
          console.log(`DEBUG: Xử lý sản phẩm ${index + 1}:`, item);

          // Chuẩn hóa thuộc tính sản phẩm để đảm bảo tính nhất quán
          const productId = item.id || item.Id || item.productId || '';
          const productName = item.name || item.Name || item.productName || 'Sản phẩm không tên';
          const productPrice = item.price || item.Price || 0;
          const productQuantity = item.quantity || item.Quantity || 1;
          const productImage = item.image || item.ImageUrl || item.imageUrl || 'img/default-product.jpg';
          
          const itemTotal = productPrice * productQuantity;

          console.log(`DEBUG: Thông tin sản phẩm đã chuẩn hóa:`, {
            id: productId,
            name: productName,
            price: productPrice,
            quantity: productQuantity,
            image: productImage,
            total: itemTotal
          });

          const cartItemDiv = document.createElement('div');
          cartItemDiv.className = 'cart-item';
          cartItemDiv.innerHTML = `
            <div class="cart-item-img">
              <img src="${productImage}" alt="${productName}">
            </div>
            <div class="cart-item-content">
              <h3>${productName}</h3>
              <div class="cart-item-price">${this.formatCurrency(productPrice)}</div>
              <div class="cart-item-quantity">
                <button class="quantity-btn decrease" data-id="${productId}">-</button>
                <input type="number" class="cart-quantity-input" data-id="${productId}" value="${productQuantity}" min="1">
                <button class="quantity-btn increase" data-id="${productId}">+</button>
              </div>
              <div class="cart-item-total">Tổng: ${this.formatCurrency(itemTotal)}</div>
              <button class="remove-item-btn" data-id="${productId}">Xóa</button>
            </div>
          `;

          cartItemsContainer.appendChild(cartItemDiv);
          console.log(`DEBUG: Đã thêm sản phẩm ${productName} vào DOM`);
        });

        // Cập nhật số lượng và tổng giá trị
        const totalQuantity = this.getTotalQuantity();
        const totalPrice = this.getTotalPrice();

        console.log('DEBUG: Cập nhật tổng số lượng:', totalQuantity);
        console.log('DEBUG: Cập nhật tổng giá trị:', totalPrice);

        if (itemCountElement) {
          itemCountElement.textContent = totalQuantity;
        }

        if (totalCostElement) {
          totalCostElement.textContent = this.formatCurrency(totalPrice).replace(' ₫', '');
        }

        console.log('DEBUG: Thiết lập sự kiện cho các nút');

        // Thiết lập sự kiện nút tăng/giảm số lượng
        const decreaseButtons = document.querySelectorAll('.quantity-btn.decrease');
        const increaseButtons = document.querySelectorAll('.quantity-btn.increase');
        const quantityInputs = document.querySelectorAll('.cart-quantity-input');
        const removeButtons = document.querySelectorAll('.remove-item-btn');

        console.log('DEBUG: Số lượng nút được tìm thấy:', {
          decreaseButtons: decreaseButtons.length,
          increaseButtons: increaseButtons.length,
          quantityInputs: quantityInputs.length,
          removeButtons: removeButtons.length
        });

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
    } catch (error) {
      console.error('DEBUG: Lỗi khi cập nhật trang giỏ hàng:', error);
    }

    console.log('===== DEBUG: Kết thúc cập nhật trang giỏ hàng =====');
  }

  /**
   * Xử lý thanh toán
   */
  static proceedToCheckout(e) {
    console.log('DEBUG: Xử lý thanh toán');
    
    // Lấy phương thức thanh toán từ localStorage (mặc định là COD)
    const paymentMethod = localStorage.getItem('selectedPaymentMethod') || 'COD';
    console.log('DEBUG: Phương thức thanh toán:', paymentMethod);
    
    // Nếu thanh toán qua VNPay, tạo yêu cầu thanh toán qua API
    if (paymentMethod === 'vnpay') {
      // Ngăn chặn chuyển trang mặc định
      e.preventDefault();
      
      // Lấy thông tin giỏ hàng
      const cartItems = this.items;
      if (!cartItems || cartItems.length === 0) {
        UI.createNotification('Giỏ hàng của bạn đang trống', 'error');
        return;
      }
      
      // Tính tổng tiền
      const totalAmount = this.getTotalPrice();
      
      // Tạo mã đơn hàng tạm thời
      const tempOrderId = 'ORDER' + new Date().getTime();
      
      // Hiển thị thông báo đang xử lý
      UI.createNotification('Đang xử lý thanh toán...', 'info');
      
      // Gọi API tạo URL thanh toán VNPay
      PaymentAPI.createVnPayPayment(tempOrderId, totalAmount, `Thanh toán đơn hàng ${tempOrderId}`)
        .then(response => {
          console.log('DEBUG: Kết quả tạo URL thanh toán VNPay:', response);
          
          if (response && response.success && response.paymentUrl) {
            // Lưu thông tin đơn hàng tạm thời vào localStorage
            localStorage.setItem('pendingOrderId', tempOrderId);
            localStorage.setItem('pendingOrderItems', JSON.stringify(cartItems));
            
            // Chuyển hướng đến trang thanh toán VNPay
            window.location.href = response.paymentUrl;
          } else {
            UI.createNotification('Không thể tạo URL thanh toán. Vui lòng thử lại sau.', 'error');
          }
        })
        .catch(error => {
          console.error('Lỗi khi tạo URL thanh toán VNPay:', error);
          UI.createNotification('Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại sau.', 'error');
        });
    } else {
      // Nếu thanh toán COD, chuyển hướng đến trang thanh toán
      window.location.href = 'index-checkout.html';
    }
  }
}