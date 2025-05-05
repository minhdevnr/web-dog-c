document.addEventListener("DOMContentLoaded", function() {
    // if (!Cart || !Cart.hasItems()) {
    //     window.location.href = "index-cart.html";
    //     return;
    // }

    // Lấy thông tin phương thức thanh toán đã chọn
    const paymentMethod = localStorage.getItem("selectedPaymentMethod") || "COD";
    
    // Chọn phương thức thanh toán tương ứng trong form
    const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethodRadios.forEach(radio => {
        if (radio.value === paymentMethod) {
            radio.checked = true;
        }
    });
    
    // Hiển thị hoặc ẩn phần chọn ngân hàng dựa trên phương thức thanh toán
    updateBankSelection(paymentMethod);
    
    // Lưu phương thức thanh toán khi thay đổi
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                localStorage.setItem("selectedPaymentMethod", this.value);
                console.log("Đã chọn phương thức thanh toán:", this.value);
                updateBankSelection(this.value);
            }
        });
    });

    // Lắng nghe sự kiện khi người dùng thay đổi địa chỉ để tính phí vận chuyển
    const addressInput = document.getElementById("address");
    if (addressInput) {
        addressInput.addEventListener('change', calculateShippingFee);
        addressInput.addEventListener('blur', calculateShippingFee);
    }

    const placeOrderBtn = document.getElementById("place-order-btn");
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener("click", handlePlaceOrder);
    }

    const checkoutForm = document.getElementById("checkout-form");
    checkoutForm.addEventListener("submit", handlePlaceOrder);
    
    // Tự động điền thông tin người dùng đã đăng nhập
    loadUserInfoIfLoggedIn();
    
    updateCartSummary();
});

// Hàm kiểm tra và tải thông tin người dùng nếu đã đăng nhập
function loadUserInfoIfLoggedIn() {
    // Kiểm tra xem người dùng đã đăng nhập hay chưa
    if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
        // Lấy thông tin người dùng hiện tại
        const user = Auth.getCurrentUser();
        
        // Nếu có user, lấy thông tin chi tiết từ API
        if (user) {
            // Sử dụng Api class để gọi API lấy thông tin người dùng
            Api.get(API_CONFIG.ENDPOINTS.PROFILE)
                .then(userProfile => {
                    if (userProfile) {
                        // Điền thông tin vào form thanh toán
                        document.getElementById('fullName').value = userProfile.FullName || userProfile.Username || '';
                        document.getElementById('phone').value = userProfile.PhoneNumber || '';
                        document.getElementById('email').value = userProfile.Email || '';
                        document.getElementById('address').value = userProfile.Address || '';
                        
                        // Tính phí vận chuyển dựa trên địa chỉ
                        calculateShippingFee();
                    }
                })
                .catch(error => {
                    console.error("Không thể lấy thông tin chi tiết người dùng:", error);
                    // Nếu API trả về lỗi 401 Unauthorized, thực hiện đăng xuất
                    if (error.message && error.message.includes('401')) {
                        console.log("Phiên đăng nhập hết hạn, thực hiện đăng xuất");
                        Auth.logout();
                    }
                });
        }
    }
}

// Hàm tính phí vận chuyển dựa trên địa chỉ
function calculateShippingFee() {
    const addressInput = document.getElementById("address");
    const shippingCostElement = document.getElementById("checkout-shipping-cost");
    
    if (!addressInput || !shippingCostElement) return;
    
    const address = addressInput.value.toLowerCase();
    let shippingFee = 100000; // Mặc định phí vận chuyển ngoại thành là 100,000 VND
    
    // Danh sách các quận nội thành TP. Hồ Chí Minh
    const hcmcDistricts = [
        "quận 1", "quận 2", "quận 3", "quận 4", "quận 5", "quận 6", "quận 7", "quận 8", "quận 9", "quận 10",
        "quận 11", "quận 12", "quận bình thạnh", "quận gò vấp", "quận phú nhuận", "quận tân bình",
        "quận tân phú", "quận bình tân", "thủ đức", "quận thủ đức", "tp thủ đức", "thành phố thủ đức"
    ];
    
    // Kiểm tra xem địa chỉ có thuộc nội thành TP. Hồ Chí Minh không
    const isInHCMC = hcmcDistricts.some(district => address.includes(district)) || 
                     address.includes("hồ chí minh") || 
                     address.includes("tp hcm") || 
                     address.includes("tphcm");
    
    if (isInHCMC) {
        shippingFee = 30000; // Phí vận chuyển nội thành là 30,000 VND
    }
    
    // Cập nhật hiển thị phí vận chuyển
    shippingCostElement.textContent = `Giao hàng tiêu chuẩn - ${formatCurrency(shippingFee)}`;
    
    // Cập nhật tổng tiền bao gồm phí vận chuyển
    updateTotalWithShipping(shippingFee);
    
    return shippingFee;
}

