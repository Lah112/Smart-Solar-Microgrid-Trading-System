package com.smartsolar.app.models;

import java.io.Serializable;

public class LoginResponse implements Serializable {
    private String token;
    private String nic;
    private String fullName;
    private String email;
    private String role;
    private String status;
    private String phone;
    private String address;
    private double solarCapacityKWh;
    private String expiresAt;

    public LoginResponse() {}

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public double getSolarCapacityKWh() { return solarCapacityKWh; }
    public void setSolarCapacityKWh(double solarCapacityKWh) { this.solarCapacityKWh = solarCapacityKWh; }

    public String getExpiresAt() { return expiresAt; }
    public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }
}
