/**
 * auth.js - Xử lý xác thực người dùng và quản lý hồ sơ người dùng
 */

// Sử dụng API_CONFIG từ window (đã được định nghĩa trong config.js)
// Không định nghĩa lại để tránh trùng lặp

// Cấu hình API
const API_URL = 'https://localhost:7175/api';

// Hàm hiển thị thông báo (sẽ sử dụng nếu có sẵn, nếu không thì tạo mới)
function showNotification(type, message) {
  if (typeof window.showNotification === 'function') {
    window.showNotification(type, message);
  } else {
    alert(`${type.toUpperCase()}: ${message}`);
  }
}

// Class xác thực
class Auth {
  /**
   * Khởi tạo xác thực người dùng
   */
  static init() {
    // Thiết lập các sự kiện
    this.setupAuthEvents();
    // Cập nhật UI dựa theo trạng thái đăng nhập
    this.updateUI();
    // Tải thông tin người dùng nếu đang ở trang profile
    this.loadUserProfileIfNeeded();
  }

  /**
   * Thiết lập các sự kiện liên quan đến xác thực
   */
  static setupAuthEvents() {
    // Xử lý form đăng nhập
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.login();
      });
    }

    // Xử lý form đăng ký
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.register();
      });
    }

    // Xử lý nút đăng xuất
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }

    // Xử lý form quên mật khẩu
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
      forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.forgotPassword();
      });
    }

    // Xử lý form hồ sơ người dùng
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.updateUserProfile();
      });
    }
    
    // Xử lý form đổi mật khẩu
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.changePassword();
      });
    }
    
    // Xử lý chuyển đổi tab trong trang profile
    const profileLinks = document.querySelectorAll('.profile-menu a');
    profileLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const target = link.getAttribute('href');
        
        // Chỉ xử lý các tab nội bộ (bắt đầu bằng #)
        if (target.startsWith('#')) {
          e.preventDefault();
          
          // Ẩn tất cả các section
          document.querySelectorAll('.profile-section').forEach(section => {
            section.classList.remove('active');
          });
          
          // Hiển thị section được chọn
          document.querySelector(target).classList.add('active');
          
          // Cập nhật trạng thái active cho menu
          document.querySelectorAll('.profile-menu li').forEach(item => {
            item.classList.remove('active');
          });
          
          link.parentElement.classList.add('active');
        }
      });
    });
  }

  /**
   * Đăng nhập người dùng
   */
  static async login() {
    
    const email = document.getElementById('login-email').value || document.getElementById('login-email-phone').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      this.showError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },  
        body: JSON.stringify({ EmailOrPhone: email, Password: password }),
        mode: 'cors',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.Message || 'Đăng nhập thất bại');
      }
      
      // Lưu token và thông tin người dùng vào localStorage
      localStorage.setItem('token', data.Token);
      
      // Lưu RefreshToken nếu có
      if (data.RefreshToken) {
        localStorage.setItem('refreshToken', data.RefreshToken);
      }
      
      localStorage.setItem('user', JSON.stringify({
        id: data.Id,
        username: data.Username,
        email: data.Email,
        role: data.Role
      }));
      
      // Hiển thị thông báo thành công
      this.showSuccess('Đăng nhập thành công!');
      
      // Cập nhật UI
      this.updateUI();
      
      // Kiểm tra vai trò và chuyển hướng tương ứng
      setTimeout(() => {
        // Lấy URL hiện tại để kiểm tra xem đang ở trang admin hay không
        const currentPath = window.location.pathname;
        const isAdminLogin = currentPath.includes('/admin/');
        
        // Chuyển hướng dựa trên vai trò và trang hiện tại
        if (data.Role && data.Role.toLowerCase() === 'admin') {
          // Nếu là admin, chuyển đến trang admin
          window.location.href = '/ECommerceFE/admin/admin.html';
        } else {
          // Nếu đang cố gắng đăng nhập vào trang admin mà không phải admin
          if (isAdminLogin) {
            // Chuyển đến trang chủ người dùng
            window.location.href = '/ECommerceFE/index.html';
          } else {
            // Nếu đăng nhập từ trang thông thường, đi đến trang chủ
            window.location.href = '/ECommerceFE/index.html';
          }
        }
      }, 1000);
    } catch (error) {
      this.showError('Đăng nhập thất bại: ' + (error.message || 'Lỗi không xác định'));
    }
  }

  /**
   * Đăng ký người dùng mới
   */
  static async register() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const phoneNumber = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const address = document.getElementById('address').value;
    const dateOfBirth = document.getElementById('birthdate').value;

    // Kiểm tra dữ liệu
    if (!username || !email || !phoneNumber || !password || !address || !dateOfBirth) {
      this.showError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      this.showError('Mật khẩu xác nhận không khớp');
      return;
    }

    // Kiểm tra độ mạnh của mật khẩu
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      this.showError(passwordValidation.message);
      return;
    }

    try {
      const userData = {
        Username: username,
        Email: email,
        PhoneNumber: phoneNumber,
        Password: password,
        Address: address,
        DateOfBirth: dateOfBirth
      };
      
      console.log('Đang gửi yêu cầu đăng ký đến:', `${API_URL}/Auth/register`);
      console.log('Dữ liệu gửi đi:', userData);
      
      const response = await fetch(`${API_URL}/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        mode: 'cors',
        credentials: 'include'
      });
      
      console.log('Phản hồi từ server:', response);
      
      // Đọc dữ liệu JSON từ response
      let data;
      try {
        data = await response.json();
        console.log('Dữ liệu phản hồi:', data);
      } catch (jsonError) {
        console.error('Lỗi parse JSON:', jsonError);
        throw new Error('Lỗi kết nối đến server');
      }
      
      if (!response.ok) {
        throw new Error(data.Message || 'Đăng ký thất bại');
      }

      this.showSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
      
      // Chuyển hướng đến trang đăng nhập
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } catch (error) {
      this.showError('Đăng ký thất bại: ' + (error.message || 'Lỗi không xác định'));
    }
  }

  /**
   * Đăng xuất người dùng
   */
  static logout() {
    // Xóa token trong localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Hiển thị thông báo đăng xuất thành công
    this.showSuccess('Đã đăng xuất');
    
    // Cập nhật UI
    this.updateUI();
    
    // Chuyển hướng về trang đăng nhập
    setTimeout(() => {
      window.location.href = '/ECommerceFE/login.html';
    }, 1000);
  }

  /**
   * Xử lý quên mật khẩu
   */
  static async forgotPassword() {
    const email = document.getElementById('forgot-password-email').value;
    
    if (!email) {
      this.showError('Vui lòng nhập email');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/user/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Yêu cầu đặt lại mật khẩu thất bại');
      }
      
      this.showSuccess('Hướng dẫn đặt lại mật khẩu đã được gửi vào email của bạn!');
    } catch (error) {
      this.showError('Không thể xử lý yêu cầu: ' + (error.message || 'Lỗi không xác định'));
    }
  }

  /**
   * Đặt lại mật khẩu
   */
  static async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${API_URL}/user/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Đặt lại mật khẩu thất bại');
      }
      
      return data;
    } catch (error) {
      console.error('Lỗi đặt lại mật khẩu:', error);
      throw error;
    }
  }

  /**
   * Tải thông tin hồ sơ người dùng nếu đang ở trang profile
   */
  static loadUserProfileIfNeeded() {
    // Kiểm tra xem có đang ở trang profile hay không
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      this.loadUserProfile();
    }
  }

  /**
   * Tải thông tin người dùng
   */
  static loadUserProfile() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    
    if (!token || !user) {
      window.location.href = 'login.html';
      return;
    }
    
    // Hiển thị thông tin người dùng
    const usernameEl = document.getElementById('profile-username');
    if (usernameEl) {
      usernameEl.textContent = user.username || 'Người dùng';
    }
    
    const fullNameEl = document.getElementById('fullName');
    if (fullNameEl) {
      fullNameEl.value = user.fullName || user.username || '';
    }
    
    const emailEl = document.getElementById('email');
    if (emailEl) {
      emailEl.value = user.email || '';
    }
    
    const phoneEl = document.getElementById('phoneNumber');
    if (phoneEl) {
      phoneEl.value = user.phoneNumber || '';
    }
    
    const addressEl = document.getElementById('address');
    if (addressEl) {
      addressEl.value = user.address || '';
    }
    
    // Xử lý ngày sinh (nếu có)
    const dobEl = document.getElementById('dateOfBirth');
    if (dobEl && user.dateOfBirth) {
      try {
        const date = new Date(user.dateOfBirth);
        if (!isNaN(date.getTime())) {
          dobEl.value = date.toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('Lỗi khi xử lý ngày sinh:', error);
      }
    }
    
    // Hiển thị menu Admin nếu là admin
    if (user.role === 'admin') {
      const adminMenuItem = document.getElementById('admin-menu-item');
      if (adminMenuItem) {
        adminMenuItem.style.display = 'block';
      }
    }
    
    // Hiển thị ảnh đại diện nếu có
    if (user.avatar) {
      const userAvatar = document.getElementById('user-avatar');
      if (userAvatar) {
        userAvatar.src = user.avatar;
      }
    }
    
    // Tải thông tin chi tiết hơn từ API (nếu cần)
    this.getUserProfile()
      .then(profileData => {
        // Cập nhật thông tin chi tiết
        // Giữ lại dữ liệu đã hiển thị nếu API không trả về
      })
      .catch(error => {
        console.error('Không thể tải thông tin chi tiết từ API:', error);
      });
  }

  /**
   * Lấy thông tin hồ sơ người dùng từ API
   */
  static async getUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }
    
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể lấy thông tin hồ sơ');
      }
      
      return data;
    } catch (error) {
      console.error('Lỗi lấy thông tin hồ sơ:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin người dùng
   */
  static async updateUserProfile() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    
    if (!token || !user) {
      this.showError('Bạn chưa đăng nhập');
      return;
    }
    
    // Thu thập thông tin từ form
    const updatedUser = {
      fullName: document.getElementById('fullName').value,
      phoneNumber: document.getElementById('phoneNumber').value,
      address: document.getElementById('address').value,
      dateOfBirth: document.getElementById('dateOfBirth').value
    };
    
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedUser)
      });
      
      // Đọc dữ liệu JSON từ response
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Lỗi parse JSON:', jsonError);
        // Tiếp tục nếu không đọc được JSON, giả định cập nhật thành công
      }
      
      if (response.ok) {
        // Cập nhật thông tin người dùng trong localStorage
        const updatedUserData = { ...user, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        
        this.showSuccess('Cập nhật thông tin thành công');
      } else {
        throw new Error((data && data.message) || 'Không thể cập nhật thông tin hồ sơ');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      this.showError('Có lỗi xảy ra khi cập nhật thông tin');
    }
  }

  /**
   * Đổi mật khẩu
   */
  static async changePassword() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.showError('Bạn chưa đăng nhập');
      return;
    }
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Kiểm tra mật khẩu mới
    if (!currentPassword || !newPassword || !confirmPassword) {
      this.showError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      this.showError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    if (newPassword.length < 6) {
      this.showError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      // Đọc dữ liệu JSON từ response nếu có
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Lỗi parse JSON:', jsonError);
      }
      
      if (response.ok) {
        this.showSuccess('Đổi mật khẩu thành công');
        
        // Xóa form
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
      } else {
        throw new Error((data && data.message) || 'Mật khẩu hiện tại không đúng');
      }
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      this.showError('Có lỗi xảy ra khi đổi mật khẩu: ' + (error.message || 'Lỗi không xác định'));
    }
  }

  /**
   * Kiểm tra trạng thái đăng nhập
   * @returns {boolean} Trạng thái đăng nhập
   */
  static isLoggedIn() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Kiểm tra token có hợp lệ không
    if (this.isTokenExpired(token)) {
      // Nếu token hết hạn, thử refresh token
      this.refreshToken()
        .catch(() => {
          // Nếu refresh token thất bại, đăng xuất
          this.logout();
        });
      return false;
    }
    
    return true;
  }

  /**
   * Kiểm tra token đã hết hạn chưa
   * @param {string} token - JWT token
   * @returns {boolean} true nếu token đã hết hạn
   */
  static isTokenExpired(token) {
    try {
      // Decode JWT token
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      const expirationTime = payload.exp * 1000; // Chuyển từ giây sang mili giây
      
      // Trả về true nếu thời gian hiệu lực của token đã qua
      return Date.now() >= expirationTime;
    } catch (error) {
      console.error('Lỗi khi kiểm tra token:', error);
      return true; // Nếu có lỗi, coi như token hết hạn
    }
  }

  /**
   * Gửi yêu cầu refresh token
   * @returns {Promise} Promise kết quả refresh token
   */
  static async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Không có refresh token');
      }
      
      const response = await fetch(`${API_URL}/auth/refresh-token`, {
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
      localStorage.setItem('refreshToken', data.refreshToken);
      
      return data;
    } catch (error) {
      console.error('Lỗi refresh token:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin người dùng hiện tại
   * @returns {Object|null} Thông tin người dùng hoặc null nếu chưa đăng nhập
   */
  static getCurrentUser() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Cập nhật UI dựa theo trạng thái đăng nhập
   */
  static updateUI() {
    const isLoggedIn = this.isLoggedIn();
    const user = this.getCurrentUser();

    // Các phần tử cần hiển thị khi đã đăng nhập
    const authElements = document.querySelectorAll('.auth-required');
    
    // Các phần tử cần hiển thị khi chưa đăng nhập
    const guestElements = document.querySelectorAll('.guest-only');
    
    // Cập nhật tên người dùng
    const userNameElements = document.querySelectorAll('.user-name');

    // Hiển thị/ẩn các phần tử dựa vào trạng thái đăng nhập
    if (isLoggedIn) {
      authElements.forEach(el => el.style.display = 'block');
      guestElements.forEach(el => el.style.display = 'none');
      
      // Cập nhật tên người dùng nếu có
      if (user && user.name) {
        userNameElements.forEach(el => {
          el.textContent = user.name;
        });
      }
    } else {
      authElements.forEach(el => el.style.display = 'none');
      guestElements.forEach(el => el.style.display = 'block');
    }
  }

  /**
   * Hiển thị thông báo lỗi
   * @param {string} message - Thông báo lỗi
   */
  static showError(message) {
    // Sử dụng hàm createNotification từ ui.js nếu có
    if (window.UI && window.UI.createNotification) {
      window.UI.createNotification(message, 'error');
    } else if (window.NotificationSystem) {
      window.NotificationSystem.error(message);
    } else {
      alert(message);
    }
  }

  /**
   * Hiển thị thông báo thành công
   * @param {string} message - Thông báo thành công
   */
  static showSuccess(message) {
    // Sử dụng hàm createNotification từ ui.js nếu có
    if (window.UI && window.UI.createNotification) {
      window.UI.createNotification(message, 'success');
    } else if (window.NotificationSystem) {
      window.NotificationSystem.success(message);
    } else {
      alert(message);
    }
  }
}

// Hàm validate mật khẩu
function validatePassword(password) {
  if (!password) {
    return { valid: false, message: 'Mật khẩu không được để trống' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' };
  }
  
  // Kiểm tra có ít nhất 1 chữ hoa
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 1 chữ hoa' };
  }
  
  // Kiểm tra có ít nhất 1 chữ thường
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 1 chữ thường' };
  }
  
  // Kiểm tra có ít nhất 1 số
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 1 số' };
  }
  
  // Kiểm tra có ít nhất 1 ký tự đặc biệt
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)' };
  }
  
  return { valid: true, message: 'Mật khẩu hợp lệ' };
}

// Thêm các hàm vào window object để các file khác có thể sử dụng
window.Auth = Auth;
window.validatePassword = validatePassword;

// Khởi tạo Auth khi DOM đã sẵn sàng (nếu chưa sẵn sàng)
document.addEventListener('DOMContentLoaded', function() {
  Auth.init();
});

// Khởi tạo Auth ngay lập tức nếu DOM đã được tải
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  Auth.init();
}

// Hàm để quên mật khẩu
window.forgotPassword = async function(email) {
  try {
    // Sử dụng API_CONFIG từ window object
    const apiConfig = window.API_CONFIG || { 
      BASE_URL: 'https://localhost:7175',
      ENDPOINTS: { FORGOT_PASSWORD: '/api/auth/forgot-password' }
    };
    
    const response = await fetch(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.FORGOT_PASSWORD}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      throw new Error('Yêu cầu đặt lại mật khẩu thất bại');
    }
    
    return { success: true, message: 'Email đặt lại mật khẩu đã được gửi' };
  } catch (error) {
    showNotification('error', error.message);
    return { success: false, message: error.message };
  }
};

// Hàm để reset mật khẩu
window.resetPassword = async function(token, newPassword) {
  try {
    // Kiểm tra độ mạnh mật khẩu
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
    
    // Sử dụng API_CONFIG từ window object
    const apiConfig = window.API_CONFIG || { 
      BASE_URL: 'https://localhost:7175',
      ENDPOINTS: { RESET_PASSWORD: '/api/auth/reset-password' }
    };
    
    const response = await fetch(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.RESET_PASSWORD}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, newPassword })
    });
    
    if (!response.ok) {
      throw new Error('Đặt lại mật khẩu thất bại');
    }
    
    return { success: true, message: 'Mật khẩu đã được đặt lại thành công' };
  } catch (error) {
    showNotification('error', error.message);
    return { success: false, message: error.message };
  }
}; 