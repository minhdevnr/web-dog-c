using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Models.Requests
{
    //public class VnPayPaymentRequest
    //{
    //    [Required]
    //    public string OrderId { get; set; }
        
    //    [Required]
    //    [Range(1, double.MaxValue, ErrorMessage = "Số tiền phải lớn hơn 0")]
    //    public decimal Amount { get; set; }
        
    //    [Required]
    //    public string OrderDesc { get; set; }
    //}
    
    public class VnPayReturnRequest
    {
        // Các tham số từ VNPay callback URL
        public string vnp_TmnCode { get; set; }
        public string vnp_Amount { get; set; }
        public string vnp_BankCode { get; set; }
        public string vnp_BankTranNo { get; set; }
        public string vnp_CardType { get; set; }
        public string vnp_PayDate { get; set; }
        public string vnp_OrderInfo { get; set; }
        public string vnp_TransactionNo { get; set; }
        public string vnp_ResponseCode { get; set; }
        public string vnp_TransactionStatus { get; set; }
        public string vnp_TxnRef { get; set; }
        public string vnp_SecureHash { get; set; }
    }
} 