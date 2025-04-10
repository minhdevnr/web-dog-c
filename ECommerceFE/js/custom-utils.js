/**
 * custom-utils.js - Các chức năng tiện ích dùng chung trong toàn bộ trang web
 */

/**
 * Hiển thị thông báo cho người dùng
 * @param {string} type - Loại thông báo: 'success', 'error', 'warning', 'info'
 * @param {string} message - Nội dung thông báo
 */
function showNotification(type, message) {
    try {
        // Tạo container nếu chưa có
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            document.body.appendChild(container);
        }

        // Tạo thông báo
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Thêm nội dung thông báo
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${getIconForType(type)}"></i>
            </div>
            <div class="notification-content">${message}</div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Thêm sự kiện đóng thông báo
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.classList.remove('show');
                notification.classList.add('hide');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            });
        }
        
        // Thêm vào container
        container.appendChild(notification);
        
        // Hiển thị với animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Tự động biến mất sau 5 giây
        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
    } catch (error) {
        console.error('Lỗi hiển thị thông báo:', error);
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

/**
 * Lấy tên icon cho từng loại thông báo
 * @param {string} type - Loại thông báo
 * @returns {string} Class icon
 */
function getIconForType(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'times-circle';
        case 'warning': return 'exclamation-triangle';
        case 'info': 
        default: return 'info-circle';
    }
}

/**
 * Định dạng tiền tệ Việt Nam
 * @param {number} amount - Số tiền cần định dạng
 * @returns {string} Chuỗi tiền tệ đã định dạng
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        maximumFractionDigits: 0 
    }).format(amount);
}

// Gắn các hàm vào window để sử dụng toàn cục
window.showNotification = showNotification;
window.formatCurrency = formatCurrency; 