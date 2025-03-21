// Load users on page load
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
});

// Function to load all users
async function loadUsers() {
    try {
        const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.USERS);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const users = await response.json();
        const userTableBody = document.getElementById('userTable').querySelector('tbody');
        userTableBody.innerHTML = ''; // Clear existing data

        users.forEach((user, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row">${index + 1}</th>
                <td>${user.FullName || ''}</td>
                <td>${user.Role || ''}</td>
                <td>${user.Address || ''}</td>
                <td>${user.DateOfBirth ? new Date(user.DateOfBirth).toLocaleDateString() : ''}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteUser(${user.Id})">Xóa</button>
                    <button class="btn btn-warning" onclick="editUser(${user.Id})">Sửa</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        NotificationSystem.error('Lỗi khi tải danh sách người dùng');
    }
}

// Event listener for Add User button
document.getElementById('addUserButton').addEventListener('click', function() {
    openUserModal();
});

// Function to open the user modal (for add or edit)
function openUserModal(user = {}) {
    // Reset form
    document.getElementById('userForm').reset();
    
    // Set modal title based on operation (add or edit)
    document.getElementById('userModalLabel').textContent = user.Id ? 'Sửa Người Dùng' : 'Thêm Người Dùng Mới';
    
    // Show/hide username and password fields based on whether we're editing or adding
    const usernameGroup = document.getElementById('usernameGroup');
    const passwordGroup = document.getElementById('passwordGroup');
    
    if (user.Id) {
        // Editing existing user - hide username field (can't change)
        usernameGroup.style.display = 'none';
        // Password field optional for edit
        document.getElementById('password').required = false;
        passwordGroup.style.display = 'block';
    } else {
        // Adding new user - show username and password (required)
        usernameGroup.style.display = 'block';
        passwordGroup.style.display = 'block';
        document.getElementById('password').required = true;
    }
    
    // Populate form if editing
    if (user.Id) {
        document.getElementById('fullName').value = user.FullName || '';
        document.getElementById('role').value = user.Role || '';
        document.getElementById('address').value = user.Address || '';
        document.getElementById('dateOfBirth').value = user.DateOfBirth ? new Date(user.DateOfBirth).toISOString().split('T')[0] : '';
        document.getElementById('email').value = user.Email || '';
        document.getElementById('phoneNumber').value = user.PhoneNumber || '';
        document.getElementById('username').value = user.Username || '';
        document.getElementById('id').value = user.Id;
    } else {
        document.getElementById('id').value = '';
    }
    
    // Show the modal
    $('#userModal').modal('show');
}

// Function to save user
document.getElementById('saveUserButton').addEventListener('click', async function() {
    const userId = document.getElementById('id').value;
    const user = {
        FullName: document.getElementById('fullName').value,
        Role: document.getElementById('role').value,
        Address: document.getElementById('address').value,
        DateOfBirth: document.getElementById('dateOfBirth').value,
        Email: document.getElementById('email').value,
        PhoneNumber: document.getElementById('phoneNumber').value,
        Username: document.getElementById('username').value,
        Password: document.getElementById('password').value,
        Id : document.getElementById('id').value
    };

    const method = userId ? 'PUT' : 'POST';
    const url = userId ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${userId}` : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if (response.ok) {
            const successMessage = userId ? 'Người dùng đã được cập nhật thành công' : 'Người dùng đã được thêm thành công';
            NotificationSystem.success(successMessage);
            loadUsers(); // Reload the user list
            $('#userModal').modal('hide'); // Hide the modal
        } else {
            const error = await response.text();
            NotificationSystem.error('Lỗi: ' + error);
        }
    } catch (error) {
        console.error('Error saving user:', error);
        NotificationSystem.error('Đã xảy ra lỗi khi lưu thông tin người dùng');
    }
});

// Function to edit an existing user
function editUser(userId) {
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${userId}`)
        .then(response => response.json())
        .then(user => {
            document.getElementById('fullName').value = user.FullName || '';
            document.getElementById('role').value = user.Role || '';
            document.getElementById('address').value = user.Address || '';
            document.getElementById('dateOfBirth').value = user.DateOfBirth ? new Date(user.DateOfBirth).toISOString().split('T')[0] : '';
            document.getElementById('email').value = user.Email || '';
            document.getElementById('phoneNumber').value = user.PhoneNumber || '';
            document.getElementById('username').value = user.Username || '';
            document.getElementById('id').value = user.Id || ''; // Nếu bạn có trường ẩn cho ID

            $('#userModal').modal('show'); // Hiển thị modal
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            NotificationSystem.error('Lỗi khi tải thông tin người dùng');
        });
}

// Function to delete a user
async function deleteUser(userId) {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                NotificationSystem.success('Người dùng đã được xóa thành công');
                loadUsers(); // Reload the user list
            } else {
                const error = await response.text();
                NotificationSystem.error(error || 'Không thể xóa người dùng');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            NotificationSystem.error('Đã xảy ra lỗi khi xóa người dùng');
        }
    }
} 