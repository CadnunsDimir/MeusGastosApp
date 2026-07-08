using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using CadnunsDev.MeusGastos.Backend.Models.Exceptions;
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

    public async Task DeleteAsync(Guid userId, Guid billId)
    {
        var entity = await context.BillsToPay.FirstOrDefaultAsync(x=> x.BillId == billId && x.Category.UserId == userId);
        if (entity != null)
        {
            context.Remove(entity);
            await context.SaveChangesAsync();
        }
    }

    public Task<BillToPay> FindOneAsync(Guid userId, Guid bIllId)
    {
        return context.BillsToPay.FirstAsync(x=> x.Category.UserId == userId && x.BillId == bIllId);
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

    public async Task UpdateAsync(BillToPay account)
    {
        var entity = await context.BillsToPay.FindAsync(account.BillId);
        if (entity == null)
            throw new DbNotFoundException($"Fatura com ID {account.BillId} não encontrada.");

        context.Entry(entity).CurrentValues.SetValues(account);
        context.Entry(entity).Property(x => x.BillId).IsModified = false;
        await context.SaveChangesAsync();
    }
}
