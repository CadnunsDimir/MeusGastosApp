using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CadnunsDev.MeusGastos.Backend.Domain.Entities
{
    public class RefreshToken
    {
        public bool Revoked { get; internal set; }
        public DateTime Expires { get; internal set; }
        public Guid UserId { get; internal set; }
        public Guid TokenId { get; internal set; }
        public required string TokenHash { get; set; }
        public DateTime Created { get; internal set; }
    }
}