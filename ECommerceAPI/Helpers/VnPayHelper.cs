using ECommerceAPI.Models.Requests;
using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace ECommerceAPI.Helpers
{
    public class VnPayHelper
    {
        private string _vnpayUrl;
        private string _tmnCode;
        private string _hashSecret;
        private string _returnUrl;

        public VnPayHelper(string vnpayUrl, string tmnCode, string hashSecret, string returnUrl)
        {
            _vnpayUrl = vnpayUrl;
            _tmnCode = tmnCode;
            _hashSecret = hashSecret;
            _returnUrl = returnUrl;
        }

        public string CreatePaymentUrl(VnPayPaymentRequest request, string ipAddress)
        {
            var vnpayData = new Dictionary<string, string>();
            vnpayData.Add("vnp_Version", "2.1.0");
            vnpayData.Add("vnp_Command", "pay");
            vnpayData.Add("vnp_TmnCode", _tmnCode);

            // Chuyển số tiền sang đúng định dạng VNPay (nhân 100)
            vnpayData.Add("vnp_Amount", Convert.ToInt64(request.Amount * 100).ToString());

            if (!string.IsNullOrEmpty(request.BankCode))
            {
                vnpayData.Add("vnp_BankCode", request.BankCode);
            }

            // Thời gian tạo đơn hàng
            string createDate = DateTime.Now.ToString("yyyyMMddHHmmss");
            vnpayData.Add("vnp_CreateDate", createDate);
            vnpayData.Add("vnp_CurrCode", "VND");
            vnpayData.Add("vnp_IpAddr", ipAddress);
            vnpayData.Add("vnp_Locale", request.Language ?? "vn");

            string orderInfo = !string.IsNullOrEmpty(request.OrderInfo)
                ? request.OrderInfo
                : $"Thanh toán đơn hàng {request.OrderId}";

            vnpayData.Add("vnp_OrderInfo", orderInfo);
            vnpayData.Add("vnp_OrderType", request.OrderType ?? "billpayment");
            vnpayData.Add("vnp_ReturnUrl", _returnUrl);
            vnpayData.Add("vnp_TxnRef", request.OrderId.ToString());

            // Thêm thời gian hết hạn thanh toán (15 phút)
            DateTime expireDate = DateTime.Now.AddMinutes(15);
            string expire = expireDate.ToString("yyyyMMddHHmmss");
            vnpayData.Add("vnp_ExpireDate", expire);

            // Sắp xếp dữ liệu theo thứ tự key để tạo chuỗi hash
            var sortedData = vnpayData.OrderBy(kv => kv.Key).ToDictionary(kv => kv.Key, kv => kv.Value);

            // Tạo chuỗi hash để tạo chữ ký
            StringBuilder queryBuilder = new StringBuilder();
            foreach (var kv in sortedData)
            {
                if (queryBuilder.Length > 0)
                {
                    queryBuilder.Append('&');
                }
                queryBuilder.Append($"{kv.Key}={WebUtility.UrlEncode(kv.Value)}");
            }
            string queryString = queryBuilder.ToString();

            // Tạo chữ ký bằng HMACSHA512
            string secureHash = HmacSHA512(_hashSecret, queryString);

            // Thêm chữ ký vào URL
            return $"{_vnpayUrl}?{queryString}&vnp_SecureHash={secureHash}";
        }

        public bool ValidateSignature(Dictionary<string, string> vnpayData)
        {
            // Lấy chữ ký từ VNPay
            string vnpSecureHash = vnpayData["vnp_SecureHash"];

            // Tạo bản sao dữ liệu không bao gồm chữ ký để tính toán lại
            var dataWithoutHash = new Dictionary<string, string>(vnpayData);
            if (dataWithoutHash.ContainsKey("vnp_SecureHash"))
            {
                dataWithoutHash.Remove("vnp_SecureHash");
            }

            if (dataWithoutHash.ContainsKey("vnp_SecureHashType"))
            {
                dataWithoutHash.Remove("vnp_SecureHashType");
            }

            // Sắp xếp theo key
            var sortedData = new SortedDictionary<string, string>(dataWithoutHash);

            // Tạo chuỗi hash
            StringBuilder queryBuilder = new StringBuilder();
            foreach (var kv in sortedData)
            {
                if (queryBuilder.Length > 0)
                {
                    queryBuilder.Append('&');
                }
                queryBuilder.Append($"{kv.Key}={WebUtility.UrlEncode(kv.Value)}");
            }
            string queryString = queryBuilder.ToString();

            // Tính chữ ký
            string checkSum = HmacSHA512(_hashSecret, queryString);

            // So sánh chữ ký
            return vnpSecureHash.Equals(checkSum, StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Tạo chữ ký HMAC-SHA512 cho dữ liệu
        /// </summary>
        public static string HmacSHA512(string key, string data)
        {
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var dataBytes = Encoding.UTF8.GetBytes(data);

            using (var hmac = new HMACSHA512(keyBytes))
            {
                var hashBytes = hmac.ComputeHash(dataBytes);
                var hash = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
                return hash;
            }
        }
    }

    public class VnPayLibrary
    {
        private SortedList<string, string> _requestData = new SortedList<string, string>(new VnPayComparer());

        public void AddRequestData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                _requestData.Add(key, value);
            }
        }

        public string CreateRequestUrl(string baseUrl, string vnp_HashSecret)
        {
            StringBuilder data = new StringBuilder();

            foreach (KeyValuePair<string, string> kvp in _requestData)
            {
                if (!string.IsNullOrEmpty(kvp.Value))
                {
                    data.Append(WebUtility.UrlEncode(kvp.Key) + "=" + WebUtility.UrlEncode(kvp.Value) + "&");
                }
            }

            string queryString = data.ToString().TrimEnd('&');
            string rawData = queryString;
            string vnp_SecureHash = HmacSHA512(vnp_HashSecret, rawData);

            queryString += "&vnp_SecureHash=" + vnp_SecureHash;

            return baseUrl + "?" + queryString;
        }

        private string HmacSHA512(string key, string inputData)
        {
            var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
            var result = hmac.ComputeHash(Encoding.UTF8.GetBytes(inputData));
            return BitConverter.ToString(result).Replace("-", "").ToLower();
        }
    }

    public class VnPayComparer : IComparer<string>
    {
        public int Compare(string x, string y)
        {
            if (x == y) return 0;
            if (x == null) return -1;
            if (y == null) return 1;

            var vnpCompare = CompareInfo.GetCompareInfo("en-US");
            return vnpCompare.Compare(x, y, CompareOptions.Ordinal);
        }
    }
}