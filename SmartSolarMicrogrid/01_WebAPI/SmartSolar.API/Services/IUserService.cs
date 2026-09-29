/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: IUserService.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Interface defining user management contracts including role assignments, activations, and deactivations.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System.Collections.Generic;
using System.Threading.Tasks;
using SmartSolar.API.DTOs;

namespace SmartSolar.API.Services
{
    /// <summary>
    /// Contract for user administration, profile management, and account activation workflows.
    /// </summary>
    public interface IUserService
    {
        // Retrieves users, optionally filtered by role and status.
        Task<List<UserDto>> GetAllUsersAsync(string? role = null, string? status = null);
        // Retrieves a user by NIC.
        Task<UserDto?> GetUserByNicAsync(string nic);
        // Creates a Backoffice or Grid Operator account.
        Task<UserDto> CreateStaffUserAsync(CreateStaffUserDto request);
        // Updates a user's profile.
        Task<UserDto> UpdateUserProfileAsync(string nic, UpdateUserProfileDto request);
        // Deactivates a user account.
        Task<UserDto> DeactivateUserAsync(string nic, string requestedByRole);
        // Reactivates a user account.
        Task<UserDto> ReactivateUserAsync(string nic, string requestedByRole);
        // Retrieves prosumer accounts awaiting activation.
        Task<List<UserDto>> GetPendingActivationsAsync();
        // Approves a pending prosumer account.
        Task<UserDto> ApprovePendingActivationAsync(string nic, string requestedByRole);
    }
}
