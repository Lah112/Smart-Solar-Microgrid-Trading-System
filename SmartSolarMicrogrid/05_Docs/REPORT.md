# Smart Solar Microgrid Trading System
## Comprehensive Technical Project Report

**Course**: SE4040 – Enterprise Application Development  
**Academic Year**: Year 4 Semester 2 (2026)  
**Institution**: Faculty of Computing, Sri Lanka Institute of Information Technology (SLIIT)  
**Submission Date**: 30th September 2026  

---

## 1. Executive Summary

The **Smart Solar Microgrid Trading System** is an enterprise-scale, client-server distributed software solution designed to facilitate decentralized clean energy trading across regional solar microgrid hubs. The platform bridges the gap between rooftop solar owners (**Solar Prosumers**), on-site station supervisors (**Grid Operators**), and administrative management (**Backoffice Administrators**).

The architecture adheres strictly to the **FAT Service Pattern**, where all core business rules, algorithmic validations, constraints (7-day advance booking limit, 12-hour cancellation notice rule, station deactivation guards), cryptographic security, and transaction state lifecycles reside within a centralized **ASP.NET Core Web API** running against a **MongoDB NoSQL** database cluster. Two specialized client applications communicate exclusively with this API:
1. A modern, responsive **Web Application** built using **React.js and Tailwind CSS** for administrative supervision and operational monitoring.
2. A **Pure Native Android Application** built using **Java and SQLite** for solar prosumer account management, GPS hub navigation via Google Maps, booking dispatch, and offline cache synchronization, alongside camera-enabled QR code scanning for grid operators.

---

## 2. High-Level System Architecture

The system utilizes a 3-tier enterprise client-server distributed model:

```mermaid
graph TD
    subgraph Client Layer
        A[React.js Web Application\n(Backoffice & Grid Operator)] 
        B[Pure Native Android Mobile App\n(Prosumer & Operator Mode)]
        B_SQL[(Local SQLite DB\nSession & Cache)]
        B <--> B_SQL
    end

    subgraph API & Service Layer (FAT Service Pattern)
        C[C# ASP.NET Core Web API / IIS]
        C1[Auth & JWT Controller]
        C2[Microgrid Stations Controller]
        C3[Energy Reservations Service\n(7-Day & 12-Hour Rules)]
        C4[QR Generator & Verification Service]
        C --> C1
        C --> C2
        C --> C3
        C --> C4
    end

    subgraph Data Persistence Layer
        D[(MongoDB Server)]
        D1[Users Collection\n(NIC Primary Key)]
        D2[SolarStationInfo Collection\n(GPS Coordinates & Capacity)]
        D3[EnergyBookingSlots Collection]
        D4[EnergyReservations Collection\n(QR Token Payload)]
        D --> D1
        D --> D2
        D --> D3
        D --> D4
    end

    A -- RESTful HTTPS JSON --> C
    B -- RESTful HTTPS JSON --> C
    C -- MongoDB.Driver --> D
```

### Architectural Key Characteristics:
- **Zero Client Business Logic Leakage**: Both Web and Android clients operate purely as UI presentation layers and delegate all validation logic to the central API.
- **Local Persistence on Android**: User authentication sessions, cached reservations, and reference station data persist in SQLite for instantaneous app launches and offline resilience.
- **Enterprise IIS Readiness**: The C# Web API is configured with `web.config` and `Program.cs` pipelines for Windows Server IIS hosting with in-process ASP.NET Core handlers.

---

## 3. Use Case Diagram

