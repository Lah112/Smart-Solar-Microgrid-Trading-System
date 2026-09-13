/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: ReservationService.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Implements central business logic for energy trading reservations (7-day rule, 12-hour rule, QR dispatch & verification).
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using SmartSolar.API.DTOs;
using SmartSolar.API.Helpers;
using SmartSolar.API.Models;
using SmartSolar.API.Repositories;

namespace SmartSolar.API.Services
{
    /// <summary>
    /// Service enforcing power trading reservations business rules according to the FAT Service pattern.
    /// </summary>
    public class ReservationService : IReservationService
    {
        private readonly IMongoRepository<EnergyReservation> _reservationRepository;
        private readonly IMongoRepository<SolarStationInfo> _stationRepository;
        private readonly IMongoRepository<User> _userRepository;
        private readonly IMongoRepository<EnergyBookingSlot> _slotRepository;

        /// <summary>
        /// Constructor for ReservationService.
        /// </summary>
        public ReservationService(
            IMongoRepository<EnergyReservation> reservationRepository,
            IMongoRepository<SolarStationInfo> stationRepository,
            IMongoRepository<User> userRepository,
            IMongoRepository<EnergyBookingSlot> slotRepository)
        {
            _reservationRepository = reservationRepository;
            _stationRepository = stationRepository;
            _userRepository = userRepository;
            _slotRepository = slotRepository;
        }

