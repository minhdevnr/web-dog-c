// Cart functionality
class CartManager {
    constructor() {
        // Initialize empty cart in memory
        this.cart = [];
        // Load cart from server when constructed
        this.loadCartFromServer();
    }

    async loadCartFromServer() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART}/items`);
            if (!response.ok) {
                throw new Error('Failed to fetch cart items');
            }
            this.cart = await response.json();
            this.updateCartUI();
        } catch (error) {
            console.error('Error loading cart:', error);
            NotificationSystem.error('Không thể tải giỏ hàng');
        }
    }

    // Get all items in cart
    getItems() {
        return this.cart;
    }

    // Add item to cart
    async addItem(productId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, quantity: 1 })
            });

            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }

            // Reload cart from server to get updated state
            await this.loadCartFromServer();
            NotificationSystem.success('Sản phẩm đã được thêm vào giỏ hàng');
        } catch (error) {
            console.error('Error adding to cart:', error);
            NotificationSystem.error('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
        }
    }

    // Remove item from cart
    async removeItem(productId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART}/items/${productId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to remove item from cart');
            }

            await this.loadCartFromServer();
            NotificationSystem.success('Sản phẩm đã được xóa khỏi giỏ hàng');
        } catch (error) {
            console.error('Error removing from cart:', error);
            NotificationSystem.error('Có lỗi xảy ra khi xóa sản phẩm');
        }
    }

    // Update item quantity
    async updateQuantity(productId, quantity) {
        try {
            if (quantity < 1) return;

            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART}/items/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity })
            });

            if (!response.ok) {
                throw new Error('Failed to update quantity');
            }

            await this.loadCartFromServer();
        } catch (error) {
            console.error('Error updating quantity:', error);
            NotificationSystem.error('Có lỗi xảy ra khi cập nhật số lượng');
        }
    }

    // Clear cart
    async clearCart() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART}/clear`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to clear cart');
            }

            this.cart = [];
            this.updateCartUI();
        } catch (error) {
            console.error('Error clearing cart:', error);
            NotificationSystem.error('Có lỗi xảy ra khi xóa giỏ hàng');
        }
    }

    // Get total items count
    getTotalItems() {
        debugger
        return this.cart.reduce((sum, item) => sum + item.Quantity, 0);
    }

    // Get total price
    getTotalPrice() {
        return this.cart.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
    }

    // Update cart UI
    updateCartUI() {
        const cartContainer = document.getElementById('cart-items');
        if(cartContainer)
        {
            cartContainer.innerHTML = ''; // Clear existing items
            let total = 0;
            
            // Create table structure with translations
            const tableHTML = `
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th class="product-col" data-i18n="product">${__('product')}</th>
                            <th class="price-col" data-i18n="unit_price">${__('unit_price')}</th>
                            <th class="quantity-col" data-i18n="quantity">${__('quantity')}</th>
                            <th class="total-col" data-i18n="subtotal">${__('subtotal')}</th>
                            <th class="action-col"></th>
                        </tr>
                    </thead>
                    <tbody id="cart-table-body">
                    </tbody>
                </table>
            `;
            
            cartContainer.innerHTML = tableHTML;
            const tableBody = document.getElementById('cart-table-body');
            
            if (this.cart.length === 0) {
                const emptyRow = document.createElement('tr');
                emptyRow.className = 'empty-cart-row';
                emptyRow.innerHTML = `
                    <td colspan="5">
                        <div class="empty-cart-message">
                            <i class="fas fa-shopping-cart"></i>
                            <p data-i18n="empty_cart">${__('empty_cart')}</p>
                            <a href="index.html" class="btn" data-i18n="continue_shopping">${__('continue_shopping')}</a>
                        </div>
                    </td>
                `;
                tableBody.appendChild(emptyRow);
            } else {
                this.cart.forEach(item => {
                    const row = document.createElement('tr');
                    row.className = 'cart-item-row';
                    row.innerHTML = `
                        <td class="product-col">
                            <div class="product-info">
                                <img src="${item.ImageUrl}" alt="${item.Name}" />
                                <div class="product-name">${item.Name}</div>
                            </div>
                        </td>
                        <td class="price-col">${(item.Price).toLocaleString()} đ</td>
                        <td class="quantity-col">
                            <div class="quantity-control">
                                <button class="quantity-btn minus" onclick="cartManager.updateQuantity(${item.ProductId}, ${item.Quantity - 1})">-</button>
                                <input type="number" value="${item.Quantity}" min="1" class="quantity-input" 
                                    onchange="cartManager.updateQuantity(${item.ProductId}, this.value)" />
                                <button class="quantity-btn plus" onclick="cartManager.updateQuantity(${item.ProductId}, ${item.Quantity + 1})">+</button>
                            </div>
                        </td>
                        <td class="total-col">${(item.Price * item.Quantity).toLocaleString()} đ</td>
                        <td class="action-col">
                            <button class="remove-item-btn" onclick="cartManager.removeItem(${item.ProductId})" title="${__('remove')}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                    total += item.Price * item.Quantity;
                });
            }

            document.getElementById('total-cost').innerText = total.toLocaleString();
            document.getElementById('item-count').innerText = this.cart.length;
         }
        // Re-translate the page after updating UI
        translatePage();
        }
}

// Initialize cart manager
const cartManager = new CartManager();

// Update cart UI when page loads
document.addEventListener('DOMContentLoaded', () => {
    cartManager.loadCartFromServer();
}); 