using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;

namespace CadnunsDev.MeusGastos.Backend.Infrastructure
{
    public class EfUnitOfWork : IUnitOfWork
{
    private readonly AppDbContext context;

    public EfUnitOfWork(AppDbContext context)
    {
        this.context = context;
    }

    public async Task ExecuteAsync(Func<Task> action)
    {
        await using var transaction = await context.Database.BeginTransactionAsync();
        try
        {
            await action();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
}