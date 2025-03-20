document.addEventListener('DOMContentLoaded', function() {
    // Navbar toggle functionality
    setTimeout(() => {
        let navbar = document.querySelector(".navbar");
        let searchFrom = document.querySelector(".search-form");
        let cartItem = document.querySelector(".cart-item-container");
        
        if(navbar){
            if (document.querySelector("#bars-btn")) {
                document.querySelector("#bars-btn").onclick = () => {
                    navbar.classList.toggle("active");
                    searchFrom?.classList.remove("active");
                    cartItem?.classList.remove("active");
                };
            }
        }
    }, 100);
  
    // Search form functionality
    setTimeout(() => {
        let navbar = document.querySelector(".navbar");
        let searchFrom = document.querySelector(".search-form");
        let cartItem = document.querySelector(".cart-item-container");
        
        if(searchFrom){
            document.querySelector("#search-btn").onclick = () => {
                searchFrom.classList.toggle("active");
                navbar?.classList.remove("active");
                cartItem?.classList.remove("active");
            };
        }
    }, 100);

    // Cart item functionality
    setTimeout(() => {
        debugger
        let navbar = document.querySelector(".navbar");
        let searchFrom = document.querySelector(".search-form");
        let cartItem = document.querySelector(".cart-item-container");
        
        if(cartItem){
            document.querySelector("#cart-btn").onclick = () => {
                window.location.href = './index-cart.html';
                cartItem.classList.toggle("active");
                navbar?.classList.remove("active");
                searchFrom?.classList.remove("active");
            };
        }

        window.onscroll = () => {
            navbar?.classList.remove("active");
            searchFrom?.classList.remove("active");
            cartItem?.classList.remove("active");
        };
    }, 100);
    
    // Login button functionality
    setTimeout(() => {
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.location.href = 'user/login.html';
            });
        }
        
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                window.location.href = 'user/register.html';
            });
        }
    }, 100);

    // Check if user is logged in
    setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Hide login/register buttons if user is logged in
            const loginBtn = document.getElementById('login-btn');
            const registerBtn = document.getElementById('register-btn');
            
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            
            // Add logout button
            const logoutBtn = document.createElement('div');
            logoutBtn.className = 'fa fa-sign-out';
            logoutBtn.id = 'logout-btn';
            
            const icons = document.querySelector('.icons');
            if (icons) {
                icons.appendChild(logoutBtn);
                
                // Handle logout
                logoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('token');
                    window.location.reload();
                });
            }
        }
    }, 100);
});