using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using ECommerceAPI.Data;
using ECommerceAPI.Entities;
using ECommerceAPI.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace ECommerceAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrderController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("my-orders")]
        public async Task<ActionResult<IEnumerable<OrderResponse>>> GetMyOrders()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
                .Where(o => o.User.Id == userId)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderResponse
                {
                    Id = o.Id,
                    Status = o.Status,
                    SubTotal = o.TotalAmount - 30000, // Giả định phí vận chuyển là 30000
                    ShippingFee = 30000,
                    Total = o.TotalAmount,
                    Note = string.Empty,
                    CreatedAt = o.CreatedAt,
                    Address = new AddressResponse
                    {
                        Id = 0,
                        ReceiverName = o.User.Username,
                        Phone = o.PhoneNumber,
                        AddressLine = o.ShippingAddress,
                        Ward = string.Empty,
                        District = string.Empty,
                        City = string.Empty
                    },
                    Items = o.OrderItems.Select(i => new OrderItemResponse
                    {
                        Id = i.Id,
                        Product = new ProductResponse
                        {
                            Id = i.Product.Id,
                            Name = i.Product.Name,
                            Image = i.Product.ImageUrl ?? string.Empty,
                            Price = i.UnitPrice
                        },
                        Quantity = i.Quantity,
                        Price = i.UnitPrice,
                        Total = i.TotalPrice
                    }).ToList()
                })
                .ToListAsync();

            return orders;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderResponse>> GetOrder(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
                .Where(o => o.Id == id && o.User.Id == userId)
                .Select(o => new OrderResponse
                {
                    Id = o.Id,
                    Status = o.Status,
                    SubTotal = o.TotalAmount - 30000, // Giả định phí vận chuyển là 30000
                    ShippingFee = 30000,
                    Total = o.TotalAmount,
                    Note = string.Empty,
                    CreatedAt = o.CreatedAt,
                    Address = new AddressResponse
                    {
                        Id = 0,
                        ReceiverName = o.User.Username,
                        Phone = o.PhoneNumber,
                        AddressLine = o.ShippingAddress,
                        Ward = string.Empty,
                        District = string.Empty,
                        City = string.Empty
                    },
                    Items = o.OrderItems.Select(i => new OrderItemResponse
                    {
                        Id = i.Id,
                        Product = new ProductResponse
                        {
                            Id = i.Product.Id,
                            Name = i.Product.Name,
                            Image = i.Product.ImageUrl ?? string.Empty,
                            Price = i.UnitPrice
                        },
                        Quantity = i.Quantity,
                        Price = i.UnitPrice,
                        Total = i.TotalPrice
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (order == null)
                return NotFound();

            return order;
        }

        [HttpPost("cancel/{id}")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var order = await _context.Orders
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == id && o.User.Id == userId);

            if (order == null)
                return NotFound();

            if (order.Status != "pending")
                return BadRequest(new { message = "Chỉ có thể hủy đơn hàng chưa xác nhận" });

            order.Status = "cancelled";
            order.UpdatedAt = DateTime.UtcNow;

            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/order
        [HttpPost]
        public async Task<ActionResult<ECommerceAPI.Entities.Order>> CreateOrder([FromBody] CreateOrderRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
            {
                return BadRequest("User not found");
            }

            var order = new ECommerceAPI.Entities.Order
            {
                User = user,
                ShippingAddress = request.ShippingAddress,
                PhoneNumber = request.PhoneNumber,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                OrderItems = new List<ECommerceAPI.Entities.OrderItem>()
            };

            decimal totalAmount = 0;

            // Add order items from the request data
            if (request.Items != null && request.Items.Any())
            {
                foreach (var item in request.Items)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null)
                    {
                        return BadRequest($"Product with ID {item.ProductId} not found");
                    }

                    var orderItem = new ECommerceAPI.Entities.OrderItem
                    {
                        Product = product,
                        Quantity = item.Quantity,
                        UnitPrice = product.Price,
                        TotalPrice = product.Price * item.Quantity
                    };
                    
                    totalAmount += orderItem.TotalPrice;
                    order.OrderItems.Add(orderItem);
                }
            }

            order.TotalAmount = totalAmount;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }

        // PUT: api/order/{id}
        [HttpPut("{id}")]   
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] UpdateOrderRequest request)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            order.ShippingAddress = request.ShippingAddress;
            order.PhoneNumber = request.PhoneNumber;
            order.Status = request.Status;
            order.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/order/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.Id == id);
        }
    }

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
    }
} 