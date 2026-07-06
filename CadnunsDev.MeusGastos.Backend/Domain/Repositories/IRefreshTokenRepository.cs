using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Domain.Repositories
{
    public interface IRefreshTokenRepository : ICreateRepository<RefreshToken>
    {
        Task<RefreshToken?> GetByTokenHashAsync(string tokenHash);
        Task RevokeAsync(Guid tokenId);
    }
}