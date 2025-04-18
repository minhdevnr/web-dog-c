using ECommerceAPI.Data;
using ECommerceAPI.Entities;
using ECommerceAPI.Helpers;
using ECommerceAPI.Models.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private const int DEFAULT_PAGE_SIZE = 10;
        private const int MAX_PAGE_SIZE = 50;

        public CategoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/category
        [HttpGet]
        public async Task<ActionResult<PagedResponse<Category>>> GetCategories(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = DEFAULT_PAGE_SIZE,
            [FromQuery] string keyword = null,
            [FromQuery] bool includeProducts = false,
            [FromQuery] string sortBy = "Id",
            [FromQuery] bool desc = false)
        {
            // Validate page size
            if (pageSize <= 0) pageSize = DEFAULT_PAGE_SIZE;
            if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

            // Ensure valid page number
            if (pageNumber <= 0) pageNumber = 1;

            // Start query
            var query = _context.Categories.AsQueryable();

            // Include products if requested
            if (includeProducts)
            {
                query = query.Include(c => c.Products);
            }

            // Apply filters
            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();
                query = query.Where(c => c.Name.ToLower().Contains(keyword) ||
                                       (c.Description != null && c.Description.ToLower().Contains(keyword)));
            }

            // Apply sorting
            query = ApplySorting(query, sortBy, desc);

            // Get total count for pagination
            var totalCount = await query.CountAsync();

            // Apply pagination
            var categories = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Create paged response
            return PaginationHelper.CreatePagedResponse(
                categories,
                pageNumber,
                pageSize,
                totalCount,
                Request,
                "categories");
        }

        // GET: api/category/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound();
            }

            return category;
        }

        // POST: api/category
        [HttpPost]
        public async Task<ActionResult<Category>> CreateCategory(Category category)
        {
            try
            {
                // Đảm bảo các giá trị hợp lệ
                if (string.IsNullOrWhiteSpace(category.Name))
                {
                    return BadRequest("Tên danh mục không được để trống");
                }

                category.CreatedAt = DateTime.Now;
                category.Products = new HashSet<Product>(); // Khởi tạo collection Products

                _context.Categories.Add(category);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
            }
            catch (DbUpdateException ex)
            {
                // Xử lý lỗi database
                if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE"))
                {
                    return BadRequest("Đã tồn tại danh mục với tên này");
                }
                return BadRequest($"Không thể tạo danh mục: {ex.Message}");
            }
        }

        // PUT: api/category/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, Category category)
        {
            if (id != category.Id)
            {
                return BadRequest("ID trong URL và body request không khớp");
            }

            // Lấy category hiện tại kèm theo products (để giữ nguyên relationship)
            var existingCategory = await _context.Categories
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (existingCategory == null)
            {
                return NotFound("Không tìm thấy danh mục");
            }

            // Chỉ cập nhật các trường cần thiết, giữ nguyên các relationship
            existingCategory.Name = category.Name;
            existingCategory.Description = category.Description;
            existingCategory.UpdatedAt = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            catch (DbUpdateException ex)
            {
                // Xử lý lỗi foreign key
                if (ex.InnerException != null && ex.InnerException.Message.Contains("FOREIGN KEY"))
                {
                    return BadRequest("Không thể cập nhật danh mục do có ràng buộc với sản phẩm");
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/category/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            // Check if category has products
            var hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id);
            if (hasProducts)
            {
                return BadRequest("Cannot delete category with associated products");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CategoryExists(int id)
        {
            return _context.Categories.Any(e => e.Id == id);
        }

        // Apply sorting to query
        private IQueryable<Category> ApplySorting(IQueryable<Category> query, string sortBy, bool desc)
        {
            switch (sortBy.ToLower())
            {
                case "name":
                    return desc ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name);

                case "createdat":
                    return desc ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt);

                case "productcount":
                    return desc ? query.OrderByDescending(c => c.Products.Count) : query.OrderBy(c => c.Products.Count);

                default:
                    return desc ? query.OrderByDescending(c => c.Id) : query.OrderBy(c => c.Id);
            }
        }
    }
}