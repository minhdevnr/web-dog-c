/**
 * admin-user.js - Quản lý người dùng cho trang admin
 */

document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo AdminUserManager
    AdminUserManager.init();
});

/**
 * Lớp quản lý người dùng trong trang admin
 */
class AdminUserManager {
    constructor() {
        this.API_BASE = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`;
        this.initializeEventListeners();
        this.loadUsers();
    }

    initializeEventListeners() {
        // Add user button
        $('#addUserBtn').click(() => this.openUserModal());

        // Save user button
        $('#saveUserBtn').click(() => this.saveUser());

        // Search input
        $('#searchUser').on('input', () => this.filterUsers());

        // Role filter
        $('#roleFilter').change(() => this.filterUsers());

        // Edit user button in detail modal
        $('#editUserBtn').click(() => {
            const userId = $('#userDetailModal').data('userId');
            this.editUser(userId);
        });

        // Delete user button in detail modal
        $('#deleteUserBtn').click(() => {
            const userId = $('#userDetailModal').data('userId');
            this.deleteUser(userId);
        });
    }

    async loadUsers() {
        try {
            const response = await fetch(this.API_BASE);
            const users = await response.json();
            this.displayUsers(users);
        } catch (error) {
            this.showToast('Lỗi khi tải danh sách người dùng', 'error');
        }
    }

    displayUsers(users) {
        const tbody = $('#userTable tbody');
        tbody.empty();

        users.forEach(user => {
            const row = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.role}</td>
                    <td>${user.email}</td>
                    <td>${user.phone}</td>
                    <td>${user.address}</td>
                    <td>${this.formatDate(user.birthDate)}</td>
                    <td>
                        <button class="btn btn-sm btn-info me-2" onclick="adminUserManager.viewUserDetail(${user.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary me-2" onclick="adminUserManager.editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminUserManager.deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });
    }

    openUserModal(user = null) {
        $('#userForm')[0].reset();
        $('#userId').val('');
        $('#userModalTitle').text('Thêm Người dùng');

        if (user) {
            $('#userId').val(user.id);
            $('#userModalTitle').text('Sửa Người dùng');
            $('#name').val(user.name);
            $('#role').val(user.role);
            $('#email').val(user.email);
            $('#phone').val(user.phone);
            $('#address').val(user.address);
            $('#birthDate').val(this.formatDateForInput(user.birthDate));
            $('#username').val(user.username);
        }

        $('#userModal').modal('show');
    }

    async saveUser() {
        const userId = $('#userId').val();
        const userData = {
            name: $('#name').val(),
            role: $('#role').val(),
            email: $('#email').val(),
            phone: $('#phone').val(),
            address: $('#address').val(),
            birthDate: $('#birthDate').val(),
            username: $('#username').val()
        };

        const password = $('#password').val();
        if (password) {
            userData.password = password;
        }

        try {
            const url = userId ? `${this.API_BASE}/${userId}` : this.API_BASE;
            const method = userId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                $('#userModal').modal('hide');
                this.loadUsers();
                this.showToast(userId ? 'Cập nhật người dùng thành công' : 'Thêm người dùng thành công', 'success');
            } else {
                throw new Error('Lỗi khi lưu người dùng');
            }
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    async editUser(userId) {
        try {
            const response = await fetch(`${this.API_BASE}/${userId}`);
            const user = await response.json();
            this.openUserModal(user);
        } catch (error) {
            this.showToast('Lỗi khi tải thông tin người dùng', 'error');
        }
    }

    async deleteUser(userId) {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            return;
        }

        try {
            const response = await fetch(`${this.API_BASE}/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                $('#userDetailModal').modal('hide');
                this.loadUsers();
                this.showToast('Xóa người dùng thành công', 'success');
            } else {
                throw new Error('Lỗi khi xóa người dùng');
            }
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    async viewUserDetail(userId) {
        try {
            const response = await fetch(`${this.API_BASE}/${userId}`);
            const user = await response.json();

            $('#detailName').text(user.name);
            $('#detailRole').text(user.role);
            $('#detailEmail').text(user.email);
            $('#detailPhone').text(user.phone);
            $('#detailAddress').text(user.address);
            $('#detailBirthDate').text(this.formatDate(user.birthDate));

            $('#userDetailModal').data('userId', userId);
            $('#userDetailModal').modal('show');
        } catch (error) {
            this.showToast('Lỗi khi tải thông tin người dùng', 'error');
        }
    }

    filterUsers() {
        const searchTerm = $('#searchUser').val().toLowerCase();
        const roleFilter = $('#roleFilter').val();

        $('#userTable tbody tr').each((_, row) => {
            const $row = $(row);
            const name = $row.find('td:eq(1)').text().toLowerCase();
            const role = $row.find('td:eq(2)').text();
            const email = $row.find('td:eq(3)').text().toLowerCase();
            const phone = $row.find('td:eq(4)').text().toLowerCase();

            const matchesSearch = name.includes(searchTerm) || 
                                email.includes(searchTerm) || 
                                phone.includes(searchTerm);
            const matchesRole = !roleFilter || role === roleFilter;

            $row.toggle(matchesSearch && matchesRole);
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    formatDateForInput(dateString) {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }

    showToast(message, type = 'success') {
        const toast = `
            <div class="toast" role="alert">
                <div class="toast-header ${type === 'success' ? 'bg-success' : 'bg-danger'} text-white">
                    <strong class="me-auto">${type === 'success' ? 'Thành công' : 'Lỗi'}</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;

        $('#toastContainer').append(toast);
        const toastElement = $('.toast').last();
        const bsToast = new bootstrap.Toast(toastElement);
        bsToast.show();

        toastElement.on('hidden.bs.toast', function() {
            $(this).remove();
        });
    }
}

// Initialize the manager when the document is ready
const adminUserManager = new AdminUserManager(); 