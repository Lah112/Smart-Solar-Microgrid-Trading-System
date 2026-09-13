package com.smartsolar.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.textfield.TextInputEditText;
import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;
import com.smartsolar.app.R;
import com.smartsolar.app.models.Reservation;
import com.smartsolar.app.network.ApiClient;

public class OperatorScannerActivity extends AppCompatActivity {

    private TextInputEditText etQrTokenInput, etOperatorNotes;
    private Button btnVerifyFinalize, btnLaunchCameraScan;
    private ApiClient apiClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_operator_scanner);

        apiClient = ApiClient.getInstance(this);

        etQrTokenInput = findViewById(R.id.etQrTokenInput);
        etOperatorNotes = findViewById(R.id.etOperatorNotes);
        btnVerifyFinalize = findViewById(R.id.btnVerifyFinalize);
        btnLaunchCameraScan = findViewById(R.id.btnLaunchCameraScan);

        // Pre-fill token if passed from list
        String initialToken = getIntent().getStringExtra("qrToken");
        if (initialToken != null) {
            etQrTokenInput.setText(initialToken);
        }

        btnVerifyFinalize.setOnClickListener(v -> performVerification());

        btnLaunchCameraScan.setOnClickListener(v -> {
            IntentIntegrator integrator = new IntentIntegrator(OperatorScannerActivity.this);
            integrator.setPrompt("Scan Prosumer Transaction QR Code");
            integrator.setOrientationLocked(false);
            integrator.setBeepEnabled(true);
            integrator.initiateScan();
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        IntentResult result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);
        if (result != null) {
            if (result.getContents() != null) {
                etQrTokenInput.setText(result.getContents());
                performVerification();
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    private void performVerification() {
        String token = etQrTokenInput.getText() != null ? etQrTokenInput.getText().toString().trim() : "";
        String notes = etOperatorNotes.getText() != null ? etOperatorNotes.getText().toString().trim() : "";

        if (token.isEmpty()) {
            Toast.makeText(this, "Please enter or scan a QR code token", Toast.LENGTH_SHORT).show();
            return;
        }

        btnVerifyFinalize.setEnabled(false);
        btnVerifyFinalize.setText("Verifying with Grid Server...");

        apiClient.verifyQr(token, notes, new ApiClient.ApiCallback<Reservation>() {
            @Override
            public void onSuccess(Reservation res) {
                btnVerifyFinalize.setEnabled(true);
                btnVerifyFinalize.setText("Verify & Finalize Transfer");

                new AlertDialog.Builder(OperatorScannerActivity.this)
                        .setTitle("Energy Transfer Finalized!")
                        .setMessage("Reservation #" + res.getReservationNumber() + "\n" +
                                "Prosumer: " + res.getProsumerName() + "\n" +
                                "Volume: " + res.getEnergyAmountKWh() + " kWh\n" +
                                "Status: " + res.getStatus() + "\n\n" +
                                "Database records & station battery capacity updated successfully.")
                        .setPositiveButton("Done", (dialog, which) -> finish())
                        .show();
            }

            @Override
            public void onError(String errorMessage) {
                btnVerifyFinalize.setEnabled(true);
                btnVerifyFinalize.setText("Verify & Finalize Transfer");
                Toast.makeText(OperatorScannerActivity.this, errorMessage, Toast.LENGTH_LONG).show();
            }
        });
    }
}
