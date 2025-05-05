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
        
        // Kiểm tra và tải tin tức trước
        const newsContainer = document.querySelector('#news-container');
        if (newsContainer) {
            loadNews();
        }
        
        // Sau đó tải sản phẩm và giỏ hàng
        loadProducts();
        loadCartFromStorage();
        updateCartCount();
    }

    // Thiết lập trình lắng nghe sự kiện
    function setupEventListeners() {
        // Nút tìm kiếm
        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                searchForm.classList.toggle('active');
                if (cartContainer) cartContainer.classList.remove('active');
                if (userProfileDropdown) userProfileDropdown.classList.remove('active');
                if (navbar) navbar.classList.remove('active');
                
                // Focus vào ô tìm kiếm nếu form tìm kiếm được hiển thị
                if (searchForm && searchForm.classList.contains('active')) {
                    const searchInput = searchForm.querySelector('#search-box');
                    if (searchInput) {
                        setTimeout(() => {
                            searchInput.focus();
                        }, 100);
                    }
                }
            });
        }

        // Nút giỏ hàng
        if (cartBtn) {
            cartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (cartContainer) {
                    cartContainer.classList.toggle('active');
                    if (searchForm) searchForm.classList.remove('active');
                    if (userProfileDropdown) userProfileDropdown.classList.remove('active');
                    if (navbar) navbar.classList.remove('active');
                }
            });
        }

        // Nút đăng nhập/tài khoản
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (userProfileDropdown) userProfileDropdown.classList.toggle('active');
                if (searchForm) searchForm.classList.remove('active');
                if (cartContainer) cartContainer.classList.remove('active');
                if (navbar) navbar.classList.remove('active');
            });
        }

        // Nút menu (cho thiết bị di động)
        if (barsBtn) {
            barsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (navbar) navbar.classList.toggle('active');
                if (searchForm) searchForm.classList.remove('active');
                if (cartContainer) cartContainer.classList.remove('active');
                if (userProfileDropdown) userProfileDropdown.classList.remove('active');
            });
        }

        // Đóng tất cả dropdown khi click bên ngoài
        document.addEventListener('click', (e) => {
            if (searchForm && !e.target.closest('.search-form') && !e.target.closest('#search-btn')) {
                searchForm.classList.remove('active');
            }

            if (cartContainer && !e.target.closest('.cart-item-container') && !e.target.closest('#cart-btn')) {
                cartContainer.classList.remove('active');
            }

            if (userProfileDropdown && !e.target.closest('.user-profile-dropdown') && !e.target.closest('#login-btn')) {
                userProfileDropdown.classList.remove('active');
            }

            if (navbar && !e.target.closest('.navbar') && !e.target.closest('#bars-btn')) {
                navbar.classList.remove('active');
            }
        });

        // Quay lại đầu trang khi cuộn
        window.addEventListener('scroll', () => {
            if (searchForm) searchForm.classList.remove('active');
            if (cartContainer) cartContainer.classList.remove('active');
            if (userProfileDropdown) userProfileDropdown.classList.remove('active');
            if (navbar) navbar.classList.remove('active');
        });
    }

    // Hiển thị thông báo
    function showNotification(message, type = 'success') {
        if (!notificationContainer) {
            // Tạo container thông báo nếu chưa tồn tại
            const newNotificationContainer = document.createElement('div');
            newNotificationContainer.id = 'notification-container';
            document.body.appendChild(newNotificationContainer);
            
            // Cập nhật tham chiếu 
            notificationContainer = newNotificationContainer;
        }
        
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
            Id: 1,
            Name: 'Cà phê Arabica nguyên hạt',
            ImageUrl: 'img/coffee1.jpg',
            Price: 150000,
            DiscountPrice: 135000,
            Description: 'Cà phê Arabica nguyên chất từ cao nguyên Đà Lạt, hương thơm nhẹ nhàng, vị chua thanh và hậu vị ngọt.',
            Category: 'Cà phê nguyên hạt'
        },
        {
            Id: 2,
            Name: 'Cà phê Robusta nguyên hạt',
            ImageUrl: 'img/coffee2.jpg',
            Price: 120000,
            DiscountPrice: 99000,
            Description: 'Cà phê Robusta đậm đặc từ Buôn Ma Thuột, hương vị mạnh mẽ, đắng đậm và hậu vị kéo dài.',
            Category: 'Cà phê nguyên hạt'
        },
        {
            Id: 3,
            Name: 'Cà phê phin truyền thống',
            ImageUrl: 'img/coffee3.jpg',
            Price: 95000,
            DiscountPrice: 80000,
            Description: 'Bột cà phê rang xay phù hợp với phin Việt Nam truyền thống, tạo ra hương vị đậm đà đặc trưng.',
            Category: 'Cà phê xay'
        },
        {
            Id: 4,
            Name: 'Cà phê Espresso blend',
            ImageUrl: 'img/coffee4.jpg',
            Price: 180000,
            DiscountPrice: 150000,
            Description: 'Hỗn hợp cà phê đặc biệt được phối trộn dành riêng cho máy Espresso, tạo ra lớp crema hoàn hảo.',
            Category: 'Cà phê nguyên hạt'
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
                <button class="fas fa-shopping-cart add-to-cart" data-id="${product.Id}"></button>
                <button class="fas fa-heart add-to-favorites" data-id="${product.Id}"></button>
                <button class="fas fa-eye view-product" data-id="${product.Id}"></button>
            </div>
            <div class="image">
                <img src="${product.ImageUrl}" alt="${product.Name}">
            </div>
            <div class="content">
                <h3>${product.Name}</h3>
                <div class="stars">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star-half-alt"></i>
                </div>
                <div class="price">${formatCurrency(product.DiscountPrice ?? 0)} <span>${formatCurrency(product.Price)}</span></div>
                <p class="description">${product.Description}</p>
                <button class="btn add-to-cart-btn" data-id="${product.Id}">Thêm vào giỏ hàng</button>
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
                        <img src="${product.ImageUrl}" alt="${product.Name}">
                    </div>
                    <div class="product-modal-info">
                        <h2>${product.Name}</h2>
                        <div class="stars">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star-half-alt"></i>
                        </div>
                        <div class="price">${formatCurrency(product.DiscountPrice ?? 0)} <span>${formatCurrency(product.Price ?? 0)}</span></div>
                        <p class="category">Danh mục: ${product.Category}</p>
                        <p class="description">${product.Description}</p>
                        <div class="quantity">
                            <span>Số lượng:</span>
                            <button class="qty-btn minus">-</button>
                            <input type="number" class="qty-input" value="1" min="1" max="10">
                            <button class="qty-btn plus">+</button>
                        </div>
                        <button class="btn add-to-cart-modal" data-id="${product.Id}">Thêm vào giỏ hàng</button>
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
    
    let cartItems = [];

    // Thêm sản phẩm vào giỏ hàng
    function addToCart(product, quantity = 1) {
        // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
        const existingItem = cartItems.find(item => item.id === product.id);
        
        if (existingItem) {
            // Nếu đã có, tăng số lượng
            existingItem.quantity += quantity;
        } else {
            // Nếu chưa có, thêm mới
            cartItems.push({
                id: product.Id,
                name: product.Name,
                price: product.Price,
                image: product.ImageUrl,
                quantity: quantity
            });
        }

        // Cập nhật giỏ hàng
        updateCartUI();
        saveCartToStorage();
        updateCartCount();
        showNotification(`Đã thêm ${product.Name} vào giỏ hàng`);
    }

    // Xóa sản phẩm khỏi giỏ hàng
    function removeFromCart(productId) {
        // Lọc ra những sản phẩm khác với sản phẩm cần xóa
        cartItems = cartItems.filter(item => item.id !== productId);
        
        // Cập nhật giỏ hàng
        updateCartUI();
        saveCartToStorage();
        updateCartCount();
        showNotification('Đã xóa sản phẩm khỏi giỏ hàng');
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    function updateCartItemQuantity(productId, quantity) {
        const item = cartItems.find(item => item.id === productId);
        
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
        // Cập nhật giỏ hàng trong header (sử dụng header-cart-items)
        const headerCartItems = document.getElementById('header-cart-items');
        // Cập nhật giỏ hàng trong trang cart (sử dụng cart-items)
        const pageCartItems = document.getElementById('cart-items');

        // Cập nhật dropdown giỏ hàng trong header
        if (headerCartItems) {
            updateCartDropdown(headerCartItems);
        }

        // Cập nhật trang giỏ hàng nếu đang mở
        if (pageCartItems && window.location.href.includes('cart.html')) {
            updateCartPage(pageCartItems);
        }

        // Cập nhật số lượng
        updateCartCount();
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    function updateCartCount(retryCount = 0) {
        const cartCountElements = document.querySelectorAll('.cart-count, #cart-count');
        const totalItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
        
        if (cartCountElements.length > 0) {
            cartCountElements.forEach(element => {
                element.textContent = totalItems;
                
                // Hiển thị/ẩn số lượng dựa trên số lượng sản phẩm
                element.style.display = totalItems > 0 ? 'flex' : 'none';
            });
        } else if (retryCount < 5) {
            // Thử lại nếu không tìm thấy phần tử, tối đa 5 lần
            setTimeout(() => updateCartCount(retryCount + 1), 300);
        }
    }

    // Lưu giỏ hàng vào localStorage
    function saveCartToStorage() {
        localStorage.setItem('lhCoffeeCart', JSON.stringify(cartItems));
    }

    // Tải giỏ hàng từ localStorage
    function loadCartFromStorage() {
        const savedCart = localStorage.getItem('lhCoffeeCart');
        
        if (savedCart) {
            cartItems = JSON.parse(savedCart);
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
                Id: product.Id,
                Name: product.Name,
                Price: product.Price,
                ImageUrl: product.ImageUrl
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
    // Quản lý tin tức
    // ----------------
    
    // Mảng dữ liệu tin tức mẫu
    const news = [
        {
            Id: 1,
            title: 'Cách nhận biết cà phê nguyên chất',
            image: 'img/blog-1.jpg',
            content: 'Hướng dẫn cách nhận biết cà phê nguyên chất từ màu sắc, mùi hương và hương vị...',
            date: '2023-05-15',
            author: 'Nguyễn Văn A'
        },
        {
            Id: 2,
            title: 'Lợi ích sức khỏe từ việc uống cà phê',
            image: 'img/blog-2.jpg',
            content: 'Nghiên cứu mới chỉ ra rằng uống cà phê đúng cách có thể mang lại nhiều lợi ích cho sức khỏe...',
            date: '2023-06-20',
            author: 'Trần Thị B'
        },
        {
            Id: 3,
            title: 'Cách pha cà phê phin hoàn hảo',
            image: 'img/blog-3.jpg',
            content: 'Bí quyết để có một tách cà phê phin thơm ngon đúng điệu từ các chuyên gia pha chế...',
            date: '2023-07-10',
            author: 'Lê Văn C'
        }
    ];
    
    // Tải tin tức
    function loadNews() {
        const newsContainer = document.querySelector('#news-container');
        if (!newsContainer) return;
    
        // Hiển thị loading
        newsContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        
        // Kiểm tra API_CONFIG đã được định nghĩa chưa
        if (typeof API_CONFIG === 'undefined' || !API_CONFIG.BASE_URL || !API_CONFIG.ENDPOINTS || !API_CONFIG.ENDPOINTS.NEWS) {
            console.error('API_CONFIG không được định nghĩa hoặc thiếu cấu hình cần thiết');
            // Sử dụng dữ liệu mẫu nếu API_CONFIG không tồn tại
            newsContainer.innerHTML = '';
            news.forEach(item => {
                const newsElement = createNewsElement(item);
                newsContainer.appendChild(newsElement);
            });
            return;
        }
        
        // Xây dựng URL API và tham số
        const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NEWS}`;
        const params = new URLSearchParams({
            pageNumber: 1,
            pageSize: 3,
            sortBy: 'CreatedAt',
            desc: true
        });
        
        // Gọi API để lấy danh sách tin tức
        fetch(`${apiUrl}?${params.toString()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Không thể kết nối đến máy chủ');
                }
                return response.json();
            })
            .then(data => {
                // Xóa loading
                newsContainer.innerHTML = '';
                
                if (data.items && data.items.length > 0) {
                    // Thêm tin tức vào container
                    data.items.forEach(item => {
                        const newsElement = createNewsElement(item);
                        newsContainer.appendChild(newsElement);
                    });
                } else {
                    // Hiển thị thông báo không có tin tức
                    newsContainer.innerHTML = '<div class="no-news">Không có tin tức mới</div>';
                }
            })
            .catch(error => {
                console.error('Lỗi khi tải tin tức:', error);
                
                // Sử dụng dữ liệu mẫu nếu không thể kết nối đến API
                newsContainer.innerHTML = '';
                news.forEach(item => {
                    const newsElement = createNewsElement(item);
                    newsContainer.appendChild(newsElement);
                });
            });
    }
    
    // Tạo phần tử tin tức
    function createNewsElement(item) {
        const newsBox = document.createElement('div');
        newsBox.classList.add('news-box');
        newsBox.setAttribute('data-news-id', item.id || item.Id);
        
        // Định dạng ngày tháng
        const dateString = item.createdAt || item.date;
        const date = new Date(dateString);
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    
        // Lấy các thuộc tính phù hợp dựa vào nguồn dữ liệu (API hoặc local)
        const title = item.title || item.Title || '';
        const imageUrl = item.imageUrl || item.image || item.ImageUrl || '';
        const author = item.author || item.Author || 'Admin';
        const content = item.content || item.Content || '';
        const id = item.id || item.Id || 0;
        
        // HTML cho tin tức
        newsBox.innerHTML = `
            <div class="news-image">
                <img src="${imageUrl}" alt="${title}">
            </div>
            <div class="news-content">
                <h3>${title}</h3>
                <div class="news-info">
                    <span class="news-date"><i class="fas fa-calendar"></i> ${formattedDate}</span>
                    <span class="news-author"><i class="fas fa-user"></i> ${author}</span>
                </div>
                <p class="news-summary">${content.substring(0, 150)}...</p>
                <a href="news-detail.html?id=${id}" class="btn">Đọc tiếp</a>
            </div>
        `;
    
        return newsBox;
    }

    // ----------------
    // Tiện ích
    // ----------------
    
    // Định dạng tiền tệ
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    // Cập nhật dropdown giỏ hàng
    function updateCartDropdown(headerCartItems) {
        if (!headerCartItems) {
            headerCartItems = document.getElementById('header-cart-items');
            if (!headerCartItems) return;
        }
        
        headerCartItems.innerHTML = '';
        
        if (cartItems.length === 0) {
            // Hiển thị thông báo giỏ hàng trống
            headerCartItems.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Giỏ hàng trống</p>
                </div>
            `;
            return;
        }
        
        // Hiển thị tối đa 3 sản phẩm trong dropdown
        const itemsToShow = cartItems.slice(0, 3);
        
        itemsToShow.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <span class="fa fa-times" data-id="${item.id}"></span>
                <img src="${item.image}" alt="${item.name}">
                <div class="content">
                    <h3>${item.name}</h3>
                    <div class="price">${formatCurrency(item.price)} x ${item.quantity || 1}</div>
                </div>
            `;
            
            headerCartItems.appendChild(cartItem);
            
            // Thêm sự kiện xóa sản phẩm
            const removeBtn = cartItem.querySelector('.fa-times');
            if (removeBtn) {
                removeBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    const productId = e.target.getAttribute('data-id');
                    if (productId) {
                        removeFromCart(productId);
                        showNotification('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
                    }
                });
            }
        });
        
        // Thêm thông báo nếu có nhiều hơn 3 sản phẩm
        if (cartItems.length > 3) {
            const moreItems = document.createElement('div');
            moreItems.className = 'more-items';
            moreItems.textContent = `+ ${cartItems.length - 3} sản phẩm khác`;
            headerCartItems.appendChild(moreItems);
        }
    }

    // Khởi tạo ứng dụng
    init();
}); 