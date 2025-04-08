using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Entities
{
    public class Product
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public decimal Price { get; set; }

        public decimal? OriginalPrice { get; set; }

        [Required]
        public string Description { get; set; }

        public string? ImageUrl { get; set; }

        [Required]
        public string Origin { get; set; }

        public DateTime ExpiryDate { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
} 