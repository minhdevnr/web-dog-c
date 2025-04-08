/**
 * Xử lý hiển thị và thêm đánh giá sản phẩm
 */

// Lấy đánh giá sản phẩm dựa trên ID
async function getProductReviews(productId) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}/reviews`);
    
    if (!response.ok) {
      throw new Error('Không thể lấy đánh giá sản phẩm');
    }
    
    const reviews = await response.json();
    return reviews;
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    throw error;
  }
}

// Thêm đánh giá mới
async function addProductReview(reviewData) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Bạn cần đăng nhập để đánh giá sản phẩm');
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REVIEWS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });
    
    if (!response.ok) {
      throw new Error('Không thể thêm đánh giá');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error adding product review:', error);
    throw error;
  }
}

// Tính toán thống kê đánh giá
function calculateReviewStats(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: [0, 0, 0, 0, 0] // 5, 4, 3, 2, 1 sao
    };
  }
  
  const totalReviews = reviews.length;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / totalReviews;
  
  // Tính phân bố đánh giá
  const ratingDistribution = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 sao
  reviews.forEach(review => {
    ratingDistribution[5 - review.rating]++;
  });
  
  return {
    averageRating,
    totalReviews,
    ratingDistribution
  };
}

// Tạo HTML hiển thị số sao
function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

// Tạo HTML hiển thị đánh giá
function generateReviewHTML(review) {
  const stars = generateStarRating(review.rating);
  const reviewDate = new Date(review.createdAt).toLocaleDateString('vi-VN');
  
  return `
    <div class="review-item">
      <div class="review-header">
        <div class="review-author">${review.userName || 'Khách hàng'}</div>
        <div class="review-date">${reviewDate}</div>
      </div>
      <div class="review-rating">${stars}</div>
      <div class="review-content">${review.comment}</div>
    </div>
  `;
}

// Tạo HTML hiển thị phân bố đánh giá
function generateRatingDistributionHTML(stats) {
  let html = '';
  
  for (let i = 5; i >= 1; i--) {
    const count = stats.ratingDistribution[5 - i];
    const percentage = stats.totalReviews ? Math.round((count / stats.totalReviews) * 100) : 0;
    
    html += `
      <div class="rating-bar">
        <div class="rating-label">${i} ★</div>
        <div class="rating-progress">
          <div class="rating-progress-fill" style="width: ${percentage}%"></div>
        </div>
        <div class="rating-percentage">${percentage}%</div>
      </div>
    `;
  }
  
  return html;
}

// Xử lý xếp hạng sao
function setupRatingStars(container) {
  const stars = container.querySelectorAll('.rating-star');
  const ratingInput = container.querySelector('input[name="rating"]');
  
  stars.forEach(star => {
    star.addEventListener('mouseover', function() {
      const rating = this.getAttribute('data-rating');
      highlightStars(stars, rating);
    });
    
    star.addEventListener('mouseout', function() {
      const currentRating = ratingInput.value;
      highlightStars(stars, currentRating);
    });
    
    star.addEventListener('click', function() {
      const rating = this.getAttribute('data-rating');
      ratingInput.value = rating;
      highlightStars(stars, rating);
    });
  });
}

// Highlight stars theo rating
function highlightStars(stars, rating) {
  stars.forEach(star => {
    const starRating = star.getAttribute('data-rating');
    if (starRating <= rating) {
      star.classList.remove('far');
      star.classList.add('fas');
    } else {
      star.classList.remove('fas');
      star.classList.add('far');
    }
  });
} 