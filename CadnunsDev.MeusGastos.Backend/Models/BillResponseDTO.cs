using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class BillResponseDTO
    {
        public string? BillDescription { get; private set; }
        public decimal Value { get; private set; }
        public int PaymentDay { get; private set; }
        public bool IsPaid { get; private set; }
        public string? Category { get; private set; }
        public Guid BillId { get; private set; }

        public static BillResponseDTO Map(BillToPay bill) => new()
        {
            BillId = bill.BillId,
            BillDescription = bill.BillDescription,
            Value = bill.Value,
            PaymentDay = bill.PaymentDay,
            IsPaid = bill.IsPaid,
            Category = bill.Category.Description,
        };

        public static List<BillResponseDTO> MapList(List<BillToPay> biils) =>
            biils.Select(Map).ToList();
    }
}