package com.smartsolar.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.textfield.TextInputEditText;
import com.smartsolar.app.R;
import com.smartsolar.app.models.LoginResponse;
import com.smartsolar.app.network.ApiClient;

public class LoginActivity extends AppCompatActivity {

    private TextInputEditText etUsername, etPassword;
    private Button btnLogin, btnQuickProsumer, btnQuickOperator;
    private TextView tvRegister;
    private ApiClient apiClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        apiClient = ApiClient.getInstance(this);

        etUsername = findViewById(R.id.etUsername);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        btnQuickProsumer = findViewById(R.id.btnQuickProsumer);
        btnQuickOperator = findViewById(R.id.btnQuickOperator);
        tvRegister = findViewById(R.id.tvRegister);

        btnLogin.setOnClickListener(v -> performLogin());

        tvRegister.setOnClickListener(v -> {
            startActivity(new Intent(LoginActivity.this, RegisterActivity.class));
        });

        btnQuickProsumer.setOnClickListener(v -> {
            etUsername.setText("981234567V");
            etPassword.setText("Password@123");
            performLogin();
        });

        btnQuickOperator.setOnClickListener(v -> {
            etUsername.setText("OPERATOR001");
            etPassword.setText("Password@123");
            performLogin();
        });
    }

    private void performLogin() {
        String username = etUsername.getText() != null ? etUsername.getText().toString().trim() : "";
        String password = etPassword.getText() != null ? etPassword.getText().toString().trim() : "";

        if (username.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please enter your NIC/Email and password", Toast.LENGTH_SHORT).show();
            return;
        }

        btnLogin.setEnabled(false);
        btnLogin.setText("Signing In...");

        apiClient.login(username, password, new ApiClient.ApiCallback<LoginResponse>() {
            @Override
            public void onSuccess(LoginResponse result) {
                btnLogin.setEnabled(true);
                btnLogin.setText("Sign In");
                Toast.makeText(LoginActivity.this, "Welcome " + result.getFullName(), Toast.LENGTH_SHORT).show();

                if ("GridOperator".equalsIgnoreCase(result.getRole())) {
                    startActivity(new Intent(LoginActivity.this, OperatorMainActivity.class));
                } else {
                    startActivity(new Intent(LoginActivity.this, ProsumerMainActivity.class));
                }
                finish();
            }

            @Override
            public void onError(String errorMessage) {
                btnLogin.setEnabled(true);
                btnLogin.setText("Sign In");
                Toast.makeText(LoginActivity.this, errorMessage, Toast.LENGTH_LONG).show();
            }
        });
    }
}
