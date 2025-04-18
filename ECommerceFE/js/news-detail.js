/**
 * news-detail.js - Xử lý trang chi tiết tin tức
 */

// Mảng dữ liệu tin tức mẫu (sẽ thay thế bằng API sau)
const newsData = [
    {
        id: 1,
        title: 'Cách nhận biết cà phê nguyên chất',
        image: 'img/blog-1.jpg',
        content: `<p>Cà phê nguyên chất là loại cà phê được chế biến từ hạt cà phê 100% không pha trộn tạp chất. Cà phê nguyên chất khi uống sẽ có hương thơm đặc trưng, vị đắng thanh và hậu vị ngọt nhẹ.</p>
                  <h2>Màu sắc</h2>
                  <p>Cà phê nguyên chất có màu nâu sẫm, đều màu. Nếu thấy cà phê có màu đen quá hoặc có ánh bóng lạ, rất có thể đã bị pha trộn tạp chất.</p>
                  <h2>Mùi hương</h2>
                  <p>Cà phê nguyên chất có mùi thơm đặc trưng của hạt cà phê rang. Nếu ngửi thấy mùi khét, mùi hóa chất hoặc mùi lạ khác, có thể cà phê đã bị pha trộn.</p>
                  <h2>Bọt</h2>
                  <p>Khi pha, cà phê nguyên chất tạo ra lớp bọt màu nâu đỏ, mịn và tan chậm. Ngược lại, cà phê pha tạp chất thường tạo bọt to, tan nhanh hoặc không có bọt.</p>`,
        date: '2023-05-15',
        author: 'Nguyễn Văn A'
    },
    {
        id: 2,
        title: 'Lợi ích sức khỏe từ việc uống cà phê',
        image: 'img/blog-2.jpg',
        content: `<p>Cà phê không chỉ là thức uống yêu thích mà còn mang lại nhiều lợi ích cho sức khỏe khi sử dụng đúng cách và đúng liều lượng.</p>
                  <h2>Tăng cường tỉnh táo và cải thiện tâm trạng</h2>
                  <p>Caffeine trong cà phê kích thích hệ thần kinh trung ương, giúp tăng sự tỉnh táo, cải thiện tâm trạng và các chức năng não như trí nhớ, cảnh giác, thời gian phản ứng và khả năng tập trung.</p>
                  <h2>Giảm nguy cơ mắc bệnh Parkinson và Alzheimer</h2>
                  <p>Nghiên cứu cho thấy những người uống cà phê có nguy cơ mắc bệnh Parkinson thấp hơn 32-60%. Ngoài ra, cà phê còn có thể giúp phòng ngừa bệnh Alzheimer và sa sút trí tuệ.</p>
                  <h2>Hỗ trợ giảm cân</h2>
                  <p>Caffeine là một trong số ít chất tự nhiên được chứng minh có thể hỗ trợ đốt cháy chất béo. Một số nghiên cứu cho thấy caffeine có thể tăng tốc độ trao đổi chất lên 3-11%.</p>`,
        date: '2023-06-20',
        author: 'Trần Thị B'
    },
    {
        id: 3,
        title: 'Cách pha cà phê phin hoàn hảo',
        image: 'img/blog-3.jpg',
        content: `<p>Cà phê phin là phương pháp pha truyền thống của Việt Nam, tạo ra hương vị đậm đà, đặc trưng mà nhiều người yêu thích.</p>
                  <h2>Chuẩn bị dụng cụ</h2>
                  <p>Để pha cà phê phin, bạn cần: Phin cà phê (gồm 4 phần: đế, thân, nắp đè và nắp đậy), cà phê xay nhuyễn, nước nóng 92-96°C và tách/ly đựng.</p>
                  <h2>Các bước pha cà phê phin</h2>
                  <ul>
                    <li>Làm nóng phin bằng cách đổ nước sôi vào và đổ đi</li>
                    <li>Cho 15-20g cà phê xay vào phin</li>
                    <li>Đặt nắp đè lên trên cà phê và ấn nhẹ</li>
                    <li>Đổ một ít nước nóng (khoảng 20ml) để cà phê nở đều (bloom)</li>
                    <li>Sau 30 giây, đổ đầy nước vào phin (khoảng 100-120ml)</li>
                    <li>Đậy nắp và chờ nước nhỏ giọt qua cà phê (khoảng 3-5 phút)</li>
                  </ul>
                  <h2>Mẹo pha cà phê ngon</h2>
                  <p>Để có tách cà phê phin ngon, bạn nên dùng cà phê mới xay, kiểm soát nhiệt độ nước và thời gian pha. Tốc độ nhỏ giọt lý tưởng là 1 giọt/giây.</p>`,
        date: '2023-07-10',
        author: 'Lê Văn C'
    }
];

