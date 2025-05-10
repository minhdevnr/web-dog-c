using ECommerceAPI.Entities;
using ECommerceAPI.Helpers;
using ECommerceAPI.Models;
using ECommerceAPI.Models.Requests;
using ECommerceAPI.Models.Responses;
using ECommerceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private const int DEFAULT_PAGE_SIZE = 10;
        private const int MAX_PAGE_SIZE = 50;

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

                var result = await _userService.RegisterAsync(user, request.Password, null);
                return Ok(new { message = "Đăng ký thành công", userId = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //[HttpPost("login")]
        //public async Task<IActionResult> Login([FromBody] LoginRequest request)
        //{
        //    try
        //    {
        //        var result = await _userService.(request.EmailOrPhone, request.Password, GetIpAddress());
        //        return Ok(new
        //        {
        //            token = result.JwtToken,
        //            refreshToken = result.RefreshToken,
        //            expiration = result.Expiration,
        //            user = result.User
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(new { message = ex.Message });
        //    }
        //}

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        {
            await _userService.VerifyEmailAsync(request.Email);
            return Ok(new { message = "Xác thực email thành công" });
        }

        //[HttpPost("forgot-password")]
        //public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        //{
        //    await _userService.fo(request.Email);
        //    return Ok(new { message = "Đã gửi email khôi phục mật khẩu" });
        //}

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            await _userService.ResetPasswordAsync(request.Token, request.NewPassword);
            return Ok(new { message = "Đặt lại mật khẩu thành công" });
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<UserResponse>> GetProfile()
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null)
                return NotFound(new { message = "Người dùng không tồn tại" });

            return MapToUserResponse(user);
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<ActionResult<UserResponse>> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null)
                return NotFound(new { message = "Người dùng không tồn tại" });

            user.Username = request.Username;
            user.Address = request.Address;

            if (!string.IsNullOrWhiteSpace(request.ProfilePicture))
                user.ProfilePicture = request.ProfilePicture;

            await _userService.UpdateUserAsync(user.Id, user);

            return MapToUserResponse(user);
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            await _userService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
            return Ok(new { message = "Đổi mật khẩu thành công" });
        }

        [HttpPost("enable-2fa")]
        [Authorize]
        public async Task<IActionResult> EnableTwoFactor()
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var secretKey = await _userService.EnableTwoFactorAsync(userId);
            return Ok(new { secretKey, message = "Đã bật xác thực hai lớp" });
        }

        [HttpPost("disable-2fa")]
        [Authorize]
        public async Task<IActionResult> DisableTwoFactor()
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            await _userService.DisableTwoFactorAsync(userId);
            return Ok(new { message = "Đã tắt xác thực hai lớp" });
        }

        [HttpPost("verify-2fa")]
        [Authorize]
        public async Task<IActionResult> VerifyTwoFactorCode([FromBody] VerifyTwoFactorRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var isValid = await _userService.VerifyTwoFactorCodeAsync(userId, request.Code);
            return Ok(new { isValid });
        }

        [HttpGet("activities")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<UserActivity>>> GetActivities()
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var activities = await _userService.GetUserActivitiesAsync(userId);
            return Ok(activities);
        }

        [Authorize]
        [HttpPost("deactivate")]
        public async Task<IActionResult> DeactivateAccount()
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            await _userService.DeactivateAccountAsync(userId);
            return Ok(new { message = "Tài khoản đã bị vô hiệu hóa" });
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var result = await _userService.RefreshTokenAsync(request.Token, null);
            return Ok(result);
        }

        [Authorize]
        [HttpPost("revoke-token")]
        public async Task<IActionResult> RevokeToken([FromBody] RevokeTokenRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var result = await _userService.RevokeTokenAsync(request.Token, null);
            return Ok(new { message = result ? "Token đã bị hủy" : "Token không tồn tại" });
        }

        [HttpPost("profile-picture")]
        [Authorize]
        public async Task<ActionResult<string>> UploadProfilePicture([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Không có file nào được tải lên" });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Chỉ chấp nhận file ảnh (.jpg, .jpeg, .png)" });

            if (file.Length > 5 * 1024 * 1024) // 5MB
                return BadRequest(new { message = "Kích thước file không được vượt quá 5MB" });

            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null)
                return NotFound(new { message = "Người dùng không tồn tại" });

            // Save file
            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles", fileName);
            var fileUrl = $"/uploads/profiles/{fileName}";

            Directory.CreateDirectory(Path.GetDirectoryName(filePath));

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Update user profile
            user.ProfilePicture = fileUrl;
            await _userService.UpdateUserAsync(user.Id, user);

            return Ok(new { url = fileUrl });
        }

        [HttpGet]
        public async Task<ActionResult<PagedResponse<UserResponse>>> GetUsers(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = DEFAULT_PAGE_SIZE,
            [FromQuery] string keyword = null,
            [FromQuery] string role = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool desc = false)
        {
            // Validate page size
            if (pageSize <= 0) pageSize = DEFAULT_PAGE_SIZE;
            if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

            // Ensure valid page number
            if (pageNumber <= 0) pageNumber = 1;

            // Get all users
            var allUsers = await _userService.GetAllUsersAsync();
            var query = allUsers.AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();
                query = query.Where(u =>
                    u.Username.ToLower().Contains(keyword) ||
                    u.Email.ToLower().Contains(keyword) ||
                    (u.PhoneNumber != null && u.PhoneNumber.Contains(keyword)));
            }

            if (!string.IsNullOrEmpty(role))
            {
                query = query.Where(u => u.Role == role);
            }

            if (isActive.HasValue)
            {
                query = query.Where(u => u.IsActive == isActive.Value);
            }

            // Apply sorting
            query = ApplySorting(query, sortBy, desc);

            // Get total count for pagination
            var totalCount = query.Count();

            // Apply pagination
            var users = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            // Map to response model
            var userResponses = users.Select(MapToUserResponse).ToList();

            // Create paged response
            return PaginationHelper.CreatePagedResponse(
                userResponses,
                pageNumber,
                pageSize,
                totalCount,
                Request,
                "users");
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponse>> GetUserById(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);

            if (user == null)
                return NotFound(new { message = "Người dùng không tồn tại" });

            return MapToUserResponse(user);
        }

        [HttpPost]
        public async Task<ActionResult<UserResponse>> CreateUser([FromBody] CreateUserRequest request)
        {
            var user = new User
            {
                FullName = request.Username,
                Username = request.Username,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                Address = request.Address,
                DateOfBirth = request.DateOfBirth.GetValueOrDefault(),
                Role = request.Role,
            };

            try
            {
                var result = await _userService.CreateUserAsync(user, request.Password);
                return MapToUserResponse(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<UserResponse>> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "Người dùng không tồn tại" });

            user.Email = request.Email;
            user.PhoneNumber = request.PhoneNumber;
            user.Address = request.Address;

            if (request.DateOfBirth.HasValue)
                user.DateOfBirth = request.DateOfBirth.Value;

            user.Role = request.Role;
            user.IsActive = request.IsActive;
            try
            {
                await _userService.UpdateUserAsync(user.Id, user, request.Password);
                return MapToUserResponse(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var result = await _userService.DeleteUserAsync(id);
            if (!result)
                return NotFound(new { message = "Người dùng không tồn tại" });

            return Ok(new { message = "Xóa người dùng thành công" });
        }

        #region Helper Methods

        // Map User to UserResponse
        private UserResponse MapToUserResponse(User user)
        {
            return new UserResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                ProfilePicture = user.ProfilePicture,
                IsEmailVerified = user.IsEmailVerified,
                IsPhoneVerified = user.IsPhoneVerified,
                IsTwoFactorEnabled = user.IsTwoFactorEnabled,
                DateOfBirth = user.DateOfBirth,
                CreatedAt = user.CreatedAt,
                Role = user.Role,
                IsActive = user.IsActive
            };
        }

        // Apply sorting to user query
        private IQueryable<User> ApplySorting(IQueryable<User> query, string sortBy, bool desc)
        {
            switch (sortBy.ToLower())
            {
                case "username":
                    return desc ? query.OrderByDescending(u => u.Username) : query.OrderBy(u => u.Username);

                case "email":
                    return desc ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email);

                case "createdat":
                    return desc ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt);

                case "role":
                    return desc ? query.OrderByDescending(u => u.Role) : query.OrderBy(u => u.Role);

                default:
                    return desc ? query.OrderByDescending(u => u.Id) : query.OrderBy(u => u.Id);
            }
        }

        private string GetIpAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                return Request.Headers["X-Forwarded-For"];
            else
                return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString();
        }

        #endregion Helper Methods
    }
}