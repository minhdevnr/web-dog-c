using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Models.Requests
{
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
        [Required]
        public string EmailOrPhone { get; set; }

        [Required]
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
        public string Role { get; set; }
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

    public class CreateUserRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Role { get; set; }
    }

    public class UpdateUserRequest
    {
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
    }

    public class VerifyEmailRequest
    {
        public string Email { get; set; }
        public string Code { get; set; }
    }
}