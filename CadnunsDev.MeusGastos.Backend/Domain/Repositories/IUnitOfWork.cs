namespace CadnunsDev.MeusGastos.Backend.Domain.Repositories
{
    public interface IUnitOfWork
    {
         Task ExecuteAsync(Func<Task> action);
    }
}