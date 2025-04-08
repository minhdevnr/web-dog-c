using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using ECommerceAPI.Data;
using ECommerceAPI.Models;
using ECommerceAPI.Entities;
using System.Linq;
using System;
using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CartController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/cart/items
        [HttpGet("items")]
        public async Task<IActionResult> GetCartItems()
        {
            // TODO: Get actual user ID from authentication
            string userId = User.Identity.Name ?? "default-user";

            var cartItems = await _context.CartItems
                .Include(ci => ci.Product)
                .Where(ci => ci.UserId == userId)
                .Select(ci => new {
                    ci.Id,
                    Product = new {
                        ci.Product.Id,
                        ci.Product.Name,
                        ci.Product.Price,
                        ci.Product.ImageUrl
                    },
                    ci.Quantity,
                    ci.UnitPrice,
                    ci.TotalPrice,
                    ci.CreatedAt,
                    ci.UpdatedAt
                })
                .ToListAsync();

            return Ok(cartItems);
        }

        // POST: api/cart/items
        [HttpPost("items")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // TODO: Get actual user ID from authentication
            string userId = User.Identity.Name ?? "default-user";

            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null)
            {
                return BadRequest("Product not found");
            }

            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.Product.Id == request.ProductId && ci.UserId == userId);

            if (existingItem != null)
            {
                existingItem.Quantity += request.Quantity;
                existingItem.UpdatedAt = DateTime.UtcNow;
                existingItem.TotalPrice = existingItem.UnitPrice * existingItem.Quantity;
            }
            else
            {
                var cartItem = new CartItem
                {
                    Product = product,
                    Quantity = request.Quantity,
                    UserId = userId,
                    UnitPrice = product.Price,
                    TotalPrice = product.Price * request.Quantity,
                    CreatedAt = DateTime.UtcNow
                };
                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/cart/items/{productId}
        [HttpDelete("items/{productId}")]
        public async Task<IActionResult> RemoveFromCart(int productId)
        {
            string userId = User.Identity.Name ?? "default-user";

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.Product.Id == productId && ci.UserId == userId);

            if (cartItem == null)
                return NotFound();

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // PATCH: api/cart/items/{productId}
        [HttpPatch("items/{productId}")]
        public async Task<IActionResult> UpdateQuantity(int productId, [FromBody] UpdateQuantityRequest request)
        {
            if (request.Quantity < 1)
                return BadRequest("Quantity must be greater than 0");

            string userId = User.Identity.Name ?? "default-user";

            var cartItem = await _context.CartItems
                .Include(ci => ci.Product)
                .FirstOrDefaultAsync(ci => ci.Product.Id == productId && ci.UserId == userId);

            if (cartItem == null)
                return NotFound();

            cartItem.Quantity = request.Quantity;
            cartItem.UpdatedAt = DateTime.UtcNow;
            cartItem.TotalPrice = cartItem.UnitPrice * request.Quantity;

            await _context.SaveChangesAsync();
            return Ok();
        }

        // POST: api/cart/clear
        [HttpPost("clear")]
        public async Task<IActionResult> ClearCart()
        {
            string userId = User.Identity.Name ?? "default-user";

            var cartItems = await _context.CartItems
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }

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