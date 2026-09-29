package com.smartsolar.app.activities;

import android.os.Bundle;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.smartsolar.app.R;
import com.smartsolar.app.adapters.StationAdapter;
import com.smartsolar.app.models.Station;
import com.smartsolar.app.network.ApiClient;

import org.osmdroid.api.IMapController;
import org.osmdroid.config.Configuration;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.Marker;

import java.util.ArrayList;
import java.util.List;

public class NearbyStationsMapActivity extends AppCompatActivity {

    private MapView mapView;
    private IMapController mapController;
    private RecyclerView rvNearbyStations;
    private ApiClient apiClient;
    private StationAdapter adapter;
    private final List<Station> stationList = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize OSMDroid configuration before layout inflation
        Configuration.getInstance().load(this, getSharedPreferences("osmdroid", MODE_PRIVATE));
        Configuration.getInstance().setUserAgentValue(getPackageName());

        setContentView(R.layout.activity_nearby_stations_map);

        apiClient = ApiClient.getInstance(this);

        mapView = findViewById(R.id.mapView);
        mapView.setTileSource(TileSourceFactory.MAPNIK);
        mapView.setMultiTouchControls(true);

        mapController = mapView.getController();
        mapController.setZoom(12.0);
        GeoPoint colombo = new GeoPoint(6.9271, 79.8612);
        mapController.setCenter(colombo);

        rvNearbyStations = findViewById(R.id.rvNearbyStations);
        rvNearbyStations.setLayoutManager(new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false));
        adapter = new StationAdapter(this, stationList, station -> {
            if (mapController != null) {
                GeoPoint pos = new GeoPoint(station.getLatitude(), station.getLongitude());
                mapController.setZoom(15.0);
                mapController.animateTo(pos);
            }
        });
        rvNearbyStations.setAdapter(adapter);

        loadNearbyStations(6.9271, 79.8612);
    }

    private void loadNearbyStations(double lat, double lon) {
        apiClient.getNearbyStations(lat, lon, 100, new ApiClient.ApiCallback<List<Station>>() {
            @Override
            public void onSuccess(List<Station> stations) {
                stationList.clear();
                stationList.addAll(stations);
                adapter.notifyDataSetChanged();

                if (mapView != null) {
                    mapView.getOverlays().clear();
                    for (Station s : stations) {
                        GeoPoint pos = new GeoPoint(s.getLatitude(), s.getLongitude());
                        Marker marker = new Marker(mapView);
                        marker.setPosition(pos);
                        marker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
                        marker.setTitle(s.getName() + " (" + s.getStationCode() + ")");
                        marker.setSnippet(s.getCapacityKWh() + " kWh | " + s.getAvailableBatterySlots() + " slots free | Buy: Rs." + s.getUnitRateBuy());
                        mapView.getOverlays().add(marker);
                    }
                    mapView.invalidate();

                    if (!stations.isEmpty()) {
                        Station first = stations.get(0);
                        mapController.setZoom(13.0);
                        mapController.animateTo(new GeoPoint(first.getLatitude(), first.getLongitude()));
                    }
                }
            }

            @Override
            public void onError(String errorMessage) {
                Toast.makeText(NearbyStationsMapActivity.this, "Failed to load station map pins: " + errorMessage, Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (mapView != null) {
            mapView.onResume();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (mapView != null) {
            mapView.onPause();
        }
    }
}
