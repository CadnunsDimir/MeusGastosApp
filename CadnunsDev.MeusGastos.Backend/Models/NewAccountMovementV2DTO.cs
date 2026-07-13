using System;
using CadnunsDev.MeusGastos.Backend.Domain.Enums;

namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class NewAccountMovementV2DTO
    {
        public MovementType Type { get; set; }
        public Guid AccountId { get; set; }
        public Guid? DestinationAccountId { get; set; }
        public decimal Value { get; set; }
        public required string Description { get; set; }
        public int Day { get; set; }
    }
}
