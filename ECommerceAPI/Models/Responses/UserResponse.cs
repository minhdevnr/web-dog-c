using System;

namespace ECommerceAPI.Models.Responses
{
    /// <summary>
    /// Model phản hồi cho thông tin người dùng
    /// </summary>
    public class UserResponse
    {
        /// <summary>
        /// Mã người dùng
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Tên đăng nhập
        /// </summary>
        public string Username { get; set; }
        
        /// <summary>
        /// Email
        /// </summary>
        public string Email { get; set; }
        
        /// <summary>
        /// Số điện thoại
        /// </summary>
        public string PhoneNumber { get; set; }
        
        /// <summary>
        /// Địa chỉ
        /// </summary>
        public string Address { get; set; }
        
        /// <summary>
        /// Đường dẫn ảnh đại diện
        /// </summary>
        public string ProfilePicture { get; set; }
        
        /// <summary>
        /// Trạng thái xác thực email
        /// </summary>
        public bool IsEmailVerified { get; set; }
        
        /// <summary>
        /// Trạng thái xác thực số điện thoại
        /// </summary>
        public bool IsPhoneVerified { get; set; }
        
        /// <summary>
        /// Trạng thái xác thực hai lớp
        /// </summary>
        public bool IsTwoFactorEnabled { get; set; }
        
        /// <summary>
        /// Ngày sinh
        /// </summary>
        public DateTime DateOfBirth { get; set; }
        
        /// <summary>
        /// Ngày tạo tài khoản
        /// </summary>
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// Vai trò
        /// </summary>
        public string Role { get; set; }
        
        /// <summary>
        /// Trạng thái tài khoản
        /// </summary>
        public bool IsActive { get; set; }
    }
} 