using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Domain.Repositories
{
    public interface IBillCategoryRepository : ICreateRepository<BillCategory>
    {
        Task<BillCategory?> FindByUserIdAndDescription(Guid userId, string categoryDescription);
    }
}