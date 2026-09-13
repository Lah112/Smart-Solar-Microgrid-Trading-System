package com.smartsolar.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.tabs.TabLayout;
import com.smartsolar.app.R;
import com.smartsolar.app.adapters.ReservationAdapter;
import com.smartsolar.app.database.DatabaseHelper;
import com.smartsolar.app.models.Reservation;
import com.smartsolar.app.models.User;
import com.smartsolar.app.network.ApiClient;

import java.util.ArrayList;
import java.util.List;

public class BookingHistoryActivity extends AppCompatActivity {

    private EditText etSearch;
    private TabLayout tabLayout;
    private RecyclerView rvBookings;

    private ApiClient apiClient;
    private DatabaseHelper dbHelper;
    private User currentUser;
    private ReservationAdapter adapter;
    private final List<Reservation> allReservations = new ArrayList<>();
    private final List<Reservation> displayedReservations = new ArrayList<>();
    private String currentTabStatus = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_booking_history);

        apiClient = ApiClient.getInstance(this);
        dbHelper = new DatabaseHelper(this);
        currentUser = dbHelper.getActiveUser();

        initViews();
        loadReservations();
    }

    private void initViews() {
        etSearch = findViewById(R.id.etSearch);
        tabLayout = findViewById(R.id.tabLayout);
        rvBookings = findViewById(R.id.rvBookings);

        rvBookings.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ReservationAdapter(this, displayedReservations, reservation -> {
            Intent intent = new Intent(BookingHistoryActivity.this, ReservationDetailActivity.class);
            intent.putExtra("reservation", reservation);
            startActivity(intent);
        });
        rvBookings.setAdapter(adapter);

        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int count, int after) {
                filterList(s.toString());
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                int position = tab.getPosition();
                if (position == 0) currentTabStatus = "";
                else if (position == 1) currentTabStatus = "Approved";
                else if (position == 2) currentTabStatus = "Pending";
                else if (position == 3) currentTabStatus = "Completed";

                filterList(etSearch.getText().toString());
            }

            @Override
            public void onTabUnselected(TabLayout.Tab tab) {}

            @Override
            public void onTabReselected(TabLayout.Tab tab) {}
        });
    }

    private void loadReservations() {
        apiClient.getProsumerReservations(currentUser.getNic(), null, new ApiClient.ApiCallback<List<Reservation>>() {
            @Override
            public void onSuccess(List<Reservation> list) {
                allReservations.clear();
                allReservations.addAll(list);
                filterList(etSearch.getText().toString());
            }

            @Override
            public void onError(String errorMessage) {
                Toast.makeText(BookingHistoryActivity.this, errorMessage, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void filterList(String keyword) {
        displayedReservations.clear();
        String term = keyword != null ? keyword.toLowerCase().trim() : "";

        for (Reservation r : allReservations) {
            boolean matchesTab = currentTabStatus.isEmpty() || currentTabStatus.equalsIgnoreCase(r.getStatus());
            boolean matchesSearch = term.isEmpty() ||
                    (r.getReservationNumber() != null && r.getReservationNumber().toLowerCase().contains(term)) ||
                    (r.getStationName() != null && r.getStationName().toLowerCase().contains(term)) ||
                    (r.getStationCode() != null && r.getStationCode().toLowerCase().contains(term));

            if (matchesTab && matchesSearch) {
                displayedReservations.add(r);
            }
        }
        adapter.notifyDataSetChanged();
    }
}
