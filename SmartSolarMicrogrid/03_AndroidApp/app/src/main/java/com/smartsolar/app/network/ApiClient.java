package com.smartsolar.app.network;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.smartsolar.app.database.DatabaseHelper;
import com.smartsolar.app.models.DashboardStats;
import com.smartsolar.app.models.LoginResponse;
import com.smartsolar.app.models.Reservation;
import com.smartsolar.app.models.Station;
import com.smartsolar.app.models.User;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * Native HTTP Client for communication with the centralized C# Web API.
 * Uses 10.0.2.2 for default Android Emulator loopback to host port 5000.
 */
public class ApiClient {

    public static String BASE_URL = "http://10.0.2.2:5179/api";
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    private static ApiClient instance;
    private final OkHttpClient client;
    private final Gson gson;
    private final DatabaseHelper dbHelper;
    private final Handler mainHandler;

    public interface ApiCallback<T> {
        void onSuccess(T result);
        void onError(String errorMessage);
    }

    private ApiClient(Context context) {
        this.client = new OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .build();
        this.gson = new Gson();
        this.dbHelper = new DatabaseHelper(context.getApplicationContext());
        this.mainHandler = new Handler(Looper.getMainLooper());
    }

    public static synchronized ApiClient getInstance(Context context) {
        if (instance == null) {
            instance = new ApiClient(context);
        }
        return instance;
    }

    // Helper to build authorized request
    private Request.Builder newRequestBuilder(String endpoint) {
        Request.Builder builder = new Request.Builder().url(BASE_URL + endpoint);
        String token = dbHelper.getActiveToken();
        if (token != null && !token.isEmpty()) {
            builder.addHeader("Authorization", "Bearer " + token);
        }
        return builder;
    }

