using System;
using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string Token { get; set; }

        public DateTime ExpiryDate { get; set; }

        public DateTime CreatedAt { get; set; }

        public string? RevokedByIp { get; set; }

        public DateTime? RevokedAt { get; set; }

        [Required]
        public string CreatedByIp { get; set; }

        public string? ReplacedByToken { get; set; }

        public bool IsExpired => DateTime.UtcNow >= ExpiryDate;
        public bool IsActive => RevokedAt == null && !IsExpired;

        // Navigation property
        public virtual User User { get; set; }
    }
} 