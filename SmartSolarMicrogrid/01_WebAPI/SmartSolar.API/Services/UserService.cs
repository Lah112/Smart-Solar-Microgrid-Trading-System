/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: UserService.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Implementation of user management business rules (Backoffice reactivation, staff creation, status management).
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartSolar.API.DTOs;
using SmartSolar.API.Helpers;
using SmartSolar.API.Models;
using SmartSolar.API.Repositories;

namespace SmartSolar.API.Services
{
    /// <summary>
    /// Service implementing user management rules and role authorization logic.
    /// </summary>
    public class UserService : IUserService
    {
        private readonly IMongoRepository<User> _userRepository;

        /// <summary>
        /// Constructor for UserService.
        /// </summary>
        public UserService(IMongoRepository<User> userRepository)
        {
            _userRepository = userRepository;
        }

        /// <summary>
        /// Retrieves all users matching optional role and status filters.
        /// </summary>
        public async Task<List<UserDto>> GetAllUsersAsync(string? role = null, string? status = null)
        {
            // Inline comment: Query users with dynamic filtering
            var users = await _userRepository.GetAllAsync();

            if (!string.IsNullOrEmpty(role))
            {
                users = users.Where(u => u.Role.Equals(role, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (!string.IsNullOrEmpty(status))
            {
                users = users.Where(u => u.Status.Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            return users.Select(MapToUserDto).ToList();
        }

        /// <summary>
        /// Retrieves a single user profile by NIC primary key.
        /// </summary>
        public async Task<UserDto?> GetUserByNicAsync(string nic)
        {
            // Inline comment: Query single user by normalized NIC
            var cleanNic = nic.Trim().ToUpperInvariant();
            var user = await _userRepository.FindOneAsync(u => u.Nic.ToUpper() == cleanNic);
            return user != null ? MapToUserDto(user) : null;
        }

        /// <summary>
        /// Creates a new staff user (Backoffice or Grid Operator).
        /// </summary>
        public async Task<UserDto> CreateStaffUserAsync(CreateStaffUserDto request)
        {
            // Inline comment: Validate NIC uniqueness
            var cleanNic = request.Nic.Trim().ToUpperInvariant();
            var existingUser = await _userRepository.FindOneAsync(u => u.Nic.ToUpper() == cleanNic);
            if (existingUser != null)
            {
                throw new InvalidOperationException($"User with NIC '{cleanNic}' already exists.");
            }

            // Inline comment: Validate email uniqueness
            var existingEmail = await _userRepository.FindOneAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());
            if (existingEmail != null)
            {
                throw new InvalidOperationException($"User with email '{request.Email}' already exists.");
            }

            var passwordHash = PasswordHasher.HashPassword(request.Password);

            var newUser = new User
            {
                Nic = cleanNic,
                FullName = request.FullName.Trim(),
                Email = request.Email.Trim().ToLower(),
                PasswordHash = passwordHash,
                Role = request.Role,
                Phone = request.Phone.Trim(),
                Address = request.Address.Trim(),
                Status = "Active",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _userRepository.InsertAsync(newUser);
            return MapToUserDto(newUser);
        }

        /// <summary>
        /// Updates profile information for a user.
        /// </summary>
        public async Task<UserDto> UpdateUserProfileAsync(string nic, UpdateUserProfileDto request)
        {
            // Inline comment: Fetch existing user by NIC
            var cleanNic = nic.Trim().ToUpperInvariant();
            var user = await _userRepository.FindOneAsync(u => u.Nic.ToUpper() == cleanNic);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with NIC '{nic}' not found.");
            }

            user.FullName = request.FullName.Trim();
            if (!string.IsNullOrEmpty(request.Email))
            {
                user.Email = request.Email.Trim().ToLower();
            }
            user.Phone = request.Phone.Trim();
            user.Address = request.Address.Trim();
            if (request.SolarCapacityKWh.HasValue)
            {
                user.SolarCapacityKWh = request.SolarCapacityKWh.Value;
            }
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user.Id!, user);
            return MapToUserDto(user);
        }

        /// <summary>
        /// Deactivates a user account (Can be requested by self or Backoffice).
        /// </summary>
        public async Task<UserDto> DeactivateUserAsync(string nic, string requestedByRole)
        {
            // Inline comment: Locate user and set status to Deactivated
            var cleanNic = nic.Trim().ToUpperInvariant();
            var user = await _userRepository.FindOneAsync(u => u.Nic.ToUpper() == cleanNic);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with NIC '{nic}' not found.");
            }

            user.Status = "Deactivated";
            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user.Id!, user);
            return MapToUserDto(user);
        }

        /// <summary>
        /// Reactivates a deactivated user account.
        /// CRITICAL BUSINESS RULE: Deactivated accounts can ONLY be reactivated by a Backoffice officer.
        /// </summary>
        public async Task<UserDto> ReactivateUserAsync(string nic, string requestedByRole)
        {
            // Inline comment: Enforce rule that only Backoffice can reactivate
            if (!string.Equals(requestedByRole, "Backoffice", StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException("Forbidden: Deactivated accounts can ONLY be reactivated by a Backoffice officer.");
            }

            var cleanNic = nic.Trim().ToUpperInvariant();
            var user = await _userRepository.FindOneAsync(u => u.Nic.ToUpper() == cleanNic);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with NIC '{nic}' not found.");
            }

            user.Status = "Active";
            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user.Id!, user);
            return MapToUserDto(user);
        }

        /// <summary>
        /// Returns all user accounts awaiting activation.
        /// </summary>
        public async Task<List<UserDto>> GetPendingActivationsAsync()
        {
            // Inline comment: Find users with status PendingActivation
            var users = await _userRepository.FindAsync(u => u.Status == "PendingActivation");
            return users.Select(MapToUserDto).ToList();
        }

        /// <summary>
        /// Approves a pending user registration.
        /// </summary>
        public async Task<UserDto> ApprovePendingActivationAsync(string nic, string requestedByRole)
        {
            // Inline comment: Approve user activation
            if (!string.Equals(requestedByRole, "Backoffice", StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException("Only Backoffice officers can approve account activations.");
            }

            var cleanNic = nic.Trim().ToUpperInvariant();
            var user = await _userRepository.FindOneAsync(u => u.Nic.ToUpper() == cleanNic);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with NIC '{nic}' not found.");
            }

            user.Status = "Active";
            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user.Id!, user);
            return MapToUserDto(user);
        }

        /// <summary>
        /// Helper mapper to convert User entity to UserDto.
        /// </summary>
        private static UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Nic = user.Nic,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
                Phone = user.Phone,
                Address = user.Address,
                Status = user.Status,
                IsActive = user.IsActive,
                SolarCapacityKWh = user.SolarCapacityKWh,
                CreatedAt = user.CreatedAt
            };
        }
    }
}
