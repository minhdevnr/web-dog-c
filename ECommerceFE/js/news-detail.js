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
        
        // Xử lý form đăng ký nhận tin
        initNewsletterForm();
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
        
        // Demo sử dụng dữ liệu mẫu
        // Trong thực tế, bạn sẽ gọi API, tôi sẽ viết code giả cho việc gọi API
        setTimeout(() => {
            // Giả lập dữ liệu
            const demoData = {
                Id: newsId,
                Title: "Khám phá hành trình của cà phê từ hạt đến tách",
                Author: "Minh Nguyễn",
                CreatedAt: new Date().toISOString(),
                Category: { Id: 1, Name: "Kiến thức cà phê" },
                ViewCount: 125,
                ImageUrl: "img/coffee-2225564_960_720.jpg",
                Content: `
                <p>Cà phê, thức uống được yêu thích trên toàn thế giới, có một hành trình dài và kỳ diệu từ khi còn là hạt cà phê xanh đến khi trở thành tách cà phê thơm ngon trên bàn của bạn. Hãy cùng LH Coffee khám phá hành trình thú vị này!</p>

                <h2>Nguồn gốc của hạt cà phê</h2>
                <p>Hạt cà phê được thu hoạch từ cây cà phê, thuộc chi Coffea. Hai loại cà phê được trồng phổ biến nhất là Arabica và Robusta. Việt Nam là một trong những quốc gia sản xuất cà phê hàng đầu thế giới, đặc biệt là cà phê Robusta, với vùng trồng chính ở Tây Nguyên.</p>

                <blockquote>Tại Việt Nam, cà phê được du nhập vào năm 1857 bởi người Pháp. Kể từ đó, cây cà phê đã trở thành một phần không thể thiếu trong nền kinh tế và văn hóa của người Việt.</blockquote>

                <h2>Quá trình thu hoạch</h2>
                <p>Quả cà phê khi chín sẽ có màu đỏ hoặc vàng tùy thuộc vào giống. Việc thu hoạch cà phê thường được thực hiện bằng hai phương pháp: thu hái chọn lọc (chỉ hái những quả chín) hoặc thu hoạch đồng loạt (hái tất cả quả trên cây).</p>
                
                <p>Sau khi thu hoạch, quả cà phê sẽ trải qua các bước sơ chế để lấy ra hạt cà phê xanh bên trong. Có hai phương pháp sơ chế chính:</p>
                
                <ul>
                    <li><strong>Phương pháp khô:</strong> Quả cà phê được phơi nắng hoặc sấy khô, sau đó xay để tách vỏ và lấy hạt.</li>
                    <li><strong>Phương pháp ướt:</strong> Quả cà phê được ngâm nước, tách vỏ, lên men, rửa và phơi khô để lấy hạt.</li>
                </ul>

                <h2>Nghệ thuật rang cà phê</h2>
                <p>Rang cà phê là một trong những công đoạn quan trọng nhất, quyết định đến hương vị của tách cà phê. Khi rang, hạt cà phê sẽ trải qua nhiều biến đổi về hóa học và vật lý, tạo ra các hợp chất tạo hương và vị đặc trưng.</p>
                
                <p>Có nhiều mức độ rang khác nhau, từ rang nhẹ (light roast) đến rang đậm (dark roast), mỗi mức độ sẽ mang lại những đặc tính khác nhau cho cà phê:</p>
                
                <ul>
                    <li><strong>Rang nhẹ:</strong> Giữ được nhiều hương vị nguyên bản của hạt cà phê, thường có vị chua và hương hoa quả.</li>
                    <li><strong>Rang vừa:</strong> Cân bằng giữa vị chua và đắng, hương vị phong phú.</li>
                    <li><strong>Rang đậm:</strong> Vị đắng mạnh, hương vị mạnh mẽ, ít vị chua.</li>
                </ul>

                <h2>Phương pháp pha chế cà phê</h2>
                <p>Có rất nhiều phương pháp pha chế cà phê khác nhau trên thế giới, mỗi phương pháp sẽ mang lại trải nghiệm và hương vị khác nhau:</p>
                
                <ul>
                    <li><strong>Phin cà phê:</strong> Phương pháp truyền thống của Việt Nam, sử dụng bộ lọc kim loại, cho ra cà phê đậm đà, đắng sâu.</li>
                    <li><strong>Espresso:</strong> Sử dụng áp suất cao để ép nước qua bột cà phê nén, tạo ra cà phê cô đặc với lớp crema trên bề mặt.</li>
                    <li><strong>Pour over:</strong> Phương pháp rót nước từ từ qua bột cà phê đặt trong phễu lọc, cho ra cà phê trong và hương vị tinh tế.</li>
                    <li><strong>French Press:</strong> Ngâm bột cà phê trong nước nóng, sau đó ép xuống để tách bã, cho ra cà phê đậm đà với nhiều dầu cà phê.</li>
                    <li><strong>Cold Brew:</strong> Ngâm bột cà phê trong nước lạnh từ 12-24 giờ, cho ra cà phê ít đắng, ít acid và mát lạnh.</li>
                </ul>

                <blockquote>Mỗi tách cà phê là một tác phẩm nghệ thuật, được tạo ra từ sự kết hợp hoàn hảo giữa nguồn gốc hạt cà phê, cách rang và phương pháp pha chế.</blockquote>

                <h2>LH Coffee - Từ nông trại đến tách cà phê của bạn</h2>
                <p>Tại LH Coffee, chúng tôi tự hào mang đến những sản phẩm cà phê chất lượng cao, được tuyển chọn kỹ lưỡng từ những vùng trồng cà phê nổi tiếng của Việt Nam. Chúng tôi kiểm soát chặt chẽ mọi công đoạn từ thu hoạch, sơ chế, rang xay đến pha chế, đảm bảo mỗi tách cà phê đều mang hương vị tuyệt vời nhất.</p>
                
                <p>Hãy ghé thăm cửa hàng của chúng tôi để trải nghiệm hương vị cà phê đích thực và tìm hiểu thêm về hành trình kỳ diệu từ hạt đến tách cà phê!</p>
                `
            };

            // Xử lý dữ liệu như thật
            handleNewsData(demoData);
        }, 1500);
    }

    // Xử lý dữ liệu tin tức
    function handleNewsData(data) {
        // Lưu tin tức hiện tại
        currentNews = data;
        
        const newsDetailContainer = document.querySelector('#news-detail-container');
        if (!newsDetailContainer) return;
        
        // Cập nhật tiêu đề trang
        document.title = `${data.Title} - LH Coffee`;
        
        // Cập nhật SEO description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', data.Summary || data.Title);
        }
        
        // Cập nhật breadcrumb
        updateBreadcrumb(data);
        
        // Cập nhật hero banner
        updateHeroBanner(data);
        
        // Cập nhật thông tin tác giả
        updateAuthorInfo(data);
        
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
                <a href="#" class="btn" id="share-news-btn"><i class="fas fa-share-alt"></i> Chia sẻ</a>
            </div>
        `;
        
        // Xử lý sự kiện nút chia sẻ
        const shareButton = document.getElementById('share-news-btn');
        if (shareButton) {
            shareButton.addEventListener('click', function(e) {
                e.preventDefault();
                const shareSection = document.querySelector('.author-share-section');
                if (shareSection) {
                    shareSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
        
        // Tải các tin tức liên quan
        loadRelatedNews(data.CategoryId || 0, data.Id);
        
        // Tăng cường hình ảnh và trải nghiệm người dùng
        enhanceUserExperience();
    }
    
    // Cập nhật breadcrumb
    function updateBreadcrumb(newsData) {
        const breadcrumbItem = document.querySelector('.breadcrumb-item.active');
        if (breadcrumbItem && newsData) {
            breadcrumbItem.textContent = newsData.Title;
        }
        
        // Nếu có category, thêm vào breadcrumb
        if (newsData.Category) {
            const breadcrumb = document.querySelector('.breadcrumb');
            const categoryItem = document.createElement('li');
            categoryItem.className = 'breadcrumb-item';
            categoryItem.innerHTML = `<a href="index-blog.html?category=${newsData.Category.Id}">${newsData.Category.Name}</a>`;
            
            const activeItem = breadcrumb.querySelector('.active');
            if (activeItem && breadcrumb) {
                breadcrumb.insertBefore(categoryItem, activeItem);
            }
        }
    }
    
    // Cập nhật hero banner
    function updateHeroBanner(newsData) {
        const heroElement = document.getElementById('news-hero');
        const heroTitle = document.querySelector('.hero-title');
        
        if (heroElement && newsData) {
            // Cập nhật tiêu đề hero
            if (heroTitle) {
                heroTitle.textContent = newsData.Title;
            }
            
            // Cập nhật hình nền hero
            if (newsData.ImageUrl) {
                heroElement.style.backgroundImage = `url(${newsData.ImageUrl})`;
            }
        }
    }
    
    // Cập nhật thông tin tác giả
    function updateAuthorInfo(newsData) {
        const authorName = document.getElementById('author-name');
        const authorBio = document.getElementById('author-bio');
        const authorImage = document.getElementById('author-image');
        
        if (authorName && newsData) {
            authorName.textContent = newsData.Author || 'Biên tập viên';
        }
        
        if (authorBio) {
            // Thông tin mẫu về tác giả
            authorBio.textContent = `Chuyên gia về cà phê với hơn 5 năm kinh nghiệm trong ngành. Yêu thích chia sẻ kiến thức và trải nghiệm về cà phê.`;
        }
        
        // Có thể cập nhật hình ảnh tác giả nếu có
        if (authorImage && newsData.Author) {
            // Trong thực tế, bạn sẽ lấy ảnh tác giả từ API
            // Ở đây chúng ta sẽ sử dụng ảnh mẫu
            authorImage.src = "img/review-1.jpg";
        }
    }
    
    // Tải tin tức liên quan
    function loadRelatedNews(categoryId, currentNewsId) {
        const relatedNewsContainer = document.querySelector('#related-news-container');
        if (!relatedNewsContainer) return;
        
        // Hiển thị loading
        relatedNewsContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        
        // Demo sử dụng dữ liệu mẫu
        setTimeout(() => {
            // Dữ liệu mẫu cho tin tức liên quan
            const demoRelatedNews = [
                {
                    Id: '2',
                    Title: 'Nghệ thuật thưởng thức cà phê như một barista chuyên nghiệp',
                    Author: 'Thu Hà',
                    CreatedAt: new Date().toISOString(),
                    ImageUrl: 'img/coffee-2225564_960_720.jpg',
                    Summary: 'Khám phá những bí quyết để thưởng thức cà phê như một barista chuyên nghiệp, từ cách nhận biết hương vị đến kỹ thuật nếm...'
                },
                {
                    Id: '3',
                    Title: 'Top 5 loại cà phê đặc sản được yêu thích nhất tại Việt Nam',
                    Author: 'Quang Minh',
                    CreatedAt: new Date().toISOString(),
                    ImageUrl: 'img/review-1.jpg',
                    Summary: 'Cùng khám phá 5 loại cà phê đặc sản được ưa chuộng nhất tại Việt Nam, từ cà phê Chồn đến cà phê Moka Cầu Đất...'
                },
                {
                    Id: '4',
                    Title: 'Văn hóa cà phê Việt Nam: Từ phin truyền thống đến xu hướng hiện đại',
                    Author: 'Thanh Tùng',
                    CreatedAt: new Date().toISOString(),
                    ImageUrl: 'img/review-2.jpg',
                    Summary: 'Hành trình phát triển của văn hóa cà phê Việt Nam, từ cà phê phin truyền thống đến những xu hướng hiện đại như specialty coffee...'
                }
            ];
            
            // Lọc bỏ tin tức hiện tại 
            const relatedNews = demoRelatedNews.filter(item => item.Id !== currentNewsId);
            
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
                    newsBox.setAttribute('data-aos', 'fade-up');
                    newsBox.setAttribute('data-aos-delay', '100');
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
                            <p>${item.Summary}</p>
                            <a href="news-detail.html?id=${item.Id}" class="btn">Đọc tiếp <i class="fas fa-arrow-right"></i></a>
                        </div>
                    `;
                    relatedNewsContainer.appendChild(newsBox);
                });
                
                // Refresh AOS animations
                if (typeof AOS !== 'undefined') {
                    AOS.refresh();
                }
            } else {
                relatedNewsContainer.innerHTML = '<div class="no-news">Không có tin tức liên quan</div>';
            }
        }, 2000);
    }
    
    // Xử lý form đăng ký nhận tin
    function initNewsletterForm() {
        const newsletterForm = document.querySelector('.newsletter-form');
        if (!newsletterForm) return;
        
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!email) {
                showNotification('Vui lòng nhập địa chỉ email', 'error');
                return;
            }
            
            // Giả lập gửi dữ liệu đăng ký
            // Trong thực tế, bạn sẽ gửi dữ liệu này đến API
            setTimeout(() => {
                showNotification('Đăng ký nhận tin thành công!', 'success');
                emailInput.value = '';
            }, 1000);
        });
    }
    
    // Tăng cường trải nghiệm người dùng
    function enhanceUserExperience() {
        // Thêm các hiệu ứng hover cho hình ảnh
        const contentImages = document.querySelectorAll('.news-content img');
        if (contentImages.length > 0) {
            contentImages.forEach(img => {
                // Wrap ảnh trong div để tạo hiệu ứng
                const wrapper = document.createElement('div');
                wrapper.className = 'content-image-wrapper';
                img.parentNode.insertBefore(wrapper, img);
                wrapper.appendChild(img);
                
                // Thêm hiệu ứng zoom khi hover
                img.style.transition = 'transform 0.5s ease';
                wrapper.style.overflow = 'hidden';
                wrapper.style.borderRadius = '1rem';
                wrapper.style.marginBottom = '2.5rem';
                wrapper.style.marginTop = '2.5rem';
                wrapper.style.boxShadow = '0 1rem 2rem rgba(0, 0, 0, 0.15)';
                
                wrapper.addEventListener('mouseenter', () => {
                    img.style.transform = 'scale(1.03)';
                });
                
                wrapper.addEventListener('mouseleave', () => {
                    img.style.transform = 'scale(1)';
                });
            });
        }
        
        // Làm nổi bật các blockquote
        const blockquotes = document.querySelectorAll('.news-content blockquote');
        if (blockquotes.length > 0) {
            blockquotes.forEach(quote => {
                quote.style.transition = 'all 0.3s ease';
                
                quote.addEventListener('mouseenter', () => {
                    quote.style.transform = 'translateX(5px)';
                    quote.style.borderLeftWidth = '6px';
                    quote.style.background = 'rgba(190, 156, 121, 0.15)';
                });
                
                quote.addEventListener('mouseleave', () => {
                    quote.style.transform = 'translateX(0)';
                    quote.style.borderLeftWidth = '4px';
                    quote.style.background = 'rgba(190, 156, 121, 0.1)';
                });
            });
        }
    }
    
    // Hiển thị thông báo
    function showNotification(message, type = 'info') {
        // Kiểm tra xem module UI có tồn tại không
        if (typeof UI !== 'undefined' && typeof UI.showNotification === 'function') {
            UI.showNotification(message, type);
        } else {
            alert(message);
        }
    }
    
    // Hàm loại bỏ HTML tags
    function stripHTML(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
    
    // Lấy URL API
    function getApiUrl() {
        return API_URL;
    }
    
    // Lấy thông tin tin tức hiện tại
    function getCurrentNews() {
        return currentNews;
    }
    
    // Tiết lộ các API công khai
    return {
        init,
        getApiUrl,
        getCurrentNews
    };
})();

// Khởi tạo module khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    NewsDetail.init();
}); 