using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Models
{
    public class ShareDashboardUserDTO
    {
        public Guid ShareId { get; set; }
        public required string UserName { get; init; }
        public bool CanEdit { get; private set; }

        public static ShareDashboardUserDTO MapEntity(ShareDashboard x) => new ShareDashboardUserDTO
        {
            ShareId = x.ShareId,
            UserName = BuildUserName(x.SharedWithUser),
            CanEdit = x.CanEdit
        };

        private static string BuildUserName(User sharedWithUser)
        {
            if (sharedWithUser.FirstName != null)
            {
                return $"{sharedWithUser.FirstName} {sharedWithUser.LastName}";
            }

            return sharedWithUser.UserName;
        }
    }
}