namespace CadnunsDev.MeusGastos.Backend.Domain.Entities
{
    public class ShareDashboard
    {
        public Guid ShareId { get; set; } = Guid.NewGuid();
        public required User DashboardOwner { get; set; }
        public required User SharedWithUser { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public required bool CanEdit { get; set; }
    }
}