/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: IReservationService.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Interface defining reservation workflow, 7-day rule, 12-hour rule, and QR dispatch/verification.
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
    /// Contract for energy reservation management, business rules enforcement, and QR verification.
    /// </summary>
    public interface IReservationService
    {
        // Retrieves reservations matching the requested filters.
        Task<List<EnergyReservation>> GetReservationsAsync(ReservationFilterDto filter);
        // Retrieves a reservation by its database ID.
        Task<EnergyReservation?> GetReservationByIdAsync(string id);
        // Retrieves a reservation by its reservation number.
        Task<EnergyReservation?> GetReservationByNumberAsync(string reservationNumber);
        // Retrieves reservation history for a prosumer, optionally filtered by status.
        Task<List<EnergyReservation>> GetProsumerReservationsAsync(string nic, string? status = null);
        // Creates a reservation after enforcing business rules.
        Task<ReservationSummaryDto> CreateReservationAsync(CreateReservationDto request);
        // Updates a reservation and enforces ownership and timing rules.
        Task<ReservationSummaryDto> UpdateReservationAsync(string id, UpdateReservationDto request, string userNic, string role);
        // Cancels a reservation and enforces ownership and timing rules.
        Task<ReservationSummaryDto> CancelReservationAsync(string id, CancelReservationDto request, string userNic, string role);
        // Approves a pending reservation and prepares its QR data.
        Task<ReservationSummaryDto> ApproveReservationAsync(string id);
        // Verifies a scanned QR token and finalizes the reservation.
        Task<ReservationSummaryDto> VerifyAndFinalizeQrAsync(VerifyQrDto request, string operatorNic);
        // Retrieves dashboard totals for the reservation system.
        Task<DashboardStatsDto> GetDashboardStatsAsync();
    }
}
