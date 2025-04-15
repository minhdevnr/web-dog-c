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

        // GET: api/news
        [HttpGet]
        public async Task<ActionResult<PagedResponse<News>>> GetNews(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = DEFAULT_PAGE_SIZE,
            [FromQuery] string keyword = null,
            [FromQuery] string category = null,
            [FromQuery] string status = null,
            [FromQuery] string sortBy = "CreatedAt",
            [FromQuery] bool desc = true)
        {
            // Validate page size
            if (pageSize <= 0) pageSize = DEFAULT_PAGE_SIZE;
            if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;
            
            // Ensure valid page number
            if (pageNumber <= 0) pageNumber = 1;
            
            // Start query
            var query = _context.News.AsQueryable();
                
            // Apply filters
            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();
                query = query.Where(n => n.Title.ToLower().Contains(keyword) || 
                                        n.Content.ToLower().Contains(keyword));
            }
            
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(n => n.Category == category);
            }
            
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(n => n.Status == status);
            }
            
            // Apply sorting
            query = ApplySorting(query, sortBy, desc);
            
            // Get total count for pagination
            var totalCount = await query.CountAsync();
            
            // Apply pagination
            var news = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
                
            // Process image URLs
            foreach (var item in news)
            {
                item.ImageUrl = GetFullImageUrl(item.ImageUrl);
            }
            
            // Create paged response
            return PaginationHelper.CreatePagedResponse(
                news, 
                pageNumber, 
                pageSize, 
                totalCount, 
                Request, 
                "news");
        }

        // GET: api/news/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<News>> GetNews(int id)
        {
            var news = await _context.News.FindAsync(id);
            if (news == null)
            {
                return NotFound();
            }

            news.ImageUrl = GetFullImageUrl(news.ImageUrl);
            return news;
        }

        // GET: api/news/category/{category}
        [HttpGet("category/{category}")]
        public async Task<ActionResult<PagedResponse<News>>> GetNewsByCategory(
            string category,
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = DEFAULT_PAGE_SIZE,
            [FromQuery] string keyword = null,
            [FromQuery] string sortBy = "CreatedAt",
            [FromQuery] bool desc = true)
        {
            // Validate page size
            if (pageSize <= 0) pageSize = DEFAULT_PAGE_SIZE;
            if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;
            
            // Ensure valid page number
            if (pageNumber <= 0) pageNumber = 1;
            
            // Start query
            var query = _context.News
                .Where(n => n.Category == category)
                .AsQueryable();
                
            // Apply filters
            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();
                query = query.Where(n => n.Title.ToLower().Contains(keyword) || 
                                        n.Content.ToLower().Contains(keyword));
            }
            
            // Apply sorting
            query = ApplySorting(query, sortBy, desc);
            
            // Get total count for pagination
            var totalCount = await query.CountAsync();
            
            // Apply pagination
            var news = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
                
            // Process image URLs
            foreach (var item in news)
            {
                item.ImageUrl = GetFullImageUrl(item.ImageUrl);
            }
            
            // Create paged response
            return PaginationHelper.CreatePagedResponse(
                news, 
                pageNumber, 
                pageSize, 
                totalCount, 
                Request, 
                "news-by-category");
        }

        // POST: api/news
        [HttpPost]
        public async Task<ActionResult<News>> CreateNews([FromForm] News news, IFormFile image)
        {
            if (image != null)
            {
                if (!Directory.Exists(_imagePath))
                {
                    Directory.CreateDirectory(_imagePath);
                }

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(image.FileName)}";
                var filePath = Path.Combine(_imagePath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                news.ImageUrl = $"/images/news/{fileName}";
            }

            news.CreatedAt = DateTime.Now;
            news.Status = news.Status ?? "Published";
            news.Author = news.Author ?? "Admin";

            _context.News.Add(news);
            await _context.SaveChangesAsync();

            news.ImageUrl = GetFullImageUrl(news.ImageUrl);
            return CreatedAtAction(nameof(GetNews), new { id = news.Id }, news);
        }

        // PUT: api/news/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNews(int id, [FromForm] News news, IFormFile image)
        {
            if (id != news.Id)
            {
                return BadRequest();
            }

            var existingNews = await _context.News.FindAsync(id);
            if (existingNews == null)
            {
                return NotFound();
            }

            // Handle image update
            if (image != null)
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
                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(image.FileName)}";
                var filePath = Path.Combine(_imagePath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                news.ImageUrl = $"/images/news/{fileName}";
            }
            else
            {
                news.ImageUrl = existingNews.ImageUrl;
            }

            news.UpdatedAt = DateTime.Now;
            news.CreatedAt = existingNews.CreatedAt;

            _context.Entry(existingNews).CurrentValues.SetValues(news);

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

        // DELETE: api/news/{id}
        [HttpDelete("{id}")]
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
    }
} 