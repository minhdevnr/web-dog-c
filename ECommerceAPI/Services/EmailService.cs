using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Net.Mail;
using System.Net;
using ECommerceAPI.Models;

namespace ECommerceAPI.Services
{
    public interface IEmailService
    {
        Task SendVerificationEmailAsync(string email, string token);
        Task SendPasswordResetEmailAsync(string email, string token);
        Task SendTwoFactorCodeAsync(string email, string code);
        Task SendOrderConfirmationEmailAsync(string email, string orderId, string status, decimal totalAmount);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly string _smtpHost;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly string _frontendBaseUrl;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
            _smtpHost = configuration["Email:SmtpHost"];
            _smtpPort = int.Parse(configuration["Email:SmtpPort"]);
            _smtpUsername = configuration["Email:Username"];
            _smtpPassword = configuration["Email:Password"];
            _fromEmail = configuration["Email:FromEmail"];
            _fromName = configuration["Email:FromName"] ?? "LH Coffee";
            _frontendBaseUrl = configuration["FrontendBaseUrl"];
        }

        public async Task SendVerificationEmailAsync(string email, string token)
        {
            var verificationLink = $"{_frontendBaseUrl}/verify-email?token={token}";
            var subject = "Xác nhận email của bạn";
            var body = $@"
                <h2>Xác nhận email của bạn</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng click vào link bên dưới để xác nhận email:</p>
                <p><a href='{verificationLink}'>Xác nhận email</a></p>
                <p>Link này sẽ hết hạn sau 24 giờ.</p>
                <p>Nếu bạn không yêu cầu xác nhận email này, vui lòng bỏ qua email này.</p>";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendPasswordResetEmailAsync(string email, string token)
        {
            var resetLink = $"{_frontendBaseUrl}/reset-password?token={token}";
            var subject = "Đặt lại mật khẩu";
            var body = $@"
                <h2>Đặt lại mật khẩu</h2>
                <p>Bạn đã yêu cầu đặt lại mật khẩu. Click vào link bên dưới để đặt lại mật khẩu:</p>
                <p><a href='{resetLink}'>Đặt lại mật khẩu</a></p>
                <p>Link này sẽ hết hạn sau 1 giờ.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendTwoFactorCodeAsync(string email, string code)
        {
            var subject = "Mã xác thực hai yếu tố";
            var body = $@"
                <h2>Mã xác thực của bạn</h2>
                <p>Mã xác thực của bạn là: <strong>{code}</strong></p>
                <p>Mã này sẽ hết hạn sau 5 phút.</p>
                <p>Nếu bạn không yêu cầu mã này, vui lòng kiểm tra lại tài khoản của bạn.</p>";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendOrderConfirmationEmailAsync(string email, string orderId, string status, decimal totalAmount)
        {
            var orderLink = $"{_frontendBaseUrl}/order-confirmation.html?orderId={orderId}";
            var subject = $"Xác nhận đơn hàng #{orderId} - LH Coffee";
            
            var statusText = status == "Paymented" ? "Thanh toán thành công" : status;
            var formattedAmount = string.Format("{0:N0} VNĐ", totalAmount);
            
            var body = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;'>
                    <div style='text-align: center; padding: 10px; background-color: #4CAF50; color: white; border-radius: 5px 5px 0 0;'>
                        <h1>Xác nhận đơn hàng</h1>
                    </div>
                    
                    <div style='padding: 20px;'>
                        <p>Kính gửi Quý khách,</p>
                        <p>Cảm ơn bạn đã đặt hàng tại LH Coffee. Đơn hàng của bạn đã được xác nhận.</p>
                        
                        <div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                            <p><strong>Mã đơn hàng:</strong> #{orderId}</p>
                            <p><strong>Trạng thái:</strong> {statusText}</p>
                            <p><strong>Tổng tiền:</strong> {formattedAmount}</p>
                        </div>
                        
                        <p>Bạn có thể xem chi tiết đơn hàng tại <a href='{orderLink}'>đây</a>.</p>
                        
                        <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
                        
                        <p>Trân trọng,<br/>LH Coffee</p>
                    </div>
                    
                    <div style='text-align: center; padding: 10px; background-color: #f1f1f1; border-radius: 0 0 5px 5px;'>
                        <p style='margin: 0; color: #777;'>© 2023 LH Coffee. Tất cả các quyền được bảo lưu.</p>
                    </div>
                </div>
            ";

            await SendEmailAsync(email, subject, body);
        }

        private async Task SendEmailAsync(string to, string subject, string body)
        {
            using (var client = new SmtpClient(_smtpHost, _smtpPort))
            {
                client.UseDefaultCredentials = false;
                client.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);
                client.EnableSsl = true;

                using (var message = new MailMessage())
                {
                    message.From = new MailAddress(_fromEmail, _fromName);
                    message.Subject = subject;
                    message.Body = body;
                    message.IsBodyHtml = true;
                    message.To.Add(to);

                    await client.SendMailAsync(message);
                }
            }
        }
    }
} 