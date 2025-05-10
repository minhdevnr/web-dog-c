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

// API Payments - VNPay
class PaymentAPI {
  static async createVnPayPayment(orderId, amount, orderDesc) {
    return API.post(`${API_CONFIG.ENDPOINTS.PAYMENTS}/vnpay/create-payment`, {
      orderId,
      amount,
      orderDesc
    });
  }
  
  static async verifyVnPayPayment(vnpParams) {
    return API.post(`${API_CONFIG.ENDPOINTS.PAYMENTS}/vnpay/payment-return`, vnpParams);
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
  payments: PaymentAPI,
  // Thêm các hàm tiện ích vào API object
  getProducts: async function() {
    
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

/**
 * Class API cung cấp các phương thức gọi API
 */
class Api {
  /**
   * Gửi request API với xử lý token
   * @param {string} url - URL của API endpoint
   * @param {Object} options - Các tùy chọn của fetch API
   * @returns {Promise} - Promise kết quả từ API
   */
  static async fetch(url, options = {}) {
    // Thêm token xác thực nếu có
    const token = localStorage.getItem('token');
    if (token) {
      options.headers = options.headers || {};
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      // Thực hiện request
      let response = await fetch(url, options);

      // Xử lý token hết hạn
      if (response.status === 401) {
        const authHeader = response.headers.get('WWW-Authenticate');
        
        // Kiểm tra xem có phải token hết hạn không
        if (authHeader && authHeader.includes('invalid_token') && authHeader.includes('expired')) {
          console.log('Token hết hạn, thử refresh token...');
          
          // Thử refresh token
          const newToken = await this.refreshToken();
          
          if (newToken) {
            // Cập nhật Authorization header với token mới
            options.headers['Authorization'] = `Bearer ${newToken}`;
            
            // Thử lại request với token mới
            response = await fetch(url, options);
          } else {
            // Nếu không refresh được token, đăng xuất
            if (typeof Auth !== 'undefined') {
              Auth.logout();
            } else {
              // Nếu không có Auth object, xóa token
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              window.location.href = '/../login.html';
            }
            
            throw new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
          }
        }
      }

      return response;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  /**
   * Refresh token
   * @returns {string|null} - Token mới hoặc null nếu refresh thất bại
   */
  static async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('Refresh token thất bại');
      }

      const data = await response.json();
      
      // Lưu token mới
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return data.token;
    } catch (error) {
      console.error('Refresh token error:', error);
      return null;
    }
  }

  /**
   * Lấy dữ liệu từ API (GET)
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise kết quả từ API
   */
  static async get(endpoint, params = {}) {
    // Xây dựng URL với query parameters
    const url = this.buildUrl(endpoint, params);
    
    // Gọi API với xử lý token
    const response = await this.fetch(url);
    
    // Xử lý kết quả
    return this.handleResponse(response);
  }

  /**
   * Gửi dữ liệu lên API (POST)
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Dữ liệu gửi lên
   * @returns {Promise} - Promise kết quả từ API
   */
  static async post(endpoint, data = {}) {
    const url = this.buildUrl(endpoint);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
    
    const response = await this.fetch(url, options);
    return this.handleResponse(response);
  }

  /**
   * Cập nhật dữ liệu lên API (PUT)
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise} - Promise kết quả từ API
   */
  static async put(endpoint, data = {}) {
    const url = this.buildUrl(endpoint);
    
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
    
    const response = await this.fetch(url, options);
    return this.handleResponse(response);
  }

  /**
   * Xóa dữ liệu từ API (DELETE)
   * @param {string} endpoint - API endpoint
   * @returns {Promise} - Promise kết quả từ API
   */
  static async delete(endpoint) {
    const url = this.buildUrl(endpoint);
    
    const options = {
      method: 'DELETE'
    };
    
    const response = await this.fetch(url, options);
    return this.handleResponse(response);
  }

  /**
   * Xây dựng URL với params
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {string} - URL hoàn chỉnh
   */
  static buildUrl(endpoint, params = {}) {
    // Đảm bảo endpoint bắt đầu bằng "/"
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }
    
    // Xây dựng base URL
    let url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    // Thêm query parameters nếu có
    if (Object.keys(params).length > 0) {
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      url += `?${queryString}`;
    }
    
    return url;
  }

  /**
   * Xử lý response từ API
   * @param {Response} response - Response object từ fetch API
   * @returns {Promise} - Promise kết quả đã xử lý
   */
  static async handleResponse(response) {
    // Nếu response không ok, throw error
    if (!response.ok) {
      // Thử đọc thông báo lỗi từ response
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      } catch (jsonError) {
        // Nếu không đọc được JSON, throw error với status
        throw new Error(`API error: ${response.status}`);
      }
    }
    
    // Đọc response JSON
    try {
      return await response.json();
    } catch (error) {
      console.warn('Response không phải JSON:', error);
      return {};
    }
  }
}

// Thêm API vào window object để các file khác có thể sử dụng
window.Api = Api; 