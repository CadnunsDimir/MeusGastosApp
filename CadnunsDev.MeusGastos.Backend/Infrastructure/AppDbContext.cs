using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace CadnunsDev.MeusGastos.Backend.Infrastructure;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<BankAccount> BankAccounts { get; set; } = null!;
    public DbSet<BankAccountMovement> BankAccountMovements { get; set; } = null!;
    public DbSet<BillCategory> BillCategories { get; set; } = null!;
    public DbSet<BillToPay> BillsToPay { get; set; } = null!;
    public DbSet<ShareDashboard> ShareDashboardS { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.UserName).IsRequired();
            entity.Property(e => e.Email).IsRequired(false);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Roles).HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToArray()
            )
            .Metadata.SetValueComparer(
                new ValueComparer<string[]>(
                    (c1, c2) => c1.SequenceEqual(c2),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToArray()));
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.TokenId);
            entity.Property(e => e.TokenHash).IsRequired();
            entity.HasOne<User>()
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BankAccount>(entity =>
        {
            entity.HasKey(e => e.AccountId);
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.InitialBalance).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Balance).HasColumnType("decimal(18,2)");
            entity.HasOne<User>()
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BankAccountMovement>(entity =>
        {
            entity.HasKey(e => e.MovementId);
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.Value).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Date).IsRequired();
            entity.Property(e => e.Type).IsRequired();
            entity.Property(e => e.RelatedMovementId);
            entity.HasOne<BankAccount>()
                  .WithMany()
                  .HasForeignKey(e => e.AccountId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BillCategory>(entity =>
        {
            entity.HasKey(e => e.CategoryId);
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.UserId).IsRequired();
            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BillToPay>(entity =>
        {
            entity.HasKey(e => e.BillId);
            entity.Property(e => e.BillDescription).IsRequired();
            entity.Property(e => e.Month).IsRequired();
            entity.Property(e => e.Year).IsRequired();
            entity.Property(e => e.Value).HasColumnType("decimal(18,2)");
            entity.HasOne(b => b.Category)
                  .WithMany()
                  .HasForeignKey("CategoryId")
                  .IsRequired()
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ShareDashboard>(entity =>
        {
            entity.HasKey(e => e.ShareId);
            
            entity.HasOne(b => b.DashboardOwner)
                  .WithMany()
                  .HasForeignKey("DashboardOwnerUserId")
                  .IsRequired()
                  .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(b => b.SharedWithUser)
                  .WithMany()
                  .HasForeignKey("SharedWithUserId")
                  .IsRequired()
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex("DashboardOwnerUserId", "SharedWithUserId")
                .IsUnique();
        });
    }
}
