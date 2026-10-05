/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: Program.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Application entry point, dependency injection, MongoDB setup, JWT authentication, and Swagger configuration.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SmartSolar.API.Helpers;
using SmartSolar.API.Middleware;
using SmartSolar.API.Models;
using SmartSolar.API.Repositories;
using SmartSolar.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ============================================================================
// 1. Configure MongoDB Settings & Database Services
// ============================================================================
builder.Services.Configure<DatabaseSettings>(
    builder.Configuration.GetSection("DatabaseSettings"));

// Register MongoDB Repositories
builder.Services.AddSingleton<IMongoRepository<User>>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<DatabaseSettings>>();
    return new MongoRepository<User>(settings, settings.Value.UsersCollectionName);
});

builder.Services.AddSingleton<IMongoRepository<SolarStationInfo>>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<DatabaseSettings>>();
    return new MongoRepository<SolarStationInfo>(settings, settings.Value.SolarStationsCollectionName);
});

builder.Services.AddSingleton<IMongoRepository<EnergyBookingSlot>>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<DatabaseSettings>>();
    return new MongoRepository<EnergyBookingSlot>(settings, settings.Value.BookingSlotsCollectionName);
});

builder.Services.AddSingleton<IMongoRepository<EnergyReservation>>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<DatabaseSettings>>();
    return new MongoRepository<EnergyReservation>(settings, settings.Value.ReservationsCollectionName);
});

// ============================================================================
// 2. Register Business Logic Services (FAT Service Architecture)
// ============================================================================
builder.Services.AddSingleton<JwtHelper>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IStationService, StationService>();
builder.Services.AddScoped<IBookingSlotService, BookingSlotService>();
builder.Services.AddScoped<IReservationService, ReservationService>();

// ============================================================================
// 3. Configure JWT Authentication & Authorization
// ============================================================================
var secretKey = builder.Configuration["JwtSettings:SecretKey"] ?? "SmartSolarMicrogridEnterpriseSecretKey2026!@#$%^SecureKeyForAuth";
var issuer = builder.Configuration["JwtSettings:Issuer"] ?? "SmartSolarAPI";
var audience = builder.Configuration["JwtSettings:Audience"] ?? "SmartSolarClients";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = issuer,
        ValidateAudience = true,
        ValidAudience = audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// ============================================================================
// 4. Configure CORS for React WebApp & Native Android Mobile App
// ============================================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ============================================================================
// 5. Configure Swagger / OpenAPI Documentation with JWT Support
// ============================================================================
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Smart Solar Microgrid Trading System API",
        Version = "v1",
        Description = "Central RESTful Web Service providing business logic for Backoffice Web Application and Pure Native Android Mobile App."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
});

var app = builder.Build();

// ============================================================================
// 6. Request Pipeline & Middleware
// ============================================================================
app.UseMiddleware<ExceptionMiddleware>();

// Enable Swagger UI in development and production for easy grading verification
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Smart Solar Microgrid Trading API v1");
    c.RoutePrefix = string.Empty; // Swagger available at root URL
});

app.UseRouting();
app.UseCors("AllowAllPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run("http://0.0.0.0:5179");
