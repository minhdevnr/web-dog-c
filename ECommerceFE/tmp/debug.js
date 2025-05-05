/**
 * debug.js - File chứa các hàm debug và fix lỗi cho hệ thống
 */

// Kiểm tra xem Cart đã được khởi tạo chưa và khởi tạo nếu cần
(function() {
    console.log('DEBUG: Đang kiểm tra và khởi tạo Cart...');

    // Chờ DOM được tải
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DEBUG: DOM đã tải xong, kiểm tra Cart...');
        
        // Kiểm tra xem class Cart đã tồn tại chưa
        if (typeof Cart !== 'undefined') {
            console.log('DEBUG: Cart đã tồn tại, kiểm tra và khởi tạo nếu cần');
            
            // Kiểm tra xem Cart đã được khởi tạo chưa
            if (!Cart.items || !Array.isArray(Cart.items)) {
                console.log('DEBUG: Cart chưa được khởi tạo đúng cách, khởi tạo lại');
                Cart.init();
            } else {
                console.log('DEBUG: Cart đã được khởi tạo, cập nhật UI');
                // Chỉ cập nhật UI
                Cart.updateCartCount();
                Cart.updateCartDropdown();
                
                // Kiểm tra xem đang ở trang giỏ hàng không
                const currentPath = window.location.pathname;
                if (currentPath.includes('index-cart.html') || currentPath.endsWith('/cart')) {
                    console.log('DEBUG: Đang ở trang giỏ hàng, cập nhật trang giỏ hàng');
                    Cart.updateCartPage();
                }
            }
        } else {
            console.warn('DEBUG: Cart chưa được định nghĩa');
        }
    });

    // Fix lỗi xung đột ID giữa header và trang giỏ hàng
    window.addEventListener('load', function() {
        console.log('DEBUG: Trang đã tải xong, kiểm tra và xử lý xung đột ID');
        
        // Kiểm tra xem có tồn tại cả hai phần tử không
        const headerCartItems = document.getElementById('header-cart-items');
        const pageCartItems = document.getElementById('cart-items');
        
        if (headerCartItems && pageCartItems) {
            console.log('DEBUG: Cả header-cart-items và cart-items đều tồn tại');
            
            // Kiểm tra xem Cart đã được khởi tạo chưa
            if (typeof Cart !== 'undefined') {
                console.log('DEBUG: Cart đã tồn tại, cập nhật lại UI cho cả hai phần tử');
                
                // Cập nhật UI cho cả hai phần tử
                Cart.updateCartDropdown(); // Cập nhật dropdown trong header
                Cart.updateCartPage();     // Cập nhật trang giỏ hàng
            }
        }
        
        // Nếu chỉ có một trong hai phần tử
        if (headerCartItems && !pageCartItems) {
            console.log('DEBUG: Chỉ có header-cart-items, cập nhật dropdown');
            if (typeof Cart !== 'undefined') {
                Cart.updateCartDropdown();
            }
        }
        
        if (!headerCartItems && pageCartItems) {
            console.log('DEBUG: Chỉ có cart-items, cập nhật trang giỏ hàng');
            if (typeof Cart !== 'undefined') {
                Cart.updateCartPage();
            }
        }
    });
})();

// Debug Cart Module
document.addEventListener('DOMContentLoaded', function() {
  console.log('Debug script loaded');
  
  // Thêm một sản phẩm mẫu vào localStorage
  function addSampleProduct() {
    const sampleItems = [
      {
        Id: '1',
        Name: 'Cà phê Arabica',
        Price: 75000,
        ImageUrl: 'img/product-1.jpg',
        Quantity: 2
      },
      {
        Id: '2',
        Name: 'Cà phê Robusta',
        Price: 65000,
        ImageUrl: 'img/product-2.jpg',
        Quantity: 1
      }
    ];
    
    localStorage.setItem('cart', JSON.stringify(sampleItems));
    console.log('Đã thêm sản phẩm mẫu vào giỏ hàng');
    
    // Tải lại trang để xem kết quả
    if (confirm('Đã thêm sản phẩm mẫu vào giỏ hàng. Bạn có muốn tải lại trang để xem kết quả?')) {
      window.location.reload();
    }
  }
  
  // Hiển thị nội dung giỏ hàng hiện tại
  function showCurrentCart() {
    let cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        const cart = JSON.parse(cartData);
        console.log('Nội dung giỏ hàng hiện tại:', cart);
        alert('Giỏ hàng có ' + cart.length + ' sản phẩm. Xem chi tiết trong Console.');
      } catch (e) {
        console.error('Lỗi khi phân tích dữ liệu giỏ hàng:', e);
        alert('Lỗi khi đọc dữ liệu giỏ hàng: ' + e.message);
      }
    } else {
      console.log('Giỏ hàng trống');
      alert('Giỏ hàng trống');
    }
  }
  
  // Xóa giỏ hàng
  function clearCart() {
    localStorage.removeItem('cart');
    console.log('Đã xóa giỏ hàng');
    alert('Đã xóa giỏ hàng');
    
    // Tải lại trang để xem kết quả
    if (confirm('Đã xóa giỏ hàng. Bạn có muốn tải lại trang?')) {
      window.location.reload();
    }
  }
  
  // Kiểm tra xem Cart có được khởi tạo không
  function checkCartInitialization() {
    if (window.Cart) {
      console.log('Cart được khởi tạo:', window.Cart);
      console.log('Cart items:', window.Cart.items);
      alert('Cart được khởi tạo và có ' + (window.Cart.items ? window.Cart.items.length : 0) + ' sản phẩm');
    } else {
      console.error('Cart chưa được khởi tạo');
      alert('Cart chưa được khởi tạo');
    }
  }
  
  // Tạo giao diện debug
  const debugDiv = document.createElement('div');
  debugDiv.style.position = 'fixed';
  debugDiv.style.bottom = '20px';
  debugDiv.style.right = '20px';
  debugDiv.style.zIndex = '9999';
  debugDiv.style.background = 'rgba(0,0,0,0.8)';
  debugDiv.style.color = 'white';
  debugDiv.style.padding = '10px';
  debugDiv.style.borderRadius = '5px';
  debugDiv.innerHTML = `
    <h3>Debug Cart</h3>
    <button id="addSampleBtn">Thêm sản phẩm mẫu</button>
    <button id="showCartBtn">Xem giỏ hàng</button>
    <button id="clearCartBtn">Xóa giỏ hàng</button>
    <button id="checkCartBtn">Kiểm tra Cart</button>
  `;
  document.body.appendChild(debugDiv);
  
  // Thêm sự kiện cho các nút
  document.getElementById('addSampleBtn').addEventListener('click', addSampleProduct);
  document.getElementById('showCartBtn').addEventListener('click', showCurrentCart);
  document.getElementById('clearCartBtn').addEventListener('click', clearCart);
  document.getElementById('checkCartBtn').addEventListener('click', checkCartInitialization);
  
  // Thêm debug vào trong Cart
  if (window.Cart) {
    const originalUpdateCartPage = window.Cart.updateCartPage;
    window.Cart.updateCartPage = function() {
      console.log('Debug: Calling updateCartPage');
      console.log('Debug: Cart items before update:', JSON.stringify(this.items));
      console.log('Debug: cart-items element:', document.getElementById('cart-items'));
      
      originalUpdateCartPage.call(this);
      
      console.log('Debug: updateCartPage completed');
    };
  }
}); 