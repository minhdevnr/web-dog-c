// Kiểm tra token và tải sidebar khi trang tải xong
window.addEventListener('DOMContentLoaded', function() {
    console.log('Admin page loaded - checking authentication');
    
    // Clear any debug panel from previous sessions
    const existingDebugPanel = document.getElementById('debug-panel');
    if (existingDebugPanel) {
        existingDebugPanel.remove();
    }

    // Thêm debug panel để theo dõi quá trình
    addDebugMessage('Đang khởi tạo trang admin...');
    
    // Kiểm tra token và quyền admin
    checkAdminAuthentication();
    
    // Tải sidebar
    loadSidebar();
    
    // Kiểm tra chức năng
    setTimeout(testFunctionality, 1500);
});

// Hàm kiểm tra xác thực và quyền admin
function checkAdminAuthentication() {
    addDebugMessage('Đang kiểm tra quyền admin...');
    
    // Kiểm tra token tồn tại
    const token = localStorage.getItem('token');
    if (!token) {
        addDebugMessage('Không tìm thấy token, chuyển hướng đến trang đăng nhập');
        // Chuyển hướng đến trang đăng nhập
        window.location.href = '/ECommerceFE/login.html';
        return false;
    }
    
    // Kiểm tra quyền admin
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        // if (!user || !user.role || user.role.toLowerCase() !== 'admin') {
        //     addDebugMessage('Người dùng không có quyền admin, chuyển hướng về trang chủ');
        //     // Chuyển hướng đến trang chủ người dùng
        //     window.location.href = '/ECommerceFE/index.html';
        //     return false;
        // }
        
        addDebugMessage('Xác thực admin thành công');
        return true;
    } catch (error) {
        console.error('Lỗi khi kiểm tra quyền admin:', error);
        addDebugMessage('Lỗi xác thực: ' + error.message);
        // Chuyển hướng đến trang đăng nhập trong trường hợp lỗi
        window.location.href = '/ECommerceFE/login.html';
        return false;
    }
}

// Function để thêm debug message
function addDebugMessage(message) {
    console.log('Debug:', message);
    
    // Tạo debug panel nếu chưa tồn tại
    // let debugPanel = document.getElementById('debug-panel');
    // if (!debugPanel) {
    //     debugPanel = document.createElement('div');
    //     debugPanel.id = 'debug-panel';
    //     debugPanel.style.position = 'fixed';
    //     debugPanel.style.bottom = '10px';
    //     debugPanel.style.right = '10px';
    //     debugPanel.style.width = '300px';
    //     debugPanel.style.maxHeight = '200px';
    //     debugPanel.style.overflow = 'auto';
    //     debugPanel.style.backgroundColor = 'rgba(0,0,0,0.8)';
    //     debugPanel.style.color = 'white';
    //     debugPanel.style.padding = '10px';
    //     debugPanel.style.borderRadius = '5px';
    //     debugPanel.style.zIndex = '9999';
    //     debugPanel.style.fontSize = '12px';
    //     debugPanel.style.fontFamily = 'monospace';
        
    //     const header = document.createElement('div');
    //     header.textContent = 'Debug Panel';
    //     header.style.fontWeight = 'bold';
    //     header.style.marginBottom = '5px';
    //     header.style.borderBottom = '1px solid white';
    //     debugPanel.appendChild(header);
        
    //     document.body.appendChild(debugPanel);
    // }
    
    // const msgDiv = document.createElement('div');
    // msgDiv.textContent = new Date().toLocaleTimeString() + ': ' + message;
    // msgDiv.style.borderBottom = '1px dotted #555';
    // msgDiv.style.paddingBottom = '3px';
    // msgDiv.style.marginBottom = '3px';
    
    // debugPanel.appendChild(msgDiv);
    // debugPanel.scrollTop = debugPanel.scrollHeight;
}

