/**
 * admin-user.js - Quản lý người dùng cho trang admin
 */

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

        // Search and filter
        $('#searchUser').on('input', () => this.filterUsers());
        $('#roleFilter').change(() => this.filterUsers());

        // Edit and delete actions
        $(document).on('click', '.view-user', (e) => this.viewUserDetail(e));
        $(document).on('click', '.edit-user', (e) => this.editUser(e));
        $(document).on('click', '.delete-user', (e) => this.confirmDeleteUser(e));
        $('#confirmDeleteBtn').click(() => this.deleteUser());
        
        // Edit và delete từ modal chi tiết
        $('#editFromDetailBtn').click(() => this.editFromDetail());
        $('#deleteFromDetailBtn').click(() => this.deleteFromDetail());
    }

    async loadUsers() {
        try {
            const response = await fetch(this.API_BASE);
            const users = await response.json();
            this.displayUsers(users);
        } catch (error) {
            console.error('Error loading users:', error);
            this.showToast('Lỗi khi tải danh sách người dùng', 'error');
        }
    }

    displayUsers(response) {
        const tbody = $('#userTable tbody');
        tbody.empty();
        
        // Kiểm tra response có hợp lệ không
        if (!response || !response.Items || !Array.isArray(response.Items)) {
            console.error('Invalid response data:', response);
            this.showToast('Dữ liệu không hợp lệ', 'error');
            return;
        }
        
        // Hiển thị danh sách người dùng
        response.Items.forEach(user => {
            const row = `
                <tr>
                    <td>${user.Id}</td>
                    <td>${user.Username || 'N/A'}</td>
                    <td>${user.Email || 'N/A'}</td>
                    <td>${user.PhoneNumber || 'N/A'}</td>
                    <td>${user.Role || 'user'}</td>
                    <td><span class="badge bg-${user.IsActive ? 'success' : 'danger'}">${user.IsActive ? 'Hoạt động' : 'Không hoạt động'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info view-user" data-id="${user.Id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary edit-user" data-id="${user.Id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-user" data-id="${user.Id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });
    }

    openUserModal(user = null) {
        const modal = $('#userModal');
        const form = $('#userForm')[0];
        form.reset();
        $('#userId').val('');
        $('#userModalTitle').text('Thêm Người dùng');

        if (user) {
            $('#userModalTitle').text('Sửa Người dùng');
            $('#userId').val(user.Id);
            $('#name').val(user.Username);
            $('#email').val(user.Email);
            $('#phone').val(user.PhoneNumber);
            $('#role').val(user.Role);
            $('#status').val(user.IsActive ? 'active' : 'inactive');
            $('#address').val(user.Address || '');
            // Ẩn trường mật khẩu khi sửa người dùng (để trống sẽ giữ mật khẩu cũ)
            $('#password').prop('required', false);
        } else {
            // Yêu cầu mật khẩu khi thêm người dùng mới
            $('#password').prop('required', true);
        }

        modal.modal('show');
    }

    async saveUser() {
        const form = $('#userForm')[0];
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const userId = $('#userId').val();
        const isEdit = userId !== '';
        
        // Chuẩn bị dữ liệu người dùng
        const userData = isEdit 
            ? {
                Username: $('#name').val(),
                Email: $('#email').val(),
                PhoneNumber: $('#phone').val(),
                Address: $('#address').val(),
                Role: $('#role').val(),
                IsActive: $('#status').val() === 'active'
            }
            : {
                Username: $('#name').val(),
                Email: $('#email').val(),
                PhoneNumber: $('#phone').val(),
                Password: $('#password').val(),
                Address: $('#address').val(),
                Role: $('#role').val()
            };

        try {
            const url = isEdit ? `${this.API_BASE}/${userId}` : this.API_BASE;
            const method = isEdit ? 'PUT' : 'POST';

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
                this.showToast(isEdit ? 'Cập nhật người dùng thành công' : 'Thêm người dùng thành công', 'success');
            } else {
                // Xử lý lỗi
                let errorMessage = 'Lỗi khi lưu người dùng';
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (e) {
                    // Nếu không đọc được JSON
                    errorMessage = `Lỗi: ${response.statusText || response.status}`;
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Save user error:', error);
            this.showToast(error.message, 'error');
        }
    }

    async viewUserDetail(event) {
        const userId = $(event.target).closest('.view-user').data('id');
        try {
            const response = await fetch(`${this.API_BASE}/${userId}`);
            const user = await response.json();
            
            // Hiển thị thông tin chi tiết trong modal
            $('#detailUsername').text(user.Username || 'N/A');
            $('#detailEmail').text(user.Email || 'N/A');
            $('#detailPhone').text(user.PhoneNumber || 'N/A');
            $('#detailRole').text(user.Role || 'user');
            $('#detailStatus').html(`<span class="badge bg-${user.IsActive ? 'success' : 'danger'}">${user.IsActive ? 'Hoạt động' : 'Không hoạt động'}</span>`);
            
            // Nếu có địa chỉ, hiển thị
            if (user.Address) {
                $('#detailAddress').text(user.Address);
                $('.address-info').show();
            } else {
                $('.address-info').hide();
            }
            
            // Hiển thị ngày tạo tài khoản
            if (user.CreatedAt) {
                const createdDate = new Date(user.CreatedAt);
                $('#detailCreatedAt').text(createdDate.toLocaleDateString('vi-VN'));
                $('.creation-info').show();
            } else {
                $('.creation-info').hide();
            }
            
            // Lưu ID người dùng vào modal và các nút để thao tác sau này
            $('#userId').val(user.Id);
            $('#editFromDetailBtn').data('id', user.Id);
            $('#deleteFromDetailBtn').data('id', user.Id);
            
            $('#userDetailModal').modal('show');
        } catch (error) {
            console.error('Error loading user details:', error);
            this.showToast('Lỗi khi tải thông tin người dùng', 'error');
        }
    }

    async editUser(event) {
        const userId = $(event.target).closest('.edit-user').data('id');
        try {
            const response = await fetch(`${this.API_BASE}/${userId}`);
            if (!response.ok) {
                throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
            }
            const user = await response.json();
            this.openUserModal(user);
        } catch (error) {
            console.error('Error fetching user for edit:', error);
            this.showToast('Lỗi khi tải thông tin người dùng', 'error');
        }
    }

    editFromDetail() {
        const userId = $('#editFromDetailBtn').data('id');
        $('#userDetailModal').modal('hide');
        this.editUser({ target: $(`.edit-user[data-id="${userId}"]`) });
    }

    confirmDeleteUser(event) {
        const userId = $(event.target).closest('.delete-user').data('id');
        $('#userId').val(userId);
        $('#deleteModal').modal('show');
    }

    deleteFromDetail() {
        const userId = $('#deleteFromDetailBtn').data('id');
        $('#userDetailModal').modal('hide');
        $('#userId').val(userId);
        $('#deleteModal').modal('show');
    }

    async deleteUser() {
        const userId = $('#userId').val();
        try {
            const response = await fetch(`${this.API_BASE}/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                $('#deleteModal').modal('hide');
                this.loadUsers();
                this.showToast('Xóa người dùng thành công', 'success');
            } else {
                throw new Error('Lỗi khi xóa người dùng');
            }
        } catch (error) {
            console.error('Delete user error:', error);
            this.showToast(error.message, 'error');
        }
    }

    filterUsers() {
        const searchText = $('#searchUser').val().toLowerCase();
        const roleFilter = $('#roleFilter').val();

        $('#userTable tbody tr').each((_, row) => {
            const $row = $(row);
            const text = $row.text().toLowerCase();
            const role = $row.find('td:eq(4)').text();

            let show = text.includes(searchText);
            if (roleFilter && role !== roleFilter) {
                show = false;
            }

            $row.toggle(show);
        });
    }

    showToast(message, type = 'success') {
        const toast = `
            <div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        const toastElement = $(toast);
        $('.toast-container').append(toastElement);
        const bsToast = new bootstrap.Toast(toastElement);
        bsToast.show();
        setTimeout(() => {
            toastElement.remove();
        }, 5000);
    }
}

// Initialize when document is ready
$(document).ready(() => {
    new AdminUserManager();
}); 