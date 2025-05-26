using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

        [Required]
        public int Stock { get; set; }

        [Required]
        public string Status { get; set; } = "Active";

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Foreign key
        public int CategoryId { get; set; }
        
        // Navigation property
        [ForeignKey("CategoryId")]
        public virtual Category Category { get; set; }

        [Required]
        [MaxLength(50)]
        public string ProductCode { get; set; }
    }
} 