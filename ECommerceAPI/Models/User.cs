using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [Phone]
        public string PhoneNumber { get; set; }

        [Required]
        public string Password { get; set; }

        public string? ProfilePicture { get; set; }

        [Required]
        public string Address { get; set; }

        public bool IsEmailVerified { get; set; }

        public bool IsPhoneVerified { get; set; }

        public bool IsTwoFactorEnabled { get; set; }

        public string? TwoFactorKey { get; set; }

        [Required]
        public string Role { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? LastLoginAt { get; set; }

        public bool IsActive { get; set; }

        public DateTime DateOfBirth { get; set; }

        // For social login
        public string? GoogleId { get; set; }
        public string? FacebookId { get; set; }

        // Navigation property for user activities
        public ICollection<UserActivity> Activities { get; set; } = new List<UserActivity>();

        // Navigation property for refresh tokens
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }

    public enum UserRole
    {
        Customer,
        Admin,
        Vendor
    }
} 