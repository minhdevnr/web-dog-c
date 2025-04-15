using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerceAPI.Entities
{
    /// <summary>
    /// Đối tượng thực thể tin tức trong cơ sở dữ liệu
    /// </summary>
    public class News
    {
        /// <summary>
        /// ID tin tức
        /// </summary>
        [Key]
        public int Id { get; set; }
        
        /// <summary>
        /// Tiêu đề tin tức
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }
        
        /// <summary>
        /// Nội dung tin tức
        /// </summary>
        [Required]
        public string Content { get; set; }
        
        /// <summary>
        /// Đường dẫn hình ảnh
        /// </summary>
        public string ImageUrl { get; set; }
        
        /// <summary>
        /// Danh mục tin tức (tên danh mục dạng chuỗi)
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// Liên kết với ID danh mục
        /// </summary>
        public int CategoryId { get; set; }
        
        /// <summary>
        /// Tác giả tin tức
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string Author { get; set; } = "Admin";
        
        /// <summary>
        /// Trạng thái tin tức: Published hoặc Draft
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Published";
        
        /// <summary>
        /// Số lượt xem
        /// </summary>
        public int ViewCount { get; set; } = 0;
        
        /// <summary>
        /// Ngày tạo
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        /// <summary>
        /// Ngày cập nhật
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// Navigation property để liên kết với danh mục
        /// </summary>
        [ForeignKey("CategoryId")]
        public virtual Category CategoryInfo { get; set; }
    }
} 