/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: PasswordHasher.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Secure password hashing and verification utility using BCrypt.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using BCrypt.Net;

namespace SmartSolar.API.Helpers
{
    /// <summary>
    /// Utility class for hashing and verifying passwords securely.
    /// </summary>
    public static class PasswordHasher
    {
        /// <summary>
        /// Hashes a plain-text password using BCrypt with salt.
        /// </summary>
        /// <param name="password">Plain text password.</param>
        /// <returns>Hashed password string.</returns>
        public static string HashPassword(string password)
        {
            // Inline comment: Generate a strong salt and hash password
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 11);
        }

        /// <summary>
        /// Verifies whether the provided plain-text password matches the stored BCrypt hash.
        /// </summary>
        /// <param name="password">Plain text password from login attempt.</param>
        /// <param name="passwordHash">Stored hashed password.</param>
        /// <returns>True if password matches; otherwise false.</returns>
        public static bool VerifyPassword(string password, string passwordHash)
        {
            // Inline comment: Verify plain password against stored hash safely
            if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(passwordHash))
                return false;

            try
            {
                return BCrypt.Net.BCrypt.Verify(password, passwordHash);
            }
            catch
            {
                return false;
            }
        }
    }
}
