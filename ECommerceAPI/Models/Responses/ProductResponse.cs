using System;

namespace ECommerceAPI.Models.Responses
{
    /// <summary>
    /// Model phản hồi cho thông tin sản phẩm
    /// </summary>
    public class ProductResponse
    {
        /// <summary>
        /// Mã sản phẩm
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Tên sản phẩm
        /// </summary>
        public string Name { get; set; }
        
        /// <summary>
        /// Giá bán
        /// </summary>
        public decimal Price { get; set; }
        
        /// <summary>
        /// Giá gốc (nếu có)
        /// </summary>
        public decimal? OriginalPrice { get; set; }
        
        /// <summary>
        /// Mô tả sản phẩm
        /// </summary>
        public string Description { get; set; }
        
        /// <summary>
        /// Đường dẫn hình ảnh
        /// </summary>
        public string ImageUrl { get; set; }
        
        /// <summary>
        /// Xuất xứ sản phẩm
        /// </summary>
        public string Origin { get; set; }
        
        /// <summary>
        /// Hạn sử dụng
        /// </summary>
        public DateTime ExpiryDate { get; set; }
        
        /// <summary>
        /// Số lượng tồn kho
        /// </summary>
        public int Stock { get; set; }
        
        /// <summary>
        /// Trạng thái sản phẩm
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
        /// Mã danh mục
        /// </summary>
        public int CategoryId { get; set; }
        
        /// <summary>
        /// Thông tin danh mục
        /// </summary>
        public CategoryResponse Category { get; set; }

        /// <summary>
        /// Hình ảnh
        /// </summary>
        public string Image { get; set; }
    }

    /// <summary>
    /// Model phản hồi cho thông tin danh mục
    /// </summary>
    public class CategoryResponse
    {
        /// <summary>
        /// Mã danh mục
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Tên danh mục
        /// </summary>
        public string Name { get; set; }
        
        /// <summary>
        /// Mô tả danh mục
        /// </summary>
        public string Description { get; set; }
    }
} 