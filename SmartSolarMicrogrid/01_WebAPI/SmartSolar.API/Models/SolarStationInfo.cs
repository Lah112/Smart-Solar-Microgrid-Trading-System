/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: SolarStationInfo.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Data entity for solar microgrid hubs including GPS coordinates, kW/h capacity, battery slots, and schedule.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace SmartSolar.API.Models
{
    /// <summary>
    /// Represents operational schedule details for a solar microgrid station.
    /// </summary>
    public class StationSchedule
    {
        [BsonElement("openTime")]
        public string OpenTime { get; set; } = "06:00";

        [BsonElement("closeTime")]
        public string CloseTime { get; set; } = "22:00";

        [BsonElement("operatingDays")]
        public List<string> OperatingDays { get; set; } = new List<string>
        {
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
        };
    }

    /// <summary>
    /// Represents a solar grid hub entity stored in the SolarStationInfo collection.
    /// </summary>
    public class SolarStationInfo
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("stationCode")]
        public string StationCode { get; set; } = string.Empty;

        [BsonElement("name")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("locationDescription")]
        public string LocationDescription { get; set; } = string.Empty;

        [BsonElement("latitude")]
        public double Latitude { get; set; }

        [BsonElement("longitude")]
        public double Longitude { get; set; }

        [BsonElement("capacityKWh")]
        public double CapacityKWh { get; set; }

        [BsonElement("currentStoredKWh")]
        public double CurrentStoredKWh { get; set; }

        [BsonElement("totalBatterySlots")]
        public int TotalBatterySlots { get; set; }

        [BsonElement("availableBatterySlots")]
        public int AvailableBatterySlots { get; set; }

        [BsonElement("unitRateBuy")]
        public decimal UnitRateBuy { get; set; } = 48.50m;

        [BsonElement("unitRateSell")]
        public decimal UnitRateSell { get; set; } = 56.00m;

        [BsonElement("schedule")]
        public StationSchedule Schedule { get; set; } = new StationSchedule();

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
