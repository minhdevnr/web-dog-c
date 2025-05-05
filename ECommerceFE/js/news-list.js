/**
 * News List Module - Xử lý hiển thị danh sách tin tức
 */

const NewsList = (function() {
    // Biến lưu trữ trạng thái phân trang
    let currentPage = 1;
    let totalPages = 1;
    let pageSize = 6;
    const API_URL = 'https://localhost:7175'; // URL API dịch vụ
    
    // Hàm khởi tạo
    function init() {
        // Xác định trang hiện tại
        const isHomePage = window.location.pathname.endsWith('index.html') || 
                           window.location.pathname.endsWith('/') || 
                           window.location.pathname === '';
        
        // Lấy tham số từ URL nếu có
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        if (pageParam && !isNaN(parseInt(pageParam))) {
            currentPage = parseInt(pageParam);
        }
        
        // Tải danh sách tin tức với tham số tương ứng
        if (isHomePage) {
            loadNewsList(1, null, true); // Trang chủ: chỉ hiển thị 3 tin mới nhất
        } else {
            loadNewsList(currentPage); // Trang blog: hiển thị đầy đủ với phân trang
            
            // Xử lý khi chọn danh mục chỉ áp dụng cho trang blog
            setupCategoryFilter();
        }
    }
    
    // Tải danh sách tin tức từ API
    function loadNewsList(page = 1, category = null, isHomePage = false) {
        const newsListContainer = document.querySelector('#news-container');
        if (!newsListContainer) return;
    
        // Hiển thị loading
        newsListContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        
        // Cập nhật trang hiện tại
        currentPage = page;
        
        // Xây dựng tham số API
        const params = new URLSearchParams({
            pageNumber: page,
            pageSize: isHomePage ? 3 : pageSize, // Nếu là trang chủ, chỉ lấy 3 tin
            sortBy: 'CreatedAt',
            desc: true
        });
        
        // Thêm tham số category nếu có
        if (category) {
            params.append('category', category);
        }
        
        // Gọi API để lấy danh sách tin tức
        const apiUrl = `${API_URL}/api/news`;
        
        fetch(`${apiUrl}?${params.toString()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Không thể kết nối đến máy chủ');
                }
                return response.json();
            })
            .then(data => {
                // Xóa loading
                newsListContainer.innerHTML = '';
                
                // Cập nhật thông tin phân trang
                totalPages = data.TotalPages || 1;
                
                if (data.Items && data.Items.length > 0) {
                    // Tạo container cho danh sách tin tức
                    const newsGrid = document.createElement('div');
                    newsGrid.className = 'news-grid';
                    
                    // Thêm tin tức vào grid
                    data.Items.forEach(item => {
                        const newsBox = createNewsElement(item);
                        newsGrid.appendChild(newsBox);
                    });
                    
                    newsListContainer.appendChild(newsGrid);
                    
                    // Tạo phân trang, nhưng chỉ khi không phải trang chủ
                    if (!isHomePage) {
                        const paginationElement = createPagination(page, totalPages);
                        newsListContainer.appendChild(paginationElement);
                    } else {
                        // Nếu là trang chủ thì thêm nút xem tất cả
                        const viewAllButton = document.createElement('div');
                        viewAllButton.className = 'view-all-button';
                        viewAllButton.innerHTML = '<a href="index-blog.html" class="btn">Xem tất cả <i class="fas fa-arrow-right"></i></a>';
                        newsListContainer.appendChild(viewAllButton);
                    }
                } else {
                    // Hiển thị thông báo không có tin tức
                    newsListContainer.innerHTML = '<div class="no-news">Không có tin tức nào được tìm thấy</div>';
                }
            })
            .catch(error => {
                console.error('Lỗi khi tải danh sách tin tức:', error);
                newsListContainer.innerHTML = '<div class="error">Không thể tải tin tức. Vui lòng thử lại sau.</div>';
            });
    }
    
    // Tạo phần tử tin tức
    function createNewsElement(item) {
        const newsBox = document.createElement('div');
        newsBox.classList.add('news-box');
        newsBox.setAttribute('data-news-id', item.Id);
        
        // Định dạng ngày tháng
        const date = new Date(item.CreatedAt);
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        
        // HTML cho tin tức
        newsBox.innerHTML = `
            <div class="news-image">
                <img src="${item.ImageUrl}" alt="${item.Title}">
            </div>
            <div class="news-content">
                <h3>${item.Title}</h3>
                <div class="news-info">
                    <span class="news-date"><i class="fas fa-calendar"></i> ${formattedDate}</span>
                    <span class="news-author"><i class="fas fa-user"></i> ${item.Author}</span>
                    ${item.Category ? `<span class="news-category"><i class="fas fa-folder"></i> ${item.Category.Name}</span>` : ''}
                </div>
                <p class="news-summary">${item.Content.substring(0, 150)}...</p>
                <a href="news-detail.html?id=${item.Id}" class="btn">Đọc tiếp</a>
            </div>
        `;
        
        return newsBox;
    }
    
    // Tạo phân trang
    function createPagination(currentPage, totalPages) {
        const paginationElement = document.createElement('div');
        paginationElement.className = 'pagination';
        
        // Tạo nút Previous
        if (currentPage > 1) {
            const prevButton = document.createElement('a');
            prevButton.href = '#';
            prevButton.innerHTML = '<i class="fas fa-chevron-left"></i> Trước';
            prevButton.className = 'pagination-button prev';
            prevButton.addEventListener('click', e => {
                e.preventDefault();
                loadNewsList(currentPage - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                updateURL(currentPage - 1);
            });
            paginationElement.appendChild(prevButton);
        }
        
        // Tạo các nút số trang
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        // Điều chỉnh startPage nếu endPage đã đạt tối đa
        if (endPage === totalPages) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        // Hiển thị nút trang đầu nếu startPage > 1
        if (startPage > 1) {
            const firstPage = document.createElement('a');
            firstPage.href = '#';
            firstPage.textContent = '1';
            firstPage.addEventListener('click', e => {
                e.preventDefault();
                loadNewsList(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                updateURL(1);
            });
            paginationElement.appendChild(firstPage);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'ellipsis';
                ellipsis.textContent = '...';
                paginationElement.appendChild(ellipsis);
            }
        }
        
        // Tạo các nút số trang
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('a');
            pageButton.href = '#';
            pageButton.textContent = i.toString();
            
            if (i === currentPage) {
                pageButton.className = 'active';
            }
            
            pageButton.addEventListener('click', e => {
                e.preventDefault();
                if (i !== currentPage) {
                    loadNewsList(i);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    updateURL(i);
                }
            });
            
            paginationElement.appendChild(pageButton);
        }
        
        // Hiển thị nút trang cuối nếu endPage < totalPages
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'ellipsis';
                ellipsis.textContent = '...';
                paginationElement.appendChild(ellipsis);
            }
            
            const lastPage = document.createElement('a');
            lastPage.href = '#';
            lastPage.textContent = totalPages.toString();
            lastPage.addEventListener('click', e => {
                e.preventDefault();
                loadNewsList(totalPages);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                updateURL(totalPages);
            });
            paginationElement.appendChild(lastPage);
        }
        
        // Tạo nút Next
        if (currentPage < totalPages) {
            const nextButton = document.createElement('a');
            nextButton.href = '#';
            nextButton.innerHTML = 'Tiếp <i class="fas fa-chevron-right"></i>';
            nextButton.className = 'pagination-button next';
            nextButton.addEventListener('click', e => {
                e.preventDefault();
                loadNewsList(currentPage + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                updateURL(currentPage + 1);
            });
            paginationElement.appendChild(nextButton);
        }
        
        return paginationElement;
    }
    
    // Cập nhật URL với tham số trang
    function updateURL(page) {
        const url = new URL(window.location.href);
        url.searchParams.set('page', page);
        window.history.pushState({ page: page }, '', url);
    }
    
    // Thiết lập bộ lọc danh mục
    function setupCategoryFilter() {
        const categoryFilter = document.querySelector('#category-filter');
        if (!categoryFilter) return;
        
        // Lấy danh sách danh mục từ API
        fetch(`${API_URL}/api/categories`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Không thể kết nối đến máy chủ');
                }
                return response.json();
            })
            .then(data => {
                // Xóa loading
                categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>';
                
                // Thêm các tùy chọn danh mục
                if (data && data.length > 0) {
                    data.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category.id;
                        option.textContent = category.name;
                        categoryFilter.appendChild(option);
                    });
                }
                
                // Xử lý sự kiện thay đổi danh mục
                categoryFilter.addEventListener('change', () => {
                    const selectedCategory = categoryFilter.value;
                    loadNewsList(1, selectedCategory);
                    updateURL(1);
                });
            })
            .catch(error => {
                console.error('Lỗi khi tải danh mục tin tức:', error);
                categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>';
            });
    }
    
    // API công khai
    return {
        init: init,
        loadNewsList: loadNewsList
    };
})();

// Khởi tạo module khi trang đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    NewsList.init();
}); 