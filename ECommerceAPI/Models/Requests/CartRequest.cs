using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Models.Requests
{
    public class AddToCartRequest
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }

    public class UpdateQuantityRequest
    {
        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
}