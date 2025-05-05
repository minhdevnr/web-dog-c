using System;
using System.Collections.Generic;

namespace ECommerceAPI.Models.Responses
{
    public class OrderResponse
    {
        public int Id { get; set; }
        public string Status { get; set; }
        public string PhoneNumber { get; set; }
        public decimal SubTotal { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal Total { get; set; }
        public string Note { get; set; }
        public DateTime CreatedAt { get; set; }
        public string PaymentMethod { get; set; }
        public AddressResponse Address { get; set; }
        public List<OrderItemResponse> Items { get; set; } = new List<OrderItemResponse>();
        public UserBasicResponse User { get; set; }
    }

    public class OrderItemResponse
    {
        public int Id { get; set; }
        public ProductResponse Product { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Total { get; set; }
    }
    public class UserBasicResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
    }
}