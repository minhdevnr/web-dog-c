/**
 * Module kiểm tra độ mạnh của mật khẩu
 * Khắc phục vấn đề SEC-05 (Thiếu kiểm tra độ phức tạp mật khẩu)
 */
class PasswordStrengthValidator {
  constructor(options = {}) {
    // Cấu hình mặc định
    this.config = {
      minLength: options.minLength || 8,
      requireUppercase: options.requireUppercase !== undefined ? options.requireUppercase : true,
      requireLowercase: options.requireLowercase !== undefined ? options.requireLowercase : true,
      requireNumbers: options.requireNumbers !== undefined ? options.requireNumbers : true,
      requireSpecial: options.requireSpecial !== undefined ? options.requireSpecial : true,
      specialChars: options.specialChars || '!@#$%^&*()_+\\-=\\[\\]{};\':"\\|,.<>\\/?'
    };
  }

  /**
   * Kiểm tra độ mạnh của mật khẩu
   * @param {string} password Mật khẩu cần kiểm tra
   * @returns {Object} Kết quả kiểm tra với score và danh sách lỗi
   */
  validate(password) {
    const result = {
      isValid: true,
      score: 0, // 0-100
      errors: [],
      strength: 'weak' // weak, medium, strong, very-strong
    };

    // Kiểm tra độ dài
    if (password.length < this.config.minLength) {
      result.errors.push(`Mật khẩu phải có ít nhất ${this.config.minLength} ký tự`);
      result.isValid = false;
    } else {
      result.score += 25;
    }

    // Kiểm tra chữ hoa
    if (this.config.requireUppercase && !/[A-Z]/.test(password)) {
      result.errors.push('Mật khẩu phải chứa ít nhất một chữ hoa');
      result.isValid = false;
    } else if (this.config.requireUppercase) {
      result.score += 25;
    }

    // Kiểm tra chữ thường
    if (this.config.requireLowercase && !/[a-z]/.test(password)) {
      result.errors.push('Mật khẩu phải chứa ít nhất một chữ thường');
      result.isValid = false;
    } else if (this.config.requireLowercase) {
      result.score += 15;
    }

    // Kiểm tra số
    if (this.config.requireNumbers && !/[0-9]/.test(password)) {
      result.errors.push('Mật khẩu phải chứa ít nhất một số');
      result.isValid = false;
    } else if (this.config.requireNumbers) {
      result.score += 15;
    }

    // Kiểm tra ký tự đặc biệt
    const specialRegex = new RegExp(`[${this.config.specialChars}]`);
    if (this.config.requireSpecial && !specialRegex.test(password)) {
      result.errors.push('Mật khẩu phải chứa ít nhất một ký tự đặc biệt');
      result.isValid = false;
    } else if (this.config.requireSpecial) {
      result.score += 20;
    }

    // Điểm bonus cho độ dài mật khẩu
    if (password.length > this.config.minLength) {
      const extraChars = password.length - this.config.minLength;
      result.score += Math.min(extraChars * 2, 20); // Tối đa thêm 20 điểm
    }

    // Xác định độ mạnh của mật khẩu
    if (result.score < 50) {
      result.strength = 'weak';
    } else if (result.score < 70) {
      result.strength = 'medium';
    } else if (result.score < 90) {
      result.strength = 'strong';
    } else {
      result.strength = 'very-strong';
    }

    return result;
  }

