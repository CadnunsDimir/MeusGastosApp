using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class RefreshRequestDTO
    {
        public required string RefreshToken { get; set; }
    }
}