        /// <summary>
        /// Queries reservations with dynamic filters (station, status, prosumer, date range, search).
        /// </summary>
        public async Task<List<EnergyReservation>> GetReservationsAsync(ReservationFilterDto filter)
        {
            // Inline comment: Query all reservations and apply filter conditions in-memory/in-mongo
            var reservations = await _reservationRepository.GetAllAsync();

            if (!string.IsNullOrEmpty(filter.ProsumerNic))
            {
                reservations = reservations.Where(r => r.ProsumerNic.Equals(filter.ProsumerNic, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (!string.IsNullOrEmpty(filter.StationId))
            {
                reservations = reservations.Where(r => r.StationId == filter.StationId || r.StationCode.Equals(filter.StationId, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (!string.IsNullOrEmpty(filter.Status))
            {
                reservations = reservations.Where(r => r.Status.Equals(filter.Status, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (filter.FromDate.HasValue)
            {
                reservations = reservations.Where(r => r.ReservationDate >= filter.FromDate.Value.Date).ToList();
            }

            if (filter.ToDate.HasValue)
            {
                reservations = reservations.Where(r => r.ReservationDate <= filter.ToDate.Value.Date).ToList();
            }

            if (!string.IsNullOrEmpty(filter.SearchKeyword))
            {
                var term = filter.SearchKeyword.Trim().ToLower();
                reservations = reservations.Where(r =>
                    r.ReservationNumber.ToLower().Contains(term) ||
                    r.ProsumerNic.ToLower().Contains(term) ||
                    r.ProsumerName.ToLower().Contains(term) ||
                    r.StationName.ToLower().Contains(term) ||
                    r.StationCode.ToLower().Contains(term)
                ).ToList();
            }

            return reservations.OrderByDescending(r => r.ReservationDate).ThenByDescending(r => r.StartTime).ToList();
        }

        /// <summary>
        /// Retrieves a reservation by its MongoDB ObjectId.
        /// </summary>
        public async Task<EnergyReservation?> GetReservationByIdAsync(string id)
        {
            // Inline comment: Find reservation by ObjectId
            return await _reservationRepository.GetByIdAsync(id);
        }

        /// <summary>
        /// Retrieves a reservation by its unique reservation reference number (e.g. RES-2026-0001).
        /// </summary>
        public async Task<EnergyReservation?> GetReservationByNumberAsync(string reservationNumber)
        {
            // Inline comment: Find reservation by unique number
            var cleanNo = reservationNumber.Trim().ToUpperInvariant();
            return await _reservationRepository.FindOneAsync(r => r.ReservationNumber.ToUpper() == cleanNo);
        }

        /// <summary>
        /// Retrieves booking history and active bookings for a specific prosumer.
        /// </summary>
        public async Task<List<EnergyReservation>> GetProsumerReservationsAsync(string nic, string? status = null)
        {
            // Inline comment: Query prosumer reservations by NIC
            var cleanNic = nic.Trim().ToUpperInvariant();
            var reservations = await _reservationRepository.FindAsync(r => r.ProsumerNic.ToUpper() == cleanNic);

            if (!string.IsNullOrEmpty(status))
            {
                reservations = reservations.Where(r => r.Status.Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            return reservations.OrderByDescending(r => r.ReservationDate).ThenByDescending(r => r.StartTime).ToList();
        }

        /// <summary>
        /// Creates a new energy drop-off or charging reservation.
        /// CRITICAL BUSINESS RULE 1: Must be scheduled within 7 days.
        /// CRITICAL BUSINESS RULE 2: Prosumer account must be active.
        /// </summary>
        public async Task<ReservationSummaryDto> CreateReservationAsync(CreateReservationDto request)
        {
            // Inline comment: Enforce Rule: Reservations must be scheduled within 7 days
            var today = DateTime.UtcNow.Date;
            var requestedDate = request.ReservationDate.Date;

            if (requestedDate < today)
            {
                throw new InvalidOperationException("Cannot schedule reservations in the past.");
            }

            if (requestedDate > today.AddDays(7))
            {
                throw new InvalidOperationException(
                    $"Power trading reservations must be scheduled within 7 days. " +
                    $"Maximum allowable date is {today.AddDays(7):yyyy-MM-dd}.");
            }

            // Inline comment: Verify prosumer existence and active status
            var cleanNic = request.ProsumerNic.Trim().ToUpperInvariant();
            var prosumer = await _userRepository.FindOneAsync(u => u.Nic.ToUpper() == cleanNic);
            if (prosumer == null)
            {
                throw new KeyNotFoundException($"Prosumer with NIC '{request.ProsumerNic}' was not found.");
            }

            if (prosumer.Status == "Deactivated" || !prosumer.IsActive)
            {
                throw new InvalidOperationException("This prosumer account is deactivated and cannot place reservations.");
            }

            // Inline comment: Verify station existence and active status
            var station = await _stationRepository.GetByIdAsync(request.StationId);
            if (station == null)
            {
                station = await _stationRepository.FindOneAsync(s => s.StationCode.ToUpper() == request.StationId.ToUpper());
            }

            if (station == null)
            {
                throw new KeyNotFoundException($"Solar station '{request.StationId}' not found.");
            }

            if (!station.IsActive)
            {
                throw new InvalidOperationException($"Station '{station.Name}' is currently inactive for maintenance.");
            }

            // Inline comment: Determine unit rate and calculate total amount
            decimal unitRate = request.TransferType.Contains("Charging", StringComparison.OrdinalIgnoreCase) 
                ? station.UnitRateSell 
                : station.UnitRateBuy;

            decimal totalAmount = Math.Round((decimal)request.EnergyAmountKWh * unitRate, 2);

            // Inline comment: Generate unique reservation number
            var count = await _reservationRepository.CountAsync(_ => true);
            var reservationNumber = $"RES-{DateTime.UtcNow.Year}-{(count + 1):D5}";

            // Inline comment: Generate secure QR Token
            var qrToken = $"QR_SEC_{Guid.NewGuid():N}_{reservationNumber}_{cleanNic}";

            var reservation = new EnergyReservation
            {
                ReservationNumber = reservationNumber,
                ProsumerNic = cleanNic,
                ProsumerName = prosumer.FullName,
                ProsumerPhone = prosumer.Phone,
                StationId = station.Id!,
                StationCode = station.StationCode,
                StationName = station.Name,
                SlotId = request.SlotId,
                ReservationDate = requestedDate,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                TransferType = request.TransferType,
                EnergyAmountKWh = request.EnergyAmountKWh,
                UnitRate = unitRate,
                TotalAmount = totalAmount,
                Status = "Approved", // Approved immediately for valid prosumer & slot
                QrCodeToken = qrToken,
                Notes = request.Notes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            reservation.QrCodePayload = QrCodeHelper.GenerateQrPayload(reservation);

            await _reservationRepository.InsertAsync(reservation);

            var qrBase64 = QrCodeHelper.GenerateQrCodeBase64(reservation.QrCodePayload);

            return new ReservationSummaryDto
            {
                ReservationNumber = reservation.ReservationNumber,
                ProsumerNic = reservation.ProsumerNic,
                ProsumerName = reservation.ProsumerName,
                StationName = reservation.StationName,
                FormattedDateTime = $"{reservation.ReservationDate:yyyy-MM-dd} {reservation.StartTime} - {reservation.EndTime}",
                TransferType = reservation.TransferType,
                EnergyAmountKWh = reservation.EnergyAmountKWh,
                TotalAmount = reservation.TotalAmount,
                Status = reservation.Status,
                Message = "Reservation successfully created and approved. Present the QR code at the station.",
                QrCodeBase64 = qrBase64
            };
        }

        /// <summary>
        /// Modifies an existing reservation.
        /// CRITICAL BUSINESS RULE: Updates require at least 12 hours' notice prior to slot start time.
        /// </summary>
        public async Task<ReservationSummaryDto> UpdateReservationAsync(string id, UpdateReservationDto request, string userNic, string role)
        {
            // Inline comment: Fetch reservation and verify permissions
            var reservation = await _reservationRepository.GetByIdAsync(id);
            if (reservation == null)
            {
                throw new KeyNotFoundException($"Reservation with ID '{id}' not found.");
            }

            if (!string.Equals(role, "Backoffice", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(reservation.ProsumerNic, userNic, StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException("You do not have permission to modify this reservation.");
            }

            if (reservation.Status != "Approved" && reservation.Status != "Pending")
            {
                throw new InvalidOperationException($"Cannot modify reservation with status '{reservation.Status}'.");
            }

            // Inline comment: Enforce 12-hour notice rule
            Enforce12HourNoticeRule(reservation, "modify");

            if (request.EnergyAmountKWh.HasValue && request.EnergyAmountKWh.Value > 0)
            {
                reservation.EnergyAmountKWh = request.EnergyAmountKWh.Value;
                reservation.TotalAmount = Math.Round((decimal)reservation.EnergyAmountKWh * reservation.UnitRate, 2);
            }

            if (!string.IsNullOrEmpty(request.StartTime)) reservation.StartTime = request.StartTime;
            if (!string.IsNullOrEmpty(request.EndTime)) reservation.EndTime = request.EndTime;
            if (request.Notes != null) reservation.Notes = request.Notes;

            reservation.UpdatedAt = DateTime.UtcNow;
            reservation.QrCodePayload = QrCodeHelper.GenerateQrPayload(reservation);

            await _reservationRepository.UpdateAsync(id, reservation);

            var qrBase64 = QrCodeHelper.GenerateQrCodeBase64(reservation.QrCodePayload);

            return new ReservationSummaryDto
            {
                ReservationNumber = reservation.ReservationNumber,
                ProsumerNic = reservation.ProsumerNic,
                ProsumerName = reservation.ProsumerName,
                StationName = reservation.StationName,
                FormattedDateTime = $"{reservation.ReservationDate:yyyy-MM-dd} {reservation.StartTime} - {reservation.EndTime}",
                TransferType = reservation.TransferType,
                EnergyAmountKWh = reservation.EnergyAmountKWh,
                TotalAmount = reservation.TotalAmount,
                Status = reservation.Status,
                Message = "Reservation updated successfully with 12-hour rule verified.",
                QrCodeBase64 = qrBase64
            };
        }

        /// <summary>
        /// Cancels an existing reservation.
        /// CRITICAL BUSINESS RULE: Cancellations require at least 12 hours' notice prior to slot start time.
        /// </summary>
        public async Task<ReservationSummaryDto> CancelReservationAsync(string id, CancelReservationDto request, string userNic, string role)
        {
            // Inline comment: Fetch reservation and verify permissions
            var reservation = await _reservationRepository.GetByIdAsync(id);
            if (reservation == null)
            {
                throw new KeyNotFoundException($"Reservation with ID '{id}' not found.");
            }

            if (!string.Equals(role, "Backoffice", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(role, "GridOperator", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(reservation.ProsumerNic, userNic, StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException("You do not have permission to cancel this reservation.");
            }

            if (reservation.Status == "Completed" || reservation.Status == "Cancelled")
            {
                throw new InvalidOperationException($"Cannot cancel a reservation that is already '{reservation.Status}'.");
            }

            // Inline comment: Enforce 12-hour notice rule (Operators/Backoffice may assist prosumers, rule is checked)
            if (!string.Equals(role, "Backoffice", StringComparison.OrdinalIgnoreCase))
            {
                Enforce12HourNoticeRule(reservation, "cancel");
            }

            reservation.Status = "Cancelled";
            reservation.Notes = string.IsNullOrEmpty(reservation.Notes) 
                ? $"Cancelled: {request.Reason}" 
                : $"{reservation.Notes} | Cancelled: {request.Reason}";
            reservation.UpdatedAt = DateTime.UtcNow;

            await _reservationRepository.UpdateAsync(id, reservation);

            return new ReservationSummaryDto
            {
                ReservationNumber = reservation.ReservationNumber,
                ProsumerNic = reservation.ProsumerNic,
                ProsumerName = reservation.ProsumerName,
                StationName = reservation.StationName,
                FormattedDateTime = $"{reservation.ReservationDate:yyyy-MM-dd} {reservation.StartTime} - {reservation.EndTime}",
                TransferType = reservation.TransferType,
                EnergyAmountKWh = reservation.EnergyAmountKWh,
                TotalAmount = reservation.TotalAmount,
                Status = reservation.Status,
                Message = $"Reservation #{reservation.ReservationNumber} has been successfully cancelled."
            };
        }

        /// <summary>
        /// Approves a pending reservation.
        /// </summary>
        public async Task<ReservationSummaryDto> ApproveReservationAsync(string id)
        {
            // Inline comment: Fetch reservation and transition to Approved status
            var reservation = await _reservationRepository.GetByIdAsync(id);
            if (reservation == null)
            {
                throw new KeyNotFoundException($"Reservation with ID '{id}' not found.");
            }

            reservation.Status = "Approved";
            if (string.IsNullOrEmpty(reservation.QrCodeToken))
            {
                reservation.QrCodeToken = $"QR_SEC_{Guid.NewGuid():N}_{reservation.ReservationNumber}_{reservation.ProsumerNic}";
            }
            reservation.QrCodePayload = QrCodeHelper.GenerateQrPayload(reservation);
            reservation.UpdatedAt = DateTime.UtcNow;

            await _reservationRepository.UpdateAsync(id, reservation);

            var qrBase64 = QrCodeHelper.GenerateQrCodeBase64(reservation.QrCodePayload);

            return new ReservationSummaryDto
            {
                ReservationNumber = reservation.ReservationNumber,
                ProsumerNic = reservation.ProsumerNic,
                ProsumerName = reservation.ProsumerName,
                StationName = reservation.StationName,
                FormattedDateTime = $"{reservation.ReservationDate:yyyy-MM-dd} {reservation.StartTime} - {reservation.EndTime}",
                TransferType = reservation.TransferType,
                EnergyAmountKWh = reservation.EnergyAmountKWh,
                TotalAmount = reservation.TotalAmount,
                Status = reservation.Status,
                Message = "Reservation has been approved and QR dispatch generated.",
                QrCodeBase64 = qrBase64
            };
        }

        /// <summary>
        /// Verifies a QR code scanned by a Grid Operator and finalizes the energy transfer transaction.
        /// CRITICAL BUSINESS RULE: Operator scans QR -> API verifies against DB -> Marks status Completed.
        /// </summary>
        public async Task<ReservationSummaryDto> VerifyAndFinalizeQrAsync(VerifyQrDto request, string operatorNic)
        {
            // Inline comment: Parse QR token or JSON payload
            var tokenOrPayload = request.QrToken.Trim();
            EnergyReservation? reservation = null;

            if (tokenOrPayload.StartsWith("{") && tokenOrPayload.EndsWith("}"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(tokenOrPayload);
                    var root = doc.RootElement;
                    if (root.TryGetProperty("resNo", out var resNoProp))
                    {
                        var resNo = resNoProp.GetString();
                        reservation = await _reservationRepository.FindOneAsync(r => r.ReservationNumber == resNo);
                    }
                }
                catch
                {
                    // Fallback to searching by token
                }
            }

            if (reservation == null)
            {
                reservation = await _reservationRepository.FindOneAsync(r => 
                    r.QrCodeToken == tokenOrPayload || 
                    r.ReservationNumber.ToUpper() == tokenOrPayload.ToUpper());
            }

            if (reservation == null)
            {
                throw new KeyNotFoundException("Invalid QR Code. No matching reservation found in the system.");
            }

            if (reservation.Status == "Completed")
            {
                throw new InvalidOperationException($"This transaction (#{reservation.ReservationNumber}) has already been finalized on {reservation.CompletedAt:yyyy-MM-dd HH:mm}.");
            }

            if (reservation.Status == "Cancelled")
            {
                throw new InvalidOperationException($"Cannot finalize cancelled reservation #{reservation.ReservationNumber}.");
            }

            // Inline comment: Mark reservation as Completed
            reservation.Status = "Completed";
            reservation.CompletedAt = DateTime.UtcNow;
            reservation.CompletedByOperatorNic = operatorNic;
            if (!string.IsNullOrEmpty(request.OperatorNotes))
            {
                reservation.Notes = string.IsNullOrEmpty(reservation.Notes) 
                    ? $"Operator: {request.OperatorNotes}" 
                    : $"{reservation.Notes} | Operator: {request.OperatorNotes}";
            }
            reservation.UpdatedAt = DateTime.UtcNow;

            await _reservationRepository.UpdateAsync(reservation.Id!, reservation);

            // Inline comment: Update station storage capacity
            var station = await _stationRepository.GetByIdAsync(reservation.StationId);
            if (station != null)
            {
                if (reservation.TransferType.Contains("DropOff", StringComparison.OrdinalIgnoreCase))
                {
                    station.CurrentStoredKWh = Math.Min(station.CapacityKWh, station.CurrentStoredKWh + reservation.EnergyAmountKWh);
                }
                else
                {
                    station.CurrentStoredKWh = Math.Max(0.0, station.CurrentStoredKWh - reservation.EnergyAmountKWh);
                }
                station.UpdatedAt = DateTime.UtcNow;
                await _stationRepository.UpdateAsync(station.Id!, station);
            }

            return new ReservationSummaryDto
            {
                ReservationNumber = reservation.ReservationNumber,
                ProsumerNic = reservation.ProsumerNic,
                ProsumerName = reservation.ProsumerName,
                StationName = reservation.StationName,
                FormattedDateTime = $"{reservation.ReservationDate:yyyy-MM-dd} {reservation.StartTime} - {reservation.EndTime}",
                TransferType = reservation.TransferType,
                EnergyAmountKWh = reservation.EnergyAmountKWh,
                TotalAmount = reservation.TotalAmount,
                Status = "Completed",
                Message = $"Energy transfer finalized successfully by Operator {operatorNic}."
            };
        }

        /// <summary>
        /// Aggregates live operational statistics for Backoffice and Grid Operator dashboards.
        /// </summary>
        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            // Inline comment: Read live counts from MongoDB collections
            var stations = await _stationRepository.GetAllAsync();
            var users = await _userRepository.GetAllAsync();
            var reservations = await _reservationRepository.GetAllAsync();

            var today = DateTime.UtcNow.Date;

            var activeReservations = reservations.Count(r => r.Status == "Approved" && r.ReservationDate.Date >= today);
            var pendingReservations = reservations.Count(r => r.Status == "Pending");
            var approvedFuture = reservations.Count(r => r.Status == "Approved" && r.ReservationDate.Date > today);
            var completedReservations = reservations.Count(r => r.Status == "Completed");
            var energyTraded = reservations.Where(r => r.Status == "Completed").Sum(r => r.EnergyAmountKWh);
            var totalRevenue = reservations.Where(r => r.Status == "Completed").Sum(r => r.TotalAmount);

            return new DashboardStatsDto
            {
                TotalStationsCount = stations.Count,
                ActiveStationsCount = stations.Count(s => s.IsActive),
                TotalProsumersCount = users.Count(u => u.Role == "Prosumer"),
                PendingActivationsCount = users.Count(u => u.Status == "PendingActivation"),
                ActiveReservationsCount = activeReservations,
                PendingReservationsCount = pendingReservations,
                ApprovedFutureReservationsCount = approvedFuture,
                CompletedReservationsCount = completedReservations,
                TotalEnergyKWhTraded = Math.Round(energyTraded, 2),
                TotalRevenueLKR = Math.Round(totalRevenue, 2)
            };
        }

        /// <summary>
        /// Validates that the requested action is at least 12 hours prior to the scheduled slot start time.
        /// </summary>
        private static void Enforce12HourNoticeRule(EnergyReservation reservation, string actionName)
        {
            // Inline comment: Parse start time into combined slot datetime
            var timeParts = reservation.StartTime.Split(':');
            var hours = int.TryParse(timeParts[0], out var h) ? h : 9;
            var minutes = timeParts.Length > 1 && int.TryParse(timeParts[1], out var m) ? m : 0;

            var slotStartDateTime = reservation.ReservationDate.Date.AddHours(hours).AddMinutes(minutes);
            var timeDifference = slotStartDateTime - DateTime.UtcNow;

            if (timeDifference.TotalHours < 12)
            {
                throw new InvalidOperationException(
                    $"Cannot {actionName} reservation #{reservation.ReservationNumber}. " +
                    $"Updates and cancellations require at least 12 hours' notice before scheduled slot time. " +
                    $"Scheduled for: {slotStartDateTime:yyyy-MM-dd HH:mm} UTC. Time remaining: {timeDifference.TotalHours:F1} hours.");
            }
        }
    }
}