```mermaid
useCaseDiagram
    actor Prosumer as "Solar Prosumer"
    actor Operator as "Grid Operator"
    actor Admin as "Backoffice Admin"

    package "Smart Solar Microgrid System" {
        usecase UC1 as "Register / Login with NIC"
        usecase UC2 as "Browse Nearby Solar Hubs on Map"
        usecase UC3 as "Reserve Energy Slot (Within 7 Days)"
        usecase UC4 as "Generate & Display Transaction QR"
        usecase UC5 as "Modify/Cancel Reservation (12-Hour Notice)"
        usecase UC6 as "Request Account Deactivation"
        usecase UC7 as "Scan & Verify Prosumer QR Code"
        usecase UC8 as "Finalize Energy Transfer & Settle Volume"
        usecase UC9 as "Adjust Battery Slot Availability"
        usecase UC10 as "Manage Solar Microgrid Hubs (GPS/Specs)"
        usecase UC11 as "Deactivate Node (Active Booking Guard)"
        usecase UC12 as "Create Staff Users & Assign Roles"
        usecase UC13 as "Reactivate Deactivated Accounts"
        usecase UC14 as "Approve Pending Prosumer Registrations"
    }

    Prosumer --> UC1
    Prosumer --> UC2
    Prosumer --> UC3
    Prosumer --> UC4
    Prosumer --> UC5
    Prosumer --> UC6

    Operator --> UC1
    Operator --> UC7
    Operator --> UC8
    Operator --> UC9
    Operator --> UC5

    Admin --> UC1
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
```

---

## 4. Data Flow Diagrams (DFD)

### 4.1. DFD Level 0 (Context Diagram)

```
       +-------------------------------------------------------------------+
       |                                                                   |
       |  Prosumer Registration, Credentials, Booking Requests, QR Token   |
       v                                                                   |
+---------------+                                                   +---------------+
| Solar Prosumer| <============ HTTPS REST API Calls ============> |  Smart Solar  |
+---------------+     Booking Confirmation, QR Code, Station Info   |   Microgrid   |
                                                                    |    Trading    |
+---------------+     Staff Login, Station Config, User Activations |    System     |
|   Backoffice  | <============ HTTPS REST API Calls ============> |  (Central API |
| Administrator |     Telemetry Analytics, Audit Logs, Summaries    |   & MongoDB)  |
+---------------+                                                   +---------------+
                                                                           ^
+---------------+     Operator Login, QR Scans, Battery Slot Adjustments   |
| Grid Operator | <============ HTTPS REST API Calls =====================+
+---------------+     Verified Transaction Status, Real-Time Queue
```

### 4.2. DFD Level 1 (Decomposed Subsystems)

```
[Prosumer / Operator / Admin]
           |
           v
     (1.0 Authentication & Identity Verification) ---> [D1: Users Collection]
           |
     (2.0 Microgrid Hub & GPS Location Services) ----> [D2: SolarStationInfo]
           |
     (3.0 Energy Slot Scheduling & 7-Day Rule) ------> [D3: EnergyBookingSlots]
           |
     (4.0 Transaction Dispatch & 12-Hour Rule) ------> [D4: EnergyReservations]
           |
     (5.0 QR Code Cryptographic Verification) -------> [Update Stored kWh & Status]
```

---

## 5. Database Design & Data Modelling

### 5.1. MongoDB Server-Side Collections (Database: `SmartSolarDb`)

#### Collection 1: `Users` (`UserDetails`)
Stores authentication credentials, profile data, roles, and status for Backoffice officers, Grid Operators, and Solar Prosumers.
- `_id` (ObjectId, Primary Key)
- `nic` (String, Unique Index) – *Business Primary Key*
- `email` (String, Unique Index)
- `fullName` (String)
- `passwordHash` (String, BCrypt hash)
- `role` (String: `"Backoffice"` | `"GridOperator"` | `"Prosumer"`)
- `phone` (String)
- `address` (String)
- `status` (String: `"Active"` | `"PendingActivation"` | `"Deactivated"`)
- `isActive` (Boolean)
- `solarCapacityKWh` (Double, Nullable)
- `createdAt` / `updatedAt` (ISODate)

#### Collection 2: `SolarStationInfo` (`MicrogridNodes`)
Stores regional solar hub station telemetry, GPS coordinates, capacity, battery slot metrics, and operating schedules.
- `_id` (ObjectId, Primary Key)
- `stationCode` (String, Unique Index, e.g. `"HUB-CMB-01"`)
- `name` (String)
- `locationDescription` (String)
- `latitude` (Double) – *GPS Latitude*
- `longitude` (Double) – *GPS Longitude*
- `capacityKWh` (Double)
- `currentStoredKWh` (Double)
- `totalBatterySlots` (Integer)
- `availableBatterySlots` (Integer)
- `unitRateBuy` (Decimal, e.g. `48.50`)
- `unitRateSell` (Decimal, e.g. `56.00`)
- `schedule` (Subdocument: `openTime`, `closeTime`, `operatingDays`)
- `isActive` (Boolean)
- `createdAt` / `updatedAt` (ISODate)

