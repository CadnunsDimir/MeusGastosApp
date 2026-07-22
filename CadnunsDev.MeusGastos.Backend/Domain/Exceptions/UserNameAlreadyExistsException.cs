namespace CadnunsDev.MeusGastos.Backend.Domain.Exceptions
{
    [Serializable]
    public class UserNameAlreadyExistsException : Exception
    {
        public UserNameAlreadyExistsException(): base("Usuário já existe")
        {
        }
    }
}