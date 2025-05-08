using ECommerceAPI.Data;
using ECommerceAPI.Entities;
using ECommerceAPI.Helpers;
using ECommerceAPI.Models;
using ECommerceAPI.Models.Requests;
using ECommerceAPI.Models.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace ECommerceAPI.Controllers
{
    //[Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private const int DEFAULT_PAGE_SIZE = 10;
        private const int MAX_PAGE_SIZE = 50;
        private readonly ILogger<OrderController> _logger;

        public OrderController(ApplicationDbContext context, ILogger<OrderController> logger)
        {
            _context = context;
            _logger = logger;
        }

        //[HttpGet("my-orders")]
        //public async Task<ActionResult<PagedResponse<OrderResponse>>> GetMyOrders(
        //    [FromQuery] int pageNumber = 1,
        //    [FromQuery] int pageSize = DEFAULT_PAGE_SIZE,
        //    [FromQuery] string status = null,
        //    [FromQuery] DateTime? fromDate = null,
        //    [FromQuery] DateTime? toDate = null,
        //    [FromQuery] string sortBy = "CreatedAt",
        //    [FromQuery] bool desc = true)
        //{
        //    // Validate page size
        //    if (pageSize <= 0) pageSize = DEFAULT_PAGE_SIZE;
        //    if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

        //    // Ensure valid page number
        //    if (pageNumber <= 0) pageNumber = 1;

        //    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

        //    // Start query
        //    var query = _context.Orders
        //        .Include(o => o.User)
        //        .Include(o => o.OrderItems)
        //        .ThenInclude(i => i.Product)
        //        .Where(o => o.User.Id == userId)
        //        .AsQueryable();

        //    // Apply filters
        //    if (!string.IsNullOrEmpty(status))
        //    {
        //        query = query.Where(o => o.Status == status);
        //    }

        //    if (fromDate.HasValue)
        //    {
        //        query = query.Where(o => o.CreatedAt >= fromDate.Value);
        //    }

        //    if (toDate.HasValue)
        //    {
        //        query = query.Where(o => o.CreatedAt <= toDate.Value);
        //    }

        //    // Apply sorting
        //    query = ApplySorting(query, sortBy, desc);

        //    // Get total count for pagination
        //    var totalCount = await query.CountAsync();

        //    // Apply pagination
        //    var orders = await query
        //        .Skip((pageNumber - 1) * pageSize)
        //        .Take(pageSize)
        //        .Select(o => new OrderResponse
        //        {
        //            Id = o.Id,
        //            Status = o.Status,
        //            SubTotal = o.TotalAmount - 30000, // Giả định phí vận chuyển là 30000
        //            ShippingFee = 30000,
        //            Total = o.TotalAmount,
        //            Note = string.Empty,
        //            CreatedAt = o.CreatedAt,
        //            Address = new AddressResponse
        //            {
        //                Id = 0,
        //                ReceiverName = o.User.Username,
        //                Phone = o.PhoneNumber,
        //                AddressLine = o.ShippingAddress,
        //                Ward = string.Empty,
        //                District = string.Empty,
        //                City = string.Empty
        //            },
        //            Items = o.OrderItems.Select(i => new OrderItemResponse
        //            {
        //                Id = i.Id,
        //                Product = new ProductResponse
        //                {
        //                    Id = i.Product.Id,
        //                    Name = i.Product.Name,
        //                    Image = i.Product.ImageUrl ?? string.Empty,
        //                    Price = i.UnitPrice
        //                },
        //                Quantity = i.Quantity,
        //                Price = i.UnitPrice,
        //                Total = i.TotalPrice
        //            }).ToList()
        //        })
        //        .ToListAsync();

        //    // Create paged response
        //    return PaginationHelper.CreatePagedResponse(
        //        orders,
        //        pageNumber,
        //        pageSize,
        //        totalCount,
        //        Request,
        //        "my-orders");
        //}

        // GET: api/order
        [HttpGet]
        public async Task<ActionResult<PagedResponse<OrderResponse>>> GetAllOrders(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = DEFAULT_PAGE_SIZE,
            [FromQuery] string status = null,
            [FromQuery] int? userId = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] string sortBy = "CreatedAt",
            [FromQuery] bool desc = true)
        {
            // Validate page size
            if (pageSize <= 0) pageSize = DEFAULT_PAGE_SIZE;
            if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

            // Ensure valid page number
            if (pageNumber <= 0) pageNumber = 1;

            // Start query
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(o => o.Status == status);
            }

            if (userId.HasValue)
            {
                query = query.Where(o => o.User.Id == userId.Value);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(o => o.CreatedAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(o => o.CreatedAt <= toDate.Value);
            }

            // Apply sorting
            query = ApplySorting(query, sortBy, desc);

            // Get total count for pagination
            var totalCount = await query.CountAsync();

            // Apply pagination
            var orders = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new OrderResponse
                {
                    Id = o.Id,
                    Status = o.Status,
                    PhoneNumber = o.PhoneNumber,
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
                    }).ToList(),
                    User = new UserBasicResponse
                    {
                        Id = o.User.Id,
                        Name = o.User.Username,
                        Email = o.User.Email
                    }
                })
                .ToListAsync();

            // Create paged response
            return PaginationHelper.CreatePagedResponse(
                orders,
                pageNumber,
                pageSize,
                totalCount,
                Request,
                "orders");
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderResponse>> GetOrder(int id)
        {
            // Kiểm tra xem người dùng có phải admin không
            bool isAdmin = User.IsInRole("Admin");

            // Khởi tạo query ban đầu
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
                .Where(o => o.Id == id);

            // Nếu không phải admin, chỉ cho phép xem đơn hàng của chính họ
            //if (!isAdmin)
            //{
            //    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            //    query = query.Where(o => o.User.Id == userId);
            //}

            var order = await query
                .Select(o => new OrderResponse
                {
                    Id = o.Id,
                    Status = o.Status,
                    SubTotal = o.TotalAmount - 30000, // Giả định phí vận chuyển là 30000
                    ShippingFee = 30000,
                    Total = o.TotalAmount,
                    Note = string.Empty,
                    PhoneNumber = o.PhoneNumber,
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
                            ImageUrl = i.Product.ImageUrl,
                            Price = i.UnitPrice
                        },
                        Quantity = i.Quantity,
                        Price = i.UnitPrice,
                        Total = i.TotalPrice
                    }).ToList(),
                    User = new UserBasicResponse
                    {
                        Id = o.User.Id,
                        Name = o.User.Username,
                        Email = o.User.Email
                    }
                })
                .FirstOrDefaultAsync();

            if (order == null)
                return NotFound();
            //xử lý cho image sản phẩm
            foreach (var item in order.Items)
            {
                item.Product.Image = GetFullImageUrl(item.Product.ImageUrl);
                
            }
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
        // Helper function to generate full image URL
        private string GetFullImageUrl(string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
                return null;

            if (imageUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                return imageUrl;

            // Đảm bảo rằng imageUrl bắt đầu bằng /
            if (!imageUrl.StartsWith("/"))
                imageUrl = "/" + imageUrl;

            return $"{Request.Scheme}://{Request.Host}{imageUrl}";
        }
        // POST: api/order  
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderRequest request)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu tạo đơn hàng từ {request.FullName}");

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Yêu cầu không hợp lệ: ModelState invalid");
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Thông tin đơn hàng không hợp lệ"
                    });
                }

                // Tạo đơn hàng mới  
                var order = new Order
                {
                    ShippingAddress = request.ShippingAddress,
                    PhoneNumber = request.PhoneNumber,
                    TotalAmount = request.TotalAmount,
                    Status = "Pending", // Trạng thái mặc định khi tạo  
                    PaymentMethod = request.PaymentMethod,
                    CreatedAt = DateTime.Now,
                    OrderItems = request.Items.Select(item =>
                    {
                        var product = _context.Products.Find(item.ProductId);
                        if (product == null)
                        {
                            throw new Exception($"Product with ID {item.ProductId} not found.");
                        }
                        return new OrderItem
                        {
                            Product = product,
                            Quantity = item.Quantity,
                            UnitPrice = product.Price,
                            TotalPrice = product.Price * item.Quantity
                        };
                    }).ToList()
                };

                // Thêm thông tin người dùng nếu đã đăng nhập  
                // Trong trường hợp chưa đăng nhập, tạo đơn hàng với thông tin khách vãng lai  
                var userId = User.Identity.IsAuthenticated ? int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0") : 0; ;

                if (userId > 0)
                {
                    var user = await _context.Users.FindAsync(userId);
                    if (user == null)
                    {
                        return BadRequest("User not found.");
                    }
                    order.User = user;
                }
                else
                {
                    // Tạo người dùng tạm thời hoặc xử lý đơn hàng khách vãng lai  
                    var guestUser = new User
                    {
                        FullName = request.FullName,
                        Email = request.Email,
                        PhoneNumber = request.PhoneNumber,
                        Address = request.ShippingAddress,
                        IsGuest = true
                    };

                    _context.Users.Add(guestUser);
                    await _context.SaveChangesAsync();

                    order.User = guestUser;
                }

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Đã tạo đơn hàng mới với ID: {order.Id}");

                // Trả về thông tin đơn hàng  
                return Ok(new
                {
                    Success = true,
                    Message = "Đặt hàng thành công",
                    OrderId = order.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi tạo đơn hàng: {ex.Message}");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi xử lý đơn hàng"
                });
            }
        }

        // PUT: api/order/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] UpdateOrderRequest request)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Include(o => o.User)
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

            // Xử lý cập nhật các OrderItems
            if (request.Items != null && request.Items.Any())
            {
                // Xóa tất cả các OrderItems hiện có
                _context.OrderItems.RemoveRange(order.OrderItems);

                // Tạo lại danh sách OrderItems mới
                order.OrderItems = new List<ECommerceAPI.Entities.OrderItem>();
                decimal totalAmount = 0;

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
                        Order = order,
                        Quantity = item.Quantity,
                        UnitPrice = product.Price,
                        TotalPrice = product.Price * item.Quantity
                    };

                    totalAmount += orderItem.TotalPrice;
                    order.OrderItems.Add(orderItem);
                }

                order.TotalAmount = totalAmount;
            }

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

        #region Helper Methods

        // Apply sorting to query
        private IQueryable<Order> ApplySorting(IQueryable<Order> query, string sortBy, bool desc)
        {
            switch (sortBy.ToLower())
            {
                case "createdat":
                    return desc ? query.OrderByDescending(o => o.CreatedAt) : query.OrderBy(o => o.CreatedAt);

                case "totalamount":
                    return desc ? query.OrderByDescending(o => o.TotalAmount) : query.OrderBy(o => o.TotalAmount);

                case "status":
                    return desc ? query.OrderByDescending(o => o.Status) : query.OrderBy(o => o.Status);

                default:
                    return desc ? query.OrderByDescending(o => o.Id) : query.OrderBy(o => o.Id);
            }
        }

        #endregion Helper Methods
    }

    public class OrderStatusUpdateRequest
    {
        public string Status { get; set; }
    }
}