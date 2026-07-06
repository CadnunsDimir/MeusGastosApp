namespace CadnunsDev.MeusGastos.Backend.Domain.Exceptions
{
    public class BillAlreadyExistException: Exception
    {
        public BillAlreadyExistException() : base("Conta já existe para o mês atual")
        {            
        }
    }
}