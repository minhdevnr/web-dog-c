using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Entities
{
    public class News
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }

        public string ImageUrl { get; set; }
        
        public string Category { get; set; }
        
        public string Status { get; set; } = "Published";
        
        public string Author { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
} 