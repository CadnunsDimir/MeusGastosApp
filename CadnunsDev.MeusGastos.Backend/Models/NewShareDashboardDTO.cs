namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class NewShareDashboardDTO
    {
        public required string SharedWithUserNameOrEmail { get; set; }
        public bool CanEdit { get; set; }
    }
}