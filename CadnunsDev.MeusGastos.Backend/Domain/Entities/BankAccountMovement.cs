using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CadnunsDev.MeusGastos.Backend.Domain.Enums;

namespace CadnunsDev.MeusGastos.Backend.Domain.Entities
{
    public class BankAccountMovement
    {
        public Guid MovementId { get; set; } = Guid.NewGuid();
        public Guid AccountId { get; set; }
        public required string Description { get; set; }
        public decimal Value { get; set; }
        public DateOnly Date { get; set; }
        public Guid? BillId { get; set; }
        public MovementType Type { get; set; }
        public Guid? RelatedMovementId { get; set; }
    }
}