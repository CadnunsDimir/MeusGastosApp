namespace CadnunsDev.MeusGastos.Backend.Domain.Entities
{
    public class RefreshToken
    {
        public bool Revoked { get; set; }
        public DateTime Expires { get; set; }
        public Guid UserId { get; set; }
        public Guid TokenId { get; set; }
        public required string TokenHash { get; set; }
        public DateTime Created { get; set; }
    }
}