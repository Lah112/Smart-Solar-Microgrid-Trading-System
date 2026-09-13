/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: SlotDtos.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Data Transfer Objects for Energy Booking Slots.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System;
using System.ComponentModel.DataAnnotations;

namespace SmartSolar.API.DTOs
{
    /// <summary>
    /// DTO for creating a new booking time slot for a solar station.
    /// </summary>
    public class CreateSlotDto
    {
        [Required]
        public string StationId { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public string StartTime { get; set; } = "09:00";

        [Required]
        public string EndTime { get; set; } = "10:00";

        public string SlotType { get; set; } = "DropOff"; // "DropOff" or "Charging"

        public double MaxCapacityKWh { get; set; } = 50.0;
        public int TotalSlots { get; set; } = 5;
    }

    /// <summary>
    /// DTO for updating slot capacity or slot availability.
    /// </summary>
    public class UpdateSlotDto
    {
        public double MaxCapacityKWh { get; set; }
        public int TotalSlots { get; set; }
        public string Status { get; set; } = "Available";
    }
}
