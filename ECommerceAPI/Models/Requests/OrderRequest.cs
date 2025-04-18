using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Models.Requests
{
    public class CreateOrderRequest
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public string ShippingAddress { get; set; }

        [Required]
        public string PhoneNumber { get; set; }

        [Required]
        public List<OrderItemRequest> Items { get; set; }
    }

    public class OrderItemRequest
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }

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