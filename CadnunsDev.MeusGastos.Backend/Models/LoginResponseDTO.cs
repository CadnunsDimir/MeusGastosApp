namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class LoginResponseDTO
    {
        public required string AccessToken { get; set; }
        public string RefreshToken { get; internal set; }
    }
}