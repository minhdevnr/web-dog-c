using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Models
{
    public class RevokeTokenRequest
    {
        public string? Token { get; set; }
    }
} 