/**
 * Xử lý điều hướng và navbar
 */

document.addEventListener('DOMContentLoaded', function() {
    // Reference elements
    const navbar = document.querySelector('.navbar');
    const searchForm = document.querySelector('.search-form');
    const cartItemContainer = document.querySelector('.cart-item-container');
    const userProfileDropdown = document.querySelector('.user-profile-dropdown');
    
    // NavBar toggle for mobile
    const barsBtn = document.querySelector('#bars-btn');
    if (barsBtn) {
        barsBtn.addEventListener('click', () => {
            navbar?.classList.toggle('active');
            searchForm?.classList.remove('active');
            cartItemContainer?.classList.remove('active');
            userProfileDropdown?.classList.remove('active');
        });
    }
    
    // Search form toggle
    const searchBtn = document.querySelector('#search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchForm?.classList.toggle('active');
            navbar?.classList.remove('active');
            cartItemContainer?.classList.remove('active');
            userProfileDropdown?.classList.remove('active');
        });
    }
    
    // Cart toggle
    const cartBtn = document.querySelector('#cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            cartItemContainer?.classList.toggle('active');
            navbar?.classList.remove('active');
            searchForm?.classList.remove('active');
            userProfileDropdown?.classList.remove('active');
        });
    }
    
    // User profile toggle
    const userProfileBtn = document.querySelector('#user-profile-btn');
    if (userProfileBtn) {
        userProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userProfileDropdown?.classList.toggle('active');
            navbar?.classList.remove('active');
            searchForm?.classList.remove('active');
            cartItemContainer?.classList.remove('active');
        });
    }
    
    // Login button
    const loginBtn = document.querySelector('#login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
    
    // Register button
    const registerBtn = document.querySelector('#register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            window.location.href = 'register.html';
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (navbar && !e.target.closest('.navbar') && 
            !e.target.closest('#bars-btn')) {
            navbar.classList.remove('active');
        }
        
        if (searchForm && !e.target.closest('.search-form') && 
            !e.target.closest('#search-btn')) {
            searchForm.classList.remove('active');
        }
        
        if (cartItemContainer && !e.target.closest('.cart-item-container') && 
            !e.target.closest('#cart-btn')) {
            cartItemContainer.classList.remove('active');
        }
        
        if (userProfileDropdown && !e.target.closest('.user-profile-dropdown') && 
            !e.target.closest('#user-profile-btn')) {
            userProfileDropdown.classList.remove('active');
        }
    });
    
    // Close cart item
    document.querySelectorAll('.cart-item-container .fa-times').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.parentElement.remove();
            updateCartCount();
            updateCartTotal();
        });
    });
    
    // Update cart count
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const cartItems = document.querySelectorAll('.cart-item');
            cartCount.textContent = cartItems.length;
        }
    }
    
    // Update cart total
    function updateCartTotal() {
        // Implementation will depend on how prices are stored
    }
    
    // Call functions initially
    updateCartCount();
});

// Khởi tạo sự kiện cho trang sau khi header được tải
function initHeaderEvents() {
    const navbar = document.querySelector('.navbar');
    const searchForm = document.querySelector('.search-form');
    const cartItemContainer = document.querySelector('.cart-item-container');
    const userProfileDropdown = document.querySelector('.user-profile-dropdown');
    
    // NavBar toggle for mobile
    const barsBtn = document.querySelector('#bars-btn');
    if (barsBtn) {
        barsBtn.addEventListener('click', () => {
            navbar?.classList.toggle('active');
            searchForm?.classList.remove('active');
            cartItemContainer?.classList.remove('active');
            userProfileDropdown?.classList.remove('active');
        });
    }
    
    // Search form toggle
    const searchBtn = document.querySelector('#search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchForm?.classList.toggle('active');
            navbar?.classList.remove('active');
            cartItemContainer?.classList.remove('active');
            userProfileDropdown?.classList.remove('active');
        });
    }
    
    // Cart toggle
    const cartBtn = document.querySelector('#cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            cartItemContainer?.classList.toggle('active');
            navbar?.classList.remove('active');
            searchForm?.classList.remove('active');
            userProfileDropdown?.classList.remove('active');
        });
    }
}