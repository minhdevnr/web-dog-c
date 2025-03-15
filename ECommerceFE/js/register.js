document.getElementById('registerForm').addEventListener('submit', async (e) => {
    debugger
    e.preventDefault();
    
    const formData = {
        username: document.querySelector('input[name="username"]').value,
        password: document.querySelector('input[name="password"]').value,
        fullName: document.querySelector('input[name="fullName"]').value,
        email: document.querySelector('input[name="email"]').value,
        phoneNumber: document.querySelector('input[name="phoneNumber"]').value,
        address: document.querySelector('input[name="address"]').value,
        dateOfBirth: document.querySelector('input[name="dateOfBirth"]').value,
        role: 'Customer'
    };

    try {
        const response = await fetch(API_CONFIG.BASE_URL + '/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Registration successful! Please login.');
            debugger
            window.location.href = 'login.html';
        } else {
            const error = await response.text();
            alert(error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration');
    }
}); 