using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using CadnunsDev.MeusGastos.Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CadnunsDev.MeusGastos.Backend.Infrastructure
{
    public class BankAccountRepository : IBankAccountRepository
    {
        private AppDbContext context;

        public BankAccountRepository(AppDbContext context)
        {
            this.context = context;
        }
        public async Task CreateAsync(BankAccount entity)
        {
            context.BankAccounts.Add(entity);
            await context.SaveChangesAsync();
        }

        public Task<List<BankAccount>> GetByUserId(Guid userId)
        {
            return context.BankAccounts.Where(x=> x.UserId == userId).ToListAsync();
        }
    }
}