using CadnunsDev.MeusGastos.Backend.Models;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using CadnunsDev.MeusGastos.Backend.Domain.Enums;

namespace CadnunsDev.MeusGastos.Backend.Domain.Services
{
    public class BankAccountMovementService
    {
        private readonly IUserRepository userRepository;
        private readonly IBankAccountMovementRepository movementRepository;
        private readonly IBankAccountRepository bankAccountRepository;
        private readonly IBillToPayRepository billToPayRepository;
        private readonly IUnitOfWork unitOfWork;
        private readonly ILogger<BankAccountMovementService> logger;

        public BankAccountMovementService(IUserRepository userRepository, IBankAccountMovementRepository movementRepository, IBankAccountRepository bankAccountRepository, 
        IBillToPayRepository billToPayRepository,
        IUnitOfWork unitOfWork, ILogger<BankAccountMovementService> logger)
        {
            this.userRepository = userRepository;
            this.movementRepository = movementRepository;
            this.bankAccountRepository = bankAccountRepository;
            this.billToPayRepository = billToPayRepository;
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

        internal async Task<List<AccountMovementDTO>> CreateNewV2Async(string userName, int year, int month, NewAccountMovementV2DTO movement)
        {
            logger.LogInformation("CreateNewV2Async movement for user={UserName}, type={Type}, account={AccountId}, destAccount={DestAccountId}, value={Value}, Day={Day}", 
                userName, 
                movement.Type,
                movement.AccountId, 
                movement.DestinationAccountId,
                movement.Value, 
                movement.Day);

            var createdMovements = new List<AccountMovementDTO>();

            if (movement.Day < 1 || movement.Day > DateTime.DaysInMonth(year, month))
            {
                throw new ArgumentException("Dia inválido para o mês e ano informados.");
            }

            var date = new DateOnly(year, month, movement.Day);

            await unitOfWork.ExecuteAsync(async () =>
            {
                var user = await userRepository.GetByUserName(userName) ?? throw new Exceptions.InvalidUserException();

                // verify account ownership
                var accounts = await bankAccountRepository.GetByUserId(user.UserId);
                var originAccount = accounts.FirstOrDefault(a => a.AccountId == movement.AccountId) ?? throw new Exceptions.InvalidUserException();

                if (movement.Type == MovementType.Transfer)
                {
                    if (!movement.DestinationAccountId.HasValue)
                    {
                        throw new ArgumentException("Conta de destino é obrigatória para transferências.");
                    }

                    var destinationAccount = accounts.FirstOrDefault(a => a.AccountId == movement.DestinationAccountId.Value) ?? throw new Exceptions.InvalidUserException();

                    var movementIdA = Guid.NewGuid();
                    var movementIdB = Guid.NewGuid();

                    // Movement Out (Saída)
                    var movementA = new BankAccountMovement
                    {
                        MovementId = movementIdA,
                        AccountId = movement.AccountId,
                        Description = $"{movement.Description} (Saída para {destinationAccount.Name})",
                        Value = -Math.Abs(movement.Value),
                        Date = date,
                        Type = MovementType.Transfer,
                        RelatedMovementId = movementIdB
                    };

                    // Movement In (Entrada)
                    var movementB = new BankAccountMovement
                    {
                        MovementId = movementIdB,
                        AccountId = movement.DestinationAccountId.Value,
                        Description = $"{movement.Description} (Entrada de {originAccount.Name})",
                        Value = Math.Abs(movement.Value),
                        Date = date,
                        Type = MovementType.Transfer,
                        RelatedMovementId = movementIdA
                    };

                    await movementRepository.CreateAsync(movementA);
                    await movementRepository.CreateAsync(movementB);

                    originAccount.Balance -= Math.Abs(movement.Value);
                    destinationAccount.Balance += Math.Abs(movement.Value);

                    await bankAccountRepository.Update(originAccount);
                    await bankAccountRepository.Update(destinationAccount);

                    createdMovements.Add(AccountMovementDTO.Map(movementA));
                    createdMovements.Add(AccountMovementDTO.Map(movementB));
                }
                else
                {
                    decimal signedValue = movement.Value;
                    if (movement.Type == MovementType.Expense || movement.Type == MovementType.Investment)
                    {
                        signedValue = -Math.Abs(movement.Value);
                    }
                    else if (movement.Type == MovementType.Revenue)
                    {
                        signedValue = Math.Abs(movement.Value);
                    }

                    var entity = new BankAccountMovement
                    {
                        MovementId = Guid.NewGuid(),
                        AccountId = movement.AccountId,
                        Description = movement.Description,
                        Value = signedValue,
                        Date = date,
                        Type = movement.Type
                    };

                    await movementRepository.CreateAsync(entity);

                    originAccount.Balance += signedValue;
                    await bankAccountRepository.Update(originAccount);

                    createdMovements.Add(AccountMovementDTO.Map(entity));
                }
            });

            return createdMovements;
        }

        internal async Task DeleteAsync(string userName, Guid movementId)
        {
            await unitOfWork.ExecuteAsync(async () =>
            {
                logger.LogInformation("Delete movement {MovementId} requested by {UserName}", movementId, userName);

                var user = await userRepository.GetByUserName(userName) ?? throw new Exceptions.InvalidUserException();
                var movement = await movementRepository.FindByIdAndUserId(user.UserId, movementId);

                if (movement != null)
                {
                    var accounts = await bankAccountRepository.GetByUserId(user.UserId);

                    if (movement.RelatedMovementId.HasValue)
                    {
                        var relatedMovement = await movementRepository.FindByIdAndUserId(user.UserId, movement.RelatedMovementId.Value);
                        if (relatedMovement != null)
                        {
                            await movementRepository.DeleteAsync(user.UserId, movement.MovementId);
                            await movementRepository.DeleteAsync(user.UserId, relatedMovement.MovementId);

                            var accountOrigin = accounts.FirstOrDefault(x => x.AccountId == movement.AccountId);
                            if (accountOrigin != null)
                            {
                                accountOrigin.Balance -= movement.Value;
                                await bankAccountRepository.Update(accountOrigin);
                            }

                            var accountRelated = accounts.FirstOrDefault(x => x.AccountId == relatedMovement.AccountId);
                            if (accountRelated != null)
                            {
                                accountRelated.Balance -= relatedMovement.Value;
                                await bankAccountRepository.Update(accountRelated);
                            }

                            logger.LogInformation("Deleted both linked movements for transfer: {MovementId} and {RelatedMovementId}", movement.MovementId, relatedMovement.MovementId);
                            return;
                        }
                    }

                    if(movement.BillId is not null)
                    {
                        var bill = await billToPayRepository.FindOneAsync(user.UserId, (Guid)movement.BillId);
                        bill.IsPaid = false;
                        movement.BillId = null;
                        await billToPayRepository.UpdateAsync(bill);
                    }

                    await movementRepository.DeleteAsync(user.UserId, movementId);
                    var account = accounts.First(x => x.AccountId == movement.AccountId);
                    account.Balance -= movement.Value;

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