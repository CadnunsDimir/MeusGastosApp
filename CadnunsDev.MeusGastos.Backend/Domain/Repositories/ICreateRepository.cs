using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CadnunsDev.MeusGastos.Backend.Domain.Repositories
{
    public interface ICreateRepository<T>
    {
        public Task CreateAsync(T entity);
    }
}