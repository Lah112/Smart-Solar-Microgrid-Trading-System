package com.smartsolar.app.database;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import com.smartsolar.app.models.Reservation;
import com.smartsolar.app.models.Station;
import com.smartsolar.app.models.User;

import java.util.ArrayList;
import java.util.List;

/**
 * Native SQLite Database Helper for local user management, session caching,
 * and offline reference persistence.
 */
public class DatabaseHelper extends SQLiteOpenHelper {

    private static final String DATABASE_NAME = "smart_solar_local.db";
    private static final int DATABASE_VERSION = 1;

    // Table: User Session
    public static final String TABLE_USER = "user_session";
    public static final String COL_NIC = "nic";
    public static final String COL_EMAIL = "email";
    public static final String COL_FULL_NAME = "full_name";
    public static final String COL_ROLE = "role";
    public static final String COL_PHONE = "phone";
    public static final String COL_ADDRESS = "address";
    public static final String COL_STATUS = "status";
    public static final String COL_SOLAR_CAP = "solar_capacity";
    public static final String COL_TOKEN = "jwt_token";

    // Table: Cached Reservations
    public static final String TABLE_RESERVATIONS = "cached_reservations";
    public static final String COL_RES_NO = "reservation_number";
    public static final String COL_RES_NIC = "prosumer_nic";
    public static final String COL_STATION_NAME = "station_name";
    public static final String COL_STATION_CODE = "station_code";
    public static final String COL_DATE = "reservation_date";
    public static final String COL_START_TIME = "start_time";
    public static final String COL_END_TIME = "end_time";
    public static final String COL_TYPE = "transfer_type";
    public static final String COL_KWH = "energy_kwh";
    public static final String COL_TOTAL = "total_amount";
    public static final String COL_RES_STATUS = "status";
    public static final String COL_QR_TOKEN = "qr_token";
    public static final String COL_QR_PAYLOAD = "qr_payload";

    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        // Create user session table
        String createUserTable = "CREATE TABLE " + TABLE_USER + " (" +
                COL_NIC + " TEXT PRIMARY KEY, " +
                COL_EMAIL + " TEXT, " +
                COL_FULL_NAME + " TEXT, " +
                COL_ROLE + " TEXT, " +
                COL_PHONE + " TEXT, " +
                COL_ADDRESS + " TEXT, " +
                COL_STATUS + " TEXT, " +
                COL_SOLAR_CAP + " REAL, " +
                COL_TOKEN + " TEXT);";

        // Create cached reservations table
        String createResTable = "CREATE TABLE " + TABLE_RESERVATIONS + " (" +
                COL_RES_NO + " TEXT PRIMARY KEY, " +
                COL_RES_NIC + " TEXT, " +
                COL_STATION_NAME + " TEXT, " +
                COL_STATION_CODE + " TEXT, " +
                COL_DATE + " TEXT, " +
                COL_START_TIME + " TEXT, " +
                COL_END_TIME + " TEXT, " +
                COL_TYPE + " TEXT, " +
                COL_KWH + " REAL, " +
                COL_TOTAL + " REAL, " +
                COL_RES_STATUS + " TEXT, " +
                COL_QR_TOKEN + " TEXT, " +
                COL_QR_PAYLOAD + " TEXT);";

