using CadnunsDev.MeusGastos.Backend.Domain.Services;
using CadnunsDev.MeusGastos.Backend.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddScoped<NewUserService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapGet("/ok", () => "OK" );
app.MapPost("/auth/newuser", (NewUserService service, NewUserRequestDTO newUserRequest) => service.Create(newUserRequest) );
app.MapPost("/auth/login", (LoginRequestDTO loginRequest) => "OK" );
app.MapPost("/auth/refresh", () => "OK" );
app.MapPost("/auth/logout", () => "OK" );

app.Run();
