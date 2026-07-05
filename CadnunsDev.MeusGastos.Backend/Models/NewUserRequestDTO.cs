using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class NewUserRequestDTO
    {
        public required string UserName { get; set; }
        public required string Password { get; set; }

        public User CreateUserEntity(string hashedPassword)
        {
            return new User
            {
                UserName = UserName,
                PasswordHash = hashedPassword,
            };
        }
    }
}