// Hàm cập nhật tổng tiền bao gồm phí vận chuyển
function updateTotalWithShipping(shippingFee) {
    debugger;
    const cartItems = JSON.parse(localStorage.getItem('cart'));
    const totalElement = document.getElementById("total-amount");
    const checkoutTotalElement = document.getElementById("checkout-total-cost");
    
    if (!cartItems || cartItems.length === 0) return;
    
    let subtotal = 0;
    cartItems.forEach(item => {
        subtotal += item.Price * item.Quantity;
    });
    
    const totalAmount = subtotal + shippingFee;
    
    // Cập nhật tổng tiền trong trang cart summary
    if (totalElement) {
        totalElement.textContent = formatCurrency(totalAmount);
    }
    
    // Cập nhật tổng tiền trong checkout summary
    if (checkoutTotalElement) {
        checkoutTotalElement.textContent = formatCurrency(totalAmount);
    }
}

function updateCartSummary() {
    const cartItems = JSON.parse(localStorage.getItem('cart'));
    const summaryContainer = document.getElementById("checkout-summary");
    const itemCountElement = document.getElementById("checkout-item-count");
    const totalElement = document.getElementById("checkout-total-cost");
    
    if (!cartItems || cartItems.length === 0) {
        window.location.href = "index-cart.html";
        return;
    }
    
    let itemCount = 0;
    let totalAmount = 0;
    if(summaryContainer){
    // Xóa tất cả các mục hiện có
    summaryContainer.innerHTML = "";
    
    // Thêm từng mục vào bảng tóm tắt
    cartItems.forEach(item => {
        const itemRow = document.createElement("div");
        itemRow.className = "cart-item summary-item";
        
        const itemPrice = parseInt(item.Price);
        const itemTotal = itemPrice * item.Quantity;
        
        itemRow.innerHTML = `
            <div class="item-details">
                <div class="item-image">
                    <img src="${item.Image}" alt="${item.Name}">
                </div>
                <div class="item-info">
                    <h4>${item.Name}</h4>
                    <div class="item-meta">
                        <span class="item-quantity">SL: ${item.Quantity}</span>
                        <span class="item-price">${formatCurrency(itemPrice)}</span>
                    </div>
                </div>
            </div>
            <div class="item-total">
                ${formatCurrency(itemTotal)}
            </div>
        `;
        
        summaryContainer.appendChild(itemRow);
        
        itemCount += item.Quantity;
        totalAmount += itemTotal;
    });
    }
    if(itemCountElement){
    // Cập nhật số lượng mục và tổng tiền
    itemCountElement.textContent = itemCount;
    }
    if(totalElement){
    totalElement.textContent = formatCurrency(totalAmount);
    }
    debugger;
    // Cập nhật số lượng mục trong checkout summary
    const checkoutItemCountElement = document.getElementById("checkout-item-count");
    if (checkoutItemCountElement) {
        checkoutItemCountElement.textContent = itemCount;
    }
    
    // Tính phí vận chuyển sau khi cập nhật giỏ hàng
    calculateShippingFee();
}

