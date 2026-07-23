using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using CadnunsDev.MeusGastos.Backend.Domain.Services;
using CadnunsDev.MeusGastos.Backend.Infrastructure;
using CadnunsDev.MeusGastos.Backend.Infrastructure.Repositories;

public static class DiExtensions
{
    public static IServiceCollection AddServices(this IServiceCollection services)
    {
        services.AddScoped<NewUserService>();
        services.AddScoped<LoginService>();
        services.AddScoped<TokenService>();
        services.AddScoped<BankAccountService>();
        services.AddScoped<BillToPayService>();
        services.AddScoped<BankAccountMovementService>();
        services.AddScoped<DashboardService>();
        services.AddScoped<UserProfileService>();
        services.AddScoped<ShareDashboardService>();
        services.AddScoped<MyDashboardsService>();
        
        return services;
    }

    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork, EfUnitOfWork>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IBankAccountRepository, BankAccountRepository>();
        services.AddScoped<IBillCategoryRepository, BillCategoryRepository>();
        services.AddScoped<IBillToPayRepository, BillToPayRepository>();
        services.AddScoped<IBankAccountMovementRepository, BankAccountMovementRepository>();
        services.AddScoped<IShareDashboardRepository, ShareDashboardRepository>();

        return services;
    }
}