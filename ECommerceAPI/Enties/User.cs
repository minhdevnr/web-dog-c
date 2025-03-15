public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Address { get; set; }
    public string PhoneNumber { get; set; }
    public string Role { get; set; } // Admin or Customer
    public DateTime DateOfBirth { get; set; }
    public DateTime CreatedAt { get; set; }
} 