// Hàm xử lý XSS
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Hàm hiển thị thông báo
export function showNotification(type, message) {
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.innerHTML = sanitizeInput(message);
  
  document.querySelector('.notification-container').appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
} 