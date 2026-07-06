using Microsoft.EntityFrameworkCore;

namespace CadnunsDev.MeusGastos.Backend.Infrastructure
{
    public static class EFExtensions
    {
        public static async Task ApplyDBMigrationsAsync(this WebApplication app)
        {
            using (var scope = app.Services.CreateScope())
            {
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var attempts = 0;
                var maxAttempts = 10;
                var delay = TimeSpan.FromSeconds(5);
                while (true)
                {
                    try
                    {
                        db.Database.Migrate();
                        break;
                    }
                    catch (Exception ex)
                    {
                        attempts++;
                        logger.LogWarning(ex, "Database migration failed on attempt {Attempt}/{MaxAttempts}. Retrying in {Delay}.", attempts, maxAttempts, delay);
                        if (attempts >= maxAttempts)
                        {
                            logger.LogError(ex, "Failed to apply migrations after {MaxAttempts} attempts.", maxAttempts);
                            break;
                        }
                        await Task.Delay(delay);
                    }
                }
            }
        }
    }
}