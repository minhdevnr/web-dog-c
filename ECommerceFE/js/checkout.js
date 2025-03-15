document.addEventListener('DOMContentLoaded', function() {
  // Display cart items in checkout summary
  const checkoutItems = document.getElementById('checkout-items');
  const itemCount = document.getElementById('checkout-item-count');
  const totalCost = document.getElementById('checkout-total-cost');
  
  // Use the cartManager to get cart items
  const items = cartManager.getItems();
  let total = 0;
  
  items.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'order-item';
    itemDiv.innerHTML = `
      <img src="${item.ImageUrl}" alt="${item.Name}">
      <div class="order-item-details">
        <div class="order-item-name">${item.Name}</div>
        <div class="order-item-price">${item.Price.toLocaleString()} đ</div>
        <div class="order-item-quantity">Số lượng: ${item.Quantity}</div>
      </div>
    `;
    checkoutItems.appendChild(itemDiv);
    total += item.Price * item.Quantity;
  });
  
  itemCount.innerText = items.length;
  totalCost.innerText = total.toLocaleString();
  
  // Form submission handler
  const checkoutForm = document.getElementById('checkout-form');
  checkoutForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Add your checkout processing logic here
    
    // Example:
    alert('Đặt hàng thành công!');
    // Redirect to confirmation page or home page
  });
});
