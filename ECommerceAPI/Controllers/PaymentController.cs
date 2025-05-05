using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using ECommerceAPI.Helpers;
using ECommerceAPI.Models.Requests;
using ECommerceAPI.Models.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using ECommerceAPI.Data;

namespace ECommerceAPI.Controllers
{
    [Route("api/payment")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<PaymentController> _logger;
        
        public PaymentController(IConfiguration configuration, ILogger<PaymentController> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }
        
        /// <summary>
        /// Tạo URL thanh toán VNPay
        /// </summary>
        [HttpPost("vnpay/create-payment")]
        public IActionResult CreateVnPayPayment([FromBody] VnPayPaymentRequest request)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu tạo thanh toán VNPay cho đơn hàng {request.OrderId} với số tiền {request.Amount}");
                
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Yêu cầu không hợp lệ: ModelState invalid");
                    return BadRequest(new VnPayPaymentResponse
                    {
                        Success = false,
                        Message = "Thông tin đơn hàng không hợp lệ"
                    });
                }
                
                // Lấy cấu hình VNPay từ appsettings.json
                string vnpayUrl = _configuration["VnPay:PaymentUrl"];
                string tmnCode = _configuration["VnPay:TmnCode"];
                string hashSecret = _configuration["VnPay:HashSecret"];
                string returnUrl = _configuration["VnPay:ReturnUrl"];
                
                _logger.LogInformation($"Cấu hình VNPay: URL={vnpayUrl}, TMN={tmnCode}, ReturnUrl={returnUrl}");
                
                if (string.IsNullOrEmpty(vnpayUrl) || string.IsNullOrEmpty(tmnCode) || 
                    string.IsNullOrEmpty(hashSecret) || string.IsNullOrEmpty(returnUrl))
                {
                    _logger.LogError("Thiếu cấu hình VNPay trong appsettings.json");
                    return StatusCode(StatusCodes.Status500InternalServerError, new VnPayPaymentResponse
                    {
                        Success = false,
                        Message = "Lỗi cấu hình thanh toán"
                    });
                }
                
                // Lấy IP của client
                string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                _logger.LogInformation($"IP Client: {ipAddress}");
                
                // Tạo URL thanh toán
                var vnPayHelper = new VnPayHelper(vnpayUrl, tmnCode, hashSecret, returnUrl);
                string paymentUrl = vnPayHelper.CreatePaymentUrl(request, ipAddress);
                
                _logger.LogInformation($"Đã tạo URL thanh toán: {paymentUrl}");
                
