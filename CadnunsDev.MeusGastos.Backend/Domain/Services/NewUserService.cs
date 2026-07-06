using CadnunsDev.MeusGastos.Backend.Domain.Exceptions;
using CadnunsDev.MeusGastos.Backend.Models;
using CadnunsDev.MeusGastos.Backend.Repositories;

namespace CadnunsDev.MeusGastos.Backend.Domain.Services
{
    public class NewUserService
    {
        private IUserRepository repository;
        private TokenService tokenService;

        public NewUserService(IUserRepository repository, TokenService tokenService)
        {
            this.repository = repository;
            this.tokenService = tokenService;
        }

        public async Task<NewUserDTO> Create(NewUserRequestDTO newAccount)
        {
            if (await repository.UserNameIsAvailable(newAccount.UserName))
            {
                var user = newAccount.CreateUserEntity(tokenService.GeneratePasswordHash(newAccount.Password));
                await repository.CreateAsync(user);
                return new NewUserDTO(user);
            }
            throw new UserNameAlreadyExistsException();
        }
    }
}