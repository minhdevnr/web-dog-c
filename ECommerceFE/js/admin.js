// Check for token on page load
window.onload = function() {
    const token = localStorage.getItem('token');
    if (!token) {
        // If no token is found, redirect to the login page
        window.location.href = '/ECommerceFE/user/login.html';
    }
};

document.getElementById('logoutButton').addEventListener('click', async function(event) {
    event.preventDefault(); // Prevent the default anchor behavior

    try {
          localStorage.removeItem('token');
          window.location.reload();

            // Handle successful logout
            NotificationSystem.success('Đăng xuất thành công');
            // Redirect to login page for user
            window.location.href = '/ECommerceFE/user/login.html';
        
    } catch (error) {
        console.error('Error during logout:', error);
        NotificationSystem.error('Đã xảy ra lỗi khi đăng xuất');
    }
}); 