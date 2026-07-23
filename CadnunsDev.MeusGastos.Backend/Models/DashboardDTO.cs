using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class DashboardDTO
    {
        public required string OwnerName { get; set; }
        public bool IsMine { get; set; }
        public Guid? ShareDashboardId { get; set; }
    }
}