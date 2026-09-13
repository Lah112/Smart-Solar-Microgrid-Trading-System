/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: StationDtos.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Data Transfer Objects for Microgrid Solar Station nodes.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using SmartSolar.API.Models;

namespace SmartSolar.API.DTOs
{
    /// <summary>
    /// DTO for registering or creating a new Solar Microgrid station.
    /// </summary>
    public class CreateStationDto
    {
        [Required(ErrorMessage = "Station code is required")]
        public string StationCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Station name is required")]
        public string Name { get; set; } = string.Empty;

        public string LocationDescription { get; set; } = string.Empty;

        [Required]
        [Range(-90.0, 90.0, ErrorMessage = "Latitude must be between -90 and 90")]
        public double Latitude { get; set; }

        [Required]
        [Range(-180.0, 180.0, ErrorMessage = "Longitude must be between -180 and 180")]
        public double Longitude { get; set; }

        [Required]
        [Range(1.0, 10000.0, ErrorMessage = "Capacity must be positive (kW/h)")]
        public double CapacityKWh { get; set; }

        [Required]
        [Range(1, 100, ErrorMessage = "Battery slots must be at least 1")]
        public int TotalBatterySlots { get; set; }

        public decimal UnitRateBuy { get; set; } = 48.50m;
        public decimal UnitRateSell { get; set; } = 56.00m;

        public StationSchedule Schedule { get; set; } = new StationSchedule();
    }

    /// <summary>
    /// DTO for updating an existing station's details, capacity, or schedule.
    /// </summary>
    public class UpdateStationDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string LocationDescription { get; set; } = string.Empty;

        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double CapacityKWh { get; set; }
        public int TotalBatterySlots { get; set; }
        public int AvailableBatterySlots { get; set; }
        public decimal UnitRateBuy { get; set; }
        public decimal UnitRateSell { get; set; }
        public StationSchedule Schedule { get; set; } = new StationSchedule();
        public bool IsActive { get; set; } = true;
    }

    /// <summary>
    /// DTO for station details including distance when querying nearby nodes.
    /// </summary>
    public class StationResponseDto : SolarStationInfo
    {
        public double? DistanceKm { get; set; }
        public int ActiveReservationsCount { get; set; }
    }
}
