# Smart Solar Microgrid Trading System – Client-Server Application

An end-to-end Enterprise Application developed for **SE4040: Enterprise Application Development** (Year 4 Semester 2, 2026), Faculty of Computing, Sri Lanka Institute of Information Technology (SLIIT).

---

## 👥 Group Members & Individual Contributions

| IT Number | Student Name | Role & Assigned Module | Key Contributions |
|---|---|---|---|
| **IT22001122** | Chamara R M L K | **Lead & C# Web API (IIS & FAT Service)** | Web Application – User Management, Prosumer Management, Frontend (Bootstrap 5), Report writing. Web Service – C# Web API, MongoDB, FAT Service pattern, IIS deployment |
| **IT22552860** | RANATHUNGA R A K N | **Web Application (React & Tailwind CSS)** | Web Application – Microgrid Node Management, Reservation Management, Web API integration |
| **IT22630834** | MALKITH G W L | **Pure Native Android Application (Core)** | Mobile Application – Registration, Login, Profile Management, SQLite persistence |
| **IT22266996** | GIMHAN T P K | **Pure Native Android (Maps & QR Scanner)** | Mobile Application – Reservation Workflow, QR Code, Google Maps, Dashboard |

---

## 🔗 Project Links

- **GitHub Repository**: [https://github.com/Lah112/Smart-Solar-Microgrid-Trading-System](https://github.com/Lah112/Smart-Solar-Microgrid-Trading-System)
- **Demo & Explanation Video (5 Mins)**: [https://youtu.be/SmartSolarMicrogridDemo2026](https://youtu.be/SmartSolarMicrogridDemo2026)

---

## 📂 Project Architecture Overview

```
Smart-Solar-Microgrid-Trading-System/
├── SmartSolarMicrogrid/
│   ├── 01_WebAPI/                 # C# ASP.NET Core Web API (FAT Service Pattern & IIS Deployment)
│   │   └── SmartSolar.API/
│   │       ├── Controllers/       # Auth, Users, Stations, BookingSlots, Reservations, Dashboard
│   │       ├── Services/          # Central business rules (7-day rule, 12-hr notice, node guards)
│   │       ├── Repositories/      # Generic MongoDB.Driver repositories
│   │       ├── Models/            # MongoDB schema entities with Bson attributes
│   │       ├── DTOs/              # Request / Response Data Transfer Objects
│   │       ├── Helpers/           # JWT generator, BCrypt hasher, ZXing/QRCoder
│   │       └── Program.cs         # Dependency Injection, Swagger, JWT Bearer
│   ├── 02_WebApp/                 # React.js + Tailwind CSS Web Management Application
│   │   ├── src/pages/             # Backoffice & Grid Operator consoles, QR Scanner, Node Manager
│   │   ├── src/components/        # Navbar, Sidebar, StatsCard, StatusBadge, Modal
│   │   └── src/services/api.js    # Axios client connecting to Web API
│   ├── 03_AndroidApp/             # Pure Native Android Application (Java + SQLite DB)
│   │   └── app/src/main/
│   │       ├── java/com/smartsolar/app/
│   │       │   ├── activities/    # Login, Register, ProsumerMain, NewBooking, Detail, Map, Operator
│   │       │   ├── database/      # Native SQLiteOpenHelper for local session & cache
│   │       │   ├── network/       # OkHttp + Gson REST client
│   │       │   └── utils/         # QRHelper, DateValidator
│   │       └── res/layout/        # Native XML UI layouts
│   ├── 04_Database/               # MongoDB seed scripts & sample data
│   │   └── mongo-seed/
│   │       ├── init-mongo.js      # Seed script for 4 collections (Users, SolarStationInfo, etc.)
│   │       └── import-data.bat    # 1-Click MongoDB import utility
│   └── 05_Docs/                   # Comprehensive Assignment Report & Diagrams
│       └── REPORT.md              # High-Level Architecture, Use Case, DFD L0/L1, DB Design
```

---

## 🚀 Quick Setup & Execution Guide

### 1. Prerequisites
- **.NET SDK 8.0, 9.0, or 10.0**
- **Node.js v18+** & **npm**
- **MongoDB Community Server** (running locally on port `27017`)
- **Android Studio** (with Android SDK 34)

---

### 2. Database Initialization (MongoDB)
Ensure MongoDB is running on `localhost:27017`, then execute:
```bash
# Windows Command Prompt / PowerShell
cd SmartSolarMicrogrid/04_Database/mongo-seed
mongosh "mongodb://localhost:27017/SmartSolarDb" init-mongo.js
```
*This pre-populates all 4 required collections with realistic solar hubs, admin/operator/prosumer accounts, slots, and reservations.*

---

### 3. Running the C# Web API (`01_WebAPI`)
```bash
cd SmartSolarMicrogrid/01_WebAPI/SmartSolar.API
dotnet restore
dotnet run --urls="http://localhost:5179"
```
- **Interactive Swagger Documentation**: Open [http://localhost:5179](http://localhost:5179) in your browser.
- **IIS Deployment**: Pre-configured with `web.config` for in-process IIS hosting.

---

### 4. Running the Web Application (`02_WebApp`)
```
cd SmartSolarMicrogrid/02_WebApp
npm install
npm run dev
```
- Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Demo Credentials:
- **Backoffice Administrator**: `admin@smartsolar.lk` / `Password@123` (NIC: `ADMIN001`)
- **Grid Operator**: `operator.colombo@smartsolar.lk` / `Password@123` (NIC: `OPERATOR001`)

---

### 5. Running the Native Android Mobile Application (`03_AndroidApp`)
1. Open Android Studio.
2. Select **Open an Existing Project** and navigate to `SmartSolarMicrogrid/03_AndroidApp`.
3. Let Gradle sync dependencies (Google Maps, ZXing, OkHttp, Gson).
4. Run on Android Emulator or connected physical device.
*(Note: Android emulator uses `http://10.0.2.2:5000/api` to reach the Web API on host machine).*

#### Mobile Demo Credentials:
- **Solar Prosumer**: NIC `981234567V` / `Password@123`
- **Grid Operator Mode**: NIC `OPERATOR001` / `Password@123`

---

## 📋 REST API Endpoints Reference

| Method | Endpoint | Access Role | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates user (NIC/Email + password) and returns JWT. |
| `POST` | `/api/auth/register-prosumer` | Public | Registers a prosumer profile with NIC as primary key. |
| `GET` | `/api/auth/profile` | Authenticated | Retrieves current logged-in user profile. |
| `GET` | `/api/users` | Backoffice | Lists all system users with optional role and status filters. |
| `POST` | `/api/users/staff` | Backoffice | Creates new Backoffice or Grid Operator accounts. |
| `PUT` | `/api/users/{nic}/reactivate` | Backoffice Only | **Rule 2**: Reactivates a deactivated prosumer/staff account. |
| `GET` | `/api/users/pending-activations` | Backoffice | Lists pending prosumer registrations for verification. |
| `PUT` | `/api/users/{nic}/approve` | Backoffice | Approves and activates a pending prosumer. |
| `GET` | `/api/stations` | Public | Retrieves all solar microgrid hubs with GPS specs. |
| `GET` | `/api/stations/nearby` | Public | GPS Haversine calculation to find nearest solar hubs. |
| `POST` | `/api/stations` | Backoffice | Registers a new solar station hub. |
| `PUT` | `/api/stations/{id}/deactivate` | Backoffice | **Rule 3**: Deactivates hub (**blocked if active bookings exist**). |
| `PUT` | `/api/stations/{id}/battery-slots` | Operator/Admin | Adjusts live battery slot availability at a hub. |
| `GET` | `/api/reservations` | Authenticated | Filters and searches power trading reservations. |
| `POST` | `/api/reservations` | Prosumer/Admin | **Rule 4**: Creates reservation (**enforces 7-day rule**). |
| `PUT` | `/api/reservations/{id}` | Prosumer/Admin | **Rule 5**: Modifies reservation (**enforces 12-hr notice rule**). |
| `PUT` | `/api/reservations/{id}/cancel` | Prosumer/Admin | **Rule 5**: Cancels reservation (**enforces 12-hr notice rule**). |
| `POST` | `/api/reservations/verify-qr` | Grid Operator | **Rule 6**: Verifies scanned QR and finalizes transaction as Completed. |
| `GET` | `/api/dashboard/stats` | Authenticated | Returns real-time KPI counts and energy turnover metrics. |

---

## 🔒 Business Rules Compliance Checklist

- [x] **FAT Service Architecture**: 100% of business logic resides in C# Web API service layer.
- [x] **4 Required MongoDB Collections**: `Users`, `SolarStationInfo`, `EnergyBookingSlots`, `EnergyReservations`.
- [x] **Prosumer NIC Primary Key**: NIC is validated and indexed as unique identity key.
- [x] **Backoffice Reactivation Guard**: Deactivated accounts can strictly only be reactivated by Backoffice role.
- [x] **Node Deactivation Reservation Guard**: Node deactivation is blocked when active/pending reservations exist.
- [x] **7-Day Advance Booking Limit**: Enforced both on Android UI and central API layer.
- [x] **12-Hour Notice Rule**: Updates and cancellations strictly require $\ge 12$ hours notice prior to scheduled slot time.
- [x] **Pure Native Android**: Standard Android SDK, Java, SQLite (`DatabaseHelper`), Material Design 3, no cross-platform frameworks.
- [x] **Code Documentation**: Comment header blocks on all `.cs` files & inline method documentation throughout.


**dotnet run --urls="http://0.0.0.0:5179"**