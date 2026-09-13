/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: StationService.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Implementation of Microgrid Node management with GPS queries and deactivation business rules.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartSolar.API.DTOs;
using SmartSolar.API.Models;
using SmartSolar.API.Repositories;

namespace SmartSolar.API.Services
{
    /// <summary>
    /// Service managing solar microgrid stations, battery slots, and operational constraints.
    /// </summary>
    public class StationService : IStationService
    {
        private readonly IMongoRepository<SolarStationInfo> _stationRepository;
        private readonly IMongoRepository<EnergyReservation> _reservationRepository;

        /// <summary>
        /// Constructor for StationService.
        /// </summary>
        public StationService(
            IMongoRepository<SolarStationInfo> stationRepository,
            IMongoRepository<EnergyReservation> reservationRepository)
        {
            _stationRepository = stationRepository;
            _reservationRepository = reservationRepository;
        }

        /// <summary>
        /// Retrieves all solar stations, optionally filtering by active state.
        /// </summary>
        public async Task<List<SolarStationInfo>> GetAllStationsAsync(bool? activeOnly = null)
        {
            // Inline comment: Query all stations or active only
            if (activeOnly.HasValue)
            {
                return await _stationRepository.FindAsync(s => s.IsActive == activeOnly.Value);
            }
            return await _stationRepository.GetAllAsync();
        }

        /// <summary>
        /// Retrieves a single station by its MongoDB ObjectId.
        /// </summary>
        public async Task<SolarStationInfo?> GetStationByIdAsync(string id)
        {
            // Inline comment: Find station by ObjectId
            return await _stationRepository.GetByIdAsync(id);
        }

        /// <summary>
        /// Retrieves a station by its unique station code (e.g. HUB-CMB-01).
        /// </summary>
        public async Task<SolarStationInfo?> GetStationByCodeAsync(string stationCode)
        {
            // Inline comment: Find station by unique code
            var cleanCode = stationCode.Trim().ToUpperInvariant();
            return await _stationRepository.FindOneAsync(s => s.StationCode.ToUpper() == cleanCode);
        }

