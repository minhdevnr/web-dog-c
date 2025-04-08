using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Models
{
    public class LoginRequest
    {
        [Required]
        public string EmailOrPhone { get; set; }

        [Required]
        public string Password { get; set; }
    }
} 