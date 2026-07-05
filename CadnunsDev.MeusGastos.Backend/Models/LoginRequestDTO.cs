namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class LoginRequestDTO
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}