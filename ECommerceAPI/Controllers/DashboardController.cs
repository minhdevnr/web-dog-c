using ECommerceAPI.Data;
using ECommerceAPI.Models.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ECommerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/dashboard/summary
        [HttpGet("summary")]
        public async Task<ActionResult<DashboardSummary>> GetSummary()
        {
            try
            {
                // Tính tổng doanh thu
                decimal totalRevenue = await _context.Orders
                    .Where(o => o.Status == "Delivered" || o.Status == "delivered")
                    .SumAsync(o => o.TotalAmount);

                // Tính doanh thu đơn hàng thành công
                decimal successRevenue = await _context.Orders
                    .Where(o => o.Status == "Delivered" || o.Status == "delivered")
                    .SumAsync(o => o.TotalAmount);

                // Tính doanh thu đơn hàng đang chờ
                decimal pendingRevenue = await _context.Orders
                    .Where(o => o.Status == "Pending" || o.Status == "pending" || 
                           o.Status == "Processing" || o.Status == "processing")
                    .SumAsync(o => o.TotalAmount);

                // Lấy 5 hoạt động gần đây nhất
                var recentActivities = await _context.Orders
                    .Include(o => o.User)
                    .OrderByDescending(o => o.CreatedAt)
                    .Take(5)
                    .Select(o => new RecentActivity
                    {
                        Id = o.Id,
                        Title = $"Đơn hàng #{o.Id}",
                        StartDate = o.CreatedAt,
                        EndDate = o.UpdatedAt ?? o.CreatedAt,
                        Status = o.Status,
                        UserName = o.User.Username
                    })
                    .ToListAsync();

                return new DashboardSummary
                {
                    TotalRevenue = totalRevenue,
                    SuccessRevenue = successRevenue,
                    PendingRevenue = pendingRevenue,
                    RecentActivities = recentActivities
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu dashboard: " + ex.Message });
            }
        }

        // GET: api/dashboard/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<DashboardStatistics>> GetStatistics()
        {
            try
            {
                // Tính tổng số đơn hàng
                int totalOrders = await _context.Orders.CountAsync();
                
                // Tính số đơn thành công
                int completedOrders = await _context.Orders
                    .Where(o => o.Status == "Delivered" || o.Status == "delivered")
                    .CountAsync();
                
                // Tính số đơn đang xử lý
                int processingOrders = await _context.Orders
                    .Where(o => o.Status == "Processing" || o.Status == "processing")
                    .CountAsync();
                
                // Tính số đơn bị hủy
                int cancelledOrders = await _context.Orders
                    .Where(o => o.Status == "Cancelled" || o.Status == "cancelled")
                    .CountAsync();

                // Tính tổng số người dùng
                int totalUsers = await _context.Users.CountAsync();
                
                // Tính tổng số sản phẩm
                int totalProducts = await _context.Products.CountAsync();

                return new DashboardStatistics
                {
                    TotalOrders = totalOrders,
                    CompletedOrders = completedOrders,
                    ProcessingOrders = processingOrders,
                    CancelledOrders = cancelledOrders,
                    TotalUsers = totalUsers,
                    TotalProducts = totalProducts
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thống kê dashboard: " + ex.Message });
            }
        }
    }

    // Các class cho response models
    public class DashboardSummary
    {
        public decimal TotalRevenue { get; set; }
        public decimal SuccessRevenue { get; set; }
        public decimal PendingRevenue { get; set; }
        public List<RecentActivity> RecentActivities { get; set; } = new List<RecentActivity>();
    }

    public class RecentActivity
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; }
        public string UserName { get; set; }
    }

    public class DashboardStatistics
    {
        public int TotalOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int ProcessingOrders { get; set; }
        public int CancelledOrders { get; set; }
        public int TotalUsers { get; set; }
        public int TotalProducts { get; set; }
    }
} 