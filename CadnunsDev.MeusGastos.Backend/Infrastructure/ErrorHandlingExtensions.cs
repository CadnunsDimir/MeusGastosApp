using Microsoft.AspNetCore.Diagnostics;

namespace CadnunsDev.MeusGastos.Backend.Infrastructure
{
    public static class ErrorHandlingExtensions
    {
        public static IServiceCollection AddGlobalErrorHandling(this IServiceCollection services)
        {
            services.AddExceptionHandler<GlobalExceptionHandler>();
            services.AddProblemDetails();
            return services;
        }
    }

    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }

        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            // Log mais completo
            _logger.LogError(exception,
                "Ocorreu uma exceção não tratada. Path: {Path} | Method: {Method}",
                httpContext.Request.Path,
                httpContext.Request.Method);

            // Define o status code da resposta (MUITO IMPORTANTE!)
            httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;

            var error = new
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Ocorreu um erro interno no servidor.",
                Detail = exception.Message,
                Instance = httpContext.Request.Path,
                TraceId = httpContext.TraceIdentifier
            };

            httpContext.Response.ContentType = "application/problem+json";

            await httpContext.Response.WriteAsJsonAsync(error, cancellationToken);

            return true;
        }
    }
}