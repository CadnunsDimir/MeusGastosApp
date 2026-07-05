namespace CadnunsDev.MeusGastos.Backend.Domain.Exceptions
{
    [Serializable]
    internal class InvalidUserException : Exception
    {
        public InvalidUserException() : base("Usuário Inválido")
        {
        }
    }
}