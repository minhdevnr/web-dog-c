using ECommerceAPI.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;

namespace ECommerceAPI.Services
{
    public class AdminInitializerService : IAdminInitializerService
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;

        public AdminInitializerService(IUserService userService, IConfiguration configuration)
        {
            _userService = userService;
            _configuration = configuration;
        }

        public async Task InitializeAdminAccount()
        {
            try
            {
                // Đọc thông tin admin từ cấu hình
                var adminEmail = _configuration["AdminAccount:Email"];
                var adminPassword = _configuration["AdminAccount:Password"];
                var adminFullName = _configuration["AdminAccount:FullName"];

                if (string.IsNullOrEmpty(adminEmail) || string.IsNullOrEmpty(adminPassword))
                {
                    Console.WriteLine("Admin account information is missing in configuration");
                    return;
                }

                // Kiểm tra xem tài khoản admin đã tồn tại chưa
                var existingAdmin = await _userService.GetUserByEmailAsync(adminEmail);
                
                if (existingAdmin != null)
                {
                    Console.WriteLine($"Admin account with email {adminEmail} already exists");
                    return;
                }

                // Tạo tài khoản admin mới
                var adminUser = new User
                {
                    Email = adminEmail,
                    Username = "admin",
                    FullName = adminFullName,
                    PhoneNumber = "0000000000", // Đặt số điện thoại mặc định
                    Address = "Admin Address",
                    IsEmailVerified = true,
                    IsPhoneVerified = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    Role = UserRole.Admin.ToString()
                };

                // Đăng ký tài khoản admin
                await _userService.CreateUserAsync(adminUser, adminPassword);
                
                Console.WriteLine($"Admin account created successfully with email: {adminEmail}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error initializing admin account: {ex.Message}");
            }
        }
    }
} 