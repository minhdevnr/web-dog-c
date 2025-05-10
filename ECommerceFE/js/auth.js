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

// Thêm hàm hiển thị lỗi trực tiếp dưới các input
function showFieldError(field, message) {
  // Xóa thông báo lỗi cũ nếu có
  removeFieldError(field);
  
  // Tạo phần tử thông báo lỗi
  const errorElement = document.createElement('div');
  errorElement.className = 'field-error';
  errorElement.textContent = message;
  
  // Thêm lớp error vào input và form-group
  field.classList.add('error');
  const formGroup = field.closest('.form-group');
  if (formGroup) {
    formGroup.classList.add('has-error');
    formGroup.classList.remove('has-success');
  }
  
  // Chèn thông báo lỗi sau trường input
  field.parentNode.appendChild(errorElement);
}

// Hàm xóa thông báo lỗi
function removeFieldError(field) {
  // Xóa lớp error từ input
  field.classList.remove('error');
  
  // Tìm và xóa thông báo lỗi
  const formGroup = field.closest('.form-group');
  if (formGroup) {
    formGroup.classList.remove('has-error');
    const errorElement = formGroup.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }
}

// Hàm đánh dấu trường hợp lệ
function markFieldAsValid(field) {
  field.classList.add('valid');
  field.classList.remove('error');
  
  const formGroup = field.closest('.form-group');
  if (formGroup) {
    formGroup.classList.add('has-success');
    formGroup.classList.remove('has-error');
    
    // Xóa thông báo lỗi nếu có
    const errorElement = formGroup.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
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
    // Thiết lập validate realtime
    this.setupValidation();
  }

  /**
   * Thiết lập validation realtime cho các form
   */
  static setupValidation() {
    // Validate form đăng ký
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      // Validate username
      const usernameInput = document.getElementById('username');
      if (usernameInput) {
        usernameInput.addEventListener('blur', () => {
          this.validateUsername(usernameInput);
        });
      }
      
      // Validate email
      const emailInput = document.getElementById('email');
      if (emailInput) {
        emailInput.addEventListener('blur', () => {
          this.validateEmail(emailInput);
        });
        
        // Validate khi đang nhập (sau khi gõ)
        emailInput.addEventListener('input', () => {
          // Chỉ validate nếu đã có ít nhất 5 ký tự
          if (emailInput.value.length > 5) {
            this.validateEmail(emailInput);
          }
        });
      }
      
      // Validate phone number
      const phoneInput = document.getElementById('phone');
      if (phoneInput) {
        phoneInput.addEventListener('input', () => {
          // Chỉ cho phép nhập số
          phoneInput.value = phoneInput.value.replace(/[^\d]/g, '');
          
          // Validate khi đang nhập nếu đã có 10 số
          if (phoneInput.value.length === 10) {
            this.validatePhoneNumber(phoneInput);
          }
        });
        
        phoneInput.addEventListener('blur', () => {
          this.validatePhoneNumber(phoneInput);
        });
      }
      
      // Validate password
      const passwordInput = document.getElementById('password');
      if (passwordInput) {
        passwordInput.addEventListener('blur', () => {
          this.validatePassword(passwordInput);
        });
        
        // Validate khi đang nhập (sau mỗi 2 giây)
        let typingTimer;
        passwordInput.addEventListener('input', () => {
          // Xóa timeout cũ
          clearTimeout(typingTimer);
          
          // Đặt timeout mới
          typingTimer = setTimeout(() => {
            if (passwordInput.value.length > 3) {
              this.validatePassword(passwordInput);
            }
          }, 800);
        });
      }
      
      // Validate confirm password
      const confirmPasswordInput = document.getElementById('confirm-password');
      if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('blur', () => {
          this.validateConfirmPassword(confirmPasswordInput, passwordInput);
        });
        
        // Validate khi đang nhập
        confirmPasswordInput.addEventListener('input', () => {
          // Chỉ validate nếu confirm password có ít nhất cùng độ dài với password
          if (confirmPasswordInput.value.length >= passwordInput.value.length) {
            this.validateConfirmPassword(confirmPasswordInput, passwordInput);
          }
        });
      }
      
      // Validate address
      const addressInput = document.getElementById('address');
      if (addressInput) {
        addressInput.addEventListener('blur', () => {
          this.validateAddress(addressInput);
        });
        
        // Validate khi đang nhập
        let addressTimer;
        addressInput.addEventListener('input', () => {
          clearTimeout(addressTimer);
          addressTimer = setTimeout(() => {
            if (addressInput.value.length > 4) {
              this.validateAddress(addressInput);
            }
          }, 800);
        });
      }
      
      // Validate birthdate
      const birthdateInput = document.getElementById('birthdate');
      if (birthdateInput) {
        birthdateInput.addEventListener('blur', () => {
          this.validateBirthdate(birthdateInput);
        });
        
        // Validate ngay khi chọn
        birthdateInput.addEventListener('change', () => {
          this.validateBirthdate(birthdateInput);
        });
      }
    }
    
    // Validate form đăng nhập
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      // Validate email/phone
      const emailPhoneInput = document.getElementById('login-email') || document.getElementById('login-email-phone');
      if (emailPhoneInput) {
        emailPhoneInput.addEventListener('blur', () => {
          this.validateLoginIdentifier(emailPhoneInput);
        });
        
        // Validate khi đang nhập
        emailPhoneInput.addEventListener('input', () => {
          if (emailPhoneInput.value.length > 5) {
            this.validateLoginIdentifier(emailPhoneInput);
          }
        });
      }
      
      // Validate password
      const passwordInput = document.getElementById('login-password');
      if (passwordInput) {
        passwordInput.addEventListener('blur', () => {
          this.validateLoginPassword(passwordInput);
        });
        
        // Validate khi đang nhập
        passwordInput.addEventListener('input', () => {
          if (passwordInput.value.length > 5) {
            this.validateLoginPassword(passwordInput);
          }
        });
      }
    }
  }
  
  /**
   * Validate username
   */
  static validateUsername(input) {
    const value = input.value.trim();
    
    if (!value) {
      showFieldError(input, 'Vui lòng nhập họ và tên');
      return false;
    }
    
    if (value.length < 2) {
      showFieldError(input, 'Tên phải có ít nhất 2 ký tự');
      return false;
    }
    
    // Đánh dấu trường hợp lệ
    markFieldAsValid(input);
    return true;
  }
  
  /**
   * Validate email
   */
  static validateEmail(input) {
    const value = input.value.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!value) {
      showFieldError(input, 'Vui lòng nhập email');
      return false;
    }
    
    if (!emailRegex.test(value)) {
      showFieldError(input, 'Email không hợp lệ');
      return false;
    }
    
    // Đánh dấu trường hợp lệ
    markFieldAsValid(input);
    return true;
  }
  
  /**
   * Validate số điện thoại Việt Nam
   */
  static validatePhoneNumber(input) {
    const value = input.value.trim();
    // Kiểm tra số điện thoại Việt Nam (10 số, bắt đầu bằng 0)
    const phoneRegex = /^(0[3-9][0-9]{8})$/;
    
    if (!value) {
      showFieldError(input, 'Vui lòng nhập số điện thoại');
      return false;
    }
    
    if (!phoneRegex.test(value)) {
      showFieldError(input, 'Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0)');
      return false;
    }
    
    // Đánh dấu trường hợp lệ
    markFieldAsValid(input);
    return true;
  }
  
  /**
   * Validate password
   */
  static validatePassword(input) {
    const value = input.value;
    
    if (!value) {
      showFieldError(input, 'Vui lòng nhập mật khẩu');
      return false;
    }
    
    // Sử dụng hàm validatePassword để kiểm tra mật khẩu
    const validationResult = validatePassword(value);
    
    if (!validationResult.valid) {
      showFieldError(input, validationResult.message);
      return false;
    }
    
    // Đánh dấu trường hợp lệ
    markFieldAsValid(input);
    return true;
  }
  
  /**
   * Validate xác nhận mật khẩu
   */
  static validateConfirmPassword(confirmInput, passwordInput) {
    const confirmValue = confirmInput.value;
    const passwordValue = passwordInput.value;
    
    if (!confirmValue) {
      showFieldError(confirmInput, 'Vui lòng xác nhận mật khẩu');
      return false;
    }
    
    if (confirmValue !== passwordValue) {
      showFieldError(confirmInput, 'Mật khẩu xác nhận không khớp');
      return false;
    }
    
    // Đánh dấu trường hợp lệ
    markFieldAsValid(confirmInput);
    return true;
  }
  
  /**
   * Validate địa chỉ
   */
  static validateAddress(input) {
    const value = input.value.trim();
    
    if (!value) {
      showFieldError(input, 'Vui lòng nhập địa chỉ');
      return false;
    }
    
    if (value.length < 5) {
      showFieldError(input, 'Địa chỉ phải có ít nhất 5 ký tự');
      return false;
    }
    
    // Đánh dấu trường hợp lệ
    markFieldAsValid(input);
    return true;
  }
  
  /**
   * Validate ngày sinh
   */
  static validateBirthdate(input) {
    const value = input.value;
    
    if (!value) {
      showFieldError(input, 'Vui lòng chọn ngày sinh');
      return false;
    }
    
    const birthDate = new Date(value);
    const now = new Date();
    
    if (birthDate > now) {
      showFieldError(input, 'Ngày sinh không thể là ngày trong tương lai');
      return false;
    }
    
    // Kiểm tra tuổi (ít nhất 10 tuổi)
    const minAge = new Date();
    minAge.setFullYear(minAge.getFullYear() - 10);
    
    if (birthDate > minAge) {
      showFieldError(input, 'Bạn phải ít nhất 10 tuổi để đăng ký');
      return false;
    }
    
    // Đánh dấu trường hợp lệ
    markFieldAsValid(input);
    return true;
  }
  
  /**
   * Validate identifier đăng nhập (email hoặc SĐT)
   */
  static validateLoginIdentifier(input) {
    const value = input.value.trim();
    
    if (!value) {
      showFieldError(input, 'Vui lòng nhập email hoặc số điện thoại');
      return false;
    }
    
    // Kiểm tra nếu là email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Kiểm tra nếu là số điện thoại
    const phoneRegex = /^(0[3-9][0-9]{8})$/;
    
    if (!emailRegex.test(value) && !phoneRegex.test(value)) {
      showFieldError(input, 'Email hoặc số điện thoại không hợp lệ');
      return false;
    }
    
    // Đánh dấu trường hợp lệ
    markFieldAsValid(input);
    return true;
  }
  
  /**
   * Validate mật khẩu đăng nhập
   */
  static validateLoginPassword(input) {
    const value = input.value;
    
    if (!value) {
      showFieldError(input, 'Vui lòng nhập mật khẩu');
      return false;
    }
    
    if (value.length < 6) {
      showFieldError(input, 'Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    
    // Đánh dấu trường hợp lệ
    markFieldAsValid(input);
    return true;
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
        // Validate tất cả các trường trước khi submit
        const emailPhoneInput = document.getElementById('login-email') || document.getElementById('login-email-phone');
        const passwordInput = document.getElementById('login-password');
        
        const isEmailValid = this.validateLoginIdentifier(emailPhoneInput);
        const isPasswordValid = this.validateLoginPassword(passwordInput);
        
        if (isEmailValid && isPasswordValid) {
          // Hiệu ứng khi form hợp lệ
          this.showFormSuccess(loginForm);
          
          // Tiến hành đăng nhập
          this.login();
        } else {
          // Hiệu ứng khi form không hợp lệ
          this.showFormError(loginForm, 'Vui lòng điền đầy đủ thông tin đăng nhập');
        }
      });
    }

    // Xử lý form đăng ký
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate tất cả các trường trước khi submit
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const addressInput = document.getElementById('address');
        const birthdateInput = document.getElementById('birthdate');
        
        const isUsernameValid = this.validateUsername(usernameInput);
        const isEmailValid = this.validateEmail(emailInput);
        const isPhoneValid = this.validatePhoneNumber(phoneInput);
        const isPasswordValid = this.validatePassword(passwordInput);
        const isConfirmPasswordValid = this.validateConfirmPassword(confirmPasswordInput, passwordInput);
        const isAddressValid = this.validateAddress(addressInput);
        const isBirthdateValid = this.validateBirthdate(birthdateInput);
        
        if (isUsernameValid && isEmailValid && isPhoneValid && isPasswordValid && 
            isConfirmPasswordValid && isAddressValid && isBirthdateValid) {
          // Hiệu ứng khi form hợp lệ
          this.showFormSuccess(registerForm);
          
          // Tiến hành đăng ký
          this.register();
        } else {
          // Hiệu ứng khi form không hợp lệ
          this.showFormError(registerForm, 'Vui lòng kiểm tra lại thông tin trong form');
        }
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
          window.location.href = '/../admin/admin.html';
        } else {
          // Nếu đang cố gắng đăng nhập vào trang admin mà không phải admin
          if (isAdminLogin) {
            // Chuyển đến trang chủ người dùng
            window.location.href = '/../index.html';
          } else {
            // Nếu đăng nhập từ trang thông thường, đi đến trang chủ
            window.location.href = '/../index.html';
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
      window.location.href = '/../login.html';
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
      var isExpired = Date.now() >= expirationTime;
      // if(!isExpired) {
      //   if(payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] == "admin") {
      //     window.location.href = '/../admin/admin.html';
      //   } else {
      //     window.location.href = '/../index.html';
      //   }
      // }
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
    if (window.UI && typeof window.UI.createNotification === 'function') {
      window.UI.createNotification(message, 'error', 5000);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('error', message, 5000);
    } else {
      alert(`Lỗi: ${message}`);
    }
  }

  /**
   * Hiển thị thông báo thành công
   * @param {string} message - Thông báo thành công
   */
  static showSuccess(message) {
    if (window.UI && typeof window.UI.createNotification === 'function') {
      window.UI.createNotification(message, 'success', 3000);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('success', message, 3000);
    } else {
      alert(`Thành công: ${message}`);
    }
  }

  /**
   * Hiển thị hiệu ứng thành công khi submit form
   * @param {Element} form - Form element
   */
  static showFormSuccess(form) {
    // Thêm class success vào form
    form.classList.add('form-success');
    
    // Lấy nút submit
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      // Lưu text gốc
      const originalText = submitBtn.textContent;
      
      // Thay đổi text và style của button
      submitBtn.textContent = 'Đang xử lý...';
      submitBtn.disabled = true;
      submitBtn.style.backgroundColor = '#28a745';
      
      // Thêm icon loading
      const loadingIcon = document.createElement('span');
      loadingIcon.className = 'loading-spinner';
      loadingIcon.style.display = 'inline-block';
      loadingIcon.style.width = '16px';
      loadingIcon.style.height = '16px';
      loadingIcon.style.border = '2px solid #fff';
      loadingIcon.style.borderRadius = '50%';
      loadingIcon.style.borderTopColor = 'transparent';
      loadingIcon.style.marginLeft = '10px';
      loadingIcon.style.animation = 'spin 1s linear infinite';
      
      // Thêm style cho animation
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(styleElement);
      
      // Thêm icon vào button
      submitBtn.appendChild(loadingIcon);
      
      // Reset button sau một khoảng thời gian nếu không chuyển trang
      setTimeout(() => {
        if (document.body.contains(submitBtn)) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.backgroundColor = '';
          form.classList.remove('form-success');
        }
      }, 8000); // Timeout dài hơn để đợi API xử lý
    }
  }
  
  /**
   * Hiển thị hiệu ứng lỗi khi submit form
   * @param {Element} form - Form element
   * @param {string} message - Thông báo lỗi
   */
  static showFormError(form, message) {
    // Thêm class error vào form
    form.classList.add('form-error');
    
    // Kiểm tra nếu đã có thông báo lỗi tổng thể
    let errorSummary = form.querySelector('.error-summary');
    
    if (!errorSummary) {
      // Tạo thông báo lỗi tổng thể
      errorSummary = document.createElement('div');
      errorSummary.className = 'error-summary';
      errorSummary.style.color = '#ff3333';
      errorSummary.style.backgroundColor = 'rgba(255, 51, 51, 0.1)';
      errorSummary.style.padding = '10px';
      errorSummary.style.borderRadius = '4px';
      errorSummary.style.marginBottom = '15px';
      errorSummary.style.animation = 'fadeIn 0.3s ease';
      errorSummary.style.border = '1px solid #ff3333';
      
      // Tạo và thêm icon
      const iconSpan = document.createElement('span');
      iconSpan.textContent = '! ';
      iconSpan.style.fontWeight = 'bold';
      errorSummary.appendChild(iconSpan);
      
      // Tạo và thêm nội dung
      const messageSpan = document.createElement('span');
      messageSpan.textContent = message;
      errorSummary.appendChild(messageSpan);
      
      // Thêm vào đầu form
      form.insertBefore(errorSummary, form.firstChild);
      
      // Rung lắc form
      form.style.animation = 'shake 0.5s ease';
      
      // Thêm style cho animation vào head nếu chưa có
      if (!document.querySelector('style#error-animations')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'error-animations';
        styleElement.textContent = `
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
        `;
        document.head.appendChild(styleElement);
      }
      
      // Scrolling đến thông báo lỗi
      window.scrollTo({
        top: errorSummary.offsetTop - 100,
        behavior: 'smooth'
      });
      
      // Xóa thông báo lỗi sau 5 giây
      setTimeout(() => {
        if (document.body.contains(errorSummary)) {
          errorSummary.remove();
          form.classList.remove('form-error');
        }
      }, 5000);
    } else {
      // Cập nhật thông báo lỗi đã tồn tại
      const messageSpan = errorSummary.querySelector('span:last-child');
      if (messageSpan) {
        messageSpan.textContent = message;
      }
      
      // Làm mới hiệu ứng
      errorSummary.style.animation = 'none';
      setTimeout(() => {
        errorSummary.style.animation = 'fadeIn 0.3s ease';
      }, 10);
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