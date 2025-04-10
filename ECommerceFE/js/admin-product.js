/**
 * admin-product.js - Quản lý sản phẩm cho trang admin
 */

document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo AdminProductManager
    AdminProductManager.init();
});

/**
 * Lớp quản lý sản phẩm trong trang admin
 */
class AdminProductManager {
    /**
     * Khởi tạo AdminProductManager
     */
    static init() {
        this.setupEventListeners();
        this.loadProducts();
        this.loadCategories();
    }

    /**
     * Thiết lập các sự kiện
     */
    static setupEventListeners() {
        // Nút thêm sản phẩm mới
        const newProductBtn = document.getElementById('newProductBtn');
        if (newProductBtn) {
            newProductBtn.addEventListener('click', () => this.openProductModal());
        }

        // Nút lưu sản phẩm
        const saveProductBtn = document.getElementById('saveProductBtn');
        if (saveProductBtn) {
            saveProductBtn.addEventListener('click', () => this.saveProduct());
        }

        // Tìm kiếm sản phẩm
        const searchInput = document.getElementById('productSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchProducts(e.target.value));
        }

        // Xem trước ảnh khi chọn file
        const productImage = document.getElementById('productImage');
        if (productImage) {
            productImage.addEventListener('change', this.handleImagePreview);
        }

        // Nút xác nhận xóa sản phẩm
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                const productId = confirmDeleteBtn.getAttribute('data-product-id');
                if (productId) {
                    this.deleteProduct(productId);
                }
            });
        }
    }

    /**
     * Xử lý xem trước ảnh
     */
    static handleImagePreview(e) {
        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        const imagePreview = document.getElementById('imagePreview');
        
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                imagePreview.src = event.target.result;
                imagePreviewContainer.style.display = 'block';
            };
            reader.readAsDataURL(e.target.files[0]);
        } else {
            imagePreviewContainer.style.display = 'none';
        }
    }

    /**
     * Chuẩn hóa đường dẫn ảnh
     * @param {string} imageUrl - Đường dẫn ảnh cần chuẩn hóa
     * @returns {string} - Đường dẫn ảnh đã chuẩn hóa
     */
    static normalizeImageUrl(imageUrl) {
        // Check URL null, undefined, empty
        if (!imageUrl) {
            // Sử dụng base64 để tạo ảnh trống trong trường hợp không tìm thấy no-image.jpg
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlNmU2ZTYiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
        }
        
        // Nếu là đường dẫn đầy đủ (có http/https), trả về nguyên vẹn
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        
        // Nếu là đường dẫn base64, trả về nguyên vẹn
        if (imageUrl.startsWith('data:image')) {
            return imageUrl;
        }
        
        // Nếu API trả về đường dẫn tương đối, thêm BASE_URL
        if (!imageUrl.startsWith('/')) {
            return `${API_CONFIG.BASE_URL}/${imageUrl}`;
        }
        
        // Nếu đã có dấu / ở đầu, thêm domain nhưng không thêm / nữa
        return `${API_CONFIG.BASE_URL}${imageUrl}`;
    }

    /**
     * Tải danh sách sản phẩm
     */
    static async loadProducts() {
        try {
            const productTable = document.getElementById('productTable');
            if (!productTable) return;

            productTable.innerHTML = '<tr><td colspan="6" class="text-center">Đang tải sản phẩm...</td></tr>';

            // Thử tải sản phẩm từ API
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/product`);
            if (!response.ok) {
                throw new Error(`Không thể tải sản phẩm: ${response.statusText}`);
            }

            let products = await response.json();
            console.log('Dữ liệu API trả về:', products);

            // Kiểm tra nếu API trả về mảng rỗng hoặc dữ liệu không hợp lệ
            if (!products || !Array.isArray(products) || products.length === 0) {
                // Tạo dữ liệu mẫu trong trường hợp API không trả về dữ liệu
                products = [
                    {
                        id: 1,
                        name: 'Cà Phê Phin Truyền Thống',
                        price: 29000,
                        origin: 'Cà Phê',
                        imageUrl: '/ECommerceFE/img/coffee1.jpg',
                        description: 'Hương vị đậm đà, đắng nhẹ của cà phê Việt Nam'
                    },
                    {
                        id: 2, 
                        name: 'Cà Phê Sữa Đá',
                        price: 35000,
                        origin: 'Cà Phê',
                        imageUrl: '/ECommerceFE/img/coffee2.jpg',
                        description: 'Cà phê đắng hòa quyện với sữa đặc béo ngọt'
                    },
                    {
                        id: 3,
                        name: 'Trà Sen Vàng',
                        price: 45000,
                        origin: 'Trà',
                        imageUrl: '/ECommerceFE/img/tea1.jpg',
                        description: 'Trà ướp hương sen thanh mát'
                    }
                ];
                console.log('Sử dụng dữ liệu sản phẩm mẫu');
            }

            // Hiển thị danh sách sản phẩm
            productTable.innerHTML = '';
            products.forEach(product => {
                // Chuẩn hóa tên trường dữ liệu (API có thể trả về name hoặc Name)
                const productName = product.name || product.Name || 'Không có tên';
                const productPrice = product.price || product.Price || 0;
                const productDesc = product.description || product.Description || 'Không có mô tả';
                const productCategory = product.origin || product.Origin || 'Chưa phân loại';
                const productId = product.id || product.Id || 0;
                
                // Chuẩn hóa đường dẫn ảnh
                let imageRaw = product.imageUrl || product.ImageUrl || '';
                console.log(`Sản phẩm ${productName}, đường dẫn gốc: ${imageRaw}`);
                let imageUrl = this.normalizeImageUrl(imageRaw);
                console.log(`Sản phẩm ${productName}, đường dẫn sau chuẩn hóa: ${imageUrl}`);
                
                // Rút gọn mô tả nếu quá dài
                const truncatedDesc = productDesc.length > 50 ? productDesc.substring(0, 50) + '...' : productDesc;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <img src="${imageUrl}" alt="${productName}" style="width: 50px; height: 50px; object-fit: cover; cursor: pointer;" 
                             class="product-thumbnail" data-id="${productId}" 
                             onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlNmU2ZTYiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';">
                    </td>
                    <td>${productName}</td>
                    <td>${this.formatCurrency(productPrice)}</td>
                    <td>${productCategory}</td>
                    <td>${truncatedDesc}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-product" data-id="${productId}">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="btn btn-sm btn-danger delete-product" data-id="${productId}">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </td>
                `;
                productTable.appendChild(row);
            });
            
            // Thêm sự kiện cho các nút
            this.addButtonEventListeners();
            
            // Thêm sự kiện xem chi tiết ảnh sản phẩm PHẢI Ở CUỐI sau khi đã thêm các hàng vào bảng
            const thumbnails = document.querySelectorAll('.product-thumbnail');
            thumbnails.forEach(img => {
                img.removeEventListener('click', this.handleThumbnailClick);
                img.addEventListener('click', this.handleThumbnailClick);
            });
            
            console.log(`Đã thêm sự kiện cho ${thumbnails.length} ảnh sản phẩm`);
        } catch (error) {
            console.error('Lỗi khi tải sản phẩm:', error);
            const productTable = document.getElementById('productTable');
            if (productTable) {
                productTable.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Lỗi khi tải sản phẩm: ${error.message}</td></tr>`;
            }
            this.showNotification('Lỗi khi tải sản phẩm', 'error');
        }
    }

    /**
     * Xử lý sự kiện khi click vào ảnh thumbnail
     * @param {Event} e - Sự kiện click
     */
    static handleThumbnailClick(e) {
        const productId = e.currentTarget.dataset.id;
        if (productId) {
            console.log('Click vào ảnh sản phẩm:', productId);
            AdminProductManager.editProduct(productId);
        }
    }

    /**
     * Thêm sự kiện cho các nút sửa/xóa
     */
    static addButtonEventListeners() {
        // Nút sửa sản phẩm
        document.querySelectorAll('.edit-product').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                this.editProduct(productId);
            });
        });

        // Nút xóa sản phẩm
        document.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                this.showDeleteConfirmation(productId);
            });
        });
    }

    /**
     * Tải danh mục cho dropdown
     */
    static async loadCategories() {
        try {
            const categorySelect = document.getElementById('productCategory');
            if (!categorySelect) return;

            // Giá trị danh mục mẫu để sử dụng với Origin
            const sampleCategories = [
                { id: 'coffee', name: 'Cà Phê' },
                { id: 'tea', name: 'Trà' },
                { id: 'dessert', name: 'Bánh & Snack' },
                { id: 'special', name: 'Thức uống đặc biệt' }
            ];

            categorySelect.innerHTML = '<option value="">Chọn danh mục</option>';

            try {
                // Thử tải danh mục từ API
                const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`);
                
                // Nếu API trả về thành công
                if (response.ok) {
                    const categories = await response.json();
                    if (categories && categories.length > 0) {
                        categories.forEach(category => {
                            const option = document.createElement('option');
                            option.value = category.name || category.id;
                            option.textContent = category.name;
                            categorySelect.appendChild(option);
                        });
                        return; // Thoát sau khi đã tải thành công từ API
                    }
                }
                
                // Nếu không thể tải từ API hoặc không có dữ liệu, sử dụng dữ liệu mẫu
                throw new Error('Sử dụng dữ liệu mẫu thay thế');
            } catch (error) {
                console.log('Sử dụng danh mục mẫu:', error.message);
                
                // Thêm danh mục mẫu
                sampleCategories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Lỗi khi tải danh mục:', error);
            this.showNotification('Không thể tải danh mục sản phẩm', 'warning');
        }
    }

    /**
     * Mở modal sản phẩm (thêm mới hoặc chỉnh sửa)
     * @param {Object} product - Thông tin sản phẩm (null nếu thêm mới)
     */
    static openProductModal(product = null) {
        const modal = $('#productModal');
        const modalTitle = document.getElementById('productModalLabel');
        const productForm = document.getElementById('productForm');
        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        
        // Reset form
        productForm.reset();
        imagePreviewContainer.style.display = 'none';
        
        // Đặt tiêu đề và giá trị form
        if (product) {
            modalTitle.textContent = 'Sửa sản phẩm';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productPrice').value = product.price || 0;
            document.getElementById('productDescription').value = product.description || '';
            
            if (product.categoryId) {
                const categorySelect = document.getElementById('productCategory');
                if (categorySelect) {
                    categorySelect.value = product.categoryId;
                }
            }
            
            // Hiển thị ảnh hiện tại nếu có
            if (product.imageUrl) {
                const imagePreview = document.getElementById('imagePreview');
                imagePreview.src = product.imageUrl;
                imagePreviewContainer.style.display = 'block';
            }
        } else {
            modalTitle.textContent = 'Thêm sản phẩm mới';
            document.getElementById('productId').value = '';
        }
        
        modal.modal('show');
    }

    /**
     * Sửa sản phẩm
     * @param {string|number} productId - ID sản phẩm
     */
    static async editProduct(productId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/product/${productId}`);
            
            let product;
            if (response.ok) {
                product = await response.json();
            } else {
                // Nếu không thể lấy từ API, tìm trong bảng hiện tại
                console.warn('Không thể lấy dữ liệu từ API, sử dụng dữ liệu hiển thị');
                const row = document.querySelector(`.delete-product[data-id="${productId}"]`).closest('tr');
                if (!row) throw new Error('Không tìm thấy dữ liệu sản phẩm');
                
                // Lấy thông tin sản phẩm từ bảng hiển thị
                const cells = row.querySelectorAll('td');
                const imageUrl = cells[0].querySelector('img').src;
                const name = cells[1].textContent;
                const price = cells[2].textContent.replace(/[^\d]/g, ''); // Loại bỏ ký tự không phải số
                const category = cells[3].textContent;
                const description = cells[4].textContent;
                
                product = {
                    id: productId,
                    name: name,
                    price: parseInt(price, 10),
                    origin: category,
                    description: description,
                    imageUrl: imageUrl
                };
            }
            
            // Chuẩn hóa tên trường
            const standardizedProduct = {
                id: product.id || product.Id,
                name: product.name || product.Name,
                price: product.price || product.Price,
                categoryId: product.origin || product.Origin,
                description: product.description || product.Description,
                imageUrl: product.imageUrl || product.ImageUrl
            };
            
            // Gán sản phẩm đang chỉnh sửa vào biến toàn cục
            this.currentEditingProduct = standardizedProduct;
            
            this.openProductModal(standardizedProduct);
        } catch (error) {
            console.error('Lỗi khi tải thông tin sản phẩm:', error);
            this.showNotification('Không thể tải thông tin sản phẩm', 'error');
        }
    }

    /**
     * Lưu sản phẩm (thêm mới hoặc cập nhật)
     */
    static async saveProduct() {
        try {
            const productId = document.getElementById('productId').value;
            const productName = document.getElementById('productName').value;
            const productPrice = document.getElementById('productPrice').value;
            const productDescription = document.getElementById('productDescription').value;
            const productCategory = document.getElementById('productCategory').value;
            const productImage = document.getElementById('productImage').files[0];
            
            // Validate
            if (!productName || !productPrice) {
                this.showNotification('Vui lòng điền đầy đủ thông tin cần thiết', 'error');
                return;
            }
            
            // Hiển thị trạng thái uploading
            this.updateUploadingState(true);
            
            // Chuẩn bị dữ liệu
            const formData = new FormData();
            formData.append('Name', productName);
            formData.append('Price', productPrice);
            formData.append('Description', productDescription);
            
            // Sử dụng Origin thay vì CategoryId để phù hợp với API
            if (productCategory) {
                formData.append('Origin', productCategory); // Sử dụng Origin để lưu trữ danh mục
            } else {
                formData.append('Origin', 'Chưa phân loại'); // Giá trị mặc định nếu không chọn danh mục
            }
            
            if (productId) {
                formData.append('Id', productId);
            }
            
            // Xử lý hình ảnh nếu có
            if (productImage) {
                try {
                    const processedImage = await this.preprocessImage(productImage);
                    formData.append('image', processedImage);
                    console.log('Đã thêm ảnh mới vào form data');
                } catch (imageError) {
                    this.updateUploadingState(false);
                    this.showNotification(imageError.message, 'error');
                    return;
                }
            } else if (this.currentEditingProduct?.imageUrl) {
                // Nếu không có ảnh mới, giữ nguyên ảnh cũ
                // Đối với PUT, API cần biết đường dẫn ảnh cũ để không bị mất
                let oldImageUrl = this.currentEditingProduct.imageUrl;
                // Chỉ gửi phần đường dẫn tương đối nếu đó là URL đầy đủ
                if (oldImageUrl.includes(API_CONFIG.BASE_URL)) {
                    oldImageUrl = oldImageUrl.replace(API_CONFIG.BASE_URL, '');
                }
                formData.append('ImageUrl', oldImageUrl);
                console.log('Giữ nguyên ảnh cũ:', oldImageUrl);
            }

            // Yêu cầu bởi API - Thêm các trường bắt buộc
            formData.append('ExpiryDate', new Date().toISOString());
            formData.append('CreatedAt', new Date().toISOString());
            
            // API endpoint và phương thức
            const method = productId ? 'PUT' : 'POST';
            const url = productId 
                ? `${API_CONFIG.BASE_URL}/api/product/${productId}`
                : `${API_CONFIG.BASE_URL}/api/product`;
            
            console.log(`Gửi yêu cầu ${method} đến ${url}`);
            
            // Log dữ liệu form data để debug
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[0] === 'image' ? 'File - ' + pair[1].name : pair[1]));
            }
            
            // Gửi request
            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });
                
                // Kết thúc trạng thái uploading
                this.updateUploadingState(false);
                
                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(errorData || 'Không thể lưu sản phẩm');
                }
                
                // Nhận response để lấy đường dẫn ảnh đúng từ server
                const savedProduct = await response.json();
                console.log('Response từ server sau khi lưu:', savedProduct);
                
                // Thông báo thành công và đóng modal
                this.showNotification(
                    productId ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công',
                    'success'
                );
                $('#productModal').modal('hide');
                
                // Nếu là sửa, cập nhật lại UI ngay lập tức
                if (productId) {
                    // Sử dụng dữ liệu trả về từ API nếu có
                    const imageFromServer = savedProduct && (savedProduct.imageUrl || savedProduct.ImageUrl);
                    this.updateProductInUI(productId, {
                        id: productId,
                        name: productName,
                        price: productPrice,
                        origin: productCategory || 'Chưa phân loại',
                        description: productDescription,
                        // Ưu tiên dùng ảnh từ server, nếu không có thì dùng ảnh hiện tại hoặc ảnh mới upload
                        imageUrl: imageFromServer || 
                                  (productImage ? URL.createObjectURL(productImage) : 
                                  (this.currentEditingProduct?.imageUrl || ''))
                    });
                }
                
                // Tải lại danh sách sản phẩm
                this.loadProducts();
            } catch (fetchError) {
                // Kết thúc trạng thái uploading nếu có lỗi
                this.updateUploadingState(false);
                console.error('Lỗi kết nối API:', fetchError);
                
                // Thông báo thất bại
                this.showNotification(`Lỗi: ${fetchError.message}`, 'error');
                
                // Cố gắng lưu sản phẩm vào bảng UI trực tiếp nếu API không hoạt động
                if (method === 'POST') {
                    this.addProductToUI({
                        id: Date.now(), // ID tạm thời
                        name: productName,
                        price: productPrice,
                        origin: productCategory || 'Chưa phân loại',
                        description: productDescription,
                        imageUrl: productImage ? URL.createObjectURL(productImage) : '/ECommerceFE/img/no-image.jpg'
                    });
                    $('#productModal').modal('hide');
                    this.showNotification('Đã thêm sản phẩm vào giao diện (API không hoạt động)', 'warning');
                } else if (method === 'PUT') {
                    // Cập nhật UI nếu là sửa
                    this.updateProductInUI(productId, {
                        id: productId,
                        name: productName,
                        price: productPrice,
                        origin: productCategory || 'Chưa phân loại',
                        description: productDescription,
                        imageUrl: productImage ? URL.createObjectURL(productImage) : (this.currentEditingProduct?.imageUrl || '')
                    });
                    $('#productModal').modal('hide');
                    this.showNotification('Đã cập nhật sản phẩm trong giao diện (API không hoạt động)', 'warning');
                }
            }
        } catch (error) {
            // Kết thúc trạng thái uploading
            this.updateUploadingState(false);
            console.error('Lỗi khi lưu sản phẩm:', error);
            this.showNotification(`Lỗi: ${error.message}`, 'error');
        }
    }

    /**
     * Cập nhật sản phẩm trong UI sau khi chỉnh sửa mà không cần tải lại
     * @param {string|number} productId - ID của sản phẩm cần cập nhật
     * @param {Object} updatedProduct - Thông tin sản phẩm đã cập nhật
     */
    static updateProductInUI(productId, updatedProduct) {
        try {
            // Tìm hàng chứa sản phẩm cần cập nhật
            const productRow = document.querySelector(`button.edit-product[data-id="${productId}"]`)?.closest('tr');
            if (!productRow) {
                console.warn(`Không tìm thấy hàng cho sản phẩm ID: ${productId}`);
                return;
            }

            // Chuẩn hóa dữ liệu sản phẩm
            const productName = updatedProduct.name || updatedProduct.Name || 'Không có tên';
            const productPrice = updatedProduct.price || updatedProduct.Price || 0;
            const productDesc = updatedProduct.description || updatedProduct.Description || 'Không có mô tả';
            const productCategory = updatedProduct.origin || updatedProduct.Origin || 'Chưa phân loại';
            
            // Xử lý imageUrl - dùng hàm chung để chuẩn hóa
            let imageRaw = updatedProduct.imageUrl || updatedProduct.ImageUrl || '';
            console.log(`Cập nhật sản phẩm ${productName}, đường dẫn gốc: ${imageRaw}`);
            let imageUrl = this.normalizeImageUrl(imageRaw);
            console.log(`Cập nhật sản phẩm ${productName}, đường dẫn sau chuẩn hóa: ${imageUrl}`);
            
            // Rút gọn mô tả nếu quá dài
            const truncatedDesc = productDesc.length > 50 ? productDesc.substring(0, 50) + '...' : productDesc;
            
            // Cập nhật nội dung các ô trong hàng
            const cells = productRow.querySelectorAll('td');
            
            // Cập nhật ảnh
            const imgElement = cells[0].querySelector('img');
            if (imgElement) {
                // Ngăn vòng lặp lỗi bằng cách chỉ cập nhật ảnh khi nó thay đổi
                const currentSrc = imgElement.getAttribute('src');
                if (currentSrc !== imageUrl) {
                    imgElement.src = imageUrl;
                    imgElement.alt = productName;
                    
                    // Xử lý trường hợp ảnh không tải được
                    imgElement.onerror = function() {
                        // Đặt onerror=null để ngăn vòng lặp vô hạn
                        this.onerror = null;
                        // Sử dụng base64 cho ảnh mặc định
                        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlNmU2ZTYiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                    };
                }
            }
            
            // Cập nhật các thông tin khác
            cells[1].textContent = productName;
            cells[2].textContent = this.formatCurrency(productPrice);
            cells[3].textContent = productCategory;
            cells[4].textContent = truncatedDesc;
            
            console.log(`Đã cập nhật UI cho sản phẩm ID: ${productId}`);
        } catch (error) {
            console.error('Lỗi khi cập nhật UI:', error);
        }
    }

    /**
     * Thêm sản phẩm vào UI bảng
     * @param {Object} product - Thông tin sản phẩm
     */
    static addProductToUI(product) {
        const productTable = document.getElementById('productTable');
        if (!productTable) return;
        
        // Xóa thông báo "Không có sản phẩm" nếu có
        if (productTable.querySelector('tr td[colspan="6"]')) {
            productTable.innerHTML = '';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${product.imageUrl}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;"
                     onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlNmU2ZTYiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';">
            </td>
            <td>${product.name}</td>
            <td>${this.formatCurrency(product.price)}</td>
            <td>${product.origin}</td>
            <td>${product.description && product.description.length > 50 ? product.description.substring(0, 50) + '...' : product.description || 'Không có mô tả'}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-product" data-id="${product.id}">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button class="btn btn-sm btn-danger delete-product" data-id="${product.id}">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </td>
        `;
        
        // Thêm row vào đầu bảng
        if (productTable.querySelector('tr')) {
            productTable.insertBefore(row, productTable.querySelector('tr'));
        } else {
            productTable.appendChild(row);
        }
        
        // Thêm sự kiện cho các nút
        const editButton = row.querySelector('.edit-product');
        const deleteButton = row.querySelector('.delete-product');
        
        if (editButton) {
            editButton.addEventListener('click', () => {
                this.editProduct(product.id);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                this.showDeleteConfirmation(product.id);
            });
        }
        
        // Hiệu ứng highlight dòng mới
        row.style.animation = 'highlightNew 1.5s';
    }

    /**
     * Hiển thị hộp thoại xác nhận xóa
     * @param {string|number} productId - ID sản phẩm
     */
    static showDeleteConfirmation(productId) {
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.setAttribute('data-product-id', productId);
            $('#deleteConfirmModal').modal('show');
        }
    }

    /**
     * Xóa sản phẩm
     * @param {string|number} productId - ID sản phẩm
     */
    static async deleteProduct(productId) {
        try {
            // Ẩn modal xác nhận
            $('#deleteConfirmModal').modal('hide');
            
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}/api/product/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (response.ok) {
                    // Nếu API xóa thành công
                    this.showNotification('Xóa sản phẩm thành công', 'success');
                } else {
                    // Nếu API trả về lỗi, vẫn xóa UI để đảm bảo trải nghiệm người dùng
                    console.warn('API trả về lỗi khi xóa, nhưng vẫn xóa khỏi UI:', response.statusText);
                    this.showNotification('Đã xóa sản phẩm khỏi giao diện (API trả về lỗi)', 'warning');
                }
            } catch (apiError) {
                // Nếu có lỗi kết nối API, vẫn xóa UI để đảm bảo trải nghiệm người dùng
                console.error('Lỗi kết nối API khi xóa:', apiError);
                this.showNotification('Đã xóa sản phẩm khỏi giao diện (lỗi kết nối API)', 'warning');
            }
            
            // Dù API thành công hay thất bại, vẫn xóa sản phẩm khỏi giao diện
            const productRow = document.querySelector(`.delete-product[data-id="${productId}"]`)?.closest('tr');
            if (productRow) {
                productRow.style.transition = 'opacity 0.5s ease';
                productRow.style.opacity = '0';
                setTimeout(() => {
                    if (productRow.parentNode) {
                        productRow.parentNode.removeChild(productRow);
                    }
                    
                    // Kiểm tra nếu bảng trống thì hiển thị thông báo
                    const productTable = document.getElementById('productTable');
                    if (productTable && productTable.querySelectorAll('tr').length === 0) {
                        productTable.innerHTML = '<tr><td colspan="6" class="text-center">Không có sản phẩm nào</td></tr>';
                    }
                }, 500);
            }
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            this.showNotification(`Lỗi: ${error.message}`, 'error');
        }
    }

    /**
     * Tìm kiếm sản phẩm
     * @param {string} keyword - Từ khóa tìm kiếm
     */
    static async searchProducts(keyword) {
        try {
            if (!keyword.trim()) {
                return this.loadProducts(); // Tải lại toàn bộ nếu không có từ khóa
            }
            
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/product?keyword=${encodeURIComponent(keyword)}`);
            if (!response.ok) {
                throw new Error('Không thể tìm kiếm sản phẩm');
            }
            
            const products = await response.json();
            const productTable = document.getElementById('productTable');
            
            if (!productTable) return;
            
            if (!products || products.length === 0) {
                productTable.innerHTML = '<tr><td colspan="6" class="text-center">Không tìm thấy sản phẩm phù hợp</td></tr>';
                return;
            }
            
            // Hiển thị kết quả tìm kiếm
            productTable.innerHTML = '';
            products.forEach(product => {
                // Chuẩn hóa tên trường dữ liệu (API có thể trả về name hoặc Name)
                const productName = product.name || product.Name || 'Không có tên';
                const productPrice = product.price || product.Price || 0;
                const productDesc = product.description || product.Description || 'Không có mô tả';
                const productCategory = product.origin || product.Origin || 'Chưa phân loại';
                const productId = product.id || product.Id || 0;
                
                // Chuẩn hóa đường dẫn ảnh
                let imageRaw = product.imageUrl || product.ImageUrl || '';
                let imageUrl = this.normalizeImageUrl(imageRaw);
                
                // Rút gọn mô tả nếu quá dài
                const truncatedDesc = productDesc.length > 50 ? productDesc.substring(0, 50) + '...' : productDesc;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <img src="${imageUrl}" alt="${productName}" style="width: 50px; height: 50px; object-fit: cover; cursor: pointer;" 
                             class="product-thumbnail" data-id="${productId}" 
                             onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlNmU2ZTYiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';">
                    </td>
                    <td>${productName}</td>
                    <td>${this.formatCurrency(productPrice)}</td>
                    <td>${productCategory}</td>
                    <td>${truncatedDesc}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-product" data-id="${productId}">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="btn btn-sm btn-danger delete-product" data-id="${productId}">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </td>
                `;
                productTable.appendChild(row);
            });
            
            // Thêm lại sự kiện cho các nút
            this.addButtonEventListeners();
            
            // Thêm sự kiện xem chi tiết ảnh sản phẩm
            const thumbnails = document.querySelectorAll('.product-thumbnail');
            thumbnails.forEach(img => {
                img.removeEventListener('click', this.handleThumbnailClick);
                img.addEventListener('click', this.handleThumbnailClick);
            });
        } catch (error) {
            console.error('Lỗi khi tìm kiếm sản phẩm:', error);
            this.showNotification('Không thể tìm kiếm sản phẩm', 'error');
        }
    }

    /**
     * Định dạng tiền tệ
     * @param {number} amount - Số tiền
     * @returns {string} Chuỗi tiền tệ đã định dạng
     */
    static formatCurrency(amount) {
        if (typeof window.formatCurrency === 'function') {
            return window.formatCurrency(amount);
        }
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    /**
     * Hiển thị thông báo
     * @param {string} message - Nội dung thông báo
     * @param {string} type - Loại thông báo ('success', 'error', 'warning', 'info')
     */
    static showNotification(message, type = 'info') {
        try {
            // Sử dụng hàm toàn cục từ custom-utils.js
            if (typeof window.showNotification === 'function') {
                window.showNotification(type, message);
            } else {
                // Fallback nếu hàm toàn cục không tồn tại
                alert(`${type.toUpperCase()}: ${message}`);
            }
        } catch (error) {
            console.error('Lỗi hiển thị thông báo:', error);
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Cập nhật trạng thái uploading cho phần upload ảnh
     * @param {boolean} isUploading - Trạng thái đang upload
     */
    static updateUploadingState(isUploading) {
        const uploadButton = document.getElementById('productImage').parentElement;
        const saveButton = document.getElementById('saveProductBtn');
        
        if (isUploading) {
            // Tạo và hiển thị spinner
            const spinner = document.createElement('div');
            spinner.id = 'upload-spinner';
            spinner.className = 'spinner-border spinner-border-sm text-primary ml-2';
            spinner.setAttribute('role', 'status');
            spinner.innerHTML = '<span class="sr-only">Đang tải...</span>';
            
            // Thêm thông báo đang tải
            const uploadingText = document.createElement('span');
            uploadingText.id = 'uploading-text';
            uploadingText.className = 'ml-2 text-primary';
            uploadingText.textContent = 'Đang tải ảnh...';
            
            uploadButton.appendChild(spinner);
            uploadButton.appendChild(uploadingText);
            
            // Vô hiệu hóa nút lưu
            if (saveButton) {
                saveButton.disabled = true;
                saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xử lý...';
            }
        } else {
            // Xóa spinner và thông báo
            const spinner = document.getElementById('upload-spinner');
            const uploadingText = document.getElementById('uploading-text');
            
            if (spinner) spinner.remove();
            if (uploadingText) uploadingText.remove();
            
            // Kích hoạt lại nút lưu
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.textContent = 'Lưu';
            }
        }
    }

    /**
     * Kiểm tra và xử lý file ảnh trước khi upload
     * @param {File} file - File ảnh người dùng chọn
     * @returns {Promise<File>} - File đã được xử lý
     */
    static async preprocessImage(file) {
        // Kiểm tra loại file
        if (!file.type.match('image.*')) {
            throw new Error('Vui lòng chọn file hình ảnh');
        }
        
        // Kiểm tra kích thước file (tối đa 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Kích thước file quá lớn (tối đa 5MB)');
        }
        
        // Trả về file gốc - có thể mở rộng để nén hoặc resize ảnh nếu cần
        return file;
    }

    /**
     * Hiển thị ảnh sản phẩm chi tiết và thông tin khi click vào thumbnail
     * @param {string|number} productId - ID của sản phẩm cần hiển thị
     */
    static async showProductDetailImage(productId) {
        try {
            // Tìm sản phẩm theo ID - Sử dụng URL API đúng
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/product/${productId}`);
            if (!response.ok) {
                throw new Error('Không thể tải thông tin sản phẩm');
            }
            
            const product = await response.json();
            if (!product) {
                throw new Error('Không tìm thấy sản phẩm');
            }
            
            // Chuẩn hóa dữ liệu
            const productName = product.name || product.Name || 'Không có tên';
            const productPrice = product.price || product.Price || 0;
            const productDesc = product.description || product.Description || 'Không có mô tả';
            const productCategory = product.origin || product.Origin || 'Chưa phân loại';
            const imageUrl = this.normalizeImageUrl(product.imageUrl || product.ImageUrl);
            
            // Tạo modal hiển thị chi tiết
            const detailModalHTML = `
            <div class="modal fade" id="productDetailModal" tabindex="-1" role="dialog" aria-labelledby="productDetailModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="productDetailModalLabel">Chi tiết sản phẩm</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6 text-center">
                                    <img src="${imageUrl}" class="img-fluid product-detail-image" style="max-height: 300px; object-fit: contain;" 
                                         alt="${productName}" onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlNmU2ZTYiIC8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='">
                                </div>
                                <div class="col-md-6">
                                    <h4>${productName}</h4>
                                    <p class="text-primary font-weight-bold">${this.formatCurrency(productPrice)}</p>
                                    <p><strong>Danh mục:</strong> ${productCategory}</p>
                                    <div class="mt-3">
                                        <h5>Mô tả:</h5>
                                        <p>${productDesc}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary edit-from-detail" data-id="${productId}">
                                <i class="fas fa-edit"></i> Chỉnh sửa
                            </button>
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
            `;
            
            // Xóa modal cũ nếu tồn tại
            const existingModal = document.getElementById('productDetailModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // Thêm modal mới vào body
            document.body.insertAdjacentHTML('beforeend', detailModalHTML);
            
            // Hiển thị modal
            $('#productDetailModal').modal('show');
            
            // Thêm sự kiện cho nút chỉnh sửa
            document.querySelector('.edit-from-detail').addEventListener('click', () => {
                $('#productDetailModal').modal('hide');
                this.editProduct(productId);
            });
            
        } catch (error) {
            console.error('Lỗi khi hiển thị chi tiết sản phẩm:', error);
            this.showNotification('Không thể hiển thị chi tiết sản phẩm', 'error');
        }
    }
} 