                // Trả về URL thanh toán
                return Ok(new VnPayPaymentResponse
                {
                    Success = true,
                    Message = "Tạo URL thanh toán thành công",
                    PaymentUrl = paymentUrl,
                    OrderId = request.OrderId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi tạo URL thanh toán VNPay: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, new VnPayPaymentResponse
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi tạo URL thanh toán: " + ex.Message
                });
            }
        }
        
        /// <summary>
        /// Xử lý kết quả thanh toán từ VNPay
        /// </summary>
        [HttpGet("vnpay/payment-return")]
        public IActionResult ProcessVnPayReturn([FromQuery] Dictionary<string, string> requestParams)
        {
            try
            {
                _logger.LogInformation($"Nhận callback từ VNPay với {requestParams.Count} tham số");
                foreach (var param in requestParams)
                {
                    _logger.LogInformation($"Param: {param.Key}={param.Value}");
                }
                
                // Lấy thông tin từ cấu hình
                string hashSecret = _configuration["VnPay:HashSecret"];
                string tmnCode = _configuration["VnPay:TmnCode"];
                string vnpayUrl = _configuration["VnPay:PaymentUrl"];
                string returnUrl = _configuration["VnPay:ReturnUrl"];
                
                if (string.IsNullOrEmpty(hashSecret) || string.IsNullOrEmpty(tmnCode))
                {
                    _logger.LogError("Thiếu cấu hình VNPay trong appsettings.json");
                    return StatusCode(StatusCodes.Status500InternalServerError, new VnPayReturnResponse
                    {
                        Success = false,
                        Message = "Lỗi cấu hình thanh toán"
                    });
                }
                
                var vnPayHelper = new VnPayHelper(vnpayUrl, tmnCode, hashSecret, returnUrl);
                
                // Kiểm tra chữ ký
                bool isValidSignature = vnPayHelper.ValidateSignature(requestParams);
                
                if (!isValidSignature)
                {
                    _logger.LogWarning("Chữ ký không hợp lệ từ callback VNPay");
                    return BadRequest(new VnPayReturnResponse
                    {
                        Success = false,
                        Message = "Chữ ký không hợp lệ"
                    });
                }
                
                // Lấy thông tin giao dịch
                if (!requestParams.TryGetValue("vnp_ResponseCode", out string vnpResponseCode) ||
                    !requestParams.TryGetValue("vnp_TxnRef", out string orderId) ||
                    !requestParams.TryGetValue("vnp_TransactionNo", out string vnpTransactionId) ||
                    !requestParams.TryGetValue("vnp_Amount", out string amountStr))
                {
                    _logger.LogWarning("Thiếu tham số bắt buộc từ callback VNPay");
                    return BadRequest(new VnPayReturnResponse
                    {
                        Success = false,
                        Message = "Thiếu thông tin giao dịch"
                    });
                }
                
                requestParams.TryGetValue("vnp_BankCode", out string vnpBankCode);
                requestParams.TryGetValue("vnp_PayDate", out string vnpPayDate);
                
                decimal amount = decimal.Parse(amountStr) / 100; // VNPay trả về số tiền * 100
                
                _logger.LogInformation($"Thông tin giao dịch: OrderId={orderId}, Amount={amount}, ResponseCode={vnpResponseCode}");
                
                // Kiểm tra mã phản hồi từ VNPay
                bool isSuccess = vnpResponseCode == "00";
                string status = isSuccess ? "Completed" : "Failed";
                string message = isSuccess ? "Thanh toán thành công" : $"Thanh toán thất bại với mã lỗi: {vnpResponseCode}";
                
                // Cập nhật trạng thái đơn hàng trong database
                try
                {
                    using (var scope = new ServiceCollection()
                        .AddDbContext<ApplicationDbContext>(options => 
                            options.UseSqlServer(_configuration.GetConnectionString("DefaultConnection")))
                        .BuildServiceProvider())
                    {
                        var dbContext = scope.GetRequiredService<ApplicationDbContext>();
                        
                        // Chuyển orderId từ string sang int
                        if (int.TryParse(orderId, out int orderIdInt))
                        {
                            var order = dbContext.Orders.FirstOrDefault(o => o.Id == orderIdInt);
                            
                            if (order != null)
                            {
                                order.Status = status;
                                order.UpdatedAt = DateTime.Now;
                                
                                dbContext.SaveChanges();
                                
                                _logger.LogInformation($"Đã cập nhật trạng thái đơn hàng {orderId} thành {status}");
                            }
                            else
                            {
                                _logger.LogWarning($"Không tìm thấy đơn hàng với ID {orderId}");
                            }
                        }
                        else
                        {
                            _logger.LogWarning($"Không thể chuyển đổi orderId {orderId} sang kiểu int");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Lỗi khi cập nhật trạng thái đơn hàng: {ex.Message}");
                }
                
                // Chuyển hướng về trang xác nhận đơn hàng
                string redirectUrl = $"{_configuration["ClientUrl"]}/order-confirmation.html?orderId={orderId}&status={status}";
                
                return Redirect(redirectUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xử lý kết quả thanh toán VNPay: {ex.Message}");
                
                // Chuyển hướng về trang lỗi
                return Redirect($"{_configuration["ClientUrl"]}/payment-error.html");
            }
        }
        
        /// <summary>
        /// Endpoint chính để xử lý tất cả các loại thanh toán
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> ProcessPayment([FromBody] OrderRequest request)
        {
            try
            {
                _logger.LogInformation($"Nhận yêu cầu thanh toán từ {request.FullName} với phương thức {request.PaymentMethod}");
                
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Yêu cầu không hợp lệ: ModelState invalid");
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Thông tin thanh toán không hợp lệ"
                    });
                }
                
                // Xử lý đơn hàng dựa vào phương thức thanh toán
                if (request.PaymentMethod.Equals("VNPay", StringComparison.OrdinalIgnoreCase))
                {
                    // Gọi OrderController để tạo đơn hàng
                    using (var scope = new ServiceCollection()
                        .AddDbContext<ApplicationDbContext>(options => 
                            options.UseSqlServer(_configuration.GetConnectionString("DefaultConnection")))
                        .BuildServiceProvider())
                    {
                        var dbContext = scope.GetRequiredService<ApplicationDbContext>();
                        var loggerFactory = scope.GetRequiredService<ILoggerFactory>();
                        var orderLogger = loggerFactory.CreateLogger<OrderController>();
                        
                        var orderController = new OrderController(dbContext, orderLogger);
                        orderController.ControllerContext = new ControllerContext
                        {
                            HttpContext = HttpContext
                        };
                        
                        var orderResult = await orderController.CreateOrder(request) as ObjectResult;
                        
                        if (orderResult?.StatusCode == 200)
                        {
                            var orderData = orderResult.Value as dynamic;
                            string orderId = orderData.OrderId.ToString();
                            
                            // Tạo yêu cầu thanh toán VNPay
                            var vnpayRequest = new VnPayPaymentRequest
                            {
                                OrderId = orderId,
                                Amount = request.TotalAmount,
                                OrderDesc = $"Thanh toán đơn hàng {orderId}",
                                OrderType = "other",
                                Language = "vn"
                            };
                            
                            // Gọi API tạo URL thanh toán VNPay
                            var vnpayResult = CreateVnPayPayment(vnpayRequest) as ObjectResult;
                            
                            if (vnpayResult?.StatusCode == 200)
                            {
                                return vnpayResult;
                            }
                            
                            return StatusCode(500, new
                            {
                                Success = false,
                                Message = "Lỗi khi tạo URL thanh toán VNPay"
                            });
                        }
                        
                        return orderResult;
                    }
                }
                else if (request.PaymentMethod.Equals("COD", StringComparison.OrdinalIgnoreCase))
                {
                    // Gọi OrderController để tạo đơn hàng COD
                    using (var scope = new ServiceCollection()
                        .AddDbContext<ApplicationDbContext>(options => 
                            options.UseSqlServer(_configuration.GetConnectionString("DefaultConnection")))
                        .BuildServiceProvider())
                    {
                        var dbContext = scope.GetRequiredService<ApplicationDbContext>();
                        var loggerFactory = scope.GetRequiredService<ILoggerFactory>();
                        var orderLogger = loggerFactory.CreateLogger<OrderController>();
                        
                        var orderController = new OrderController(dbContext, orderLogger);
                        orderController.ControllerContext = new ControllerContext
                        {
                            HttpContext = HttpContext
                        };
                        
                        return await orderController.CreateOrder(request);
                    }
                }
                else
                {
                    _logger.LogWarning($"Phương thức thanh toán không được hỗ trợ: {request.PaymentMethod}");
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Phương thức thanh toán không được hỗ trợ"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xử lý thanh toán: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi xử lý thanh toán: " + ex.Message
                });
            }
        }
    }
} 