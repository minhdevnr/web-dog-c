using ECommerceAPI.Models;
using ECommerceAPI.Models.Requests;
using ECommerceAPI.Models.Responses;
using ECommerceAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var (user, token) = await _userService.AuthenticateAsync(request.EmailOrPhone, request.Password, ipAddress);

            if (user == null)
                return Unauthorized(new { message = "Invalid credentials" });

            return new AuthResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Token = token,
                Role = user.Role
            };
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

            // Check if email already exists
            if (await _userService.GetUserByEmailAsync(request.Email) != null)
                return BadRequest(new { message = "Email already registered" });

            // Check if username already exists
            if (await _userService.GetUserByUsernameAsync(request.Username) != null)
                return BadRequest(new { message = "Username already taken" });

            var user = new User
            {
                FullName = request.Username,
                Username = request.Username,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                Address = request.Address,
                DateOfBirth = request.DateOfBirth,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                Role = UserRole.User.ToString()
            };

            var registeredUser = await _userService.RegisterAsync(user, request.Password, ipAddress);
            var token = _userService.GenerateJwtToken(registeredUser);

            return new AuthResponse
            {
                Id = registeredUser.Id,
                Username = registeredUser.Username,
                Email = registeredUser.Email,
                Token = token
            };
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<AuthResponse>> RefreshToken()
        {
            var token = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(token))
                return BadRequest(new { message = "Token is required" });

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var newRefreshToken = await _userService.RefreshTokenAsync(token, ipAddress);

            if (newRefreshToken == null)
                return Unauthorized(new { message = "Invalid token" });

            SetRefreshTokenCookie(newRefreshToken.Token);

            var user = newRefreshToken.User;
            var jwtToken = _userService.GenerateJwtToken(user);

            return new AuthResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Token = jwtToken,
                Role = user.Role
            };
        }

        [HttpPost("revoke-token")]
        public async Task<IActionResult> RevokeToken([FromBody] RevokeTokenRequest request)
        {
            var token = request.Token ?? Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(token))
                return BadRequest(new { message = "Token is required" });

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _userService.RevokeTokenAsync(token, ipAddress);

            if (!result)
                return NotFound(new { message = "Token not found" });

            return Ok(new { message = "Token revoked" });
        }

        private void SetRefreshTokenCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7),
                SameSite = SameSiteMode.Strict,
                Secure = true
            };
            Response.Cookies.Append("refreshToken", token, cookieOptions);
        }
    }
}