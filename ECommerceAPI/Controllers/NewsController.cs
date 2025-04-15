using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ECommerceAPI.Data;
using ECommerceAPI.Entities;
using ECommerceAPI.Models.Responses;
using ECommerceAPI.Models.Requests;
using ECommerceAPI.Helpers;

namespace ECommerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly string _imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "news");
        private const int DEFAULT_PAGE_SIZE = 10;
        private const int MAX_PAGE_SIZE = 50;

        public NewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy danh sách tin tức có phân trang và lọc
        /// </summary>
        /// <param name="filter">Thông tin lọc và phân trang</param>
        /// <returns>Danh sách tin tức đã phân trang</returns>
        [HttpGet]
        [ProducesResponseType(typeof(PagedResponse<NewsResponse>), StatusCodes.Status200OK)]
        public async Task<ActionResult<PagedResponse<NewsResponse>>> GetNews([FromQuery] NewsFilterRequest filter)
        {
            // Thiết lập giá trị mặc định nếu không có
            filter ??= new NewsFilterRequest();
            
            // Validate page size
            if (filter.PageSize <= 0) filter.PageSize = DEFAULT_PAGE_SIZE;
            if (filter.PageSize > MAX_PAGE_SIZE) filter.PageSize = MAX_PAGE_SIZE;
            
            // Ensure valid page number
            if (filter.PageNumber <= 0) filter.PageNumber = 1;
            
            // Start query
            var query = _context.News.Include(n => n.CategoryInfo).AsQueryable();
                
            // Apply filters
            if (!string.IsNullOrEmpty(filter.Keyword))
            {
                var keyword = filter.Keyword.ToLower();
                query = query.Where(n => n.Title.ToLower().Contains(keyword) || 
                                        n.Content.ToLower().Contains(keyword));
            }
            
            if (!string.IsNullOrEmpty(filter.Category))
            {
                query = query.Where(n => n.Category == filter.Category);
            }
            
            if (!string.IsNullOrEmpty(filter.Status))
            {
                query = query.Where(n => n.Status == filter.Status);
            }
            
            // Apply sorting
            query = ApplySorting(query, filter.SortBy, filter.Desc);
            
            // Get total count for pagination
            var totalCount = await query.CountAsync();
            
            // Apply pagination
            var news = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();
                
            // Process image URLs and map to response
            var newsResponses = news.Select(item => {
                // Update image URL
                item.ImageUrl = GetFullImageUrl(item.ImageUrl);
                
                // Map to NewsResponse
                return MapToNewsResponse(item);
            }).ToList();
            
            // Create paged response
            return PaginationHelper.CreatePagedResponse(
                newsResponses, 
                filter.PageNumber, 
                filter.PageSize, 
                totalCount, 
                Request, 
                "news");
        }

        /// <summary>
        /// Lấy thông tin chi tiết một tin tức theo ID
        /// </summary>
        /// <param name="id">ID của tin tức</param>
        /// <returns>Thông tin chi tiết tin tức</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(NewsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<NewsResponse>> GetNews(int id)
        {
            var news = await _context.News.Include(n => n.CategoryInfo).FirstOrDefaultAsync(n => n.Id == id);
            if (news == null)
            {
                return NotFound();
            }

            news.ImageUrl = GetFullImageUrl(news.ImageUrl);
            return MapToNewsResponse(news);
        }

        /// <summary>
        /// Lấy danh sách tin tức theo danh mục
        /// </summary>
        /// <param name="category">Tên danh mục</param>
        /// <param name="filter">Thông tin lọc và phân trang</param>
        /// <returns>Danh sách tin tức đã phân trang</returns>
        [HttpGet("category/{category}")]
        [ProducesResponseType(typeof(PagedResponse<NewsResponse>), StatusCodes.Status200OK)]
        public async Task<ActionResult<PagedResponse<NewsResponse>>> GetNewsByCategory(
            string category,
            [FromQuery] NewsFilterRequest filter)
        {
            // Thiết lập giá trị mặc định nếu không có
            filter ??= new NewsFilterRequest();
            
            // Validate page size
            if (filter.PageSize <= 0) filter.PageSize = DEFAULT_PAGE_SIZE;
            if (filter.PageSize > MAX_PAGE_SIZE) filter.PageSize = MAX_PAGE_SIZE;
            
            // Ensure valid page number
            if (filter.PageNumber <= 0) filter.PageNumber = 1;
            
            // Start query
            var query = _context.News
                .Include(n => n.CategoryInfo)
                .Where(n => n.Category == category)
                .AsQueryable();
                
            // Apply filters
            if (!string.IsNullOrEmpty(filter.Keyword))
            {
                var keyword = filter.Keyword.ToLower();
                query = query.Where(n => n.Title.ToLower().Contains(keyword) || 
                                        n.Content.ToLower().Contains(keyword));
            }
            
            // Apply sorting
            query = ApplySorting(query, filter.SortBy, filter.Desc);
            
            // Get total count for pagination
            var totalCount = await query.CountAsync();
            
            // Apply pagination
            var news = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();
                
            // Process image URLs and map to response
            var newsResponses = news.Select(item => {
                // Update image URL
                item.ImageUrl = GetFullImageUrl(item.ImageUrl);
                
                // Map to NewsResponse
                return MapToNewsResponse(item);
            }).ToList();
            
            // Create paged response
            return PaginationHelper.CreatePagedResponse(
                newsResponses, 
                filter.PageNumber, 
                filter.PageSize, 
                totalCount, 
                Request, 
                "news-by-category");
        }

        /// <summary>
        /// Tạo tin tức mới
        /// </summary>
        /// <param name="request">Thông tin tin tức mới</param>
        /// <returns>Thông tin tin tức đã tạo</returns>
        [HttpPost]
        [ProducesResponseType(typeof(NewsResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<News>> CreateNews([FromForm] NewsRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var news = new News
            {
                Title = request.Title,
                Content = request.Content,
                Status = request.Status ?? "Published",
                Author = request.Author ?? "Admin",
                Category = "News", // Mặc định
                CategoryId = request.CategoryId,
                CreatedAt = DateTime.Now
            };

            if (request.Image != null)
            {
                if (!Directory.Exists(_imagePath))
                {
                    Directory.CreateDirectory(_imagePath);
                }

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(request.Image.FileName)}";
                var filePath = Path.Combine(_imagePath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.Image.CopyToAsync(stream);
                }

                news.ImageUrl = $"/images/news/{fileName}";
            }

            _context.News.Add(news);
            await _context.SaveChangesAsync();

            news.ImageUrl = GetFullImageUrl(news.ImageUrl);
            return CreatedAtAction(nameof(GetNews), new { id = news.Id }, news);
        }

        /// <summary>
        /// Cập nhật tin tức
        /// </summary>
        /// <param name="id">ID của tin tức</param>
        /// <param name="request">Thông tin cập nhật</param>
        /// <returns>Không có nội dung trả về nếu thành công</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateNews(int id, [FromForm] NewsRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != request.Id)
            {
                return BadRequest("ID không khớp");
            }

            var existingNews = await _context.News.FindAsync(id);
            if (existingNews == null)
            {
                return NotFound();
            }

            // Cập nhật các thông tin cơ bản
            existingNews.Title = request.Title;
            existingNews.Content = request.Content;
            existingNews.Status = request.Status;
            existingNews.CategoryId = request.CategoryId;
            existingNews.UpdatedAt = DateTime.Now;

            // Handle image update
            if (request.Image != null)
            {
                if (!Directory.Exists(_imagePath))
                {
                    Directory.CreateDirectory(_imagePath);
                }

                // Delete old image if exists
                if (!string.IsNullOrEmpty(existingNews.ImageUrl))
                {
                    var oldImagePath = Path.Combine(_imagePath, Path.GetFileName(existingNews.ImageUrl));
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

                existingNews.ImageUrl = $"/images/news/{fileName}";
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NewsExists(id))
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

        /// <summary>
        /// Xóa tin tức
        /// </summary>
        /// <param name="id">ID của tin tức cần xóa</param>
        /// <returns>Không có nội dung trả về nếu thành công</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteNews(int id)
        {
            var news = await _context.News.FindAsync(id);
            if (news == null)
            {
                return NotFound();
            }

            // Delete image file if exists
            if (!string.IsNullOrEmpty(news.ImageUrl))
            {
                var filePath = Path.Combine(_imagePath, Path.GetFileName(news.ImageUrl));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            _context.News.Remove(news);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool NewsExists(int id)
        {
            return _context.News.Any(e => e.Id == id);
        }

        // Helper function to generate full image URL
        private string GetFullImageUrl(string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
                return null;

            return $"{Request.Scheme}://{Request.Host}{imageUrl}";
        }
        
        // Apply sorting to query
        private IQueryable<News> ApplySorting(IQueryable<News> query, string sortBy, bool desc)
        {
            switch (sortBy.ToLower())
            {
                case "title":
                    return desc ? query.OrderByDescending(n => n.Title) : query.OrderBy(n => n.Title);
                case "createdat":
                    return desc ? query.OrderByDescending(n => n.CreatedAt) : query.OrderBy(n => n.CreatedAt);
                case "updatedat":
                    return desc ? query.OrderByDescending(n => n.UpdatedAt) : query.OrderBy(n => n.UpdatedAt);
                case "author":
                    return desc ? query.OrderByDescending(n => n.Author) : query.OrderBy(n => n.Author);
                default:
                    return desc ? query.OrderByDescending(n => n.Id) : query.OrderBy(n => n.Id);
            }
        }

        // Thêm phương thức map từ News entity sang NewsResponse
        private NewsResponse MapToNewsResponse(News news)
        {
            return new NewsResponse
            {
                Id = news.Id,
                Title = news.Title,
                Content = news.Content,
                ImageUrl = news.ImageUrl,
                Author = news.Author,
                Status = news.Status,
                CreatedAt = news.CreatedAt,
                UpdatedAt = news.UpdatedAt,
                ViewCount = news.ViewCount,
                Category = news.CategoryInfo != null ? new CategoryResponse
                {
                    Id = news.CategoryInfo.Id,
                    Name = news.CategoryInfo.Name,
                    Description = news.CategoryInfo.Description
                } : null
            };
        }
    }
} 