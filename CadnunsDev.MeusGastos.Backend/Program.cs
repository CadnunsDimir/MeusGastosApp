using CadnunsDev.MeusGastos.Backend.Domain.Services;
using CadnunsDev.MeusGastos.Backend.Models;
using CadnunsDev.MeusGastos.Backend.Infrastructure;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "Meus Gastos API",
        Version = "v1",
        Description = "API do sistema Meus Gastos",
        Contact = new()
        {
            Name = "Seu Nome",
            Email = "seuemail@exemplo.com"
        }
    });
});

builder.AddJwtAuthentication();
builder.Services.AddGlobalErrorHandling();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUnitOfWork, EfUnitOfWork>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IBankAccountRepository, BankAccountRepository>();
builder.Services.AddScoped<IBillCategoryRepository, BillCategoryRepository>();
builder.Services.AddScoped<IBillToPayRepository, BillToPayRepository>();
builder.Services.AddScoped<IBankAccountMovementRepository, BankAccountMovementRepository>();

builder.Services.AddScoped<NewUserService>();
builder.Services.AddScoped<LoginService>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<BankAccountService>();
builder.Services.AddScoped<BillToPayService>();
builder.Services.AddScoped<BankAccountMovementService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Meus Gastos API v1");
        c.RoutePrefix = "swagger";           // acessa em /swagger
        c.DocumentTitle = "Meus Gastos - Swagger";
    });

    app.MapOpenApi();
}

app.UseExceptionHandler();
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
    bankAccountService.ListByUserNameAsync(user.GetUserName()));
bankAcountGroup.MapPost("/", (NewBankAccountDTO newBankAccountDTO, ClaimsPrincipal user, BankAccountService bankAccountService) =>
    bankAccountService.CreateNewAsync(user.GetUserName(), newBankAccountDTO));
bankAcountGroup.MapDelete("/{accountId}", (Guid accountId, ClaimsPrincipal user, BankAccountService bankAccountService) =>
    bankAccountService.DeleteAsync(user.GetUserName(), accountId));

var billsGroup = app.MapGroup("/bank/bills/{year}/{month}").RequireAuthorization();
billsGroup.MapGet("/", (int year, int month, ClaimsPrincipal user, BillToPayService service) =>
    service.ListAsync(user.GetUserName(), year, month));
billsGroup.MapPost("/", (int year, int month, NewBillDTO newBill, ClaimsPrincipal user, BillToPayService service) =>
    service.CreateNewAsync(user.GetUserName(), year, month, newBill));
billsGroup.MapPost("/pay", (int year, int month, PayingBillDTO data, ClaimsPrincipal user, BillToPayService service) =>
    service.PayBill(user.GetUserName(), data));
billsGroup.MapDelete("/{billId}", (Guid billId, ClaimsPrincipal user, BillToPayService service) =>
    service.DeleteBillAsync(user.GetUserName(), billId));

var movementsGroup = app.MapGroup("/bank/movements/{year}/{month}").RequireAuthorization();
movementsGroup.MapGet("/", (int year, int month, ClaimsPrincipal user, BankAccountMovementService service) =>
    service.ListAsync(user.GetUserName(), year, month));
movementsGroup.MapPost("/", (int year, int month, NewAccountMovementDTO movement, ClaimsPrincipal user, BankAccountMovementService service) =>
    service.CreateNewAsync(user.GetUserName(), year, month, movement));
movementsGroup.MapDelete("/{movementId}", (Guid movementId, ClaimsPrincipal user, BankAccountMovementService service) =>
    service.DeleteAsync(user.GetUserName(), movementId));

app.Run();