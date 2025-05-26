/**
 * admin-product.js - Quản lý sản phẩm cho trang admin
 */

/**
 * Lớp quản lý sản phẩm trong trang admin
 */
class AdminProductManager {
    constructor() {
        this.API_BASE = {
            PRODUCTS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`,
            CATEGORIES: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`
        };
        this.initializeEventListeners();
        this.loadProducts();
        this.loadCategories();
    }

    initializeEventListeners() {
        // Add product button
        $('#addProductBtn').click(() => this.openProductModal());

        // Save product button
        $('#saveProductBtn').click(() => this.saveProduct());

        // Search and filter
        $('#searchProduct').on('input', () => this.filterProducts());
        $('#categoryFilter').change(() => this.filterProducts());

        // Image preview
        $('#image').change((e) => this.handleImagePreview(e));

        // Product detail
        $(document).on('click', '.view-product', (e) => this.viewProductDetail(e));
        $(document).on('click', '.edit-product', (e) => this.editProduct(e));
        $(document).on('click', '.delete-product', (e) => this.confirmDeleteProduct(e));
        
        $('#editProductBtn').click(() => this.editFromDetail());
        $('#deleteProductBtn').click(() => this.deleteFromDetail());
        $('#confirmDeleteBtn').click(() => this.deleteProduct());
    }

    async loadProducts() {
        
        try {
            const response = await fetch(this.API_BASE.PRODUCTS);
            const products = await response.json();
            this.displayProducts(products);
        } catch (error) {
        
            this.showToast('Lỗi khi tải danh sách sản phẩm', 'error');
        }
    }

    async loadCategories() {
        try {
            
            const response = await fetch(this.API_BASE.CATEGORIES);
            const categories = await response.json();
            const categorySelects = $('#category, #categoryFilter');
            categorySelects.empty();
            
            $('#categoryFilter').append('<option value="">Tất cả loại sản phẩm</option>');
            $('#category').append('<option value="">Chọn loại sản phẩm</option>');
            
            categories.Items.forEach(category => {
                categorySelects.append(`<option value="${category.Id}">${category.Name}</option>`);
            });
        } catch (error) {
            this.showToast('Lỗi khi tải danh sách loại sản phẩm', 'error');
        }
    }

