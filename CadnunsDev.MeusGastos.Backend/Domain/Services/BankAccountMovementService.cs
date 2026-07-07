using CadnunsDev.MeusGastos.Backend.Models;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Domain.Services
{
    public class BankAccountMovementService
    {
        private readonly IUserRepository userRepository;
        private readonly IBankAccountMovementRepository movementRepository;
        private readonly IBankAccountRepository bankAccountRepository;
        private readonly IUnitOfWork unitOfWork;
        private readonly ILogger<BankAccountMovementService> logger;

        public BankAccountMovementService(IUserRepository userRepository, IBankAccountMovementRepository movementRepository, IBankAccountRepository bankAccountRepository, IUnitOfWork unitOfWork, ILogger<BankAccountMovementService> logger)
        {
            this.userRepository = userRepository;
            this.movementRepository = movementRepository;
            this.bankAccountRepository = bankAccountRepository;
            this.unitOfWork = unitOfWork;
            this.logger = logger;
        }

        internal async Task<AccountMovementDTO> CreateNewAsync(string userName, int year, int month, NewAccountMovementDTO movement)
        {
            logger.LogInformation("CreateNewAsync movement for user={UserName}, account={AccountId}, value={Value}, Date={Date}", 
                userName, 
                movement.AccountId, 
                movement.Value, 
                movement.Date);

            AccountMovementDTO created = null!;

            await unitOfWork.ExecuteAsync(async () =>
            {
                var user = await userRepository.GetByUserName(userName) ?? throw new Exceptions.InvalidUserException();

                // verify account ownership
                var accounts = await bankAccountRepository.GetByUserId(user.UserId);
                if (!accounts.Any(a => a.AccountId == movement.AccountId)) throw new Exceptions.InvalidUserException();

                var entity = new BankAccountMovement
                {
                    MovementId = Guid.NewGuid(),
                    AccountId = movement.AccountId,
                    Description = movement.Description,
                    Value = movement.Value,
                    Date = movement.Date
                };
                await movementRepository.CreateAsync(entity);
                
                var account = accounts.First(x=>x.AccountId == entity.AccountId);
                account.Balance += entity.Value;
                logger.LogInformation("Update Account Balance on account {Name} from {UserName}", account.Name, userName);
                await bankAccountRepository.Update(account);

                created = AccountMovementDTO.Map(entity);
            });

            return created;
        }

        internal async Task DeleteAsync(string userName, Guid movementId)
        {
            await unitOfWork.ExecuteAsync(async () =>
            {
                logger.LogInformation("Delete movement {MovementId} requested by {UserName}", movementId, userName);

                var user = await userRepository.GetByUserName(userName) ?? throw new Exceptions.InvalidUserException();
                var entity = await movementRepository.FindByIdAndUserId(user.UserId, movementId);

                await movementRepository.DeleteAsync(user.UserId, movementId);

                if (entity != null)
                {
                    var accounts = await bankAccountRepository.GetByUserId(user.UserId);
                    var account = accounts.First(x => x.AccountId == entity.AccountId);
                    account.Balance -= entity.Value;

                    logger.LogInformation("Update Account Balance on account {Name} from {UserName}", account.Name, userName);
                    await bankAccountRepository.Update(account);
                }
            });

        }

        internal async Task<List<AccountMovementDTO>> ListAsync(string userName, int year, int month)
        {
            logger.LogInformation("List movements for user={UserName}, year={Year}, month={Month}", userName, year, month);
            var user = await userRepository.GetByUserName(userName) ?? throw new Exceptions.InvalidUserException();
            var movements = await movementRepository.ListAsync(user.UserId, year, month);
            return movements.Select(AccountMovementDTO.Map).ToList();
        }
    }
}