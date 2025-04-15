class AdminOrderManager {
    constructor() {
        this.API_BASE = {
            ORDERS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}`,
            USERS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`,
            PRODUCTS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`
        };
        this.initializeEventListeners();
        this.loadOrders();
        this.loadUsers();
        this.loadProducts();
    }

    initializeEventListeners() {
        // Add order button
        $('#addOrderBtn').click(() => this.openOrderModal());

        // Save order button
        $('#saveOrderBtn').click(() => this.saveOrder());

        // Search and filter
        $('#searchOrder').on('input', () => this.filterOrders());
        $('#statusFilter').change(() => this.filterOrders());
        $('#dateFilter').change(() => this.filterOrders());

        // Order items
        $('#addOrderItem').click(() => this.addOrderItem());
        $(document).on('click', '.remove-item', (e) => this.removeOrderItem(e));
        $(document).on('change', '.product-select', (e) => this.updateProductPrice(e));
        $(document).on('input', '.quantity-input', () => this.updateTotalAmount());

        // Order detail
        $(document).on('click', '.view-order', (e) => this.viewOrderDetail(e));
        $(document).on('click', '.edit-order', (e) => this.editOrderFromList(e));
        $(document).on('click', '.delete-order', (e) => this.confirmDeleteOrder(e));
        $('#editOrderBtn').click(() => this.editFromDetail());
        $('#deleteOrderBtn').click(() => this.deleteFromDetail());
        $('#confirmDeleteBtn').click(() => this.deleteOrder());
    }

    async loadOrders() {
        try {
            // Đảm bảo request được gửi đi có Access Token
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(this.API_BASE.ORDERS, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Orders data:', data);
            
            // Kiểm tra cấu trúc dữ liệu
            const orders = Array.isArray(data) ? data : (data.Items || []);
            this.displayOrders(orders);
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showToast('Lỗi khi tải danh sách đơn hàng: ' + error.message, 'error');
        }
    }

    async loadUsers() {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(this.API_BASE.USERS, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Users data:', data);
            
            // Kiểm tra cấu trúc dữ liệu
            const users = Array.isArray(data) ? data : (data.Items || []);
            
            const userSelect = $('#userId');
            userSelect.empty().append('<option value="">Chọn người dùng</option>');
            users.forEach(user => {
                userSelect.append(`<option value="${user.Id || user.id}">${user.Username || user.Name || user.Email}</option>`);
            });
        } catch (error) {
            console.error('Error loading users:', error);
            this.showToast('Lỗi khi tải danh sách người dùng: ' + error.message, 'error');
        }
    }

    async loadProducts() {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(this.API_BASE.PRODUCTS, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Products data:', data);
            
            // Kiểm tra cấu trúc dữ liệu
            const products = Array.isArray(data) ? data : (data.Items || []);
            
            const productSelects = $('.product-select');
            productSelects.empty().append('<option value="">Chọn sản phẩm</option>');
            products.forEach(product => {
                productSelects.append(`<option value="${product.Id || product.id}" data-price="${product.Price || product.price}">${product.Name || product.name}</option>`);
            });
        } catch (error) {
            console.error('Error loading products:', error);
            this.showToast('Lỗi khi tải danh sách sản phẩm: ' + error.message, 'error');
        }
    }

    displayOrders(orders) {
        const tbody = $('#orderTable tbody');
        tbody.empty();
        
        if (!Array.isArray(orders) || orders.length === 0) {
            tbody.append(`<tr><td colspan="8" class="text-center">Không có đơn hàng nào</td></tr>`);
            return;
        }
        
        orders.forEach(order => {
            // Xử lý trường hợp không có thông tin user
            const userName = order.User?.Username || order.User?.Name || order.user?.name || 'Không xác định';
            
            // Trích xuất địa chỉ từ các cấu trúc khác nhau
            const address = order.ShippingAddress || order.Address?.AddressLine || order.address || 'Không có địa chỉ';
            
            // Xử lý trường họp khác nhau cho tổng tiền
            const totalAmount = order.TotalAmount || order.Total || order.totalAmount || 0;
            
            // Định dạng ngày tạo
            const createdAt = order.CreatedAt || order.createdAt || new Date();
            
            // Số điện thoại
            const phone = order.PhoneNumber || order.phoneNumber || 'Không có';
            
            const row = `
                <tr>
                    <td>${order.Id || order.id}</td>
                    <td>${userName}</td>
                    <td>${address}</td>
                    <td>${this.formatCurrency(totalAmount)}</td>
                    <td><span class="badge bg-${this.getStatusColor(order.Status || order.status)}">${this.getStatusLabel(order.Status || order.status)}</span></td>
                    <td>${this.formatDate(createdAt)}</td>
                    <td>${phone}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-order" data-id="${order.Id || order.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary edit-order" data-id="${order.Id || order.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-order" data-id="${order.Id || order.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });
    }

    getStatusColor(status) {
        const colors = {
            'Pending': 'warning',
            'Processing': 'info',
            'Shipped': 'primary',
            'Delivered': 'success',
            'Cancelled': 'danger',
            'pending': 'warning',
            'processing': 'info',
            'shipped': 'primary',
            'delivered': 'success',
            'cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    }

    getStatusLabel(status) {
        const labels = {
            'Pending': 'Chờ xác nhận',
            'Processing': 'Đang xử lý',
            'Shipped': 'Đã giao hàng',
            'Delivered': 'Đã nhận hàng',
            'Cancelled': 'Đã hủy',
            'pending': 'Chờ xác nhận',
            'processing': 'Đang xử lý',
            'shipped': 'Đã giao hàng',
            'delivered': 'Đã nhận hàng',
            'cancelled': 'Đã hủy'
        };
        return labels[status] || status;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    formatDate(dateString) {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Không xác định';
        }
    }

    openOrderModal(order = null) {
        const modal = $('#orderModal');
        const form = $('#orderForm')[0];
        form.reset();

        // Thiết lập ngày mặc định là hôm nay
        const today = new Date().toISOString().split('T')[0];
        $('#orderDate').val(today);

        // Xóa tất cả các mục sản phẩm trừ mục đầu tiên
        const orderItems = $('#orderItems');
        orderItems.empty();
        
        if (order) {
            console.log('Editing order:', order);
            $('#orderModalTitle').text('Sửa Đơn hàng');
            $('#orderId').val(order.Id || order.id);
            
            // Thiết lập người dùng
            $('#userId').val(order.User?.Id || order.UserId || order.userId || order.User?.id || order.user?.id);
            
            // Thiết lập trạng thái, đảm bảo chữ cái đầu viết hoa
            const status = order.Status || order.status;
            $('#status').val(status.charAt(0).toUpperCase() + status.slice(1));
            
            // Thiết lập địa chỉ
            $('#shippingAddress').val(order.ShippingAddress || order.Address?.AddressLine || order.address);
            
            // Thiết lập số điện thoại
            $('#phoneNumber').val(order.PhoneNumber || order.phoneNumber || '');
            
            // Thiết lập ngày đặt hàng
            if (order.CreatedAt || order.createdAt) {
                const orderDate = new Date(order.CreatedAt || order.createdAt);
                $('#orderDate').val(orderDate.toISOString().split('T')[0]);
            }
            
            // Tải các mục sản phẩm
            this.loadOrderItems(order.OrderItems || order.Items || order.items || []);
        } else {
            $('#orderModalTitle').text('Thêm Đơn hàng');
            $('#orderId').val('');
            // Xóa hết và thêm một mục sản phẩm trống
            this.addOrderItem();
        }

        modal.modal('show');
    }

    loadOrderItems(items) {
        // Xóa tất cả các mục sản phẩm hiện tại
        $('#orderItems').empty();
        
        if (!Array.isArray(items) || items.length === 0) {
            // Thêm một mục trống nếu không có mục nào
            this.addOrderItem();
            return;
        }
        
        items.forEach(item => {
            const productId = item.ProductId || item.productId || item.Product?.Id || item.product?.id;
            const quantity = item.Quantity || item.quantity;
            this.addOrderItem({ productId, quantity });
        });
    }

    addOrderItem(item = null) {
        const template = `
            <div class="row mb-2 order-item">
                <div class="col-md-5">
                    <select class="form-select product-select" required>
                        <option value="">Chọn sản phẩm</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <input type="number" class="form-control quantity-input" placeholder="Số lượng" min="1" value="1" required>
                </div>
                <div class="col-md-3">
                    <input type="text" class="form-control price-display" readonly>
                </div>
                <div class="col-md-1">
                    <button type="button" class="btn btn-danger btn-sm remove-item">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        $('#orderItems').append(template);
        
        // Tải lại danh sách sản phẩm cho select mới
        const lastRow = $('#orderItems .order-item').last();
        const productSelect = lastRow.find('.product-select');
        
        if (item) {
            // Đặt giá trị số lượng ngay lập tức
            lastRow.find('.quantity-input').val(item.quantity);
            
            // Tải danh sách sản phẩm và chọn sản phẩm đã có
            this.loadProductsForSelect(productSelect, item.productId);
            
            // Cập nhật giá sau khi select sản phẩm
            setTimeout(() => {
                this.updateProductPrice({ target: productSelect });
            }, 500);
        } else {
            this.loadProductsForSelect(productSelect);
        }
    }

    async loadProductsForSelect(select, selectedProductId = null) {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(this.API_BASE.PRODUCTS, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Kiểm tra cấu trúc dữ liệu
            const products = Array.isArray(data) ? data : (data.Items || []);
            
            select.empty().append('<option value="">Chọn sản phẩm</option>');
            products.forEach(product => {
                select.append(`<option value="${product.Id || product.id}" data-price="${product.Price || product.price}">${product.Name || product.name}</option>`);
            });
            
            // Nếu có selectedProductId, đặt giá trị cho select
            if (selectedProductId) {
                select.val(selectedProductId);
            }
        } catch (error) {
            console.error('Error loading products for select:', error);
        }
    }

    removeOrderItem(event) {
        const items = $('.order-item');
        // Chỉ cho phép xóa nếu có nhiều hơn 1 mục
        if (items.length > 1) {
            $(event.target).closest('.order-item').remove();
        } else {
            this.showToast('Đơn hàng phải có ít nhất một sản phẩm', 'error');
        }
        this.updateTotalAmount();
    }

    updateProductPrice(event) {
        const select = $(event.target);
        const row = select.closest('.order-item');
        const price = select.find(':selected').data('price') || 0;
        row.find('.price-display').val(this.formatCurrency(price));
        this.updateTotalAmount();
    }

    updateTotalAmount() {
        let total = 0;
        $('.order-item').each((_, row) => {
            const price = $(row).find('.product-select option:selected').data('price') || 0;
            const quantity = parseInt($(row).find('.quantity-input').val()) || 0;
            total += price * quantity;
        });
        $('#totalAmount').val(this.formatCurrency(total));
    }

    async saveOrder() {
        const form = $('#orderForm')[0];
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Kiểm tra đã chọn người dùng chưa
        const userId = $('#userId').val();
        if (!userId) {
            this.showToast('Vui lòng chọn người dùng', 'error');
            return;
        }

        // Kiểm tra đã chọn sản phẩm chưa
        let hasProducts = false;
        const items = [];
        $('.order-item').each((_, row) => {
            const productId = $(row).find('.product-select').val();
            const quantity = parseInt($(row).find('.quantity-input').val());
            if (productId && quantity > 0) {
                items.push({ 
                    ProductId: parseInt(productId), 
                    Quantity: quantity 
                });
                hasProducts = true;
            }
        });

        if (!hasProducts) {
            this.showToast('Vui lòng chọn ít nhất một sản phẩm', 'error');
            return;
        }

        // Tạo dữ liệu đơn hàng
        const orderData = {
            UserId: parseInt(userId),
            ShippingAddress: $('#shippingAddress').val(),
            PhoneNumber: $('#phoneNumber').val(),
            Items: items
        };

        // Nếu là cập nhật đơn hàng, thêm trạng thái
        const orderId = $('#orderId').val();
        if (orderId) {
            orderData.Status = $('#status').val();
        }

        console.log('Order data to save:', orderData);

        try {
            const url = orderId ? `${this.API_BASE.ORDERS}/${orderId}` : this.API_BASE.ORDERS;
            const method = orderId ? 'PUT' : 'POST';

            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error response:', errorText);
                const errorData = this.tryParseJson(errorText);
                throw new Error(errorData?.message || `Lỗi HTTP: ${response.status}`);
            }

            $('#orderModal').modal('hide');
            this.loadOrders();
            this.showToast('Lưu đơn hàng thành công', 'success');
        } catch (error) {
            console.error('Error saving order:', error);
            this.showToast(error.message || 'Lỗi khi lưu đơn hàng', 'error');
        }
    }

    // Helper function to safely parse JSON
    tryParseJson(text) {
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error('Error parsing JSON:', e);
            return null;
        }
    }

    async viewOrderDetail(event) {
        const orderId = $(event.currentTarget).data('id');
        $('#orderId').val(orderId);
        
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${this.API_BASE.ORDERS}/${orderId}`, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const order = await response.json();
            console.log('Order detail:', order);
            
            // Xử lý user name
            const userName = order.User?.Username || order.User?.Name || order.user?.name || 'Không xác định';
            $('#detailUser').text(userName);
            
            // Xử lý status
            const status = order.Status || order.status;
            $('#detailStatus').html(`<span class="badge bg-${this.getStatusColor(status)}">${this.getStatusLabel(status)}</span>`);
            
            // Xử lý date
            const createdAt = order.CreatedAt || order.createdAt;
            $('#detailDate').text(this.formatDate(createdAt));
            
            // Xử lý total
            const totalAmount = order.TotalAmount || order.Total || order.totalAmount || 0;
            $('#detailTotal').text(this.formatCurrency(totalAmount));
            
            // Xử lý address
            const address = order.ShippingAddress || order.Address?.AddressLine || order.address || 'Không có địa chỉ';
            $('#detailAddress').text(address);
            
            // Xử lý phone
            const phone = order.PhoneNumber || order.phoneNumber || 'Không có';
            $('#detailPhone').text(phone);
            
            // Xử lý note
            $('#detailNote').text(order.Note || order.note || 'Không có');

            // Xử lý items
            const items = order.OrderItems || order.Items || order.items || [];
            const itemsHtml = items.map(item => {
                const product = item.Product || item.product || {};
                const name = product.Name || product.name || 'Không xác định';
                const quantity = item.Quantity || item.quantity || 0;
                const price = product.Price || product.price || item.UnitPrice || item.Price || 0;
                const total = price * quantity;
                
                return `
                    <tr>
                        <td>${name}</td>
                        <td>${quantity}</td>
                        <td>${this.formatCurrency(price)}</td>
                        <td>${this.formatCurrency(total)}</td>
                    </tr>
                `;
            }).join('');
            
            $('#detailItems').html(itemsHtml || '<tr><td colspan="4" class="text-center">Không có sản phẩm</td></tr>');

            $('#orderDetailModal').modal('show');
        } catch (error) {
            console.error('Error loading order details:', error);
            this.showToast('Lỗi khi tải thông tin đơn hàng: ' + error.message, 'error');
        }
    }

    editOrderFromList(event) {
        const orderId = $(event.currentTarget).data('id');
        this.loadOrderForEdit(orderId);
    }

    editFromDetail() {
        const orderId = $('#orderId').val();
        $('#orderDetailModal').modal('hide');
        this.loadOrderForEdit(orderId);
    }
    
    async loadOrderForEdit(orderId) {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${this.API_BASE.ORDERS}/${orderId}`, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const order = await response.json();
            console.log('Order for edit:', order);
            
            this.openOrderModal(order);
        } catch (error) {
            console.error('Error loading order for edit:', error);
            this.showToast('Lỗi khi tải thông tin đơn hàng: ' + error.message, 'error');
        }
    }

    confirmDeleteOrder(event) {
        const orderId = $(event.currentTarget).data('id');
        $('#orderId').val(orderId);
        $('#deleteModal').modal('show');
    }

    deleteFromDetail() {
        $('#orderDetailModal').modal('hide');
        $('#deleteModal').modal('show');
    }

    async deleteOrder() {
        const orderId = $('#orderId').val();
        if (!orderId) {
            this.showToast('Không tìm thấy mã đơn hàng', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${this.API_BASE.ORDERS}/${orderId}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            $('#orderDetailModal').modal('hide');
            this.loadOrders();
            this.showToast('Xóa đơn hàng thành công', 'success');
        } catch (error) {
            console.error('Error deleting order:', error);
            this.showToast('Lỗi khi xóa đơn hàng: ' + error.message, 'error');
        }
    }

    filterOrders() {
        const searchText = $('#searchOrder').val().toLowerCase();
        const statusFilter = $('#statusFilter').val();
        const dateFilter = $('#dateFilter').val();

        $('#orderTable tbody tr').each((_, row) => {
            const $row = $(row);
            
            // Bỏ qua hàng "Không có đơn hàng nào"
            if ($row.find('td').length === 1) {
                return;
            }
            
            const text = $row.text().toLowerCase();
            const status = $row.find('td:eq(4)').text().trim();
            const date = new Date($row.find('td:eq(5)').text());

            let show = text.includes(searchText);
            
            // Lọc theo trạng thái
            if (statusFilter && status !== this.getStatusLabel(statusFilter)) {
                show = false;
            }
            
            // Lọc theo thời gian
            if (dateFilter && !isNaN(date.getTime())) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const orderDate = new Date(date);
                orderDate.setHours(0, 0, 0, 0);
                
                const diffTime = Math.abs(today - orderDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (dateFilter === 'today' && diffDays > 0) show = false;
                if (dateFilter === 'week' && diffDays > 7) show = false;
                if (dateFilter === 'month' && diffDays > 30) show = false;
            }

            $row.toggle(show);
        });
    }

    showToast(message, type = 'success') {
        const toast = `
            <div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        const toastElement = $(toast);
        $('.toast-container').append(toastElement);
        const bsToast = new bootstrap.Toast(toastElement, { delay: 5000 });
        bsToast.show();
        toastElement.on('hidden.bs.toast', () => toastElement.remove());
    }
}

// Initialize when document is ready
$(document).ready(() => {
    new AdminOrderManager();
}); 