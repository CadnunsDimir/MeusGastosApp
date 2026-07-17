using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace CadnunsDev.MeusGastos.Backend.Infrastructure
{
    public static class AuthExtensions
    {
        public static void AddJwtAuthentication(this WebApplicationBuilder builder)
        {
            var tokenSecret = Encoding.ASCII.GetBytes(builder.Configuration[Constants.TokenSecret] ?? throw new NullReferenceException(Constants.TokenSecret));
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(x =>
                    {
                        x.RequireHttpsMetadata = false;
                        x.SaveToken = true;
                        x.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateIssuerSigningKey = true,
                            IssuerSigningKey = new SymmetricSecurityKey(tokenSecret),
                            ValidateIssuer = false,
                            ValidateAudience = false
                        };
                    });

            builder.Services.AddAuthorization();
        }

        public static void UseJwtAuthentication(this WebApplication app)
        {
            app.UseAuthentication();
            app.UseAuthorization();
        }

        public static string GetUserName(this ClaimsPrincipal user)
        {
            return user.FindFirstValue("UserName") ?? throw new NullReferenceException("UserName não presente no JWT");
        }

        public static Guid GetUserId(this ClaimsPrincipal user)
        {
            var userIdString = user.FindFirstValue("UserId");
            if (string.IsNullOrEmpty(userIdString))
                throw new NullReferenceException("UserId não presente no JWT");

            return Guid.Parse(userIdString);
        }
    }
}