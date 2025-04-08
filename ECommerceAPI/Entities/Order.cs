using System.ComponentModel.DataAnnotations;
using ECommerceAPI.Models;

namespace ECommerceAPI.Entities
{
    public class Order
    {
        public int Id { get; set; }

        [Required]
        public User User { get; set; }

        [Required]
        public string ShippingAddress { get; set; }

        [Required]
        public string PhoneNumber { get; set; }

        public decimal TotalAmount { get; set; }

        [Required]
        public string Status { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        [Required]
        public ICollection<OrderItem> OrderItems { get; set; }
    }

    public class OrderItem
    {
        public int Id { get; set; }

        [Required]
        public Product Product { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal TotalPrice { get; set; }
    }
} 