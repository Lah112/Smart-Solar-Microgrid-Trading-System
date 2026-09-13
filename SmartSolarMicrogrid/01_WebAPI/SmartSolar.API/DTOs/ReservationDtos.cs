/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: ReservationDtos.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Data Transfer Objects for Energy Reservations, QR Verification, and Dashboard Analytics.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System;
using System.ComponentModel.DataAnnotations;

namespace SmartSolar.API.DTOs
{
    /// <summary>
    /// DTO for creating a new energy drop-off or charging reservation.
    /// Enforces 7-day future booking limit in service layer.
    /// </summary>
    public class CreateReservationDto
    {
        [Required(ErrorMessage = "Prosumer NIC is required")]
        public string ProsumerNic { get; set; } = string.Empty;

        [Required(ErrorMessage = "Station ID is required")]
        public string StationId { get; set; } = string.Empty;

        public string? SlotId { get; set; }

        [Required(ErrorMessage = "Reservation date is required")]
        public DateTime ReservationDate { get; set; }

        [Required(ErrorMessage = "Start time is required (e.g. 09:00)")]
        public string StartTime { get; set; } = "09:00";

        [Required(ErrorMessage = "End time is required (e.g. 10:00)")]
        public string EndTime { get; set; } = "10:00";

        /// <summary>
        /// Transfer type: "DropOff_SolarEnergy" or "Charging"
        /// </summary>
        [Required]
        public string TransferType { get; set; } = "DropOff_SolarEnergy";

        [Required]
        [Range(0.1, 5000.0, ErrorMessage = "Energy amount must be greater than 0 kWh")]
        public double EnergyAmountKWh { get; set; }

        public string? Notes { get; set; }
    }

    /// <summary>
    /// DTO for modifying an existing reservation (Enforces 12-hour notice rule).
    /// </summary>
    public class UpdateReservationDto
    {
        [Range(0.1, 5000.0, ErrorMessage = "Energy amount must be greater than 0 kWh")]
        public double? EnergyAmountKWh { get; set; }

        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public string? Notes { get; set; }
    }

    /// <summary>
    /// DTO for cancelling an existing reservation (Enforces 12-hour notice rule).
    /// </summary>
    public class CancelReservationDto
    {
        [Required(ErrorMessage = "Cancellation reason is required")]
        public string Reason { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for Grid Operator QR Code scan and verification.
    /// </summary>
    public class VerifyQrDto
    {
        [Required(ErrorMessage = "QR Code token or payload is required")]
        public string QrToken { get; set; } = string.Empty;

        public string? OperatorNotes { get; set; }
    }

    /// <summary>
    /// DTO for filtering and searching reservations.
    /// </summary>
    public class ReservationFilterDto
    {
        public string? ProsumerNic { get; set; }
        public string? StationId { get; set; }
        public string? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? SearchKeyword { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    /// <summary>
    /// Summary response shown after every booking action (Create, Update, Cancel).
    /// </summary>
    public class ReservationSummaryDto
    {
        public string ReservationNumber { get; set; } = string.Empty;
        public string ProsumerNic { get; set; } = string.Empty;
        public string ProsumerName { get; set; } = string.Empty;
        public string StationName { get; set; } = string.Empty;
        public string FormattedDateTime { get; set; } = string.Empty;
        public string TransferType { get; set; } = string.Empty;
        public double EnergyAmountKWh { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? QrCodeBase64 { get; set; }
    }

    /// <summary>
    /// Operational Dashboard Statistics DTO.
    /// </summary>
    public class DashboardStatsDto
    {
        public int TotalStationsCount { get; set; }
        public int ActiveStationsCount { get; set; }
        public int TotalProsumersCount { get; set; }
        public int PendingActivationsCount { get; set; }
        public int ActiveReservationsCount { get; set; }
        public int PendingReservationsCount { get; set; }
        public int ApprovedFutureReservationsCount { get; set; }
        public int CompletedReservationsCount { get; set; }
        public double TotalEnergyKWhTraded { get; set; }
        public decimal TotalRevenueLKR { get; set; }
    }
}
