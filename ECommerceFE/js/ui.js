/**
 * ui.js - Xử lý giao diện người dùng
 */

// Class UI
class UI {
  /**
   * Khởi tạo UI
   */
  static init() {
    // Tải header và footer
    this.loadComponents();
    // Thiết lập các sự kiện
    this.setupUIEvents();
    // Cài đặt hiệu ứng UI
    this.setupUIEffects();
  }

  /**
   * Tải các component (header, footer)
   */
  static loadComponents() {
    console.log('Debug: Loading components started');
    
    // Tải header
    const headerContainer = document.getElementById('header-container');
    console.log('Debug: Header container:', headerContainer);
    
    if (headerContainer) {
      // Luôn tải từ thư mục components
      fetch('components/header.html')
        .then(response => {
          console.log('Debug: Components header response status:', response.status);
          if (!response.ok) {
            throw new Error('Không thể tải header từ components/');
          }
          return response.text();
        })
        .then(data => {
          console.log('Debug: Components header data received, length:', data.length);
          headerContainer.innerHTML = data;
          console.log('Debug: Header appended from components/');
          
          // Trigger event khi header đã load xong
          document.dispatchEvent(new Event('headerLoaded'));
          
          // Khởi tạo sự kiện header sau khi tải
          this.initHeaderEvents();
        })
        .catch(componentsError => {
          console.error('Error loading header from components:', componentsError);
          headerContainer.innerHTML = '<div class="header-error">Không thể tải header</div>';
        });
    }
    
    // Tải footer
    const footerContainer = document.getElementById('footer-container');
    
    if (footerContainer) {
      // Luôn tải từ thư mục components
      fetch('components/footer.html')
        .then(response => {
          console.log('Debug: Components footer response status:', response.status);
          if (!response.ok) {
            throw new Error('Không thể tải footer từ components/');
          }
          return response.text();
        })
        .then(data => {
          console.log('Debug: Components footer data received, length:', data.length);
          footerContainer.innerHTML = data;
          console.log('Debug: Footer appended from components/');
        })
        .catch(componentsError => {
          console.error('Error loading footer from components:', componentsError);
          footerContainer.innerHTML = '<div class="footer-error">Không thể tải footer</div>';
        });
    }
  }

  /**
   * Thiết lập các sự kiện UI
   */
  static setupUIEvents() {
    // Xử lý sự kiện cuộn trang
    window.addEventListener('scroll', () => {
      this.handleScrollEvents();
    });

    // Xử lý nút quay lại đầu trang
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Xử lý nút menu di động
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }

    // Xử lý nút tìm kiếm
    const searchToggle = document.getElementById('search-toggle');
    if (searchToggle) {
      searchToggle.addEventListener('click', () => {
        this.toggleSearchBar();
      });
    }

