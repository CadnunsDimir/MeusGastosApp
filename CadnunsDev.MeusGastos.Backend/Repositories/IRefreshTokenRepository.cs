using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Repositories
{
    public interface IRefreshTokenRepository
    {
        Task CreateAsync(RefreshToken newTokenEntity);
        Task<RefreshToken?> GetByTokenHashAsync(string tokenHash);
        Task RevokeAsync(Guid tokenId);
    }
}