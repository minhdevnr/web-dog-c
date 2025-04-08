document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Load thông tin người dùng
    loadUserProfile();
    
    // Load lịch sử đơn hàng
    loadOrderHistory();
    
    // Load địa chỉ
    loadAddresses();

    // Xử lý chuyển tab
    const menuLinks = document.querySelectorAll('.profile-menu a');
    const tabs = document.querySelectorAll('.profile-tab');

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = link.getAttribute('data-tab');
            
            // Cập nhật active state
            menuLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Hiển thị tab tương ứng
            tabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.id === targetTab) {
                    tab.classList.add('active');
                }
            });
        });
    });

    // Xử lý form cập nhật thông tin
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            username: document.getElementById('username').value,
            address: document.getElementById('address').value,
            dateOfBirth: document.getElementById('birthdate').value
        };

        try {
            const response = await fetch('/api/v1/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showNotification('success', 'Cập nhật thông tin thành công');
            } else {
                const error = await response.json();
                showNotification('error', error.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            showNotification('error', 'Không thể kết nối đến server');
        }
    });

    // Xử lý đổi mật khẩu
    const changePasswordForm = document.getElementById('change-password-form');
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (newPassword !== confirmPassword) {
            showNotification('error', 'Mật khẩu xác nhận không khớp');
            return;
        }

        const formData = {
            currentPassword: document.getElementById('current-password').value,
            newPassword: newPassword
        };

        try {
            const response = await fetch('/api/v1/users/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showNotification('success', 'Đổi mật khẩu thành công');
                changePasswordForm.reset();
            } else {
                const error = await response.json();
                showNotification('error', error.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            showNotification('error', 'Không thể kết nối đến server');
        }
    });

    // Xử lý upload ảnh đại diện
    const profilePictureUpload = document.getElementById('profile-picture-upload');
    profilePictureUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const response = await fetch('/api/v1/users/profile-picture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                document.getElementById('profile-picture').src = data.profilePicture;
                showNotification('success', 'Cập nhật ảnh đại diện thành công');
            } else {
                const error = await response.json();
                showNotification('error', error.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            showNotification('error', 'Không thể kết nối đến server');
        }
    });

    // Xử lý bật/tắt xác thực 2 lớp
    const toggle2FABtn = document.getElementById('toggle-2fa');
    toggle2FABtn.addEventListener('click', async () => {
        const is2FAEnabled = toggle2FABtn.textContent.includes('Tắt');
        const endpoint = is2FAEnabled ? '/api/v1/users/disable-2fa' : '/api/v1/users/enable-2fa';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const status = is2FAEnabled ? 'Chưa bật' : 'Đã bật';
                document.getElementById('2fa-status').textContent = status;
                toggle2FABtn.textContent = is2FAEnabled ? 'Bật xác thực hai lớp' : 'Tắt xác thực hai lớp';
                showNotification('success', `Đã ${is2FAEnabled ? 'tắt' : 'bật'} xác thực hai lớp`);
            } else {
                const error = await response.json();
                showNotification('error', error.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            showNotification('error', 'Không thể kết nối đến server');
        }
    });
});

// Hàm load thông tin người dùng
async function loadUserProfile() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/v1/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            
            // Cập nhật thông tin form
            document.getElementById('username').value = user.username;
            document.getElementById('email').value = user.email;
            document.getElementById('phone').value = user.phoneNumber;
            document.getElementById('birthdate').value = user.dateOfBirth?.split('T')[0];
            
            // Cập nhật trạng thái xác thực
            document.getElementById('email-verified').style.display = user.isEmailVerified ? 'inline-flex' : 'none';
            document.getElementById('phone-verified').style.display = user.isPhoneVerified ? 'inline-flex' : 'none';
            
            // Cập nhật ảnh đại diện
            if (user.profilePicture) {
                document.getElementById('profile-picture').src = user.profilePicture;
            }
            
            // Cập nhật trạng thái 2FA
            const status2FA = user.isTwoFactorEnabled ? 'Đã bật' : 'Chưa bật';
            document.getElementById('2fa-status').textContent = status2FA;
            document.getElementById('toggle-2fa').textContent = user.isTwoFactorEnabled ? 'Tắt xác thực hai lớp' : 'Bật xác thực hai lớp';
        }
    } catch (error) {
        showNotification('error', 'Không thể tải thông tin người dùng');
    }
}

// Hàm load lịch sử đơn hàng
async function loadOrderHistory() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/v1/orders/my-orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const orders = await response.json();
            const container = document.getElementById('orders-container');
            container.innerHTML = orders.map(order => `
                <div class="order-item">
                    <div class="order-header">
                        <div>
                            <strong>Mã đơn hàng:</strong> #${order.id}
                            <br>
                            <small>Ngày đặt: ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</small>
                        </div>
                        <div class="order-status">${getOrderStatusText(order.status)}</div>
                    </div>
                    <div class="order-products">
                        ${order.items.map(item => `
                            <div class="order-product">
                                <img src="${item.product.image}" alt="${item.product.name}" width="50">
                                <span>${item.product.name} x ${item.quantity}</span>
                                <span>${formatCurrency(item.price)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-footer">
                        <div class="order-total">
                            <strong>Tổng tiền:</strong> ${formatCurrency(order.total)}
                        </div>
                        <div class="order-actions">
                            <button class="btn" onclick="viewOrderDetail(${order.id})">Xem chi tiết</button>
                        </div>
                    </div>
                </div>
            `).join('') || '<p>Chưa có đơn hàng nào</p>';
        }
    } catch (error) {
        showNotification('error', 'Không thể tải lịch sử đơn hàng');
    }
}

// Hàm load địa chỉ
async function loadAddresses() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/v1/users/addresses', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const addresses = await response.json();
            const container = document.getElementById('addresses-container');
            container.innerHTML = addresses.map(address => `
                <div class="address-card">
                    <span class="address-type">${address.isDefault ? 'Địa chỉ mặc định' : 'Địa chỉ phụ'}</span>
                    <div class="address-actions">
                        <button class="btn" onclick="editAddress(${address.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn" onclick="deleteAddress(${address.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <h4>${address.receiverName}</h4>
                    <p>${address.phone}</p>
                    <p>${address.addressLine}, ${address.ward}, ${address.district}, ${address.city}</p>
                </div>
            `).join('') || '<p>Chưa có địa chỉ nào</p>';
        }
    } catch (error) {
        showNotification('error', 'Không thể tải danh sách địa chỉ');
    }
}

// Hàm hỗ trợ
function getOrderStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'shipping': 'Đang giao hàng',
        'delivered': 'Đã giao hàng',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Hàm xử lý địa chỉ
function editAddress(id) {
    // TODO: Implement address editing
}

function deleteAddress(id) {
    // TODO: Implement address deletion
}

function viewOrderDetail(id) {
    // TODO: Implement order detail view
} 