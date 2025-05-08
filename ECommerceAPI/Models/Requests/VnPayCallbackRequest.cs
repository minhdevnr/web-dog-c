using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Models.Requests
{
    public class VnPayCallbackRequest
    {
        [Required]
        public string OrderId { get; set; }
        
        [Required]
        public string ResponseCode { get; set; }
        
        public string TransactionId { get; set; }
        
        public string BankCode { get; set; }
        
        public string PayDate { get; set; }
        
        public string SecureHash { get; set; }
    }
} 