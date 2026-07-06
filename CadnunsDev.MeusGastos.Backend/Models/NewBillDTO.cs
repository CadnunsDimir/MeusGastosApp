using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class NewBillDTO
    {
        public required string Description { get; init; }
        public required string Category { get; init; }
        public int PaymentDay { get; init; }
        public bool RepeatValueNextMonth { get; init; }
        public decimal Value { get; init; }
    }
}