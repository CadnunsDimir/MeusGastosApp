using CadnunsDev.MeusGastos.Backend.Domain.Exceptions;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;

namespace CadnunsDev.MeusGastos.Backend.Domain.Services
{
    public abstract class BaseUserService<TService>
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<TService> _logger;

        public BaseUserService(IUserRepository userRepository, ILogger<TService> logger)
        {
            _userRepository = userRepository;
            _logger = logger;
        }

        public async Task<Guid> GetUserId(string userName)
        {
            var user = await _userRepository.GetByUserName(userName) ?? throw new InvalidUserException();
            _logger.LogDebug("Found user with userName={UserName} and userId={UserId}", userName, user.UserId);
            return user.UserId;
        }
    }
}