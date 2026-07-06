using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class BankAccountDTO
    {
        public Guid AccountId { get; init; }
        public required string Name { get; init; }
        public decimal Balance { get; init; }

        internal static List<BankAccountDTO> MapList(List<BankAccount> accounts)
        {
            return accounts.Select(x=> new BankAccountDTO
            {
                AccountId = x.AccountId,
                Name = x.Name,
                Balance = x.Balance
            }).ToList();
        }

        public static BankAccountDTO Map(BankAccount bankAccount)
        {
            return new BankAccountDTO
            {
                AccountId = bankAccount.AccountId,
                Name = bankAccount.Name,
                Balance = bankAccount.Balance
            };
        }
    }
}