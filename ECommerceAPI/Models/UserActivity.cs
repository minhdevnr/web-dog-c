using System;
using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Models
{
    public class UserActivity
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public ActivityType Type { get; set; }

        [Required]
        public string Description { get; set; }

        public DateTime Timestamp { get; set; }

        [Required]
        public string IpAddress { get; set; }

        [Required]
        public string UserAgent { get; set; }

        public User User { get; set; }
    }
} 