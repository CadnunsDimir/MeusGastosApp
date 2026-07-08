using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CadnunsDev.MeusGastos.Backend.Domain.Exceptions
{
    public class BillNotFoundException: Exception
    {
        public BillNotFoundException(): base("Conta não foi encontrada")
        {
            
        }
    }
}