using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class NewUserDTO
    {
         public NewUserDTO(User user)
        {
            UserName = user.UserName;
            Email = user.Email;
        }

        public string UserName { get; }
        public string? Email { get; }
    }
}