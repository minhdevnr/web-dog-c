/**
 * Xử lý danh sách sản phẩm
 */

// Danh sách sản phẩm mẫu
const sampleProducts = [
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

// Lấy danh sách sản phẩm
async function getProducts() {
  try {
    // Trong phiên bản hoàn chỉnh, sẽ gọi API từ server
    // const response = await fetch(`${API_URL}/products`);
    // const data = await response.json();
    // return data;
    
    // Hiện tại sử dụng dữ liệu mẫu
    return sampleProducts;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', error);
    return sampleProducts; // Fallback về dữ liệu mẫu khi có lỗi
  }
}

// Lấy chi tiết sản phẩm theo ID
async function getProductById(productId) {
  try {
    // Trong phiên bản hoàn chỉnh, sẽ gọi API từ server
    // const response = await fetch(`${API_URL}/products/${productId}`);
    // const data = await response.json();
    // return data;
    
    // Hiện tại sử dụng dữ liệu mẫu
    return sampleProducts.find(product => product.id === productId);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
    return null;
  }
}

// Lấy danh sách sản phẩm theo danh mục
async function getProductsByCategory(category) {
  try {
    const products = await getProducts();
    return products.filter(product => product.category === category);
  } catch (error) {
    console.error('Lỗi khi lọc sản phẩm theo danh mục:', error);
    return [];
  }
}

// Tìm kiếm sản phẩm
async function searchProducts(keyword) {
  try {
    const products = await getProducts();
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

// Hiển thị kết quả tìm kiếm
function displaySearchResults(products, keyword) {
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
    <h3>Kết quả tìm kiếm: ${keyword}</h3>
    <span class="close-search-results">&times;</span>
  `;
  searchResultsContainer.appendChild(header);

  // Thêm sự kiện đóng kết quả tìm kiếm
  header.querySelector('.close-search-results').addEventListener('click', () => {
    searchResultsContainer.style.display = 'none';
  });

  // Tạo phần nội dung kết quả tìm kiếm
  const content = document.createElement('div');
  content.className = 'search-results-content';
  
  if (products.length === 0) {
    content.innerHTML = '<p class="no-results">Không tìm thấy sản phẩm phù hợp</p>';
  } else {
    const resultsHtml = products.map(product => `
      <div class="search-result-item">
        <img src="${product.image}" alt="${product.name}" width="60" height="60">
        <div class="search-result-info">
          <h4>${product.name}</h4>
          <p class="search-result-price">${formatCurrency(product.price)}</p>
        </div>
        <button class="add-to-cart-btn" data-id="${product.id}">
          <i class="fa fa-shopping-cart"></i>
        </button>
      </div>
    `).join('');
    
    content.innerHTML = resultsHtml;
  }
  
  searchResultsContainer.appendChild(content);
  searchResultsContainer.style.display = 'block';
  
  // Thêm sự kiện thêm vào giỏ hàng
  const addToCartButtons = content.querySelectorAll('.add-to-cart-btn');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', async function() {
      const productId = this.getAttribute('data-id');
      const product = await getProductById(productId);
      if (product) {
        addToCart(product);
      }
    });
  });
}

// Hiển thị danh sách sản phẩm trong section Products
async function renderProductList() {
  const productsContainer = document.querySelector('.products .box-container');
  if (!productsContainer) return;
  
  try {
    const products = await getProducts();
    
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
      const productBox = document.createElement('div');
      productBox.className = 'box';
      productBox.innerHTML = `
        <div class="icons">
          <a href="#" class="fa fa-shopping-cart"></a>
          <a href="#" class="fa fa-heart"></a>
          <a href="#" class="fa fa-eye"></a>
        </div>
        <div class="image">
          <img src="${product.image}" alt="${product.name}" />
        </div>
        <div class="content">
          <h3>${product.name}</h3>
          <div class="stars">
            <i class="fa fa-star"></i>
            <i class="fa fa-star"></i>
            <i class="fa fa-star"></i>
            <i class="fa fa-star"></i>
            <i class="fa fa-star-half-alt"></i>
          </div>
          <div class="price">${formatCurrency(product.price)}</div>
        </div>
      `;
      
      productsContainer.appendChild(productBox);
    });
    
    // Thêm sự kiện cho các nút
    initProductEvents();
    
  } catch (error) {
    console.error('Lỗi khi hiển thị danh sách sản phẩm:', error);
  }
}

// Hiển thị danh sách sản phẩm trong section Menu
async function renderMenuItems() {
  const menuContainer = document.querySelector('.menu .box-container');
  if (!menuContainer) return;
  
  try {
    const products = await getProducts();
    
    menuContainer.innerHTML = '';
    
    products.forEach(product => {
      const menuBox = document.createElement('div');
      menuBox.className = 'box-menu';
      menuBox.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price">${formatCurrency(product.price)}</div>
        <a class="btn" href="#">Thêm vào giỏ hàng</a>
      `;
      
      menuContainer.appendChild(menuBox);
    });
    
    // Thêm sự kiện cho các nút
    initMenuEvents();
    
  } catch (error) {
    console.error('Lỗi khi hiển thị danh sách menu:', error);
  }
}

