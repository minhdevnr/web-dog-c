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
        document.getElementById('productImageUrl').value = product.ImageUrl || '';
        document.getElementById('productDescription').value = product.Description || '';
        document.getElementById('productId').value = product.Id;
    } else {
        document.getElementById('productId').value = '';
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
        ImageUrl: document.getElementById('productImageUrl').value,
        Description: document.getElementById('productDescription').value
    };
    
    if (productId) {
        product.Id = productId;
    }
    
    const method = productId ? 'PUT' : 'POST';
    const url = productId 
        ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}` 
        : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`;
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });
        
        if (response.ok) {
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

// Call the function to load products when the page loads
document.addEventListener('DOMContentLoaded', loadProducts); 