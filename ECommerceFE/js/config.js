/**
 * Cấu hình chung cho ứng dụng
 */

// Base path for assets
const BASE_PATH = '';

// API base URL - cập nhật port khớp với launchSettings
const API_BASE_URL = 'https://localhost:7175/api';

// Cấu hình tiền tệ
const CURRENCY_CONFIG = {
  locale: 'vi-VN',
  currency: 'VND',
  format: {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }
};

// Định dạng tiền tệ
function formatCurrency(amount) {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, CURRENCY_CONFIG.format).format(amount);
}

// Cấu hình phân trang
const PAGINATION_CONFIG = {
  itemsPerPage: 8,
  maxPagesShown: 5
};

// Cấu hình ảnh
const IMAGE_CONFIG = {
  placeholder: 'img/placeholder.jpg',
  defaultAvatar: 'img/default-avatar.png',
  quality: 0.8,
  maxWidth: 800,
  maxHeight: 600,
  formats: ['webp', 'jpg'],
  lazyLoading: true
};

// Trạng thái đơn hàng
const ORDER_STATUS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy'
};

// Các chủ đề màu
const THEMES = {
  light: {
    '--main-color': '#be9c79',
    '--black': '#13131a',
    '--bg': '#fff',
    '--border': '0.1rem solid rgba(255, 255, 255, 0.3)'
  },
  dark: {
    '--main-color': '#d3ad7f',
    '--black': '#13131a',
    '--bg': '#010103',
    '--border': '0.1rem solid rgba(255, 255, 255, 0.3)'
  }
};

// Hàm chuyển đổi theme
function switchTheme(theme) {
  const root = document.documentElement;
  const themeVars = THEMES[theme];
  
  for (const [key, value] of Object.entries(themeVars)) {
    root.style.setProperty(key, value);
  }
  
  localStorage.setItem('theme', theme);
}

// Kiểm tra và áp dụng theme đã lưu
const savedTheme = localStorage.getItem('theme') || 'light';
switchTheme(savedTheme);

// Cấu hình đánh giá
const RATING_CONFIG = {
  maxStars: 5,
  halfStar: true
};

/**
 * CẤU HÌNH API THỐNG NHẤT CHO TOÀN BỘ ỨNG DỤNG
 * Đây là định nghĩa duy nhất cho API_CONFIG, đảm bảo tính nhất quán
 */
const API_CONFIG = {
    BASE_URL: 'https://localhost:7175',
    ENDPOINTS: {
        LOGIN: '/api/user/login',
        REGISTER: '/api/user/register',
        USERS: '/api/user',
        ORDERS: '/api/order',
        CART: '/api/cart',
        NEWS: '/api/news',
        REVIEWS: '/api/review',
        PRODUCTS: '/api/product',
        FORGOT_PASSWORD: '/api/auth/forgot-password',
        RESET_PASSWORD: '/api/auth/reset-password',
        PROFILE: '/api/user/profile',
        CATEGORIES: '/api/category',
        PING: '/api/ping'
    },
    TIMEOUT: 30000, // 30 giây timeout cho các request
    RETRY_ATTEMPTS: 3 // Số lần thử lại nếu request thất bại
};

// Đặt vào window object để các file khác có thể sử dụng không cần import
window.API_CONFIG = API_CONFIG;
window.formatCurrency = formatCurrency;
window.PAGINATION_CONFIG = PAGINATION_CONFIG;
window.IMAGE_CONFIG = IMAGE_CONFIG;
window.ORDER_STATUS = ORDER_STATUS;
window.THEMES = THEMES;
window.switchTheme = switchTheme;
window.RATING_CONFIG = RATING_CONFIG; 