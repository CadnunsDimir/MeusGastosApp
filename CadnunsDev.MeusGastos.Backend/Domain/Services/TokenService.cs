using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CadnunsDev.MeusGastos.Backend.Domain.Entities;
using CadnunsDev.MeusGastos.Backend.Domain.Repositories;
using Microsoft.IdentityModel.Tokens;

namespace CadnunsDev.MeusGastos.Backend.Domain.Services
{
    public class TokenService
    {
        private readonly string PasswordHashSecret;
        private readonly string TokenSecret;
        private readonly IRefreshTokenRepository refreshTokenRepository;
        private readonly IUserRepository userRepository;
        private readonly ILogger<TokenService> logger;

        public TokenService( ILogger<TokenService> logger, IConfiguration configuration, IRefreshTokenRepository refreshTokenRepository, IUserRepository userRepository)
        {
            PasswordHashSecret = configuration[Constants.PasswordHashSecret] ?? throw new NullReferenceException();
            TokenSecret = configuration[Constants.TokenSecret] ?? throw new NullReferenceException();
            this.refreshTokenRepository = refreshTokenRepository;
            this.userRepository = userRepository;
            this.logger = logger;
        }
        public string GeneratePasswordHash(string password)
        {
            var salt = Encoding.ASCII.GetBytes(PasswordHashSecret);
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
                byte[] saltedPassword = new byte[passwordBytes.Length + salt.Length];

                // Concatenate password and salt
                Buffer.BlockCopy(passwordBytes, 0, saltedPassword, 0, passwordBytes.Length);
                Buffer.BlockCopy(salt, 0, saltedPassword, passwordBytes.Length, salt.Length);

                // Hash the concatenated password and salt
                byte[] hashedBytes = sha256.ComputeHash(saltedPassword);

                // Concatenate the salt and hashed password for storage
                byte[] hashedPasswordWithSalt = new byte[hashedBytes.Length + salt.Length];
                Buffer.BlockCopy(salt, 0, hashedPasswordWithSalt, 0, salt.Length);
                Buffer.BlockCopy(hashedBytes, 0, hashedPasswordWithSalt, salt.Length, hashedBytes.Length);

                return Convert.ToBase64String(hashedPasswordWithSalt);
            }
        }

        public string GenerateToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(TokenSecret);
            var tokenDescription = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(GetClaims(user)),
                Expires = DateTime.UtcNow.AddMinutes(5),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescription);
            return tokenHandler.WriteToken(token);
        }

        private static Claim[] GetClaims(User user)
        {
            var list = new List<Claim>(){
                new ("UserName", user.UserName),
                new ("UserId", user.UserId.ToString()),
                new (ClaimTypes.Email, user.Email ?? string.Empty),
            };

            list.AddRange(user.Roles.Select(x=> new Claim(ClaimTypes.Role, x)));

            return list.ToArray();
        }

        internal async Task<User?> ValidateRefreshTokenAsync(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                return null;

            var tokenHash = HashRefreshToken(refreshToken);
            var refreshTokenEntity = await refreshTokenRepository.GetByTokenHashAsync(tokenHash);

            if (refreshTokenEntity is null)
            {
                logger.LogInformation("refreshTokenEntity não encontrado no DB");
                return null;
            }
            if (refreshTokenEntity.Revoked || refreshTokenEntity.Expires < DateTime.UtcNow)
            {
                logger.LogInformation("refreshTokenEntity id={id} revogado ou expirado", refreshTokenEntity.TokenId);
                return null;
            }
            var user = await userRepository.GetById(refreshTokenEntity.UserId);
            logger.LogInformation("Usário encontrado={Found}", user != null);
            return user;
        }

        private static string HashRefreshToken(string refreshToken)
        {
            using var sha256 = SHA256.Create();
            var tokenBytes = Encoding.UTF8.GetBytes(refreshToken);
            var hashedBytes = sha256.ComputeHash(tokenBytes);
            return Convert.ToBase64String(hashedBytes);
        }

        internal string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            RandomNumberGenerator.Fill(randomBytes);

            return Convert.ToBase64String(randomBytes)
                .Replace('+', '-')
                .Replace('/', '_')
                .TrimEnd('=');
        }

        internal async Task RotateRefreshTokenAsync(Guid userId, string refreshToken, string newRefreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                throw new ArgumentException("Refresh token is required.", nameof(refreshToken));

            var oldHash = HashRefreshToken(refreshToken);
            var oldTokenEntity = await refreshTokenRepository.GetByTokenHashAsync(oldHash);

            if (oldTokenEntity is null || oldTokenEntity.UserId != userId)
                throw new InvalidOperationException("Refresh token inválido.");

            if (oldTokenEntity.Revoked || oldTokenEntity.Expires < DateTime.UtcNow)
                throw new InvalidOperationException("Refresh token expirado ou revogado.");

            await refreshTokenRepository.RevokeAsync(oldTokenEntity.TokenId);

            var newTokenEntity = new RefreshToken
            {
                TokenId = Guid.NewGuid(),
                UserId = userId,
                TokenHash = HashRefreshToken(newRefreshToken),
                Created = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddDays(30),
                Revoked = false
            };

            await refreshTokenRepository.CreateAsync(newTokenEntity);
        }

        internal async Task SaveRefreshTokenAsync(Guid userId, string refreshToken)
        {
            var newTokenEntity = new RefreshToken
            {
                TokenId = Guid.NewGuid(),
                UserId = userId,
                TokenHash = HashRefreshToken(refreshToken),
                Created = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddDays(30),
                Revoked = false
            };

            await refreshTokenRepository.CreateAsync(newTokenEntity);
        }

        internal async Task RevokeRefreshTokenAsync(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                return;

            var tokenHash = HashRefreshToken(refreshToken);
            var refreshTokenEntity = await refreshTokenRepository.GetByTokenHashAsync(tokenHash);
            if (refreshTokenEntity is null || refreshTokenEntity.Revoked)
                return;

            await refreshTokenRepository.RevokeAsync(refreshTokenEntity.TokenId);
        }
    }
}