// Hiển thị hoặc ẩn phần chọn ngân hàng dựa trên phương thức thanh toán
function updateBankSelection(paymentMethod) {
    const bankSelectionContainer = document.getElementById("bank-selection-container");
    
    if (!bankSelectionContainer) {
        // Tạo phần chọn ngân hàng nếu chưa có
        const paymentSection = document.querySelector(".payment-methods");
        
        if (paymentSection) {
            const bankContainer = document.createElement("div");
            bankContainer.id = "bank-selection-container";
            bankContainer.className = "bank-selection";
            bankContainer.style.display = paymentMethod === "VNPay" ? "block" : "none";
            
            bankContainer.innerHTML = `
                <h4>Chọn ngân hàng</h4>
                <select id="bank-code" name="bankCode" class="form-control">
                    <option value="NCB">Ngân hàng NCB</option>
                    <option value="VNPAYQR">VNPAYQR</option>
                    <option value="VNBANK">LOCAL BANK</option>
                    <option value="IB">INTERNET BANKING</option>
                    <option value="ATM">ATM CARD</option>
                    <option value="INTCARD">INTERNATIONAL CARD</option>
                    <option value="VISA">VISA</option>
                    <option value="MASTERCARD">MASTERCARD</option>
                    <option value="JCB">JCB</option>
                    <option value="UPI">UPI</option>
                    <option value="VIB">VIB</option>
                    <option value="VIETCAPITALBANK">VIETCAPITALBANK</option>
                    <option value="SCB">Ngân hàng SCB</option>
                    <option value="NCB">Ngân hàng NCB</option>
                    <option value="SACOMBANK">Ngân hàng SacomBank</option>
                    <option value="EXIMBANK">Ngân hàng EximBank</option>
                    <option value="MSBANK">Ngân hàng MSBANK</option>
                    <option value="NAMABANK">Ngân hàng NamABank</option>
                    <option value="VNMART">Ví điện tử VnMart</option>
                    <option value="VIETINBANK">Ngân hàng Vietinbank</option>
                    <option value="VIETCOMBANK">Ngân hàng VCB</option>
                    <option value="HDBANK">Ngân hàng HDBank</option>
                    <option value="DONGABANK">Ngân hàng Đông Á</option>
                    <option value="TPBANK">Ngân hàng TPBank</option>
                    <option value="OJB">Ngân hàng OceanBank</option>
                    <option value="BIDV">Ngân hàng BIDV</option>
                    <option value="TECHCOMBANK">Ngân hàng Techcombank</option>
                    <option value="VPBANK">Ngân hàng VPBank</option>
                    <option value="AGRIBANK">Ngân hàng Agribank</option>
                    <option value="MBBANK">Ngân hàng MBBank</option>
                    <option value="ACB">Ngân hàng ACB</option>
                    <option value="OCB">Ngân hàng OCB</option>
                    <option value="SHB">Ngân hàng SHB</option>
                </select>
                
                <h4>Ngôn ngữ</h4>
                <select id="language" name="language" class="form-control">
                    <option value="vn">Tiếng Việt</option>
                    <option value="en">Tiếng Anh</option>
                </select>
            `;
            
            paymentSection.appendChild(bankContainer);
        }
    } else {
        // Hiển thị hoặc ẩn phần chọn ngân hàng hiện có
        bankSelectionContainer.style.display = paymentMethod === "VNPay" ? "block" : "none";
    }
}

