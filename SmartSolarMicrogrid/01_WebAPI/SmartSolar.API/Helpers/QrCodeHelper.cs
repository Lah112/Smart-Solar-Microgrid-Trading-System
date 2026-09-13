/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: QrCodeHelper.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Helper for generating Base64 QR code image representations for verified reservations.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System;
using System.Text.Json;
using QRCoder;
using SmartSolar.API.Models;

namespace SmartSolar.API.Helpers
{
    /// <summary>
    /// Utility class for generating secure QR code payloads and images.
    /// </summary>
    public static class QrCodeHelper
    {
        /// <summary>
        /// Generates a standardized secure JSON string payload for a reservation.
        /// </summary>
        /// <param name="reservation">The approved reservation entity.</param>
        /// <returns>JSON payload string.</returns>
        public static string GenerateQrPayload(EnergyReservation reservation)
        {
            // Inline comment: Build structured JSON object for operator verification
            var payload = new
            {
                resNo = reservation.ReservationNumber,
                nic = reservation.ProsumerNic,
                stationId = reservation.StationId,
                stationCode = reservation.StationCode,
                date = reservation.ReservationDate.ToString("yyyy-MM-dd"),
                startTime = reservation.StartTime,
                endTime = reservation.EndTime,
                type = reservation.TransferType,
                kwh = reservation.EnergyAmountKWh,
                token = reservation.QrCodeToken
            };

            return JsonSerializer.Serialize(payload);
        }

        /// <summary>
        /// Generates a Base64-encoded PNG image of the QR Code from a string payload.
        /// </summary>
        /// <param name="content">Text or JSON string to encode.</param>
        /// <returns>Base64 data URL string.</returns>
        public static string GenerateQrCodeBase64(string content)
        {
            // Inline comment: Use PngByteQRCode for cross-platform zero-dependency rendering
            if (string.IsNullOrEmpty(content))
                return string.Empty;

            try
            {
                using var qrGenerator = new QRCodeGenerator();
                using var qrCodeData = qrGenerator.CreateQrCode(content, QRCodeGenerator.ECCLevel.Q);
                var qrCode = new PngByteQRCode(qrCodeData);
                byte[] qrCodeBytes = qrCode.GetGraphic(20);
                return "data:image/png;base64," + Convert.ToBase64String(qrCodeBytes);
            }
            catch
            {
                return string.Empty;
            }
        }
    }
}
