/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: AuthService.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Implements authentication, NIC-based credential verification, and prosumer registration.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System;
using System.Threading.Tasks;
using SmartSolar.API.DTOs;
using SmartSolar.API.Helpers;
using SmartSolar.API.Models;
using SmartSolar.API.Repositories;

namespace SmartSolar.API.Services
{
    /// <summary>
    /// Service handling user authentication and registration workflows.
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly IMongoRepository<User> _userRepository;
        private readonly JwtHelper _jwtHelper;

        /// <summary>
        /// Constructor for AuthService with repository and JWT helper dependencies.
        /// </summary>
        public AuthService(IMongoRepository<User> userRepository, JwtHelper jwtHelper)
        {
            _userRepository = userRepository;
            _jwtHelper = jwtHelper;
        }

        /// <summary>
        /// Authenticates a user by username (NIC or Email) and password, returning JWT and user profile.
        /// </summary>
        /// <param name="request">Login credentials containing Username (NIC/Email) and Password.</param>
        /// <returns>LoginResponseDto containing token and profile.</returns>
        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            // Inline comment: Search user by NIC or Email (case-insensitive)
            var cleanUsername = request.Username.Trim().ToUpperInvariant();
            var user = await _userRepository.FindOneAsync(u => 
                u.Nic.ToUpper() == cleanUsername || u.Email.ToLower() == request.Username.Trim().ToLower());

            if (user == null)
            {
                throw new UnauthorizedAccessException("Invalid credentials. Please check your NIC/Email and password.");
            }

            // Inline comment: Check if user account is deactivated
            if (user.Status == "Deactivated" || !user.IsActive)
            {
                throw new InvalidOperationException("This account has been deactivated. Please contact a Backoffice administrator for reactivation.");
            }

            // Inline comment: Verify password hash against stored BCrypt hash
            var isPasswordValid = PasswordHasher.VerifyPassword(request.Password, user.PasswordHash);
            if (!isPasswordValid)
            {
                throw new UnauthorizedAccessException("Invalid credentials. Please check your password.");
            }

            // Inline comment: Generate JWT token with user claims
            var token = _jwtHelper.GenerateToken(user, out var expiresAt);

            return new LoginResponseDto
            {
                Token = token,
                Nic = user.Nic,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Status = user.Status,
                Phone = user.Phone,
                Address = user.Address,
                SolarCapacityKWh = user.SolarCapacityKWh,
                ExpiresAt = expiresAt
            };
        }

        /// <summary>
        /// Registers a new Solar Prosumer with NIC as the primary identifier.
        /// </summary>
        /// <param name="request">Prosumer registration information.</param>
        /// <returns>Created UserDto object.</returns>
        public async Task<UserDto> RegisterProsumerAsync(RegisterProsumerDto request)
        {
            // Inline comment: Validate uniqueness of NIC as the primary business key
            var cleanNic = request.Nic.Trim().ToUpperInvariant();
            var existingNic = await _userRepository.FindOneAsync(u => u.Nic.ToUpper() == cleanNic);
            if (existingNic != null)
            {
                throw new InvalidOperationException($"A user with NIC '{cleanNic}' already exists in the system.");
            }

            // Inline comment: Validate uniqueness of Email
            var existingEmail = await _userRepository.FindOneAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());
            if (existingEmail != null)
            {
                throw new InvalidOperationException($"A user with email '{request.Email}' is already registered.");
            }

            // Inline comment: Hash password securely
            var passwordHash = PasswordHasher.HashPassword(request.Password);

            var newUser = new User
            {
                Nic = cleanNic,
                FullName = request.FullName.Trim(),
                Email = request.Email.Trim().ToLower(),
                PasswordHash = passwordHash,
                Role = "Prosumer",
                Phone = request.Phone.Trim(),
                Address = request.Address.Trim(),
                Status = "Active", // Prosumers are active upon registration
                IsActive = true,
                SolarCapacityKWh = request.SolarCapacityKWh ?? 5.0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _userRepository.InsertAsync(newUser);

            return MapToUserDto(newUser);
        }

        /// <summary>
        /// Retrieves the current user's profile by NIC.
        /// </summary>
        /// <param name="nic">National Identity Card number.</param>
        /// <returns>UserDto profile.</returns>
        public async Task<UserDto> GetCurrentUserProfileAsync(string nic)
        {
            // Inline comment: Find user entity by NIC
            var cleanNic = nic.Trim().ToUpperInvariant();
            var user = await _userRepository.FindOneAsync(u => u.Nic.ToUpper() == cleanNic);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with NIC '{nic}' not found.");
            }

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
