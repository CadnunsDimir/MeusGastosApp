namespace CadnunsDev.MeusGastos.Backend.Domain.Entities
{
    public class BillToPay
    {
        public Guid BillId { get; set; }
        public int PaymentDay { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public required string BillDescription { get; set; }
        public required BillCategory Category { get; set; }
        public required decimal Value { get; set; }
        public bool IsPaid { get; set; }
        public bool RepeatValueNextMonth { get; set; }
    }
}