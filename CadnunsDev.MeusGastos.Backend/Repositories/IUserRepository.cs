using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Repositories
{
    public interface IUserRepository
    {
        public Task Create(User user);
        Task<User> GetByEmail(string email);
        Task<User?> GetById(Guid userId);
        Task<User?> GetByUserName(string userName);
        Task<bool> UserNameIsAvailable(string userName);
    }
}