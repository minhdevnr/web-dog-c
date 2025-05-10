using ECommerceAPI.Data;
using ECommerceAPI.Helpers;
using ECommerceAPI.Models.Requests;
using ECommerceAPI.Models.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Text;

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
                _logger.LogInformation($"Nhận yêu cầu tạo thanh toán VNPay với số tiền {request.Amount}");

                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();

                    _logger.LogWarning($"Yêu cầu không hợp lệ: {string.Join(", ", errors)}");

                    return BadRequest(new VnPayPaymentResponse
                    {
                        Success = false,
                        Message = $"Thông tin đơn hàng không hợp lệ: {string.Join(", ", errors)}"
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
                if (ipAddress == "::1") ipAddress = "127.0.0.1"; // Convert localhost IPv6 to IPv4
                _logger.LogInformation($"IP Client: {ipAddress}");

                // Tạo dữ liệu gửi sang VNPay
                var vnpParams = new SortedDictionary<string, string>();
                vnpParams.Add("vnp_Version", "2.1.0");
                vnpParams.Add("vnp_Command", "pay");
                vnpParams.Add("vnp_TmnCode", tmnCode);

                // Chuyển số tiền sang đúng định dạng VNPay (nhân 100)
                // Số tiền không mang các ký tự phân tách thập phân, phần nghìn, ký tự tiền tệ
                vnpParams.Add("vnp_Amount", Convert.ToInt64(request.Amount * 100).ToString());

                // Thêm mã ngân hàng nếu có
                if (!string.IsNullOrEmpty(request.BankCode))
                {
                    vnpParams.Add("vnp_BankCode", request.BankCode);
                }

                // Thời gian tạo đơn hàng - Định dạng yyyyMMddHHmmss
                string createDate = DateTime.Now.ToString("yyyyMMddHHmmss");
                vnpParams.Add("vnp_CreateDate", createDate);
                vnpParams.Add("vnp_CurrCode", "VND");
                vnpParams.Add("vnp_IpAddr", ipAddress);
                vnpParams.Add("vnp_Locale", request.Language ?? "vn");

                // Đảm bảo OrderInfo không null và không empty
                string orderInfo = !string.IsNullOrEmpty(request.OrderInfo)
                    ? request.OrderInfo
                    : (!string.IsNullOrEmpty(request.OrderDesc)
                        ? request.OrderDesc
                        : $"Thanh toán đơn hàng {request.OrderId}");

                vnpParams.Add("vnp_OrderInfo", orderInfo);
                vnpParams.Add("vnp_OrderType", request.OrderType ?? "billpayment");
                vnpParams.Add("vnp_ReturnUrl", returnUrl);
                vnpParams.Add("vnp_TxnRef", request.OrderId.ToString());

                // Sắp xếp các tham số theo thứ tự alphabet và tạo chuỗi hash
                var signData = new StringBuilder();
                foreach (var kv in vnpParams)
                {
                    if (!string.IsNullOrEmpty(kv.Value))
                    {
                        signData.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
                    }
                }

                // Xóa dấu & cuối cùng
                if (signData.Length > 0)
                {
                    signData.Remove(signData.Length - 1, 1);
                }

                // Tạo chữ ký bằng HMACSHA512
                string secureHash = VnPayHelper.HmacSHA512(hashSecret, signData.ToString());

                // Tạo URL thanh toán
                var paymentUrl = new StringBuilder(vnpayUrl + "?");
                foreach (var kv in vnpParams)
                {
                    paymentUrl.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
                }
                paymentUrl.Append("vnp_SecureHash=" + secureHash);

                _logger.LogInformation($"Đã tạo URL thanh toán: {paymentUrl}");

                // Trả về URL thanh toán
                return Ok(new VnPayPaymentResponse
                {
                    Success = true,
                    Message = "Tạo URL thanh toán thành công",
                    PaymentUrl = paymentUrl.ToString(),
                    OrderId = request.OrderId.ToString()
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
                string clientUrl = _configuration["FrontendBaseUrl"];

                if (string.IsNullOrEmpty(hashSecret))
                {
                    _logger.LogError("Thiếu cấu hình VNPay trong appsettings.json");
                    return StatusCode(StatusCodes.Status500InternalServerError, new VnPayReturnResponse
                    {
                        Success = false,
                        Message = "Lỗi cấu hình thanh toán"
                    });
                }

                // Kiểm tra xem có tham số vnp_SecureHash không
                if (!requestParams.ContainsKey("vnp_SecureHash"))
                {
                    _logger.LogWarning("Thiếu tham số vnp_SecureHash trong callback VNPay");
                    return Redirect($"{clientUrl}/payment-error.html?error=missing_hash");
                }

                // Lấy chữ ký từ VNPay
                string receivedHash = requestParams["vnp_SecureHash"];

                // Tạo SortedDictionary chứa tất cả các tham số vnp_ ngoại trừ vnp_SecureHash và vnp_SecureHashType
                var vnpData = new SortedDictionary<string, string>();
                foreach (var kv in requestParams)
                {
                    if (kv.Key.StartsWith("vnp_") &&
                        kv.Key != "vnp_SecureHash" &&
                        kv.Key != "vnp_SecureHashType")
                    {
                        vnpData.Add(kv.Key, kv.Value);
                    }
                }

                // Tạo chuỗi hash
                StringBuilder signData = new StringBuilder();
                foreach (var kv in vnpData)
                {
                    signData.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
                }

                // Xóa ký tự & cuối cùng
                if (signData.Length > 0)
                {
                    signData.Remove(signData.Length - 1, 1);
                }

                // Tính chữ ký
                string checkHash = VnPayHelper.HmacSHA512(hashSecret, signData.ToString());

                // Kiểm tra chữ ký
                bool isValidSignature = receivedHash.Equals(checkHash, StringComparison.OrdinalIgnoreCase);

                if (!isValidSignature)
                {
                    _logger.LogWarning("Chữ ký không hợp lệ từ callback VNPay");
                    _logger.LogWarning($"Chữ ký nhận: {receivedHash}");
                    _logger.LogWarning($"Chữ ký tính: {checkHash}");
                    _logger.LogWarning($"Query string: {signData.ToString()}");

                    return Redirect($"{clientUrl}/payment-error.html?error=invalid_signature");
                }

                // Lấy thông tin giao dịch
                string vnpResponseCode = requestParams["vnp_ResponseCode"];
                string orderId = requestParams["vnp_TxnRef"];

                // Kiểm tra mã phản hồi từ VNPay
                bool isSuccess = vnpResponseCode == "00";
                string status = isSuccess ? "Paymented" : "Failed";
                string message = isSuccess ? "Thanh toán thành công" : GetResponseMessage(vnpResponseCode);

                // Cập nhật trạng thái đơn hàng trong database
                try
                {
                    using (var scope = new ServiceCollection()
                        .AddDbContext<ApplicationDbContext>(options =>
                            options.UseSqlServer(_configuration.GetConnectionString("DefaultConnection")))
                        .BuildServiceProvider())
                    {
                        var dbContext = scope.GetRequiredService<ApplicationDbContext>();

                        // Tìm đơn hàng theo ID
                        var order = dbContext.Orders.FirstOrDefault(o => o.Id.ToString() == orderId);

                        if (order != null)
                        {
                            // Cập nhật trạng thái đơn hàng
                            order.Status = status;
                            order.UpdatedAt = DateTime.Now;

                            // Lưu thông tin giao dịch
                            if (isSuccess)
                            {
                                if (requestParams.TryGetValue("vnp_TransactionNo", out string transactionId))
                                {
                                    // Comment vì chưa có TransactionId
                                    // order.TransactionId = transactionId;
                                    // Thêm vào ghi chú
                                    _logger.LogInformation($"Transaction ID: {transactionId}");
                                }

                                if (requestParams.TryGetValue("vnp_PayDate", out string payDateStr))
                                {
                                    if (DateTime.TryParseExact(payDateStr, "yyyyMMddHHmmss", null, System.Globalization.DateTimeStyles.None, out DateTime payDate))
                                    {
                                        // Comment vì chưa có PaymentDate
                                        // order.PaymentDate = payDate;
                                        // Thêm vào ghi chú
                                        _logger.LogInformation($"Payment Date: {payDate.ToString("dd/MM/yyyy HH:mm:ss")}");
                                    }
                                }

                                if (requestParams.TryGetValue("vnp_BankCode", out string bankCode))
                                {
                                    // order.Notes = (string.IsNullOrEmpty(order.Notes) ? "" : order.Notes + "\n") +
                                    //             $"Thanh toán qua ngân hàng: {bankCode}";
                                    _logger.LogInformation($"Thanh toán qua ngân hàng: {bankCode}");
                                }

                                // Comment vì chưa có PaymentStatus
                                // order.PaymentStatus = "Paid";
                            }

                            dbContext.SaveChanges();

                            _logger.LogInformation($"Đã cập nhật trạng thái đơn hàng {orderId} thành {status}");
                        }
                        else
                        {
                            _logger.LogWarning($"Không tìm thấy đơn hàng với ID {orderId}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Lỗi khi cập nhật trạng thái đơn hàng: {ex.Message}");
                }

                // Chuyển hướng về trang xác nhận đơn hàng
                string redirectUrl = $"{clientUrl}/order-confirmation.html?orderId={orderId}&status={status}";

                return Redirect(redirectUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xử lý kết quả thanh toán VNPay: {ex.Message}");

                // Chuyển hướng về trang lỗi
                return Redirect($"{_configuration["ClientUrl"]}/payment-error.html");
            }
        }

        private string GetResponseMessage(string responseCode)
        {
            switch (responseCode)
            {
                case "00": return "Giao dịch thành công";
                case "07": return "Trừ tiền thành công, giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)";
                case "09": return "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng";
                case "10": return "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
                case "11": return "Giao dịch không thành công do: Đã hết hạn chờ thanh toán";
                case "12": return "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa";
                case "13": return "Giao dịch không thành công do: Khách hàng nhập sai mật khẩu xác thực giao dịch (OTP)";
                case "24": return "Giao dịch không thành công do: Khách hàng hủy giao dịch";
                case "51": return "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch";
                case "65": return "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày";
                case "75": return "Ngân hàng thanh toán đang bảo trì";
                case "79": return "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định";
                case "99": return "Các lỗi khác";
                default: return "Giao dịch không thành công";
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
                                OrderId = long.Parse(orderId),
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

        /// <summary>
        /// Xử lý callback từ VNPay sau khi thanh toán
        /// </summary>
        [HttpPost("vnpay/payment-callback")]
        public IActionResult ProcessVnPayCallback([FromBody] VnPayCallbackRequest request)
        {
            try
            {
                _logger.LogInformation($"Nhận callback từ client sau khi thanh toán VNPay: OrderId={request.OrderId}");

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Yêu cầu không hợp lệ: ModelState invalid");
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Thông tin callback không hợp lệ"
                    });
                }

                if (request.ResponseCode != "00")
                {
                    _logger.LogWarning($"Thanh toán không thành công: OrderId={request.OrderId}, ResponseCode={request.ResponseCode}");
                    return Ok(new
                    {
                        Success = false,
                        Message = "Thanh toán không thành công",
                        OrderId = request.OrderId
                    });
                }

                // Cập nhật trạng thái đơn hàng
                // Lấy ID đơn hàng từ mã đơn hàng
                long orderId;
                if (!long.TryParse(request.OrderId, out orderId))
                {
                    _logger.LogError($"Không thể chuyển đổi OrderId: {request.OrderId}");
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Mã đơn hàng không hợp lệ"
                    });
                }

                // TODO: Gọi service cập nhật trạng thái đơn hàng

                return Ok(new
                {
                    Success = true,
                    Message = "Cập nhật trạng thái thanh toán thành công",
                    OrderId = request.OrderId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi xử lý callback VNPay: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi xử lý callback: " + ex.Message
                });
            }
        }
    }
}