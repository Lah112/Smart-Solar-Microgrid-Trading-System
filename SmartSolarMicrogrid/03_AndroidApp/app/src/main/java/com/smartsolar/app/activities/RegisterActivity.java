package com.smartsolar.app.activities;

import android.os.Bundle;
import android.widget.Button;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.textfield.TextInputEditText;
import com.smartsolar.app.R;
import com.smartsolar.app.models.User;
import com.smartsolar.app.network.ApiClient;

import java.util.HashMap;
import java.util.Map;

public class RegisterActivity extends AppCompatActivity {

    private TextInputEditText etNic, etFullName, etEmail, etPassword, etPhone, etSolarCapacity, etAddress;
    private Button btnRegister, btnBackToLogin;
    private ApiClient apiClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        apiClient = ApiClient.getInstance(this);

        etNic = findViewById(R.id.etNic);
        etFullName = findViewById(R.id.etFullName);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        etPhone = findViewById(R.id.etPhone);
        etSolarCapacity = findViewById(R.id.etSolarCapacity);
        etAddress = findViewById(R.id.etAddress);
        btnRegister = findViewById(R.id.btnRegister);
        btnBackToLogin = findViewById(R.id.btnBackToLogin);

        btnRegister.setOnClickListener(v -> performRegistration());
        btnBackToLogin.setOnClickListener(v -> finish());
    }

    private void performRegistration() {
        String nic = etNic.getText() != null ? etNic.getText().toString().trim() : "";
        String fullName = etFullName.getText() != null ? etFullName.getText().toString().trim() : "";
        String email = etEmail.getText() != null ? etEmail.getText().toString().trim() : "";
        String password = etPassword.getText() != null ? etPassword.getText().toString().trim() : "";
        String phone = etPhone.getText() != null ? etPhone.getText().toString().trim() : "";
        String address = etAddress.getText() != null ? etAddress.getText().toString().trim() : "";
        String solarCapStr = etSolarCapacity.getText() != null ? etSolarCapacity.getText().toString().trim() : "5.0";

        if (nic.isEmpty() || fullName.isEmpty() || email.isEmpty() || password.isEmpty() || phone.isEmpty()) {
            Toast.makeText(this, "Please fill in all required fields", Toast.LENGTH_SHORT).show();
            return;
        }

        double solarCapacity = 5.0;
        try {
            solarCapacity = Double.parseDouble(solarCapStr);
        } catch (Exception ignored) {}

        Map<String, Object> data = new HashMap<>();
        data.put("nic", nic);
        data.put("fullName", fullName);
        data.put("email", email);
        data.put("password", password);
        data.put("phone", phone);
        data.put("address", address);
        data.put("solarCapacityKWh", solarCapacity);

        btnRegister.setEnabled(false);
        btnRegister.setText("Creating Account...");

        apiClient.registerProsumer(data, new ApiClient.ApiCallback<User>() {
            @Override
            public void onSuccess(User result) {
                btnRegister.setEnabled(true);
                btnRegister.setText("Create Prosumer Account");
                Toast.makeText(RegisterActivity.this, "Registration successful! You can now sign in.", Toast.LENGTH_LONG).show();
                finish();
            }

            @Override
            public void onError(String errorMessage) {
                btnRegister.setEnabled(true);
                btnRegister.setText("Create Prosumer Account");
                Toast.makeText(RegisterActivity.this, errorMessage, Toast.LENGTH_LONG).show();
            }
        });
    }
}
