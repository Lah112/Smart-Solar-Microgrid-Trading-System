/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: EnergyReservation.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Data entity for prosumer energy drop-off and charging reservations in MongoDB.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace SmartSolar.API.Models
{
    /// <summary>
    /// Represents an energy trading reservation made by a prosumer.
    /// Manages state lifecycle: Pending -> Approved -> Completed / Cancelled.
    /// </summary>
    public class EnergyReservation
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("reservationNumber")]
        public string ReservationNumber { get; set; } = string.Empty;

        /// <summary>
        /// Prosumer's National Identity Card (NIC) as key
        /// </summary>
        [BsonElement("prosumerNic")]
        public string ProsumerNic { get; set; } = string.Empty;

        [BsonElement("prosumerName")]
        public string ProsumerName { get; set; } = string.Empty;

        [BsonElement("prosumerPhone")]
        public string ProsumerPhone { get; set; } = string.Empty;

        [BsonElement("stationId")]
        public string StationId { get; set; } = string.Empty;

        [BsonElement("stationCode")]
        public string StationCode { get; set; } = string.Empty;

        [BsonElement("stationName")]
        public string StationName { get; set; } = string.Empty;

        [BsonElement("slotId")]
        public string? SlotId { get; set; }

        [BsonElement("reservationDate")]
        public DateTime ReservationDate { get; set; }

        [BsonElement("startTime")]
        public string StartTime { get; set; } = "09:00";

        [BsonElement("endTime")]
        public string EndTime { get; set; } = "10:00";

        /// <summary>
        /// TransferType: "DropOff_SolarEnergy" or "Charging"
        /// </summary>
        [BsonElement("transferType")]
        public string TransferType { get; set; } = "DropOff_SolarEnergy";

        [BsonElement("energyAmountKWh")]
        public double EnergyAmountKWh { get; set; }

        [BsonElement("unitRate")]
        public decimal UnitRate { get; set; }

        [BsonElement("totalAmount")]
        public decimal TotalAmount { get; set; }

        /// <summary>
        /// Status: "Pending", "Approved", "Completed", "Cancelled"
        /// </summary>
        [BsonElement("status")]
        public string Status { get; set; } = "Pending";

        /// <summary>
        /// Unique secure token string encoded in the QR code
        /// </summary>
        [BsonElement("qrCodeToken")]
        public string? QrCodeToken { get; set; }

        /// <summary>
        /// JSON string representation of verified QR payload
        /// </summary>
        [BsonElement("qrCodePayload")]
        public string? QrCodePayload { get; set; }

        [BsonElement("completedAt")]
        public DateTime? CompletedAt { get; set; }

        [BsonElement("completedByOperatorNic")]
        public string? CompletedByOperatorNic { get; set; }

        [BsonElement("notes")]
        public string? Notes { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
