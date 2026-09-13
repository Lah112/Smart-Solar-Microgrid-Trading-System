package com.smartsolar.app.models;

import java.io.Serializable;
import java.util.List;

public class Station implements Serializable {
    private String id;
    private String stationCode;
    private String name;
    private String locationDescription;
    private double latitude;
    private double longitude;
    private double capacityKWh;
    private double currentStoredKWh;
    private int totalBatterySlots;
    private int availableBatterySlots;
    private double unitRateBuy;
    private double unitRateSell;
    private boolean isActive;
    private Double distanceKm;

    public static class Schedule implements Serializable {
        private String openTime;
        private String closeTime;
        private List<String> operatingDays;

        public String getOpenTime() { return openTime; }
        public void setOpenTime(String openTime) { this.openTime = openTime; }
        public String getCloseTime() { return closeTime; }
        public void setCloseTime(String closeTime) { this.closeTime = closeTime; }
        public List<String> getOperatingDays() { return operatingDays; }
        public void setOperatingDays(List<String> operatingDays) { this.operatingDays = operatingDays; }
    }

    private Schedule schedule;

    public Station() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStationCode() { return stationCode; }
    public void setStationCode(String stationCode) { this.stationCode = stationCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocationDescription() { return locationDescription; }
    public void setLocationDescription(String locationDescription) { this.locationDescription = locationDescription; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public double getCapacityKWh() { return capacityKWh; }
    public void setCapacityKWh(double capacityKWh) { this.capacityKWh = capacityKWh; }

    public double getCurrentStoredKWh() { return currentStoredKWh; }
    public void setCurrentStoredKWh(double currentStoredKWh) { this.currentStoredKWh = currentStoredKWh; }

    public int getTotalBatterySlots() { return totalBatterySlots; }
    public void setTotalBatterySlots(int totalBatterySlots) { this.totalBatterySlots = totalBatterySlots; }

    public int getAvailableBatterySlots() { return availableBatterySlots; }
    public void setAvailableBatterySlots(int availableBatterySlots) { this.availableBatterySlots = availableBatterySlots; }

    public double getUnitRateBuy() { return unitRateBuy; }
    public void setUnitRateBuy(double unitRateBuy) { this.unitRateBuy = unitRateBuy; }

    public double getUnitRateSell() { return unitRateSell; }
    public void setUnitRateSell(double unitRateSell) { this.unitRateSell = unitRateSell; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public Schedule getSchedule() { return schedule; }
    public void setSchedule(Schedule schedule) { this.schedule = schedule; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
}
