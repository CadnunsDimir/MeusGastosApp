using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using CadnunsDev.MeusGastos.Backend.Domain.Exceptions;
using CadnunsDev.MeusGastos.Backend.Models;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;

namespace CadnunsDev.MeusGastos.Backend.Domain.Services
{
    public class BankAccountService
    {
        private readonly IUserRepository userRepository;
        private readonly IBankAccountRepository bankAccountRepository;

        public BankAccountService(IUserRepository userRepository, IBankAccountRepository bankAccountRepository)
        {
            this.userRepository = userRepository;
            this.bankAccountRepository = bankAccountRepository;
        }

        internal async Task<BankAccountDTO> CreateNewAsync(string userName, NewBankAccountDTO newBankAccountDTO)
        {
            var user = await userRepository.GetByUserName(userName) ?? throw new InvalidUserException();
            //TODO: verifique se já não existe uma conta com esse nome para esse usuário
            var account = new BankAccount
            {
              Name = newBankAccountDTO.AccountName,
              InitialBalance = newBankAccountDTO.InitialBalance,
              Balance = newBankAccountDTO.InitialBalance,
              UserId = user.UserId,
              AccountId = Guid.NewGuid(),
              InitialMonth = DateTime.Now.Month,
              InitialYear = DateTime.Now.Year
            };
            await bankAccountRepository.CreateAsync(account);
            return BankAccountDTO.Map(account);
        }

        internal async Task<List<BankAccountDTO>> ListByUserNameAsync(string userName)
        {
            var user = await userRepository.GetByUserName(userName) ?? throw new InvalidUserException();
            var accounts = await bankAccountRepository.GetByUserId(user.UserId);
            return BankAccountDTO.MapList(accounts);
        }

        internal async Task DeleteAsync(string userName, Guid accountId)
        {
            var user = await userRepository.GetByUserName(userName) ?? throw new InvalidUserException();
            await bankAccountRepository.DeleteAsync(user.UserId, accountId);
        }
    }
}