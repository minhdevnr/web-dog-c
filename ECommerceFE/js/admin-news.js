class AdminNewsManager {
    constructor() {
        this.API_BASE = {
            NEWS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NEWS}`,
            CATEGORIES: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`
        };
        
        // Đảm bảo TinyMCE được tải trước khi khởi tạo
        this.checkTinyMCE();
        
        this.initializeEventListeners();
        this.loadNews();
        this.loadCategories();
    }
    
    checkTinyMCE() {
        // Kiểm tra xem TinyMCE đã được tải chưa
        const maxAttempts = 10;
        let attempts = 0;
        
        const initializeTinyMCEWhenReady = () => {
            if (typeof tinymce !== 'undefined') {
                this.initializeTinyMCE();
                return;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
                console.log(`Đang chờ TinyMCE (${attempts}/${maxAttempts})...`);
                setTimeout(initializeTinyMCEWhenReady, 500);
            } else {
                console.error('Không thể tải TinyMCE sau nhiều lần thử');
            }
        };
        
        // Bắt đầu kiểm tra
        initializeTinyMCEWhenReady();
    }

    initializeEventListeners() {
        // Add news button
        $('#addNewsBtn').click(() => this.openNewsModal());

        // Save news button
        $('#saveNewsBtn').click(() => this.saveNews());

        // Search and filter
        $('#searchNews').on('input', () => this.filterNews());
        $('#categoryFilter').change(() => this.filterNews());
        $('#statusFilter').change(() => this.filterNews());

        // Image preview
        $('#image').change((e) => this.handleImagePreview(e));

        // News detail
        $(document).on('click', '.view-news', (e) => this.viewNewsDetail(e));
        $(document).on('click', '.edit-news', (e) => this.editNewsFromTable(e));
        $(document).on('click', '.delete-news', (e) => this.confirmDeleteNews(e));
        
        $('#editNewsBtn').click(() => this.editFromDetail());
        $('#deleteNewsBtn').click(() => this.deleteFromDetail());
        $('#confirmDeleteBtn').click(() => this.deleteNews());
    }

    initializeTinyMCE() {
        tinymce.init({
            selector: '#content',
            height: 400,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
                'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | formatselect | ' +
                'bold italic backcolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
            content_style: 'body { font-family:Inter,Arial,sans-serif; font-size:16px }',
            promotion: false // Loại bỏ thông báo về API key
        });
    }

    async loadNews() {
        
        try {
            const response = await fetch(`${this.API_BASE.NEWS}`);
            const news = await response.json();
            this.displayNews(news);
        } catch (error) {
            this.showToast('Lỗi khi tải danh sách tin tức', 'error');
        }
    }

    async loadCategories() {
        try {
            const response = await fetch(`${this.API_BASE.CATEGORIES}`);
            const categories = await response.json();
            const categorySelects = $('#category, #categoryFilter');
            categorySelects.empty().append('<option value="">Chọn danh mục</option>');
            categories.Items.forEach(category => {
                categorySelects.append(`<option value="${category.Id}">${category.Name}</option>`);
            });
        } catch (error) {
            this.showToast('Lỗi khi tải danh sách danh mục', 'error');
        }
    }

    displayNews(news) {
        
        const tbody = $('#newsTable');
        tbody.empty();
        
        // Kiểm tra xem có dữ liệu trả về từ API không
        if (!news || !news.Items || !Array.isArray(news.Items) || news.Items.length === 0) {
            tbody.append(`
                <tr>
                    <td colspan="7" class="text-center">Không có tin tức nào</td>
                </tr>
            `);
            return;
        }
        
        news.Items.forEach(item => {
            // Xử lý cả tên thuộc tính Pascal Case (Id) và camelCase (id)
            const id = item.Id || item.id;
            const title = item.Title || item.title;
            const status = item.Status || item.status;
            const createdAt = item.CreatedAt || item.createdAt;
            
            // Xử lý imageUrl có thể là ImageUrl hoặc imageUrl hoặc image
            const imageUrl = item.ImageUrl || item.imageUrl || item.image || '../images/default-news.jpg';
            
            // Xử lý category có thể là object hoặc là id
            let categoryName = 'Không xác định';
            if (item.Category) {
                categoryName = item.Category.Name || item.Category.name;
            } else if (item.category) {
                categoryName = item.category.Name || item.category.name;
            }
            
            const row = `
                <tr>
                    <td>${id}</td>
                    <td>
                        <img src="${imageUrl}" class="news-image" alt="${title}">
                    </td>
                    <td>${title}</td>
                    <td>${categoryName}</td>
                    <td><span class="badge bg-${status === 'Published' ? 'success' : 'warning'}">${this.getStatusLabel(status)}</span></td>
                    <td>${this.formatDate(createdAt)}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-news" data-id="${id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary edit-news" data-id="${id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-news" data-id="${id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });
    }

    getStatusLabel(status) {
        const labels = {
            'Published': 'Đã xuất bản',
            'Draft': 'Nháp'
        };
        return labels[status] || status;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    handleImagePreview(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                $('#imagePreview').html(`<img src="${e.target.result}" class="img-thumbnail" style="max-height: 200px;">`);
            };
            reader.readAsDataURL(file);
        }
    }

    openNewsModal(news = null) {
        debugger;
        const modal = $('#newsModal');
        const form = $('#newsForm')[0];
        form.reset();
        $('#imagePreview').empty();
        
        // Kiểm tra nếu TinyMCE đã được khởi tạo
        try {
            const editor = tinymce.get('content');
            if (editor) {
                editor.setContent('');
            }
        } catch (error) {
            console.error('TinyMCE chưa được khởi tạo:', error);
            // Khởi tạo lại TinyMCE nếu cần
            this.initializeTinyMCE();
        }

        if (news) {
            $('#newsModalTitle').text('Sửa Tin tức');
            $('#newsId').val(news.id);
            $('#title').val(news.title);
            
            // Xử lý categoryId có thể là string hoặc number
            const categoryId = String(news.categoryId || '');
            $('#category').val(categoryId);
            
            // Kiểm tra lại TinyMCE trước khi thiết lập nội dung
            try {
                const editor = tinymce.get('content');
                if (editor) {
                    editor.setContent(news.content || '');
                }
            } catch (error) {
                console.error('Không thể thiết lập nội dung TinyMCE:', error);
                setTimeout(() => {
                    try {
                        tinymce.get('content').setContent(news.content || '');
                    } catch (e) {}
                }, 500);
            }
            
            $('#status').val(news.status || 'Published');
            
            // Hiển thị ảnh nếu có
            if (news.image) {
                $('#imagePreview').html(`<img src="${news.image}" class="img-thumbnail" style="max-height: 200px;">`);
            }
        } else {
            $('#newsModalTitle').text('Thêm Tin tức');
            $('#newsId').val('');
            $('#status').val('Published'); // Mặc định là Published
        }

        modal.modal('show');
    }

    async saveNews() {
        // Kiểm tra dữ liệu thủ công thay vì dùng form.checkValidity()
        const title = $('#title').val().trim();
        const categoryId = $('#category').val();
        const status = $('#status').val();
        
        // Mảng chứa các lỗi validation
        const errors = [];
        
        // Kiểm tra từng trường
        if (!title) {
            errors.push('Tiêu đề không được để trống');
            $('#title').addClass('is-invalid');
        } else if (title.length > 200) {
            errors.push('Tiêu đề không được vượt quá 200 ký tự');
            $('#title').addClass('is-invalid');
        } else {
            $('#title').removeClass('is-invalid');
        }
        
        if (!categoryId) {
            errors.push('Vui lòng chọn danh mục');
            $('#category').addClass('is-invalid');
        } else {
            $('#category').removeClass('is-invalid');
        }
        
        // Kiểm tra trạng thái
        if (!status || !['Published', 'Draft'].includes(status)) {
            errors.push('Trạng thái phải là "Published" hoặc "Draft"');
            $('#status').addClass('is-invalid');
        } else {
            $('#status').removeClass('is-invalid');
        }
        
        // Kiểm tra nếu TinyMCE có nội dung
        let content = '';
        try {
            const editor = tinymce.get('content');
            if (editor) {
                content = editor.getContent();
                if (!content || content.trim() === '') {
                    errors.push('Nội dung không được để trống');
                    $(editor.getContainer()).addClass('border border-danger');
                } else {
                    $(editor.getContainer()).removeClass('border border-danger');
                }
            } else {
                content = $('#content').val();
                if (!content || content.trim() === '') {
                    errors.push('Nội dung không được để trống');
                    $('#content').addClass('is-invalid');
                } else {
                    $('#content').removeClass('is-invalid');
                }
            }
        } catch (error) {
            console.error('Lỗi khi lấy nội dung từ TinyMCE:', error);
            content = $('#content').val();
        }
        
        // Hiển thị thông báo lỗi nếu có
        if (errors.length > 0) {
            this.showToast(errors.join('<br>'), 'error');
            return;
        }

        // Lấy các giá trị khác từ form
        const newsId = $('#newsId').val();
        const imageFile = $('#image')[0].files[0];
        
        // Tạo NewsRequest object để gửi lên server (dùng FormData cho upload file)
        const formData = new FormData();
        
        // Thêm ID nếu đang cập nhật tin tức
        if (newsId) {
            formData.append('Id', newsId);
        }
        
        // Thêm các trường chính theo đúng format của NewsRequest
        formData.append('Title', title);
        formData.append('Content', content);
        formData.append('CategoryId', categoryId);
        formData.append('Status', status);
        formData.append('Author', 'Admin'); // Mặc định là Admin
        
        // Thêm ảnh nếu có
        if (imageFile) {
            formData.append('Image', imageFile);
        }

        // Console log để debug
        console.log('Đang gửi dữ liệu:');
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
        }

        try {
            const url = newsId ? `${this.API_BASE.NEWS}/${newsId}` : this.API_BASE.NEWS;
            const method = newsId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Lỗi từ server:', errorText);
                throw new Error(`Lỗi khi lưu tin tức: ${response.status} ${response.statusText}`);
            }

            $('#newsModal').modal('hide');
            this.loadNews();
            this.showToast('Lưu tin tức thành công', 'success');
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    async viewNewsDetail(event) {
        const newsId = $(event.currentTarget).data('id');
        try {
            const response = await fetch(`${this.API_BASE.NEWS}/${newsId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const news = await response.json();
            
            // Xử lý cả tên thuộc tính Pascal Case và camelCase
            const title = news.Title || news.title;
            const content = news.Content || news.content;
            const status = news.Status || news.status;
            const createdAt = news.CreatedAt || news.createdAt;
            
            // Xử lý đường dẫn hình ảnh
            const imageUrl = news.ImageUrl || news.imageUrl || news.image || '../images/default-news.jpg';
            
            // Xử lý thông tin danh mục
            let categoryName = 'Không xác định';
            if (news.Category) {
                categoryName = news.Category.Name || news.Category.name;
            } else if (news.category) {
                categoryName = news.category.Name || news.category.name;
            }
            
            // Lưu ID để sử dụng khi sửa/xóa
            $('#newsId').val(news.Id || news.id);
            
            // Hiển thị thông tin
            $('#detailImage').attr('src', imageUrl);
            $('#detailTitle').text(title);
            $('#detailCategory').text(categoryName);
            $('#detailStatus').html(`<span class="badge bg-${status === 'Published' ? 'success' : 'warning'}">${this.getStatusLabel(status)}</span>`);
            $('#detailDate').text(this.formatDate(createdAt));
            $('#detailContent').html(content);

            $('#newsDetailModal').modal('show');    
        } catch (error) {
            console.error('Lỗi khi tải chi tiết tin tức:', error);
            this.showToast('Lỗi khi tải thông tin tin tức: ' + error.message, 'error');
        }
    }

    async editNewsFromTable(event) {
        const newsId = $(event.currentTarget).data('id');
        try {
            const response = await fetch(`${this.API_BASE.NEWS}/${newsId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const news = await response.json();
            
            // Chuẩn bị dữ liệu cho form
            const newsData = {
                id: news.Id || news.id,
                title: news.Title || news.title,
                content: news.Content || news.content,
                categoryId: news.Category.Id || news.categoryId,
                status: news.Status || news.status,
                image: news.ImageUrl || news.imageUrl || news.image
            };
            
            this.openNewsModal(newsData);
        } catch (error) {
            console.error('Lỗi khi tải chi tiết tin tức để sửa:', error);
            this.showToast('Lỗi khi tải thông tin tin tức: ' + error.message, 'error');
        }
    }

    editFromDetail() {
        const newsId = $('#newsId').val();
        $('#newsDetailModal').modal('hide');
        this.editNewsFromTable({ currentTarget: $(`.edit-news[data-id="${newsId}"]`) });
    }

    confirmDeleteNews(event) {
        const newsId = $(event.currentTarget).data('id');
        $('#newsId').val(newsId);
        
        // Hiển thị modal xác nhận xóa thay vì dùng confirm()
        $('#deleteModal').modal('show');
    }

    deleteFromDetail() {
        $('#newsDetailModal').modal('hide');
        // Hiển thị modal xác nhận xóa
        $('#deleteModal').modal('show');
    }

    async deleteNews() {
        try {
            const newsId = $('#newsId').val();
            if (!newsId) {
                this.showToast('Không tìm thấy ID tin tức để xóa', 'error');
                return;
            }

            const response = await fetch(`${this.API_BASE.NEWS}/${newsId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Lỗi khi xóa tin tức:', errorText);
                throw new Error(`Lỗi khi xóa tin tức: ${response.status} ${response.statusText}`);
            }

            // Đóng modal xác nhận xóa
            $('#deleteModal').modal('hide');
            
            // Đóng modal chi tiết nếu đang hiển thị
            $('#newsDetailModal').modal('hide');
            
            // Tải lại danh sách tin tức
            this.loadNews();
            this.showToast('Xóa tin tức thành công', 'success');
        } catch (error) {
            console.error('Lỗi khi xóa tin tức:', error);
            this.showToast(error.message, 'error');
        }
    }

    filterNews() {
        const searchText = $('#searchNews').val().toLowerCase();
        const categoryFilter = $('#categoryFilter').val();
        const statusFilter = $('#statusFilter').val();

        $('#newsTable tr').each((_, row) => {
            const $row = $(row);
            const text = $row.text().toLowerCase();
            const category = $row.find('td:eq(3)').text();
            const status = $row.find('td:eq(4)').text();

            let show = text.includes(searchText);
            if (categoryFilter && category !== $('#categoryFilter option:selected').text()) {
                show = false;
            }
            if (statusFilter && status !== this.getStatusLabel(statusFilter)) {
                show = false;
            }

            $row.toggle(show);
        });
    }

    showToast(message, type = 'success') {
        const toast = `
            <div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        const toastElement = $(toast);
        $('.toast-container').append(toastElement);
        const bsToast = new bootstrap.Toast(toastElement);
        bsToast.show();
        toastElement.on('hidden.bs.toast', () => toastElement.remove());
    }
}

// Initialize when document is ready
$(document).ready(() => {
    new AdminNewsManager();
});