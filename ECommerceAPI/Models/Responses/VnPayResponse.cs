namespace ECommerceAPI.Models.Responses
{
    public class VnPayPaymentResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string PaymentUrl { get; set; }
        public string OrderId { get; set; }
    }
    
    public class VnPayReturnResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string OrderId { get; set; }
        public decimal Amount { get; set; }
        public string TransactionId { get; set; }
        public string BankCode { get; set; }
        public string PaymentDate { get; set; }
    }
} 