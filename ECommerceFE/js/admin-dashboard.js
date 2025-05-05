class AdminDashboard {
    constructor() {
        this.API_BASE = {
            DASHBOARD: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD}`
        };
        this.init();
    }

    async init() {
        try {
            await this.loadDashboardSummary();
            await this.loadRecentActivities();
            await this.loadStatistics();
        } catch (error) {
            console.error("Lỗi khi khởi tạo dashboard:", error);
            this.showToast('Lỗi khi tải dữ liệu dashboard: ' + error.message, 'error');
        }
    }

    async loadDashboardSummary() {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${this.API_BASE.DASHBOARD}/summary`, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Dashboard summary:', data);
            
            // Cập nhật UI với dữ liệu từ API
            this.updateDashboardSummary(data);
        } catch (error) {
            console.error('Error loading dashboard summary:', error);
            this.showToast('Lỗi khi tải thông tin tổng quan: ' + error.message, 'error');
        }
    }

    updateDashboardSummary(data) {
        // Cập nhật các card với số liệu thống kê
        const formatCurrency = window.formatCurrency || function(amount) {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0
            }).format(amount);
        };

        // Cập nhật giá trị cho các card
        const totalRevenueElement = document.querySelector('.card-single:nth-child(1) h4');
        const successRevenueElement = document.querySelector('.card-single:nth-child(2) h4');
        const pendingRevenueElement = document.querySelector('.card-single:nth-child(3) h4');

        if (totalRevenueElement) totalRevenueElement.textContent = formatCurrency(data.TotalRevenue);
        if (successRevenueElement) successRevenueElement.textContent = formatCurrency(data.SuccessRevenue);
        if (pendingRevenueElement) pendingRevenueElement.textContent = formatCurrency(data.PendingRevenue);

        // Cập nhật text cho các card
        const balanceLabel = document.querySelector('.card-single:nth-child(1) h5');
        const successLabel = document.querySelector('.card-single:nth-child(2) h5');
        const pendingLabel = document.querySelector('.card-single:nth-child(3) h5');

        if (balanceLabel) balanceLabel.textContent = 'Tổng doanh thu';
        if (successLabel) successLabel.textContent = 'Doanh thu thành công';
        if (pendingLabel) pendingLabel.textContent = 'Doanh thu đang chờ';
    }

    async loadRecentActivities() {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${this.API_BASE.DASHBOARD}/summary`, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Recent activities:', data.RecentActivities);
            
            // Cập nhật bảng với hoạt động gần đây
            this.updateRecentActivities(data.RecentActivities);
        } catch (error) {
            console.error('Error loading recent activities:', error);
            this.showToast('Lỗi khi tải hoạt động gần đây: ' + error.message, 'error');
        }
    }

    updateRecentActivities(activities) {
        if (!Array.isArray(activities) || activities.length === 0) {
            return;
        }

        const tableBody = document.querySelector('.activity-card table tbody');
        if (!tableBody) {
            console.error('Không tìm thấy bảng hoạt động gần đây');
            return;
        }

        // Xóa dữ liệu hiện tại
        tableBody.innerHTML = '';

        // Thêm dữ liệu mới
        activities.forEach(activity => {
            const startDate = new Date(activity.StartDate).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const endDate = new Date(activity.EndDate).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const statusClass = this.getStatusClass(activity.Status);
            const statusLabel = this.getStatusLabel(activity.Status);

            const row = `
                <tr>
                    <td>${activity.Title}</td>
                    <td>${startDate}</td>
                    <td>${endDate}</td>
                    <td>${activity.UserName}</td>
                    <td><span class="badge ${statusClass}">${statusLabel}</span></td>
                </tr>
            `;
            
            tableBody.innerHTML += row;
        });

        // Cập nhật tiêu đề
        const tableTitle = document.querySelector('.activity-card h3');
        if (tableTitle) {
            tableTitle.textContent = 'Hoạt động gần đây';
        }
    }

    // Thêm phương thức mới để tải thống kê từ API
    async loadStatistics() {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${this.API_BASE.DASHBOARD}/statistics`, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Dashboard statistics:', data);
            
            // Cập nhật UI với dữ liệu thống kê
            this.updateStatistics(data);
        } catch (error) {
            console.error('Error loading statistics:', error);
            this.showToast('Lỗi khi tải thống kê: ' + error.message, 'error');
        }
    }

    // Phương thức mới để cập nhật UI với dữ liệu thống kê
    updateStatistics(data) {
        // Cập nhật các giá trị thống kê
        document.getElementById('totalOrders').textContent = this.formatNumber(data.TotalOrders);
        document.getElementById('completedOrders').textContent = this.formatNumber(data.CompletedOrders);
        document.getElementById('processingOrders').textContent = this.formatNumber(data.ProcessingOrders);
        document.getElementById('cancelledOrders').textContent = this.formatNumber(data.CancelledOrders);
        document.getElementById('totalUsers').textContent = this.formatNumber(data.TotalUsers);
        document.getElementById('totalProducts').textContent = this.formatNumber(data.TotalProducts);
    }

    // Hàm định dạng số 
    formatNumber(num) {
        return new Intl.NumberFormat('vi-VN').format(num);
    }

    getStatusClass(status) {
        const statusMap = {
            'Pending': 'warning',
            'Processing': 'warning',
            'Shipped': 'primary',
            'Delivered': 'success',
            'Cancelled': 'danger',
            'pending': 'warning',
            'processing': 'warning',
            'shipped': 'primary',
            'delivered': 'success',
            'cancelled': 'danger'
        };
        return statusMap[status] || 'secondary';
    }

    getStatusLabel(status) {
        const labels = {
            'Pending': 'Chờ xác nhận',
            'Processing': 'Đang xử lý',
            'Shipped': 'Đã giao hàng',
            'Delivered': 'Hoàn thành',
            'Cancelled': 'Đã hủy',
            'pending': 'Chờ xác nhận',
            'processing': 'Đang xử lý',
            'shipped': 'Đã giao hàng',
            'delivered': 'Hoàn thành',
            'cancelled': 'Đã hủy'
        };
        return labels[status] || status;
    }

    showToast(message, type = 'success') {
        // Sử dụng NotificationSystem nếu có sẵn
        if (window.NotificationSystem) {
            if (type === 'error') {
                window.NotificationSystem.error(message);
            } else {
                window.NotificationSystem.success(message);
            }
            return;
        }
        
        // Fallback đến toast Bootstrap
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
        
        // Tìm container hoặc tạo mới nếu không có
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        // Thêm toast vào container
        const toastElement = document.createElement('div');
        toastElement.innerHTML = toast;
        const toastNode = toastElement.firstChild;
        toastContainer.appendChild(toastNode);
        
        // Khởi tạo Toast Bootstrap
        const bsToast = new bootstrap.Toast(toastNode, { delay: 5000 });
        bsToast.show();
        
        // Xóa sau khi ẩn
        toastNode.addEventListener('hidden.bs.toast', () => {
            toastNode.remove();
        });
    }
}

// Khởi tạo khi trang đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Chỉ khởi tạo nếu đang ở trang admin chính
    const isAdminMainPage = window.location.pathname.endsWith('admin.html') || 
                           window.location.pathname.endsWith('admin') || 
                           window.location.pathname.endsWith('admin/');
    
    if (isAdminMainPage) {
        console.log('Khởi tạo Admin Dashboard...');
        new AdminDashboard();
    }
}); 