    displayProducts(response) {
        const tbody = $('#productTable tbody');
        tbody.empty();
        
        // Kiểm tra response có hợp lệ không
        if (!response || !response.Items || !Array.isArray(response.Items)) {
            console.error('Invalid response data:', response);
            this.showToast('Dữ liệu không hợp lệ', 'error');
            return;
        }
        
        // Hiển thị thông tin phân trang
        this.updatePaginationInfo(response);
        
        // Hiển thị danh sách sản phẩm
        response.Items.forEach(product => {
            // Debug để xem URL hình ảnh
            console.log('Product image URL:', product.ImageUrl);
            
            // Sử dụng URL hình ảnh trực tiếp từ API response
            const productImage = product.ImageUrl || '../images/default-product.jpg';
            
            const row = `
                <tr>
                    <td>${product.Id}</td>
                    <td>
                        <img src="${productImage}" class="product-image" alt="${product.Name}">
                    </td>
                    <td>${product.Name}</td>
                    <td>${product.Category?.Name || 'Không có'}</td>
                    <td>${this.formatCurrency(product.Price)}</td>
                    <td>${product.Stock}</td>
                    <td><span class="badge bg-${product.Status === 'Active' ? 'success' : 'danger'}">${this.getStatusLabel(product.Status)}</span></td>
                    <td>${product.ProductCode || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-product" data-id="${product.Id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary edit-product" data-id="${product.Id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-product" data-id="${product.Id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });
    }

    updatePaginationInfo(response) {
        // Cập nhật thông tin phân trang
        $('#paginationInfo').html(`
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    Hiển thị ${response.Items.length} trong tổng số ${response.TotalItems} sản phẩm
                </div>
                <div>
                    Trang ${response.CurrentPage} / ${response.TotalPages}
                </div>
            </div>
        `);
        
        // Cập nhật nút phân trang
        const pagination = $('#pagination');
        pagination.empty();
        
        // Nút Previous
        pagination.append(`
            <li class="page-item ${!response.PreviousPage ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${response.PreviousPage || 1}">Previous</a>
            </li>
        `);
        
        // Các nút trang
        for (let i = 1; i <= response.TotalPages; i++) {
            pagination.append(`
                <li class="page-item ${i === response.CurrentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `);
        }
        
        // Nút Next
        pagination.append(`
            <li class="page-item ${!response.NextPage ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${response.NextPage || response.TotalPages}">Next</a>
            </li>
        `);
    }

    getStatusLabel(status) {
        const labels = {
            'Active': 'Đang bán',
            'Inactive': 'Ngừng bán'
        };
        return labels[status] || status;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
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

    openProductModal(product = null) {
        
        const modal = $('#productModal');
        const form = $('#productForm')[0];
        form.reset();
        $('#imagePreview').empty();
        
        // Reset trường ẩn cho URL ảnh cũ
        $('#currentImageUrl').val('');

        // Thiết lập giá trị mặc định cho ngày hết hạn (6 tháng kể từ hiện tại)
        const defaultExpiryDate = new Date();
        defaultExpiryDate.setMonth(defaultExpiryDate.getMonth() + 6);
        $('#expiryDate').val(defaultExpiryDate.toISOString().split('T')[0]);
        
        // Thiết lập giá trị mặc định cho xuất xứ
        $('#origin').val('Việt Nam');

        // Hiển thị hoặc ẩn preview ảnh
        const imagePreviewContainer = $('#imagePreviewContainer');
        const imageInput = $('#image');
        
        if (product) {
            console.log('Editing product:', product);
            // Debug thông tin hình ảnh
            console.log('Product image URL in edit:', product.ImageUrl);
            
            $('#productModalTitle').text('Sửa Sản phẩm');
            $('#productId').val(product.Id);
            $('#name').val(product.Name);
            $('#category').val(product.CategoryId);
            $('#price').val(product.Price);
            $('#stock').val(product.Stock);
            $('#description').val(product.Description);
            $('#status').val(product.Status);
            
            // Điền các trường mới
            if (product.Origin) {
                $('#origin').val(product.Origin);
            }
            
            if (product.ExpiryDate) {
                const expiryDate = new Date(product.ExpiryDate);
                $('#expiryDate').val(expiryDate.toISOString().split('T')[0]);
            }
            
            // Xử lý hình ảnh - hiển thị ảnh hiện tại
            if (product.ImageUrl) {
                // Lưu URL ảnh hiện tại vào trường ẩn
                $('#currentImageUrl').val(product.ImageUrl);
                
                $('#imagePreview').html(`
                    <div class="mb-2">
                        <img src="${product.ImageUrl}" class="img-thumbnail" style="max-height: 200px;" >
                        <p class="text-muted mt-1">Ảnh hiện tại. Tải lên ảnh mới nếu muốn thay đổi.</p>
                    </div>
                `);
                
                // Đặt thuộc tính required cho input file là false khi chỉnh sửa
                imageInput.prop('required', false);
            }
            
            // Hiển thị thông báo về việc thay đổi ảnh
            $('#imageHelp').text('Để giữ ảnh hiện tại, không cần chọn ảnh mới.');
            $('#imageLabel').text('Thay đổi ảnh (nếu muốn)');

            $('#productCode').val(product.ProductCode || '');
        } else {
            $('#productModalTitle').text('Thêm Sản phẩm');
            $('#productId').val('');
            
            // Đặt thuộc tính required cho input file là true khi thêm mới
            imageInput.prop('required', true);
            
            // Cập nhật text cho label và help text
            $('#imageHelp').text('Vui lòng chọn ảnh cho sản phẩm.');
            $('#imageLabel').text('Ảnh sản phẩm');

            $('#productCode').val('');
        }

        modal.modal('show');
    }

    async saveProduct() {
        const form = $('#productForm')[0];
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Kiểm tra giá trị danh mục
        const categoryId = $('#category').val();
        if (!categoryId) {
            this.showToast('Vui lòng chọn loại sản phẩm', 'error');
            return;
        }

        // Tạo FormData với các trường phù hợp với ProductRequest
        const formData = new FormData();
        
        // Thêm các trường cơ bản
        formData.append('Name', $('#name').val());
        formData.append('CategoryId', categoryId);
        formData.append('Price', $('#price').val());
        formData.append('Stock', $('#stock').val());
        formData.append('Description', $('#description').val());
        formData.append('Status', $('#status').val());
        formData.append('Origin', $('#origin').val());
        
        // Xử lý ngày hết hạn
        const expiryDateValue = $('#expiryDate').val();
        const expiryDate = expiryDateValue ? new Date(expiryDateValue) : new Date();
        formData.append('ExpiryDate', expiryDate.toISOString());

        const productId = $('#productId').val();
        
        // Xử lý file hình ảnh - sử dụng input#image trực tiếp
        const imageFile = $('#image')[0].files[0];
        const currentImageUrl = $('#currentImageUrl').val();
        
        if (imageFile) {
            // Nếu có file mới, tải lên file mới
            formData.append('Image', imageFile);
            console.log('Adding new image file to request:', imageFile.name);
        } else if (!productId) {
            // Nếu là sản phẩm mới và không có ảnh
            this.showToast('Vui lòng chọn ảnh cho sản phẩm', 'error');
            return;
        } else if (currentImageUrl) {
            // Nếu là cập nhật sản phẩm và có ảnh cũ, gửi URL ảnh cũ
            formData.append('ImageUrl', currentImageUrl);
            console.log('Using existing image URL:', currentImageUrl);
        }

        formData.append('ProductCode', $('#productCode').val());

        try {
            const url = productId ? `${this.API_BASE.PRODUCTS}/${productId}` : this.API_BASE.PRODUCTS;
            const method = productId ? 'PUT' : 'POST';

            console.log('Sending request to:', url);
            console.log('Method:', method);
            
            // Log các trường của formData để debug
            for (const pair of formData.entries()) {
                console.log(`${pair[0]}: ${pair[1]}`);
            }
            
            // Gửi request
            const response = await fetch(url, {
                method,
                body: formData
            });

            console.log('Response status:', response.status);
            
            if (response.ok) {
                $('#productModal').modal('hide');
                this.loadProducts();
                this.showToast('Lưu sản phẩm thành công', 'success');
            } else {
                // Xử lý lỗi từ API
                let errorMessage = 'Lỗi khi lưu sản phẩm';
                try {
                    const errorData = await response.json();
                    console.error('Error data:', errorData);
                    
                    // Xử lý các loại lỗi khác nhau
                    if (Array.isArray(errorData)) {
                        const errorMessages = [];
                        errorData.forEach(err => {
                            if (err.Field && err.Errors && err.Errors.length) {
                                errorMessages.push(`${err.Field}: ${err.Errors.join(', ')}`);
                            }
                        });
                        if (errorMessages.length) {
                            errorMessage = `Lỗi: ${errorMessages.join('; ')}`;
                        }
                    } else if (errorData.errors) {
                        // Xử lý lỗi validation từ ASP.NET Core
                        const errorMessages = [];
                        for (const key in errorData.errors) {
                            errorMessages.push(`${key}: ${errorData.errors[key].join(', ')}`);
                        }
                        if (errorMessages.length) {
                            errorMessage = `Lỗi: ${errorMessages.join('; ')}`;
                        }
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.title) {
                        errorMessage = errorData.title;
                    } else if (typeof errorData === 'string') {
                        errorMessage = errorData;
                    }
                } catch (e) {
                    // Nếu không đọc được JSON, sử dụng status text
                    errorMessage = `Lỗi khi lưu sản phẩm: ${response.statusText || response.status}`;
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Save product error:', error);
            this.showToast(error.message, 'error');
        }
    }

    async viewProductDetail(event) {
        const productId = $(event.target).closest('.view-product').data('id');
        try {
            const response = await fetch(`${this.API_BASE.PRODUCTS}/${productId}`);
            const product = await response.json();
            
            console.log('Product detail:', product);
            // Debug thông tin hình ảnh
            console.log('Product image URL in detail:', product.ImageUrl);

            $('#detailName').text(product.Name);
            $('#detailCategory').text(product.Category?.Name || 'Không có');
            $('#detailPrice').text(this.formatCurrency(product.Price));
            $('#detailStock').text(product.Stock);
            $('#detailOrigin').text(product.Origin || 'Không có thông tin');
            
            // Định dạng ngày hết hạn
            if (product.ExpiryDate) {
                const expiryDate = new Date(product.ExpiryDate);
                $('#detailExpiryDate').text(expiryDate.toLocaleDateString('vi-VN'));
            } else {
                $('#detailExpiryDate').text('Không có thông tin');
            }
            
            $('#detailStatus').html(`<span class="badge bg-${product.Status === 'Active' ? 'success' : 'danger'}">${this.getStatusLabel(product.Status)}</span>`);
            $('#detailDescription').html(product.Description || 'Không có mô tả');
            
            // Sử dụng URL hình ảnh trực tiếp từ API response
            const productImage = product.ImageUrl || '../images/default-product.jpg';
            $('#detailImage').attr('src', productImage)
                             .on('error', function() {
                                 $(this).attr('src', '../images/default-product.jpg');
                             });

            $('#productId').val(product.Id);
            $('#detailProductCode').text(product.ProductCode || '');
            $('#productDetailModal').modal('show');
        } catch (error) {
            console.error('Error loading product details:', error);
            this.showToast('Lỗi khi tải thông tin sản phẩm', 'error');
        }
    }

    async editProduct(event) {
        const productId = $(event.target).closest('.edit-product').data('id');
        try {
            const response = await fetch(`${this.API_BASE.PRODUCTS}/${productId}`);
            const product = await response.json();
            this.openProductModal(product);
        } catch (error) {
            this.showToast('Lỗi khi tải thông tin sản phẩm', 'error');
        }
    }

    editFromDetail() {
        const productId = $('#productId').val();
        $('#productDetailModal').modal('hide');
        this.editProduct({ target: $(`.edit-product[data-id="${productId}"]`) });
    }

    confirmDeleteProduct(event) {
        const productId = $(event.target).closest('.delete-product').data('id');
        $('#productId').val(productId);
        $('#deleteModal').modal('show');
    }

    deleteFromDetail() {
        $('#productDetailModal').modal('hide');
        $('#deleteModal').modal('show');
    }

    async deleteProduct() {
        const productId = $('#productId').val();
        try {
            const response = await fetch(`${this.API_BASE.PRODUCTS}/${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                $('#deleteModal').modal('hide');
                this.loadProducts();
                this.showToast('Xóa sản phẩm thành công', 'success');
            } else {
                throw new Error('Lỗi khi xóa sản phẩm');
            }
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    filterProducts() {
        const searchText = $('#searchProduct').val().toLowerCase();
        const categoryFilter = $('#categoryFilter').val();

        $('#productTable tbody tr').each((_, row) => {
            const $row = $(row);
            const text = $row.text().toLowerCase();
            const category = $row.find('td:eq(3)').text();

            let show = text.includes(searchText);
            if (categoryFilter && category !== $('#categoryFilter option:selected').text()) {
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
        setTimeout(() => {
            toastElement.remove();
        }, 5000);
    }
} 

// Initialize when document is ready
$(document).ready(() => {
    new AdminProductManager();
}); 