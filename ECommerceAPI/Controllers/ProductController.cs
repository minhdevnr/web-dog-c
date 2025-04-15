using ECommerceAPI.Data;
using ECommerceAPI.Entities;
using ECommerceAPI.Helpers;
using ECommerceAPI.Models.Requests;
using ECommerceAPI.Models.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly string _imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
        private const int DEFAULT_PAGE_SIZE = 10;
        private const int MAX_PAGE_SIZE = 50;

        public ProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/product
        [HttpGet]
        public async Task<ActionResult<PagedResponse<ProductResponse>>> GetProducts(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = DEFAULT_PAGE_SIZE,
            [FromQuery] string keyword = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool desc = false)
        {
            // Validate page size
            if (pageSize <= 0) pageSize = DEFAULT_PAGE_SIZE;
            if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

            // Ensure valid page number
            if (pageNumber <= 0) pageNumber = 1;

            // Start query
            var query = _context.Products
                .Include(p => p.Category)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(keyword) ||
                                        p.Description.ToLower().Contains(keyword));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            // Apply sorting
            query = ApplySorting(query, sortBy, desc);

            // Get total count for pagination
            var totalCount = await query.CountAsync();

            // Apply pagination
            var products = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Map to response model
            var productResponses = products.Select(MapToProductResponse).ToList();

            // Create paged response
            return PaginationHelper.CreatePagedResponse(
                productResponses,
                pageNumber,
                pageSize,
                totalCount,
                Request,
                "products");
        }

        // GET: api/product/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductResponse>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(new { message = "Sản phẩm không tồn tại" });
            }

            return MapToProductResponse(product);
        }

        // GET: api/product/category/{categoryId}
        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<PagedResponse<ProductResponse>>> GetProductsByCategory(
            int categoryId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = DEFAULT_PAGE_SIZE,
            [FromQuery] string keyword = null,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool desc = false)
        {
            // Validate page size
            if (pageSize <= 0) pageSize = DEFAULT_PAGE_SIZE;
            if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

            // Ensure valid page number
            if (pageNumber <= 0) pageNumber = 1;

            // Check if category exists
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == categoryId);
            if (!categoryExists)
            {
                return NotFound(new { message = "Danh mục không tồn tại" });
            }

            // Start query
            var query = _context.Products
                .Include(p => p.Category)
                .Where(p => p.CategoryId == categoryId)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(keyword) ||
                                        p.Description.ToLower().Contains(keyword));
            }

            // Apply sorting
            query = ApplySorting(query, sortBy, desc);

            // Get total count for pagination
            var totalCount = await query.CountAsync();

            // Apply pagination
            var products = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Map to response model
            var productResponses = products.Select(MapToProductResponse).ToList();

            // Create paged response
            return PaginationHelper.CreatePagedResponse(
                productResponses,
                pageNumber,
                pageSize,
                totalCount,
                Request,
                "products-by-category");
        }

        // POST: api/product
        [HttpPost]
        public async Task<ActionResult<ProductResponse>> CreateProduct([FromForm] ProductRequest request)
        {
            // Verify category exists
            var category = await _context.Categories.FindAsync(request.CategoryId);
            if (category == null)
            {
                return BadRequest("Danh mục không hợp lệ");
            }

            // Map từ request sang entity
            var product = new Product
            {
                Name = request.Name,
                Price = request.Price,
                OriginalPrice = request.OriginalPrice,
                Description = request.Description,
                Origin = request.Origin,
                ExpiryDate = request.ExpiryDate,
                Stock = request.Stock,
                Status = request.Status,
                CategoryId = request.CategoryId,
                CreatedAt = DateTime.Now
            };

            // Xử lý hình ảnh
            if (request.Image != null)
            {
                if (!Directory.Exists(_imagePath))
                {
                    Directory.CreateDirectory(_imagePath);
                }

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(request.Image.FileName)}"; // Unique filename
                var filePath = Path.Combine(_imagePath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.Image.CopyToAsync(stream);
                }

                product.ImageUrl = $"/images/{fileName}"; // Store relative path
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Load the category for the response
            await _context.Entry(product).Reference(p => p.Category).LoadAsync();

            // Map to response
            var response = MapToProductResponse(product);

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, response);
        }

        // PUT: api/product/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<ProductResponse>> UpdateProduct(int id, [FromForm] ProductRequest request)
        {
            var existingProduct = await _context.Products.FindAsync(id);
            if (existingProduct == null)
            {
                return NotFound(new { message = "Sản phẩm không tồn tại" });
            }

            // Verify category exists
            if (request.CategoryId > 0)
            {
                var category = await _context.Categories.FindAsync(request.CategoryId);
                if (category == null)
                {
                    return BadRequest("Danh mục không hợp lệ");
                }
            }

            // Cập nhật thông tin từ request
            existingProduct.Name = request.Name;
            existingProduct.Price = request.Price;
            existingProduct.OriginalPrice = request.OriginalPrice;
            existingProduct.Description = request.Description;
            existingProduct.Origin = request.Origin;
            existingProduct.ExpiryDate = request.ExpiryDate;
            existingProduct.Stock = request.Stock;
            existingProduct.Status = request.Status;
            existingProduct.CategoryId = request.CategoryId;
            existingProduct.UpdatedAt = DateTime.Now;

            // Handle image update
            if (request.Image != null)
            {
                if (!Directory.Exists(_imagePath))
                {
                    Directory.CreateDirectory(_imagePath);
                }

                // Delete old image if exists
                if (!string.IsNullOrEmpty(existingProduct.ImageUrl))
                {
                    var oldImagePath = Path.Combine(_imagePath, Path.GetFileName(existingProduct.ImageUrl));
                    if (System.IO.File.Exists(oldImagePath))
                    {
                        System.IO.File.Delete(oldImagePath);
                    }
                }

                // Save new image
                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(request.Image.FileName)}";
                var filePath = Path.Combine(_imagePath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.Image.CopyToAsync(stream);
                }

                existingProduct.ImageUrl = $"/images/{fileName}";
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound(new { message = "Sản phẩm không tồn tại" });
                }
                else
                {
                    throw;
                }
            }

            // Load category for response
            await _context.Entry(existingProduct).Reference(p => p.Category).LoadAsync();

            // Map to response
            var response = MapToProductResponse(existingProduct);

            return Ok(response);
        }

        // DELETE: api/product/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Sản phẩm không tồn tại" });
            }

            // Delete image file if exists
            if (!string.IsNullOrEmpty(product.ImageUrl))
            {
                var filePath = Path.Combine(_imagePath, Path.GetFileName(product.ImageUrl));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa sản phẩm thành công" });
        }

        #region Helper Methods

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
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

        // Map Product entity to ProductResponse
        private ProductResponse MapToProductResponse(Product product)
        {
            return new ProductResponse
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                OriginalPrice = product.OriginalPrice,
                Description = product.Description,
                ImageUrl = GetFullImageUrl(product.ImageUrl),
                Origin = product.Origin,
                ExpiryDate = product.ExpiryDate,
                Stock = product.Stock,
                Status = product.Status,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt,
                CategoryId = product.CategoryId,
                Category = product.Category != null ? new CategoryResponse
                {
                    Id = product.Category.Id,
                    Name = product.Category.Name,
                    Description = product.Category.Description
                } : null
            };
        }

        // Apply sorting to query
        private IQueryable<Product> ApplySorting(IQueryable<Product> query, string sortBy, bool desc)
        {
            switch (sortBy.ToLower())
            {
                case "name":
                    return desc ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name);

                case "price":
                    return desc ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price);

                case "createdat":
                    return desc ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt);

                case "stock":
                    return desc ? query.OrderByDescending(p => p.Stock) : query.OrderBy(p => p.Stock);

                default:
                    return desc ? query.OrderByDescending(p => p.Id) : query.OrderBy(p => p.Id);
            }
        }

        #endregion Helper Methods
    }
}