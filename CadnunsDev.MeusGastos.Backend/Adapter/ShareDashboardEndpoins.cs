using System.Security.Claims;
using CadnunsDev.MeusGastos.Backend.Domain.Services;
using CadnunsDev.MeusGastos.Backend.Infrastructure;
using CadnunsDev.MeusGastos.Backend.Models;

namespace CadnunsDev.MeusGastos.Backend.Adapter
{
    public static class ShareDashboardEndpoins
    {
        public static WebApplication? MapShareDashboardEndpoins(this WebApplication app)
        {
            var group = app.MapGroup("/my-dashboards")
                .WithTags("Share Dashboard")
                .RequireRateLimiting("api")
                .RequireAuthorization();            

            GetShare(group);
            PostShare(group);
            UpdateShare(group);
            RemoveShare(group);

            ListMyDashboards(group);

            return app;
        }

        private static void ListMyDashboards(RouteGroupBuilder group)
        {
            group.MapGet("/", (ClaimsPrincipal user, MyDashboardsService myDashboardsService)=>
                myDashboardsService.ListAvailable(user.GetUserId()));
        }

        private static void RemoveShare(RouteGroupBuilder group) => 
            group.MapDelete("/share/{shareId:guid}", async (ClaimsPrincipal user, ShareDashboardService shareDashboardService, Guid shareId) =>
                {
                    await shareDashboardService.Remove(user.GetUserId(), shareId);
                    return Results.Ok(new
                    {
                        removed = true
                    });
                })                
                .Produces<ShareDashboardUserDTO>(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status404NotFound);

        private static void UpdateShare(RouteGroupBuilder group) => 
        group.MapPut("/share/{shareId:guid}", async (ClaimsPrincipal user, ShareDashboardService shareDashboardService, UpdateShareDashboardDTO updateShare, Guid shareId) =>
                {
                    var dashboardData = await shareDashboardService.Update(user.GetUserId(), updateShare, shareId);
                    if (dashboardData == null)
                    {
                        return Results.NotFound();
                    }
                    return Results.Ok(dashboardData);
                })                
                .Produces<ShareDashboardUserDTO>(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status404NotFound);

        private static void PostShare(RouteGroupBuilder group)=> 
            group.MapPost("/share", async (ClaimsPrincipal user, ShareDashboardService shareDashboardService, NewShareDashboardDTO newShare) =>
                {
                    ShareDashboardUserDTO dashboardData = await shareDashboardService.Share(user.GetUserId(), newShare);
                    if (dashboardData == null)
                    {
                        return Results.NotFound();
                    }
                    return Results.Ok(dashboardData);
                })                
                .Produces<ShareDashboardUserDTO>(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status404NotFound);

        private static void GetShare(RouteGroupBuilder group) => 
            group.MapGet("/share", async (ClaimsPrincipal user, ShareDashboardService shareDashboardService) =>
                {
                    var dashboardData = await shareDashboardService.List(user.GetUserId());
                    if (dashboardData == null)
                    {
                        return Results.NotFound();
                    }
                    return Results.Ok(dashboardData);
                })
                .Produces<List<ShareDashboardUserDTO>>(StatusCodes.Status200OK)
                .Produces(StatusCodes.Status404NotFound);
    }
}