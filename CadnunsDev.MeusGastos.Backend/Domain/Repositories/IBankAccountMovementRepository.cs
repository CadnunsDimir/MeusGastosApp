using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using CadnunsDev.MeusGastos.Backend.Domain.Enums;

namespace CadnunsDev.MeusGastos.Backend.Domain.Repositories
{
    public interface IBankAccountMovementRepository
    {
        Task CreateAsync(BankAccountMovement movement);
        Task DeleteAsync(Guid userId, Guid movementId);
        Task<BankAccountMovement?> FindByIdAndUserId(Guid userId, Guid movementId);
        Task<List<BankAccountMovement>> ListAsync(Guid userId, int year, int month);
         Task<List<BankAccountMovement>> ListByType(Guid userId, int year, int month, MovementType expense);
    }
}