// Khởi tạo sự kiện cho các sản phẩm
function initProductEvents() {
  // Sự kiện thêm vào giỏ hàng
  document.querySelectorAll('.products .fa-shopping-cart').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const productBox = this.closest('.box');
      const name = productBox.querySelector('h3').textContent;
      const priceText = productBox.querySelector('.price').textContent;
      const image = productBox.querySelector('img').src;
      
      // Xử lý giá
      const price = parseFloat(priceText.replace(/[^\d]/g, ''));
      
      const product = {
        id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        name: name,
        price: price,
        image: image
      };
      
      addToCart(product);
    });
  });
  
  // Sự kiện thêm vào yêu thích
  document.querySelectorAll('.products .fa-heart').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      this.classList.toggle('active');
      
      const productBox = this.closest('.box');
      const name = productBox.querySelector('h3').textContent;
      
      if (this.classList.contains('active')) {
        showSuccess(`Đã thêm "${name}" vào danh sách yêu thích`);
      } else {
        showInfo(`Đã xóa "${name}" khỏi danh sách yêu thích`);
      }
    });
  });
  
  // Sự kiện xem chi tiết
  document.querySelectorAll('.products .fa-eye').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const productBox = this.closest('.box');
      const name = productBox.querySelector('h3').textContent;
      
      // Trong phiên bản hoàn chỉnh, sẽ hiển thị modal hoặc chuyển trang chi tiết
      showInfo(`Xem chi tiết "${name}"`);
    });
  });
}

// Khởi tạo sự kiện cho các mục menu
function initMenuEvents() {
  // Sự kiện thêm vào giỏ hàng
  document.querySelectorAll('.menu .btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const menuBox = this.closest('.box-menu');
      const name = menuBox.querySelector('h3').textContent;
      const priceText = menuBox.querySelector('.price').textContent;
      const image = menuBox.querySelector('img').src;
      
      // Xử lý giá
      const price = parseFloat(priceText.replace(/[^\d]/g, ''));
      
      const product = {
        id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        name: name,
        price: price,
        image: image
      };
      
      addToCart(product);
    });
  });
}

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', function() {
  // Render sản phẩm nếu đang ở trang chủ
  if (document.querySelector('.products')) {
    renderProductList();
  }
  
  // Render menu nếu đang ở trang chủ
  if (document.querySelector('.menu')) {
    renderMenuItems();
  }
  
  // Xử lý tìm kiếm
  const searchBox = document.getElementById('search-box');
  if (searchBox) {
    searchBox.addEventListener('keyup', async function(e) {
      if (e.key === 'Enter') {
        const keyword = this.value.trim();
        if (keyword) {
          try {
            const results = await searchProducts(keyword);
            
            if (results.length > 0) {
              showSuccess(`Tìm thấy ${results.length} kết quả cho "${keyword}"`);
              // Hiển thị kết quả tìm kiếm
              displaySearchResults(results, keyword);
            } else {
              showInfo(`Không tìm thấy kết quả nào cho "${keyword}"`);
              displaySearchResults([], keyword);
            }
          } catch (error) {
            console.error('Lỗi khi tìm kiếm:', error);
            showError('Có lỗi xảy ra khi tìm kiếm');
          }
        }
      }
    });
    
    // Thêm xử lý click cho icon tìm kiếm
    const searchBtn = document.querySelector('.search-form .fa-search');
    if (searchBtn) {
      searchBtn.addEventListener('click', async function() {
        const keyword = searchBox.value.trim();
        if (keyword) {
          try {
            const results = await searchProducts(keyword);
            
            if (results.length > 0) {
              showSuccess(`Tìm thấy ${results.length} kết quả cho "${keyword}"`);
              // Hiển thị kết quả tìm kiếm
              displaySearchResults(results, keyword);
            } else {
              showInfo(`Không tìm thấy kết quả nào cho "${keyword}"`);
              displaySearchResults([], keyword);
            }
          } catch (error) {
            console.error('Lỗi khi tìm kiếm:', error);
            showError('Có lỗi xảy ra khi tìm kiếm');
          }
        }
      });
    }
  }
});

