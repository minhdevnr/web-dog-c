using System;
using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Models.Requests
{
    public class VnPayPaymentRequest
    {
        [Required(ErrorMessage = "Mã đơn hàng không được để trống")]
        public long OrderId { get; set; }
        
        [Required(ErrorMessage = "Số tiền không được để trống")]
        [Range(1, double.MaxValue, ErrorMessage = "Số tiền phải lớn hơn 0")]
        public decimal Amount { get; set; }
        
        public string OrderInfo { get; set; }
        
        public string OrderDesc { get; set; }
        
        public string OrderType { get; set; } = "billpayment";
        
        public string BankCode { get; set; }
        
        public string Language { get; set; } = "vn";
        
        // Thông tin bổ sung (không bắt buộc)
        public string? ReturnUrl { get; set; }
        public string? IpAddress { get; set; }
        public DateTime CreateDate { get; set; } = DateTime.Now;
        public string TxnRef => OrderId.ToString();
    }
} 