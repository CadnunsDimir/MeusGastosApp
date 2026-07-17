using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CadnunsDev.MeusGastos.Backend.Infrastructure;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext context;

    public UserRepository(AppDbContext context)
    {
        this.context = context;
    }

    public async Task CreateAsync(User user)
    {
        context.Users.Add(user);
        await context.SaveChangesAsync();
    }

    public async Task<User> GetByEmail(string email)
    {
        return await context.Users.FirstAsync(u => u.Email == email);
    }

    public async Task<User?> GetById(Guid userId)
    {
        return await context.Users.FindAsync(userId);
    }

    public Task<User?> GetByUserName(string userName)
    {
        return context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
    }

    public async Task<bool> UserNameIsAvailable(string userName)
    {
        return !await context.Users.AnyAsync(u => u.UserName == userName);
    }

    public async Task UpdateAsync(User user)
    {
        context.Users.Update(user);
        await context.SaveChangesAsync();
    }
}