#### Collection 3: `EnergyBookingSlots`
Stores discrete time slots for stations on given dates to enforce interval availability.
- `_id` (ObjectId, Primary Key)
- `stationId` (String / ObjectId)
- `stationCode` (String)
- `date` (ISODate)
- `startTime` / `endTime` (String, e.g. `"09:00"`, `"10:00"`)
- `slotType` (String: `"DropOff"` | `"Charging"`)
- `maxCapacityKWh` (Double)
- `bookedCapacityKWh` (Double)
- `totalSlots` (Integer)
- `bookedSlots` (Integer)
- `status` (String: `"Available"` | `"Full"` | `"Closed"`)

#### Collection 4: `EnergyReservations`
Stores prosumer energy trading reservations, cryptographically signed QR code tokens, and finalization status.
- `_id` (ObjectId, Primary Key)
- `reservationNumber` (String, Unique Index, e.g. `"RES-2026-0001"`)
- `prosumerNic` (String, Indexed)
- `prosumerName` (String)
- `prosumerPhone` (String)
- `stationId` (String)
- `stationCode` (String)
- `stationName` (String)
- `slotId` (String, Nullable)
- `reservationDate` (ISODate)
- `startTime` / `endTime` (String)
- `transferType` (String: `"DropOff_SolarEnergy"` | `"Charging"`)
- `energyAmountKWh` (Double)
- `unitRate` (Decimal)
- `totalAmount` (Decimal)
- `status` (String: `"Pending"` | `"Approved"` | `"Completed"` | `"Cancelled"`)
- `qrCodeToken` (String)
- `qrCodePayload` (String, JSON)
- `completedAt` (ISODate, Nullable)
- `completedByOperatorNic` (String, Nullable)
- `notes` (String)
- `createdAt` / `updatedAt` (ISODate)

---

### 5.2. SQLite Local Database Schema (Android Client)

```sql
-- Local Session & User Cache
CREATE TABLE user_session (
    nic TEXT PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT,
    phone TEXT,
    address TEXT,
    status TEXT,
    solar_capacity REAL,
    jwt_token TEXT
);

-- Offline Cached Reservations
CREATE TABLE cached_reservations (
    reservation_number TEXT PRIMARY KEY,
    prosumer_nic TEXT,
    station_name TEXT,
    station_code TEXT,
    reservation_date TEXT,
    start_time TEXT,
    end_time TEXT,
    transfer_type TEXT,
    energy_kwh REAL,
    total_amount REAL,
    status TEXT,
    qr_token TEXT,
    qr_payload TEXT
);
```

---

## 6. Business Rules & Enforcement (FAT Service Logic)

| Rule # | Requirement | Implementation in Central API | Client Handling |
|---|---|---|---|
| **Rule 1** | **NIC as Primary Key** | Prosumers register and authenticate via unique National Identity Card (NIC). Unique index on `Users.nic`. | Used as primary session identifier across both Web and Android clients. |
| **Rule 2** | **Account Reactivation** | Deactivated accounts can **ONLY** be reactivated by a `Backoffice` officer. Validated in `UserService.ReactivateUserAsync`. | UI restricts reactivation action to Backoffice role; error returned if attempted by unauthorized roles. |
| **Rule 3** | **Node Deactivation Guard** | Microgrid node deactivation is **BLOCKED** if active or pending energy reservations exist for the station. Validated in `StationService.DeactivateStationAsync`. | Web UI presents safety warning; API rejects request with 400 Bad Request if linked bookings exist. |
| **Rule 4** | **7-Day Advance Booking Rule** | Power trading reservations must be scheduled within 7 days from the booking date. Validated in `ReservationService.CreateReservationAsync`. | Android date picker constrains selectable dates to max 7 days; API rigorously validates date math. |
| **Rule 5** | **12-Hour Notice Rule** | Updates and cancellations require at least 12 hours' notice prior to scheduled slot time. Validated in `ReservationService.Enforce12HourNoticeRule`. | Mobile app pre-checks timestamp; API blocks modifications `< 12` hours before start time. |
| **Rule 6** | **QR Dispatch & Verification** | Approved reservations generate signed QR tokens. Grid Operator scans QR to verify against MongoDB and finalize status as `Completed`. | Prosumer app generates QR bitmap; Operator app/web scans QR and calls `/reservations/verify-qr`. |

