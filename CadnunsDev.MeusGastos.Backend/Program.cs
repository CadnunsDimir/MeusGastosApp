using System.Text;
using CadnunsDev.MeusGastos.Backend;
using CadnunsDev.MeusGastos.Backend.Domain.Services;
using CadnunsDev.MeusGastos.Backend.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddScoped<NewUserService>();
builder.Services.AddScoped<LoginService>();
builder.Services.AddScoped<TokenService>();

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

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/ok", () => "OK" );
app.MapPost("/auth/newuser", (NewUserService service, NewUserRequestDTO newUserRequest) => service.Create(newUserRequest) );
app.MapPost("/auth/login", (LoginRequestDTO loginRequest, LoginService service) => service.Login(loginRequest));
app.MapPost("/auth/refresh", (RefreshRequestDTO request, LoginService service) => service.RefreshToken(request));
app.MapPost("/auth/logout", (RefreshRequestDTO request, LoginService service) => service.Logout(request)).RequireAuthorization();
app.MapGet("/profile", () => "Profile" ).RequireAuthorization();

app.Run();