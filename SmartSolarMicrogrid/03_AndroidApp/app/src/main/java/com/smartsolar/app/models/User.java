package com.smartsolar.app.models;

import java.io.Serializable;

public class User implements Serializable {
    private String id;
    private String nic;
    private String email;
    private String fullName;
    private String role;
    private String phone;
    private String address;
    private String status;
    private boolean isActive;
    private double solarCapacityKWh;

    public User() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public double getSolarCapacityKWh() { return solarCapacityKWh; }
    public void setSolarCapacityKWh(double solarCapacityKWh) { this.solarCapacityKWh = solarCapacityKWh; }
}
