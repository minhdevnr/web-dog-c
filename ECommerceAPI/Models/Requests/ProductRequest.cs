using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace ECommerceAPI.Models.Requests
{
    public class ProductRequest
    {
        [Required(ErrorMessage = "Tên sản phẩm là bắt buộc")]
        [MaxLength(200, ErrorMessage = "Tên sản phẩm không được vượt quá 200 ký tự")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Giá sản phẩm là bắt buộc")]
        [Range(0, double.MaxValue, ErrorMessage = "Giá sản phẩm phải lớn hơn hoặc bằng 0")]
        public decimal Price { get; set; }

        public decimal? OriginalPrice { get; set; }

        [Required(ErrorMessage = "Mô tả sản phẩm là bắt buộc")]
        public string Description { get; set; }

        // Tệp hình ảnh
        public IFormFile? Image { get; set; }

        [Required(ErrorMessage = "Xuất xứ sản phẩm là bắt buộc")]
        public string Origin { get; set; }

        [Required(ErrorMessage = "Hạn sử dụng là bắt buộc")]
        public DateTime ExpiryDate { get; set; }

        [Required(ErrorMessage = "Số lượng tồn kho là bắt buộc")]
        [Range(0, int.MaxValue, ErrorMessage = "Số lượng tồn kho phải lớn hơn hoặc bằng 0")]
        public int Stock { get; set; }

        [Required(ErrorMessage = "Trạng thái sản phẩm là bắt buộc")]
        public string Status { get; set; } = "Active";

        [Required(ErrorMessage = "Danh mục sản phẩm là bắt buộc")]
        public int CategoryId { get; set; }
    }
} 