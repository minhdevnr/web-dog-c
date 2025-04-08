// Load header
document.addEventListener('DOMContentLoaded', function() {
  // Load header
  fetch('header.html')
    .then(response => {
      if (!response.ok) {
        throw new Error('Không thể tải header');
      }
      return response.text();
    })
    .then(data => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'text/html');
      const headerContent = doc.querySelector('header');
      
      if (headerContent) {
        const headerContainer = document.getElementById('header-container');
        if (headerContainer) {
          headerContainer.appendChild(headerContent);
          // Trigger event khi header đã load xong
          document.dispatchEvent(new Event('headerLoaded'));
        } else {
          console.error('Không tìm thấy phần tử #header-container để chèn header.');
        }
      }
    })
    .catch(error => console.error('Error loading header:', error));
  
  // Load footer
  fetch('footer.html')
    .then(response => {
      if (!response.ok) {
        throw new Error('Không thể tải footer');
      }
      return response.text();
    })
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