// Function to show loading state
function showLoading(container) {
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Đang tải sản phẩm...</p>
        </div>
    `;
}

// Function to show error state
function showError(container, message) {
    container.innerHTML = `
        <div class="error">
            <i class="fa fa-exclamation-circle"></i>
            <p>${message}</p>
            <button class="btn" onclick="loadProductList()">Thử lại</button>
        </div>
    `;
}

// Function to load products and display them in the menu section
async function loadProductList() {
    const menuContainer = document.querySelector('#menu .box-container');
    showLoading(menuContainer);

    try {
        const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PRODUCTS);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const products = await response.json();
        menuContainer.innerHTML = ''; // Clear existing content

        products.forEach(product => {
            const productBox = document.createElement('div');
            productBox.className = 'box-menu';
            productBox.innerHTML = `
                <img src="${product.ImageUrl}" alt="${product.Name}" />
                <h3>${product.Name}</h3>
                <p>${product.Description}</p>
                <div class="price">${product.Price.toLocaleString('vi-VN')}đ 
                    ${product.OriginalPrice ? `<span>${product.OriginalPrice.toLocaleString('vi-VN')}đ</span>` : ''}
                </div>
                <a class="btn" href="#" onclick="cartManager.addItem(${product.Id}); return false;">Thêm vào giỏ hàng</a>
            `;
            menuContainer.appendChild(productBox);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        showError(menuContainer, 'Có lỗi xảy ra khi tải danh sách sản phẩm');
    }
}

// Function to load products and display them in the products section
async function loadProductGrid() {
    const productContainer = document.querySelector('#products .box-container');
    showLoading(productContainer);

    try {
        const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PRODUCTS);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const products = await response.json();
        productContainer.innerHTML = ''; // Clear existing content

        products.forEach(product => {
            const productBox = document.createElement('div');
            productBox.className = 'box';
            productBox.innerHTML = `
                <div class="icons">
                    <a href="#" class="fa fa-shopping-cart" onclick="cartManager.addItem(${product.Id}); return false;"></a>
                    <a href="#" class="fa fa-heart"></a>
                    <a href="#" class="fa fa-eye"></a>
                </div>
                <div class="image">
                    <img src="${product.ImageUrl}" alt="${product.Name}" />
                </div>
                <div class="content">
                    <h3>${product.Name}</h3>
                    <div class="stars">
                        <i class="fa fa-star" aria-hidden="true"></i>
                        <i class="fa fa-star" aria-hidden="true"></i>
                        <i class="fa fa-star" aria-hidden="true"></i>
                        <i class="fa fa-star" aria-hidden="true"></i>
                        <i class="fa fa-star" aria-hidden="true"></i>
                        <i class="fa fa-star-half-alt" aria-hidden="true"></i>
                    </div>
                    <div class="price">${product.Price.toLocaleString('vi-VN')}đ 
                        ${product.OriginalPrice ? `<span>${product.OriginalPrice.toLocaleString('vi-VN')}đ</span>` : ''}
                    </div>
                </div>
            `;
            productContainer.appendChild(productBox);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        showError(productContainer, 'Có lỗi xảy ra khi tải danh sách sản phẩm');
    }
}

// Function to add product to cart
async function addToCart(productId) {
    try {
        // Get the current cart from localStorage or initialize an empty array
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if product already exists in cart
        const existingItem = cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            // Fetch product details
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch product details');
            }
            const product = await response.json();
            
            // Add new item to cart
            cart.push({
                productId: product.Id,
                name: product.Name,
                price: product.Price,
                imageUrl: product.ImageUrl,
                quantity: 1
            });
        }
        
        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Show success notification
        NotificationSystem.success('Sản phẩm đã được thêm vào giỏ hàng');
        
        // Update cart count if you have a cart count element
        updateCartCount();
    } catch (error) {
        console.error('Error adding to cart:', error);
        NotificationSystem.error('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
    }
}

// Function to update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Load products when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadProductList();
    loadProductGrid();
    updateCartCount();
}); 