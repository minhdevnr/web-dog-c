using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace ECommerceAPI.Models.Requests
{
    /// <summary>
    /// Model request cho việc tạo và cập nhật tin tức
    /// </summary>
    public class NewsRequest
    {
        /// <summary>
        /// ID tin tức (chỉ dùng cho cập nhật)
        /// </summary>
        public int? Id { get; set; }

        /// <summary>
        /// Tiêu đề tin tức
        /// </summary>
        [Required(ErrorMessage = "Tiêu đề tin tức là bắt buộc")]
        [MaxLength(200, ErrorMessage = "Tiêu đề không được vượt quá 200 ký tự")]
        public string Title { get; set; }

        /// <summary>
        /// Nội dung tin tức
        /// </summary>
        [Required(ErrorMessage = "Nội dung tin tức là bắt buộc")]
        public string Content { get; set; }

        /// <summary>
        /// File hình ảnh cho tin tức
        /// </summary>
        public IFormFile? Image { get; set; }

        /// <summary>
        /// Danh mục tin tức
        /// </summary>
        [Required(ErrorMessage = "Danh mục tin tức là bắt buộc")]
        public int CategoryId { get; set; }

        /// <summary>
        /// Trạng thái tin tức: Published hoặc Draft
        /// </summary>
        [Required(ErrorMessage = "Trạng thái tin tức là bắt buộc")]
        [RegularExpression("^(Published|Draft)$", ErrorMessage = "Trạng thái phải là 'Published' hoặc 'Draft'")]
        public string Status { get; set; } = "Published";

        /// <summary>
        /// Tác giả tin tức (mặc định là Admin nếu không cung cấp)
        /// </summary>
        public string Author { get; set; } = "Admin";
    }

    /// <summary>
    /// Model request cho việc lọc và tìm kiếm tin tức
    /// </summary>
    public class NewsFilterRequest
    {
        /// <summary>
        /// Trang hiện tại, mặc định là 1
        /// </summary>
        public int PageNumber { get; set; } = 1;

        /// <summary>
        /// Số lượng bản ghi trên mỗi trang, mặc định là 10
        /// </summary>
        public int PageSize { get; set; } = 10;

        /// <summary>
        /// Từ khóa tìm kiếm (tìm trong tiêu đề và nội dung)
        /// </summary>
        public string? Keyword { get; set; } = null;

        /// <summary>
        /// Lọc theo danh mục
        /// </summary>
        public string? Category { get; set; } = null;

        /// <summary>
        /// Lọc theo trạng thái
        /// </summary>
        public string? Status { get; set; } = null;

        /// <summary>
        /// Sắp xếp theo trường, mặc định là CreatedAt
        /// </summary>
        public string SortBy { get; set; } = "UpdatedAt";

        /// <summary>
        /// Sắp xếp giảm dần, mặc định là true
        /// </summary>
        public bool Desc { get; set; } = true;
    }
} 