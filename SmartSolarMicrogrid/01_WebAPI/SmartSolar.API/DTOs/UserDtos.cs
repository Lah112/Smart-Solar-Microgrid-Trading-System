/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: UserDtos.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: DTOs for user administration, profile updates, and role management.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System.ComponentModel.DataAnnotations;

namespace SmartSolar.API.DTOs
{
    /// <summary>
    /// DTO for creating Backoffice or Grid Operator staff accounts.
    /// </summary>
    public class CreateStaffUserDto
    {
        [Required(ErrorMessage = "NIC is required")]
        public string Nic { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Full Name is required")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Role is required (Backoffice or GridOperator)")]
        public string Role { get; set; } = "GridOperator";

        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for updating user profile information.
    /// </summary>
    public class UpdateUserProfileDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public double? SolarCapacityKWh { get; set; }
    }

    /// <summary>
    /// DTO for changing user status (Activate / Deactivate / Reactivate).
    /// </summary>
    public class ChangeUserStatusDto
    {
        [Required]
        public string Status { get; set; } = "Active"; // "Active", "Deactivated", "PendingActivation"
        public string? Reason { get; set; }
    }
}
