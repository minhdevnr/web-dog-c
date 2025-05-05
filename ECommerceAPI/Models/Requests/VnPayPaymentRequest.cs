using System;
using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Models.Requests
{
    public class VnPayPaymentRequest
    {
        [Required(ErrorMessage = "Mã đơn hàng không được để trống")]
        public string OrderId { get; set; }
        
        [Required(ErrorMessage = "Số tiền không được để trống")]
        [Range(1, double.MaxValue, ErrorMessage = "Số tiền phải lớn hơn 0")]
        public decimal Amount { get; set; }
        
        [Required(ErrorMessage = "Mô tả đơn hàng không được để trống")]
        public string OrderDesc { get; set; }
        
        [Required(ErrorMessage = "Loại đơn hàng không được để trống")]
        public string OrderType { get; set; } = "billpayment";
        
        [Required(ErrorMessage = "Mã ngân hàng không được để trống")]
        public string BankCode { get; set; } = "NCB";
        
        [Required(ErrorMessage = "Ngôn ngữ không được để trống")]
        public string Language { get; set; } = "vn";
        
        // Thông tin bổ sung (không bắt buộc)
        public string ReturnUrl { get; set; }
        public string IpAddress { get; set; }
        public DateTime CreateDate { get; set; } = DateTime.Now;
        public string TxnRef => OrderId;
    }
} 