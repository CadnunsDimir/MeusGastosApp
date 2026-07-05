using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CadnunsDev.MeusGastos.Backend.Domain.Exceptions
{
    [Serializable]
    internal class UserNameAlreadyExistsException : Exception
    {
        public UserNameAlreadyExistsException(): base("Usuário já existe")
        {
        }
    }
}