using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using CadnunsDev.MeusGastos.Backend.Domain.Exceptions;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using CadnunsDev.MeusGastos.Backend.Models;

namespace CadnunsDev.MeusGastos.Backend.Domain.Services
{
    public class ShareDashboardService
    {
        private readonly IShareDashboardRepository _shareDashboardRepository;
        private readonly IUserRepository _userRepository;
        public ShareDashboardService(IShareDashboardRepository shareDashboardRepository, IUserRepository userRepository)
        {
            _shareDashboardRepository = shareDashboardRepository;
            _userRepository = userRepository;                        
        }
        public async Task<List<ShareDashboardUserDTO>> List(Guid ownerUserId)
        {
            var result = await _shareDashboardRepository.ListAsync(ownerUserId);

            return result.Select(ShareDashboardUserDTO.MapEntity).ToList();
        }

        public async Task<ShareDashboardUserDTO> Share(Guid ownerUserId, NewShareDashboardDTO newShare)
        {
            var sharedWithUser = 
                await _userRepository.GetByUserName(newShare.SharedWithUserNameOrEmail) ?? 
                await _userRepository.GetByEmail(newShare.SharedWithUserNameOrEmail) ?? 
                throw new InvalidUserException();

            if(await _shareDashboardRepository.ExistsShareWithThisOwnerAndUserAsync(ownerUserId, sharedWithUser.UserId))
            {
                throw new DashboardAlreadySharedException();
            }

            if(ownerUserId == sharedWithUser.UserId)
            {
                throw new SelfShareDashboardException();
            }

            var owner = await _userRepository.GetById(ownerUserId) ?? throw new InvalidUserException();

            var shareDashboard = new ShareDashboard
            {
                DashboardOwner = owner,
                SharedWithUser = sharedWithUser,
                CanEdit = newShare.CanEdit
            };

            await _shareDashboardRepository.CreateAsync(shareDashboard);
            return ShareDashboardUserDTO.MapEntity(shareDashboard);
        }

        public async Task<ShareDashboardUserDTO> Update(Guid ownerUserId, UpdateShareDashboardDTO updateShare, Guid shareDashboardId)
        {
            var sharing = await _shareDashboardRepository.GetByIdAsync(shareDashboardId)
                ?? throw new ShareDashboardNotFoundException();
            
            if (sharing.DashboardOwner.UserId != ownerUserId)
            {
                throw new ShareDashboardNotFoundException();
            }
            
            sharing.CanEdit = updateShare.CanEdit;
            sharing.UpdatedAt = DateTime.UtcNow;
            await _shareDashboardRepository.UpdateAsync(sharing);
            return ShareDashboardUserDTO.MapEntity(sharing);
        }

        public async Task Remove(Guid ownerUserId, Guid shareDashboardId)
        {
            var sharing = await _shareDashboardRepository.GetByIdAsync(shareDashboardId)
                ?? throw new ShareDashboardNotFoundException();
            
            if (sharing.DashboardOwner.UserId != ownerUserId)
            {
                throw new ShareDashboardNotFoundException();
            }

            await _shareDashboardRepository.RemoveAsync(sharing);
        }
    }
}