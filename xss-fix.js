/**
 * Hàm an toàn để hiển thị nội dung người dùng
 * Thay thế cho việc sử dụng innerHTML trực tiếp
 */
function displayUserContent(content, targetElement) {
  // Phương pháp an toàn #1: Sử dụng textContent thay vì innerHTML
  // textContent sẽ hiển thị mã HTML dưới dạng văn bản thô
  targetElement.textContent = content;
}

/**
 * Hàm sanitize nội dung người dùng nếu cần hiển thị HTML
 */
function sanitizeHTML(content) {
  // Tạo một phần tử tạm thời
  const tempElement = document.createElement('div');
  
  // Gán nội dung vào phần tử tạm thời
  tempElement.textContent = content;
  
  // Lấy nội dung đã được sanitize
  return tempElement.innerHTML;
}

/**
 * Thêm comment an toàn vào danh sách bình luận
 */
function addCommentSafely(author, commentText) {
  const commentList = document.getElementById('comment-list');
  
  // Tạo phần tử mới
  const newComment = document.createElement('div');
  newComment.className = 'comment';
  
  // Tạo các phần tử con và sử dụng textContent để tránh XSS
  const authorElement = document.createElement('h4');
  authorElement.textContent = author;
  
  const textElement = document.createElement('p');
  textElement.textContent = commentText;
  
  // Thêm phần tử con vào phần tử cha
  newComment.appendChild(authorElement);
  newComment.appendChild(textElement);
  
  // Thêm bình luận vào danh sách
  commentList.appendChild(newComment);
}

/**
 * Xử lý gửi form comment
 */
function handleCommentSubmit(event) {
  event.preventDefault();
  
  // Lấy dữ liệu từ form
  const form = event.target;
  const author = form.querySelector('[name="author"]').value;
  const commentText = form.querySelector('[name="comment"]').value;
  
  // Kiểm tra dữ liệu
  if (!author.trim() || !commentText.trim()) {
    alert('Vui lòng điền đầy đủ thông tin');
    return;
  }
  
  // Thêm comment an toàn vào danh sách
  addCommentSafely(author, commentText);
  
  // Reset form
  form.reset();
}

/**
 * Khởi tạo sự kiện cho form comment
 */
function initCommentForm() {
  const commentForm = document.getElementById('comment-form');
  if (commentForm) {
    commentForm.addEventListener('submit', handleCommentSubmit);
  }
}

// Khởi tạo khi trang đã load
document.addEventListener('DOMContentLoaded', initCommentForm);

/**
 * Ví dụ lỗi XSS: KHÔNG SỬ DỤNG MÃ NÀY
 */
function unsafeDisplayUserContent(content, targetElement) {
  // NGUY HIỂM: Sử dụng innerHTML có thể dẫn đến lỗ hổng XSS
  // VÍ DỤ: Nếu content = "<script>alert('XSS Attack')</script>"
  targetElement.innerHTML = content; // ĐỪNG LÀM NHƯ THẾ NÀY
} 