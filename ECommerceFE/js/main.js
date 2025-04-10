// Xử lý chuyển đổi theme
document.querySelector('.theme-switcher').addEventListener('click', () => {
  const currentTheme = localStorage.getItem('theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  switchTheme(newTheme);
  
  // Cập nhật icon
  const themeIcon = document.querySelector('.theme-switcher i');
  themeIcon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}); 