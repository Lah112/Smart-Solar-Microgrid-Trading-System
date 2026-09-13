package com.smartsolar.app.activities;

import android.app.AlertDialog;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.smartsolar.app.R;
import com.smartsolar.app.models.Reservation;
import com.smartsolar.app.network.ApiClient;
import com.smartsolar.app.utils.DateValidator;
import com.smartsolar.app.utils.QRHelper;

public class ReservationDetailActivity extends AppCompatActivity {

    private ImageView ivQrCode;
    private TextView tvResNumber, tvStatusBadge, tvDetailStation, tvDetailDateTime, tvDetailEnergy, tvDetailAmount;
    private LinearLayout layoutActions;
    private Button btnModify, btnCancel;

    private Reservation reservation;
    private ApiClient apiClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_reservation_detail);

        apiClient = ApiClient.getInstance(this);
        reservation = (Reservation) getIntent().getSerializableExtra("reservation");

        if (reservation == null) {
            Toast.makeText(this, "Reservation not found", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        initViews();
        displayReservationData();
    }

    private void initViews() {
        ivQrCode = findViewById(R.id.ivQrCode);
        tvResNumber = findViewById(R.id.tvResNumber);
        tvStatusBadge = findViewById(R.id.tvStatusBadge);
        tvDetailStation = findViewById(R.id.tvDetailStation);
        tvDetailDateTime = findViewById(R.id.tvDetailDateTime);
        tvDetailEnergy = findViewById(R.id.tvDetailEnergy);
        tvDetailAmount = findViewById(R.id.tvDetailAmount);
        layoutActions = findViewById(R.id.layoutActions);
        btnModify = findViewById(R.id.btnModify);
        btnCancel = findViewById(R.id.btnCancel);

        btnModify.setOnClickListener(v -> showModifyDialog());
        btnCancel.setOnClickListener(v -> showCancelDialog());
    }

    private void displayReservationData() {
        tvResNumber.setText(reservation.getReservationNumber());
        tvStatusBadge.setText("Status: " + reservation.getStatus());
        tvDetailStation.setText("Station: " + (reservation.getStationName() != null ? reservation.getStationName() : reservation.getStationCode()));

        String cleanDate = reservation.getReservationDate() != null && reservation.getReservationDate().contains("T")
                ? reservation.getReservationDate().split("T")[0]
                : reservation.getReservationDate();
        tvDetailDateTime.setText("Schedule: " + cleanDate + " (" + reservation.getStartTime() + " - " + reservation.getEndTime() + ")");

        tvDetailEnergy.setText("Energy Volume: " + reservation.getEnergyAmountKWh() + " kWh (" + reservation.getTransferType() + ")");
        tvDetailAmount.setText("Turnover: Rs. " + reservation.getTotalAmount());

        // Generate QR code bitmap
        String qrContent = reservation.getQrCodePayload();
        if (qrContent == null || qrContent.isEmpty()) {
            qrContent = reservation.getQrCodeToken();
        }
        if (qrContent == null || qrContent.isEmpty()) {
            qrContent = reservation.getReservationNumber();
        }

        Bitmap qrBitmap = QRHelper.generateQRCodeBitmap(qrContent, 400, 400);
        if (qrBitmap != null) {
            ivQrCode.setImageBitmap(qrBitmap);
        }

        // Action buttons visibility
        if ("Approved".equalsIgnoreCase(reservation.getStatus()) || "Pending".equalsIgnoreCase(reservation.getStatus())) {
            layoutActions.setVisibility(View.VISIBLE);
        } else {
            layoutActions.setVisibility(View.GONE);
        }
    }

    private void showModifyDialog() {
        // Client-side 12-hour notice pre-check
        String dateStr = reservation.getReservationDate();
        String timeStr = reservation.getStartTime();
        if (!DateValidator.has12HoursNotice(dateStr, timeStr)) {
            Toast.makeText(this, "Cannot modify: Updates require at least 12 hours notice prior to scheduled slot.", Toast.LENGTH_LONG).show();
            return;
        }

        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Modify Reservation Volume");

        final EditText input = new EditText(this);
        input.setHint("New Energy Amount (kW/h)");
        input.setText(String.valueOf(reservation.getEnergyAmountKWh()));
        builder.setView(input);

        builder.setPositiveButton("Save", (dialog, which) -> {
            String val = input.getText().toString().trim();
            if (!val.isEmpty()) {
                double newKwh = Double.parseDouble(val);
                updateReservation(newKwh);
            }
        });
        builder.setNegativeButton("Cancel", (dialog, which) -> dialog.cancel());
        builder.show();
    }

    private void updateReservation(double newKwh) {
        apiClient.updateReservation(reservation.getId(), newKwh, "Updated via mobile app", new ApiClient.ApiCallback<Reservation>() {
            @Override
            public void onSuccess(Reservation result) {
                reservation = result;
                displayReservationData();
                Toast.makeText(ReservationDetailActivity.this, "Reservation updated successfully!", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onError(String errorMessage) {
                Toast.makeText(ReservationDetailActivity.this, errorMessage, Toast.LENGTH_LONG).show();
            }
        });
    }

    private void showCancelDialog() {
        // Client-side 12-hour notice pre-check
        String dateStr = reservation.getReservationDate();
        String timeStr = reservation.getStartTime();
        if (!DateValidator.has12HoursNotice(dateStr, timeStr)) {
            Toast.makeText(this, "Cannot cancel: Cancellations require at least 12 hours notice prior to scheduled slot.", Toast.LENGTH_LONG).show();
            return;
        }

        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Cancel Reservation");
        builder.setMessage("Are you sure you want to cancel this reservation? (12-hour notice rule enforced)");

        final EditText input = new EditText(this);
        input.setHint("Reason for cancellation");
        input.setText("Rescheduling energy transfer");
        builder.setView(input);

        builder.setPositiveButton("Confirm Cancellation", (dialog, which) -> {
            String reason = input.getText().toString().trim();
            cancelReservation(reason);
        });
        builder.setNegativeButton("Back", (dialog, which) -> dialog.cancel());
        builder.show();
    }

    private void cancelReservation(String reason) {
        apiClient.cancelReservation(reservation.getId(), reason, new ApiClient.ApiCallback<Reservation>() {
            @Override
            public void onSuccess(Reservation result) {
                reservation = result;
                displayReservationData();
                Toast.makeText(ReservationDetailActivity.this, "Reservation cancelled.", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onError(String errorMessage) {
                Toast.makeText(ReservationDetailActivity.this, errorMessage, Toast.LENGTH_LONG).show();
            }
        });
    }
}
