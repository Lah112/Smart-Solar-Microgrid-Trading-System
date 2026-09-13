/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: ExceptionMiddleware.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Global exception handling middleware to format structured error responses.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace SmartSolar.API.Middleware
{
    /// <summary>
    /// Catches unhandled exceptions and produces uniform JSON error payloads.
    /// </summary>
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        /// <summary>
        /// Constructor for ExceptionMiddleware.
        /// </summary>
        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        /// <summary>
        /// Intercepts HTTP request execution to trap and handle exceptions.
        /// </summary>
        public async Task InvokeAsync(HttpContext context)
        {
            // Inline comment: Proceed with request pipeline and capture any thrown exceptions
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        /// <summary>
        /// Maps exception types to corresponding HTTP status codes.
        /// </summary>
        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            // Inline comment: Match exception types to standard HTTP status codes
            context.Response.ContentType = "application/json";

            var statusCode = exception switch
            {
                KeyNotFoundException => HttpStatusCode.NotFound,
                UnauthorizedAccessException => HttpStatusCode.Forbidden,
                InvalidOperationException => HttpStatusCode.BadRequest,
                ArgumentException => HttpStatusCode.BadRequest,
                _ => HttpStatusCode.InternalServerError
            };

            context.Response.StatusCode = (int)statusCode;

            var response = new
            {
                status = context.Response.StatusCode,
                error = statusCode.ToString(),
                message = exception.Message,
                timestamp = DateTime.UtcNow
            };

            var json = JsonSerializer.Serialize(response);
            return context.Response.WriteAsync(json);
        }
    }
}
