using CadnunsDev.MeusGastos.Backend.Domain.Services;
using CadnunsDev.MeusGastos.Backend.Models;
using CadnunsDev.MeusGastos.Backend.Infrastructure;
using CadnunsDev.MeusGastos.Backend.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.AddJwtAuthentication();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IBankAccountRepository, BankAccountRepository>();

builder.Services.AddScoped<NewUserService>();
builder.Services.AddScoped<LoginService>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<BankAccountService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseJwtAuthentication();
await app.ApplyDBMigrationsAsync();

app.MapGet("/ok", () => "OK" );
app.MapPost("/auth/newuser", (NewUserService service, NewUserRequestDTO newUserRequest) => service.Create(newUserRequest) );
app.MapPost("/auth/login", (LoginRequestDTO loginRequest, LoginService service) => service.Login(loginRequest));
app.MapPost("/auth/refresh", (RefreshRequestDTO request, LoginService service) => service.RefreshToken(request));
app.MapPost("/auth/logout", (RefreshRequestDTO request, LoginService service) => service.Logout(request)).RequireAuthorization();
app.MapGet("/profile", () => "Profile" ).RequireAuthorization();

var bankAcountGroup = app.MapGroup("/bank/account").RequireAuthorization();
bankAcountGroup.MapGet("/", (ClaimsPrincipal user, BankAccountService bankAccountService) =>
    {
        var userName = user.FindFirstValue("UserName") ?? throw new NullReferenceException("UserName não presente no JWT");
        return bankAccountService.ListByUserNameAsync(userName);
    });
bankAcountGroup.MapPost("/", (NewBankAccountDTO newBankAccountDTO, ClaimsPrincipal user, BankAccountService bankAccountService) =>
    {
        var userName = user.FindFirstValue("UserName") ?? throw new NullReferenceException("UserName não presente no JWT");
        return bankAccountService.CreateNewAsync(userName, newBankAccountDTO);
    });

app.Run();