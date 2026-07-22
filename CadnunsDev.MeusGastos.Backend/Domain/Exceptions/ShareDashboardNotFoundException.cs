namespace CadnunsDev.MeusGastos.Backend.Domain.Exceptions
{
    public class ShareDashboardNotFoundException: Exception
    {
        public ShareDashboardNotFoundException(): base("Compartilhamento de Dashboard não encontrado")
        {
            
        }
    }
}