using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ECommerceAPI.Entities;
using System.Threading.Tasks;
using System.Linq;
using Data;

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
                    ci.ProductId,
                    ci.Quantity,
                    ci.Product.Name,
                    ci.Product.Price,
                    ImageUrl = ci.Product.ImageUrl
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

            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.ProductId == request.ProductId && ci.UserId == userId);

            if (existingItem != null)
            {
                existingItem.Quantity += request.Quantity;
                existingItem.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var cartItem = new CartItem
                {
                    ProductId = request.ProductId,
                    Quantity = request.Quantity,
                    UserId = userId
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
                .FirstOrDefaultAsync(ci => ci.ProductId == productId && ci.UserId == userId);

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
                .FirstOrDefaultAsync(ci => ci.ProductId == productId && ci.UserId == userId);

            if (cartItem == null)
                return NotFound();

            cartItem.Quantity = request.Quantity;
            cartItem.UpdatedAt = DateTime.UtcNow;

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
        public int ProductId { get; set; }

        public int Quantity { get; set; }
    }

    public class UpdateQuantityRequest
    {
        public int Quantity { get; set; }
    }
} 