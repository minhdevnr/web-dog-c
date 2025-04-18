namespace ECommerceAPI.Models.Enums
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