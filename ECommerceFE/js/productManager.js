async function loadProducts() {
    try {
        const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PRODUCTS);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const products = await response.json();
        const productTableBody = document.getElementById('productTable').querySelector('tbody');
        productTableBody.innerHTML = ''; // Clear existing data

        products.forEach((product, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row">${index + 1}</th>
                <td>${product.Name}</td>
                <td>${product.Price}</td>
                <td>${product.Origin}</td>
                <td>${new Date(product.ExpiryDate).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteProduct(${product.Id})">Delete</button>
                    <button class="btn btn-warning" onclick="editProduct(${product.Id})">Edit</button>
                </td>
            `;
            productTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                NotificationSystem.success('Product deleted successfully');
                loadProducts(); // Reload the product list
            } else {
                const error = await response.text();
                NotificationSystem.error(error || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            NotificationSystem.error('An error occurred while deleting the product');
        }
    }
}

function editProduct(productId) {
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}`)
        .then(response => response.json())
        .then(product => {
            openProductModal(product);
        })
        .catch(error => console.error('Error fetching product data:', error));
}

// Event listener for Add Product button
document.getElementById('addProductButton').addEventListener('click', function() {
    openProductModal();
});

// Function to open the product modal (for add or edit)
function openProductModal(product = {}) {
    // Reset form
    document.getElementById('productForm').reset();
    
    // Set modal title based on operation (add or edit)
    document.getElementById('productModalLabel').textContent = product.Id ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới';
    
    // Populate form if editing
    if (product.Id) {
        document.getElementById('productName').value = product.Name || '';
        document.getElementById('productPrice').value = product.Price || '';
        document.getElementById('productOrigin').value = product.Origin || '';
        document.getElementById('productExpiryDate').value = product.ExpiryDate ? new Date(product.ExpiryDate).toISOString().split('T')[0] : '';
        document.getElementById('productDescription').value = product.Description || '';
        document.getElementById('productId').value = product.Id;

        // Display the current image
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.src = product.ImageUrl || ''; // Set the image source
            imagePreview.style.display = product.ImageUrl ? 'block' : 'none'; // Show the image preview if there's an image
        }
    } else {
        document.getElementById('productId').value = '';
        
        // Hide the image preview if adding a new product
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.src = ''; // Clear the image source
            imagePreview.style.display = 'none'; // Hide the image preview
        }
    }
    
    // Show the modal
    $('#productModal').modal('show');
}

// Function to save product (both add and edit)
document.getElementById('saveProductButton').addEventListener('click', async function() {
    const productId = document.getElementById('productId').value;
    
    const product = {
        Name: document.getElementById('productName').value,
        Price: document.getElementById('productPrice').value,
        Origin: document.getElementById('productOrigin').value,
        ExpiryDate: document.getElementById('productExpiryDate').value,
        Description: document.getElementById('productDescription').value
    };

    if (productId) {
        product.Id = productId;
    }

    const method = productId ? 'PUT' : 'POST';
    const url = productId 
        ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}` 
        : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`;

    // Create a FormData object to handle file upload
    const formData = new FormData();
    for (const key in product) {
        formData.append(key, product[key]);
    }

    // Get the file input and append the file to the FormData
    const imageFile = document.getElementById('productImage').files[0];
    if (imageFile) {
        formData.append('Image', imageFile);
    }

    try {
        const response = await fetch(url, {
            method: method,
            body: formData // Use FormData instead of JSON
        });
        
        if (response.ok) {
            debugger
            const successMessage = productId ? 'Sản phẩm đã được cập nhật thành công' : 'Sản phẩm đã được thêm thành công';
            NotificationSystem.success(successMessage);
            loadProducts(); // Reload the product list
            $('#productModal').modal('hide'); // Hide the modal
        } else {
            const error = await response.text();
            NotificationSystem.error('Lỗi: ' + error);
        }
    } catch (error) {
        console.error('Error saving product:', error);
        NotificationSystem.error('Đã xảy ra lỗi khi lưu sản phẩm');
    }
});

// Thêm code để hiển thị xem trước hình ảnh khi người dùng chọn file
document.addEventListener('DOMContentLoaded', function() {
    const productImage = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    
    if (productImage && imagePreview) {
        productImage.addEventListener('change', function(event) {
            if (event.target.files && event.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                }
                
                reader.readAsDataURL(event.target.files[0]);
            }
        });
    }
});

// Call the function to load products when the page loads
document.addEventListener('DOMContentLoaded', loadProducts); 