// Function để tải sidebar
function loadSidebar() {
    addDebugMessage('Đang tải sidebar...');
    
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) {
        addDebugMessage('Lỗi: Không tìm thấy phần tử sidebar-container');
        return;
    }
    
    // Chỉ tải sidebar nếu chưa có nội dung
    if (sidebarContainer.innerHTML.trim()) {
        addDebugMessage('Sidebar đã được tải trước đó');
        highlightCurrentPage();
        return;
    }
    
    // Thử xác định đường dẫn tương đối
    const currentPath = window.location.pathname;
    let sidebarPath = 'sidebar.html'; // Đường dẫn tương đối mặc định
    
    // Nếu ở trong thư mục ECommerceFE/admin
    if (currentPath.includes('/admin/') || currentPath.includes('/admin')) {
        if (currentPath.endsWith('/')) {
            sidebarPath = 'sidebar.html';
        } else {
            // Lấy đường dẫn tương đối dựa trên vị trí hiện tại
            const segments = currentPath.split('/');
            const lastSegment = segments[segments.length - 1];
            
            // Nếu đang ở các trang con, đường dẫn vẫn là tương đối
            sidebarPath = 'sidebar.html';
        }
    } else {
        // Nếu đang không ở trong thư mục admin, dùng đường dẫn tuyệt đối
        sidebarPath = '/ECommerceFE/admin/sidebar.html';
    }
    
    addDebugMessage('Đang tải sidebar từ: ' + sidebarPath);
    
    fetch(sidebarPath)
        .then(response => {
            if (!response.ok) {
                // Thử lại với đường dẫn tuyệt đối
                addDebugMessage('Không thể tải với đường dẫn tương đối, thử với đường dẫn tuyệt đối');
                return fetch('/ECommerceFE/admin/sidebar.html');
            }
            return response.text();
        })
        .then(data => {
            sidebarContainer.innerHTML = data;
            addDebugMessage('Đã tải sidebar thành công');
            
            // Highlight trang hiện tại
            highlightCurrentPage();
            
            // Thêm event listener cho nút đăng xuất
            setupLogoutButton();
        })
        .catch(error => {
            addDebugMessage('Lỗi khi tải sidebar: ' + error.message);
            console.error('Error loading sidebar:', error);
            
            // Tạo sidebar tạm thời trong trường hợp không tải được
            createFallbackSidebar();
        });
}

