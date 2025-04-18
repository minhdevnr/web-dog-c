namespace ECommerceAPI.Models.Responses
{
    public class AddressResponse
    {
        public int Id { get; set; }
        public string ReceiverName { get; set; }
        public string Phone { get; set; }
        public string AddressLine { get; set; }
        public string Ward { get; set; }
        public string District { get; set; }
        public string City { get; set; }
        public bool IsDefault { get; set; }
    }
}