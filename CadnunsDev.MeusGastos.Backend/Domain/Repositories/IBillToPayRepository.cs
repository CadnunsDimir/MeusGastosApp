using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Domain.Repositories
{
    public interface IBillToPayRepository : ICreateRepository<BillToPay>
    {
        Task<List<BillToPay>> ListAsync(Guid userId, int year, int month);
        Task<bool> NotExistsThisBill(int year, int month, string description);
        Task SaveAllAsync(List<BillToPay> biils);
    }
}