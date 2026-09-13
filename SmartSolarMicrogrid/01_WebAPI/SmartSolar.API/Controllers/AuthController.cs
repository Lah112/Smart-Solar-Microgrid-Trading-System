/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: AuthController.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Controller exposing authentication, registration, and user session endpoints.
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
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        /// <summary>
        /// Constructor injecting IAuthService.
        /// </summary>
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Authenticates user (Backoffice, Grid Operator, Prosumer) and issues JWT.
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            // Inline comment: Validate model and authenticate credentials
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }

        /// <summary>
        /// Registers a new solar prosumer using NIC as primary key.
        /// </summary>
        [HttpPost("register-prosumer")]
        public async Task<IActionResult> RegisterProsumer([FromBody] RegisterProsumerDto request)
        {
            // Inline comment: Validate prosumer registration payload
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.RegisterProsumerAsync(request);
            return CreatedAtAction(nameof(GetProfile), new { nic = result.Nic }, result);
        }

        /// <summary>
        /// Retrieves the current authenticated user profile.
        /// </summary>
        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            // Inline comment: Extract user NIC from JWT claims
            var nic = User.FindFirst("nic")?.Value;
            if (string.IsNullOrEmpty(nic))
                return Unauthorized();

            var profile = await _authService.GetCurrentUserProfileAsync(nic);
            return Ok(profile);
        }
    }
}
