using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Models.Requests
{
   
    public class OrderRequest
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public string FullName { get; set; }
        
        [Required]
        [Phone]
        public string PhoneNumber { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        
        [Required]
        public string ShippingAddress { get; set; }
        
        public string Notes { get; set; }
        
        [Required]
        public List<OrderItemRequest> Items { get; set; }
        
        [Required]
        public decimal TotalAmount { get; set; }
        
        [Required]
        public string PaymentMethod { get; set; }
    }
    
    public class OrderItemRequest
    {
        [Required]
        public int ProductId { get;  set; }
        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

    }
    
    //public class VnPayPaymentRequest
    //{
    //    [Required]
    //    public string OrderId { get; set; }
        
    //    [Required]
    //    [Range(1, double.MaxValue)]
    //    public decimal Amount { get; set; }
        
    //    public string OrderDesc { get; set; }
        
    //    public string BankCode { get; set; }
        
    //    [Required]
    //    public string OrderType { get; set; } = "other";
        
    //    public string Language { get; set; } = "vn";
    //}
    public class UpdateOrderRequest
    {
        [Required]
        public string ShippingAddress { get; set; }

        [Required]
        public string PhoneNumber { get; set; }

        [Required]
        public string Status { get; set; }

        public List<OrderItemRequest> Items { get; set; }
    }
}