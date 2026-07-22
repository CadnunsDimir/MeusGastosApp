namespace CadnunsDev.MeusGastos.Backend.Domain.Exceptions
{
    [Serializable]
    public class InvalidUserException : Exception
    {
        public InvalidUserException() : base("Usuário Inválido")
        {
        }
    }
}