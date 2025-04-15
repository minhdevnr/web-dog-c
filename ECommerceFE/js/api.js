/**
 * api.js - Quản lý các cuộc gọi API
 */

// Thay thế import bằng truy cập biến toàn cục
// import { API_CONFIG } from './config.js';
// import { showNotification } from './utils.js';

// API_CONFIG đã được đặt là biến toàn cục trong config.js

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Hàm thông báo đơn giản nếu utils.js không có sẵn
function showNotification(type, message) {
  console.log(`${type}: ${message}`);
  // Nếu có toast UI, sử dụng nó
  if (typeof showToast === 'function') {
    showToast(message, type === 'success' ? 'success' : 'error');
  }
}

async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    
    showNotification('error', 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    throw error;
  }
}

// // Cấu hình API
// const API_CONFIG = {
//   BASE_URL: 'http://localhost:5000/api',
//   ENDPOINTS: {
//     PRODUCTS: '/products',
//     CATEGORIES: '/categories',
//     USERS: '/users',
//     AUTH: '/auth',
//     ORDERS: '/orders',
//     REVIEWS: '/reviews'
//   },
//   HEADERS: {
//     'Content-Type': 'application/json'
//   }
// };

// Class API chính
class API {
  /**
   * Thêm token xác thực vào headers nếu có
   * @returns {Object} Headers với token nếu có
   */
  static getAuthHeaders() {
    const headers = { ...API_CONFIG.HEADERS };
    const token = localStorage.getItem('token');
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }
  
  /**
   * Thực hiện cuộc gọi GET
   * @param {string} endpoint - Endpoint API
   * @param {Object} params - Query parameters
   * @returns {Promise} Promise kết quả
   */
  static async get(endpoint, params = {}) {
    const url = new URL(API_CONFIG.BASE_URL + endpoint);
    
    // Thêm query params
    if (params) {
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
    }
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  }
  
  /**
   * Thực hiện cuộc gọi POST
   * @param {string} endpoint - Endpoint API
   * @param {Object} data - Dữ liệu gửi đi
   * @returns {Promise} Promise kết quả
   */
  static async post(endpoint, data = {}) {
    try {
      const response = await fetch(API_CONFIG.BASE_URL + endpoint, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  }
  
  /**
   * Thực hiện cuộc gọi PUT
   * @param {string} endpoint - Endpoint API
   * @param {Object} data - Dữ liệu gửi đi
   * @returns {Promise} Promise kết quả
   */
  static async put(endpoint, data = {}) {
    try {
      const response = await fetch(API_CONFIG.BASE_URL + endpoint, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API PUT error:', error);
      throw error;
    }
  }
  
  /**
   * Thực hiện cuộc gọi DELETE
   * @param {string} endpoint - Endpoint API
   * @returns {Promise} Promise kết quả
   */
  static async delete(endpoint) {
    try {
      const response = await fetch(API_CONFIG.BASE_URL + endpoint, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // DELETE có thể trả về no content
      if (response.status === 204) {
        return true;
      }
      
      return await response.json();
    } catch (error) {
      console.error('API DELETE error:', error);
      throw error;
    }
  }
}

// API Products
class ProductAPI {
  static async getAll(params = {}) {
    return API.get(API_CONFIG.ENDPOINTS.PRODUCTS, params);
  }
  
  static async getById(id) {
    return API.get(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
  }
  
  static async getByCategory(categoryId) {
    return API.get(API_CONFIG.ENDPOINTS.PRODUCTS, { categoryId });
  }
  
  static async search(keyword) {
    return API.get(API_CONFIG.ENDPOINTS.PRODUCTS, { keyword });
  }
}

// API Categories
class CategoryAPI {
  static async getAll() {
    return API.get(API_CONFIG.ENDPOINTS.CATEGORIES);
  }
  
  static async getById(id) {
    return API.get(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`);
  }
}

// API Authentication
class AuthAPI {
  static async login(credentials) {
    return API.post(`${API_CONFIG.ENDPOINTS.AUTH}/login`, credentials);
  }
  
  static async register(userData) {
    return API.post(`${API_CONFIG.ENDPOINTS.AUTH}/register`, userData);
  }
  
  static async forgotPassword(email) {
    return API.post(`${API_CONFIG.ENDPOINTS.AUTH}/forgot-password`, { email });
  }
  
  static async resetPassword(data) {
    return API.post(`${API_CONFIG.ENDPOINTS.AUTH}/reset-password`, data);
  }
}

// API Users
class UserAPI {
  static async getProfile() {
    return API.get(`${API_CONFIG.ENDPOINTS.USERS}/profile`);
  }
  
  static async updateProfile(data) {
    return API.put(`${API_CONFIG.ENDPOINTS.USERS}/profile`, data);
  }
  
  static async changePassword(data) {
    return API.post(`${API_CONFIG.ENDPOINTS.USERS}/change-password`, data);
  }
}

// API Orders
class OrderAPI {
  static async getMyOrders() {
    return API.get(`${API_CONFIG.ENDPOINTS.ORDERS}/my-orders`);
  }
  
  static async getById(id) {
    return API.get(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}`);
  }
  
  static async create(orderData) {
    return API.post(API_CONFIG.ENDPOINTS.ORDERS, orderData);
  }
  
  static async updateStatus(id, status) {
    return API.put(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}/status`, { status });
  }
}

// Export các API
window.API = {
  core: API,
  products: ProductAPI,
  categories: CategoryAPI,
  auth: AuthAPI,
  users: UserAPI,
  orders: OrderAPI,
  // Thêm các hàm tiện ích vào API object
  getProducts: async function() {
    debugger;
    try {
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  getProduct: async function(id) {
    try {
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  addToCart: async function(productId, quantity = 1) {
    try {
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error adding to cart:', error);
      return null;
    }
  },

  getCart: async function() {
    try {
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching cart:', error);
      return [];
    }
  },

  updateCartItem: async function(productId, quantity) {
    try {
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART}/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error updating cart:', error);
      return null;
    }
  },

  removeFromCart: async function(productId) {
    try {
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART}/${productId}`, {
        method: 'DELETE'
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error removing from cart:', error);
      return null;
    }
  }
};

// Xóa các export function riêng lẻ đã được chuyển vào API object ở trên 