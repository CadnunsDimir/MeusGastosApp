using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CadnunsDev.MeusGastos.Backend.Domain.Entities
{
    public class BankAccount
    {
        public Guid AccountId { get; set; }
        public Guid UserId { get; set; }
        public required string Name { get; set; }
        public decimal InitialBalance { get; set; }
        public int InitialMonth { get; set; }
        public int InitialYear { get; set; }
        public decimal Balance { get; set; }
    }
}