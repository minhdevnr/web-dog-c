using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System;

namespace ECommerceAPI.Entities
{
    public class Category
    {
        public Category()
        {
            // Khởi tạo collection để tránh lỗi null reference
            Products = new HashSet<Product>();
        }
        
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        public string Description { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        public virtual ICollection<Product> Products { get; set; }
    }
} 