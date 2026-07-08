using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CadnunsDev.MeusGastos.Backend.Domain.Exceptions
{
    public class AccountNotBelongThisUserException: Exception
    {
        public AccountNotBelongThisUserException(): base("A conta bancária usada não pertence a esse usuário")
        {
            
        }
    }
}