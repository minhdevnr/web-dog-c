// Chờ cho đến khi tải toàn bộ DOM
document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo biến chung
    const searchBtn = document.querySelector('#search-btn');
    const cartBtn = document.querySelector('#cart-btn');
    const loginBtn = document.querySelector('#login-btn');
    const barsBtn = document.querySelector('#bars-btn');
    const navbar = document.querySelector('.navbar');
    const searchForm = document.querySelector('.search-form');
    const cartContainer = document.querySelector('.cart-item-container');
    const userProfileDropdown = document.querySelector('.user-profile-dropdown');
    const notificationContainer = document.querySelector('#notification-container');
    const productsContainer = document.querySelector('#products-container');

    // Hàm khởi tạo
    function init() {
        setupEventListeners();
        loadProducts();
        loadCartFromStorage();
        updateCartCount();
    }

    // Thiết lập trình lắng nghe sự kiện
    function setupEventListeners() {
        // Nút tìm kiếm
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchForm.classList.toggle('active');
            cartContainer.classList.remove('active');
            userProfileDropdown.classList.remove('active');
            navbar.classList.remove('active');
            
            // Focus vào ô tìm kiếm nếu form tìm kiếm được hiển thị
            if (searchForm.classList.contains('active')) {
                const searchInput = searchForm.querySelector('#search-box');
                if (searchInput) {
                    setTimeout(() => {
                        searchInput.focus();
                    }, 100);
                }
            }
        });

        // Nút giỏ hàng
        cartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cartContainer.classList.toggle('active');
            searchForm.classList.remove('active');
            userProfileDropdown.classList.remove('active');
            navbar.classList.remove('active');
        });

        // Nút đăng nhập/tài khoản
        loginBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userProfileDropdown.classList.toggle('active');
            searchForm.classList.remove('active');
            cartContainer.classList.remove('active');
            navbar.classList.remove('active');
        });

        // Nút menu (cho thiết bị di động)
        barsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navbar.classList.toggle('active');
            searchForm.classList.remove('active');
            cartContainer.classList.remove('active');
            userProfileDropdown.classList.remove('active');
        });

        // Đóng tất cả dropdown khi click bên ngoài
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-form') && !e.target.closest('#search-btn')) {
                searchForm.classList.remove('active');
            }

            if (!e.target.closest('.cart-item-container') && !e.target.closest('#cart-btn')) {
                cartContainer.classList.remove('active');
            }

            if (!e.target.closest('.user-profile-dropdown') && !e.target.closest('#login-btn')) {
                userProfileDropdown.classList.remove('active');
            }

            if (!e.target.closest('.navbar') && !e.target.closest('#bars-btn')) {
                navbar.classList.remove('active');
            }
        });

        // Quay lại đầu trang khi cuộn
        window.addEventListener('scroll', () => {
            searchForm.classList.remove('active');
            cartContainer.classList.remove('active');
            userProfileDropdown.classList.remove('active');
            navbar.classList.remove('active');
        });
    }

    // Hiển thị thông báo
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;
        notificationContainer.appendChild(notification);

        // Xóa thông báo sau 3 giây
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }

    // ----------------
    // Quản lý sản phẩm
    // ----------------

    // Mảng dữ liệu sản phẩm mẫu
    const products = [
        {
            id: 1,
            name: 'Cà phê Arabica nguyên hạt',
            image: 'img/coffee1.jpg',
            price: 150000,
            discountPrice: 135000,
            description: 'Cà phê Arabica nguyên chất từ cao nguyên Đà Lạt, hương thơm nhẹ nhàng, vị chua thanh và hậu vị ngọt.',
            category: 'Cà phê nguyên hạt'
        },
        {
            id: 2,
            name: 'Cà phê Robusta nguyên hạt',
            image: 'img/coffee2.jpg',
            price: 120000,
            discountPrice: 99000,
            description: 'Cà phê Robusta đậm đặc từ Buôn Ma Thuột, hương vị mạnh mẽ, đắng đậm và hậu vị kéo dài.',
            category: 'Cà phê nguyên hạt'
        },
        {
            id: 3,
            name: 'Cà phê phin truyền thống',
            image: 'img/coffee3.jpg',
            price: 95000,
            discountPrice: 80000,
            description: 'Bột cà phê rang xay phù hợp với phin Việt Nam truyền thống, tạo ra hương vị đậm đà đặc trưng.',
            category: 'Cà phê xay'
        },
        {
            id: 4,
            name: 'Cà phê Espresso blend',
            image: 'img/coffee4.jpg',
            price: 180000,
            discountPrice: 150000,
            description: 'Hỗn hợp cà phê đặc biệt được phối trộn dành riêng cho máy Espresso, tạo ra lớp crema hoàn hảo.',
            category: 'Cà phê nguyên hạt'
        },
        {
            id: 5,
            name: 'Bộ pha cà phê Drip',
            image: 'img/coffee-kit1.jpg',
            price: 350000,
            discountPrice: 299000,
            description: 'Bộ dụng cụ pha cà phê kiểu nhỏ giọt, bao gồm phễu, giấy lọc và bình đựng thủy tinh.',
            category: 'Dụng cụ'
        },
        {
            id: 6,
            name: 'Cà phê Cappuccino hòa tan',
            image: 'img/coffee-instant1.jpg',
            price: 95000,
            discountPrice: 85000,
            description: 'Cà phê Cappuccino hòa tan với lớp bọt sữa béo ngậy, thích hợp để thưởng thức nhanh chóng.',
            category: 'Cà phê hòa tan'
        }
    ];

    // Tải sản phẩm
    function loadProducts() {
        if (!productsContainer) return;

        // Xóa phần tử loading
        productsContainer.innerHTML = '';

        // Thêm sản phẩm vào container
        products.forEach(product => {
            const productElement = createProductElement(product);
            productsContainer.appendChild(productElement);
        });
    }

    // Tạo phần tử sản phẩm
    function createProductElement(product) {
        const productBox = document.createElement('div');
        productBox.classList.add('box');
        productBox.setAttribute('data-product-id', product.id);

        // HTML cho sản phẩm
        productBox.innerHTML = `
            <div class="icons">
                <button class="fas fa-shopping-cart add-to-cart" data-id="${product.id}"></button>
                <button class="fas fa-heart add-to-favorites" data-id="${product.id}"></button>
                <button class="fas fa-eye view-product" data-id="${product.id}"></button>
            </div>
            <div class="image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="content">
                <h3>${product.name}</h3>
                <div class="stars">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star-half-alt"></i>
                </div>
                <div class="price">${formatCurrency(product.discountPrice)} <span>${formatCurrency(product.price)}</span></div>
                <p class="description">${product.description}</p>
                <button class="btn add-to-cart-btn" data-id="${product.id}">Thêm vào giỏ hàng</button>
            </div>
        `;

        // Thêm sự kiện cho nút thêm vào giỏ hàng
        productBox.querySelectorAll('.add-to-cart, .add-to-cart-btn').forEach(button => {
            button.addEventListener('click', () => {
                addToCart(product);
            });
        });

        // Thêm sự kiện cho nút thêm vào yêu thích
        productBox.querySelector('.add-to-favorites').addEventListener('click', () => {
            toggleFavorite(product);
        });

        // Thêm sự kiện cho nút xem chi tiết sản phẩm
        productBox.querySelector('.view-product').addEventListener('click', () => {
            viewProductDetails(product);
        });

        return productBox;
    }

    // Xem chi tiết sản phẩm
    function viewProductDetails(product) {
        // Tạo modal chi tiết sản phẩm
        const modal = document.createElement('div');
        modal.classList.add('product-modal');
        
        modal.innerHTML = `
            <div class="product-modal-content">
                <span class="close-modal">&times;</span>
                <div class="product-modal-body">
                    <div class="product-modal-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-modal-info">
                        <h2>${product.name}</h2>
                        <div class="stars">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star-half-alt"></i>
                        </div>
                        <div class="price">${formatCurrency(product.discountPrice)} <span>${formatCurrency(product.price)}</span></div>
                        <p class="category">Danh mục: ${product.category}</p>
                        <p class="description">${product.description}</p>
                        <div class="quantity">
                            <span>Số lượng:</span>
                            <button class="qty-btn minus">-</button>
                            <input type="number" class="qty-input" value="1" min="1" max="10">
                            <button class="qty-btn plus">+</button>
                        </div>
                        <button class="btn add-to-cart-modal" data-id="${product.id}">Thêm vào giỏ hàng</button>
                    </div>
                </div>
            </div>
        `;

        // Thêm modal vào body
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Sự kiện đóng modal
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.remove();
            document.body.style.overflow = 'auto';
        });

        // Đóng modal khi click bên ngoài
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = 'auto';
            }
        });

        // Xử lý nút tăng/giảm số lượng
        const minusBtn = modal.querySelector('.minus');
        const plusBtn = modal.querySelector('.plus');
        const qtyInput = modal.querySelector('.qty-input');

        minusBtn.addEventListener('click', () => {
            if (parseInt(qtyInput.value) > 1) {
                qtyInput.value = parseInt(qtyInput.value) - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            if (parseInt(qtyInput.value) < 10) {
                qtyInput.value = parseInt(qtyInput.value) + 1;
            }
        });

        // Xử lý nút thêm vào giỏ hàng
        const addToCartBtn = modal.querySelector('.add-to-cart-modal');
        addToCartBtn.addEventListener('click', () => {
            const quantity = parseInt(qtyInput.value);
            addToCart(product, quantity);
            modal.remove();
            document.body.style.overflow = 'auto';
        });
    }

    // ----------------
    // Quản lý giỏ hàng
    // ----------------
    
    // Biến lưu trữ giỏ hàng
    let cart = [];

    // Thêm sản phẩm vào giỏ hàng
    function addToCart(product, quantity = 1) {
        // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            // Nếu đã có, tăng số lượng
            existingItem.quantity += quantity;
        } else {
            // Nếu chưa có, thêm mới
            cart.push({
                id: product.id,
                name: product.name,
                price: product.discountPrice,
                image: product.image,
                quantity: quantity
            });
        }

        // Cập nhật giỏ hàng
        updateCartUI();
        saveCartToStorage();
        updateCartCount();
        showNotification(`Đã thêm ${product.name} vào giỏ hàng`);
    }

    // Xóa sản phẩm khỏi giỏ hàng
    function removeFromCart(productId) {
        // Lọc ra những sản phẩm khác với sản phẩm cần xóa
        cart = cart.filter(item => item.id !== productId);
        
        // Cập nhật giỏ hàng
        updateCartUI();
        saveCartToStorage();
        updateCartCount();
        showNotification('Đã xóa sản phẩm khỏi giỏ hàng');
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    function updateCartItemQuantity(productId, quantity) {
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            item.quantity = quantity;
            
            // Nếu số lượng = 0, xóa sản phẩm khỏi giỏ hàng
            if (quantity <= 0) {
                removeFromCart(productId);
                return;
            }
            
            // Cập nhật giỏ hàng
            updateCartUI();
            saveCartToStorage();
            updateCartCount();
        }
    }

    // Cập nhật UI giỏ hàng
    function updateCartUI() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalPrice = document.querySelector('.cart-total-price');
        
        if (!cartItemsContainer) return;
        
        // Xóa tất cả các mục hiện tại
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            // Hiển thị thông báo giỏ hàng trống
            cartItemsContainer.innerHTML = '<div class="cart-empty">Giỏ hàng trống</div>';
            cartTotalPrice.textContent = formatCurrency(0);
            return;
        }
        
        // Tính tổng giá tiền
        let total = 0;
        
        // Thêm từng mục vào giỏ hàng
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.setAttribute('data-id', item.id);
            
            cartItem.innerHTML = `
                <span class="fas fa-times remove-item" data-id="${item.id}"></span>
                <img src="${item.image}" alt="${item.name}">
                <div class="content">
                    <h3>${item.name}</h3>
                    <div class="price">${formatCurrency(item.price)}</div>
                    <div class="quantity-control">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItem);
            
            // Thêm sự kiện xóa mục
            cartItem.querySelector('.remove-item').addEventListener('click', () => {
                removeFromCart(item.id);
            });
            
            // Thêm sự kiện tăng/giảm số lượng
            cartItem.querySelector('.minus').addEventListener('click', () => {
                updateCartItemQuantity(item.id, item.quantity - 1);
            });
            
            cartItem.querySelector('.plus').addEventListener('click', () => {
                updateCartItemQuantity(item.id, item.quantity + 1);
            });
        });
        
        // Cập nhật tổng giá tiền
        cartTotalPrice.textContent = formatCurrency(total);
    }

    // Cập nhật số lượng sản phẩm hiển thị trên biểu tượng giỏ hàng
    function updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        
        if (cartCount) {
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
            
            // Hiển thị/ẩn số lượng
            if (totalItems > 0) {
                cartCount.style.display = 'flex';
            } else {
                cartCount.style.display = 'none';
            }
        }
    }

    // Lưu giỏ hàng vào localStorage
    function saveCartToStorage() {
        localStorage.setItem('lhCoffeeCart', JSON.stringify(cart));
    }

    // Tải giỏ hàng từ localStorage
    function loadCartFromStorage() {
        const savedCart = localStorage.getItem('lhCoffeeCart');
        
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartUI();
        }
    }

    // ----------------
    // Quản lý yêu thích
    // ----------------
    
    // Thêm/xóa sản phẩm yêu thích
    function toggleFavorite(product) {
        let favorites = JSON.parse(localStorage.getItem('lhCoffeeFavorites')) || [];
        
        // Kiểm tra sản phẩm đã có trong yêu thích chưa
        const index = favorites.findIndex(item => item.id === product.id);
        
        if (index === -1) {
            // Chưa có, thêm vào
            favorites.push({
                id: product.id,
                name: product.name,
                price: product.discountPrice,
                image: product.image
            });
            showNotification(`Đã thêm ${product.name} vào mục yêu thích`);
        } else {
            // Đã có, xóa đi
            favorites.splice(index, 1);
            showNotification(`Đã xóa ${product.name} khỏi mục yêu thích`);
        }
        
        // Lưu vào localStorage
        localStorage.setItem('lhCoffeeFavorites', JSON.stringify(favorites));
    }

    // ----------------
    // Tiện ích
    // ----------------
    
    // Định dạng tiền tệ
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    // Khởi tạo ứng dụng
    init();
}); 