using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using CadnunsDev.MeusGastos.Backend.Domain.Exceptions;
using CadnunsDev.MeusGastos.Backend.Models;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;

namespace CadnunsDev.MeusGastos.Backend.Domain.Services
{
    public class LoginService
    {
        private readonly IUserRepository repository;
        private readonly TokenService tokenService;

        public LoginService(IUserRepository repository, TokenService tokenService)
        {
            this.repository = repository;
            this.tokenService = tokenService;
        }
        
        public async Task<LoginResponseDTO> Login(LoginRequestDTO loginRequest)
        {
            var user = await GetUserIfPasswordIsValid(loginRequest.UserName, loginRequest.Password);

            if (user is not null)
            {
                var acessToken = tokenService.GenerateToken(user);
                var refreshToken = tokenService.GenerateRefreshToken();

                await tokenService.SaveRefreshTokenAsync(user.UserId, refreshToken);

                return new LoginResponseDTO
                {
                    AccessToken = acessToken,
                    RefreshToken = refreshToken,
                    FirstName = user.FirstName ?? user.UserName
                };
            }

            throw new InvalidUserException();
        }

        public async Task<User?> GetUserIfPasswordIsValid(string userName, string password)
        {
            var user = await repository.GetByUserName(userName);
            var typedPasswordHash = tokenService.GeneratePasswordHash(password);
            return user?.PasswordHash == typedPasswordHash ? user : null;
        }

        internal async Task<LoginResponseDTO> RefreshToken(RefreshRequestDTO request)
        {
            var refreshToken = request.RefreshToken;
            var user = await tokenService.ValidateRefreshTokenAsync(refreshToken);

            if (user is null)
                throw new InvalidUserException();

            var newAccessToken = tokenService.GenerateToken(user);
            var newRefreshToken = tokenService.GenerateRefreshToken();

            await tokenService.RotateRefreshTokenAsync(user.UserId, refreshToken, newRefreshToken);

            return new LoginResponseDTO
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                FirstName = user.FirstName ?? user.UserName
            };
        }

        public async Task Logout(RefreshRequestDTO request)
        {
            await tokenService.RevokeRefreshTokenAsync(request.RefreshToken);
        }
    }
}