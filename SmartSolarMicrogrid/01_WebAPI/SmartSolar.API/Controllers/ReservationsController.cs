/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: ReservationsController.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Controller exposing reservation workflow, 7-day & 12-hour validation, and QR dispatch/verification.
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
    public class ReservationsController : ControllerBase
    {
        private readonly IReservationService _reservationService;

        /// <summary>
        /// Constructor injecting IReservationService.
        /// </summary>
        public ReservationsController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        /// <summary>
        /// Queries reservations with dynamic filters, status, date ranges, and search keywords.
        /// </summary>
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetReservations([FromQuery] ReservationFilterDto filter)
        {
            // Inline comment: Query reservations with filter criteria
            var reservations = await _reservationService.GetReservationsAsync(filter);
            return Ok(reservations);
        }

        /// <summary>
        /// Retrieves a reservation by its MongoDB ObjectId.
        /// </summary>
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetReservationById(string id)
        {
            // Inline comment: Retrieve reservation by ID
            var reservation = await _reservationService.GetReservationByIdAsync(id);
            if (reservation == null)
                return NotFound(new { message = $"Reservation with ID '{id}' not found." });

            return Ok(reservation);
        }

        /// <summary>
        /// Retrieves reservations history for a prosumer by NIC.
        /// </summary>
        [HttpGet("prosumer/{nic}")]
        [Authorize]
        public async Task<IActionResult> GetProsumerReservations(string nic, [FromQuery] string? status)
        {
            // Inline comment: Query prosumer booking history
            var reservations = await _reservationService.GetProsumerReservationsAsync(nic, status);
            return Ok(reservations);
        }

        /// <summary>
        /// Creates a new power trading reservation.
        /// CRITICAL BUSINESS RULE: Must be scheduled within 7 days.
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReservation([FromBody] CreateReservationDto request)
        {
            // Inline comment: Create reservation and enforce 7-day rule
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var summary = await _reservationService.CreateReservationAsync(request);
            return Ok(summary);
        }

        /// <summary>
        /// Modifies an existing energy reservation.
        /// CRITICAL BUSINESS RULE: Updates require at least 12 hours' notice prior to slot start time.
        /// </summary>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateReservation(string id, [FromBody] UpdateReservationDto request)
        {
            // Inline comment: Modify reservation and enforce 12-hour rule
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userNic = User.FindFirst("nic")?.Value ?? string.Empty;
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Prosumer";

            var summary = await _reservationService.UpdateReservationAsync(id, request, userNic, role);
            return Ok(summary);
        }

        /// <summary>
        /// Cancels an existing energy reservation.
        /// CRITICAL BUSINESS RULE: Cancellations require at least 12 hours' notice prior to slot start time.
        /// </summary>
        [HttpPut("{id}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelReservation(string id, [FromBody] CancelReservationDto request)
        {
            // Inline comment: Cancel reservation and enforce 12-hour rule
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userNic = User.FindFirst("nic")?.Value ?? string.Empty;
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Prosumer";

            var summary = await _reservationService.CancelReservationAsync(id, request, userNic, role);
            return Ok(summary);
        }

        /// <summary>
        /// Approves a pending reservation and generates QR dispatch (Backoffice or Operator).
        /// </summary>
        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Backoffice,GridOperator")]
        public async Task<IActionResult> ApproveReservation(string id)
        {
            // Inline comment: Approve reservation
            var summary = await _reservationService.ApproveReservationAsync(id);
            return Ok(summary);
        }

        /// <summary>
        /// Scans and verifies a QR code to finalize energy transfer.
        /// CRITICAL BUSINESS RULE: Grid Operator scans QR, server verifies, marks status Completed.
        /// </summary>
        [HttpPost("verify-qr")]
        [Authorize(Roles = "Backoffice,GridOperator")]
        public async Task<IActionResult> VerifyQr([FromBody] VerifyQrDto request)
        {
            // Inline comment: Verify QR and finalize energy transfer transaction
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var operatorNic = User.FindFirst("nic")?.Value ?? "OPERATOR001";
            var summary = await _reservationService.VerifyAndFinalizeQrAsync(request, operatorNic);
            return Ok(summary);
        }
    }
}
