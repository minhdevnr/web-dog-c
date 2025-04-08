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
  defaultAvatar: 'img/default-avatar.png'
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

// Cấu hình đánh giá
const RATING_CONFIG = {
  maxStars: 5,
  halfStar: true
};

const API_CONFIG = {
    BASE_URL: 'https://localhost:7175',
    ENDPOINTS: {
        LOGIN: '/api/user/login',
        REGISTER: '/api/user/register',
        PRODUCTS: '/api/product',
        USERS: '/api/user',
        ORDERS: '/api/order',
        CART: '/api/cart',
        NEWS: '/api/news',
        REVIEWS: '/api/review'
    }
}; 