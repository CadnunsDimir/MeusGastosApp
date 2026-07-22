namespace CadnunsDev.MeusGastos.Backend.Domain.Entities;

public class User
{
    public Guid UserId { get; set; }
    public required string UserName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string[] Roles { get; set; } = Array.Empty<string>();
    public string? Email { get; set; }
    public required string PasswordHash { get; set; }
}