---

## 7. Individual Group Member Contributions (4 Members)

| Member Name | IT Number | Assigned Role & Module | Specific Deliverables & Contributions |
|---|---|---|---|
| **Member 1 (Lead)** | IT22001122 | **Backend Architecture & FAT Web Service** | - Designed C# ASP.NET Core Web API with MongoDB Driver repository pattern.<br>- Implemented all 6 core business rules (NIC key, 7-day limit, 12-hour cancellation notice, station deactivation guard).<br>- Developed JWT authentication and QRCoder cryptographic verification pipeline.<br>- Configured IIS deployment readiness and Swagger OpenAPI specifications. |
| **Member 2** | IT22003344 | **Web Application (React & Tailwind CSS)** | - Built responsive Backoffice and Grid Operator consoles in React.js.<br>- Developed user management, prosumer pending activation approvals, and node management.<br>- Created live microgrid telemetry dashboards and slot reservation views.<br>- Integrated Axios API service layer with JWT interceptors. |
| **Member 3** | IT22005566 | **Pure Native Android Application (Part 1)** | - Implemented pure native Android project architecture using Java & Gradle.<br>- Created local SQLite database (`DatabaseHelper`) for offline session and reservation caching.<br>- Developed Prosumer account registration, login, and dashboard with active/pending counters.<br>- Implemented New Reservation scheduling with 7-day date restrictions. |
| **Member 4** | IT22007788 | **Pure Native Android Application (Part 2) & Maps** | - Integrated Google Maps API displaying regional solar station nodes with live GPS pins.<br>- Implemented ZXing QR Code generator for prosumer dispatch view.<br>- Developed Grid Operator camera QR scanner and server verification finalizer.<br>- Created booking history, search filter, and 12-hour modification/cancellation dialogs. |

---

## 8. Technical Challenges & Engineering Solutions

1. **Enforcing Strict 12-Hour Notice Rule Across Timezones**:
   - *Challenge*: Server and clients may operate in different regional timezones, causing discrepancies when calculating the 12-hour threshold.
   - *Solution*: Normalized all reservation timestamps to UTC (`DateTime.UtcNow`) in the C# Web API. The API computes `(slotStartUtc - DateTime.UtcNow).TotalHours >= 12` deterministically.

2. **Preventing Premature Microgrid Node Deactivation**:
   - *Challenge*: Deactivating a station that has pending prosumer drop-offs would leave prosumers with valid QR codes but no operating station.
   - *Solution*: Implemented a relational safety query in `StationService` that interrogates `EnergyReservations` for status in `["Pending", "Approved"]` before allowing state transitions to `IsActive = false`.

3. **Pure Native Android Constraint Without Hybrid Frameworks**:
   - *Challenge*: Requirement strictly prohibited Flutter, React Native, or third-party ORMs.
   - *Solution*: Developed lightweight pure Java Android SDK components using native `SQLiteOpenHelper`, `OkHttpClient`, `Google Maps Android SDK`, and `ZXing Android Embedded`.

4. **Zero Client-Side Logic Leakage**:
   - *Challenge*: Ensuring all business rules reside strictly in the API while maintaining a snappy client UX.
   - *Solution*: Implemented clear API error formatting in `ExceptionMiddleware` returning descriptive JSON messages which the clients seamlessly render.

---

## 9. References

1. Microsoft Docs, "ASP.NET Core Web API Best Practices & Architecture", 2026.
2. MongoDB Inc., "MongoDB C# .NET Driver Documentation & Aggregations", 2026.
3. Google Developers, "Android SQLite Database Programming & Google Maps SDK Guide", 2026.
4. React.js Community, "Building Modern Accessible Single Page Applications with Vite", 2026.
5. SLIIT Faculty of Computing, "SE4040 Enterprise Application Development Course Guidelines", 2026.
