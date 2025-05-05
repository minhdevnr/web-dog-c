document.addEventListener("DOMContentLoaded", async function() {
    try {
        console.log("Đang xử lý kết quả thanh toán...");
        
        // Lấy tất cả các tham số từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const parameterObject = {};
        
        // Chuyển đổi tham số URL thành object và ghi log
        for (const [key, value] of urlParams.entries()) {
            parameterObject[key] = value;
        }
        console.log("Tham số nhận được:", parameterObject);
        
        // Kiểm tra xem có tham số VNP không
        if (!parameterObject.vnp_ResponseCode) {
            displayError("Không tìm thấy thông tin thanh toán từ VNPay");
            return;
        }
        
        // Lấy ID đơn hàng đang chờ xử lý từ localStorage
        const pendingOrderId = localStorage.getItem("pendingOrderId");
        console.log("ID đơn hàng đang chờ:", pendingOrderId);
        
        if (!pendingOrderId) {
            displayError("Không tìm thấy thông tin đơn hàng đang chờ xử lý");
            return;
        }
        
        // Gọi API để xác minh kết quả thanh toán
        console.log("Đang gửi yêu cầu xác minh thanh toán...");
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/payment/vnpay/payment-return`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...parameterObject,
                orderId: pendingOrderId
            })
        });
        
        console.log("Mã trạng thái phản hồi:", response.status);
        
        // Xử lý lỗi HTTP
        if (!response.ok) {
            let errorMessage = "Đã xảy ra lỗi khi xác minh thanh toán";
            
            try {
                const errorData = await response.json();
                console.error("Dữ liệu lỗi:", errorData);
                
                if (response.status === 400) {
                    errorMessage = errorData.message || "Dữ liệu không hợp lệ";
                } else if (response.status === 404) {
                    errorMessage = "Không tìm thấy đơn hàng";
                } else if (response.status === 500) {
                    errorMessage = "Lỗi hệ thống, vui lòng thử lại sau";
                }
            } catch (e) {
                console.error("Không thể phân tích dữ liệu lỗi:", e);
            }
            
            displayError(errorMessage);
            return;
        }
        
        // Xử lý kết quả thanh toán
        const paymentResult = await response.json();
        console.log("Kết quả thanh toán:", paymentResult);
        
        if (paymentResult.success) {
            // Thanh toán thành công
            displaySuccess(paymentResult.message || "Thanh toán thành công", pendingOrderId);
            
            // Xóa giỏ hàng và ID đơn hàng đang chờ
            Cart.clearCart();
            localStorage.removeItem("pendingOrderId");
        } else {
            // Thanh toán thất bại
            let errorMessage = paymentResult.message || "Thanh toán thất bại";
            
            // Xử lý mã lỗi cụ thể từ VNPay
            const responseCode = parameterObject.vnp_ResponseCode;
            if (responseCode === "24") {
                errorMessage = "Giao dịch không thành công do: Khách hàng đã hủy giao dịch";
            } else if (responseCode === "09") {
                errorMessage = "Thẻ/Tài khoản của khách hàng không đủ số dư để thực hiện giao dịch";
            } else if (responseCode === "10") {
                errorMessage = "Xác thực thông tin thẻ/tài khoản không đúng";
            } else if (responseCode === "11") {
                errorMessage = "Đã hết hạn chờ thanh toán";
            } else if (responseCode === "65") {
                errorMessage = "Tài khoản của quý khách đã vượt quá hạn mức giao dịch trong ngày";
            }
            
            displayError(errorMessage);
        }
    } catch (error) {
        console.error("Lỗi xử lý kết quả thanh toán:", error);
        displayError("Đã xảy ra lỗi khi xử lý kết quả thanh toán");
    }
});

function displaySuccess(message, orderId) {
    const resultContainer = document.getElementById("payment-result-container");
    if (!resultContainer) return;
    
    resultContainer.innerHTML = `
        <div class="payment-success">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Thanh toán thành công</h2>
            <p>${message}</p>
            <p>Mã đơn hàng: <strong>${orderId}</strong></p>
            <div class="action-buttons">
                <a href="index.html" class="btn btn-primary">Tiếp tục mua sắm</a>
                <a href="order-detail.html?id=${orderId}" class="btn btn-secondary">Xem chi tiết đơn hàng</a>
            </div>
        </div>
    `;
}

function displayError(message) {
    const resultContainer = document.getElementById("payment-result-container");
    if (!resultContainer) return;
    
    resultContainer.innerHTML = `
        <div class="payment-error">
            <div class="error-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <h2>Thanh toán thất bại</h2>
            <p>${message}</p>
            <div class="action-buttons">
                <a href="checkout.html" class="btn btn-primary">Thử lại</a>
                <a href="index.html" class="btn btn-secondary">Quay về trang chủ</a>
            </div>
        </div>
    `;
    
    // Lưu lại pendingOrderId để có thể thử lại
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
} 