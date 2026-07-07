using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CadnunsDev.MeusGastos.Backend.Models.Exceptions
{
    public class DbNotFoundException : Exception
    {
        public DbNotFoundException(string? message) : base(message)
        {
        }
    }
}