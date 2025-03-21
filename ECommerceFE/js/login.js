document.querySelector('form').addEventListener('submit', async (e) => {
  debugger
  e.preventDefault();
  
  const formData = {
    username: document.querySelector('input[name="username"]').value,
    password: document.querySelector('input[name="password"]').value
  };
  debugger
  try {
    const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      
      // Redirect based on role 
      if (data.Role === 'Admin') {
        window.location.href = '/ECommerceFE/admin/admin.html';
      } else {
        window.location.href = '/ECommerceFE/index.html';
      }
    } else {
      alert('Invalid username or password');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('An error occurred during login');
  }
});
