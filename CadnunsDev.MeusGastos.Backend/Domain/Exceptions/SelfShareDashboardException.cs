namespace CadnunsDev.MeusGastos.Backend.Domain.Exceptions
{
    public class SelfShareDashboardException: Exception
    {
        public SelfShareDashboardException(): base("Não é possível compartilhar o dashboard com você mesmo")
        {
            
        }
    }
}