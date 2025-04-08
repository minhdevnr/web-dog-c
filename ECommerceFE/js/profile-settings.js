document.addEventListener('DOMContentLoaded', function() {
    // Lấy thông tin người dùng từ localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Cập nhật thông tin hiển thị
    document.getElementById('display-name').textContent = currentUser.FullName || currentUser.Username;
    document.getElementById('display-email').textContent = currentUser.Email || '';

    // Điền thông tin vào form
    document.getElementById('fullName').value = currentUser.FullName || '';
    document.getElementById('email').value = currentUser.Email || '';
    document.getElementById('phone').value = currentUser.Phone || '';
    document.getElementById('company').value = currentUser.Company || '';

    // Xử lý chuyển tab
    const menuItems = document.querySelectorAll('.menu-item');
    const contents = document.querySelectorAll('.settings-content');

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all menu items
            menuItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');

            // Hide all contents
            contents.forEach(content => content.style.display = 'none');
            // Show selected content
            document.getElementById(`${this.dataset.tab}-settings`).style.display = 'block';
        });
    });

    // Xử lý form submit
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Cập nhật thông tin người dùng
        currentUser.FullName = document.getElementById('fullName').value;
        currentUser.Email = document.getElementById('email').value;
        currentUser.Phone = document.getElementById('phone').value;
        currentUser.Company = document.getElementById('company').value;

        // Lưu lại vào localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Hiển thị thông báo
        alert('Cập nhật thông tin thành công!');
        
        // Cập nhật tên hiển thị
        document.getElementById('display-name').textContent = currentUser.FullName;
        document.getElementById('display-email').textContent = currentUser.Email;
    });

    // Xử lý đổi mật khẩu
    document.getElementById('change-password').addEventListener('click', function() {
        // Implement password change logic here
        const oldPassword = prompt('Nhập mật khẩu cũ:');
        if (oldPassword) {
            const newPassword = prompt('Nhập mật khẩu mới:');
            if (newPassword) {
                const confirmPassword = prompt('Xác nhận mật khẩu mới:');
                if (newPassword === confirmPassword) {
                    // TODO: Call API to change password
                    alert('Đổi mật khẩu thành công!');
                } else {
                    alert('Mật khẩu xác nhận không khớp!');
                }
            }
        }
    });

    // Xử lý thay đổi ngôn ngữ
    document.querySelectorAll('input[name="language"]').forEach(radio => {
        radio.addEventListener('change', function() {
            localStorage.setItem('language', this.value);
            // TODO: Implement language change logic
            alert(`Đã chuyển ngôn ngữ sang ${this.value === 'vi' ? 'Tiếng Việt' : 'English'}`);
        });
    });
}); 