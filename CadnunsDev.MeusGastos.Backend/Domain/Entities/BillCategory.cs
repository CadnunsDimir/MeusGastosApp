namespace CadnunsDev.MeusGastos.Backend.Domain.Entities
{
    public class BillCategory
    {
        public Guid CategoryId { get; set; }
        public required string Description { get; set; }
    }
}