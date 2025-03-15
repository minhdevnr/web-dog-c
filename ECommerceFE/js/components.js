// Load header
document.addEventListener('DOMContentLoaded', function() {
  // Load header
  fetch('header.html')
    .then(response => response.text())
    .then(data => {
      // Chỉ lấy nội dung bên trong thẻ body
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'text/html');
      const headerContent = doc.querySelector('header');
      
      if (headerContent) {
        document.getElementById('header-placeholder').appendChild(headerContent);
      }
    })
    .catch(error => console.error('Error loading header:', error));
  
  // Load footer
  fetch('footer.html')
    .then(response => response.text())
    .then(data => {
      // Chỉ lấy nội dung bên trong thẻ body
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'text/html');
      const footerContent = doc.querySelector('.footer');
      
      if (footerContent) {
        document.getElementById('footer-placeholder').appendChild(footerContent);
      }
    })
    .catch(error => console.error('Error loading footer:', error));
});
