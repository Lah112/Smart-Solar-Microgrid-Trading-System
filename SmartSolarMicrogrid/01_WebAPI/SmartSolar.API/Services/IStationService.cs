/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: IStationService.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Interface defining Microgrid Node management contracts and GPS distance queries.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System.Collections.Generic;
using System.Threading.Tasks;
using SmartSolar.API.DTOs;
using SmartSolar.API.Models;

namespace SmartSolar.API.Services
{
    /// <summary>
    /// Contract for Microgrid Solar Station service operations.
    /// </summary>
    public interface IStationService
    {
        // Retrieves all stations, optionally limited to active stations.
        Task<List<SolarStationInfo>> GetAllStationsAsync(bool? activeOnly = null);
        // Retrieves a station by its database ID.
        Task<SolarStationInfo?> GetStationByIdAsync(string id);
        // Retrieves a station by its station code.
        Task<SolarStationInfo?> GetStationByCodeAsync(string stationCode);
        // Creates a solar station.
        Task<SolarStationInfo> CreateStationAsync(CreateStationDto request);
        // Updates an existing solar station.
        Task<SolarStationInfo> UpdateStationAsync(string id, UpdateStationDto request);
        // Deactivates a station when business rules permit.
        Task<bool> DeactivateStationAsync(string id);
        // Reactivates a station.
        Task<bool> ReactivateStationAsync(string id);
        // Retrieves nearby stations within the requested radius.
        Task<List<StationResponseDto>> GetNearbyStationsAsync(double latitude, double longitude, double radiusKm = 50);
        // Updates the number of available battery slots.
        Task<SolarStationInfo> UpdateBatterySlotsAsync(string id, int availableSlots);
    }
}
