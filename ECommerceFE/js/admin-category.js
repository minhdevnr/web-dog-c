/**
 * admin-category.js - Quản lý danh mục cho trang admin
 */

class AdminCategoryManager {
    constructor() {
        this.API_BASE = {
            CATEGORIES: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`,
            PRODUCTS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`
        };
        this.initializeEventListeners();
        this.loadCategories();
        this.isLoading = false;
    }

    initializeEventListeners() {
        // Add category button
        $('#addCategoryBtn').click(() => this.openCategoryModal());

        // Save category button
        $('#saveCategoryBtn').click(() => this.saveCategory());

        // Search
        $('#searchCategory').on('input', () => this.filterCategories());

        // Category detail
        $(document).on('click', '.view-category', (e) => this.viewCategoryDetail(e));
        
        // Edit & Delete buttons
        $(document).on('click', '.edit-category', (e) => this.editCategoryFromTable(e));
        $(document).on('click', '.delete-category', (e) => this.deleteCategoryFromTable(e));
        
        $('#editCategoryBtn').click(() => this.editCategory());
        $('#deleteCategoryBtn').click(() => this.deleteCategory());
        $('#confirmDeleteBtn').click(() => this.confirmDelete());

        // Form validation
        $('#categoryForm').on('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });
    }

    setLoading(isLoading) {
      
    }

    resetButtons() {
        $('#addCategoryBtn').html('<i class="fas fa-plus me-2"></i>Thêm Danh mục');
        $('#saveCategoryBtn').html('Lưu');
        $('#editCategoryBtn').html('<i class="fas fa-edit me-2"></i>Sửa');
        $('#deleteCategoryBtn').html('<i class="fas fa-trash me-2"></i>Xóa');
        $('#confirmDeleteBtn').html('Xóa');
    }

    validateCategoryData(data) {
        const errors = [];
        
        if (!data.name || data.name.trim().length === 0) {
            errors.push('Tên danh mục không được để trống');
        } else if (data.name.length > 100) {
            errors.push('Tên danh mục không được vượt quá 100 ký tự');
        }

        if (data.description && data.description.length > 500) {
            errors.push('Mô tả không được vượt quá 500 ký tự');
        }

        return errors;
    }

    async loadCategories(pageNumber = 1) {
        try {
            this.setLoading(true);
            const url = `${this.API_BASE.CATEGORIES}?pageNumber=${pageNumber}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Xử lý dữ liệu có cấu trúc phân trang
            if (data.Success && data.Items) {
                this.displayCategories(data);
            } else {
                // Hỗ trợ cả định dạng dữ liệu cũ
                this.displayCategories({ Items: data });
            }
        } catch (error) {
            this.showToast(`Lỗi khi tải danh sách danh mục: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    displayCategories(data) {
        const tbody = $('#categoryTable tbody');
        tbody.empty();
        
        const categories = data.Items || [];
        
        if (categories.length === 0) {
            tbody.append(`
                <tr>
                    <td colspan="5" class="text-center">Không có danh mục nào</td>
                </tr>
            `);
            return;
        }

        categories.forEach(category => {
            const row = `
                <tr>
                    <td>${category.Id || category.id}</td>
                    <td>${category.Name || category.name}</td>
                    <td>${(category.Description || category.description) || 'Không có mô tả'}</td>
                    <td>${(category.Products ? category.Products.length : (category.ProductCount || category.productCount)) || 0}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-category" data-id="${category.Id || category.id}" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary edit-category" data-id="${category.Id || category.id}" title="Sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-category" data-id="${category.Id || category.id}" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });
        
        // Thêm hiển thị thông tin phân trang nếu có
        if (data.TotalPages && data.TotalPages > 1) {
            this.displayPagination(data);
        }
    }
    
    displayPagination(data) {
        const paginationContainer = $('#categoryPagination');
        if (!paginationContainer.length) return;
        
        paginationContainer.empty();
        
        const pagination = $('<ul class="pagination justify-content-center"></ul>');
        
        // Nút Previous
        const prevBtn = $(`
            <li class="page-item ${!data.PreviousPage ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${data.PreviousPage || 1}">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `);
        pagination.append(prevBtn);
        
        // Các trang số
        for (let i = 1; i <= data.TotalPages; i++) {
            const pageItem = $(`
                <li class="page-item ${i === data.CurrentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `);
            pagination.append(pageItem);
        }
        
        // Nút Next
        const nextBtn = $(`
            <li class="page-item ${!data.NextPage ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${data.NextPage || data.TotalPages}">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `);
        pagination.append(nextBtn);
        
        paginationContainer.append(pagination);
        
        // Thêm sự kiện cho nút phân trang
        $('.page-link').on('click', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            if (page) {
                this.loadCategories(page);
            }
        });
    }

    openCategoryModal(category = null) {
        const modal = $('#categoryModal');
        const form = $('#categoryForm')[0];
        form.reset();

        if (category) {
            $('#categoryModalTitle').text('Sửa Danh mục');
            $('#categoryId').val(category.Id || category.id);
            $('#categoryName').val(category.Name || category.name);
            $('#categoryDescription').val(category.Description || category.description);
        } else {
            $('#categoryModalTitle').text('Thêm Danh mục');
            $('#categoryId').val('');
        }

        modal.modal('show');
    }

    async saveCategory() {
        const form = $('#categoryForm')[0];
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const categoryData = {
            name: $('#categoryName').val().trim(),
            description: $('#categoryDescription').val().trim()
        };

        const validationErrors = this.validateCategoryData(categoryData);
        if (validationErrors.length > 0) {
            this.showToast(validationErrors.join('\n'), 'error');
            return;
        }

        try {
            this.setLoading(true);
            const categoryId = $('#categoryId').val();
            const url = categoryId ? `${this.API_BASE.CATEGORIES}/${categoryId}` : this.API_BASE.CATEGORIES;
            const method = categoryId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Lỗi khi lưu danh mục');
            }

            $('#categoryModal').modal('hide');
            await this.loadCategories();
            this.showToast(categoryId ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công', 'success');
        } catch (error) {
            this.showToast(error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async viewCategoryDetail(event) {
        const categoryId = $(event.currentTarget).data('id');
        try {
            this.setLoading(true);
            const response = await fetch(`${this.API_BASE.CATEGORIES}/${categoryId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const category = await response.json();

            $('#detailName').text(category.Name || category.name);
            $('#detailDescription').text(category.Description || category.description || 'Không có mô tả');
            $('#detailProductCount').text(category.Products ? category.Products.length : (category.ProductCount || category.productCount || 0));

            $('#categoryId').val(categoryId);
            $('#categoryDetailModal').modal('show');
        } catch (error) {
            this.showToast(`Lỗi khi tải thông tin danh mục: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    // Sửa danh mục trực tiếp từ bảng
    async editCategoryFromTable(event) {
        const categoryId = $(event.currentTarget).data('id');
        try {
            this.setLoading(true);
            const response = await fetch(`${this.API_BASE.CATEGORIES}/${categoryId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const category = await response.json();
            this.openCategoryModal(category);
        } catch (error) {
            this.showToast(`Lỗi khi tải thông tin danh mục: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    // Xóa danh mục trực tiếp từ bảng
    async deleteCategoryFromTable(event) {
        const categoryId = $(event.currentTarget).data('id');
        try {
            this.setLoading(true);
            // Kiểm tra danh mục có sản phẩm không
            const response = await fetch(`${this.API_BASE.CATEGORIES}/${categoryId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const category = await response.json();
            
            // Lưu ID để xử lý khi xác nhận xóa
            $('#categoryId').val(categoryId);
            
            // Kiểm tra nếu danh mục có sản phẩm thì không cho xóa
            const productCount = category.Products ? category.Products.length : (category.ProductCount || category.productCount || 0);
            if (productCount > 0) {
                this.showToast('Không thể xóa danh mục có sản phẩm. Vui lòng xóa hoặc di chuyển các sản phẩm trước.', 'error');
                return;
            }
            
            $('#deleteModal').modal('show');
        } catch (error) {
            this.showToast(`Lỗi khi kiểm tra thông tin danh mục: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async editCategory() {
        const categoryId = $('#categoryId').val();
        try {
            this.setLoading(true);
            const response = await fetch(`${this.API_BASE.CATEGORIES}/${categoryId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const category = await response.json();
            $('#categoryDetailModal').modal('hide');
            this.openCategoryModal(category);
        } catch (error) {
            this.showToast(`Lỗi khi tải thông tin danh mục: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    deleteCategory() {
        const productCount = parseInt($('#detailProductCount').text());
        if (productCount > 0) {
            this.showToast('Không thể xóa danh mục có sản phẩm. Vui lòng xóa hoặc di chuyển các sản phẩm trước.', 'error');
            return;
        }
        $('#categoryDetailModal').modal('hide');
        $('#deleteModal').modal('show');
    }

    async confirmDelete() {
        const categoryId = $('#categoryId').val();
        try {
            this.setLoading(true);
            const response = await fetch(`${this.API_BASE.CATEGORIES}/${categoryId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Lỗi khi xóa danh mục');
            }

            $('#deleteModal').modal('hide');
            await this.loadCategories();
            this.showToast('Xóa danh mục thành công', 'success');
        } catch (error) {
            this.showToast(error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    filterCategories() {
        const searchTerm = $('#searchCategory').val().toLowerCase().trim();

        $('#categoryTable tbody tr').each((_, row) => {
            const $row = $(row);
            const name = $row.find('td:eq(1)').text().toLowerCase();
            const description = $row.find('td:eq(2)').text().toLowerCase();

            const matchesSearch = name.includes(searchTerm) || 
                                description.includes(searchTerm);

            $row.toggle(matchesSearch);
        });
    }

    showToast(message, type = 'success') {
        const toast = `
            <div class="toast" role="alert">
                <div class="toast-header ${type === 'success' ? 'bg-success' : 'bg-danger'} text-white">
                    <strong class="me-auto">${type === 'success' ? 'Thành công' : 'Lỗi'}</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;

        $('.toast-container').append(toast);
        const toastElement = $('.toast').last();
        const bsToast = new bootstrap.Toast(toastElement, {
            delay: 5000
        });
        bsToast.show();

        toastElement.on('hidden.bs.toast', function() {
            $(this).remove();
        });
    }
}

// Khởi tạo AdminCategoryManager khi trang tải xong
$(document).ready(function() {
    window.adminCategoryManager = new AdminCategoryManager();
}); 