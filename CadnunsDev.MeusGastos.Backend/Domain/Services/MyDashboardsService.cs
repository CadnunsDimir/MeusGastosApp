using CadnunsDev.MeusGastos.Backend.Domain.Exceptions;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using CadnunsDev.MeusGastos.Backend.Models;

namespace CadnunsDev.MeusGastos.Backend.Domain.Services
{
    public class MyDashboardsService
    {
        private readonly IUserRepository _userRepository;
        private readonly IShareDashboardRepository _shareDashboardRepository;

        public MyDashboardsService(IUserRepository userRepository, IShareDashboardRepository shareDashboardRepository)
        {
            _userRepository = userRepository;
            _shareDashboardRepository = shareDashboardRepository;
        }
        public async Task<List<DashboardDTO>> ListAvailable(Guid userId)
        {
            var list = new List<DashboardDTO>();

            var me = await _userRepository.GetById(userId) ?? throw new InvalidUserException();
            list.Add(new DashboardDTO
            {
               OwnerName = me.FirstName ?? me.UserName,
               IsMine = true 
            });

            var sharedDashboardWithMe = await _shareDashboardRepository.ListSharedWithAsync(me.UserId);
            list.AddRange(sharedDashboardWithMe.Select(x=> new DashboardDTO
            {
               OwnerName = x.DashboardOwner.FirstName ?? x.DashboardOwner.UserName,
               IsMine = false,
               ShareDashboardId = x.ShareId 
            }).ToList());

            return list;
        }
    }
}