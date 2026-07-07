using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class NewAccountMovementDTO
    {
        public Guid AccountId { get; set; }
        public required string Description { get; set; }
        public decimal Value { get; set; }
        public DateOnly Date { get; set; }
    }
}