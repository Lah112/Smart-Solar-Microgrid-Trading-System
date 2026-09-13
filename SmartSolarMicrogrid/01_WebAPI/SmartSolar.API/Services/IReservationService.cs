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
        Task<List<EnergyReservation>> GetReservationsAsync(ReservationFilterDto filter);
        Task<EnergyReservation?> GetReservationByIdAsync(string id);
        Task<EnergyReservation?> GetReservationByNumberAsync(string reservationNumber);
        Task<List<EnergyReservation>> GetProsumerReservationsAsync(string nic, string? status = null);
        Task<ReservationSummaryDto> CreateReservationAsync(CreateReservationDto request);
        Task<ReservationSummaryDto> UpdateReservationAsync(string id, UpdateReservationDto request, string userNic, string role);
        Task<ReservationSummaryDto> CancelReservationAsync(string id, CancelReservationDto request, string userNic, string role);
        Task<ReservationSummaryDto> ApproveReservationAsync(string id);
        Task<ReservationSummaryDto> VerifyAndFinalizeQrAsync(VerifyQrDto request, string operatorNic);
        Task<DashboardStatsDto> GetDashboardStatsAsync();
    }
}