        /// <summary>
        /// Creates a new Solar Microgrid Node hub.
        /// </summary>
        public async Task<SolarStationInfo> CreateStationAsync(CreateStationDto request)
        {
            // Inline comment: Check if station code is already registered
            var cleanCode = request.StationCode.Trim().ToUpperInvariant();
            var existing = await _stationRepository.FindOneAsync(s => s.StationCode.ToUpper() == cleanCode);
            if (existing != null)
            {
                throw new InvalidOperationException($"A station with code '{cleanCode}' already exists.");
            }

            var newStation = new SolarStationInfo
            {
                StationCode = cleanCode,
                Name = request.Name.Trim(),
                LocationDescription = request.LocationDescription.Trim(),
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                CapacityKWh = request.CapacityKWh,
                CurrentStoredKWh = 0.0,
                TotalBatterySlots = request.TotalBatterySlots,
                AvailableBatterySlots = request.TotalBatterySlots,
                UnitRateBuy = request.UnitRateBuy,
                UnitRateSell = request.UnitRateSell,
                Schedule = request.Schedule ?? new StationSchedule(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _stationRepository.InsertAsync(newStation);
            return newStation;
        }

        /// <summary>
        /// Updates solar station specifications, capacity, or schedule.
        /// </summary>
        public async Task<SolarStationInfo> UpdateStationAsync(string id, UpdateStationDto request)
        {
            // Inline comment: Fetch existing station
            var station = await _stationRepository.GetByIdAsync(id);
            if (station == null)
            {
                throw new KeyNotFoundException($"Station with ID '{id}' not found.");
            }

            station.Name = request.Name.Trim();
            station.LocationDescription = request.LocationDescription.Trim();
            station.Latitude = request.Latitude;
            station.Longitude = request.Longitude;
            station.CapacityKWh = request.CapacityKWh;
            station.TotalBatterySlots = request.TotalBatterySlots;
            station.AvailableBatterySlots = Math.Min(request.AvailableBatterySlots, request.TotalBatterySlots);
            station.UnitRateBuy = request.UnitRateBuy;
            station.UnitRateSell = request.UnitRateSell;
            station.Schedule = request.Schedule;
            station.IsActive = request.IsActive;
            station.UpdatedAt = DateTime.UtcNow;

            await _stationRepository.UpdateAsync(id, station);
            return station;
        }

        /// <summary>
        /// Deactivates a solar station.
        /// CRITICAL BUSINESS RULE: Node deactivation is BLOCKED if active energy reservations exist.
        /// </summary>
        public async Task<bool> DeactivateStationAsync(string id)
        {
            // Inline comment: Verify station exists
            var station = await _stationRepository.GetByIdAsync(id);
            if (station == null)
            {
                throw new KeyNotFoundException($"Station with ID '{id}' not found.");
            }

            // Inline comment: Query active and pending future reservations for this station
            var activeReservations = await _reservationRepository.FindAsync(r =>
                (r.StationId == id || r.StationCode == station.StationCode) &&
                (r.Status == "Pending" || r.Status == "Approved") &&
                r.ReservationDate >= DateTime.UtcNow.Date.AddDays(-1));

            if (activeReservations.Any())
            {
                throw new InvalidOperationException(
                    $"Cannot deactivate station '{station.Name}' ({station.StationCode}). " +
                    $"There are {activeReservations.Count} active/pending energy reservations linked to this node. " +
                    $"Please complete or cancel these reservations first.");
            }

            station.IsActive = false;
            station.UpdatedAt = DateTime.UtcNow;
            return await _stationRepository.UpdateAsync(id, station);
        }

        /// <summary>
        /// Reactivates an inactive solar station.
        /// </summary>
        public async Task<bool> ReactivateStationAsync(string id)
        {
            // Inline comment: Set station active status
            var station = await _stationRepository.GetByIdAsync(id);
            if (station == null)
            {
                throw new KeyNotFoundException($"Station with ID '{id}' not found.");
            }

            station.IsActive = true;
            station.UpdatedAt = DateTime.UtcNow;
            return await _stationRepository.UpdateAsync(id, station);
        }

        /// <summary>
        /// Finds nearby solar stations based on user's GPS coordinates using Haversine calculation.
        /// </summary>
        public async Task<List<StationResponseDto>> GetNearbyStationsAsync(double latitude, double longitude, double radiusKm = 50)
        {
            // Inline comment: Fetch all active stations and compute distance in kilometers
            var stations = await _stationRepository.FindAsync(s => s.IsActive);
            var nearbyList = new List<StationResponseDto>();

            foreach (var station in stations)
            {
                var distance = CalculateDistanceKm(latitude, longitude, station.Latitude, station.Longitude);
                if (distance <= radiusKm)
                {
                    nearbyList.Add(new StationResponseDto
                    {
                        Id = station.Id,
                        StationCode = station.StationCode,
                        Name = station.Name,
                        LocationDescription = station.LocationDescription,
                        Latitude = station.Latitude,
                        Longitude = station.Longitude,
                        CapacityKWh = station.CapacityKWh,
                        CurrentStoredKWh = station.CurrentStoredKWh,
                        TotalBatterySlots = station.TotalBatterySlots,
                        AvailableBatterySlots = station.AvailableBatterySlots,
                        UnitRateBuy = station.UnitRateBuy,
                        UnitRateSell = station.UnitRateSell,
                        Schedule = station.Schedule,
                        IsActive = station.IsActive,
                        DistanceKm = Math.Round(distance, 2)
                    });
                }
            }

            return nearbyList.OrderBy(s => s.DistanceKm).ToList();
        }

        /// <summary>
        /// Updates the available battery slot count for a station.
        /// </summary>
        public async Task<SolarStationInfo> UpdateBatterySlotsAsync(string id, int availableSlots)
        {
            // Inline comment: Adjust battery slot count
            var station = await _stationRepository.GetByIdAsync(id);
            if (station == null)
            {
                throw new KeyNotFoundException($"Station with ID '{id}' not found.");
            }

            station.AvailableBatterySlots = Math.Clamp(availableSlots, 0, station.TotalBatterySlots);
            station.UpdatedAt = DateTime.UtcNow;
            await _stationRepository.UpdateAsync(id, station);
            return station;
        }

        /// <summary>
        /// Computes Great-Circle distance between two coordinates in kilometers using Haversine formula.
        /// </summary>
        private static double CalculateDistanceKm(double lat1, double lon1, double lat2, double lon2)
        {
            const double earthRadiusKm = 6371.0;
            var dLat = (lat2 - lat1) * (Math.PI / 180.0);
            var dLon = (lon2 - lon1) * (Math.PI / 180.0);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(lat1 * (Math.PI / 180.0)) * Math.Cos(lat2 * (Math.PI / 180.0)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return earthRadiusKm * c;
        }
    }
}