        db.execSQL(createUserTable);
        db.execSQL(createResTable);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_USER);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_RESERVATIONS);
        onCreate(db);
    }

    // Save active user session to SQLite
    public void saveUserSession(User user, String token) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_USER, null, null); // Clear old session

        ContentValues values = new ContentValues();
        values.put(COL_NIC, user.getNic());
        values.put(COL_EMAIL, user.getEmail());
        values.put(COL_FULL_NAME, user.getFullName());
        values.put(COL_ROLE, user.getRole());
        values.put(COL_PHONE, user.getPhone());
        values.put(COL_ADDRESS, user.getAddress());
        values.put(COL_STATUS, user.getStatus());
        values.put(COL_SOLAR_CAP, user.getSolarCapacityKWh());
        values.put(COL_TOKEN, token);

        db.insert(TABLE_USER, null, values);
    }

    // Get active user session from SQLite
    public User getActiveUser() {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(TABLE_USER, null, null, null, null, null, null);

        if (cursor != null && cursor.moveToFirst()) {
            User user = new User();
            user.setNic(cursor.getString(cursor.getColumnIndexOrThrow(COL_NIC)));
            user.setEmail(cursor.getString(cursor.getColumnIndexOrThrow(COL_EMAIL)));
            user.setFullName(cursor.getString(cursor.getColumnIndexOrThrow(COL_FULL_NAME)));
            user.setRole(cursor.getString(cursor.getColumnIndexOrThrow(COL_ROLE)));
            user.setPhone(cursor.getString(cursor.getColumnIndexOrThrow(COL_PHONE)));
            user.setAddress(cursor.getString(cursor.getColumnIndexOrThrow(COL_ADDRESS)));
            user.setStatus(cursor.getString(cursor.getColumnIndexOrThrow(COL_STATUS)));
            user.setSolarCapacityKWh(cursor.getDouble(cursor.getColumnIndexOrThrow(COL_SOLAR_CAP)));
            cursor.close();
            return user;
        }

        if (cursor != null) cursor.close();
        return null;
    }

    // Get active JWT token from SQLite
    public String getActiveToken() {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(TABLE_USER, new String[]{COL_TOKEN}, null, null, null, null, null);
        String token = null;
        if (cursor != null && cursor.moveToFirst()) {
            token = cursor.getString(cursor.getColumnIndexOrThrow(COL_TOKEN));
            cursor.close();
        }
        return token;
    }

    // Clear session on logout
    public void clearSession() {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_USER, null, null);
        db.delete(TABLE_RESERVATIONS, null, null);
    }

    // Cache reservations list locally
    public void cacheReservations(List<Reservation> list) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_RESERVATIONS, null, null);

        for (Reservation r : list) {
            ContentValues values = new ContentValues();
            values.put(COL_RES_NO, r.getReservationNumber());
            values.put(COL_RES_NIC, r.getProsumerNic());
            values.put(COL_STATION_NAME, r.getStationName());
            values.put(COL_STATION_CODE, r.getStationCode());
            values.put(COL_DATE, r.getReservationDate());
            values.put(COL_START_TIME, r.getStartTime());
            values.put(COL_END_TIME, r.getEndTime());
            values.put(COL_TYPE, r.getTransferType());
            values.put(COL_KWH, r.getEnergyAmountKWh());
            values.put(COL_TOTAL, r.getTotalAmount());
            values.put(COL_RES_STATUS, r.getStatus());
            values.put(COL_QR_TOKEN, r.getQrCodeToken());
            values.put(COL_QR_PAYLOAD, r.getQrCodePayload());
            db.insertWithOnConflict(TABLE_RESERVATIONS, null, values, SQLiteDatabase.CONFLICT_REPLACE);
        }
    }

    // Get cached reservations
    public List<Reservation> getCachedReservations() {
        List<Reservation> list = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(TABLE_RESERVATIONS, null, null, null, null, null, null);

        if (cursor != null && cursor.moveToFirst()) {
            do {
                Reservation r = new Reservation();
                r.setReservationNumber(cursor.getString(cursor.getColumnIndexOrThrow(COL_RES_NO)));
                r.setProsumerNic(cursor.getString(cursor.getColumnIndexOrThrow(COL_RES_NIC)));
                r.setStationName(cursor.getString(cursor.getColumnIndexOrThrow(COL_STATION_NAME)));
                r.setStationCode(cursor.getString(cursor.getColumnIndexOrThrow(COL_STATION_CODE)));
                r.setReservationDate(cursor.getString(cursor.getColumnIndexOrThrow(COL_DATE)));
                r.setStartTime(cursor.getString(cursor.getColumnIndexOrThrow(COL_START_TIME)));
                r.setEndTime(cursor.getString(cursor.getColumnIndexOrThrow(COL_END_TIME)));
                r.setTransferType(cursor.getString(cursor.getColumnIndexOrThrow(COL_TYPE)));
                r.setEnergyAmountKWh(cursor.getDouble(cursor.getColumnIndexOrThrow(COL_KWH)));
                r.setTotalAmount(cursor.getDouble(cursor.getColumnIndexOrThrow(COL_TOTAL)));
                r.setStatus(cursor.getString(cursor.getColumnIndexOrThrow(COL_RES_STATUS)));
                r.setQrCodeToken(cursor.getString(cursor.getColumnIndexOrThrow(COL_QR_TOKEN)));
                r.setQrCodePayload(cursor.getString(cursor.getColumnIndexOrThrow(COL_QR_PAYLOAD)));
                list.add(r);
            } while (cursor.moveToNext());
            cursor.close();
        }
        return list;
    }
}
