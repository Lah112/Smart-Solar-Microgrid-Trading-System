package com.smartsolar.app.models;

import java.io.Serializable;

public class DashboardStats implements Serializable {
    private int totalStationsCount;
    private int activeStationsCount;
    private int totalProsumersCount;
    private int pendingActivationsCount;
    private int activeReservationsCount;
    private int pendingReservationsCount;
    private int approvedFutureReservationsCount;
    private int completedReservationsCount;
    private double totalEnergyKWhTraded;
    private double totalRevenueLKR;

    public DashboardStats() {}

    public int getTotalStationsCount() { return totalStationsCount; }
    public void setTotalStationsCount(int totalStationsCount) { this.totalStationsCount = totalStationsCount; }

    public int getActiveStationsCount() { return activeStationsCount; }
    public void setActiveStationsCount(int activeStationsCount) { this.activeStationsCount = activeStationsCount; }

    public int getTotalProsumersCount() { return totalProsumersCount; }
    public void setTotalProsumersCount(int totalProsumersCount) { this.totalProsumersCount = totalProsumersCount; }

    public int getPendingActivationsCount() { return pendingActivationsCount; }
    public void setPendingActivationsCount(int pendingActivationsCount) { this.pendingActivationsCount = pendingActivationsCount; }

    public int getActiveReservationsCount() { return activeReservationsCount; }
    public void setActiveReservationsCount(int activeReservationsCount) { this.activeReservationsCount = activeReservationsCount; }

    public int getPendingReservationsCount() { return pendingReservationsCount; }
    public void setPendingReservationsCount(int pendingReservationsCount) { this.pendingReservationsCount = pendingReservationsCount; }

    public int getApprovedFutureReservationsCount() { return approvedFutureReservationsCount; }
    public void setApprovedFutureReservationsCount(int approvedFutureReservationsCount) { this.approvedFutureReservationsCount = approvedFutureReservationsCount; }

    public int getCompletedReservationsCount() { return completedReservationsCount; }
    public void setCompletedReservationsCount(int completedReservationsCount) { this.completedReservationsCount = completedReservationsCount; }

    public double getTotalEnergyKWhTraded() { return totalEnergyKWhTraded; }
    public void setTotalEnergyKWhTraded(double totalEnergyKWhTraded) { this.totalEnergyKWhTraded = totalEnergyKWhTraded; }

    public double getTotalRevenueLKR() { return totalRevenueLKR; }
    public void setTotalRevenueLKR(double totalRevenueLKR) { this.totalRevenueLKR = totalRevenueLKR; }
}
