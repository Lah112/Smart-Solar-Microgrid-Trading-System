/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: DatabaseSettings.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Configuration model for MongoDB connection string and database name.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

namespace SmartSolar.API.Models
{
    /// <summary>
    /// Holds MongoDB connection settings mapped from appsettings.json.
    /// </summary>
    public class DatabaseSettings
    {
        public string ConnectionString { get; set; } = "mongodb://localhost:27017";
        public string DatabaseName { get; set; } = "SmartSolarDb";
        public string UsersCollectionName { get; set; } = "Users";
        public string SolarStationsCollectionName { get; set; } = "SolarStationInfo";
        public string BookingSlotsCollectionName { get; set; } = "EnergyBookingSlots";
        public string ReservationsCollectionName { get; set; } = "EnergyReservations";
    }
}
