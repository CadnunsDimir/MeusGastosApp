using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Domain.Repositories
{
    public interface IBankAccountMovementRepository
    {
        Task CreateAsync(BankAccountMovement movement);
        Task DeleteAsync(Guid userId, Guid movementId);
        Task<BankAccountMovement?> FindByIdAndUserId(Guid userId, Guid movementId);
        Task<List<BankAccountMovement>> ListAsync(Guid userId, int year, int month);
    }
}
