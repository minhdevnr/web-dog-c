public class VnPayPaymentRequest
{
    public string OrderId { get; set; }
    public decimal Amount { get; set; }
    public string OrderDesc { get; set; }
    public string BankCode { get; set; }
    public string OrderType { get; set; }
    public string Language { get; set; }
}
