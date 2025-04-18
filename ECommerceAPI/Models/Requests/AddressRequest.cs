namespace ECommerceAPI.Models.Requests
{
    public class AddressRequest
    {
        [System.ComponentModel.DataAnnotations.Required]
        public string ReceiverName { get; set; }

        [System.ComponentModel.DataAnnotations.Required]
        public string Phone { get; set; }

        [System.ComponentModel.DataAnnotations.Required]
        public string AddressLine { get; set; }

        [System.ComponentModel.DataAnnotations.Required]
        public string Ward { get; set; }

        [System.ComponentModel.DataAnnotations.Required]
        public string District { get; set; }

        [System.ComponentModel.DataAnnotations.Required]
        public string City { get; set; }

        public bool IsDefault { get; set; }
    }
}