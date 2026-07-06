using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class NewBankAccountDTO
    {
        public required string AccountName { get; set; }
        public decimal InitialBalance { get; set; }
    }
}