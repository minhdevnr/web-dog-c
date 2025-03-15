document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('login-btn').addEventListener('click', () => {
        window.location.href = 'user/login.html';
    });

    document.getElementById('register-btn').addEventListener('click', () => {
        window.location.href = 'user/register.html';
    });

    // Handle cart button
    document.getElementById('cart-btn').addEventListener('click', () => {
        window.location.href = './index-cart.html';
    });

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
        // Hide login/register buttons if user is logged in
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('register-btn').style.display = 'none';
        
        // Add logout button
        const logoutBtn = document.createElement('div');
        logoutBtn.className = 'fa fa-sign-out';
        logoutBtn.id = 'logout-btn';
        document.querySelector('.icons').appendChild(logoutBtn);
        
        // Handle logout
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.reload();
        });
    }
}); 