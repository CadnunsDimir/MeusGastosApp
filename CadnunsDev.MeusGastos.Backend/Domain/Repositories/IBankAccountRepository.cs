using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Domain.Repositories
{
    public interface IBankAccountRepository: ICreateRepository<BankAccount>
    {
        Task<List<BankAccount>> GetByUserId(Guid userId);
        Task DeleteAsync(Guid userId, Guid accountId);
        Task Update(BankAccount account);
    }
}