using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using CadnunsDev.MeusGastos.Backend.Models;

namespace CadnunsDev.MeusGastos.Backend.Domain.Services
{
    public class UserProfileService
    {
        private readonly IUserRepository userRepository;

        public UserProfileService(IUserRepository userRepository)
        {
            this.userRepository = userRepository;
        }

        public async Task<ProfileResponseDTO> GetProfileAsync(Guid userId)
        {
            var user = await userRepository.GetById(userId);

            if (user is null)
                throw new InvalidOperationException("User not found");

            return new ProfileResponseDTO
            {
                UserName = user.UserName,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty
            };
        }

        public async Task<ProfileResponseDTO> UpdateProfileAsync(Guid userId, UpdateProfileRequestDTO updateRequest)
        {
            var user = await userRepository.GetById(userId);

            if (user is null)
                throw new InvalidOperationException("User not found");

            user.Email = updateRequest.Email;
            user.FirstName = updateRequest.FirstName;
            user.LastName = updateRequest.LastName;

            await userRepository.UpdateAsync(user);

            return new ProfileResponseDTO
            {
                UserName = user.UserName,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty
            };
        }
    }
}
