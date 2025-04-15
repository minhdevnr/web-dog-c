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
        $('#editNewsBtn').click(() => this.editNews());
        $('#deleteNewsBtn').click(() => this.deleteNews());
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
        debugger
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
        news.Items.forEach(item => {
            const row = `
                <tr>
                    <td>${item.id}</td>
                    <td>
                        <img src="${item.image || '../images/default-news.jpg'}" class="news-image" alt="${item.title}">
                    </td>
                    <td>${item.title}</td>
                    <td>${item.category.name}</td>
                    <td><span class="badge bg-${item.status === 'Published' ? 'success' : 'warning'}">${this.getStatusLabel(item.status)}</span></td>
                    <td>${this.formatDate(item.createdAt)}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-news" data-id="${item.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary edit-news" data-id="${item.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-news" data-id="${item.id}">
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
            $('#category').val(news.categoryId);
            
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
            
            $('#status').val(news.status);
            if (news.image) {
                $('#imagePreview').html(`<img src="${news.image}" class="img-thumbnail" style="max-height: 200px;">`);
            }
        } else {
            $('#newsModalTitle').text('Thêm Tin tức');
            $('#newsId').val('');
        }

        modal.modal('show');
    }

    async saveNews() {
        const form = $('#newsForm')[0];
        // if (!form.checkValidity()) {
        //     form.reportValidity();
        //     return;
        // }

        const formData = new FormData();
        formData.append('title', $('#title').val());
        formData.append('categoryId', $('#category').val());
        
        // Lấy nội dung từ TinyMCE an toàn
        try {
            const editor = tinymce.get('content');
            if (editor) {
                formData.append('content', editor.getContent());
            } else {
                // Nếu không có TinyMCE, lấy nội dung từ textarea
                formData.append('content', $('#content').val());
            }
        } catch (error) {
            console.error('Lỗi khi lấy nội dung từ TinyMCE:', error);
            formData.append('content', $('#content').val());
        }
        
        formData.append('status', $('#status').val());

        const imageFile = $('#image')[0].files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const newsId = $('#newsId').val();
            const url = newsId ? `${this.API_BASE.NEWS}/${newsId}` : this.API_BASE.NEWS;
            const method = newsId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: formData
            });

            if (response.ok) {
                $('#newsModal').modal('hide');
                this.loadNews();
                this.showToast('Lưu tin tức thành công', 'success');
            } else {
                throw new Error('Lỗi khi lưu tin tức');
            }
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    async viewNewsDetail(event) {
        const newsId = $(event.target).closest('.view-news').data('id');
        try {
            const response = await fetch(`${this.API_BASE.NEWS}/${newsId}`);
            const news = await response.json();

            $('#detailImage').attr('src', news.image || '../images/default-news.jpg');
            $('#detailTitle').text(news.title);
            $('#detailCategory').text(news.category.name);
            $('#detailStatus').html(`<span class="badge bg-${news.status === 'Published' ? 'success' : 'warning'}">${this.getStatusLabel(news.status)}</span>`);
            $('#detailDate').text(this.formatDate(news.createdAt));
            $('#detailContent').html(news.content);

            $('#newsDetailModal').modal('show');    
        } catch (error) {
            this.showToast('Lỗi khi tải thông tin tin tức', 'error');
        }
    }

    async editNews() {
        const newsId = $('#newsId').val();
        try {
            const response = await fetch(`${this.API_BASE.NEWS}/${newsId}`);
            const news = await response.json();
            $('#newsDetailModal').modal('hide');
            this.openNewsModal(news);
        } catch (error) {
            this.showToast('Lỗi khi tải thông tin tin tức', 'error');
        }
    }

    async deleteNews() {
        const newsId = $('#newsId').val();
        if (!confirm('Bạn có chắc chắn muốn xóa tin tức này?')) {
            return;
        }

        try {
            const response = await fetch(`${this.API_BASE.NEWS}/${newsId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                $('#newsDetailModal').modal('hide');
                this.loadNews();
                this.showToast('Xóa tin tức thành công', 'success');
            } else {
                throw new Error('Lỗi khi xóa tin tức');
            }
        } catch (error) {
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