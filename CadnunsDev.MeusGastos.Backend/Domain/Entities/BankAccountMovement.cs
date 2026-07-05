using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CadnunsDev.MeusGastos.Backend.Domain.Entities
{
    public class BankAccountMovement
    {
        public Guid MovementId { get; set; }
        public Guid AccountId { get; set; }
        public required string Description { get; set; }
        public decimal Value { get; set; }
        
    }
}