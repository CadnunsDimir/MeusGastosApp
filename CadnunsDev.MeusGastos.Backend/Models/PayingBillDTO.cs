using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class PayingBillDTO
    {
        public Guid BIllId { get; set; }
        public DateOnly Date { get; internal set; }
        public Guid AccountId { get; internal set; }
    }
}