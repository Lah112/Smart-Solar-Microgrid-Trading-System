package com.smartsolar.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.smartsolar.app.R;
import com.smartsolar.app.adapters.ReservationAdapter;
import com.smartsolar.app.database.DatabaseHelper;
import com.smartsolar.app.models.Reservation;
import com.smartsolar.app.models.User;
import com.smartsolar.app.network.ApiClient;

import java.util.ArrayList;
import java.util.List;

public class ProsumerMainActivity extends AppCompatActivity {

    private SwipeRefreshLayout swipeRefresh;
    private TextView tvWelcomeName, tvNicBadge, tvActiveCount, tvPendingCount, tvViewAllBookings, tvEmptyState;
    private Button btnNewBooking, btnViewMap;
    private ImageButton btnProfile;
    private RecyclerView rvRecentBookings;

    private ApiClient apiClient;
    private DatabaseHelper dbHelper;
    private User currentUser;
    private ReservationAdapter adapter;
    private final List<Reservation> reservationList = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_prosumer_main);

        apiClient = ApiClient.getInstance(this);
        dbHelper = new DatabaseHelper(this);
        currentUser = dbHelper.getActiveUser();

        if (currentUser == null) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        initViews();
        setupListeners();
        loadDashboardData();
    }

    private void initViews() {
        swipeRefresh = findViewById(R.id.swipeRefresh);
        tvWelcomeName = findViewById(R.id.tvWelcomeName);
        tvNicBadge = findViewById(R.id.tvNicBadge);
        tvActiveCount = findViewById(R.id.tvActiveCount);
        tvPendingCount = findViewById(R.id.tvPendingCount);
        tvViewAllBookings = findViewById(R.id.tvViewAllBookings);
        tvEmptyState = findViewById(R.id.tvEmptyState);
        btnNewBooking = findViewById(R.id.btnNewBooking);
        btnViewMap = findViewById(R.id.btnViewMap);
        btnProfile = findViewById(R.id.btnProfile);
        rvRecentBookings = findViewById(R.id.rvRecentBookings);

        tvWelcomeName.setText("Hello, " + currentUser.getFullName());
        tvNicBadge.setText("NIC: " + currentUser.getNic());

        rvRecentBookings.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ReservationAdapter(this, reservationList, reservation -> {
            Intent intent = new Intent(ProsumerMainActivity.this, ReservationDetailActivity.class);
            intent.putExtra("reservation", reservation);
            startActivity(intent);
        });
        rvRecentBookings.setAdapter(adapter);
    }

    private void setupListeners() {
        swipeRefresh.setOnRefreshListener(this::loadDashboardData);

        btnNewBooking.setOnClickListener(v -> {
            startActivity(new Intent(ProsumerMainActivity.this, NewReservationActivity.class));
        });

        btnViewMap.setOnClickListener(v -> {
            startActivity(new Intent(ProsumerMainActivity.this, NearbyStationsMapActivity.class));
        });

        tvViewAllBookings.setOnClickListener(v -> {
            startActivity(new Intent(ProsumerMainActivity.this, BookingHistoryActivity.class));
        });

        btnProfile.setOnClickListener(v -> {
            startActivity(new Intent(ProsumerMainActivity.this, ProfileActivity.class));
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadDashboardData();
    }

    private void loadDashboardData() {
        swipeRefresh.setRefreshing(true);

        apiClient.getProsumerReservations(currentUser.getNic(), null, new ApiClient.ApiCallback<List<Reservation>>() {
            @Override
            public void onSuccess(List<Reservation> list) {
                swipeRefresh.setRefreshing(false);
                reservationList.clear();
                reservationList.addAll(list);
                adapter.notifyDataSetChanged();

                int active = 0;
                int pending = 0;

                for (Reservation r : list) {
                    if ("Approved".equalsIgnoreCase(r.getStatus())) {
                        active++;
                    } else if ("Pending".equalsIgnoreCase(r.getStatus())) {
                        pending++;
                    }
                }

                tvActiveCount.setText(String.valueOf(active));
                tvPendingCount.setText(String.valueOf(pending));

                if (list.isEmpty()) {
                    tvEmptyState.setVisibility(View.VISIBLE);
                } else {
                    tvEmptyState.setVisibility(View.GONE);
                }
            }

            @Override
            public void onError(String errorMessage) {
                swipeRefresh.setRefreshing(false);
                Toast.makeText(ProsumerMainActivity.this, errorMessage, Toast.LENGTH_SHORT).show();
            }
        });
    }
}
