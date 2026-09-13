package com.smartsolar.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
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

public class OperatorMainActivity extends AppCompatActivity {

    private SwipeRefreshLayout operatorSwipeRefresh;
    private TextView tvOperatorInfo;
    private Button btnOperatorLogout, btnOpenScanner;
    private RecyclerView rvOperatorQueue;

    private ApiClient apiClient;
    private DatabaseHelper dbHelper;
    private User currentOperator;
    private ReservationAdapter adapter;
    private final List<Reservation> activeQueue = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_operator_main);

        apiClient = ApiClient.getInstance(this);
        dbHelper = new DatabaseHelper(this);
        currentOperator = dbHelper.getActiveUser();

        if (currentOperator == null || !"GridOperator".equalsIgnoreCase(currentOperator.getRole())) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        initViews();
        loadActiveQueue();
    }

    private void initViews() {
        operatorSwipeRefresh = findViewById(R.id.operatorSwipeRefresh);
        tvOperatorInfo = findViewById(R.id.tvOperatorInfo);
        btnOperatorLogout = findViewById(R.id.btnOperatorLogout);
        btnOpenScanner = findViewById(R.id.btnOpenScanner);
        rvOperatorQueue = findViewById(R.id.rvOperatorQueue);

        tvOperatorInfo.setText("Operator: " + currentOperator.getFullName() + " (" + currentOperator.getNic() + ")");

        rvOperatorQueue.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ReservationAdapter(this, activeQueue, reservation -> {
            Intent intent = new Intent(OperatorMainActivity.this, OperatorScannerActivity.class);
            intent.putExtra("qrToken", reservation.getQrCodeToken() != null ? reservation.getQrCodeToken() : reservation.getReservationNumber());
            startActivity(intent);
        });
        rvOperatorQueue.setAdapter(adapter);

        operatorSwipeRefresh.setOnRefreshListener(this::loadActiveQueue);

        btnOpenScanner.setOnClickListener(v -> {
            startActivity(new Intent(OperatorMainActivity.this, OperatorScannerActivity.class));
        });

        btnOperatorLogout.setOnClickListener(v -> {
            dbHelper.clearSession();
            Intent intent = new Intent(OperatorMainActivity.this, LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadActiveQueue();
    }

    private void loadActiveQueue() {
        operatorSwipeRefresh.setRefreshing(true);

        apiClient.getProsumerReservations("", "Approved", new ApiClient.ApiCallback<List<Reservation>>() {
            @Override
            public void onSuccess(List<Reservation> list) {
                operatorSwipeRefresh.setRefreshing(false);
                activeQueue.clear();
                activeQueue.addAll(list);
                adapter.notifyDataSetChanged();
            }

            @Override
            public void onError(String errorMessage) {
                operatorSwipeRefresh.setRefreshing(false);
                Toast.makeText(OperatorMainActivity.this, errorMessage, Toast.LENGTH_SHORT).show();
            }
        });
    }
}