  /**
   * Cập nhật giao diện hiển thị độ mạnh mật khẩu
   * @param {string} password Mật khẩu cần kiểm tra
   * @param {HTMLElement} strengthMeter Phần tử hiển thị độ mạnh
   * @param {HTMLElement} errorContainer Phần tử hiển thị lỗi
   */
  updateUI(password, strengthMeter, errorContainer) {
    const result = this.validate(password);
    
    // Cập nhật thanh độ mạnh
    if (strengthMeter) {
      // Xóa tất cả class cũ
      strengthMeter.classList.remove('weak', 'medium', 'strong', 'very-strong');
      
      // Đặt giá trị và class mới
      if (password) {
        strengthMeter.style.width = `${result.score}%`;
        strengthMeter.classList.add(result.strength);
      } else {
        strengthMeter.style.width = '0%';
      }
    }
    
    // Hiển thị lỗi
    if (errorContainer) {
      errorContainer.innerHTML = '';
      
      if (result.errors.length > 0) {
        const errorList = document.createElement('ul');
        errorList.className = 'password-errors';
        
        result.errors.forEach(error => {
          const errorItem = document.createElement('li');
          errorItem.textContent = error;
          errorList.appendChild(errorItem);
        });
        
        errorContainer.appendChild(errorList);
      }
    }
    
    return result.isValid;
  }
}

/**
 * Khởi tạo validator cho form đăng ký/đổi mật khẩu
 */
function initPasswordValidation() {
  // Tạo validator với cấu hình
  const validator = new PasswordStrengthValidator({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecial: true
  });
  
  // Tìm các form đăng ký và đổi mật khẩu
  const forms = document.querySelectorAll('form.user-form, form.register-form, form.change-password-form');
  
  forms.forEach(form => {
    const passwordField = form.querySelector('input[type="password"][name="password"]');
    
    if (!passwordField) return;
    
    // Tạo phần tử hiển thị độ mạnh
    const strengthContainer = document.createElement('div');
    strengthContainer.className = 'password-strength-container';
    
    const strengthMeter = document.createElement('div');
    strengthMeter.className = 'password-strength-meter';
    
    const strengthBar = document.createElement('div');
    strengthBar.className = 'password-strength-bar';
    
    const errorContainer = document.createElement('div');
    errorContainer.className = 'password-error-container';
    
    // Thêm vào DOM
    strengthMeter.appendChild(strengthBar);
    strengthContainer.appendChild(strengthMeter);
    strengthContainer.appendChild(errorContainer);
    
    // Chèn sau trường mật khẩu
    passwordField.parentNode.insertBefore(strengthContainer, passwordField.nextSibling);
    
    // Thêm CSS nếu chưa có
    if (!document.getElementById('password-strength-css')) {
      const style = document.createElement('style');
      style.id = 'password-strength-css';
      style.textContent = `
        .password-strength-container {
          margin: 10px 0;
        }
        .password-strength-meter {
          height: 4px;
          background-color: #eee;
          position: relative;
          overflow: hidden;
          border-radius: 2px;
        }
        .password-strength-bar {
          position: absolute;
          height: 100%;
          width: 0;
          transition: width 0.3s, background-color 0.3s;
        }
        .password-strength-bar.weak { background-color: #f44336; }
        .password-strength-bar.medium { background-color: #ff9800; }
        .password-strength-bar.strong { background-color: #4caf50; }
        .password-strength-bar.very-strong { background-color: #2e7d32; }
        .password-error-container {
          margin-top: 5px;
          color: #f44336;
          font-size: 12px;
        }
        .password-errors {
          margin: 0;
          padding-left: 20px;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Sự kiện keyup để kiểm tra mật khẩu
    passwordField.addEventListener('input', () => {
      validator.updateUI(passwordField.value, strengthBar, errorContainer);
    });
    
    // Xác thực khi submit form
    form.addEventListener('submit', (e) => {
      const result = validator.validate(passwordField.value);
      
      if (!result.isValid) {
        e.preventDefault();
        validator.updateUI(passwordField.value, strengthBar, errorContainer);
        alert('Vui lòng sửa các lỗi về mật khẩu trước khi tiếp tục.');
      }
    });
  });
}

// Khởi tạo khi tài liệu đã sẵn sàng
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPasswordValidation);
} else {
  initPasswordValidation();
}

// Export module để sử dụng ở nơi khác
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PasswordStrengthValidator };
} else {
  window.PasswordStrengthValidator = PasswordStrengthValidator;
} 