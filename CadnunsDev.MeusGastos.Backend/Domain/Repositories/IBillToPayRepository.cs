using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Domain.Repositories
{
    public interface IBillToPayRepository : ICreateRepository<BillToPay>
    {
        Task DeleteAsync(Guid userId, Guid billId);
        Task<List<BillToPay>> FindMany(Guid userId, Guid[] billsIds);
        Task<BillToPay> FindOneAsync(Guid userId, Guid bIllId);
        Task<List<BillToPay>> ListAsync(Guid userId, int year, int month);
        Task<bool> NotExistsThisBill(int year, int month, string description);
        Task SaveAllAsync(List<BillToPay> biils);
        Task UpdateAsync(BillToPay bill);
    }
}