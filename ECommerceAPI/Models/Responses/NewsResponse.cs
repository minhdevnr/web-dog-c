using System;

namespace ECommerceAPI.Models.Responses
{
    /// <summary>
    /// Model phản hồi cho thông tin tin tức
    /// </summary>
    public class NewsResponse
    {
        /// <summary>
        /// ID tin tức
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Tiêu đề tin tức
        /// </summary>
        public string Title { get; set; }
        
        /// <summary>
        /// Nội dung tin tức
        /// </summary>
        public string Content { get; set; }
        
        /// <summary>
        /// Đường dẫn hình ảnh
        /// </summary>
        public string ImageUrl { get; set; }
        
        /// <summary>
        /// Danh mục tin tức
        /// </summary>
        public CategoryResponse Category { get; set; }
        
        /// <summary>
        /// Tác giả tin tức
        /// </summary>
        public string Author { get; set; }
        
        /// <summary>
        /// Trạng thái tin tức
        /// </summary>
        public string Status { get; set; }
        
        /// <summary>
        /// Ngày tạo
        /// </summary>
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// Ngày cập nhật
        /// </summary>
        public DateTime? UpdatedAt { get; set; }
        
        /// <summary>
        /// Số lượt xem
        /// </summary>
        public int ViewCount { get; set; }
    }
} 