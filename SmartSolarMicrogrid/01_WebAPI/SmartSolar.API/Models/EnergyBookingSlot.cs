/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: EnergyBookingSlot.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Data entity for energy trading time slots per station and date in MongoDB.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace SmartSolar.API.Models
{
    /// <summary>
    /// Represents a discrete energy booking time slot for a solar station.
    /// </summary>
    public class EnergyBookingSlot
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("stationId")]
        public string StationId { get; set; } = string.Empty;

        [BsonElement("stationCode")]
        public string StationCode { get; set; } = string.Empty;

        [BsonElement("date")]
        public DateTime Date { get; set; }

        [BsonElement("startTime")]
        public string StartTime { get; set; } = "09:00";

        [BsonElement("endTime")]
        public string EndTime { get; set; } = "10:00";

        /// <summary>
        /// SlotType: "DropOff" (prosumer sends solar to grid) or "Charging" (prosumer charges from grid)
        /// </summary>
        [BsonElement("slotType")]
        public string SlotType { get; set; } = "DropOff";

        [BsonElement("maxCapacityKWh")]
        public double MaxCapacityKWh { get; set; } = 50.0;

        [BsonElement("bookedCapacityKWh")]
        public double BookedCapacityKWh { get; set; } = 0.0;

        [BsonElement("totalSlots")]
        public int TotalSlots { get; set; } = 5;

        [BsonElement("bookedSlots")]
        public int BookedSlots { get; set; } = 0;

        /// <summary>
        /// Status: "Available", "Full", "Closed"
        /// </summary>
        [BsonElement("status")]
        public string Status { get; set; } = "Available";
    }
}
