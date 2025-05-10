document.addEventListener("DOMContentLoaded", function() {
    
    // Lấy orderId và status từ URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    const status = urlParams.get('status');
    
    // Hiển thị ID đơn hàng
    document.getElementById('order-id').textContent = orderId || 'N/A';
    
    // Nếu có status từ URL (từ VNPay), cập nhật giao diện dựa vào trạng thái
    if (status) {
        updateStatusUI(status);
    }
    
    // Hiển thị thông tin về phương thức thanh toán
    const paymentMethod = localStorage.getItem("selectedPaymentMethod") || "COD";
    document.getElementById('payment-method').textContent = paymentMethod === "VNPay" ? "VNPay" : "Thanh toán khi nhận hàng (COD)";
    
    // Lấy thông tin đơn hàng từ API
    fetchOrderDetails(orderId);
    
    // Xóa giỏ hàng sau khi đơn hàng đã xác nhận
    if (status === "Paymented" || !status) {
        Cart.clearCart();
    }
});

function updateStatusUI(status) {
    const statusElement = document.getElementById('order-status');
    const headerElement = document.getElementById('confirmation-header');
    
    if (status === "Paymented" || status === "Pending") {
        // Đơn hàng thành công
        statusElement.textContent = status === "Paymented" ? "Đã thanh toán" : "Chờ xử lý";
        statusElement.classList.add('status-success');
        
        headerElement.innerHTML = `
            <h1>Đặt hàng thành công!</h1>
            <p>Cảm ơn bạn đã đặt hàng tại Web Dog C</p>
        `;
    } else {
        // Đơn hàng thất bại
        statusElement.textContent = "Thanh toán thất bại";
        statusElement.classList.add('status-error');
        
        headerElement.innerHTML = `
            <h1>Đặt hàng không thành công</h1>
            <p>Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ với chúng tôi.</p>
        `;
    }
}

async function fetchOrderDetails(orderId) {
    if (!orderId) {
        console.error("Không có mã đơn hàng");
        return;
    }
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}`);
        
        if (!response.ok) {
            throw new Error(`Lỗi khi lấy thông tin đơn hàng: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data) {
            displayOrderDetails(data);
        } else {
            console.error("Không thể lấy thông tin đơn hàng", data.Message);
        }
    } catch (error) {
        console.error("Lỗi khi lấy thông tin đơn hàng:", error);
        
        // Nếu không lấy được thông tin đơn hàng từ API, hiển thị dữ liệu từ localStorage
        displayCartItemsFromLocalStorage();
    }
}

function displayOrderDetails(order) {
    // Cập nhật trạng thái đơn hàng
    document.getElementById('order-status').textContent = getStatusText(order.Status);
    
    // Hiển thị các sản phẩm trong đơn hàng
    const orderItemsContainer = document.getElementById('order-items');
    orderItemsContainer.innerHTML = '';
    
    if (order.Items && order.Items.length > 0) {
        order.Items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <div class="item-image">
                    <img src="${item.Product.Image || '../images/product-placeholder.png'}" alt="${item.Product.Name}">
                </div>
                <div class="item-details">
                    <h3>${item.Product.Name}</h3>
                    <div class="item-meta">
                        <span class="item-quantity">SL: ${item.Quantity}</span>
                        <span class="item-price">${formatCurrency(item.Price)}</span>
                    </div>
                </div>
                <div class="item-total">${formatCurrency(item.Total)}</div>
            `;
            orderItemsContainer.appendChild(itemElement);
        });
    }
    
    // Cập nhật tổng tiền
    document.getElementById('subtotal').textContent = formatCurrency(order.Total);
    //shipping-fee
    document.getElementById('shipping-fee').textContent = formatCurrency(order.ShippingFee);
    document.getElementById('total-amount').textContent = formatCurrency(order.Total);
}

function displayCartItemsFromLocalStorage() {
    const cartItems = JSON.parse(localStorage.getItem('cart'));
    
    if (!cartItems || cartItems.length === 0) {
        console.warn("Không có dữ liệu giỏ hàng trong localStorage");
        return;
    }
    
    const orderItemsContainer = document.getElementById('order-items');
    orderItemsContainer.innerHTML = '';
    
    let totalAmount = 0;
    
    cartItems.forEach(item => {
        const itemPrice = parseInt(item.Price);
        const itemTotal = itemPrice * item.Quantity;
        totalAmount += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="item-image">
                <img src="${item.Image}" alt="${item.Name}">
            </div>
            <div class="item-details">
                <h3>${item.Name}</h3>
                <div class="item-meta">
                    <span class="item-quantity">SL: ${item.Quantity}</span>
                    <span class="item-price">${formatCurrency(itemPrice)}</span>
                </div>
            </div>
            <div class="item-total">${formatCurrency(itemTotal)}</div>
        `;
        orderItemsContainer.appendChild(itemElement);
    });
    
    // Cập nhật tổng tiền
    document.getElementById('subtotal').textContent = formatCurrency(totalAmount);
    document.getElementById('total-amount').textContent = formatCurrency(totalAmount);
}

function getStatusText(status) {
    switch (status) {
        case "Pending":
            return "Chờ xử lý";
        case "Processing":
            return "Đang xử lý";
        case "Shipped":
            return "Đang giao hàng";
        case "Paymented":
            return "Đã thanh toán";
        case "Failed":
            return "Thanh toán thất bại";
        case "Cancelled":
            return "Đã hủy";
        default:
            return status;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
} 