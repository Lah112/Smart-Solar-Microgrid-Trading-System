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
        Task<List<SolarStationInfo>> GetAllStationsAsync(bool? activeOnly = null);
        Task<SolarStationInfo?> GetStationByIdAsync(string id);
        Task<SolarStationInfo?> GetStationByCodeAsync(string stationCode);
        Task<SolarStationInfo> CreateStationAsync(CreateStationDto request);
        Task<SolarStationInfo> UpdateStationAsync(string id, UpdateStationDto request);
        Task<bool> DeactivateStationAsync(string id);
        Task<bool> ReactivateStationAsync(string id);
        Task<List<StationResponseDto>> GetNearbyStationsAsync(double latitude, double longitude, double radiusKm = 50);
        Task<SolarStationInfo> UpdateBatterySlotsAsync(string id, int availableSlots);
    }
}
