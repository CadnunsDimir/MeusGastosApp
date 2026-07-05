using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CadnunsDev.MeusGastos.Backend.Domain.Entities
{
    public class BillToPay
    {
        public Guid BillId { get; set; }
        public int PaymentDay { get; set; }
        public required string BillDescription { get; set; }
        public required BillCategory Category { get; set; }
        public required decimal Value { get; set; }
        public bool IsPaid { get; set; }
        public bool RepeatValueNextMoth { get; set; }
    }
}