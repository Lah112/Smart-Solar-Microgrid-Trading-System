package com.smartsolar.app.models;

import java.io.Serializable;

public class Reservation implements Serializable {
    private String id;
    private String reservationNumber;
    private String prosumerNic;
    private String prosumerName;
    private String prosumerPhone;
    private String stationId;
    private String stationCode;
    private String stationName;
    private String slotId;
    private String reservationDate;
    private String startTime;
    private String endTime;
    private String transferType;
    private double energyAmountKWh;
    private double unitRate;
    private double totalAmount;
    private String status;
    private String qrCodeToken;
    private String qrCodePayload;
    private String qrCodeBase64;
    private String message;
    private String notes;

    public Reservation() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getReservationNumber() { return reservationNumber; }
    public void setReservationNumber(String reservationNumber) { this.reservationNumber = reservationNumber; }

    public String getProsumerNic() { return prosumerNic; }
    public void setProsumerNic(String prosumerNic) { this.prosumerNic = prosumerNic; }

    public String getProsumerName() { return prosumerName; }
    public void setProsumerName(String prosumerName) { this.prosumerName = prosumerName; }

    public String getProsumerPhone() { return prosumerPhone; }
    public void setProsumerPhone(String prosumerPhone) { this.prosumerPhone = prosumerPhone; }

    public String getStationId() { return stationId; }
    public void setStationId(String stationId) { this.stationId = stationId; }

    public String getStationCode() { return stationCode; }
    public void setStationCode(String stationCode) { this.stationCode = stationCode; }

    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }

    public String getSlotId() { return slotId; }
    public void setSlotId(String slotId) { this.slotId = slotId; }

    public String getReservationDate() { return reservationDate; }
    public void setReservationDate(String reservationDate) { this.reservationDate = reservationDate; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getTransferType() { return transferType; }
    public void setTransferType(String transferType) { this.transferType = transferType; }

    public double getEnergyAmountKWh() { return energyAmountKWh; }
    public void setEnergyAmountKWh(double energyAmountKWh) { this.energyAmountKWh = energyAmountKWh; }

    public double getUnitRate() { return unitRate; }
    public void setUnitRate(double unitRate) { this.unitRate = unitRate; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getQrCodeToken() { return qrCodeToken; }
    public void setQrCodeToken(String qrCodeToken) { this.qrCodeToken = qrCodeToken; }

    public String getQrCodePayload() { return qrCodePayload; }
    public void setQrCodePayload(String qrCodePayload) { this.qrCodePayload = qrCodePayload; }

    public String getQrCodeBase64() { return qrCodeBase64; }
    public void setQrCodeBase64(String qrCodeBase64) { this.qrCodeBase64 = qrCodeBase64; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