async function handlePlaceOrder(event) {
    event.preventDefault();
    
    const placeOrderBtn = document.getElementById("place-order-btn");
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = "Đang xử lý...";
    
    try {
        const form = document.getElementById("checkout-form");
        const cartItems = JSON.parse(localStorage.getItem('cart'));
        
        if (!cartItems || cartItems.length === 0) {
            showToast("Giỏ hàng trống", "error");
            return;
        }
        
        // Lấy giá trị từ form
        const fullName = form.elements.fullName.value;
        const phone = form.elements.phone.value;
        const email = form.elements.email.value;
        const address = form.elements.address.value;
        const notes = form.elements.notes.value || "";
        
        // Lấy phương thức thanh toán đã chọn
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        // Tính phí vận chuyển
        const shippingFee = calculateShippingFee();
        
        // Tính tổng tiền sản phẩm
        let subtotal = 0;
        cartItems.forEach(item => {
            subtotal += item.Price * item.Quantity;
        });
        
        // Tổng tiền đơn hàng bao gồm phí vận chuyển
        const totalAmount = subtotal + shippingFee;
        
        // Chuẩn bị dữ liệu đơn hàng
        const orderData = {
            fullName: fullName,
            phone: phone,
            email: email,
            address: address,
            notes: notes,
            items: cartItems.map(item => ({
                productId: item.Id,
                quantity: item.Quantity,
                price: parseInt(item.Price)
            })),
            subtotal: subtotal,
            shippingFee: shippingFee,
            totalAmount: totalAmount,
            paymentMethod: paymentMethod
        };
        
        console.log("Đang gửi dữ liệu đơn hàng:", orderData);
        
        let response;
        
        // Xử lý theo phương thức thanh toán
        if (paymentMethod === "VNPay") {
            // Xử lý thanh toán VNPay
            const endpoint = `${API_CONFIG.ENDPOINTS.PAYMENTS}/vnpay/create-payment`;
            
            // Thêm thông tin cần thiết cho VNPay
            orderData.Amount = totalAmount;
            orderData.OrderId = `DH${Date.now()}`;
            orderData.OrderDesc = `Thanh toán đơn hàng ${orderData.OrderId}`;
            orderData.BankCode = document.getElementById("bank-code")?.value || "NCB";
            orderData.Language = document.getElementById("language")?.value || "vn";
            orderData.OrderType = "billpayment";
            
            // Gọi API tạo thanh toán VNPay sử dụng Api class
            try {
                const paymentResult = await Api.post(endpoint, orderData);
                
                if (paymentResult && paymentResult.PaymentUrl) {
                    // Lưu thông tin đơn hàng tạm thời
                    localStorage.setItem("pendingOrder", JSON.stringify({
                        orderId: paymentResult.orderId,
                        paymentMethod: "VNPay"
                    }));
                    
                    // Chuyển hướng đến trang thanh toán VNPay
                    window.location.href = paymentResult.PaymentUrl;
                    return;
                } else {
                    throw new Error("Không nhận được URL thanh toán từ VNPay");
                }
            } catch (error) {
                console.error("Lỗi khi tạo thanh toán VNPay:", error);
                throw new Error("Không thể tạo thanh toán VNPay: " + error.message);
            }
        } else {
            // Xử lý thanh toán COD sử dụng Api class
            try {
                const orderResult = await Api.post(API_CONFIG.ENDPOINTS.ORDERS, orderData);
                
                // Xóa giỏ hàng
                localStorage.removeItem("cart");
                
                // Hiển thị thông báo thành công
                showToast("Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm.", "success");
                
                // Chuyển hướng đến trang xác nhận đơn hàng
                window.location.href = `order-confirmation.html?orderId=${orderResult.orderId}`;
            } catch (error) {
                console.error("Lỗi khi tạo đơn hàng COD:", error);
                throw new Error("Không thể tạo đơn hàng: " + error.message);
            }
        }
    } catch (error) {
        console.error("Lỗi khi đặt hàng:", error);
        showToast(error.message || "Đã xảy ra lỗi khi xử lý đơn hàng", "error");
    } finally {
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = "Đặt hàng";
    }
}

// Hàm xử lý callback từ VNPay
async function handleVNPayCallback() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const vnpResponseCode = urlParams.get('vnp_ResponseCode');
        const orderId = urlParams.get('vnp_TxnRef');
        
        if (vnpResponseCode === '00') {
            // Thanh toán thành công
            const pendingOrder = JSON.parse(localStorage.getItem("pendingOrder"));
            
            if (pendingOrder && pendingOrder.orderId === orderId) {
                // Cập nhật trạng thái đơn hàng
                const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/confirm-payment`, {
                    method: "POST"
                });
                
                if (response.ok) {
                    // Xóa thông tin đơn hàng tạm thời
                    localStorage.removeItem("pendingOrder");
                    
                    // Hiển thị thông báo thành công
                    showToast("Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.", "success");
                    
                    // Chuyển hướng đến trang xác nhận đơn hàng
                    window.location.href = `order-confirmation.html?orderId=${orderId}`;
                } else {
                    throw new Error("Không thể cập nhật trạng thái đơn hàng");
                }
            } else {
                throw new Error("Không tìm thấy thông tin đơn hàng");
            }
        } else {
            // Thanh toán thất bại
            showToast("Thanh toán thất bại. Vui lòng thử lại.", "error");
            window.location.href = "checkout.html";
        }
    } catch (error) {
        console.error("Lỗi khi xử lý callback VNPay:", error);
        showToast("Đã xảy ra lỗi khi xử lý thanh toán", "error");
        window.location.href = "checkout.html";
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Hiển thị toast
    setTimeout(() => {
        toast.classList.add("show");
    }, 100);
    
    // Ẩn và xóa toast sau 3 giây
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}
