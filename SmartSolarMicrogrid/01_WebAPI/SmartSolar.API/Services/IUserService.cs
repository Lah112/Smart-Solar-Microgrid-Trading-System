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
        Task<List<UserDto>> GetAllUsersAsync(string? role = null, string? status = null);
        Task<UserDto?> GetUserByNicAsync(string nic);
        Task<UserDto> CreateStaffUserAsync(CreateStaffUserDto request);
        Task<UserDto> UpdateUserProfileAsync(string nic, UpdateUserProfileDto request);
        Task<UserDto> DeactivateUserAsync(string nic, string requestedByRole);
        Task<UserDto> ReactivateUserAsync(string nic, string requestedByRole);
        Task<List<UserDto>> GetPendingActivationsAsync();
        Task<UserDto> ApprovePendingActivationAsync(string nic, string requestedByRole);
    }
}
