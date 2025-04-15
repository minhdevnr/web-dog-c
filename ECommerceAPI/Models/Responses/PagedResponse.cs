using System.Collections.Generic;

namespace ECommerceAPI.Models.Responses
{
    /// <summary>
    /// Model phản hồi chuẩn với phân trang cho tất cả API GET có danh sách
    /// </summary>
    public class PagedResponse<T>
    {
        /// <summary>
        /// Danh sách dữ liệu
        /// </summary>
        public IEnumerable<T> Items { get; set; }
        
        /// <summary>
        /// Trang hiện tại
        /// </summary>
        public int CurrentPage { get; set; }
        
        /// <summary>
        /// Tổng số trang
        /// </summary>
        public int TotalPages { get; set; }
        
        /// <summary>
        /// Tổng số bản ghi
        /// </summary>
        public int TotalItems { get; set; }
        
        /// <summary>
        /// Số lượng bản ghi trên mỗi trang
        /// </summary>
        public int PageSize { get; set; }
        
        /// <summary>
        /// Đường dẫn trang trước (nếu có)
        /// </summary>
        public string PreviousPage { get; set; }
        
        /// <summary>
        /// Đường dẫn trang tiếp theo (nếu có)
        /// </summary>
        public string NextPage { get; set; }
        
        /// <summary>
        /// Trạng thái thành công
        /// </summary>
        public bool Success { get; set; } = true;
        
        /// <summary>
        /// Thông báo
        /// </summary>
        public string Message { get; set; } = "Lấy dữ liệu thành công";
    }
} 