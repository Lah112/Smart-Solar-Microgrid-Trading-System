package com.smartsolar.app.activities;

import android.os.Bundle;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.smartsolar.app.R;
import com.smartsolar.app.adapters.StationAdapter;
import com.smartsolar.app.models.Station;
import com.smartsolar.app.network.ApiClient;

import java.util.ArrayList;
import java.util.List;

public class NearbyStationsMapActivity extends AppCompatActivity implements OnMapReadyCallback {

    private GoogleMap mMap;
    private RecyclerView rvNearbyStations;
    private ApiClient apiClient;
    private StationAdapter adapter;
    private final List<Station> stationList = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_nearby_stations_map);

        apiClient = ApiClient.getInstance(this);

        rvNearbyStations = findViewById(R.id.rvNearbyStations);
        rvNearbyStations.setLayoutManager(new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false));
        adapter = new StationAdapter(this, stationList, station -> {
            if (mMap != null) {
                LatLng pos = new LatLng(station.getLatitude(), station.getLongitude());
                mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(pos, 14f));
            }
        });
        rvNearbyStations.setAdapter(adapter);

        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        if (mapFragment != null) {
            mapFragment.getMapAsync(this);
        }
    }

    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;

        // Default camera centered on Colombo, Sri Lanka
        LatLng colombo = new LatLng(6.9271, 79.8612);
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(colombo, 11f));

        loadNearbyStations(6.9271, 79.8612);
    }

    private void loadNearbyStations(double lat, double lon) {
        apiClient.getNearbyStations(lat, lon, 100, new ApiClient.ApiCallback<List<Station>>() {
            @Override
            public void onSuccess(List<Station> stations) {
                stationList.clear();
                stationList.addAll(stations);
                adapter.notifyDataSetChanged();

                if (mMap != null) {
                    mMap.clear();
                    for (Station s : stations) {
                        LatLng pos = new LatLng(s.getLatitude(), s.getLongitude());
                        mMap.addMarker(new MarkerOptions()
                                .position(pos)
                                .title(s.getName() + " (" + s.getStationCode() + ")")
                                .snippet(s.getCapacityKWh() + " kWh | " + s.getAvailableBatterySlots() + " slots free | Buy: Rs." + s.getUnitRateBuy())
                                .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_ORANGE)));
                    }

                    if (!stations.isEmpty()) {
                        Station first = stations.get(0);
                        mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(new LatLng(first.getLatitude(), first.getLongitude()), 12f));
                    }
                }
            }

            @Override
            public void onError(String errorMessage) {
                Toast.makeText(NearbyStationsMapActivity.this, "Failed to load station map pins: " + errorMessage, Toast.LENGTH_SHORT).show();
            }
        });
    }
}
