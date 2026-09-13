/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: JwtHelper.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: JSON Web Token generator for authenticating Backoffice, Grid Operators, and Prosumers.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SmartSolar.API.Models;

namespace SmartSolar.API.Helpers
{
    /// <summary>
    /// Utility class for generating and validating JSON Web Tokens (JWT).
    /// </summary>
    public class JwtHelper
    {
        private readonly IConfiguration _configuration;

        /// <summary>
        /// Constructor for JwtHelper with configuration dependency injection.
        /// </summary>
        public JwtHelper(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Generates a signed JWT token containing user identity and role claims.
        /// </summary>
        /// <param name="user">User entity containing NIC, Email, Role, etc.</param>
        /// <param name="expiresAt">Out parameter returning token expiration time.</param>
        /// <returns>Signed JWT token string.</returns>
        public string GenerateToken(User user, out DateTime expiresAt)
        {
            // Inline comment: Read JWT secret key and issuer configuration
            var secretKey = _configuration["JwtSettings:SecretKey"] ?? "SmartSolarMicrogridEnterpriseSecretKey2026!@#$%^";
            var issuer = _configuration["JwtSettings:Issuer"] ?? "SmartSolarAPI";
            var audience = _configuration["JwtSettings:Audience"] ?? "SmartSolarClients";
            var expiryMinutes = int.TryParse(_configuration["JwtSettings:ExpiryMinutes"], out var mins) ? mins : 1440;

            expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Inline comment: Assemble role and identity claims for authorization
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id ?? string.Empty),
                new Claim("nic", user.Nic),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("status", user.Status)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = expiresAt,
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = credentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}
