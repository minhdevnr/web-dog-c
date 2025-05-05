/**
 * product.js - Xử lý các chức năng liên quan đến sản phẩm và quản lý sản phẩm
 */

// Cấu hình API
const API_URL = 'https://localhost:7175'; // URL API dịch vụ

// Fallback nếu API không khả dụng 
const USE_SAMPLE_DATA = false; // Đặt thành true để dùng dữ liệu mẫu, false để dùng API

// Class quản lý sản phẩm
class ProductManager {
  // Danh sách sản phẩm mẫu (fallback)
  static sampleProducts = [
    {
      id: 'cf001',
      name: 'Cà Phê Phin Truyền Thống',
      price: 15000,
      category: 'coffee',
      image: 'img/coffee1.jpg',
      description: 'Hương vị đậm đà, đắng nhẹ và hậu vị ngọt sâu của cà phê rang xay truyền thống Việt Nam.'
    },
    {
      id: 'cf002',
      name: 'Cà Phê Arabica Cầu Đất',
      price: 15000,
      category: 'coffee',
      image: 'img/coffee2.jpg',
      description: 'Tinh tế với hương thơm ngọt nhẹ của trái cây và hoa, kết hợp với vị chua dịu.'
    },
    {
      id: 'cf003',
      name: 'Trà Hoa Cúc',
      price: 15000,
      category: 'tea',
      image: 'img/tea1.jpg',
      description: 'Trà hoa cúc thơm ngọt, giúp thư giãn và có lợi cho sức khỏe.'
    },
    {
      id: 'cf004',
      name: 'Cà Phê Sữa Đá',
      price: 15000,
      category: 'coffee',
      image: 'img/coffee3.jpg',
      description: 'Cà phê đen đậm đà hòa quyện với sữa đặc tạo nên hương vị ngọt ngào, đậm đà.'
    }
  ];

  /**
   * Khởi tạo quản lý sản phẩm
   */
  static init() {
    // Khởi tạo các sự kiện
    this.setupProductEvents();
    // Tải danh sách sản phẩm nếu cần
    this.loadProductsIfNeeded();
  }

