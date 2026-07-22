namespace CadnunsDev.MeusGastos.Backend.Domain.Exceptions
{
    public class DashboardAlreadySharedException : Exception
    {
        public DashboardAlreadySharedException(): base("Dashboard já foi compartilhado com esse usuário")
        {
            
        }
    }
}