/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: BookingSlotService.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Implementation of energy slot management and automatic daily slot generator.
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
    /// Service managing time slot creation, dynamic availability calculation, and capacity tracking.
    /// </summary>
    public class BookingSlotService : IBookingSlotService
    {
        private readonly IMongoRepository<EnergyBookingSlot> _slotRepository;
        private readonly IMongoRepository<SolarStationInfo> _stationRepository;

        /// <summary>
        /// Constructor for BookingSlotService.
        /// </summary>
        public BookingSlotService(
            IMongoRepository<EnergyBookingSlot> slotRepository,
            IMongoRepository<SolarStationInfo> stationRepository)
        {
            _slotRepository = slotRepository;
            _stationRepository = stationRepository;
        }

        /// <summary>
        /// Retrieves booking slots for a specific station on a selected date, automatically seeding defaults if none exist.
        /// </summary>
        public async Task<List<EnergyBookingSlot>> GetSlotsByStationAndDateAsync(string stationId, DateTime date)
        {
            // Inline comment: Query slots matching station and target date
            var targetDate = date.Date;
            var slots = await _slotRepository.FindAsync(s => s.StationId == stationId && s.Date == targetDate);

            // If no slots configured for this date, automatically generate default time intervals
            if (!slots.Any())
            {
                return await GenerateDefaultDailySlotsAsync(stationId, targetDate);
            }

            return slots.OrderBy(s => s.StartTime).ToList();
        }

        /// <summary>
        /// Creates a new energy booking time slot.
        /// </summary>
        public async Task<EnergyBookingSlot> CreateSlotAsync(CreateSlotDto request)
        {
            // Inline comment: Validate station existence
            var station = await _stationRepository.GetByIdAsync(request.StationId);
            if (station == null)
            {
                throw new KeyNotFoundException($"Station with ID '{request.StationId}' not found.");
            }

            var newSlot = new EnergyBookingSlot
            {
                StationId = request.StationId,
                StationCode = station.StationCode,
                Date = request.Date.Date,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                SlotType = request.SlotType,
                MaxCapacityKWh = request.MaxCapacityKWh,
                BookedCapacityKWh = 0.0,
                TotalSlots = request.TotalSlots,
                BookedSlots = 0,
                Status = "Available"
            };

            await _slotRepository.InsertAsync(newSlot);
            return newSlot;
        }

        /// <summary>
        /// Updates slot limits and operational status.
        /// </summary>
        public async Task<EnergyBookingSlot> UpdateSlotAsync(string id, UpdateSlotDto request)
        {
            // Inline comment: Fetch slot entity
            var slot = await _slotRepository.GetByIdAsync(id);
            if (slot == null)
            {
                throw new KeyNotFoundException($"Slot with ID '{id}' not found.");
            }

            slot.MaxCapacityKWh = request.MaxCapacityKWh;
            slot.TotalSlots = request.TotalSlots;
            slot.Status = request.Status;

            await _slotRepository.UpdateAsync(id, slot);
            return slot;
        }

        /// <summary>
        /// Deletes a booking slot.
        /// </summary>
        public async Task<bool> DeleteSlotAsync(string id)
        {
            // Inline comment: Delete slot by ID
            return await _slotRepository.DeleteAsync(id);
        }

        /// <summary>
        /// Generates standard hourly energy trading slots for a station on a given date.
        /// </summary>
        public async Task<List<EnergyBookingSlot>> GenerateDefaultDailySlotsAsync(string stationId, DateTime date)
        {
            // Inline comment: Retrieve station details for default capacity configuration
            var station = await _stationRepository.GetByIdAsync(stationId);
            var stationCode = station?.StationCode ?? "HUB";

            var defaultHours = new[]
            {
                ("08:00", "09:00"),
                ("09:00", "10:00"),
                ("10:00", "11:00"),
                ("11:00", "12:00"),
                ("13:00", "14:00"),
                ("14:00", "15:00"),
                ("15:00", "16:00"),
                ("16:00", "17:00")
            };

            var generatedSlots = new List<EnergyBookingSlot>();

            foreach (var (start, end) in defaultHours)
            {
                var dropOffSlot = new EnergyBookingSlot
                {
                    StationId = stationId,
                    StationCode = stationCode,
                    Date = date.Date,
                    StartTime = start,
                    EndTime = end,
                    SlotType = "DropOff",
                    MaxCapacityKWh = 50.0,
                    BookedCapacityKWh = 0.0,
                    TotalSlots = 5,
                    BookedSlots = 0,
                    Status = "Available"
                };

                await _slotRepository.InsertAsync(dropOffSlot);
                generatedSlots.Add(dropOffSlot);
            }

            return generatedSlots;
        }
    }
}
