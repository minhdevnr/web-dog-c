using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ECommerceAPI.Models;
using ECommerceAPI.Services;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace ECommerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var user = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    PhoneNumber = request.PhoneNumber,
                    Address = request.Address,
                    DateOfBirth = request.DateOfBirth
                };

                var result = await _userService.RegisterAsync(user, request.Password, GetIpAddress());
                return Ok(new { message = "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var (user, token) = await _userService.AuthenticateAsync(request.EmailOrPhone, request.Password, GetIpAddress());

            if (user == null)
                return BadRequest(new { message = "Email/Số điện thoại hoặc mật khẩu không đúng" });

            if (!user.IsEmailVerified)
                return BadRequest(new { message = "Vui lòng xác nhận email trước khi đăng nhập" });

            return Ok(new
            {
                id = user.Id,
                username = user.Username,
                email = user.Email,
                role = user.Role,
                token = token
            });
        }

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            if (await _userService.VerifyEmailAsync(token))
                return Ok(new { message = "Email đã được xác nhận thành công" });

            return BadRequest(new { message = "Link xác nhận không hợp lệ hoặc đã hết hạn" });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            await _userService.RequestPasswordResetAsync(request.Email);
            return Ok(new { message = "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu" });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (await _userService.ResetPasswordAsync(request.Token, request.NewPassword))
                return Ok(new { message = "Mật khẩu đã được đặt lại thành công" });

            return BadRequest(new { message = "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" });
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<UserProfileResponse>> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null)
                return NotFound();

            return new UserProfileResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                IsEmailVerified = user.IsEmailVerified,
                IsPhoneVerified = user.IsPhoneVerified,
                IsTwoFactorEnabled = user.IsTwoFactorEnabled,
                ProfilePicture = user.ProfilePicture,
                Address = user.Address,
                DateOfBirth = user.DateOfBirth,
                CreatedAt = user.CreatedAt
            };
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<ActionResult<UserProfileResponse>> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null)
                return NotFound();

            user.Username = request.Username;
            user.Address = request.Address;
            user.ProfilePicture = request.ProfilePicture;

            var updatedUser = await _userService.UpdateProfileAsync(userId, user);
            return new UserProfileResponse
            {
                Id = updatedUser.Id,
                Username = updatedUser.Username,
                Email = updatedUser.Email,
                PhoneNumber = updatedUser.PhoneNumber,
                IsEmailVerified = updatedUser.IsEmailVerified,
                IsPhoneVerified = updatedUser.IsPhoneVerified,
                IsTwoFactorEnabled = updatedUser.IsTwoFactorEnabled,
                ProfilePicture = updatedUser.ProfilePicture,
                Address = updatedUser.Address,
                DateOfBirth = updatedUser.DateOfBirth,
                CreatedAt = updatedUser.CreatedAt
            };
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _userService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);

            if (!result)
                return BadRequest("Invalid current password");

            return Ok();
        }

        [HttpPost("enable-2fa")]
        [Authorize]
        public async Task<IActionResult> EnableTwoFactor()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _userService.EnableTwoFactorAsync(userId);

            if (!result)
                return BadRequest("Failed to enable 2FA");

            return Ok();
        }

        [HttpPost("disable-2fa")]
        [Authorize]
        public async Task<IActionResult> DisableTwoFactor()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _userService.DisableTwoFactorAsync(userId);

            if (!result)
                return BadRequest("Failed to disable 2FA");

            return Ok();
        }

        [HttpPost("verify-2fa")]
        [Authorize]
        public async Task<IActionResult> VerifyTwoFactorCode([FromBody] VerifyTwoFactorRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _userService.VerifyTwoFactorCodeAsync(userId, request.Code);

            if (!result)
                return BadRequest("Invalid 2FA code");

            return Ok();
        }

        [HttpGet("activities")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<UserActivity>>> GetActivities()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var activities = await _userService.GetUserActivitiesAsync(userId);
            return Ok(activities);
        }

        [Authorize]
        [HttpPost("deactivate")]
        public async Task<IActionResult> DeactivateAccount()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            if (await _userService.DeactivateAccountAsync(userId))
                return Ok(new { message = "Tài khoản đã được vô hiệu hóa" });

            return BadRequest(new { message = "Không thể vô hiệu hóa tài khoản" });
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var refreshToken = await _userService.RefreshTokenAsync(request.Token, GetIpAddress());
            if (refreshToken == null)
                return BadRequest(new { message = "Token không hợp lệ hoặc đã hết hạn" });

            return Ok(new { token = refreshToken.Token });
        }

        [Authorize]
        [HttpPost("revoke-token")]
        public async Task<IActionResult> RevokeToken([FromBody] RevokeTokenRequest request)
        {
            if (await _userService.RevokeTokenAsync(request.Token, GetIpAddress()))
                return Ok(new { message = "Token đã được thu hồi" });

            return BadRequest(new { message = "Token không hợp lệ" });
        }

        [HttpPost("profile-picture")]
        [Authorize]
        public async Task<ActionResult<string>> UploadProfilePicture([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Vui lòng chọn file ảnh" });

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null)
                return NotFound();

            // Kiểm tra định dạng file
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest(new { message = "Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG" });

            // Tạo tên file mới
            var fileName = $"{userId}_{DateTime.UtcNow.Ticks}{fileExtension}";
            var filePath = Path.Combine("wwwroot", "uploads", "avatars", fileName);

            // Đảm bảo thư mục tồn tại
            Directory.CreateDirectory(Path.GetDirectoryName(filePath));

            // Lưu file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Cập nhật đường dẫn ảnh trong database
            var imageUrl = $"/uploads/avatars/{fileName}";
            user.ProfilePicture = imageUrl;
            await _userService.UpdateProfileAsync(userId, user);

            return Ok(new { profilePicture = imageUrl });
        }

        private string GetIpAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                return Request.Headers["X-Forwarded-For"];
            else
                return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString();
        }
    }

    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Password { get; set; }
        public string Address { get; set; }
        public DateTime DateOfBirth { get; set; }
    }

    public class LoginRequest
    {
        public string EmailOrPhone { get; set; }
        public string Password { get; set; }
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }

    public class UserProfileResponse
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string? ProfilePicture { get; set; }
        public string Address { get; set; }
        public bool IsEmailVerified { get; set; }
        public bool IsPhoneVerified { get; set; }
        public bool IsTwoFactorEnabled { get; set; }
        public DateTime DateOfBirth { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateProfileRequest
    {
        [Required]
        [StringLength(100)]
        public string Username { get; set; }

        [Required]
        public string Address { get; set; }

        public string? ProfilePicture { get; set; }
    }

    public class ChangePasswordRequest
    {
        [Required]
        public string CurrentPassword { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string NewPassword { get; set; }
    }

    public class VerifyTwoFactorRequest
    {
        [Required]
        public string Code { get; set; }
    }

    public class RefreshTokenRequest
    {
        public string Token { get; set; }
    }

    public class RevokeTokenRequest
    {
        public string Token { get; set; }
    }
} 