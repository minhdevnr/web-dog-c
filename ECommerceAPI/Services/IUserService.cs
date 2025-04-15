using System.Threading.Tasks;
using System.Collections.Generic;
using ECommerceAPI.Models;

namespace ECommerceAPI.Services
{
    public interface IUserService
    {
        Task<(User user, string token)> AuthenticateAsync(string emailOrPhone, string password, string ipAddress);
        Task<User> RegisterAsync(User user, string password, string ipAddress);
        Task<bool> VerifyEmailAsync(string token);
        Task<bool> RequestPasswordResetAsync(string email);
        Task<bool> ResetPasswordAsync(string token, string newPassword);
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
        Task<User> UpdateProfileAsync(int userId, User userUpdateData);
        Task<bool> EnableTwoFactorAsync(int userId);
        Task<bool> DisableTwoFactorAsync(int userId);
        Task<bool> VerifyTwoFactorCodeAsync(int userId, string code);
        Task<IEnumerable<UserActivity>> GetUserActivitiesAsync(int userId);
        Task<bool> DeactivateAccountAsync(int userId);
        Task<RefreshToken> RefreshTokenAsync(string token, string ipAddress);
        Task<bool> RevokeTokenAsync(string token, string ipAddress);
        Task<User> GetUserByIdAsync(int userId);
        Task<User> GetUserByEmailAsync(string email);
        Task<User> GetUserByUsernameAsync(string username);
        string GenerateJwtToken(User user);

        // Thêm các phương thức mới cho quản lý người dùng
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User> CreateUserAsync(User user, string password);
        Task<User> UpdateUserAsync(int id, User user);
        Task<bool> DeleteUserAsync(int id);
    }
} 