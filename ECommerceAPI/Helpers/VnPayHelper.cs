using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using ECommerceAPI.Models.Requests;

namespace ECommerceAPI.Helpers
{
    public class VnPayHelper
    {
        private readonly string _vnpayUrl;
        private readonly string _tmnCode;
        private readonly string _hashSecret;
        private readonly string _returnUrl;
        
        public VnPayHelper(string vnpayUrl, string tmnCode, string hashSecret, string returnUrl)
        {
            _vnpayUrl = vnpayUrl;
            _tmnCode = tmnCode;
            _hashSecret = hashSecret;
            _returnUrl = returnUrl;
        }
        
        public string CreatePaymentUrl(VnPayPaymentRequest request, string ipAddress)
        {
            var pay = new VnPayLibrary();
            
            pay.AddRequestData("vnp_Version", "2.1.0");
            pay.AddRequestData("vnp_Command", "pay");
            pay.AddRequestData("vnp_TmnCode", _tmnCode);
            pay.AddRequestData("vnp_Amount", (request.Amount * 100).ToString()); // Nhân 100 vì VNPay yêu cầu số tiền là VND * 100
            pay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
            pay.AddRequestData("vnp_CurrCode", "VND");
            pay.AddRequestData("vnp_IpAddr", ipAddress);
            pay.AddRequestData("vnp_Locale", request.Language);
            pay.AddRequestData("vnp_OrderInfo", request.OrderDesc ?? $"Thanh toán đơn hàng {request.OrderId}");
            pay.AddRequestData("vnp_OrderType", request.OrderType);
            pay.AddRequestData("vnp_ReturnUrl", _returnUrl);
            pay.AddRequestData("vnp_TxnRef", request.OrderId);
            
            // Thêm BankCode nếu có
            if (!string.IsNullOrEmpty(request.BankCode))
            {
                pay.AddRequestData("vnp_BankCode", request.BankCode);
            }
            
            string paymentUrl = pay.CreateRequestUrl(_vnpayUrl, _hashSecret);
            
            return paymentUrl;
        }
        
        public bool ValidateSignature(Dictionary<string, string> vnpayData)
        {
            var inputData = new SortedList<string, string>();
            
            foreach (var kvp in vnpayData.Where(kvp => !string.IsNullOrEmpty(kvp.Value) && kvp.Key.StartsWith("vnp_")))
            {
                if (kvp.Key != "vnp_SecureHash")
                {
                    inputData.Add(kvp.Key, kvp.Value);
                }
            }
            
            StringBuilder signData = new StringBuilder();
            foreach (var kvp in inputData)
            {
                signData.Append(WebUtility.UrlEncode(kvp.Key) + "=" + WebUtility.UrlEncode(kvp.Value) + "&");
            }
            
            string signDataStr = signData.ToString().TrimEnd('&');
            string vnp_SecureHash = vnpayData["vnp_SecureHash"];
            string calculatedHash = HmacSHA512(_hashSecret, signDataStr);
            
            return calculatedHash.Equals(vnp_SecureHash, StringComparison.OrdinalIgnoreCase);
        }
        
        private string HmacSHA512(string key, string inputData)
        {
            var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
            var result = hmac.ComputeHash(Encoding.UTF8.GetBytes(inputData));
            return BitConverter.ToString(result).Replace("-", "").ToLower();
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