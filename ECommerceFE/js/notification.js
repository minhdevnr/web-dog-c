/**
 * Hệ thống thông báo chuẩn
 */
const NotificationSystem = {
  container: null,
  icons: {
    success: '<i class="fa fa-check-circle"></i>',
    error: '<i class="fa fa-times-circle"></i>',
    warning: '<i class="fa fa-exclamation-circle"></i>',
    info: '<i class="fa fa-info-circle"></i>'
  },

  // Khởi tạo container chứa thông báo
  init: function() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'notification-container';
      this.container.style.zIndex = '9999';
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