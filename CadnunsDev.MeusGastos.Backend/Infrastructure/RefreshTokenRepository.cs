using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using CadnunsDev.MeusGastos.Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CadnunsDev.MeusGastos.Backend.Infrastructure;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly AppDbContext context;

    public RefreshTokenRepository(AppDbContext context)
    {
        this.context = context;
    }

    public async Task CreateAsync(RefreshToken newTokenEntity)
    {
        context.RefreshTokens.Add(newTokenEntity);
        await context.SaveChangesAsync();
    }

    public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash)
    {
        return await context.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == tokenHash);
    }

    public async Task RevokeAsync(Guid tokenId)
    {
        var token = await context.RefreshTokens.FindAsync(tokenId);
        if (token is null) return;
        token.Revoked = true;
        await context.SaveChangesAsync();
    }
}
