/**
 * Quản lý hồ sơ người dùng
 */

document.addEventListener('DOMContentLoaded', function() {
  // Tải thông tin người dùng nếu đã đăng nhập
  loadUserProfile();
  
  // Xử lý form cập nhật thông tin
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      updateUserProfile();
    });
  }
  
  // Xử lý form đổi mật khẩu
  const passwordForm = document.getElementById('password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      changePassword();
    });
  }
  
  // Xử lý chuyển đổi tab
  const profileLinks = document.querySelectorAll('.profile-menu a');
  profileLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const target = this.getAttribute('href');
      
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
        
        this.parentElement.classList.add('active');
      }
    });
  });
});

/**
 * Tải thông tin người dùng
 */
function loadUserProfile() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  
  if (!token || !user) {
    window.location.href = 'login.html';
    return;
  }
  
  // Hiển thị thông tin người dùng
  document.getElementById('profile-username').textContent = user.username || 'Người dùng';
  document.getElementById('fullName').value = user.fullName || user.username || '';
  document.getElementById('email').value = user.email || '';
  document.getElementById('phoneNumber').value = user.phoneNumber || '';
  document.getElementById('address').value = user.address || '';
  
  // Xử lý ngày sinh (nếu có)
  if (user.dateOfBirth) {
    try {
      const date = new Date(user.dateOfBirth);
      if (!isNaN(date.getTime())) {
        document.getElementById('dateOfBirth').value = date.toISOString().split('T')[0];
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
}

/**
 * Cập nhật thông tin người dùng
 */
async function updateUserProfile() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  
  if (!token || !user) {
    NotificationSystem.error('Bạn chưa đăng nhập');
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
    // Trong môi trường thực tế, gửi request API
    // const response = await fetch(`${API_URL}/api/users/profile`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   },
    //   body: JSON.stringify(updatedUser)
    // });
    
    // Mô phỏng API call thành công
    // const data = await response.json();
    
    // Cập nhật thông tin người dùng trong localStorage
    const updatedUserData = { ...user, ...updatedUser };
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    
    NotificationSystem.success('Cập nhật thông tin thành công');
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin:', error);
    NotificationSystem.error('Có lỗi xảy ra khi cập nhật thông tin');
  }
}

/**
 * Đổi mật khẩu
 */
async function changePassword() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    NotificationSystem.error('Bạn chưa đăng nhập');
    return;
  }
  
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Kiểm tra mật khẩu mới
  if (!currentPassword || !newPassword || !confirmPassword) {
    NotificationSystem.error('Vui lòng điền đầy đủ thông tin');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    NotificationSystem.error('Mật khẩu xác nhận không khớp');
    return;
  }
  
  if (newPassword.length < 6) {
    NotificationSystem.error('Mật khẩu mới phải có ít nhất 6 ký tự');
    return;
  }
  
  try {
    // Trong môi trường thực tế, gửi request API
    // const response = await fetch(`${API_URL}/api/users/change-password`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   },
    //   body: JSON.stringify({
    //     currentPassword,
    //     newPassword
    //   })
    // });
    
    // Mô phỏng API call thành công
    // if (response.ok) {
    //   const data = await response.json();
    //   NotificationSystem.success('Đổi mật khẩu thành công');
    //   
    //   // Xóa form
    //   document.getElementById('currentPassword').value = '';
    //   document.getElementById('newPassword').value = '';
    //   document.getElementById('confirmPassword').value = '';
    // } else {
    //   const error = await response.json();
    //   NotificationSystem.error(error.message || 'Mật khẩu hiện tại không đúng');
    // }
    
    // Mô phỏng đổi mật khẩu thành công
    NotificationSystem.success('Đổi mật khẩu thành công');
    
    // Xóa form
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  } catch (error) {
    console.error('Lỗi khi đổi mật khẩu:', error);
    NotificationSystem.error('Có lỗi xảy ra khi đổi mật khẩu');
  }
} 