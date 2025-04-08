namespace ECommerceAPI.Models
{
    public enum ActivityType
    {
        Login,
        FailedLogin,
        AccountCreated,
        PasswordChange,
        ProfileUpdate,
        TwoFactorEnabled,
        TwoFactorDisabled,
        AccountDeactivated
    }
} 