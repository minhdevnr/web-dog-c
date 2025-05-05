/**
 * News Detail Module - Xử lý hiển thị chi tiết tin tức
 */

const NewsDetail = (function() {
    // Biến lưu trữ thông tin tin tức hiện tại
    let currentNews = null;
    const API_URL = 'https://localhost:7175'; // URL API dịch vụ
    
    // Hàm khởi tạo
    function init() {
        // Tải chi tiết tin tức khi trang được load
        loadNewsDetail();
    }
    
    // Tải chi tiết tin tức từ API
    function loadNewsDetail() {
        const newsDetailContainer = document.querySelector('#news-detail-container');
        if (!newsDetailContainer) return;
        
        // Lấy ID tin tức từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const newsId = urlParams.get('id');
        
        if (!newsId) {
            newsDetailContainer.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i><p>Không tìm thấy tin tức. Vui lòng kiểm tra lại đường dẫn.</p><a href="index-blog.html" class="btn">Quay lại danh sách tin tức</a></div>';
            return;
        }
        
        // Hiển thị loading
        newsDetailContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        
        // Gọi API để lấy chi tiết tin tức
        fetch(`${API_URL}/api/news/${newsId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Không thể kết nối đến máy chủ');
                }
                return response.json();
            })
            .then(data => {
                if (!data || Object.keys(data).length === 0) {
                    throw new Error('Không tìm thấy tin tức');
                }
                
                // Lưu tin tức hiện tại
                currentNews = data;
                
                // Cập nhật tiêu đề trang
                document.title = `${data.Title} - LH Coffee`;
                
                // Định dạng ngày tháng
                const date = new Date(data.CreatedAt);
                const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                
                // Hiển thị chi tiết tin tức
                newsDetailContainer.innerHTML = `
                    <h1 class="news-title">${data.Title}</h1>
                    <div class="news-meta">
                        <span class="news-date"><i class="fas fa-calendar"></i> ${formattedDate}</span>
                        <span class="news-author"><i class="fas fa-user"></i> ${data.Author}</span>
                        ${data.Category ? `<span class="news-category"><i class="fas fa-folder"></i> ${data.Category.Name}</span>` : ''}
                        <span class="news-views"><i class="fas fa-eye"></i> ${data.ViewCount || 0} lượt xem</span>
                    </div>
                    <div class="news-feature-image">
                        <img src="${data.ImageUrl}" alt="${data.Title}">
                    </div>
                    <div class="news-content">
                        ${data.Content}
                    </div>
                    ${data.Category ? 
                    `<div class="news-category">
                        <a href="index-blog.html?category=${data.Category.Id}" class="category-tag">${data.Category.Name}</a>
                    </div>` : ''}
                    <div class="news-navigation">
                        <a href="index-blog.html" class="btn"><i class="fas fa-arrow-left"></i> Quay lại danh sách</a>
                    </div>
                `;
                
                // Tải các tin tức liên quan
                loadRelatedNews(data.CategoryId || 0, data.Id);
            })
            .catch(error => {
                console.error('Lỗi khi tải chi tiết tin tức:', error);
                newsDetailContainer.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i><p>Không thể tải tin tức. Vui lòng thử lại sau.</p><a href="index-blog.html" class="btn">Quay lại danh sách tin tức</a></div>';
            });
    }
    
    // Tải tin tức liên quan
    function loadRelatedNews(categoryId, currentNewsId) {
        const relatedNewsContainer = document.querySelector('#related-news-container');
        if (!relatedNewsContainer) return;
        
        // Hiển thị loading
        relatedNewsContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        
        // Tham số cho API
        const params = new URLSearchParams({
            pageNumber: 1,
            pageSize: 3, // Hiển thị tối đa 3 tin liên quan
            sortBy: 'CreatedAt',
            desc: true
        });
        
        // Nếu có categoryId, thêm vào tham số
        if (categoryId && categoryId !== 0) {
            params.append('categoryId', categoryId);
        }
        
        // Gọi API để lấy tin tức liên quan
        fetch(`${API_URL}/api/news?${params.toString()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Không thể kết nối đến máy chủ');
                }
                return response.json();
            })
            .then(data => {
                // Kiểm tra nếu có dữ liệu
                if (data.Items && data.Items.length > 0) {
                    // Lọc bỏ tin tức hiện tại khỏi danh sách liên quan
                    const relatedNews = data.Items.filter(item => item.Id !== currentNewsId).slice(0, 3);
                    
                    if (relatedNews.length > 0) {
                        // Reset container
                        relatedNewsContainer.innerHTML = '';
                        
                        // Hiển thị tin tức liên quan
                        relatedNews.forEach(item => {
                            // Định dạng ngày tháng
                            const date = new Date(item.CreatedAt);
                            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                            
                            const newsBox = document.createElement('div');
                            newsBox.className = 'box';
                            newsBox.innerHTML = `
                                <div class="image">
                                    <img src="${item.ImageUrl}" alt="${item.Title}">
                                </div>
                                <div class="content">
                                    <h3><a href="news-detail.html?id=${item.Id}">${item.Title}</a></h3>
                                    <div class="news-info">
                                        <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                                        <span><i class="fas fa-user"></i> ${item.Author}</span>
                                    </div>
                                    <p>${item.Content.substring(0, 100)}...</p>
                                    <a href="news-detail.html?id=${item.Id}" class="btn">Đọc tiếp</a>
                                </div>
                            `;
                            relatedNewsContainer.appendChild(newsBox);
                        });
                    } else {
                        relatedNewsContainer.innerHTML = '<div class="no-news">Không có tin tức liên quan</div>';
                    }
                } else {
                    relatedNewsContainer.innerHTML = '<div class="no-news">Không có tin tức liên quan</div>';
                }
            })
            .catch(error => {
                console.error('Lỗi khi tải tin tức liên quan:', error);
                relatedNewsContainer.innerHTML = '<div class="error-message">Không thể tải tin tức liên quan</div>';
            });
    }
    
    // Hiển thị thông tin API đang sử dụng (cho mục đích gỡ lỗi)
    function getApiUrl() {
        return API_URL;
    }
    
    // Hiển thị thông tin tin tức hiện tại (cho mục đích gỡ lỗi)
    function getCurrentNews() {
        return currentNews;
    }
    
    // Xuất các hàm public
    return {
        init,
        loadNewsDetail,
        getApiUrl,
        getCurrentNews
    };
})();

// Tự động khởi tạo khi script được load
document.addEventListener('DOMContentLoaded', function() {
    NewsDetail.init();
}); 