    // 1. User Login
    public void login(String username, String password, ApiCallback<LoginResponse> callback) {
        Map<String, String> bodyMap = new HashMap<>();
        bodyMap.put("username", username);
        bodyMap.put("password", password);

        RequestBody body = RequestBody.create(gson.toJson(bodyMap), JSON);
        Request request = new Request.Builder()
                .url(BASE_URL + "/auth/login")
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                postError(callback, "Connection error: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseBody = response.body().string();
                if (response.isSuccessful()) {
                    LoginResponse res = gson.fromJson(responseBody, LoginResponse.class);
                    // Persist to local SQLite DB
                    User user = new User();
                    user.setNic(res.getNic());
                    user.setFullName(res.getFullName());
                    user.setEmail(res.getEmail());
                    user.setRole(res.getRole());
                    user.setStatus(res.getStatus());
                    user.setPhone(res.getPhone());
                    user.setAddress(res.getAddress());
                    user.setSolarCapacityKWh(res.getSolarCapacityKWh());
                    dbHelper.saveUserSession(user, res.getToken());

                    postSuccess(callback, res);
                } else {
                    postError(callback, parseErrorMessage(responseBody));
                }
            }
        });
    }

    // 2. Register Prosumer (NIC primary key)
    public void registerProsumer(Map<String, Object> prosumerData, ApiCallback<User> callback) {
        RequestBody body = RequestBody.create(gson.toJson(prosumerData), JSON);
        Request request = new Request.Builder()
                .url(BASE_URL + "/auth/register-prosumer")
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                postError(callback, "Connection failed: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseBody = response.body().string();
                if (response.isSuccessful()) {
                    User user = gson.fromJson(responseBody, User.class);
                    postSuccess(callback, user);
                } else {
                    postError(callback, parseErrorMessage(responseBody));
                }
            }
        });
    }

    // 3. Get Dashboard Stats
    public void getDashboardStats(ApiCallback<DashboardStats> callback) {
        Request request = newRequestBuilder("/dashboard/stats").get().build();
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                postError(callback, "Network error: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseBody = response.body().string();
                if (response.isSuccessful()) {
                    DashboardStats stats = gson.fromJson(responseBody, DashboardStats.class);
                    postSuccess(callback, stats);
                } else {
                    postError(callback, parseErrorMessage(responseBody));
                }
            }
        });
    }

    // 4. Get Solar Stations
    public void getStations(ApiCallback<List<Station>> callback) {
        Request request = newRequestBuilder("/stations?activeOnly=true").get().build();
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                postError(callback, "Network error: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseBody = response.body().string();
                if (response.isSuccessful()) {
                    Type type = new TypeToken<List<Station>>() {}.getType();
                    List<Station> list = gson.fromJson(responseBody, type);
                    postSuccess(callback, list);
                } else {
                    postError(callback, parseErrorMessage(responseBody));
                }
            }
        });
    }

    // 5. Get Nearby Stations (GPS coordinates)
    public void getNearbyStations(double lat, double lon, double radiusKm, ApiCallback<List<Station>> callback) {
        String endpoint = "/stations/nearby?latitude=" + lat + "&longitude=" + lon + "&radiusKm=" + radiusKm;
        Request request = newRequestBuilder(endpoint).get().build();
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                postError(callback, "Network error: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseBody = response.body().string();
                if (response.isSuccessful()) {
                    Type type = new TypeToken<List<Station>>() {}.getType();
                    List<Station> list = gson.fromJson(responseBody, type);
                    postSuccess(callback, list);
                } else {
                    postError(callback, parseErrorMessage(responseBody));
                }
            }
        });
    }

    // 6. Get Prosumer Reservations History
    public void getProsumerReservations(String nic, String status, ApiCallback<List<Reservation>> callback) {
        String endpoint = "/reservations/prosumer/" + nic;
        if (status != null && !status.isEmpty()) {
            endpoint += "?status=" + status;
        }

        Request request = newRequestBuilder(endpoint).get().build();
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                // Fallback to SQLite cache on network failure
                List<Reservation> cached = dbHelper.getCachedReservations();
                if (!cached.isEmpty()) {
                    postSuccess(callback, cached);
                } else {
                    postError(callback, "Network error: " + e.getMessage());
                }
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseBody = response.body().string();
                if (response.isSuccessful()) {
                    Type type = new TypeToken<List<Reservation>>() {}.getType();
                    List<Reservation> list = gson.fromJson(responseBody, type);
                    // Cache to SQLite
                    dbHelper.cacheReservations(list);
                    postSuccess(callback, list);
                } else {
                    postError(callback, parseErrorMessage(responseBody));
                }
            }
        });
    }

    // 7. Create Reservation (Enforces 7-day rule on central API)
    public void createReservation(Map<String, Object> data, ApiCallback<Reservation> callback) {
        RequestBody body = RequestBody.create(gson.toJson(data), JSON);
        Request request = newRequestBuilder("/reservations").post(body).build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                postError(callback, "Network error: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseBody = response.body().string();
                if (response.isSuccessful()) {
                    Reservation res = gson.fromJson(responseBody, Reservation.class);
                    postSuccess(callback, res);
                } else {
                    postError(callback, parseErrorMessage(responseBody));
                }
            }
        });
    }

    // 8. Update Reservation (Enforces 12-hour rule on central API)
    public void updateReservation(String id, double kwh, String notes, ApiCallback<Reservation> callback) {
        Map<String, Object> data = new HashMap<>();
        data.put("energyAmountKWh", kwh);
        if (notes != null) data.put("notes", notes);

        RequestBody body = RequestBody.create(gson.toJson(data), JSON);
        Request request = newRequestBuilder("/reservations/" + id).put(body).build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                postError(callback, "Network error: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseBody = response.body().string();
                if (response.isSuccessful()) {
                    Reservation res = gson.fromJson(responseBody, Reservation.class);
                    postSuccess(callback, res);
                } else {
                    postError(callback, parseErrorMessage(responseBody));
                }
            }
        });
    }

    // 9. Cancel Reservation (Enforces 12-hour rule on central API)
    public void cancelReservation(String id, String reason, ApiCallback<Reservation> callback) {
        Map<String, String> data = new HashMap<>();
        data.put("reason", reason);

        RequestBody body = RequestBody.create(gson.toJson(data), JSON);
        Request request = newRequestBuilder("/reservations/" + id + "/cancel").put(body).build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                postError(callback, "Network error: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseBody = response.body().string();
                if (response.isSuccessful()) {
                    Reservation res = gson.fromJson(responseBody, Reservation.class);
                    postSuccess(callback, res);
                } else {
                    postError(callback, parseErrorMessage(responseBody));
                }
            }
        });
    }

    // 10. Operator Mode: Verify QR Code and finalize transaction
    public void verifyQr(String qrToken, String notes, ApiCallback<Reservation> callback) {
        Map<String, String> data = new HashMap<>();
        data.put("qrToken", qrToken);
        if (notes != null) data.put("operatorNotes", notes);

        RequestBody body = RequestBody.create(gson.toJson(data), JSON);
        Request request = newRequestBuilder("/reservations/verify-qr").post(body).build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                postError(callback, "Network error: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseBody = response.body().string();
                if (response.isSuccessful()) {
                    Reservation res = gson.fromJson(responseBody, Reservation.class);
                    postSuccess(callback, res);
                } else {
                    postError(callback, parseErrorMessage(responseBody));
                }
            }
        });
    }

    // 11. Deactivate Prosumer Account Request
    public void deactivateAccount(String nic, ApiCallback<User> callback) {
        Request request = newRequestBuilder("/users/" + nic + "/deactivate").put(RequestBody.create(new byte[0])).build();
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                postError(callback, "Network error: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String responseBody = response.body().string();
                if (response.isSuccessful()) {
                    User u = gson.fromJson(responseBody, User.class);
                    dbHelper.clearSession();
                    postSuccess(callback, u);
                } else {
                    postError(callback, parseErrorMessage(responseBody));
                }
            }
        });
    }

    // Helpers to dispatch to Main Thread
    private <T> void postSuccess(ApiCallback<T> callback, T result) {
        mainHandler.post(() -> callback.onSuccess(result));
    }

    private <T> void postError(ApiCallback<T> callback, String error) {
        mainHandler.post(() -> callback.onError(error));
    }

    private String parseErrorMessage(String json) {
        try {
            Map map = gson.fromJson(json, Map.class);
            if (map != null && map.containsKey("message")) {
                return map.get("message").toString();
            }
        } catch (Exception ignored) {}
        return "Request failed: " + json;
    }
}
