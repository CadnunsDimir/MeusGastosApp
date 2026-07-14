using CadnunsDev.MeusGastos.Backend.Domain.Enums;

namespace CadnunsDev.MeusGastos.Backend.Domain.Entities
{
    public class BankAccountMovement
    {
        public Guid MovementId { get; set; } = Guid.NewGuid();
        public Guid AccountId { get; set; }
        public required string Description { get; set; }
        public required decimal Value { get; set; }
        public required DateOnly Date { get; set; }
        public Guid? BillId { get; set; }
        public required MovementType Type { get; set; }
        public Guid? RelatedMovementId { get; set; }
    }
}