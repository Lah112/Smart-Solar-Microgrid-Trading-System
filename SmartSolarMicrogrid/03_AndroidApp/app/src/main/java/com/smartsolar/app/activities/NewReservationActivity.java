package com.smartsolar.app.activities;

import android.app.DatePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.smartsolar.app.R;
import com.smartsolar.app.database.DatabaseHelper;
import com.smartsolar.app.models.Reservation;
import com.smartsolar.app.models.Station;
import com.smartsolar.app.models.User;
import com.smartsolar.app.network.ApiClient;
import com.smartsolar.app.utils.DateValidator;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class NewReservationActivity extends AppCompatActivity {

    private Spinner spnStations, spnTransferType;
    private EditText etDate, etStartTime, etEndTime, etEnergyAmount;
    private Button btnSubmitBooking;

    private ApiClient apiClient;
    private DatabaseHelper dbHelper;
    private User currentUser;
    private final List<Station> stationList = new ArrayList<>();
    private final Calendar selectedCalendar = Calendar.getInstance();
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.US);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_new_reservation);

        apiClient = ApiClient.getInstance(this);
        dbHelper = new DatabaseHelper(this);
        currentUser = dbHelper.getActiveUser();

        initViews();
        loadStations();
    }

    private void initViews() {
        spnStations = findViewById(R.id.spnStations);
        spnTransferType = findViewById(R.id.spnTransferType);
        etDate = findViewById(R.id.etDate);
        etStartTime = findViewById(R.id.etStartTime);
        etEndTime = findViewById(R.id.etEndTime);
        etEnergyAmount = findViewById(R.id.etEnergyAmount);
        btnSubmitBooking = findViewById(R.id.btnSubmitBooking);

        // Set default date to tomorrow
        selectedCalendar.add(Calendar.DAY_OF_YEAR, 1);
        etDate.setText(dateFormat.format(selectedCalendar.getTime()));

        etDate.setOnClickListener(v -> showDatePicker());

        // Transfer type options
        String[] types = new String[]{"Drop-Off Solar Energy to Grid", "Charge Battery from Grid"};
        ArrayAdapter<String> typeAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, types);
        spnTransferType.setAdapter(typeAdapter);

        btnSubmitBooking.setOnClickListener(v -> submitReservation());
    }

    private void showDatePicker() {
        DatePickerDialog dialog = new DatePickerDialog(
                this,
                (view, year, month, dayOfMonth) -> {
                    selectedCalendar.set(year, month, dayOfMonth);
                    Date picked = selectedCalendar.getTime();

                    // 7-day rule client-side pre-check
                    if (!DateValidator.isWithin7Days(picked)) {
                        Toast.makeText(this, "Reservations must be scheduled within 7 days from today.", Toast.LENGTH_LONG).show();
                        return;
                    }
                    etDate.setText(dateFormat.format(picked));
                },
                selectedCalendar.get(Calendar.YEAR),
                selectedCalendar.get(Calendar.MONTH),
                selectedCalendar.get(Calendar.DAY_OF_MONTH)
        );

        // Constrain date picker min and max
        dialog.getDatePicker().setMinDate(System.currentTimeMillis());
        Calendar maxCal = Calendar.getInstance();
        maxCal.add(Calendar.DAY_OF_YEAR, 7);
        dialog.getDatePicker().setMaxDate(maxCal.getTimeInMillis());

        dialog.show();
    }

    private void loadStations() {
        apiClient.getStations(new ApiClient.ApiCallback<List<Station>>() {
            @Override
            public void onSuccess(List<Station> stations) {
                stationList.clear();
                stationList.addAll(stations);

                List<String> names = new ArrayList<>();
                for (Station s : stations) {
                    names.add(s.getName() + " (" + s.getStationCode() + ")");
                }

                ArrayAdapter<String> adapter = new ArrayAdapter<>(NewReservationActivity.this, android.R.layout.simple_spinner_dropdown_item, names);
                spnStations.setAdapter(adapter);
            }

            @Override
            public void onError(String errorMessage) {
                Toast.makeText(NewReservationActivity.this, "Failed to load solar stations: " + errorMessage, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void submitReservation() {
        if (stationList.isEmpty() || spnStations.getSelectedItemPosition() < 0) {
            Toast.makeText(this, "Please select a solar station", Toast.LENGTH_SHORT).show();
            return;
        }

        Station selectedStation = stationList.get(spnStations.getSelectedItemPosition());
        String dateStr = etDate.getText().toString().trim();
        String startTime = etStartTime.getText().toString().trim();
        String endTime = etEndTime.getText().toString().trim();
        String kwhStr = etEnergyAmount.getText().toString().trim();

        if (dateStr.isEmpty() || startTime.isEmpty() || endTime.isEmpty() || kwhStr.isEmpty()) {
            Toast.makeText(this, "Please fill in all booking parameters", Toast.LENGTH_SHORT).show();
            return;
        }

        double energyKWh = 10.0;
        try {
            energyKWh = Double.parseDouble(kwhStr);
        } catch (Exception ignored) {}

        String transferType = spnTransferType.getSelectedItemPosition() == 0 ? "DropOff_SolarEnergy" : "Charging";

        Map<String, Object> payload = new HashMap<>();
        payload.put("prosumerNic", currentUser.getNic());
        payload.put("stationId", selectedStation.getId());
        payload.put("reservationDate", dateStr);
        payload.put("startTime", startTime);
        payload.put("endTime", endTime);
        payload.put("transferType", transferType);
        payload.put("energyAmountKWh", energyKWh);
        payload.put("notes", "Mobile power reservation");

        btnSubmitBooking.setEnabled(false);
        btnSubmitBooking.setText("Scheduling Slot...");

        apiClient.createReservation(payload, new ApiClient.ApiCallback<Reservation>() {
            @Override
            public void onSuccess(Reservation reservation) {
                btnSubmitBooking.setEnabled(true);
                btnSubmitBooking.setText("Confirm & Generate QR");
                Toast.makeText(NewReservationActivity.this, "Slot reserved and approved successfully!", Toast.LENGTH_LONG).show();

                Intent intent = new Intent(NewReservationActivity.this, ReservationDetailActivity.class);
                intent.putExtra("reservation", reservation);
                startActivity(intent);
                finish();
            }

            @Override
            public void onError(String errorMessage) {
                btnSubmitBooking.setEnabled(true);
                btnSubmitBooking.setText("Confirm & Generate QR");
                Toast.makeText(NewReservationActivity.this, errorMessage, Toast.LENGTH_LONG).show();
            }
        });
    }
}
