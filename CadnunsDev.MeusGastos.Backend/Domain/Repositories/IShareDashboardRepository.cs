using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Domain.Repositories
{
    public interface IShareDashboardRepository
    {
        Task CreateAsync(ShareDashboard shareDashboard);
        Task<bool> ExistsShareWithThisOwnerAndUserAsync(Guid ownerUserId, Guid sharedWithUserId);
        Task<ShareDashboard?> GetByIdAsync(Guid ShareId);
        Task<List<ShareDashboard>> ListAsync(Guid ownserUserId);
        Task<List<ShareDashboard>> ListSharedWithAsync(Guid userId);
        Task RemoveAsync(object sharing);
        Task UpdateAsync(ShareDashboard sharing);
    }
}