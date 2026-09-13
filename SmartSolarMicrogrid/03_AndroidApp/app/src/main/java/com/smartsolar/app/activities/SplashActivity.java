package com.smartsolar.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import androidx.appcompat.app.AppCompatActivity;

import com.smartsolar.app.R;
import com.smartsolar.app.database.DatabaseHelper;
import com.smartsolar.app.models.User;

public class SplashActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            DatabaseHelper db = new DatabaseHelper(this);
            User activeUser = db.getActiveUser();

            if (activeUser != null && db.getActiveToken() != null) {
                if ("GridOperator".equalsIgnoreCase(activeUser.getRole())) {
                    startActivity(new Intent(SplashActivity.this, OperatorMainActivity.class));
                } else {
                    startActivity(new Intent(SplashActivity.this, ProsumerMainActivity.class));
                }
            } else {
                startActivity(new Intent(SplashActivity.this, LoginActivity.class));
            }
            finish();
        }, 1200);
    }
}
