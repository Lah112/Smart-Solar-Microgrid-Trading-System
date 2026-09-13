package com.smartsolar.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.textfield.TextInputEditText;
import com.smartsolar.app.R;
import com.smartsolar.app.database.DatabaseHelper;
import com.smartsolar.app.models.User;
import com.smartsolar.app.network.ApiClient;

public class ProfileActivity extends AppCompatActivity {

    private TextView tvProfileNic;
    private TextInputEditText etProfFullName, etProfEmail, etProfPhone, etProfSolarCap, etProfAddress;
    private Button btnSaveProfile, btnDeactivateAccount, btnLogout;

    private ApiClient apiClient;
    private DatabaseHelper dbHelper;
    private User currentUser;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        apiClient = ApiClient.getInstance(this);
        dbHelper = new DatabaseHelper(this);
        currentUser = dbHelper.getActiveUser();

        if (currentUser == null) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        initViews();
    }

    private void initViews() {
        tvProfileNic = findViewById(R.id.tvProfileNic);
        etProfFullName = findViewById(R.id.etProfFullName);
        etProfEmail = findViewById(R.id.etProfEmail);
        etProfPhone = findViewById(R.id.etProfPhone);
        etProfSolarCap = findViewById(R.id.etProfSolarCap);
        etProfAddress = findViewById(R.id.etProfAddress);
        btnSaveProfile = findViewById(R.id.btnSaveProfile);
        btnDeactivateAccount = findViewById(R.id.btnDeactivateAccount);
        btnLogout = findViewById(R.id.btnLogout);

        tvProfileNic.setText("NIC: " + currentUser.getNic());
        etProfFullName.setText(currentUser.getFullName());
        etProfEmail.setText(currentUser.getEmail());
        etProfPhone.setText(currentUser.getPhone());
        etProfSolarCap.setText(String.valueOf(currentUser.getSolarCapacityKWh()));
        etProfAddress.setText(currentUser.getAddress());

        btnSaveProfile.setOnClickListener(v -> saveProfileUpdates());
        btnDeactivateAccount.setOnClickListener(v -> confirmDeactivation());
        btnLogout.setOnClickListener(v -> performLogout());
    }

    private void saveProfileUpdates() {
        String name = etProfFullName.getText() != null ? etProfFullName.getText().toString().trim() : "";
        String email = etProfEmail.getText() != null ? etProfEmail.getText().toString().trim() : "";
        String phone = etProfPhone.getText() != null ? etProfPhone.getText().toString().trim() : "";
        String address = etProfAddress.getText() != null ? etProfAddress.getText().toString().trim() : "";
        String capStr = etProfSolarCap.getText() != null ? etProfSolarCap.getText().toString().trim() : "5.0";

        double solarCap = 5.0;
        try {
            solarCap = Double.parseDouble(capStr);
        } catch (Exception ignored) {}

        currentUser.setFullName(name);
        currentUser.setEmail(email);
        currentUser.setPhone(phone);
        currentUser.setAddress(address);
        currentUser.setSolarCapacityKWh(solarCap);

        dbHelper.saveUserSession(currentUser, dbHelper.getActiveToken());
        Toast.makeText(this, "Profile updated successfully.", Toast.LENGTH_SHORT).show();
    }

    private void confirmDeactivation() {
        new AlertDialog.Builder(this)
                .setTitle("Deactivate Account")
                .setMessage("Are you sure you want to deactivate your prosumer account? Note: Deactivated accounts can ONLY be reactivated by a Backoffice administrator.")
                .setPositiveButton("Confirm Deactivation", (dialog, which) -> {
                    apiClient.deactivateAccount(currentUser.getNic(), new ApiClient.ApiCallback<User>() {
                        @Override
                        public void onSuccess(User result) {
                            Toast.makeText(ProfileActivity.this, "Account deactivated. Please contact Backoffice for reactivation.", Toast.LENGTH_LONG).show();
                            Intent intent = new Intent(ProfileActivity.this, LoginActivity.class);
                            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                            startActivity(intent);
                            finish();
                        }

                        @Override
                        public void onError(String errorMessage) {
                            Toast.makeText(ProfileActivity.this, errorMessage, Toast.LENGTH_LONG).show();
                        }
                    });
                })
                .setNegativeButton("Cancel", (dialog, which) -> dialog.dismiss())
                .show();
    }

    private void performLogout() {
        dbHelper.clearSession();
        Intent intent = new Intent(ProfileActivity.this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