// Khởi tạo khi trang đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Lấy ID tin tức từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = parseInt(urlParams.get('id'));

    // Tải chi tiết tin tức
    loadNewsDetail(newsId);

    // Tải tin tức liên quan
    loadRelatedNews(newsId);
});

/**
 * Tải chi tiết tin tức theo ID
 * @param {number} newsId - ID của tin tức cần hiển thị
 */
function loadNewsDetail(newsId) {
    const detailContainer = document.getElementById('news-detail-container');
    
    // Kiểm tra container có tồn tại
    if (!detailContainer) return;

    // Tìm tin tức theo ID
    const newsItem = newsData.find(item => item.id === newsId);
    
    // Nếu không tìm thấy, hiển thị thông báo lỗi
    if (!newsItem) {
        detailContainer.innerHTML = `
            <div class="error-message">
                <h3>Không tìm thấy tin tức!</h3>
                <p>Tin tức bạn đang tìm kiếm không tồn tại.</p>
                <a href="index.html#news" class="btn">Quay lại trang tin tức</a>
            </div>
        `;
        return;
    }

    // Định dạng ngày tháng
    const date = new Date(newsItem.date);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    // Hiển thị chi tiết tin tức
    detailContainer.innerHTML = `
        <h1 class="news-title">${newsItem.title}</h1>
        <div class="news-meta">
            <span><i class="fas fa-user"></i> ${newsItem.author}</span>
            <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
        </div>
        <div class="news-image">
            <img src="${newsItem.image}" alt="${newsItem.title}">
        </div>
        <div class="news-content">
            ${newsItem.content}
        </div>
    `;
}

/**
 * Tải tin tức liên quan (loại trừ tin tức hiện tại)
 * @param {number} currentNewsId - ID của tin tức hiện tại
 */
function loadRelatedNews(currentNewsId) {
    const relatedContainer = document.getElementById('related-news-container');
    
    // Kiểm tra container có tồn tại
    if (!relatedContainer) return;

    // Lọc tin tức liên quan (trừ tin tức hiện tại)
    const relatedNews = newsData.filter(item => item.id !== currentNewsId);

    // Nếu không có tin tức liên quan, ẩn section
    if (relatedNews.length === 0) {
        document.getElementById('related-news').style.display = 'none';
        return;
    }

    // Xóa nội dung cũ
    relatedContainer.innerHTML = '';

    // Hiển thị tối đa 3 tin tức liên quan
    relatedNews.slice(0, 3).forEach(item => {
        // Định dạng ngày tháng
        const date = new Date(item.date);
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

        // Tạo phần tử tin tức
        const newsBox = document.createElement('div');
        newsBox.classList.add('news-box');
        
        // HTML cho tin tức liên quan
        newsBox.innerHTML = `
            <div class="news-image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="news-content">
                <h3>${item.title}</h3>
                <div class="news-info">
                    <span class="news-date"><i class="fas fa-calendar"></i> ${formattedDate}</span>
                    <span class="news-author"><i class="fas fa-user"></i> ${item.author}</span>
                </div>
                <p class="news-summary">${item.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 100)}...</p>
                <a href="news-detail.html?id=${item.id}" class="btn">Đọc tiếp</a>
            </div>
        `;

        relatedContainer.appendChild(newsBox);
    });
} 