    // Xử lý form tìm kiếm
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSearch();
      });
    }

    // Tạo sự kiện đóng các dropdown khi click bên ngoài
    window.addEventListener('click', (e) => {
      this.handleOutsideClicks(e);
    });
  }

  /**
   * Khởi tạo sự kiện cho header sau khi load xong
   */
  static initHeaderEvents() {
    console.log('Debug: Initializing header events');

    // Các phần tử DOM
    const searchBtn = document.querySelector("#search-btn");
    const cartBtn = document.querySelector("#cart-btn");
    const loginBtn = document.querySelector("#login-btn");
    const logoutBtn = document.querySelector("#logout-btn");
    const userProfileBtn = document.querySelector("#user-profile-btn");
    const registerBtn = document.querySelector("#register-btn");
    const barsBtn = document.querySelector("#bars-btn");
    const navbar = document.querySelector(".navbar");
    const searchForm = document.querySelector(".search-form");
    const cartItemContainer = document.querySelector(".cart-item-container");
    const userProfileDropdown = document.querySelector(".user-profile-dropdown");
    
    console.log('Debug: DOM elements found:', {
      searchBtn: !!searchBtn,
      cartBtn: !!cartBtn,
      loginBtn: !!loginBtn,
      logoutBtn: !!logoutBtn,
      navbar: !!navbar,
      searchForm: !!searchForm,
      cartItemContainer: !!cartItemContainer
    });
    
    // Toggle search form
    if (searchBtn) {
      searchBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        console.log('Debug: Search button clicked');
        searchForm.classList.toggle("active");
        if (cartItemContainer) cartItemContainer.classList.remove("active");
        if (userProfileDropdown) userProfileDropdown.classList.remove("active");
        if (navbar) navbar.classList.remove("active");
      });
    }
    
    // Toggle cart
    if (cartBtn) {
      cartBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        console.log('Debug: Cart button clicked');
        if (cartItemContainer) {
          cartItemContainer.classList.toggle("active");
          console.log('Debug: Cart container toggled:', cartItemContainer.classList.contains('active'));
        }
        if (searchForm) searchForm.classList.remove("active");
        if (userProfileDropdown) userProfileDropdown.classList.remove("active");
        if (navbar) navbar.classList.remove("active");
      });
    }
    
    // Toggle user profile dropdown
    if (userProfileBtn) {
      userProfileBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        console.log('Debug: User profile button clicked');
        if (userProfileDropdown) userProfileDropdown.classList.toggle("active");
        if (searchForm) searchForm.classList.remove("active");
        if (cartItemContainer) cartItemContainer.classList.remove("active");
        if (navbar) navbar.classList.remove("active");
      });
    }
    
    // Toggle navbar on mobile
    if (barsBtn) {
      barsBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        console.log('Debug: Bars button clicked');
        if (navbar) navbar.classList.toggle("active");
        if (searchForm) searchForm.classList.remove("active");
        if (cartItemContainer) cartItemContainer.classList.remove("active");
        if (userProfileDropdown) userProfileDropdown.classList.remove("active");
      });
    }
    
    // Redirect to login/register pages
    if (loginBtn) {
      loginBtn.addEventListener("click", function(e) {
        console.log('Debug: Login button clicked');
        e.stopPropagation();
        window.location.href = "login.html";
      });
    }
    
    if (registerBtn) {
      registerBtn.addEventListener("click", function(e) {
        console.log('Debug: Register button clicked');
        e.stopPropagation();
        window.location.href = "register.html";
      });
    }
    
    // Xử lý đăng xuất
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Debug: Logout button clicked');
        
        // Xóa thông tin đăng nhập
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Hiển thị thông báo
        UI.createNotification("Đăng xuất thành công!", "success");
        
        // Cập nhật UI ngay lập tức
        UI.setHeaderVisibilityByLoginStatus();
        
        // Chuyển về trang chủ sau 1 giây
        setTimeout(function() {
          window.location.href = "index.html";
        }, 1000);
      });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener("click", function(e) {
      // Check if the click is outside search form
      if (searchForm && searchForm.classList.contains("active") && 
          !searchForm.contains(e.target) && e.target !== searchBtn) {
        searchForm.classList.remove("active");
      }
      
      // Check if the click is outside cart
      if (cartItemContainer && cartItemContainer.classList.contains("active") && 
          !cartItemContainer.contains(e.target) && e.target !== cartBtn) {
        cartItemContainer.classList.remove("active");
      }
      
      // Check if the click is outside user profile dropdown
      if (userProfileDropdown && userProfileDropdown.classList.contains("active") && 
          !userProfileDropdown.contains(e.target) && e.target !== userProfileBtn) {
        userProfileDropdown.classList.remove("active");
      }
      
      // Check if the click is outside navbar on mobile
      if (window.innerWidth <= 768 && navbar && navbar.classList.contains("active") && 
          !navbar.contains(e.target) && e.target !== barsBtn) {
        navbar.classList.remove("active");
      }
    });
    
    // Xử lý xóa sản phẩm khỏi giỏ hàng
    const removeButtons = document.querySelectorAll(".cart-item .fa-times");
    if (removeButtons.length > 0) {
      removeButtons.forEach(function(button) {
        button.addEventListener("click", function(e) {
          e.stopPropagation();
          console.log('Debug: Remove button clicked');
          const cartItem = this.parentElement;
          
          // Cập nhật giỏ hàng
          cartItem.remove();
          UI.updateCartCount();
          UI.updateCartTotal();
          UI.updateCartInStorage();
          
          // Hiển thị thông báo
          UI.createNotification("Sản phẩm đã được xóa khỏi giỏ hàng!", "success");
        });
      });
    }
    
    // Cập nhật số lượng giỏ hàng và trạng thái đăng nhập
    UI.updateCartCount();
    UI.setHeaderVisibilityByLoginStatus();
  }

  /**
   * Thiết lập các liên kết trong dropdown tài khoản
   */
  static setupUserDropdownLinks() {
    // Xử lý các liên kết trong dropdown
    const profileLink = document.getElementById('profile-link');
    const ordersLink = document.getElementById('orders-link');
    const wishlistLink = document.getElementById('wishlist-link');
    const adminLink = document.getElementById('admin-link');
    const logoutBtn = document.getElementById('logout-btn');
    const loginLink = document.getElementById('login-link');
    
    if (profileLink) {
      profileLink.addEventListener('click', () => {
        window.location.href = 'profile.html';
      });
    }
    
    if (ordersLink) {
      ordersLink.addEventListener('click', () => {
        window.location.href = 'user-orders.html';
      });
    }
    
    if (wishlistLink) {
      wishlistLink.addEventListener('click', () => {
        window.location.href = 'user-wishlist.html';
      });
    }
    
    if (adminLink) {
      adminLink.addEventListener('click', () => {
        window.location.href = 'admin/admin.html';
      });
    }
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        window.location.href = 'index.html';
      });
    }
    
    if (loginLink) {
      loginLink.addEventListener('click', () => {
        window.location.href = 'login.html';
      });
    }
  }
  
  /**
   * Tải dữ liệu giỏ hàng từ localStorage hoặc API
   */
  static loadCartData() {
    const cartContainer = document.querySelector('.cart-item-container');
    const cartItemsContainer = cartContainer?.querySelector('.cart-items-container');
    
    if (!cartContainer) return;
    
    // Xóa tất cả cart item hiện tại (trừ nút thanh toán)
    const existingItems = cartContainer.querySelectorAll('.cart-item');
    existingItems.forEach(item => item.remove());
    
    // Tải dữ liệu giỏ hàng từ localStorage
    let cartItems = [];
    const cartData = localStorage.getItem('cart');
    
    if (cartData) {
      try {
        cartItems = JSON.parse(cartData);
      } catch (e) {
        console.error('Error parsing cart data:', e);
        cartItems = [];
      }
    }
    
    // Nếu không có dữ liệu, dùng dữ liệu mẫu
    if (!cartItems || cartItems.length === 0) {
      cartItems = [
        {
          id: 1,
          name: 'Cà phê Arabica Cầu Đất',
          price: 15000,
          originalPrice: 20000,
          image: 'img/coffee1.jpg',
          quantity: 1
        },
        {
          id: 2,
          name: 'Cà phê Robusta Buôn Ma Thuột',
          price: 15000,
          originalPrice: 20000,
          image: 'img/coffee2.jpg',
          quantity: 1
        },
        {
          id: 3,
          name: 'Cà phê Cherry',
          price: 15000,
          originalPrice: 20000,
          image: 'img/coffee3.jpg',
          quantity: 1
        }
      ];
      
      // Lưu dữ liệu mẫu vào localStorage
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
    
    // Hiển thị các sản phẩm
    const checkoutBtn = cartContainer.querySelector('.btn');
    
    cartItems.forEach(item => {
      const cartItemElement = document.createElement('div');
      cartItemElement.className = 'cart-item';
      cartItemElement.dataset.id = item.id;
      
      cartItemElement.innerHTML = `
        <span class="fa fa-times"></span>
        <img src="${item.ImageUrl}" alt="${item.Name}" width="100px" height="100px" />
        <div class="content">
          <h3>${item.Name}</h3>
          <div class="price">${item.Price.toLocaleString()}₫</div>
          <div class="quantity">
            <button class="decrease-qty">-</button>
            <span class="qty">${item.Quantity}</span>
            <button class="increase-qty">+</button>
          </div>
        </div>
      `;
      
      // Thêm item vào trước nút thanh toán
      if (checkoutBtn) {
        cartContainer.insertBefore(cartItemElement, checkoutBtn);
      } else {
        cartContainer.appendChild(cartItemElement);
      }
      
      // Xử lý sự kiện xóa sản phẩm
      const removeBtn = cartItemElement.querySelector('.fa-times');
      if (removeBtn) {
        removeBtn.addEventListener('click', function() {
          this.closest('.cart-item').remove();
          UI.updateCartCount();
          UI.updateCartTotal();
          UI.updateCartInStorage();
        });
      }
      
      // Xử lý sự kiện tăng/giảm số lượng
      const decreaseBtn = cartItemElement.querySelector('.decrease-qty');
      const increaseBtn = cartItemElement.querySelector('.increase-qty');
      const qtyElement = cartItemElement.querySelector('.qty');
      
      if (decreaseBtn && qtyElement) {
        decreaseBtn.addEventListener('click', function() {
          let qty = parseInt(qtyElement.textContent);
          if (qty > 1) {
            qty--;
            qtyElement.textContent = qty;
            UI.updateCartInStorage();
          }
        });
      }
      
      if (increaseBtn && qtyElement) {
        increaseBtn.addEventListener('click', function() {
          let qty = parseInt(qtyElement.textContent);
          qty++;
          qtyElement.textContent = qty;
          UI.updateCartInStorage();
        });
      }
    });
    
    // Cập nhật số lượng và tổng tiền
    this.updateCartCount();
    this.updateCartTotal();
  }
  
  /**
   * Cập nhật giỏ hàng trong localStorage
   */
  static updateCartInStorage() {
    const cartItems = document.querySelectorAll('.cart-item');
    const cartData = [];
    
    cartItems.forEach(item => {
      const id = item.dataset.id;
      const name = item.querySelector('h3').textContent;
      const priceText = item.querySelector('.price').textContent;
      const price = parseInt(priceText.replace(/[^\d]/g, ''));
      const quantity = parseInt(item.querySelector('.qty')?.textContent || '1');
      const image = item.querySelector('img').src;
      
      cartData.push({
        id,
        name,
        price,
        originalPrice: price,
        image,
        quantity
      });
    });
    
    localStorage.setItem('cart', JSON.stringify(cartData));
  }
  
  /**
   * Cập nhật số lượng giỏ hàng
   */
  static updateCartCount() {
    // Lấy tất cả các phần tử hiển thị số lượng
    const cartCountElements = document.querySelectorAll('.cart-count, #cart-count');
    
    if (cartCountElements.length === 0) {
      console.warn('Không tìm thấy phần tử hiển thị số lượng giỏ hàng');
      return;
    }
    
    // Lấy dữ liệu giỏ hàng từ localStorage
    let cartItems = [];
    try {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        cartItems = JSON.parse(cartData);
      }
    } catch (e) {
      console.error('Lỗi khi lấy dữ liệu giỏ hàng:', e);
    }
    
    // Tính tổng số lượng
    const totalQuantity = Array.isArray(cartItems) 
      ? cartItems.reduce((total, item) => total + (item.quantity || item.Quantity || 1), 0)
      : 0;
    
    // Cập nhật tất cả các phần tử hiển thị số lượng
    cartCountElements.forEach(element => {
      element.textContent = totalQuantity;
      
      // Hiển thị/ẩn tùy thuộc vào số lượng
      if (totalQuantity > 0) {
        element.style.display = 'flex';
      } else {
        element.style.display = 'none';
      }
    });
  }

  /**
   * Cập nhật tổng tiền giỏ hàng
   */
  static updateCartTotal() {
    const cartItems = document.querySelectorAll('.cart-item');
    const checkoutBtn = document.querySelector('.cart-item-container .btn');
    
    let total = 0;
    
    cartItems.forEach(item => {
      const priceText = item.querySelector('.price').textContent;
      const price = parseInt(priceText.replace(/[^\d]/g, ''));
      const quantity = parseInt(item.querySelector('.qty')?.textContent || '1');
      
      total += price * quantity;
    });
    
    // Cập nhật tổng tiền nếu có element hiển thị tổng tiền
    const totalElement = document.querySelector('.cart-total-amount');
    if (totalElement) {
      totalElement.textContent = total.toLocaleString() + '₫';
    }
    
    // Hoặc cập nhật nút thanh toán
    if (checkoutBtn) {
      checkoutBtn.textContent = `Thanh toán (${total.toLocaleString()}₫)`;
    }
  }

  /**
   * Thiết lập hiển thị các phần tử trong header dựa vào trạng thái đăng nhập
   */
  static setHeaderVisibilityByLoginStatus() {
    const token = localStorage.getItem("token");
    const userProfileBtn = document.getElementById("user-profile-btn");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const registerBtn = document.getElementById("register-btn");
    const cartBtn = document.getElementById("cart-btn");
    
    if (token) {
      // Người dùng đã đăng nhập
      if (userProfileBtn) userProfileBtn.style.display = "block";
      if (loginBtn) loginBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "block";
      if (registerBtn) registerBtn.style.display = "none";
      if (cartBtn) cartBtn.style.display = "block";
      
      // Cập nhật thông tin user trong dropdown
      const userName = document.getElementById("user-name");
      const user = JSON.parse(localStorage.getItem("user"));
      
      if (userName && user) {
        userName.textContent = user.username || "Người dùng";
      }
      
      // Hiển thị các liên kết trong dropdown
      const profileLink = document.getElementById("profile-link");
      const ordersLink = document.getElementById("orders-link");
      const wishlistLink = document.getElementById("wishlist-link");
      const adminLink = document.getElementById("admin-link");
      const logoutBtnLink = document.getElementById("logout-btn");
      const loginLink = document.getElementById("login-link");
      
      if (profileLink) profileLink.style.display = "block";
      if (ordersLink) ordersLink.style.display = "block";
      if (wishlistLink) wishlistLink.style.display = "block";
      if (logoutBtnLink) logoutBtnLink.style.display = "block";
      if (loginLink) loginLink.style.display = "none";
      
      // Hiển thị menu admin nếu là admin
      if (user && user.role === "admin" && adminLink) {
        adminLink.style.display = "block";
      }
    } else {
      // Người dùng chưa đăng nhập
      if (userProfileBtn) userProfileBtn.style.display = "none";
      if (loginBtn) loginBtn.style.display = "block";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (registerBtn) registerBtn.style.display = "block";
      if (cartBtn) cartBtn.style.display = "block";
    }
  }

  /**
   * Xử lý các click bên ngoài các dropdown
   */
  static handleOutsideClicks(e) {
    const navbar = document.querySelector('.navbar');
    const searchForm = document.querySelector('.search-form');
    const cartItemContainer = document.querySelector('.cart-item-container');
    const userProfileDropdown = document.querySelector('.user-profile-dropdown');
    
    if (navbar && !e.target.closest('.navbar') && 
        !e.target.closest('#bars-btn')) {
      navbar.classList.remove('active');
    }
    
    if (searchForm && !e.target.closest('.search-form') && 
        !e.target.closest('#search-btn')) {
      searchForm.classList.remove('active');
    }
    
    if (cartItemContainer && !e.target.closest('.cart-item-container') && 
        !e.target.closest('#cart-btn')) {
      cartItemContainer.classList.remove('active');
    }
    
    if (userProfileDropdown && !e.target.closest('.user-profile-dropdown') && 
        !e.target.closest('#user-profile-btn')) {
      userProfileDropdown.classList.remove('active');
    }
  }

  /**
   * Thiết lập các hiệu ứng UI
   */
  static setupUIEffects() {
    // Hiệu ứng lazy-load cho hình ảnh
    this.setupLazyLoading();
    
    // Hiệu ứng animation khi cuộn
    this.setupScrollAnimations();
    
    // Hiệu ứng slider nếu có
    this.setupSliders();
  }

  /**
   * Xử lý sự kiện cuộn trang
   */
  static handleScrollEvents() {
    // Hiển thị/ẩn nút quay lại đầu trang
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // Hiển thị/ẩn thanh điều hướng cố định
    const header = document.querySelector('header');
    if (header) {
      if (window.scrollY > 100) {
        header.classList.add('fixed-header');
      } else {
        header.classList.remove('fixed-header');
      }
    }
  }

  /**
   * Hiển thị/ẩn menu trên thiết bị di động
   */
  static toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    
    if (mobileMenu && mobileMenuBtn) {
      mobileMenu.classList.toggle('active');
      mobileMenuBtn.classList.toggle('active');
      
      // Thêm/xóa lớp no-scroll cho body khi menu mở
      document.body.classList.toggle('no-scroll');
    }
  }

  /**
   * Hiển thị/ẩn thanh tìm kiếm
   */
  static toggleSearchBar() {
    const searchBar = document.getElementById('search-container');
    
    if (searchBar) {
      searchBar.classList.toggle('active');
      
      // Focus vào ô tìm kiếm khi hiển thị
      if (searchBar.classList.contains('active')) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          setTimeout(() => {
            searchInput.focus();
          }, 100);
        }
      }
    }
  }

  /**
   * Xử lý tìm kiếm
   */
  static handleSearch() {
    const searchInput = document.getElementById('search-input');
    
    if (searchInput && searchInput.value.trim()) {
      const searchQuery = searchInput.value.trim();
      
      // Chuyển hướng đến trang kết quả tìm kiếm
      window.location.href = `search.html?q=${encodeURIComponent(searchQuery)}`;
    }
  }

  /**
   * Thiết lập lazy-loading cho hình ảnh
   */
  static setupLazyLoading() {
    // Sử dụng Intersection Observer API để lazy-load hình ảnh
    if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('img[data-src]');
      
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      });
      
      lazyImages.forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      // Fallback cho trình duyệt không hỗ trợ Intersection Observer
      const lazyImages = document.querySelectorAll('img[data-src]');
      
      lazyImages.forEach(img => {
        img.src = img.dataset.src;
      });
    }
  }

  /**
   * Thiết lập hiệu ứng animation khi cuộn
   */
  static setupScrollAnimations() {
    if ('IntersectionObserver' in window) {
      const elements = document.querySelectorAll('.animate-on-scroll');
      
      const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      elements.forEach(element => {
        animationObserver.observe(element);
      });
    } else {
      // Fallback cho trình duyệt không hỗ trợ Intersection Observer
      const elements = document.querySelectorAll('.animate-on-scroll');
      
      elements.forEach(element => {
        element.classList.add('animated');
      });
    }
  }

  /**
   * Thiết lập sliders
   */
  static setupSliders() {
    const sliders = document.querySelectorAll('.slider-container');
    
    sliders.forEach(slider => {
      this.initializeSlider(slider);
    });
  }

  /**
   * Khởi tạo slider
   * @param {Element} sliderContainer - Container của slider
   */
  static initializeSlider(sliderContainer) {
    if (!sliderContainer) return;
    
    const sliderTrack = sliderContainer.querySelector('.slider-track');
    const slides = sliderContainer.querySelectorAll('.slide');
    const prevButton = sliderContainer.querySelector('.slider-prev');
    const nextButton = sliderContainer.querySelector('.slider-next');
    
    if (!sliderTrack || slides.length === 0) return;
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    
    // Thiết lập width cho slider track
    sliderTrack.style.width = `${totalSlides * 100}%`;
    
    // Thiết lập width cho từng slide
    slides.forEach(slide => {
      slide.style.width = `${100 / totalSlides}%`;
    });
    
    // Xử lý nút prev
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        this.updateSlider(sliderTrack, currentIndex);
      });
    }
    
    // Xử lý nút next
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        this.updateSlider(sliderTrack, currentIndex);
      });
    }
    
    // Auto slide (optional)
    if (sliderContainer.dataset.autoSlide === 'true') {
      const interval = parseInt(sliderContainer.dataset.interval) || 5000;
      
      setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        this.updateSlider(sliderTrack, currentIndex);
      }, interval);
    }
  }

  /**
   * Cập nhật vị trí của slider
   * @param {Element} sliderTrack - Track của slider
   * @param {number} index - Chỉ số slide hiện tại
   */
  static updateSlider(sliderTrack, index) {
    if (!sliderTrack) return;
    
    const translateX = -index * (100 / sliderTrack.children.length);
    sliderTrack.style.transform = `translateX(${translateX}%)`;
  }

  /**
   * Tạo thông báo
   * @param {string} message - Nội dung thông báo
   * @param {string} type - Loại thông báo (info, success, warning, error)
   * @param {number} duration - Thời gian hiển thị (ms)
   * @returns {Element} - Element thông báo
   */
  static createNotification(message, type = 'info', duration = 3000) {
    
    // Tạo container cho notifications nếu chưa tồn tại
    let notificationsContainer = document.getElementById('notifications-container');
    if (!notificationsContainer) {
      notificationsContainer = document.createElement('div');
      notificationsContainer.id = 'notifications-container';
      document.body.appendChild(notificationsContainer);
    }
    
    // Tạo notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-message">${message}</div>
        <button class="notification-close">&times;</button>
      </div>
      <div class="notification-progress"></div>
    `;
    
    // Thêm notification vào container
    notificationsContainer.appendChild(notification);
    
    // Hiệu ứng progress bar
    const progressBar = notification.querySelector('.notification-progress');
    progressBar.style.animationDuration = `${duration}ms`;
    
    // Xử lý nút đóng
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
      notification.classList.add('notification-hiding');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
    
    // Tự động đóng sau khoảng thời gian
    setTimeout(() => {
      notification.classList.add('notification-hiding');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
    
    return notification;
  }

  /**
   * Tạo modal
   * @param {string} title - Tiêu đề modal
   * @param {string|Element} content - Nội dung modal (HTML hoặc Element)
   * @param {Object} options - Các tùy chọn cho modal
   * @returns {Element} - Element modal
   */
  static createModal(title, content, options = {}) {
    const modalOptions = {
      closable: true,
      closeOnEscape: true,
      closeOnClickOutside: true,
      maxWidth: '500px',
      onClose: null,
      ...options
    };
    
    // Tạo modal container
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    modalContainer.style.maxWidth = modalOptions.maxWidth;
    
    // Tạo modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const modalTitle = document.createElement('h3');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = title;
    
    modalHeader.appendChild(modalTitle);
    
    // Tạo nút đóng nếu modal có thể đóng
    if (modalOptions.closable) {
      const closeButton = document.createElement('button');
      closeButton.className = 'modal-close';
      closeButton.innerHTML = '&times;';
      closeButton.addEventListener('click', () => {
        this.closeModal(modalOverlay, modalOptions.onClose);
      });
      
      modalHeader.appendChild(closeButton);
    }
    
    // Tạo modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    
    if (typeof content === 'string') {
      modalBody.innerHTML = content;
    } else if (content instanceof Element) {
      modalBody.appendChild(content);
    }
    
    // Tạo modal footer nếu có
    let modalFooter = null;
    if (options.footer) {
      modalFooter = document.createElement('div');
      modalFooter.className = 'modal-footer';
      
      if (typeof options.footer === 'string') {
        modalFooter.innerHTML = options.footer;
      } else if (options.footer instanceof Element) {
        modalFooter.appendChild(options.footer);
      }
    }
    
    // Ghép các phần lại với nhau
    modalContainer.appendChild(modalHeader);
    modalContainer.appendChild(modalBody);
    
    if (modalFooter) {
      modalContainer.appendChild(modalFooter);
    }
    
    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);
    
    // Xử lý sự kiện click bên ngoài
    if (modalOptions.closeOnClickOutside) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.closeModal(modalOverlay, modalOptions.onClose);
        }
      });
    }
    
    // Xử lý sự kiện nhấn ESC
    if (modalOptions.closeOnEscape) {
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          this.closeModal(modalOverlay, modalOptions.onClose);
          document.removeEventListener('keydown', escHandler);
        }
      };
      
      document.addEventListener('keydown', escHandler);
    }
    
    // Show modal với animation
    setTimeout(() => {
      modalOverlay.classList.add('active');
      modalContainer.classList.add('active');
    }, 10);
    
    return modalOverlay;
  }

  /**
   * Đóng modal
   * @param {Element} modalContainer - Container của modal
   * @param {Function} onClose - Callback khi đóng modal
   */
  static closeModal(modalContainer, onClose = null) {
    if (!modalContainer) return;
    
    modalContainer.classList.remove('active');
    
    const modal = modalContainer.querySelector('.modal-container');
    if (modal) {
      modal.classList.remove('active');
    }
    
    setTimeout(() => {
      modalContainer.remove();
      
      if (typeof onClose === 'function') {
        onClose();
      }
    }, 300);
  }

  /**
   * Tạo hộp thoại xác nhận
   * @param {string} message - Nội dung xác nhận
   * @param {Function} onConfirm - Callback khi nhấn Xác nhận
   * @param {Function} onCancel - Callback khi nhấn Hủy
   * @returns {Element} - Element modal
   */
  static confirmDialog(message, onConfirm, onCancel = null) {
    // Tạo nội dung modal
    const content = document.createElement('div');
    content.className = 'confirm-dialog-content';
    content.innerHTML = `<p>${message}</p>`;
    
    // Tạo footer với nút xác nhận và hủy
    const footer = document.createElement('div');
    footer.className = 'confirm-dialog-actions';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-secondary';
    cancelButton.textContent = 'Hủy';
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'btn btn-primary';
    confirmButton.textContent = 'Xác nhận';
    
    footer.appendChild(cancelButton);
    footer.appendChild(confirmButton);
    
    // Tạo modal
    const modal = this.createModal('Xác nhận', content, {
      footer: footer,
      maxWidth: '400px',
      closeOnEscape: true,
      closeOnClickOutside: false
    });
    
    // Xử lý sự kiện nút Hủy
    cancelButton.addEventListener('click', () => {
      this.closeModal(modal);
      
      if (typeof onCancel === 'function') {
        onCancel();
      }
    });
    
    // Xử lý sự kiện nút Xác nhận
    confirmButton.addEventListener('click', () => {
      this.closeModal(modal);
      
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    });
    
    return modal;
  }

  /**
   * Hiển thị loading spinner
   * @param {string} containerId - ID của container để hiển thị spinner
   * @param {boolean} fullscreen - Hiển thị toàn màn hình
   * @returns {Element} - Element spinner
   */
  static showLoading(containerId = null, fullscreen = false) {
    const spinner = document.createElement('div');
    spinner.className = fullscreen ? 'loading-spinner fullscreen' : 'loading-spinner';
    spinner.innerHTML = `
      <div class="spinner-container">
        <div class="spinner"></div>
      </div>
    `;
    
    // Thêm vào container hoặc body
    if (containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        container.appendChild(spinner);
      } else {
        document.body.appendChild(spinner);
      }
    } else {
      document.body.appendChild(spinner);
    }
    
    return spinner;
  }

  /**
   * Ẩn loading spinner
   * @param {Element} spinner - Element spinner
   */
  static hideLoading(spinner) {
    if (!spinner) return;
    
    spinner.classList.add('loading-spinner-hiding');
    setTimeout(() => {
      spinner.remove();
    }, 300);
  }

  loadCartItems() {
    const cartItemContainer = document.querySelector('.cart-item-container');
    if (!cartItemContainer) return;

    // Lấy dữ liệu giỏ hàng từ localStorage
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Nếu giỏ hàng trống, hiển thị 2 sản phẩm mẫu để kiểm thử
    if (cartItems.length === 0) {
      cartItems = [
        {
          id: 1,
          name: 'Cà phê Arabica',
          price: 149000,
          quantity: 2,
          image: './images/products/product-1.jpg'
        },
        {
          id: 2,
          name: 'Cà phê Robusta',
          price: 129000,
          quantity: 1,
          image: './images/products/product-2.jpg'
        }
      ];
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
     
    
    // Cập nhật số lượng sản phẩm hiển thị trên biểu tượng giỏ hàng
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      const totalQuantity = cartItems.reduce((sum, item) => sum + item.Quantity, 0);
      cartCount.textContent = totalQuantity;
      cartCount.style.display = totalQuantity > 0 ? 'flex' : 'none';
    }
    
    // Xóa nội dung cũ
    cartItemContainer.innerHTML = '';
    
    // Hiển thị các sản phẩm trong giỏ hàng
    cartItems.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.classList.add('cart-item');
      cartItem.dataset.id = item.id;
      
      cartItem.innerHTML = `
        <div class="image">
          <img src="${item.ImageUrl}" alt="${item.Name}" width="50" height="50">
        </div>
        <div class="content">
          <h3>${item.Name}</h3>
          <div class="price">${this.formatCurrency(item.Price)}</div>
          <div class="quantity">
            <button class="decrease"><i class="fas fa-minus"></i></button>
            <span class="qty">${item.Quantity}</span>
            <button class="increase"><i class="fas fa-plus"></i></button>
          </div>
        </div>
        <i class="fas fa-times remove-item"></i>
      `;
      
      cartItemContainer.appendChild(cartItem);
    });
    
    // Thêm phần tổng tiền
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
    const cartTotal = document.createElement('div');
    cartTotal.classList.add('cart-total');
    cartTotal.innerHTML = `
      <div class="cart-total-label">Tổng tiền:</div>
      <div class="cart-total-amount">${this.formatCurrency(totalAmount)}</div>
    `;
    cartItemContainer.appendChild(cartTotal);
    
    // Thêm nút thanh toán
    const checkoutButton = document.createElement('a');
    checkoutButton.href = './index-checkout.html';
    checkoutButton.classList.add('btn', 'primary-btn');
    checkoutButton.textContent = 'Thanh toán';
    cartItemContainer.appendChild(checkoutButton);
    
    // Gắn sự kiện cho các nút trong giỏ hàng
    this.addCartItemEvents();
  }
  
  addCartItemEvents() {
    // Gắn sự kiện cho nút xóa sản phẩm
    const removeButtons = document.querySelectorAll('.cart-item .remove-item');
    removeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const cartItem = e.target.closest('.cart-item');
        const itemId = parseInt(cartItem.dataset.id);
        
        // Xóa sản phẩm khỏi localStorage
        let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        cartItems = cartItems.filter(item => item.id !== itemId);
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        
        // Xóa sản phẩm khỏi DOM
        cartItem.remove();
        
        // Cập nhật lại tổng tiền và số lượng
        this.updateCartTotal();
        this.updateCartCount();
      });
    });
    
    // Gắn sự kiện cho nút tăng số lượng
    const increaseButtons = document.querySelectorAll('.cart-item .increase');
    increaseButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const cartItem = e.target.closest('.cart-item');
        const itemId = parseInt(cartItem.dataset.id);
        const qtyElement = cartItem.querySelector('.qty');
        
        // Cập nhật số lượng trong localStorage
        let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const index = cartItems.findIndex(item => item.id === itemId);
        if (index !== -1) {
          cartItems[index].Quantity += 1;
          localStorage.setItem('cartItems', JSON.stringify(cartItems));
          
          // Cập nhật số lượng trên DOM
          qtyElement.textContent = cartItems[index].Quantity;
          
          // Cập nhật tổng tiền và số lượng
          this.updateCartTotal();
          this.updateCartCount();
        }
      });
    });
    
    // Gắn sự kiện cho nút giảm số lượng
    const decreaseButtons = document.querySelectorAll('.cart-item .decrease');
    decreaseButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const cartItem = e.target.closest('.cart-item');
        const itemId = parseInt(cartItem.dataset.id);
        const qtyElement = cartItem.querySelector('.qty');
        
        // Cập nhật số lượng trong localStorage
        let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const index = cartItems.findIndex(item => item.id === itemId);
        if (index !== -1 && cartItems[index].Quantity > 1) {
          cartItems[index].Quantity -= 1;
          localStorage.setItem('cartItems', JSON.stringify(cartItems));
          
          // Cập nhật số lượng trên DOM
          qtyElement.textContent = cartItems[index].Quantity;
          
          // Cập nhật tổng tiền và số lượng
          this.updateCartTotal();
          this.updateCartCount();
        }
      });
    });
  }
  
  updateCartTotal() {
    const cartTotal = document.querySelector('.cart-total-amount');
    if (!cartTotal) return;
    
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
    cartTotal.textContent = this.formatCurrency(totalAmount);
  }
  
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }
}

// Khởi tạo UI khi document ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Debug: UI initializing...');
  UI.init();
  console.log('Debug: UI initialized');
});

// Xuất module để sử dụng trong các file khác
window.UI = UI;

// Thêm hàm hiển thị thông báo
function showNotification(type, message, duration = 3000) {
    const container = document.getElementById('notification-container') || createNotificationContainer();
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Icon dựa theo loại thông báo
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-times-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'info':
        default:
            icon = '<i class="fas fa-info-circle"></i>';
            break;
    }
    
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">${message}</div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    container.appendChild(notification);
    
    // Hiệu ứng hiện thông báo
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Tự động đóng sau duration
    const timeout = setTimeout(() => {
        closeNotification(notification);
    }, duration);
    
    // Thêm sự kiện đóng thông báo khi click nút đóng
    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            clearTimeout(timeout);
            closeNotification(notification);
        });
    }
}

// Tạo container cho thông báo nếu chưa có
function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    document.body.appendChild(container);
    return container;
}

// Đóng thông báo
function closeNotification(notification) {
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
        }
    }, 300); // 300ms là thời gian của hiệu ứng đóng
}

// Gắn hàm showNotification vào window để các hàm khác có thể truy cập
window.showNotification = showNotification; 