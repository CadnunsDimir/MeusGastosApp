using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CadnunsDev.MeusGastos.Backend.Infrastructure;

public class BillToPayRepository : IBillToPayRepository
{
    private readonly AppDbContext context;

    public BillToPayRepository(AppDbContext context)
    {
        this.context = context;
    }

    public async Task CreateAsync(BillToPay entity)
    {
        context.BillsToPay.Add(entity);
        await context.SaveChangesAsync();
    }

    public Task<List<BillToPay>> ListAsync(Guid userId, int year, int month)
    {
        return context.BillsToPay
            .Include(x => x.Category)
            .Where(x => x.Category.UserId == userId && x.Year == year && x.Month == month)
            .ToListAsync();
    }

    public Task<bool> NotExistsThisBill(int year, int month, string description)
    {
        return context.BillsToPay
            .AllAsync(x => x.Year != year || x.Month != month || x.BillDescription != description);
    }

    public async Task SaveAllAsync(List<BillToPay> bills)
    {
        context.BillsToPay.UpdateRange(bills);
        await context.SaveChangesAsync();
    }
}
