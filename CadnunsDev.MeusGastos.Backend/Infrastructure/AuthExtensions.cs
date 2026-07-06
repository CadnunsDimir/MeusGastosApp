using System;
using System.Collections.Generic;
using System.Linq;
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
    }
}