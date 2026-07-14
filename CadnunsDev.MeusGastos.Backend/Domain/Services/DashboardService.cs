using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using CadnunsDev.MeusGastos.Backend.Domain.Enums;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using CadnunsDev.MeusGastos.Backend.Models;

namespace CadnunsDev.MeusGastos.Backend.Domain.Services
{
    public class DashboardService: BaseUserService<DashboardService>
    {
        private readonly IBankAccountMovementRepository _movementRepository;
        private readonly IBillToPayRepository _billToPayRepository;

        public DashboardService(
            IUserRepository userRepository, 
            IBankAccountMovementRepository movementRepository,
            IBillToPayRepository billToPayRepository,
            ILogger<DashboardService> logger): base(userRepository, logger)
        {
            _movementRepository = movementRepository;
            _billToPayRepository = billToPayRepository;
        }
        public async Task<List<DashboardItemDTO>> GenerateExpensesCategoriesByMonth(string userName, int month, int year)
        {
            var userId = await GetUserId(userName);
            var generalExpenses = await _movementRepository.ListByType(userId, year, month, MovementType.Expense);
            var expensesWithCategory = await GetCategories(userId, generalExpenses);
            var investiments = await _movementRepository.ListByType(userId, year, month, MovementType.Investment);

            List<DashboardItemDTO> list = [
                new DashboardItemDTO
                {
                    Category = "Investimentos",
                    TotalSum = -investiments.Sum(x=>x.Value)
                },
                ..expensesWithCategory
            ];

            return list.Where(x=> x.TotalSum > 0).ToList();
        }

        private async Task<List<DashboardItemDTO>> GetCategories(Guid userId, List<BankAccountMovement> generalExpenses)
        {
            var billsIds = generalExpenses
                .Where(x=>x.BillId.HasValue)
                .Select(x=> x.BillId.Value)
                .Distinct()
                .ToArray();

            var bills = await _billToPayRepository.FindMany(userId, billsIds);
            
            return generalExpenses
                .Select(movement => CheckIfHasABillAsync(movement, bills))
                .GroupBy(x=>x.Category)
                .Select(x=> new DashboardItemDTO
                {
                    Category = x.Key,
                    TotalSum = x.Sum(x=>x.TotalSum)
                })
                .ToList();
        }

        private DashboardItemDTO CheckIfHasABillAsync(BankAccountMovement movement, List<BillToPay> bills)
        {
            var response = new DashboardItemDTO
                {
                    Category = "Outros",
                    TotalSum = -movement.Value
                };

                
                if (movement.BillId != null)
                {
                    var bill = bills.First(x=>x.BillId == movement.BillId);
                    response.Category = bill.Category.Description;
                }

                return response;
        }
    }
}