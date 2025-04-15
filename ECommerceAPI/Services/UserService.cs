using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using ECommerceAPI.Models;
using ECommerceAPI.Data;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using System.Linq;

namespace ECommerceAPI.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public UserService(ApplicationDbContext context, IConfiguration configuration, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }

        public async Task<(User user, string token)> AuthenticateAsync(string emailOrPhone, string password, string ipAddress)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Email == emailOrPhone || x.PhoneNumber == emailOrPhone);

            if (user == null || !VerifyPasswordHash(password, user.Password))
            {
                await LogActivityAsync(user?.Id ?? 0, ActivityType.FailedLogin, "Failed login attempt", ipAddress);
                return (null, null);
            }

            if (!user.IsActive)
            {
                return (null, null);
            }

            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Generate JWT token
            var token = GenerateJwtToken(user);

            await LogActivityAsync(user.Id, ActivityType.Login, "User logged in successfully", ipAddress);

            return (user, token);
        }

        public async Task<User> RegisterAsync(User user, string password, string ipAddress)
        {
            // Check if email/phone already exists
            if (await _context.Users.AnyAsync(x => x.Email == user.Email))
                throw new Exception("Email already registered");

            if (!string.IsNullOrEmpty(user.PhoneNumber) && 
                await _context.Users.AnyAsync(x => x.PhoneNumber == user.PhoneNumber))
                throw new Exception("Phone number already registered");

            // Hash password
            user.Password = HashPassword(password);
            user.CreatedAt = DateTime.UtcNow;
            user.IsActive = true;
            user.Role = UserRole.User.ToString(); // Default role

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await LogActivityAsync(user.Id, ActivityType.AccountCreated, "Account created", ipAddress);

            // Send verification email
            await SendVerificationEmailAsync(user);

            return user;
        }

        public async Task<bool> VerifyEmailAsync(string token)
        {
            // Implement email verification logic
            // Decode token, find user, mark email as verified
            return true;
        }

        public async Task<bool> RequestPasswordResetAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Email == email);
            if (user == null) return false;

            // Generate password reset token
            var token = GeneratePasswordResetToken();
            
            // Send password reset email
            await _emailService.SendPasswordResetEmailAsync(email, token);

            return true;
        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            // Implement password reset logic
            // Verify token, find user, update password
            return true;
        }

        public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            if (!VerifyPasswordHash(currentPassword, user.Password))
                return false;

            user.Password = HashPassword(newPassword);
            await _context.SaveChangesAsync();

            await LogActivityAsync(userId, ActivityType.PasswordChange, "Password changed", "");

            return true;
        }

        public async Task<User> UpdateProfileAsync(int userId, User userUpdateData)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            // Update allowed fields
            user.Username = userUpdateData.Username;
            user.Address = userUpdateData.Address;
            user.ProfilePicture = userUpdateData.ProfilePicture;
            // Don't update sensitive fields like email, phone, role here

            await _context.SaveChangesAsync();
            await LogActivityAsync(userId, ActivityType.ProfileUpdate, "Profile updated", "");

            return user;
        }

        public async Task<bool> EnableTwoFactorAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.IsTwoFactorEnabled = true;
            user.TwoFactorKey = GenerateTwoFactorKey();
            await _context.SaveChangesAsync();

            await LogActivityAsync(userId, ActivityType.TwoFactorEnabled, "2FA enabled", "");

            return true;
        }

        public async Task<bool> DisableTwoFactorAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.IsTwoFactorEnabled = false;
            user.TwoFactorKey = null;
            await _context.SaveChangesAsync();

            await LogActivityAsync(userId, ActivityType.TwoFactorDisabled, "2FA disabled", "");

            return true;
        }

        public async Task<bool> VerifyTwoFactorCodeAsync(int userId, string code)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || !user.IsTwoFactorEnabled) return false;

            // Implement 2FA code verification logic
            return true;
        }

        public async Task<IEnumerable<UserActivity>> GetUserActivitiesAsync(int userId)
        {
            return await _context.UserActivities
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();
        }

        public async Task<bool> DeactivateAccountAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.IsActive = false;
            await _context.SaveChangesAsync();

            await LogActivityAsync(userId, ActivityType.AccountDeactivated, "Account deactivated", "");

            return true;
        }

        public async Task<RefreshToken> RefreshTokenAsync(string token, string ipAddress)
        {
            var refreshToken = await _context.RefreshTokens
                .Include(r => r.User)
                .SingleOrDefaultAsync(r => r.Token == token);

            if (refreshToken == null) return null;

            // Check if token is expired, revoked, etc.
            if (!refreshToken.IsActive) return null;

            // Generate new refresh token
            var newRefreshToken = GenerateRefreshToken(ipAddress);
            refreshToken.RevokedByIp = ipAddress;
            refreshToken.RevokedAt = DateTime.UtcNow;
            refreshToken.ReplacedByToken = newRefreshToken.Token;

            _context.RefreshTokens.Add(newRefreshToken);
            await _context.SaveChangesAsync();

            return newRefreshToken;
        }

        public async Task<bool> RevokeTokenAsync(string token, string ipAddress)
        {
            var refreshToken = await _context.RefreshTokens.SingleOrDefaultAsync(r => r.Token == token);
            if (refreshToken == null) return false;

            refreshToken.RevokedByIp = ipAddress;
            refreshToken.RevokedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<User> GetUserByIdAsync(int userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> GetUserByUsernameAsync(string username)
        {
            return await _context.Users.FirstOrDefaultAsync(x => x.Username == username);
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<User> CreateUserAsync(User user, string password)
        {
            // Kiểm tra email/phone đã tồn tại
            if (await _context.Users.AnyAsync(x => x.Email == user.Email))
                throw new Exception("Email đã được đăng ký");

            if (!string.IsNullOrEmpty(user.PhoneNumber) && 
                await _context.Users.AnyAsync(x => x.PhoneNumber == user.PhoneNumber))
                throw new Exception("Số điện thoại đã được đăng ký");

            // Hash password
            user.Password = HashPassword(password);
            user.CreatedAt = DateTime.UtcNow;
            user.IsActive = true;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<User> UpdateUserAsync(int id, User userUpdateData)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                throw new Exception("Không tìm thấy người dùng");

            // Kiểm tra email/phone đã tồn tại (nếu có thay đổi)
            if (userUpdateData.Email != user.Email && 
                await _context.Users.AnyAsync(x => x.Email == userUpdateData.Email))
                throw new Exception("Email đã được đăng ký");

            if (!string.IsNullOrEmpty(userUpdateData.PhoneNumber) && 
                userUpdateData.PhoneNumber != user.PhoneNumber && 
                await _context.Users.AnyAsync(x => x.PhoneNumber == userUpdateData.PhoneNumber))
                throw new Exception("Số điện thoại đã được đăng ký");

            // Cập nhật thông tin
            //user.FullName = userUpdateData.FullName;
            user.Email = userUpdateData.Email;
            user.PhoneNumber = userUpdateData.PhoneNumber;
            user.Address = userUpdateData.Address;
            user.DateOfBirth = userUpdateData.DateOfBirth;
            user.Role = userUpdateData.Role;
            user.IsActive = userUpdateData.IsActive;
            //user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return true;
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyPasswordHash(string password, string storedHash)
        {
            var hashedPassword = HashPassword(password);
            return hashedPassword == storedHash;
        }

        public string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(3),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private RefreshToken GenerateRefreshToken(string ipAddress)
        {
            using (var rng = RandomNumberGenerator.Create())
            {
                var randomBytes = new byte[64];
                rng.GetBytes(randomBytes);
                return new RefreshToken
                {
                    Token = Convert.ToBase64String(randomBytes),
                    ExpiryDate = DateTime.UtcNow.AddDays(7),
                    CreatedByIp = ipAddress,
                    CreatedAt = DateTime.UtcNow
                };
            }
        }

        private string GeneratePasswordResetToken()
        {
            using (var rng = RandomNumberGenerator.Create())
            {
                var randomBytes = new byte[32];
                rng.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
        }

        private string GenerateTwoFactorKey()
        {
            using (var rng = RandomNumberGenerator.Create())
            {
                var randomBytes = new byte[20];
                rng.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
        }

        private async Task SendVerificationEmailAsync(User user)
        {
            // Implement email verification logic
            await Task.CompletedTask;
        }

        private async Task LogActivityAsync(int userId, ActivityType type, string description, string ipAddress)
        {
            var activity = new UserActivity
            {
                UserId = userId,
                Type = type,
                Description = description,
                IpAddress = ipAddress,
                UserAgent = "", // TODO: Get from request
                Timestamp = DateTime.UtcNow
            };

            _context.UserActivities.Add(activity);
            await _context.SaveChangesAsync();
        }
    }
} 