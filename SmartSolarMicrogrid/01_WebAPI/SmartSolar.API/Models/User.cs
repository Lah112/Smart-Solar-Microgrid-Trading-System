/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: User.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Data entity representing system users (Backoffice, Grid Operator, Prosumer) in MongoDB.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace SmartSolar.API.Models
{
    /// <summary>
    /// Represents a user entity stored in the Users collection.
    /// Uses NIC as the business primary key / unique identifier.
    /// </summary>
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        /// <summary>
        /// National Identity Card (NIC) - Used as the unique identifier for prosumers and users.
        /// </summary>
        [BsonElement("nic")]
        public string Nic { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("fullName")]
        public string FullName { get; set; } = string.Empty;

        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; } = string.Empty;

        /// <summary>
        /// Role: "Backoffice", "GridOperator", or "Prosumer"
        /// </summary>
        [BsonElement("role")]
        public string Role { get; set; } = "Prosumer";

        [BsonElement("phone")]
        public string Phone { get; set; } = string.Empty;

        [BsonElement("address")]
        public string Address { get; set; } = string.Empty;

        /// <summary>
        /// Status: "Active", "PendingActivation", "Deactivated"
        /// </summary>
        [BsonElement("status")]
        public string Status { get; set; } = "Active";

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

        [BsonElement("solarCapacityKWh")]
        public double? SolarCapacityKWh { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
