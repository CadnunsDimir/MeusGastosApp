using CadnunsDev.MeusGastos.Backend.Domain.Services;
using CadnunsDev.MeusGastos.Backend.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddScoped<NewUserService>();
builder.Services.AddScoped<LoginService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapGet("/ok", () => "OK" );
app.MapPost("/auth/newuser", (NewUserService service, NewUserRequestDTO newUserRequest) => service.Create(newUserRequest) );
app.MapPost("/auth/login", (LoginRequestDTO loginRequest, LoginService service) => service.Login(loginRequest));
app.MapPost("/auth/refresh", (RefreshRequestDTO request, LoginService service) => service.RefreshToken(request));
app.MapPost("/auth/logout", () => "OK" );

app.Run();