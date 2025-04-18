using ECommerceAPI.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerceAPI.Entities
{
    public class Address
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(100)]
        public string ReceiverName { get; set; }

        [Required]
        [StringLength(15)]
        public string Phone { get; set; }

        [Required]
        [StringLength(200)]
        public string AddressLine { get; set; }

        [Required]
        [StringLength(50)]
        public string Ward { get; set; }

        [Required]
        [StringLength(50)]
        public string District { get; set; }

        [Required]
        [StringLength(50)]
        public string City { get; set; }

        public bool IsDefault { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }
    }
}