using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Models.Requests
{
    public class UpdateStockRequest
    {
        [Required(ErrorMessage = "Số lượng tồn kho là bắt buộc")]
        [Range(0, int.MaxValue, ErrorMessage = "Số lượng tồn kho phải lớn hơn hoặc bằng 0")]
        public int Stock { get; set; }
        
        public string? Note { get; set; }
    }
} 