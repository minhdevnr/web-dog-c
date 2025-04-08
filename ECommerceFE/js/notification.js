/**
 * Hệ thống thông báo chuẩn
 */
const NotificationSystem = {
  container: null,
  icons: {
    success: '<i class="fas fa-check-circle"></i>',
    error: '<i class="fas fa-times-circle"></i>',
    warning: '<i class="fas fa-exclamation-circle"></i>',
    info: '<i class="fas fa-info-circle"></i>'
  },

  // Khởi tạo container chứa thông báo
  init: function() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'notification-container';
      this.container.style.cssText = `
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        z-index: 999999 !important;
      `;
      document.body.appendChild(this.container);
    }
  },

  // Tạo và hiển thị thông báo
  show: function(options) {
    this.init();
    
    const defaults = {
      type: 'info', // success, error, warning, info
      title: '',
      message: '',
      duration: 5000 // thời gian hiển thị (ms)
    };
    
    const settings = { ...defaults, ...options };
    
    // Tạo phần tử thông báo
    const notification = document.createElement('div');
    notification.className = `notification notification-${settings.type}`;
    notification.style.cssText = 'display: flex !important; opacity: 1 !important;';
    
    // Nội dung thông báo
    notification.innerHTML = `
      <div class="notification-icon">${this.icons[settings.type]}</div>
      <div class="notification-content">
        ${settings.title ? `<div class="notification-title">${settings.title}</div>` : ''}
        <div class="notification-message">${settings.message}</div>
      </div>
      <div class="notification-close">&times;</div>
    `;
    
    // Thêm vào container
    this.container.appendChild(notification);
    
    // Xử lý sự kiện đóng thông báo
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.hide(notification);
    });
    
    // Tự động đóng sau khoảng thời gian duration
    if (settings.duration > 0) {
      setTimeout(() => {
        if (notification.parentNode) {
          this.hide(notification);
        }
      }, settings.duration);
    }
    
    return notification;
  },
  
  // Ẩn thông báo
  hide: function(notification) {
    notification.classList.add('hide');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 400); // 400ms tương ứng với thời gian của animation fade-out
  },
  
  // Các hàm helper để hiển thị từng loại thông báo
  success: function(message, title = 'Thành công!', duration = 5000) {
    return this.show({
      type: 'success',
      title: title,
      message: message,
      duration: duration
    });
  },
  
  error: function(message, title = 'Lỗi!', duration = 5000) {
    return this.show({
      type: 'error',
      title: title,
      message: message,
      duration: duration
    });
  },
  
  warning: function(message, title = 'Cảnh báo!', duration = 5000) {
    return this.show({
      type: 'warning',
      title: title,
      message: message,
      duration: duration
    });
  },
  
  info: function(message, title = 'Thông báo', duration = 5000) {
    return this.show({
      type: 'info',
      title: title,
      message: message,
      duration: duration
    });
  },

  _showNotification: function(message, type) {
    // Translate the message if it's a translation key
    if (typeof __ === 'function' && translations[currentLanguage][message]) {
      message = __(message);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-icon">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      </div>
      <div class="notification-content">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
};

// Tạo container cho thông báo nếu chưa tồn tại
function createNotificationContainer() {
  let container = document.querySelector('.notification-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
  }
  return container;
}

// Hiển thị thông báo
function showNotification(message, type = 'info', duration = 3000) {
  // Tạo container thông báo nếu chưa tồn tại
  let notificationContainer = document.querySelector('.notification-container');
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
  }
  
  // Tạo phần tử thông báo
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  // Tạo nội dung thông báo
  const content = document.createElement('p');
  content.textContent = message;
  
  // Tạo nút đóng
  const closeBtn = document.createElement('button');
  closeBtn.className = 'notification-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => {
    notification.classList.add('fadeOut');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
  
  // Thêm vào thông báo
  notification.appendChild(content);
  notification.appendChild(closeBtn);
  
  // Thêm vào container
  notificationContainer.appendChild(notification);
  
  // Hiệu ứng hiển thị
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Tự động đóng sau thời gian chỉ định
  setTimeout(() => {
    notification.classList.add('fadeOut');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, duration);
  
  return notification;
}

// Hiển thị thông báo thành công
function showSuccess(message, duration = 3000) {
  return showNotification(message, 'success', duration);
}

// Hiển thị thông báo lỗi
function showError(message, duration = 4000) {
  return showNotification(message, 'error', duration);
}

// Hiển thị cảnh báo
function showWarning(message, duration = 3500) {
  return showNotification(message, 'warning', duration);
}

// Hiển thị thông tin
function showInfo(message, duration = 3000) {
  return showNotification(message, 'info', duration);
}

// Định dạng tiền tệ
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Định dạng ngày tháng
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

// Kiểm tra định dạng email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Kiểm tra định dạng số điện thoại
function isValidPhone(phone) {
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
  return phoneRegex.test(phone);
}

// Mã hóa chuỗi thành MD5 (giả lập)
function md5(string) {
  // Trong ứng dụng thực tế, sẽ sử dụng thư viện md5 thực sự
  // Đây chỉ là mô phỏng đơn giản
  return Array.from(string)
    .reduce((hash, char) => 
      (((hash << 5) - hash) + char.charCodeAt(0)) | 0, 0)
    .toString(16);
}

// Tạo ID ngẫu nhiên
function generateId(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Rút gọn text
function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Khởi tạo styles cho notifications
function initNotificationStyles() {
  if (document.getElementById('notification-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      width: 300px;
      max-width: 90%;
    }
    
    .notification {
      background-color: white;
      color: #333;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      transform: translateX(120%);
      transition: transform 0.3s ease, opacity 0.3s ease;
      opacity: 0;
    }
    
    .notification.show {
      transform: translateX(0);
      opacity: 1;
    }
    
    .notification.fadeOut {
      opacity: 0;
      transform: translateX(120%);
    }
    
    .notification p {
      margin: 0;
      flex-grow: 1;
    }
    
    .notification-close {
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      font-size: 20px;
      padding: 0 0 0 10px;
    }
    
    .notification-success {
      border-left: 4px solid #28a745;
    }
    
    .notification-error {
      border-left: 4px solid #dc3545;
    }
    
    .notification-warning {
      border-left: 4px solid #ffc107;
    }
    
    .notification-info {
      border-left: 4px solid #17a2b8;
    }
  `;
  
  document.head.appendChild(style);
}

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', function() {
  initNotificationStyles();
}); 