// --- Elements ---
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

// Error message elements
const loginErrorMessage = document.getElementById('login-error-message');
const registerErrorMessage = document.getElementById('register-error-message');
const registerEmailError = document.getElementById('register-email-error');
const registerPhoneError = document.getElementById('register-phone-error');
const registerPasswordError = document.getElementById('register-password-error');
const registerConfirmPasswordError = document.getElementById('register-confirm-password-error');

// Add social login buttons
const googleLoginBtn = document.getElementById('google-login-btn');
const facebookLoginBtn = document.getElementById('facebook-login-btn');

// --- Validation Helpers ---
function isValidEmail(email) {
    // Basic email regex
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[{\]}\\|;:'",<.>/?]).{8,}$/;
    return passwordRegex.test(password);
}

// --- View Toggling ---
if (showRegisterLink && showLoginLink && loginView && registerView) {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.style.display = 'none';
        registerView.style.display = 'block';
        clearErrorMessages(); // Clear errors when switching views
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerView.style.display = 'none';
        loginView.style.display = 'block';
        clearErrorMessages(); // Clear errors when switching views
    });
}

function clearErrorMessages() {
    loginErrorMessage.textContent = '';
    registerErrorMessage.textContent = '';
    registerEmailError.textContent = '';
    registerPhoneError.textContent = ''; // Assuming phone validation might be added later
    registerPasswordError.textContent = '';
    registerConfirmPasswordError.textContent = '';
}

// --- Login Handler ---
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrorMessages();

        const formData = {
            // Use the updated field name
            emailOrPhone: document.getElementById('login-email-phone').value,
            password: document.getElementById('login-password').value
        };

        try {
            // Assume API_CONFIG and ENDPOINTS.LOGIN are defined in config.js
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json(); // Attempt to parse JSON regardless of status

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user)); // Store user info if available

                // Redirect based on role (assuming role is in data.user.role or data.role)
                const userRole = data.user?.role || data.role; // Adjust based on actual API response
                if (userRole === 'Admin') {
                    window.location.href = '/ECommerceFE/admin/admin.html';
                } else {
                    window.location.href = '/ECommerceFE/index.html';
                }
            } else {
                // Display specific error from API if available, otherwise generic
                loginErrorMessage.textContent = data.message || 'Email/Số điện thoại hoặc mật khẩu không hợp lệ.';
            }
        } catch (error) {
            console.error('Login error:', error);
            loginErrorMessage.textContent = 'Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.';
        }
    });
}

// --- Registration Handler ---
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrorMessages();
        let isValid = true;

        // Get form data
        const nameInput = document.getElementById('register-name');
        const emailInput = document.getElementById('register-email');
        const phoneInput = document.getElementById('register-phone');
        const passwordInput = document.getElementById('register-password');
        const confirmPasswordInput = document.getElementById('register-confirm-password');

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // --- Client-side Validation ---
        if (!name) {
             // Basic check for name, can add more specific validation if needed
             // For now, just rely on 'required' attribute
        }

        if (!isValidEmail(email)) {
            registerEmailError.textContent = 'Định dạng email không hợp lệ.';
            isValid = false;
        }

        // Basic phone validation (e.g., check if numeric and length), can be improved
        if (!phone || !/^[0-9]{10,}$/.test(phone)) { // Example: At least 10 digits
            registerPhoneError.textContent = 'Số điện thoại không hợp lệ.';
            // isValid = false; // Optional: make phone validation strict
        }

        if (!isValidPassword(password)) {
            registerPasswordError.textContent = 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
            isValid = false;
        }

        if (password !== confirmPassword) {
            registerConfirmPasswordError.textContent = 'Mật khẩu xác nhận không khớp.';
            isValid = false;
        }

        if (!isValid) {
            return; // Stop submission if validation fails
        }

        // --- API Call ---
        const formData = {
            name,
            email,
            phoneNumber: phone, // Match backend expected field name
            password
        };

        try {
            // Assume API_CONFIG and ENDPOINTS.REGISTER are defined in config.js
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json(); // Attempt to parse JSON

            if (response.ok) {
                // Registration successful
                registerView.innerHTML = `
                    <div class="alert alert-success" role="alert">
                      Đăng ký thành công! Vui lòng kiểm tra email/SMS để kích hoạt tài khoản (nếu có).
                    </div>
                    <p class="mt-3 text-center">
                      <a href="#" id="show-login-after-register">Quay lại Đăng nhập</a>
                    </p>`;
                // Re-add listener for the new link
                document.getElementById('show-login-after-register')?.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    window.location.reload(); // Simplest way to reset the form view
                });

            } else {
                // Display error from API (e.g., email/phone exists)
                 registerErrorMessage.textContent = data.message || 'Đăng ký không thành công. Vui lòng thử lại.';
            }

        } catch (error) {
            console.error('Registration error:', error);
            registerErrorMessage.textContent = 'Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.';
        }
    });
}

// --- Social Login Handlers ---

// ** IMPORTANT: Replace placeholders with your actual Client IDs and Redirect URIs **
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Replace!
const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID'; // Replace!
// This should be the URL of your backend endpoint that handles the redirect
const REDIRECT_URI = encodeURIComponent(API_CONFIG.BASE_URL + '/api/auth/oauth-callback'); // Example backend callback URL

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        // Construct Google OAuth URL
        const scope = encodeURIComponent('openid profile email');
        const state = Math.random().toString(36).substring(2); // Basic CSRF protection
        localStorage.setItem('oauth_state', state); // Store state to verify on callback

        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=655982608005-266h0gtgdcd6pqd2i61h9ggm3agl07d1.apps.googleusercontent.com` +
            `&redirect_uri=${REDIRECT_URI}` +
            `&response_type=code` +
            `&scope=${scope}` +
            `&access_type=offline` + // Optional: for refresh tokens
            `&state=${state}`;

        window.location.href = googleAuthUrl;
    });
}

if (facebookLoginBtn) {
    facebookLoginBtn.addEventListener('click', () => {
        // Construct Facebook Login URL
        const scope = 'public_profile,email';
        const state = Math.random().toString(36).substring(2); // Basic CSRF protection
        localStorage.setItem('oauth_state', state); // Store state to verify on callback

        const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
            `client_id=${FACEBOOK_APP_ID}` +
            `&redirect_uri=${REDIRECT_URI}` +
            `&response_type=code` +
            `&scope=${scope}` +
            `&state=${state}`;

        window.location.href = facebookAuthUrl;
    });
}
