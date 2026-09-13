/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: BookingSlotsController.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Controller exposing time slot queries and availability for solar hubs.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartSolar.API.DTOs;
using SmartSolar.API.Services;

namespace SmartSolar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingSlotsController : ControllerBase
    {
        private readonly IBookingSlotService _slotService;

        /// <summary>
        /// Constructor injecting IBookingSlotService.
        /// </summary>
        public BookingSlotsController(IBookingSlotService slotService)
        {
            _slotService = slotService;
        }

        /// <summary>
        /// Retrieves available energy booking slots for a given station and date.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetSlots([FromQuery] string stationId, [FromQuery] DateTime? date)
        {
            // Inline comment: Query slots for station on requested date (defaults to today)
            if (string.IsNullOrEmpty(stationId))
                return BadRequest(new { message = "Station ID is required." });

            var targetDate = date ?? DateTime.UtcNow.Date;
            var slots = await _slotService.GetSlotsByStationAndDateAsync(stationId, targetDate);
            return Ok(slots);
        }

        /// <summary>
        /// Creates a new booking slot (Backoffice or Grid Operator).
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Backoffice,GridOperator")]
        public async Task<IActionResult> CreateSlot([FromBody] CreateSlotDto request)
        {
            // Inline comment: Create new slot
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _slotService.CreateSlotAsync(request);
            return Ok(created);
        }

        /// <summary>
        /// Updates an existing slot's limits and status.
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Backoffice,GridOperator")]
        public async Task<IActionResult> UpdateSlot(string id, [FromBody] UpdateSlotDto request)
        {
            // Inline comment: Update slot
            var updated = await _slotService.UpdateSlotAsync(id, request);
            return Ok(updated);
        }

        /// <summary>
        /// Deletes a booking slot.
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Backoffice,GridOperator")]
        public async Task<IActionResult> DeleteSlot(string id)
        {
            // Inline comment: Delete slot
            var result = await _slotService.DeleteSlotAsync(id);
            return Ok(new { success = result });
        }
    }
}
