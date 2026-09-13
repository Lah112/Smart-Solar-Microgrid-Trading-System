/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: UsersController.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Controller for user management, role assignments, and Backoffice reactivation.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartSolar.API.DTOs;
using SmartSolar.API.Services;

namespace SmartSolar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        /// <summary>
        /// Constructor injecting IUserService.
        /// </summary>
        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Gets all system users with optional role and status filters (Backoffice only).
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> GetAllUsers([FromQuery] string? role, [FromQuery] string? status)
        {
            // Inline comment: Return filtered list of users
            var users = await _userService.GetAllUsersAsync(role, status);
            return Ok(users);
        }

        /// <summary>
        /// Gets a single user profile by NIC primary key.
        /// </summary>
        [HttpGet("{nic}")]
        [Authorize]
        public async Task<IActionResult> GetUserByNic(string nic)
        {
            // Inline comment: Retrieve user details by NIC
            var user = await _userService.GetUserByNicAsync(nic);
            if (user == null)
                return NotFound(new { message = $"User with NIC '{nic}' not found." });

            return Ok(user);
        }

        /// <summary>
        /// Creates a new Backoffice or Grid Operator staff account (Backoffice only).
        /// </summary>
        [HttpPost("staff")]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> CreateStaffUser([FromBody] CreateStaffUserDto request)
        {
            // Inline comment: Create staff user record
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdUser = await _userService.CreateStaffUserAsync(request);
            return CreatedAtAction(nameof(GetUserByNic), new { nic = createdUser.Nic }, createdUser);
        }

        /// <summary>
        /// Updates a user's profile information.
        /// </summary>
        [HttpPut("{nic}/profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile(string nic, [FromBody] UpdateUserProfileDto request)
        {
            // Inline comment: Update user profile
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updatedUser = await _userService.UpdateUserProfileAsync(nic, request);
            return Ok(updatedUser);
        }

        /// <summary>
        /// Deactivates a user account.
        /// </summary>
        [HttpPut("{nic}/deactivate")]
        [Authorize]
        public async Task<IActionResult> DeactivateUser(string nic)
        {
            // Inline comment: Deactivate account
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Prosumer";
            var result = await _userService.DeactivateUserAsync(nic, role);
            return Ok(result);
        }

        /// <summary>
        /// Reactivates a deactivated user account.
        /// CRITICAL BUSINESS RULE: Deactivated accounts can ONLY be reactivated by a Backoffice officer.
        /// </summary>
        [HttpPut("{nic}/reactivate")]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> ReactivateUser(string nic)
        {
            // Inline comment: Enforce Backoffice officer role check and reactivate account
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Backoffice";
            var result = await _userService.ReactivateUserAsync(nic, role);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves prosumer registrations pending Backoffice activation.
        /// </summary>
        [HttpGet("pending-activations")]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> GetPendingActivations()
        {
            // Inline comment: List all pending user registrations
            var pending = await _userService.GetPendingActivationsAsync();
            return Ok(pending);
        }

        /// <summary>
        /// Approves a pending user activation (Backoffice only).
        /// </summary>
        [HttpPut("{nic}/approve")]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> ApproveActivation(string nic)
        {
            // Inline comment: Approve user activation
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Backoffice";
            var result = await _userService.ApprovePendingActivationAsync(nic, role);
            return Ok(result);
        }
    }
}
