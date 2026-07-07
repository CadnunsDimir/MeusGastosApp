using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CadnunsDev.MeusGastos.Backend.Infrastructure
{
    public class BankAccountMovementRepository : IBankAccountMovementRepository
    {
        private readonly AppDbContext context;

        public BankAccountMovementRepository(AppDbContext context)
        {
            this.context = context;
        }

        public async Task CreateAsync(BankAccountMovement movement)
        {
            context.BankAccountMovements.Add(movement);
            await context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid userId, Guid movementId)
        {
            var movement = await context.BankAccountMovements.FirstOrDefaultAsync(m => m.MovementId == movementId);
            if (movement is null) return;

            var account = await context.BankAccounts.FirstOrDefaultAsync(a => a.AccountId == movement.AccountId && a.UserId == userId);
            if (account is null) return;

            context.BankAccountMovements.Remove(movement);
            await context.SaveChangesAsync();
        }

        public async Task<List<BankAccountMovement>> ListAsync(Guid userId, int year, int month)
        {
            var accountIds = await context.BankAccounts.Where(a => a.UserId == userId).Select(a => a.AccountId).ToListAsync();
            var start = new DateOnly(year, month, 1);
            var end = start.AddMonths(1);
            return await context.BankAccountMovements.Where(m => accountIds.Contains(m.AccountId) && m.Date >= start && m.Date < end).ToListAsync();
        }
    }
}
