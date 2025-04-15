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
        $('#editOrderBtn').click(() => this.editOrder());
        $('#deleteOrderBtn').click(() => this.deleteOrder());
    }

    async loadOrders() {
        try {
            const response = await fetch(this.API_BASE.ORDERS);
            const orders = await response.json();
            this.displayOrders(orders);
        } catch (error) {
            this.showToast('Lỗi khi tải danh sách đơn hàng', 'error');
        }
    }

    async loadUsers() {
        try {
            const response = await fetch(this.API_BASE.USERS);
            const users = await response.json();
            const userSelect = $('#userId');
            userSelect.empty().append('<option value="">Chọn người dùng</option>');
            users.forEach(user => {
                userSelect.append(`<option value="${user.id}">${user.name}</option>`);
            });
        } catch (error) {
            this.showToast('Lỗi khi tải danh sách người dùng', 'error');
        }
    }

    async loadProducts() {
        debugger;
        try {
            const response = await fetch(this.API_BASE.PRODUCTS);
            const products = await response.json();
            const productSelects = $('.product-select');
            productSelects.empty().append('<option value="">Chọn sản phẩm</option>');
            products.forEach(product => {
                productSelects.append(`<option value="${product.id}" data-price="${product.price}">${product.name}</option>`);
            });
        } catch (error) {
            this.showToast('Lỗi khi tải danh sách sản phẩm', 'error');
        }
    }

    displayOrders(orders) {
        const tbody = $('#orderTable tbody');
        tbody.empty();
        orders.forEach(order => {
            const row = `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.user.name}</td>
                    <td>${this.formatCurrency(order.totalAmount)}</td>
                    <td><span class="badge bg-${this.getStatusColor(order.status)}">${this.getStatusLabel(order.status)}</span></td>
                    <td>${this.formatDate(order.createdAt)}</td>
                    <td>${order.address}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-order" data-id="${order.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary edit-order" data-id="${order.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-order" data-id="${order.id}">
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
            'Cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    }

    getStatusLabel(status) {
        const labels = {
            'Pending': 'Chờ xác nhận',
            'Processing': 'Đang xử lý',
            'Shipped': 'Đã giao hàng',
            'Delivered': 'Đã nhận hàng',
            'Cancelled': 'Đã hủy'
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
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    openOrderModal(order = null) {
        const modal = $('#orderModal');
        const form = $('#orderForm')[0];
        form.reset();

        if (order) {
            $('#orderModalTitle').text('Sửa Đơn hàng');
            $('#orderId').val(order.id);
            $('#userId').val(order.userId);
            $('#status').val(order.status);
            $('#address').val(order.address);
            $('#note').val(order.note);
            this.loadOrderItems(order.items);
        } else {
            $('#orderModalTitle').text('Thêm Đơn hàng');
            $('#orderId').val('');
            this.addOrderItem();
        }

        modal.modal('show');
    }

    loadOrderItems(items) {
        const container = $('#orderItems');
        container.empty();
        items.forEach(item => {
            this.addOrderItem(item);
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
                    <input type="number" class="form-control quantity-input" placeholder="Số lượng" min="1" required>
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
        this.loadProducts();

        if (item) {
            const row = $('#orderItems .order-item').last();
            row.find('.product-select').val(item.productId);
            row.find('.quantity-input').val(item.quantity);
            this.updateProductPrice(row.find('.product-select'));
        }
    }

    removeOrderItem(event) {
        $(event.target).closest('.order-item').remove();
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
            const quantity = $(row).find('.quantity-input').val() || 0;
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

        const orderData = {
            userId: $('#userId').val(),
            status: $('#status').val(),
            address: $('#address').val(),
            note: $('#note').val(),
            items: []
        };

        $('.order-item').each((_, row) => {
            const productId = $(row).find('.product-select').val();
            const quantity = $(row).find('.quantity-input').val();
            if (productId && quantity) {
                orderData.items.push({ productId, quantity });
            }
        });

        try {
            const orderId = $('#orderId').val();
            const url = orderId ? `${this.API_BASE.ORDERS}/${orderId}` : this.API_BASE.ORDERS;
            const method = orderId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                $('#orderModal').modal('hide');
                this.loadOrders();
                this.showToast('Lưu đơn hàng thành công', 'success');
            } else {
                throw new Error('Lỗi khi lưu đơn hàng');
            }
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    async viewOrderDetail(event) {
        const orderId = $(event.target).closest('.view-order').data('id');
        try {
            const response = await fetch(`${this.API_BASE.ORDERS}/${orderId}`);
            const order = await response.json();

            $('#detailUser').text(order.user.name);
            $('#detailStatus').html(`<span class="badge bg-${this.getStatusColor(order.status)}">${this.getStatusLabel(order.status)}</span>`);
            $('#detailDate').text(this.formatDate(order.createdAt));
            $('#detailTotal').text(this.formatCurrency(order.totalAmount));
            $('#detailAddress').text(order.address);
            $('#detailNote').text(order.note || 'Không có');

            const itemsHtml = order.items.map(item => `
                <tr>
                    <td>${item.product.name}</td>
                    <td>${item.quantity}</td>
                    <td>${this.formatCurrency(item.product.price)}</td>
                    <td>${this.formatCurrency(item.product.price * item.quantity)}</td>
                </tr>
            `).join('');
            $('#detailItems').html(itemsHtml);

            $('#orderDetailModal').modal('show');
        } catch (error) {
            this.showToast('Lỗi khi tải thông tin đơn hàng', 'error');
        }
    }

    async editOrder() {
        const orderId = $('#orderId').val();
        try {
            const response = await fetch(`${this.API_BASE.ORDERS}/${orderId}`);
            const order = await response.json();
            $('#orderDetailModal').modal('hide');
            this.openOrderModal(order);
        } catch (error) {
            this.showToast('Lỗi khi tải thông tin đơn hàng', 'error');
        }
    }

    async deleteOrder() {
        const orderId = $('#orderId').val();
        if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
            return;
        }

        try {
            const response = await fetch(`${this.API_BASE.ORDERS}/${orderId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                $('#orderDetailModal').modal('hide');
                this.loadOrders();
                this.showToast('Xóa đơn hàng thành công', 'success');
            } else {
                throw new Error('Lỗi khi xóa đơn hàng');
            }
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    filterOrders() {
        const searchText = $('#searchOrder').val().toLowerCase();
        const statusFilter = $('#statusFilter').val();
        const dateFilter = $('#dateFilter').val();

        $('#orderTable tbody tr').each((_, row) => {
            const $row = $(row);
            const text = $row.text().toLowerCase();
            const status = $row.find('td:eq(3)').text();
            const date = new Date($row.find('td:eq(4)').text());

            let show = text.includes(searchText);
            if (statusFilter && status !== this.getStatusLabel(statusFilter)) {
                show = false;
            }
            if (dateFilter) {
                const today = new Date();
                const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
                if (dateFilter === 'today' && diff > 0) show = false;
                if (dateFilter === 'week' && diff > 7) show = false;
                if (dateFilter === 'month' && diff > 30) show = false;
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
        const bsToast = new bootstrap.Toast(toastElement);
        bsToast.show();
        toastElement.on('hidden.bs.toast', () => toastElement.remove());
    }
}

// Initialize when document is ready
$(document).ready(() => {
    new AdminOrderManager();
}); 