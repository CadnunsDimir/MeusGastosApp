using CadnunsDev.MeusGastos.Backend.Domain.Services;
using CadnunsDev.MeusGastos.Backend.Models;
using CadnunsDev.MeusGastos.Backend.Infrastructure;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Serilog;
using CadnunsDev.MeusGastos.Backend;

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

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("api", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
});

if (builder.Environment.IsProduction())
{
    Console.WriteLine("Setting SeqServer On Production");

    var seqServer = builder.Configuration[Constants.SeqServer];

    if (!string.IsNullOrWhiteSpace(seqServer))
    {
        Log.Logger = new LoggerConfiguration()
            .WriteTo.Console()
            .WriteTo.Seq(seqServer)
            .CreateLogger();

        builder.Host.UseSerilog();
    }
}

var app = builder.Build();

app.UseRateLimiter();

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

// if (app.Environment.IsProduction())
// {
//     Console.WriteLine("Setting SeqServer On Production");
//     var seqServer = builder.Configuration[Constants.SeqServer];
//     if(seqServer is not null)
//     {
//         Log.Logger = new LoggerConfiguration()
//             .WriteTo.Console()
//             .WriteTo.Seq(seqServer)
//             .CreateLogger();

//         builder.Host.UseSerilog();
//     }else
//     {
//         Console.ForegroundColor = ConsoleColor.Yellow;
//         Console.WriteLine("SeqServer não foi configurado!");
//         Console.ResetColor();
//     }    
// }

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseJwtAuthentication();
await app.ApplyDBMigrationsAsync();

//Testes de health e login
app.MapGet("/ok", () => "OK" );
app.MapGet("/profile", () => "Profile" ).RequireAuthorization();

var auth = app.MapGroup("/auth");
auth.MapPost("/newuser", (NewUserService service, NewUserRequestDTO newUserRequest) => service.Create(newUserRequest));
auth.MapPost("/login", (LoginRequestDTO loginRequest, LoginService service) => service.Login(loginRequest)).RequireRateLimiting("api");
auth.MapPost("/refresh", (RefreshRequestDTO request, LoginService service) => service.RefreshToken(request));
auth.MapPost("/logout", (RefreshRequestDTO request, LoginService service) => service.Logout(request)).RequireAuthorization();

var bankAcountGroup = app.MapGroup("/bank/account")
    .RequireAuthorization();
bankAcountGroup.MapGet("/", (ClaimsPrincipal user, BankAccountService bankAccountService) =>
    bankAccountService.ListByUserNameAsync(user.GetUserName()));
bankAcountGroup.MapPost("/", (NewBankAccountDTO newBankAccountDTO, ClaimsPrincipal user, BankAccountService bankAccountService) =>
    bankAccountService.CreateNewAsync(user.GetUserName(), newBankAccountDTO));
bankAcountGroup.MapDelete("/{accountId}", (Guid accountId, ClaimsPrincipal user, BankAccountService bankAccountService) =>
    bankAccountService.DeleteAsync(user.GetUserName(), accountId));

var billsGroup = app.MapGroup("/bank/bills/{year}/{month}")
    .RequireAuthorization();
billsGroup.MapGet("/", (int year, int month, ClaimsPrincipal user, BillToPayService service) =>
    service.ListAsync(user.GetUserName(), year, month));
billsGroup.MapPost("/", (int year, int month, NewBillDTO newBill, ClaimsPrincipal user, BillToPayService service) =>
    service.CreateNewAsync(user.GetUserName(), year, month, newBill));
billsGroup.MapPost("/pay", (int year, int month, PayingBillDTO data, ClaimsPrincipal user, BillToPayService service) =>
    service.PayBill(user.GetUserName(), data));
billsGroup.MapDelete("/{billId}", (Guid billId, ClaimsPrincipal user, BillToPayService service) =>
    service.DeleteBillAsync(user.GetUserName(), billId));

app.MapGet("/bank/bills/categories", ([FromQuery(Name = "q")] string query, ClaimsPrincipal user, BillToPayService billToPayService) =>
    billToPayService.QueryCategories(user.GetUserName(), query));

var movementsGroup = app.MapGroup("/bank/movements/{year}/{month}")
    .RequireAuthorization();
movementsGroup.MapGet("/", (int year, int month, ClaimsPrincipal user, BankAccountMovementService service) =>
    service.ListAsync(user.GetUserName(), year, month));
movementsGroup.MapPost("/", (int year, int month, NewAccountMovementDTO movement, ClaimsPrincipal user, BankAccountMovementService service) =>
    service.CreateNewAsync(user.GetUserName(), year, month, movement));
movementsGroup.MapDelete("/{movementId}", (Guid movementId, ClaimsPrincipal user, BankAccountMovementService service) =>
    service.DeleteAsync(user.GetUserName(), movementId));

app.Run();