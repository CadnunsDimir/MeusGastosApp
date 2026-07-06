using CadnunsDev.MeusGastos.Backend.Models;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using CadnunsDev.MeusGastos.Backend.Domain.Exceptions;
using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace CadnunsDev.MeusGastos.Backend.Domain.Services
{
    public class BillToPayService
    {
        private readonly IUserRepository userRepository;
        private readonly IBillToPayRepository billsRepository;
        private readonly IBillCategoryRepository categoryRepository;
        private readonly IUnitOfWork unitOfWork;
        private readonly ILogger<BillToPayService> logger;

        public BillToPayService(IUserRepository userRepository, IBillToPayRepository billsRepository, IBillCategoryRepository categoryRepository, IUnitOfWork unitOfWork, ILogger<BillToPayService> logger)
        {
            this.userRepository = userRepository;
            this.billsRepository = billsRepository;
            this.categoryRepository = categoryRepository;
            this.unitOfWork = unitOfWork;
            this.logger = logger;
        }

        internal async Task<BillResponseDTO> CreateNewAsync(string userName, int year, int month, NewBillDTO newBill)
        {
            logger.LogInformation("CreateNewAsync start for user={UserName}, year={Year}, month={Month}, billDescription={BillDescription}, value={Value}, paymentDay={PaymentDay}, repeatNextMonth={RepeatValueNextMonth}, category={Category}",
                userName, year, month, newBill.Description, newBill.Value, newBill.PaymentDay, newBill.RepeatValueNextMonth, newBill.Category);

            BillResponseDTO? createdBillDto = null;

            await unitOfWork.ExecuteAsync(async () =>
            {
                var user = await userRepository.GetByUserName(userName) ?? throw new InvalidUserException();
                logger.LogDebug("Found user with userName={UserName} and userId={UserId}", userName, user.UserId);

                if (await billsRepository.NotExistsThisBill(year, month, newBill.Description))
                {
                    logger.LogDebug("No existing bill found for year={Year}, month={Month}, description={BillDescription}", year, month, newBill.Description);

                    var category = await CreateOrGetAsync(user, newBill.Category);
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

        private async Task<BillCategory> CreateOrGetAsync(User user, string categoryDescription)
        {
            var category = await categoryRepository.FindByUserIdAndDescription(user.UserId, categoryDescription);
            if (category is null)
            {
                category = new BillCategory
                {
                    CategoryId = Guid.NewGuid(),
                    Description = categoryDescription,
                    UserId = user.UserId
                };
                await categoryRepository.CreateAsync(category);
            }
            return category;
        }

        internal async Task<List<BillResponseDTO>> ListAsync(string userName, int year, int month)
        {
            logger.LogInformation("ListAsync start for user={UserName}, year={Year}, month={Month}", userName, year, month);

            var user = await userRepository.GetByUserName(userName) ?? throw new InvalidUserException();
            logger.LogDebug("Found user with userName={UserName} and userId={UserId}", userName, user.UserId);

            var bills = await billsRepository.ListAsync(user.UserId, year, month);
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

                var billsPreviousMonth = await billsRepository.ListAsync(user.UserId, previousMonth, previousYear);
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

        internal async Task DeleteBillAsync(string userName, Guid billId)
        {
            var user = await userRepository.GetByUserName(userName) ?? throw new InvalidUserException();
            logger.LogDebug("Found user with userName={UserName} and userId={UserId}", userName, user.UserId);

            await billsRepository.DeleteAsync(user.UserId, billId);
        }
    }
}