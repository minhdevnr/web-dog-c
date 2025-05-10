using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Models.Requests
{
    public class CategoryRequest
    {

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        public string Description { get; set; }
    }

   
}