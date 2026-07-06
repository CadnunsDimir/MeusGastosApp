using System.Text;
using CadnunsDev.MeusGastos.Backend;
using CadnunsDev.MeusGastos.Backend.Domain.Services;
using CadnunsDev.MeusGastos.Backend.Models;
using CadnunsDev.MeusGastos.Backend.Infrastructure;
using CadnunsDev.MeusGastos.Backend.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddScoped<NewUserService>();
builder.Services.AddScoped<LoginService>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<BankAccountService>();

var tokenSecret = Encoding.ASCII.GetBytes(builder.Configuration[Constants.TokenSecret]?? throw new NullReferenceException(Constants.TokenSecret));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(x =>
            {
                x.RequireHttpsMetadata = false;
                x.SaveToken = true;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(tokenSecret),
                    ValidateIssuer = false,
                    ValidateAudience = false
                };
            });

builder.Services.AddAuthorization();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// Apply EF Core migrations on startup when possible
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    var attempts = 0;
    var maxAttempts = 10;
    var delay = TimeSpan.FromSeconds(5);
    while (true)
    {
        try
        {
            db.Database.Migrate();
            break;
        }
        catch (Exception ex)
        {
            attempts++;
            logger.LogWarning(ex, "Database migration failed on attempt {Attempt}/{MaxAttempts}. Retrying in {Delay}.", attempts, maxAttempts, delay);
            if (attempts >= maxAttempts)
            {
                logger.LogError(ex, "Failed to apply migrations after {MaxAttempts} attempts.", maxAttempts);
                break;
            }
            await Task.Delay(delay);
        }
    }
}

app.MapGet("/ok", () => "OK" );
app.MapPost("/auth/newuser", (NewUserService service, NewUserRequestDTO newUserRequest) => service.Create(newUserRequest) );
app.MapPost("/auth/login", (LoginRequestDTO loginRequest, LoginService service) => service.Login(loginRequest));
app.MapPost("/auth/refresh", (RefreshRequestDTO request, LoginService service) => service.RefreshToken(request));
app.MapPost("/auth/logout", (RefreshRequestDTO request, LoginService service) => service.Logout(request)).RequireAuthorization();
app.MapGet("/profile", () => "Profile" ).RequireAuthorization();

var bankAcountGroup = app.MapGroup("/bank/account");
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