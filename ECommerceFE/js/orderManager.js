// When the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    loadUsers(); // To get the user list for the dropdown
    
    // Add event listener for the add order button
    document.getElementById('addOrderButton').addEventListener('click', function() {
        openOrderModal();
    });
    
    // Add event listener for the save order button
    document.getElementById('saveOrderButton').addEventListener('click', saveOrder);
});

// Function to load all orders
async function loadOrders() {
    try {
        const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ORDERS);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const orders = await response.json();
        const orderTableBody = document.getElementById('orderTable').querySelector('tbody');
        orderTableBody.innerHTML = ''; // Clear existing data

        orders.forEach((order, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row">${index + 1}</th>
                <td>${order.User ? order.User.FullName : 'N/A'}</td>
                <td>${order.ShippingAddress || ''}</td>
                <td>${order.TotalAmount.toLocaleString()} đ</td>
                <td>${getStatusLabel(order.Status)}</td>
                <td>${new Date(order.OrderDate).toLocaleDateString()}</td>
                <td>${order.PhoneNumber || ''}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteOrder(${order.id})">Xóa</button>
                    <button class="btn btn-warning btn-sm" onclick="editOrder(${order.id})">Sửa</button>
                </td>
            `;
            orderTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        NotificationSystem.error('Lỗi khi tải danh sách đơn hàng');
    }
}

// Convert status to Vietnamese label
function getStatusLabel(status) {
    const statusMap = {
        'Pending': 'Chờ xử lý',
        'Processing': 'Đang xử lý',
        'Shipped': 'Đã gửi hàng',
        'Delivered': 'Đã giao hàng',
        'Cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

// Function to load users for dropdown
async function loadUsers() {
    try {
        const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.USERS);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const users = await response.json();
        const userDropdown = document.getElementById('userId');
        
        // Clear all options except the default one
        while (userDropdown.options.length > 1) {
            userDropdown.remove(1);
        }
        
        // Add users to dropdown
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.Id;
            option.textContent = user.FullName + ' (' + user.Email + ')';
            userDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        NotificationSystem.error('Lỗi khi tải danh sách người dùng');
    }
}

// Function to delete an order
async function deleteOrder(orderId) {
    if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                NotificationSystem.success('Đơn hàng đã được xóa thành công');
                loadOrders(); // Reload order list
            } else {
                const error = await response.text();
                NotificationSystem.error(error || 'Không thể xóa đơn hàng');
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            NotificationSystem.error('Đã xảy ra lỗi khi xóa đơn hàng');
        }
    }
}

// Function to edit an order
function editOrder(orderId) {
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}`)
        .then(response => response.json())
        .then(order => {
            openOrderModal(order);
        })
        .catch(error => {
            console.error('Error fetching order data:', error);
            NotificationSystem.error('Lỗi khi tải thông tin đơn hàng');
        });
}

// Function to open modal (for add or edit)
function openOrderModal(order = {}) {
    // Reset form
    document.getElementById('orderForm').reset();
    
    // Set modal title based on operation (add or edit)
    document.getElementById('orderModalLabel').textContent = order.id ? 'Sửa Đơn Hàng' : 'Thêm Đơn Hàng Mới';
    
    // Populate form if editing
    if (order.id) {
        document.getElementById('userId').value = order.userId || '';
        document.getElementById('shippingAddress').value = order.shippingAddress || '';
        document.getElementById('phoneNumber').value = order.phoneNumber || '';
        document.getElementById('totalAmount').value = order.totalAmount || '';
        document.getElementById('status').value = order.status || 'Pending';
        document.getElementById('orderDate').value = order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : '';
        document.getElementById('orderId').value = order.id;
    } else {
        document.getElementById('orderId').value = '';
        // Set default date to today
        document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
    }
    
    // Show the modal
    $('#orderModal').modal('show');
}

// Function to save order (both add and edit)
async function saveOrder() {
    const orderId = document.getElementById('orderId').value;
    
    const order = {
        userId: document.getElementById('userId').value,
        shippingAddress: document.getElementById('shippingAddress').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        totalAmount: document.getElementById('totalAmount').value,
        status: document.getElementById('status').value,
        orderDate: document.getElementById('orderDate').value,
    };
    
    if (orderId) {
        order.id = orderId;
    }
    
    const method = orderId ? 'PUT' : 'POST';
    const url = orderId 
        ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}` 
        : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}`;
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });
        
        if (response.ok) {
            const successMessage = orderId ? 'Đơn hàng đã được cập nhật thành công' : 'Đơn hàng đã được thêm thành công';
            NotificationSystem.success(successMessage);
            loadOrders(); // Reload the order list
            $('#orderModal').modal('hide'); // Hide the modal
        } else {
            const error = await response.text();
            NotificationSystem.error('Lỗi: ' + error);
        }
    } catch (error) {
        console.error('Error saving order:', error);
        NotificationSystem.error('Đã xảy ra lỗi khi lưu đơn hàng');
    }
}
