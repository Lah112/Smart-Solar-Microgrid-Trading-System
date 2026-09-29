/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: IBookingSlotService.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Interface defining booking slot queries and schedule capacity management.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartSolar.API.DTOs;
using SmartSolar.API.Models;

namespace SmartSolar.API.Services
{
    /// <summary>
    /// Contract for energy booking slot management operations.
    /// </summary>
    public interface IBookingSlotService
    {
        // Retrieves booking slots for a station on a specific date.
        Task<List<EnergyBookingSlot>> GetSlotsByStationAndDateAsync(string stationId, DateTime date);
        // Creates a booking slot.
        Task<EnergyBookingSlot> CreateSlotAsync(CreateSlotDto request);
        // Updates an existing booking slot.
        Task<EnergyBookingSlot> UpdateSlotAsync(string id, UpdateSlotDto request);
        // Deletes a booking slot by ID.
        Task<bool> DeleteSlotAsync(string id);
        // Generates the default daily schedule for a station.
        Task<List<EnergyBookingSlot>> GenerateDefaultDailySlotsAsync(string stationId, DateTime date);
    }
}
