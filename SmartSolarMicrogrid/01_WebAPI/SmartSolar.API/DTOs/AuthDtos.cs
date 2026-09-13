/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: AuthDtos.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Data Transfer Objects for Authentication (Login, Register, User Profiles).
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System.ComponentModel.DataAnnotations;

namespace SmartSolar.API.DTOs
{
    /// <summary>
    /// DTO for user login requests (works for Backoffice, GridOperator, and Prosumer).
    /// Supports login via NIC or Email.
    /// </summary>
    public class LoginRequestDto
    {
        [Required(ErrorMessage = "NIC or Email is required")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for Prosumer registration via Mobile or Web.
    /// Uses NIC as the primary identifier.
    /// </summary>
    public class RegisterProsumerDto
    {
        [Required(ErrorMessage = "NIC is required as primary key")]
        [StringLength(20, MinimumLength = 9, ErrorMessage = "Valid NIC format is required (9-12 characters)")]
        public string Nic { get; set; } = string.Empty;

        [Required(ErrorMessage = "Full Name is required")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone number is required")]
        public string Phone { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public double? SolarCapacityKWh { get; set; }
    }

    /// <summary>
    /// DTO returned upon successful authentication containing JWT and user profile.
    /// </summary>
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Nic { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public double? SolarCapacityKWh { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    /// <summary>
    /// Generic user profile response DTO.
    /// </summary>
    public class UserDto
    {
        public string? Id { get; set; }
        public string Nic { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public double? SolarCapacityKWh { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
