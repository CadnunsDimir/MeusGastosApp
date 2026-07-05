
using System.Security.Claims;

namespace CadnunsDev.MeusGastos.Backend.Domain.Entities;

public class User
{
    public Guid UserId { get; set; }
    public required string UserName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string[] Roles { get; internal set; } = Array.Empty<string>();
    public string? Email { get; internal set; }
    public required string PasswordHash { get; set; }
}