  /**
   * Thiết lập các sự kiện liên quan đến sản phẩm
   */
  static setupProductEvents() {
    // Xử lý sự kiện tìm kiếm
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
      const searchInput = searchForm.querySelector('#search-box');
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (searchInput && searchInput.value.trim()) {
          this.searchProductsAndDisplay(searchInput.value.trim());
        }
      });
    }

    // Xử lý sự kiện bộ lọc danh mục
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
      filter.addEventListener('click', (e) => {
        e.preventDefault();
        debugger;
        const category = filter.getAttribute('data-category');
        this.filterProductsByCategory(category);
      });
    });

    // Sự kiện cho trang quản lý sản phẩm (admin)
    const addProductButton = document.getElementById('addProductButton');
    if (addProductButton) {
      addProductButton.addEventListener('click', () => {
        this.openProductModal();
      });
    }

    const saveProductButton = document.getElementById('saveProductButton');
    if (saveProductButton) {
      saveProductButton.addEventListener('click', () => {
        this.saveProduct();
      });
    }

    // Sự kiện xem trước ảnh sản phẩm
    const productImage = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    if (productImage && imagePreview) {
      productImage.addEventListener('change', (event) => {
        if (event.target.files && event.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
          };
          reader.readAsDataURL(event.target.files[0]);
        }
      });
    }
  }

  /**
   * Tải danh sách sản phẩm nếu đang ở trang sản phẩm
   */
  static loadProductsIfNeeded() {
    // Kiểm tra xem có đang ở trang hiển thị sản phẩm hay quản lý sản phẩm hay không
    const productsContainer = document.querySelector('#products-container');
    if (productsContainer) {
      this.renderProductList();
    }

    const productTable = document.getElementById('productTable');
    if (productTable) {
      this.loadAdminProducts();
    }
  }

  /**
   * Lấy danh sách sản phẩm từ API
   * @returns {Promise<Array>} Danh sách sản phẩm
   */
  static async getProducts() {
    
    // Sử dụng dữ liệu mẫu nếu được cấu hình
    if (USE_SAMPLE_DATA) {
      console.log('Sử dụng dữ liệu sản phẩm mẫu');
      return this.sampleProducts;
    }

    try {
      // Gọi API để lấy danh sách sản phẩm
      const response = await fetch(`${API_URL}/api/product`);
      if (!response.ok) {
        throw new Error(`Không thể lấy danh sách sản phẩm (${response.status})`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
      // Trả về dữ liệu mẫu nếu có lỗi
      console.log('Sử dụng dữ liệu sản phẩm mẫu do lỗi API');
      return this.sampleProducts;
    }
  }

  /**
   * Lấy chi tiết sản phẩm theo ID
   * @param {string} productId - ID của sản phẩm
   * @returns {Promise<Object|null>} Thông tin sản phẩm hoặc null nếu không tìm thấy
   */
  static async getProductById(productId) {
      
    // Sử dụng dữ liệu mẫu nếu được cấu hình
    if (USE_SAMPLE_DATA) {
      const product = this.sampleProducts.find(p => p.id === productId);
      return product || null;
    }

    try {
      // Gọi API để lấy chi tiết sản phẩm
      const response = await fetch(`${API_URL}/api/product/${productId}`);
      if (!response.ok) {
        throw new Error(`Không thể lấy chi tiết sản phẩm (${response.status})`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
      // Tìm trong dữ liệu mẫu nếu có lỗi
      return this.sampleProducts.find(product => product.id === productId) || null;
    }
  }

  /**
   * Lấy danh sách sản phẩm theo danh mục
   * @param {string} category - Danh mục sản phẩm
   * @returns {Promise<Array>} Danh sách sản phẩm theo danh mục
   */
  static async getProductsByCategory(category) {
    try {
      const products = await this.getProducts();
      return products.filter(product => product.Category === category);
    } catch (error) {
      console.error('Lỗi khi lọc sản phẩm theo danh mục:', error);
      return [];
    }
  }

  /**
   * Tìm kiếm sản phẩm
   * @param {string} keyword - Từ khóa tìm kiếm
   * @returns {Promise<Array>} Danh sách sản phẩm phù hợp với từ khóa
   */
  static async searchProducts(keyword) {
    try {
      const products = await this.getProducts();
      const lowercasedKeyword = keyword.toLowerCase();
      
      return products.filter(product => 
        product.name.toLowerCase().includes(lowercasedKeyword) || 
        product.description.toLowerCase().includes(lowercasedKeyword)
      );
    } catch (error) {
      console.error('Lỗi khi tìm kiếm sản phẩm:', error);
      return [];
    }
  }

  /**
   * Hiển thị kết quả tìm kiếm
   * @param {Array} products - Danh sách sản phẩm tìm thấy
   * @param {string} keyword - Từ khóa tìm kiếm
   */
  static displaySearchResults(products, keyword) {
    debugger;
    // Tạo overlay chứa kết quả tìm kiếm
    let searchResultsContainer = document.getElementById('search-results-container');
    if (!searchResultsContainer) {
      searchResultsContainer = document.createElement('div');
      searchResultsContainer.id = 'search-results-container';
      searchResultsContainer.className = 'search-results-overlay';
      document.body.appendChild(searchResultsContainer);
    }

    // Xóa kết quả tìm kiếm cũ (nếu có)
    searchResultsContainer.innerHTML = '';

    // Tạo phần header của kết quả tìm kiếm
    const header = document.createElement('div');
    header.className = 'search-results-header';
    header.innerHTML = `
      <h3>Kết quả tìm kiếm: "${keyword}"</h3>
      <span class="close-search-results">&times;</span>
    `;
    searchResultsContainer.appendChild(header);

    // Thêm sự kiện đóng kết quả tìm kiếm
    header.querySelector('.close-search-results').addEventListener('click', () => {
      searchResultsContainer.style.display = 'none';
    });

    // Tạo bộ lọc tìm kiếm
    const filters = document.createElement('div');
    filters.className = 'search-filters';
    
    // Lấy tất cả các danh mục có trong kết quả tìm kiếm
    const categories = [...new Set(products.map(product => product.category))];
    
    filters.innerHTML = `
      <select id="category-filter">
        <option value="">Tất cả danh mục</option>
        ${categories.map(category => `<option value="${category}">${this.formatCategoryName(category)}</option>`).join('')}
      </select>
      <select id="price-filter">
        <option value="">Sắp xếp theo giá</option>
        <option value="asc">Giá tăng dần</option>
        <option value="desc">Giá giảm dần</option>
      </select>
    `;
    
    searchResultsContainer.appendChild(filters);
    
    // Hiển thị số lượng kết quả tìm kiếm
    const searchCount = document.createElement('div');
    searchCount.className = 'search-count';
    searchCount.textContent = `Tìm thấy ${products.length} sản phẩm`;
    searchResultsContainer.appendChild(searchCount);

    // Tạo phần nội dung kết quả tìm kiếm
    const content = document.createElement('div');
    content.className = 'search-results-content';
    
    if (products.length === 0) {
      content.innerHTML = '<p class="no-results">Không tìm thấy sản phẩm phù hợp</p>';
    } else {
      const resultsHtml = products.map(product => `
        <div class="search-result-item" data-id="${product.Id}" data-category="${product.Category}" data-price="${product.Price}">
          <img src="${product.ImageUrl}" alt="${product.Name}">
          <div class="search-result-info">
            <h4>${product.Name}</h4>
            <p class="search-result-price">${this.formatCurrency(product.Price)}</p>
            <p class="search-result-category">${this.formatCategoryName(product.Category)}</p>
          </div>
          <button class="add-to-cart-btn" data-id="${product.Id}">
            <i class="fas fa-shopping-cart"></i>
          </button>
        </div>
      `).join('');
      
      content.innerHTML = resultsHtml;
    }
    
    searchResultsContainer.appendChild(content);
    
    // Thêm sự kiện cho nút thêm vào giỏ hàng
    const addToCartButtons = content.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.stopPropagation();
        const productId = button.getAttribute('data-id');
        const product = await this.getProductById(productId);
        
        if (product) {
          // Gọi hàm thêm vào giỏ hàng nếu có
          if (window.Cart) {
            
            window.Cart.addItem(product);
          } else if (typeof Cart !== 'undefined') {
            Cart.addItem(product);
          } else if (window.CartManager && typeof window.CartManager.addToCart === 'function') {
            window.CartManager.addToCart(product);
          } else if (typeof addToCart === 'function') {
            addToCart(product);
          } else {
            console.error('Không tìm thấy chức năng giỏ hàng');
            this.showNotification('Không thể thêm sản phẩm vào giỏ hàng', 'error');
          }
        }
      });
    });
    
    // Thêm sự kiện khi click vào sản phẩm sẽ chuyển đến trang chi tiết
    const searchResultItems = content.querySelectorAll('.search-result-item');
    searchResultItems.forEach(item => {
      item.addEventListener('click', async () => {
        const productId = item.getAttribute('data-id');
        window.location.href = `product-detail.html?id=${productId}`;
      });
    });
    
    // Thêm sự kiện cho bộ lọc
    const categoryFilter = filters.querySelector('#category-filter');
    const priceFilter = filters.querySelector('#price-filter');
    
    const applyFilters = () => {
      const selectedCategory = categoryFilter.value;
      const selectedPriceOrder = priceFilter.value;
      
      // Lọc theo danh mục
      let filteredProducts = [...products];
      if (selectedCategory) {
        filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
      }
      
      // Sắp xếp theo giá
      if (selectedPriceOrder) {
        filteredProducts.sort((a, b) => {
          if (selectedPriceOrder === 'asc') {
            return a.Price - b.Price;
          } else {
            return b.Price - a.Price;
          }
        });
      }
      
      // Cập nhật UI
      searchCount.textContent = `Tìm thấy ${filteredProducts.length} sản phẩm`;
      
      if (filteredProducts.length === 0) {
        content.innerHTML = '<p class="no-results">Không tìm thấy sản phẩm phù hợp với bộ lọc</p>';
      } else {
        const resultsHtml = filteredProducts.map(product => `
          <div class="search-result-item" data-id="${product.Id}" data-category="${product.Category}" data-price="${product.Price}">
            <img src="${product.ImageUrl}" alt="${product.Name}">
            <div class="search-result-info">
              <h4>${product.Name}</h4>
                <p class="search-result-price">${this.formatCurrency(product.Price)}</p>
              <p class="search-result-category">${this.formatCategoryName(product.Category)}</p>
            </div>
            <button class="add-to-cart-btn" data-id="${product.Id}">
              <i class="fas fa-shopping-cart"></i>
            </button>
          </div>
        `).join('');
        
        content.innerHTML = resultsHtml;
        
        // Thêm lại sự kiện cho các nút và sản phẩm sau khi thay đổi nội dung
        const newAddToCartButtons = content.querySelectorAll('.add-to-cart-btn');
        newAddToCartButtons.forEach(button => {
          button.addEventListener('click', async (e) => {
            e.stopPropagation();
            const productId = button.getAttribute('data-id');
            const product = await this.getProductById(productId);
            
            if (product) {
              if (window.Cart) {
                window.Cart.addItem(product);
              } else if (typeof Cart !== 'undefined') {
                Cart.addItem(product);
              } else if (window.CartManager && typeof window.CartManager.addToCart === 'function') {
                window.CartManager.addToCart(product);
              } else if (typeof addToCart === 'function') {
                addToCart(product);
              } else {
                console.error('Không tìm thấy chức năng giỏ hàng');
                this.showNotification('Không thể thêm sản phẩm vào giỏ hàng', 'error');
              }
            }
          });
        });
        
        const newSearchResultItems = content.querySelectorAll('.search-result-item');
        newSearchResultItems.forEach(item => {
          item.addEventListener('click', () => {
            const productId = item.getAttribute('data-id');
            window.location.href = `product-detail.html?id=${productId}`;
          });
        });
      }
    };
    
    categoryFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    
    // Hiển thị kết quả tìm kiếm
    searchResultsContainer.style.display = 'block';
  }

  /**
   * Định dạng tên danh mục
   * @param {string} category - Tên danh mục gốc
   * @returns {string} Tên danh mục đã được định dạng
   */
  static formatCategoryName(category) {
    // Ánh xạ danh mục
    const categoryMap = {
      'coffee': 'Cà phê',
      'tea': 'Trà',
      'cake': 'Bánh ngọt',
      'equipment': 'Thiết bị',
      'accessory': 'Phụ kiện'
    };
    
    return categoryMap[category] || category;
  }

  /**
   * Tìm kiếm và hiển thị kết quả tìm kiếm
   * @param {string} keyword - Từ khóa tìm kiếm
   */
  static async searchProductsAndDisplay(keyword) {
    // Hiển thị trạng thái đang tải
    let searchResultsContainer = document.getElementById('search-results-container');
    if (!searchResultsContainer) {
      searchResultsContainer = document.createElement('div');
      searchResultsContainer.id = 'search-results-container';
      searchResultsContainer.className = 'search-results-overlay';
      document.body.appendChild(searchResultsContainer);
    }
    
    searchResultsContainer.innerHTML = `
      <div class="search-results-header">
        <h3>Đang tìm kiếm...</h3>
        <span class="close-search-results">&times;</span>
      </div>
      <div class="search-results-content">
        <div style="text-align: center; padding: 20px;">
          <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--main-color);"></i>
          <p style="margin-top: 10px;">Đang tìm kiếm sản phẩm...</p>
        </div>
      </div>
    `;
    
    searchResultsContainer.style.display = 'block';
    
    // Thêm sự kiện đóng kết quả tìm kiếm
    const closeBtn = searchResultsContainer.querySelector('.close-search-results');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        searchResultsContainer.style.display = 'none';
      });
    }
    
    try {
      // Tìm kiếm sản phẩm
      const products = await this.searchProducts(keyword);
      
      // Hiển thị kết quả tìm kiếm
      this.displaySearchResults(products, keyword);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm sản phẩm:', error);
      
      // Hiển thị thông báo lỗi
      searchResultsContainer.innerHTML = `
        <div class="search-results-header">
          <h3>Lỗi tìm kiếm</h3>
          <span class="close-search-results">&times;</span>
        </div>
        <div class="search-results-content">
          <p class="no-results">Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.</p>
        </div>
      `;
      
      // Thêm lại sự kiện đóng
      searchResultsContainer.querySelector('.close-search-results').addEventListener('click', () => {
        searchResultsContainer.style.display = 'none';
      });
    }
  }

  /**
   * Lọc và hiển thị sản phẩm theo danh mục
   * @param {string} category - Danh mục sản phẩm
   */
  static async filterProductsByCategory(category) {
    debugger;
    const productsContainer = document.querySelector('#products-container');
    if (!productsContainer) return;

    // Hiển thị loading
    this.showLoading(productsContainer);

    try {
      const products = category === 'all' 
        ? await this.getProducts()
        : await this.getProductsByCategory(category);
      
      // Cập nhật UI với danh sách sản phẩm đã lọc
      this.renderProductsToContainer(products, productsContainer);
    } catch (error) {
      this.showError(productsContainer, 'Không thể tải sản phẩm');
    }
  }

  /**
   * Hiển thị danh sách sản phẩm
   */
  static async renderProductList() {
    
    const productsContainer = document.querySelector('#products-container');
    if (!productsContainer) return;

    // Hiển thị trạng thái đang tải
    this.showLoading(productsContainer);

    try {
      // Lấy danh sách sản phẩm
      const products = await this.getProducts();
      
      // Hiển thị danh sách sản phẩm
      this.renderProductsToContainer(products, productsContainer);
    } catch (error) {
      console.error('Lỗi khi hiển thị danh sách sản phẩm:', error);
      this.showError(productsContainer, 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
    }
  }

  /**
   * Render danh sách sản phẩm vào container
   * @param {Array} products - Danh sách sản phẩm
   * @param {Element} container - Container để render sản phẩm
   */
  static renderProductsToContainer(products, container) {
    debugger;
    // Xóa tất cả nội dung cũ
    container.innerHTML = '';
    
    // Thêm lọc danh mục nếu chưa có
    if (!container.previousElementSibling || !container.previousElementSibling.classList.contains('category-filter-container')) {
      const categories = this.getUniqueCategories(products.Items);
      if (categories.length > 0) {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'category-filter-container';
        filterContainer.innerHTML = `
          <div class="category-filters">
            <button class="filter-btn active" data-category="all">Tất cả</button>
            ${categories.map(cat => `<button class="filter-btn" data-category="${cat}">${cat}</button>`).join('')}
          </div>
        `;
        container.parentNode.insertBefore(filterContainer, container);
        
        // Thêm sự kiện cho các nút lọc
        const filterBtns = filterContainer.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            // Bỏ active tất cả các nút
            filterBtns.forEach(b => b.classList.remove('active'));
            // Thêm active cho nút được click
            btn.classList.add('active');
            
            const category = btn.getAttribute('data-category');
            if (category === 'all') {
              // Hiển thị tất cả sản phẩm
              this.renderProductItems(products.Items, container);
            } else {
              debugger;
              // Lọc sản phẩm theo danh mục
              const filteredProducts = products.Items.filter(p => p.Category.Name === category);
              this.renderProductItems(filteredProducts, container);
            }
          });
        });
      }
    }
    debugger;
    // Hiển thị sản phẩm
    this.renderProductItems(products.Items, container);
  }
  
  /**
   * Lấy danh sách các danh mục duy nhất từ danh sách sản phẩm
   * @param {Array} products - Danh sách sản phẩm
   * @returns {Array} Danh sách các danh mục duy nhất
   */
  static getUniqueCategories(products) {
    debugger;
    const categories = products
      .map(p => p.Category.Name)
      .filter(cat => cat); // Lọc bỏ các giá trị null hoặc undefined
      
    // Lọc các giá trị duy nhất
    return [...new Set(categories)];
  }
  
  /**
   * Hiển thị danh sách sản phẩm
   * @param {Array} products - Danh sách sản phẩm
   * @param {Element} container - Container để hiển thị sản phẩm
   */
  static renderProductItems(products, container) {
    debugger;
    // Xóa tất cả nội dung cũ
    container.innerHTML = '';
    
    if (!products || products.length === 0) {
      container.innerHTML = '<div class="no-products">Không có sản phẩm nào.</div>';
      return;
    }
    
    products.forEach(product => {
      const productBox = document.createElement('div');
      productBox.className = 'box';
      
      // Tạo mô tả ngắn gọn (giới hạn 80 ký tự)
      const shortDescription = product.Description 
        ? product.Description.length > 80 
          ? product.Description.substring(0, 80) + '...' 
          : product.Description
        : '';
      
      productBox.innerHTML = `
        <div class="icons">
          <a href="#" class="fa fa-shopping-cart add-to-cart" data-id="${product.Id}"></a>
          <a href="#" class="fa fa-heart"></a>
          <a href="#" class="fa fa-eye view-product" data-id="${product.Id}"></a>
        </div>
        <div class="image">
          <img src="${product.ImageUrl}" alt="${product.Name}" />
        </div>
        <div class="content">
          <h3>${product.Name}</h3>
          <div class="stars">
            <i class="fa fa-star"></i>
            <i class="fa fa-star"></i>
            <i class="fa fa-star"></i>
            <i class="fa fa-star"></i>
            <i class="fa fa-star-half-alt"></i>
          </div>
          <div class="price">${this.formatCurrency(product.Price)}</div>
          <p class="description">${shortDescription}</p>
          <button class="btn add-to-cart-btn" data-id="${product.Id}">Thêm vào giỏ hàng</button>
        </div>
      `;
      
      container.appendChild(productBox);
    });
    
    // Thêm sự kiện cho các nút
    this.setupProductEventListeners(container);
  }
  
  /**
   * Thiết lập các sự kiện cho sản phẩm
   * @param {Element} container - Container chứa các sản phẩm
   */
  static setupProductEventListeners(container) {
    // Thêm sự kiện cho nút thêm vào giỏ hàng
    const addToCartButtons = container.querySelectorAll('.add-to-cart, .add-to-cart-btn');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const productId = button.getAttribute('data-id');
        const product = await this.getProductById(productId);
        if (product) {
          // Thêm vào giỏ hàng
          this.showNotification(`Đã thêm "${product.Name}" vào giỏ hàng`, 'success');
          // Nếu có module giỏ hàng, gọi hàm thêm vào giỏ
          if (window.Cart) {
            window.Cart.addItem(product);
          } else if (typeof Cart !== 'undefined') {
            Cart.addItem(product);
          } else if (window.CartManager && typeof window.CartManager.addToCart === 'function') {
            window.CartManager.addToCart(product);
          } else if (typeof addToCart === 'function') {
            addToCart(product);
          } else {
            console.error('Không tìm thấy chức năng giỏ hàng');
            this.showNotification('Không thể thêm sản phẩm vào giỏ hàng', 'error');
          }
        }
      });
    });
    
    // Thêm sự kiện cho nút xem chi tiết sản phẩm
    const viewProductButtons = container.querySelectorAll('.view-product');
    viewProductButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const productId = button.getAttribute('data-id');
        const product = await this.getProductById(productId);
        if (product) {
          // Hiển thị modal chi tiết sản phẩm
          this.showProductModal(product);
        }
      });
    });
  }

  /**
   * Hiển thị modal chi tiết sản phẩm
   * @param {Object} product - Sản phẩm cần hiển thị
   */
  static showProductModal(product) {
    // Tạo modal
    const modal = document.createElement('div');
    modal.classList.add('product-modal');
    modal.innerHTML = `
      <div class="product-modal-content">
        <span class="close-modal">&times;</span>
        <div class="product-modal-body">
          <div class="product-image">
            <img src="${product.ImageUrl}" alt="${product.Name}">
          </div>
          <div class="product-info">
            <h2>${product.Name}</h2>
            <div class="stars">
              <i class="fa fa-star"></i>
              <i class="fa fa-star"></i>
              <i class="fa fa-star"></i>
              <i class="fa fa-star"></i>
              <i class="fa fa-star-half-alt"></i>
            </div>
            <div class="price">${this.formatCurrency(product.Price)}</div>
            <div class="category">${product.Category || ''}</div>
            <p class="description">${product.Description || ''}</p>
            <div class="quantity">
              <span>Số lượng:</span>
              <button class="quantity-btn minus">-</button>
              <input type="number" class="quantity-input" value="1" min="1" max="99">
              <button class="quantity-btn plus">+</button>
            </div>
            <button class="btn add-to-cart-btn" data-id="${product.Id}">Thêm vào giỏ hàng</button>
          </div>
        </div>
      </div>
    `;
    
    // Thêm modal vào body
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden'; // Ngăn cuộn trang khi hiển thị modal
    
    // Xử lý đóng modal
    const closeModal = () => {
      modal.remove();
      document.body.style.overflow = '';
    };
    
    // Đóng modal khi click vào nút đóng
    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    
    // Đóng modal khi click ra ngoài
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // Xử lý tăng/giảm số lượng
    const quantityInput = modal.querySelector('.quantity-input');
    const minusBtn = modal.querySelector('.minus');
    const plusBtn = modal.querySelector('.plus');
    
    minusBtn.addEventListener('click', () => {
      let value = parseInt(quantityInput.value);
      if (value > 1) {
        quantityInput.value = value - 1;
      }
    });
    
    plusBtn.addEventListener('click', () => {
      let value = parseInt(quantityInput.value);
      quantityInput.value = value + 1;
    });
    
    // Xử lý thêm vào giỏ hàng
    modal.querySelector('.add-to-cart-btn').addEventListener('click', () => {
      const quantity = parseInt(quantityInput.value);
      
      // Thêm vào giỏ hàng
      this.showNotification(`Đã thêm ${quantity} "${product.Name}" vào giỏ hàng`, 'success');
      
      // Nếu có module giỏ hàng, gọi hàm thêm vào giỏ
      if (window.Cart) {
        window.Cart.addItem(product, quantity);
      } else if (typeof Cart !== 'undefined') {
        Cart.addItem(product, quantity);
      } else if (window.CartManager && typeof window.CartManager.addToCart === 'function') {
        window.CartManager.addToCart(product, quantity);
      } else if (typeof addToCart === 'function') {
        addToCart(product, quantity);
      } else {
        console.error('Không tìm thấy chức năng giỏ hàng');
        this.showNotification('Không thể thêm sản phẩm vào giỏ hàng', 'error');
      }
      
      closeModal();
    });
  }

  /**
   * Hiển thị loading trong container
   * @param {Element} container - Container để hiển thị loading
   */
  static showLoading(container) {
    container.innerHTML = '<div class="loading">Đang tải...</div>';
  }

  /**
   * Hiển thị thông báo lỗi trong container
   * @param {Element} container - Container để hiển thị lỗi
   * @param {string} message - Thông báo lỗi
   */
  static showError(container, message) {
    container.innerHTML = `<div class="error">${message}</div>`;
  }

  /**
   * Format số tiền thành định dạng tiền tệ
   * @param {number} amount - Số tiền
   * @returns {string} Số tiền đã được format
   */
  static formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // ============ Các chức năng quản lý sản phẩm (Admin) ============

  /**
   * Tải danh sách sản phẩm cho trang quản lý
   */
  static async loadAdminProducts() {
    const productTableBody = document.getElementById('productTable')?.querySelector('tbody');
    if (!productTableBody) return;

    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const products = await response.json();
      productTableBody.innerHTML = ''; // Xóa dữ liệu hiện có

      products.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <th scope="row">${index + 1}</th>
          <td>${product.Name}</td>
          <td>${this.formatCurrency(product.Price)}</td>
          <td>${product.Origin || 'N/A'}</td>
          <td>${product.ExpiryDate ? new Date(product.ExpiryDate).toLocaleDateString() : 'N/A'}</td>
          <td>
            <button class="btn btn-danger delete-product" data-id="${product.Id}">Delete</button>
            <button class="btn btn-warning edit-product" data-id="${product.Id}">Edit</button>
          </td>
        `;
        productTableBody.appendChild(row);
      });

      // Thêm sự kiện cho các nút
      productTableBody.querySelectorAll('.delete-product').forEach(button => {
        button.addEventListener('click', () => {
          const productId = button.getAttribute('data-id');
          this.deleteProduct(productId);
        });
      });

      productTableBody.querySelectorAll('.edit-product').forEach(button => {
        button.addEventListener('click', () => {
          const productId = button.getAttribute('data-id');
          this.editProduct(productId);
        });
      });
    } catch (error) {
      console.error('Error loading products:', error);
      if (productTableBody) {


        productTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Lỗi khi tải danh sách sản phẩm: ${error.message}</td></tr>`;
      }
    }
  }

  /**
   * Xóa sản phẩm
   * @param {string} productId - ID của sản phẩm cần xóa
   */
  static async deleteProduct(productId) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          this.showNotification('Xóa sản phẩm thành công', 'success');
          this.loadAdminProducts(); // Tải lại danh sách sản phẩm
        } else {
          const error = await response.text();
          this.showNotification(error || 'Không thể xóa sản phẩm', 'error');
        }
      } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        this.showNotification('Đã xảy ra lỗi khi xóa sản phẩm', 'error');
      }
    }
  }

  /**
   * Sửa sản phẩm
   * @param {string} productId - ID của sản phẩm cần sửa
   */
  static async editProduct(productId) {
    try {
      const response = await fetch(`${API_URL}/products/${productId}`);
      if (!response.ok) {
        throw new Error('Không thể lấy thông tin sản phẩm');
      }
      
      const product = await response.json();
      this.openProductModal(product);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin sản phẩm:', error);
      this.showNotification('Không thể lấy thông tin sản phẩm', 'error');
    }
  }

  /**
   * Mở modal thêm/sửa sản phẩm
   * @param {Object} product - Thông tin sản phẩm (nếu là sửa)
   */
  static openProductModal(product = {}) {
    // Reset form
    document.getElementById('productForm')?.reset();
    
    // Đặt tiêu đề modal dựa vào thao tác (thêm hoặc sửa)
    const modalLabel = document.getElementById('productModalLabel');
    if (modalLabel) {
      modalLabel.textContent = product.Id ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới';
    }
    
    // Điền thông tin nếu là sửa
    if (product.Id) {
      document.getElementById('productName').value = product.Name || '';
      document.getElementById('productPrice').value = product.Price || '';
      document.getElementById('productOrigin').value = product.Origin || '';
      document.getElementById('productExpiryDate').value = product.ExpiryDate 
        ? new Date(product.ExpiryDate).toISOString().split('T')[0] 
        : '';
      document.getElementById('productDescription').value = product.Description || '';
      document.getElementById('productId').value = product.Id;

      // Hiển thị ảnh hiện tại
      const imagePreview = document.getElementById('imagePreview');
      if (imagePreview) {
        imagePreview.src = product.ImageUrl || '';
        imagePreview.style.display = product.ImageUrl ? 'block' : 'none';
      }
    } else {
      document.getElementById('productId').value = '';
      
      // Ẩn xem trước ảnh nếu thêm sản phẩm mới
      const imagePreview = document.getElementById('imagePreview');
      if (imagePreview) {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
      }
    }
    
    // Hiển thị modal
    $('#productModal').modal('show');
  }

  /**
   * Lưu sản phẩm (thêm hoặc sửa)
   */
  static async saveProduct() {
    const productId = document.getElementById('productId').value;
    
    const product = {
      Name: document.getElementById('productName').value,
      Price: document.getElementById('productPrice').value,
      Origin: document.getElementById('productOrigin').value,
      ExpiryDate: document.getElementById('productExpiryDate').value,
      Description: document.getElementById('productDescription').value
    };

    if (productId) {
      product.Id = productId;
    }

    const method = productId ? 'PUT' : 'POST';
    const url = productId 
      ? `${API_URL}/products/${productId}` 
      : `${API_URL}/products`;

    // Tạo đối tượng FormData để xử lý upload file
    const formData = new FormData();
    for (const key in product) {
      formData.append(key, product[key]);
    }

    // Lấy file ảnh và thêm vào FormData
    const imageFile = document.getElementById('productImage').files[0];
    if (imageFile) {
      formData.append('Image', imageFile);
    }

    try {
      const response = await fetch(url, {
        method: method,
        body: formData
      });
      
      if (response.ok) {
        const successMessage = productId 
          ? 'Sản phẩm đã được cập nhật thành công' 
          : 'Sản phẩm đã được thêm thành công';
        this.showNotification(successMessage, 'success');
        this.loadAdminProducts(); // Tải lại danh sách sản phẩm
        $('#productModal').modal('hide'); // Ẩn modal
      } else {
        const error = await response.text();
        this.showNotification('Lỗi: ' + error, 'error');
      }
    } catch (error) {
      console.error('Lỗi khi lưu sản phẩm:', error);
      this.showNotification('Đã xảy ra lỗi khi lưu sản phẩm', 'error');
    }
  }

  /**
   * Hiển thị thông báo
   * @param {string} message - Nội dung thông báo
   * @param {string} type - Loại thông báo (success, error, info)
   */
  static showNotification(message, type) {
    if (window.UI && window.UI.createNotification) {
      window.UI.createNotification(message, type);
    } else if (window.NotificationSystem) {
      if (type === 'success') {
        window.NotificationSystem.success(message);
      } else if (type === 'error') {
        window.NotificationSystem.error(message);
      } else {
        window.NotificationSystem.info(message);
      }
    } else {
      alert(message);
    }
  }
}

// Khởi tạo khi trang đã tải xong
document.addEventListener('DOMContentLoaded', () => {
  ProductManager.init();
});

// Xuất module để sử dụng trong các file khác
window.ProductManager = ProductManager; 