/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: StationsController.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Controller exposing Microgrid Node management and GPS locator endpoints.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartSolar.API.DTOs;
using SmartSolar.API.Services;

namespace SmartSolar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StationsController : ControllerBase
    {
        private readonly IStationService _stationService;

        /// <summary>
        /// Constructor injecting IStationService.
        /// </summary>
        public StationsController(IStationService stationService)
        {
            _stationService = stationService;
        }

        /// <summary>
        /// Retrieves all microgrid stations, optionally filtered by active state.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllStations([FromQuery] bool? activeOnly)
        {
            // Inline comment: Query all stations
            var stations = await _stationService.GetAllStationsAsync(activeOnly);
            return Ok(stations);
        }

        /// <summary>
        /// Retrieves a station by its MongoDB ObjectId.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStationById(string id)
        {
            // Inline comment: Find station by ObjectId
            var station = await _stationService.GetStationByIdAsync(id);
            if (station == null)
                return NotFound(new { message = $"Station with ID '{id}' not found." });

            return Ok(station);
        }

        /// <summary>
        /// Retrieves a station by its code (e.g. HUB-CMB-01).
        /// </summary>
        [HttpGet("code/{code}")]
        public async Task<IActionResult> GetStationByCode(string code)
        {
            // Inline comment: Find station by station code
            var station = await _stationService.GetStationByCodeAsync(code);
            if (station == null)
                return NotFound(new { message = $"Station with code '{code}' not found." });

            return Ok(station);
        }

        /// <summary>
        /// Finds nearby solar stations within a given radius based on GPS coordinates.
        /// </summary>
        [HttpGet("nearby")]
        public async Task<IActionResult> GetNearbyStations(
            [FromQuery] double latitude,
            [FromQuery] double longitude,
            [FromQuery] double radiusKm = 50)
        {
            // Inline comment: Query stations sorted by distance from coordinates
            var nearbyStations = await _stationService.GetNearbyStationsAsync(latitude, longitude, radiusKm);
            return Ok(nearbyStations);
        }

        /// <summary>
        /// Creates a new solar microgrid station node (Backoffice only).
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> CreateStation([FromBody] CreateStationDto request)
        {
            // Inline comment: Create new station entity
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdStation = await _stationService.CreateStationAsync(request);
            return CreatedAtAction(nameof(GetStationById), new { id = createdStation.Id }, createdStation);
        }

        /// <summary>
        /// Updates solar station specifications, capacity, or schedule (Backoffice only).
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> UpdateStation(string id, [FromBody] UpdateStationDto request)
        {
            // Inline comment: Update station specifications
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updatedStation = await _stationService.UpdateStationAsync(id, request);
            return Ok(updatedStation);
        }

        /// <summary>
        /// Deactivates a solar station node.
        /// CRITICAL BUSINESS RULE: Deactivation is BLOCKED if active energy reservations exist.
        /// </summary>
        [HttpPut("{id}/deactivate")]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> DeactivateStation(string id)
        {
            // Inline comment: Deactivate station with active reservation guard
            var result = await _stationService.DeactivateStationAsync(id);
            return Ok(new { success = result, message = "Station deactivated successfully." });
        }

        /// <summary>
        /// Reactivates an inactive solar station node (Backoffice only).
        /// </summary>
        [HttpPut("{id}/reactivate")]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> ReactivateStation(string id)
        {
            // Inline comment: Reactivate station
            var result = await _stationService.ReactivateStationAsync(id);
            return Ok(new { success = result, message = "Station reactivated successfully." });
        }

        /// <summary>
        /// Updates the available battery slot count for a station (Grid Operator / Backoffice).
        /// </summary>
        [HttpPut("{id}/battery-slots")]
        [Authorize(Roles = "Backoffice,GridOperator")]
        public async Task<IActionResult> UpdateBatterySlots(string id, [FromQuery] int availableSlots)
        {
            // Inline comment: Update battery slot count
            var updated = await _stationService.UpdateBatterySlotsAsync(id, availableSlots);
            return Ok(updated);
        }
    }
}
