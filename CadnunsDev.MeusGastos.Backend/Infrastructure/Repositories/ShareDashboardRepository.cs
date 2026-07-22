using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CadnunsDev.MeusGastos.Backend.Infrastructure.Repositories
{
    public class ShareDashboardRepository : IShareDashboardRepository
    {
        private readonly AppDbContext _context;

        public ShareDashboardRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task CreateAsync(ShareDashboard shareDashboard)
        {
            await _context.Set<ShareDashboard>().AddAsync(shareDashboard);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsShareWithThisOwnerAndUserAsync(Guid ownerUserId, Guid sharedWithUserId)
        {
            // EF.Property<Guid> permite filtrar diretamente pelas Shadow Properties configuradas no ModelBuilder
            return await _context.Set<ShareDashboard>()
                .AnyAsync(s => s.DashboardOwner.UserId == ownerUserId && 
                   s.SharedWithUser.UserId == sharedWithUserId);
        }

        public async Task<ShareDashboard?> GetByIdAsync(Guid shareId)
        {
            return await _context.Set<ShareDashboard>()
                .Include(s => s.DashboardOwner)
                .Include(s => s.SharedWithUser)
                .FirstOrDefaultAsync(s => s.ShareId == shareId);
        }

        public async Task<List<ShareDashboard>> ListAsync(Guid ownerUserId)
        {
            return await _context.Set<ShareDashboard>()
                .Include(s => s.DashboardOwner)
                .Include(s => s.SharedWithUser)
                .Where(s => s.DashboardOwner.UserId == ownerUserId)
                .AsNoTracking() // Melhora a performance em consultas de leitura pura
                .ToListAsync();
        }

        public async Task RemoveAsync(object sharing)
        {
            _context.Remove(sharing);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ShareDashboard sharing)
        {
            _context.Set<ShareDashboard>().Update(sharing);
            await _context.SaveChangesAsync();
        }
    }
}