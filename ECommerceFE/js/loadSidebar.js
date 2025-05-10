// Compatibility file for pages still using loadSidebar.js
// This just calls the loadSidebar function from admin.js if it exists,
// or provides a simple implementation if not

(function() {
    console.log('loadSidebar.js: Compatibility script loaded');
    
    
    // Đảm bảo rằng sidebar luôn hiển thị với CSS
    const style = document.createElement('style');
    style.textContent = `
        .sidebar {
            display: block !important;
            visibility: visible !important;
        }
    `;
    document.head.appendChild(style);
    
    // Check if admin.js is loaded
    if (typeof loadSidebar === 'function') {
        console.log('loadSidebar.js: Using the loadSidebar function from admin.js');
        // Gọi lại hàm loadSidebar từ admin.js
        setTimeout(function() {
            if (typeof loadSidebar === 'function') {
                loadSidebar();
            }
        }, 100);
    } else {
        console.log('loadSidebar.js: admin.js not loaded, using fallback implementation');
        
        // Define a simple implementation
        window.loadSidebar = function() {
            console.log('loadSidebar.js: Loading sidebar (fallback implementation)');
            
            const sidebarContainer = document.getElementById('sidebar-container');
            if (!sidebarContainer) {
                console.error('Sidebar container not found!');
                return;
            }
            
            // Chỉ tải sidebar nếu chưa có nội dung
            if (sidebarContainer.innerHTML.trim()) {
                highlightCurrentPageFallback();
                return;
            }
            
            fetch('/../admin/sidebar.html')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to load sidebar: ' + response.status);
                    }
                    return response.text();
                })
                .then(data => {
                    sidebarContainer.innerHTML = data;
                    
                    // Highlight trang hiện tại
                    highlightCurrentPageFallback();
                    
                    // Setup logout button
                    const logoutButton = document.getElementById('logoutButton');
                    if (logoutButton) {
                        logoutButton.addEventListener('click', function(event) {
                            event.preventDefault();
                            localStorage.removeItem('token');
                            localStorage.removeItem('currentUser');
                            alert('Đăng xuất thành công');
                            window.location.href = '/../login.html';
                        });
                    }
                })
                .catch(error => {
                    console.error('Error loading sidebar:', error);
                    // Tạo sidebar dự phòng
                    createFallbackSidebar();
                });
        };

        // Hàm tạo sidebar dự phòng
        function createFallbackSidebar() {
            const sidebarContainer = document.getElementById('sidebar-container');
            if (!sidebarContainer) return;
            
            sidebarContainer.innerHTML = `
                <div class="sidebar-header">
                    <h3 class="brand"><span>LH Coffee</span></h3>
                    <label for="sidebar-toggle" class="fa fa-bars"></label>
                </div>
                <div class="sidebar-menu">
                    <ul>
                        <li id="menu-home"><a href="admin.html"><span class="fa fa-home"></span><span>Trang chủ</span></a></li>
                        <li id="menu-product"><a href="admin-product.html"><span class="fa fa-coffee"></span><span>Quản lý sản phẩm</span></a></li>
                        <li id="menu-category"><a href="admin-category.html"><span class="fa fa-tags"></span><span>Quản lý loại sản phẩm</span></a></li>
                        <li id="menu-news"><a href="admin-news.html"><span class="fa fa-newspaper"></span><span>Quản lý bài viết</span></a></li>
                        <li id="menu-user"><a href="admin-user.html"><span class="fa fa-user"></span><span>Quản lý user</span></a></li>
                        <li id="menu-order"><a href="admin-order.html"><span class="fa fa-truck-loading"></span><span>Quản lý đơn hàng</span></a></li>
                        <li id="menu-logout"><a href="#" id="logoutButton"><span class="fa fa-sign-out-alt"></span><span>Đăng xuất</span></a></li>
                    </ul>
                </div>
            `;
            
            // Highlight trang hiện tại
            highlightCurrentPageFallback();
            
            // Setup logout button
            const logoutButton = document.getElementById('logoutButton');
            if (logoutButton) {
                logoutButton.addEventListener('click', function(event) {
                    event.preventDefault();
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    alert('Đăng xuất thành công');
                    window.location.href = '/../login.html';
                });
            }
        }
        
        // Hàm highlight trang hiện tại fallback
        function highlightCurrentPageFallback() {
            const path = window.location.pathname;
            const page = path.split('/').pop() || 'admin.html';
            
            console.log('Current page:', page);
            
            // Xóa tất cả active hiện tại
            document.querySelectorAll('.sidebar-menu li').forEach(item => {
                item.classList.remove('active');
            });
            
            // Đánh dấu menu tương ứng
            if (page === 'admin.html' || page === '' || page === 'admin') {
                const homeMenu = document.getElementById('menu-home') || document.querySelector('.sidebar-menu li:first-child');
                if (homeMenu) homeMenu.classList.add('active');
            } else if (page.includes('product') && !page.includes('category')) {
                const productMenu = document.getElementById('menu-product') || document.querySelector('.sidebar-menu li:nth-child(2)');
                if (productMenu) productMenu.classList.add('active');
            } else if (page.includes('category')) {
                const categoryMenu = document.getElementById('menu-category') || document.querySelector('.sidebar-menu li:nth-child(3)');
                if (categoryMenu) categoryMenu.classList.add('active');
            } else if (page.includes('news')) {
                const newsMenu = document.getElementById('menu-news') || document.querySelector('.sidebar-menu li:nth-child(4)');
                if (newsMenu) newsMenu.classList.add('active');
            } else if (page.includes('user')) {
                const userMenu = document.getElementById('menu-user') || document.querySelector('.sidebar-menu li:nth-child(5)');
                if (userMenu) userMenu.classList.add('active');
            } else if (page.includes('project')) {
                const orderMenu = document.getElementById('menu-order') || document.querySelector('.sidebar-menu li:nth-child(6)');
                if (orderMenu) orderMenu.classList.add('active');
            }
        }
    }
    
    // Call loadSidebar when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Gọi hàm loadSidebar (nếu đã có từ admin.js hoặc định nghĩa ở trên)
            if (typeof window.loadSidebar === 'function') {
                window.loadSidebar();
            }
        });
    } else {
        // Nếu DOM đã tải xong, gọi ngay
        if (typeof window.loadSidebar === 'function') {
            window.loadSidebar();
        }
    }
})();
