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