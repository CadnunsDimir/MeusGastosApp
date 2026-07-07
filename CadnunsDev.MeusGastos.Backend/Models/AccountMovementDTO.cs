using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class AccountMovementDTO
    {
        public Guid MovementId { get; set; }
        public Guid AccountId { get; set; }
        public required string Description { get; set; }
        public decimal Value { get; set; }
        public DateOnly Date { get; set; }

        public static AccountMovementDTO Map(BankAccountMovement m)=> new()
        {
            MovementId = m.MovementId,
            AccountId = m.AccountId,
            Description = m.Description,
            Value = m.Value,
            Date = m.Date
        };
    }
}