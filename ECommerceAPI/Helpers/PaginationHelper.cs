using ECommerceAPI.Models.Responses;
using Microsoft.AspNetCore.WebUtilities;

namespace ECommerceAPI.Helpers
{
    /// <summary>
    /// Lớp hỗ trợ tạo phân trang cho API response
    /// </summary>
    public static class PaginationHelper
    {
        /// <summary>
        /// Tạo phản hồi phân trang từ dữ liệu và thông tin request
        /// </summary>
        public static PagedResponse<T> CreatePagedResponse<T>(
            IEnumerable<T> data,
            int pageNumber,
            int pageSize,
            int totalRecords,
            HttpRequest request,
            string routeName)
        {
            var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);
            var response = new PagedResponse<T>
            {
                Items = data,
                CurrentPage = pageNumber,
                PageSize = pageSize,
                TotalItems = totalRecords,
                TotalPages = totalPages,
                Success = true,
                Message = "Lấy dữ liệu thành công"
            };

            // Tạo URLs cho trang trước và trang tiếp theo
            if (pageNumber > 1)
            {
                response.PreviousPage = CreatePaginationUrl(request, routeName, pageNumber - 1, pageSize);
            }

            if (pageNumber < totalPages)
            {
                response.NextPage = CreatePaginationUrl(request, routeName, pageNumber + 1, pageSize);
            }

            return response;
        }

        /// <summary>
        /// Tạo URL phân trang
        /// </summary>
        private static string CreatePaginationUrl(HttpRequest request, string routeName, int pageNumber, int pageSize)
        {
            var host = request.Scheme + "://" + request.Host;
            var path = request.Path.Value;

            // Tạo query parameters với pageNumber và pageSize
            var queryParams = new Dictionary<string, string>
            {
                { "pageNumber", pageNumber.ToString() },
                { "pageSize", pageSize.ToString() }
            };

            // Thêm các query params khác từ request (ngoại trừ pageNumber và pageSize)
            foreach (var param in request.Query)
            {
                if (param.Key != "pageNumber" && param.Key != "pageSize")
                {
                    queryParams[param.Key] = param.Value;
                }
            }

            // Tạo URL đầy đủ
            var url = host + path;
            return QueryHelpers.AddQueryString(url, queryParams);
        }
    }
}