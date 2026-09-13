/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: DashboardController.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Controller exposing aggregated metrics and KPI statistics for operational dashboards.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartSolar.API.Services;

namespace SmartSolar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IReservationService _reservationService;

        /// <summary>
        /// Constructor injecting IReservationService.
        /// </summary>
        public DashboardController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        /// <summary>
        /// Retrieves aggregated KPI counts and trading statistics for dashboards.
        /// </summary>
        [HttpGet("stats")]
        [Authorize]
        public async Task<IActionResult> GetStats()
        {
            // Inline comment: Fetch live operational KPI summary from database
            var stats = await _reservationService.GetDashboardStatsAsync();
            return Ok(stats);
        }
    }
}
