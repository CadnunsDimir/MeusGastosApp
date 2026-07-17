namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class LoginResponseDTO
    {
        public required string AccessToken { get; set; }
        public required string RefreshToken { get; set; }
        public required string FirstName { get; set; }
    }
}