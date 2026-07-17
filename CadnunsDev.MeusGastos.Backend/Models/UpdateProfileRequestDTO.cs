namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class UpdateProfileRequestDTO
    {
        public required string Email { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
    }
}
