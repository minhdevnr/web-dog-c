// Cấu hình API URL
const API_URL = 'https://localhost:7175/api';

// Xử lý đăng nhập
async function login(EmailOrPhone, Password) {
  try {
    const response = await fetch(`${API_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },  
      body: JSON.stringify({ EmailOrPhone, Password }),
      mode: 'cors',
      credentials: 'include'
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập thất bại');
    }
    
    // Lưu token và thông tin người dùng vào localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
      id: data.id,
      username: data.username,
      email: data.email,
      role: data.role
    }));
    
    return data;
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    throw error;
  }
}

// Xử lý đăng ký
async function register(userData) {
  console.log('Đang gửi yêu cầu đăng ký đến:', `${API_URL}/user/register`);
  console.log('Dữ liệu gửi đi:', userData);
  
  try {
    const response = await fetch(`${API_URL}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData),
      mode: 'cors',
      credentials: 'include'
    });

    console.log('Phản hồi từ server:', response);
    
    // Đọc dữ liệu JSON từ response ngay cả khi response.ok = false
    let data;
    try {
      data = await response.json();
      console.log('Dữ liệu phản hồi:', data);
    } catch (jsonError) {
      console.error('Lỗi parse JSON:', jsonError);
      throw new Error('Lỗi kết nối đến server');
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Đăng ký thất bại');
    }
    
    return data;
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    throw error;
  }
}

// Kiểm tra trạng thái đăng nhập
function isLoggedIn() {
  return localStorage.getItem('token') !== null;
}

// Lấy thông tin người dùng hiện tại
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Lỗi phân tích thông tin người dùng:', error);
    return null;
  }
}

// Đăng xuất
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Quên mật khẩu
async function forgotPassword(email) {
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
    
    return data;
  } catch (error) {
    console.error('Lỗi quên mật khẩu:', error);
    throw error;
  }
}

// Đặt lại mật khẩu
async function resetPassword(token, newPassword) {
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

// Lấy thông tin hồ sơ người dùng
async function getUserProfile() {
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

// Cập nhật thông tin hồ sơ
async function updateUserProfile(profileData) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Chưa đăng nhập');
  }
  
  try {
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Không thể cập nhật thông tin hồ sơ');
    }
    
    // Cập nhật thông tin người dùng trong localStorage
    const user = getCurrentUser();
    if (user) {
      user.username = data.username;
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return data;
  } catch (error) {
    console.error('Lỗi cập nhật hồ sơ:', error);
    throw error;
  }
}

document.addEventListener('headerLoaded', function() {
    debugger
    // Tham chiếu đến các phần tử
    const userProfileBtn = document.getElementById('user-profile-btn');
    const userProfileDropdown = document.querySelector('.user-profile-dropdown');
    const userName = document.getElementById('user-name');
    const adminLink = document.getElementById('admin-link');
    const loginLink = document.getElementById('login-link');
    const logoutBtn = document.getElementById('logout-btn');
    const profileLink = document.getElementById('profile-link');
    const ordersLink = document.getElementById('orders-link');
    const wishlistLink = document.getElementById('wishlist-link');
    const registerBtn = document.getElementById('register-btn');

    // Kiểm tra xem các phần tử có tồn tại không
    if (!userProfileBtn || !userProfileDropdown) {
        console.error('Không thể tìm thấy các phần tử cần thiết');
        return;
    }

    // Toggle dropdown menu khi click vào icon user
    userProfileBtn.addEventListener('click', function() {
        userProfileDropdown.classList.toggle('active');
    });

    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', function(event) {
        if (!userProfileBtn.contains(event.target) && !userProfileDropdown.contains(event.target)) {
            userProfileDropdown.classList.remove('active');
        }
    });

    // Kiểm tra trạng thái đăng nhập
    function checkLoginStatus() {
        // Giả sử thông tin người dùng được lưu trong localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (currentUser) {
            // Người dùng đã đăng nhập
            userName.textContent = currentUser.FullName || currentUser.Username;
            loginLink.style.display = 'none';
            logoutBtn.style.display = 'block';
            profileLink.style.display = 'block';
            ordersLink.style.display = 'block';
            wishlistLink.style.display = 'block';
            registerBtn.style.display = 'none';
            
            // Kiểm tra quyền admin
            if (currentUser.Role === 'Admin') {
                adminLink.style.display = 'block';
            } else {
                adminLink.style.display = 'none';
            }
        } else {
            // Người dùng chưa đăng nhập
            userName.textContent = 'Chưa đăng nhập';
            loginLink.style.display = 'block';
            logoutBtn.style.display = 'none';
            profileLink.style.display = 'none';
            ordersLink.style.display = 'none';
            wishlistLink.style.display = 'none';
            adminLink.style.display = 'none';
            registerBtn.style.display = 'block';
        }
    }

    // Xử lý đăng xuất
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token'); // Nếu bạn sử dụng token
        checkLoginStatus();
        userProfileDropdown.classList.remove('active');
        
        // Chuyển hướng về trang chủ
        window.location.href = 'index.html';
    });

    // Xử lý đăng nhập (chuyển hướng đến trang đăng nhập)
    loginLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'login.html';
    });

    // Kiểm tra trạng thái đăng nhập khi trang được tải
    checkLoginStatus();
});

// Thêm một listener cho DOMContentLoaded để khởi tạo trạng thái ban đầu
document.addEventListener('DOMContentLoaded', function() {
    // Đợi header load xong mới thực hiện các thao tác với elements trong header
    const headerLoadCheck = setInterval(() => {
        const userProfileBtn = document.getElementById('user-profile-btn');
        if (userProfileBtn) {
            clearInterval(headerLoadCheck);
            // Tiếp tục code với userProfileBtn
            initializeUserAuth();
        }
    }, 100);

    function initializeUserAuth() {
        const userProfileBtn = document.getElementById('user-profile-btn');
        // ... rest of your existing code ...
    }
}); 