// Tạo sidebar tạm thời nếu không tải được từ file
function createFallbackSidebar() {
    addDebugMessage('Tạo sidebar dự phòng...');
    
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
                <li id="menu-order"><a href="admin-project.html"><span class="fa fa-truck-loading"></span><span>Quản lý đơn hàng</span></a></li>
                <li id="menu-logout"><a href="#" id="logoutButton"><span class="fa fa-sign-out-alt"></span><span>Đăng xuất</span></a></li>
            </ul>
        </div>
    `;
    
    // Highlight trang hiện tại
    highlightCurrentPage();
    
    // Thêm event listener cho nút đăng xuất
    setupLogoutButton();
}

// Hàm thiết lập nút đăng xuất
function setupLogoutButton() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault();
            addDebugMessage('Đăng xuất...');
            
            try {
                // Xóa thông tin đăng nhập
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Hiển thị thông báo thành công
                if (typeof NotificationSystem !== 'undefined') {
                    NotificationSystem.success('Đăng xuất thành công');
                } else {
                    alert('Đăng xuất thành công');
                }
                
                // Chuyển hướng đến trang đăng nhập
                window.location.href = '/ECommerceFE/login.html';
            } catch (error) {
                console.error('Error during logout:', error);
                addDebugMessage('Lỗi khi đăng xuất: ' + error.message);
                
                if (typeof NotificationSystem !== 'undefined') {
                    NotificationSystem.error('Đã xảy ra lỗi khi đăng xuất');
                } else {
                    alert('Đã xảy ra lỗi khi đăng xuất');
                }
            }
        });
    } else {
        addDebugMessage('Cảnh báo: Không tìm thấy nút đăng xuất');
    }
}

// Hàm đánh dấu trang hiện tại trong sidebar
function highlightCurrentPage() {
    // Xác định trang hiện tại từ URL
    const fullPath = window.location.pathname;
    let currentPage = '';
    
    // Xử lý đường dẫn để lấy tên file
    if (fullPath.includes('/admin/')) {
        const pathParts = fullPath.split('/');
        currentPage = pathParts[pathParts.length - 1] || 'admin.html';
    } else {
        const pathSegments = fullPath.split('/');
        currentPage = pathSegments[pathSegments.length - 1] || 'admin.html';
    }
    
    // Nếu đường dẫn kết thúc bằng '/' hoặc là empty string, đó là trang admin.html
    if (fullPath.endsWith('/admin/') || currentPage === '') {
        currentPage = 'admin.html';
    }
    
    addDebugMessage('Đánh dấu menu cho trang: ' + currentPage);
    
    // Tìm menu tương ứng và đánh dấu là active
    let foundActive = false;
    
    // Đánh dấu dựa trên ID (ưu tiên)
    if (currentPage === 'admin.html' || currentPage === '') {
        const homeMenu = document.getElementById('menu-home');
        if (homeMenu) {
            homeMenu.classList.add('active');
            addDebugMessage('Đã đánh dấu active cho menu home (bằng ID)');
            foundActive = true;
        }
    } else if (currentPage.includes('product')) {
        const productMenu = document.getElementById('menu-product');
        if (productMenu) {
            productMenu.classList.add('active');
            addDebugMessage('Đã đánh dấu active cho menu product (bằng ID)');
            foundActive = true;
        }
    } else if (currentPage.includes('news')) {
        const newsMenu = document.getElementById('menu-news');
        if (newsMenu) {
            newsMenu.classList.add('active');
            addDebugMessage('Đã đánh dấu active cho menu news (bằng ID)');
            foundActive = true;
        }
    } else if (currentPage.includes('user')) {
        const userMenu = document.getElementById('menu-user');
        if (userMenu) {
            userMenu.classList.add('active');
            addDebugMessage('Đã đánh dấu active cho menu user (bằng ID)');
            foundActive = true;
        }
    } else if (currentPage.includes('project')) {
        const orderMenu = document.getElementById('menu-order');
        if (orderMenu) {
            orderMenu.classList.add('active');
            addDebugMessage('Đã đánh dấu active cho menu order (bằng ID)');
            foundActive = true;
        }
    }
    
    // Nếu không tìm thấy bằng ID, thử dùng attribute href
    if (!foundActive) {
        // Kiểm tra các link trong sidebar
        const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
        
        sidebarLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            const linkParent = link.parentElement;
            
            if (linkPage === currentPage) {
                linkParent.classList.add('active');
                addDebugMessage('Đã đánh dấu active cho menu: ' + linkPage);
                foundActive = true;
            } else if (currentPage === '' && linkPage === 'admin.html') {
                linkParent.classList.add('active');
                addDebugMessage('Đã đánh dấu active cho menu trang chủ');
                foundActive = true;
            }
        });
    }
    
    if (!foundActive) {
        addDebugMessage('Không thể đánh dấu menu active cho trang ' + currentPage);
        
        // Fallback: Đánh dấu trang chủ nếu không tìm thấy trang khớp
        if (currentPage === 'admin.html' || currentPage === '' || currentPage === 'admin') {
            const firstMenuItem = document.querySelector('.sidebar-menu li');
            if (firstMenuItem) {
                firstMenuItem.classList.add('active');
                addDebugMessage('Đã đánh dấu menu đầu tiên làm active (fallback)');
            }
        }
    }
}

// Function để kiểm tra chức năng
function testFunctionality() {
    addDebugMessage('Kiểm tra chức năng của trang admin...');
    
    // Kiểm tra sidebar đã được tải chưa
    const sidebar = document.getElementById('sidebar-container');
    if (!sidebar || !sidebar.innerHTML.trim()) {
        addDebugMessage('Lỗi: Sidebar không được tải đúng cách');
        // Thử tải lại sidebar với đường dẫn tương đối
        loadSidebar();
    } else {
        addDebugMessage('Sidebar đã tải thành công');
    }
    
    // Kiểm tra active link
    const activeLinks = document.querySelectorAll('.sidebar li.active');
    if (activeLinks.length === 0) {
        addDebugMessage('Cảnh báo: Không có menu nào được đánh dấu active');
        // Thử highlight lại
        highlightCurrentPage();
    } else {
        addDebugMessage('Menu active đã được đánh dấu thành công');
    }
    
    // Kiểm tra kết nối API nếu cần
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage && (
        currentPage.includes('product') || 
        currentPage.includes('user') || 
        currentPage.includes('news') || 
        currentPage.includes('project')
    )) {
        checkAPIConnectivity();
    }
}

// Kiểm tra kết nối với API
function checkAPIConnectivity() {
    addDebugMessage('Đang kiểm tra kết nối API...');
    
    // Sử dụng API_CONFIG từ window object 
    const apiConfig = window.API_CONFIG || {
        BASE_URL: 'https://localhost:7175',
        ENDPOINTS: { PING: '/api/ping' }
    };
    
    // Thử ping API
    const pingUrl = apiConfig.BASE_URL + apiConfig.ENDPOINTS.PING;
    addDebugMessage('Ping URL: ' + pingUrl);
    
    fetch(pingUrl, { 
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
    })
    .then(response => {
        if (response.ok) {
            addDebugMessage('Kết nối API thành công');
            return response.json();
        } else {
            throw new Error('Lỗi ' + response.status);
        }
    })
    .catch(error => {
        addDebugMessage('Lỗi kết nối API: ' + error.message);
        console.error('API connection error:', error);
    });
}

// Hàm reset mật khẩu (giữ lại để tương thích)
window.resetUserPassword = async function(userId, newPassword) {
    addDebugMessage('Đang đặt lại mật khẩu cho người dùng ' + userId);
    
    try {
        // Lấy API_CONFIG từ window global
        const apiConfig = window.API_CONFIG || {
            BASE_URL: 'https://localhost:7175',
            ENDPOINTS: { USERS: '/api/user' }
        };
        
        // Kiểm tra độ mạnh mật khẩu
        if (typeof window.validatePassword === 'function') {
            const passwordValidation = window.validatePassword(newPassword);
            if (!passwordValidation.valid) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('error', passwordValidation.message);
                } else {
                    alert(passwordValidation.message);
                }
                addDebugMessage('Mật khẩu không hợp lệ: ' + passwordValidation.message);
                return false;
            }
        }
        
        addDebugMessage('Đang gửi yêu cầu đặt lại mật khẩu...');
        const response = await fetch(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.USERS}/${userId}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify({ newPassword })
        });
        
        if (!response.ok) {
            throw new Error('Không thể đặt lại mật khẩu (HTTP ' + response.status + ')');
        }
        
        addDebugMessage('Đặt lại mật khẩu thành công');
        if (typeof window.showNotification === 'function') {
            window.showNotification('success', 'Mật khẩu đã được đặt lại thành công');
        } else {
            alert('Mật khẩu đã được đặt lại thành công');
        }
        return true;
    } catch (error) {
        addDebugMessage('Lỗi: ' + error.message);
        if (typeof window.showNotification === 'function') {
            window.showNotification('error', error.message);
        } else {
            alert(error.message);
        }
        return false;
    }
};

// Khởi tạo trang khi tải xong
if (document.readyState === 'complete') {
    loadSidebar();
    setTimeout(testFunctionality, 1500);
} else {
    console.log('Admin.js loaded - waiting for DOMContentLoaded event');
}
