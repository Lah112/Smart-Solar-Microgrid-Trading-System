/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: IAuthService.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Interface defining authentication and registration service contracts.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System.Threading.Tasks;
using SmartSolar.API.DTOs;

namespace SmartSolar.API.Services
{
    /// <summary>
    /// Contract for Authentication service operations.
    /// </summary>
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
        Task<UserDto> RegisterProsumerAsync(RegisterProsumerDto request);
        Task<UserDto> GetCurrentUserProfileAsync(string nic);
    }
}
