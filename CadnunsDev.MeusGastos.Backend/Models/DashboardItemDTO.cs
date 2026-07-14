namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class DashboardItemDTO
    {
        public required string Category { get; set; }
        public decimal TotalSum { get; set; }
    }
}