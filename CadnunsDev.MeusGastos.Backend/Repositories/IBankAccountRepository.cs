using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Repositories
{
    public interface IBankAccountRepository: ICreateRepository<BankAccount>
    {
        Task<List<BankAccount>> GetByUserId(Guid userId);
    }
}