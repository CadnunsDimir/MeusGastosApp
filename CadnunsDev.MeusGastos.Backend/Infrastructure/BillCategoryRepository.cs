using System.Threading.Tasks;
using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CadnunsDev.MeusGastos.Backend.Infrastructure;

public class BillCategoryRepository : IBillCategoryRepository
{
    private readonly AppDbContext context;

    public BillCategoryRepository(AppDbContext context)
    {
        this.context = context;
    }

    public async Task CreateAsync(BillCategory entity)
    {
        context.BillCategories.Add(entity);
        await context.SaveChangesAsync();
    }

    public Task<BillCategory?> FindByUserIdAndDescription(Guid userId, string categoryDescription)
    {
        return context.BillCategories
            .FirstOrDefaultAsync(x => x.UserId == userId && x.Description == categoryDescription);
    }
}
