using CadnunsDev.MeusGastos.Backend.Models;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using CadnunsDev.MeusGastos.Backend.Domain.Exceptions;
using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Domain.Services
{
    public class BillToPayService : BaseUserService<BillToPayService>
    {
        private readonly IBillToPayRepository billsRepository;
        private readonly IBillCategoryRepository categoryRepository;
        private readonly IUnitOfWork unitOfWork;
        private readonly ILogger<BillToPayService> logger;
        private readonly IBankAccountRepository bankAccountRepository;
        private readonly IBankAccountMovementRepository movementRepository;

        public BillToPayService(
            IUserRepository userRepository, 
            IBillToPayRepository billsRepository, 
            IBillCategoryRepository categoryRepository, 
            IBankAccountRepository bankAccountRepository,
            IBankAccountMovementRepository movementRepository,
            IUnitOfWork unitOfWork, 
            ILogger<BillToPayService> logger): base(userRepository, logger)
        {
            this.billsRepository = billsRepository;
            this.categoryRepository = categoryRepository;
            this.unitOfWork = unitOfWork;
            this.logger = logger;
            this.bankAccountRepository = bankAccountRepository;
            this.movementRepository = movementRepository;
        }

        public async Task<BillResponseDTO> CreateNewAsync(string userName, int year, int month, NewBillDTO newBill)
        {
            logger.LogInformation("CreateNewAsync start for user={UserName}, year={Year}, month={Month}, billDescription={BillDescription}, value={Value}, paymentDay={PaymentDay}, repeatNextMonth={RepeatValueNextMonth}, category={Category}",
                userName, year, month, newBill.Description, newBill.Value, newBill.PaymentDay, newBill.RepeatValueNextMonth, newBill.Category);

            BillResponseDTO? createdBillDto = null;

            await unitOfWork.ExecuteAsync(async () =>
            {
                var userId = await GetUserId(userName);
                logger.LogDebug("Found user with userName={UserName} and userId={UserId}", userName, userId);

                if (await billsRepository.NotExistsThisBill(year, month, newBill.Description))
                {
                    logger.LogDebug("No existing bill found for year={Year}, month={Month}, description={BillDescription}", year, month, newBill.Description);

                    var category = await CreateOrGetAsync(userId, newBill.Category);
                    logger.LogDebug("Using bill category id={CategoryId}, description={CategoryDescription}", category.CategoryId, category.Description);

                    var bill = new BillToPay
                    {
                        Year = year,
                        Month = month,
                        PaymentDay = newBill.PaymentDay,
                        RepeatValueNextMonth = newBill.RepeatValueNextMonth,
                        BillDescription = newBill.Description,
                        Value = newBill.Value,
                        Category = category
                    };

                    await billsRepository.CreateAsync(bill);
                    logger.LogInformation("Created bill entity for user={UserName}, billId={BillId}", userName, bill.BillId);

                    createdBillDto = BillResponseDTO.Map(bill);
                    logger.LogInformation("Mapped created bill to DTO: {@BillResponse}", createdBillDto);
                }
                else
                {
                    logger.LogWarning("Duplicate bill prevented for user={UserName}, year={Year}, month={Month}, description={BillDescription}",
                        userName, year, month, newBill.Description);
                    throw new InvalidOperationException("Já existe uma conta com a mesma descrição para este mês.");
                }
            });

            logger.LogInformation("CreateNewAsync completed successfully for user={UserName}, bill={BillDescription}", userName, newBill.Description);
            return createdBillDto ?? throw new InvalidOperationException("Bill was not created.");
        }

        private async Task<BillCategory> CreateOrGetAsync(Guid userId, string categoryDescription)
        {
            var category = await categoryRepository.FindByUserIdAndDescription(userId, categoryDescription);
            if (category is null)
            {
                category = new BillCategory
                {
                    CategoryId = Guid.NewGuid(),
                    Description = categoryDescription,
                    UserId = userId
                };
                await categoryRepository.CreateAsync(category);
            }
            return category;
        }

        public async Task<List<BillResponseDTO>> ListAsync(string userName, int year, int month)
        {
            logger.LogInformation("ListAsync start for user={UserName}, year={Year}, month={Month}", userName, year, month);

            var userId = await GetUserId(userName);

            var bills = await billsRepository.ListAsync(userId, year, month);
            logger.LogDebug("Found {BillCount} bills for year={Year}, month={Month}", bills.Count, year, month);

            if (bills.Count == 0)
            {
                logger.LogDebug("No bills found for year={Year}, month={Month}, looking for previous month to repeat values.", year, month);

                var previousMonth = month - 1;
                var previousYear = year;
                if (month == 0)
                {
                    previousYear = year - 1;
                    previousMonth = 12;
                }

                var billsPreviousMonth = await billsRepository.ListAsync(userId, previousMonth, previousYear);
                logger.LogDebug("Found {PreviousBillCount} bills for previous year={PreviousYear}, month={PreviousMonth}", billsPreviousMonth.Count, previousYear, previousMonth);

                if (billsPreviousMonth.Count > 0)
                {
                    await unitOfWork.ExecuteAsync(async () =>
                    {
                        bills = billsPreviousMonth.Select(x => new BillToPay
                        {
                            Value = x.RepeatValueNextMonth ? x.Value : 0,
                            BillDescription = x.BillDescription,
                            Category = x.Category,
                            BillId = Guid.NewGuid(),
                            IsPaid = false,
                            Month = month,
                            Year = year,
                            PaymentDay = x.PaymentDay,
                            RepeatValueNextMonth = x.RepeatValueNextMonth
                        }).ToList();
                        await billsRepository.SaveAllAsync(bills);
                    });
                    logger.LogInformation("Repeated {RepeatedBillCount} bills from previous month into year={Year}, month={Month}", bills.Count, year, month);
                }
                else
                {
                    logger.LogInformation("No previous month bills found to repeat for user={UserName}, year={Year}, month={Month}", userName, year, month);
                }
            }

            var result = BillResponseDTO.MapList(bills);
            logger.LogInformation("ListAsync returning {ResultCount} bills for user={UserName}, year={Year}, month={Month}", result.Count, userName, year, month);
            logger.LogDebug("ListAsync response data: {@BillResponseList}", result);
            return result;
        }
        
        public async Task DeleteBillAsync(string userName, Guid billId)
        {
            var userId = await GetUserId(userName);
            await billsRepository.DeleteAsync(userId, billId);
        }

        public async Task<BillResponseDTO> PayBill(string userName, PayingBillDTO payingBillDTO)
        {
            BillResponseDTO? response = null;

            logger.LogInformation(
                "Iniciando pagamento da conta {BillId} para o usuário {UserName} utilizando a conta bancária {AccountId}",
                payingBillDTO.BIllId, userName, payingBillDTO.AccountId);

            try
            {
                await unitOfWork.ExecuteAsync(async () =>
                {
                    var userId = await GetUserId(userName);
                    var bill = await billsRepository.FindOneAsync(userId, payingBillDTO.BIllId);

                    if (bill is null)
                    {
                        logger.LogWarning(
                            "Conta {BillId} não encontrada para o usuário {UserId}",
                            payingBillDTO.BIllId, userId);
                        throw new BillNotFoundException();
                    }

                    var account = (await bankAccountRepository.GetByUserId(userId))
                        .FirstOrDefault(x => x.AccountId == payingBillDTO.AccountId);

                    if (account is null)
                    {
                        logger.LogWarning(
                            "Conta bancária {AccountId} não pertence ao usuário {UserId}. Pagamento da conta {BillId} cancelado",
                            payingBillDTO.AccountId, userId, payingBillDTO.BIllId);
                        throw new AccountNotBelongThisUserException();
                    }

                    var movement = new BankAccountMovement
                    {
                        Description = bill.BillDescription,
                        Date = payingBillDTO.Date,
                        AccountId = account.AccountId,
                        Value = -bill.Value,
                        BillId = bill.BillId,
                        Type = Enums.MovementType.Expense
                    };

                    bill.IsPaid = true;
                    account.Balance += movement.Value;

                    logger.LogInformation(
                        "Debitando {Value} da conta bancária {AccountId}. Saldo anterior atualizado para {NewBalance}",
                        movement.Value, account.AccountId, account.Balance);

                    await billsRepository.UpdateAsync(bill);
                    await movementRepository.CreateAsync(movement);
                    await bankAccountRepository.Update(account);

                    logger.LogInformation(
                        "Conta {BillId} marcada como paga e movimentação {MovementId} registrada com sucesso na conta {AccountId}",
                        bill.BillId, movement.BillId, account.AccountId);

                    response = BillResponseDTO.Map(bill);
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex,
                    "Erro ao processar pagamento da conta {BillId} para o usuário {UserId}",
                    payingBillDTO.BIllId, userName);
                throw;
            }

            if (response is null)
            {
                logger.LogError(
                    "Pagamento da conta {BillId} não foi concluído para o usuário {UserName}, resposta nula ao final da transação",
                    payingBillDTO.BIllId, userName);
                throw new InvalidOperationException("Bill was not paid.");
            }

            return response;
        }

        public async Task<List<CategoryDTO>> QueryCategories(string userName, string query)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 3)
                return [];
                
            var userId = await GetUserId(userName);
            var categories = await categoryRepository.QueryAsync(userId, query, 3);
            return CategoryDTO.MapBillCategories(categories);
        }
    }
}