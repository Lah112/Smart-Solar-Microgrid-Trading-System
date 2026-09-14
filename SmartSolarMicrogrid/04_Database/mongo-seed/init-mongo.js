/**
 * ============================================================================
 * Smart Solar Microgrid Trading System - MongoDB Seed Script
 * File: init-mongo.js
 * Database: SmartSolarDb
 * Description: Populates initial sample data for 4 required collections:
 *              1. Users (Backoffice, GridOperator, Prosumer)
 *              2. SolarStationInfo (Microgrid Nodes with GPS, Capacity, Battery Slots)
 *              3. EnergyBookingSlots (Time slots and availability)
 *              4. EnergyReservations (Energy drop-off and charging reservations)
 * ============================================================================
 */

db = db.getSiblingDB('SmartSolarDb');

// Clear existing collections if any
db.Users.drop();
db.SolarStationInfo.drop();
db.EnergyBookingSlots.drop();
db.EnergyReservations.drop();

// 1. Users Collection
// Passwords hashed using BCrypt for "Password@123"
const defaultPasswordHash = "$2a$11$0hjLGnKDHdP8OekLyRxDsOkdtCWo0.J505IFnS8LNmTSWPs4fYIzG";

db.Users.insertMany([
  {
    "_id": ObjectId("650100000000000000000001"),
    "nic": "ADMIN001",
    "email": "admin@smartsolar.lk",
    "fullName": "Backoffice Administrator",
    "passwordHash": defaultPasswordHash,
    "role": "Backoffice",
    "phone": "+94771234567",
    "address": "Microgrid HQ, 100 Sri Jayawardenepura Mawatha, Colombo",
    "isActive": true,
    "status": "Active",
    "createdAt": new Date("2026-08-01T08:00:00Z"),
    "updatedAt": new Date("2026-08-01T08:00:00Z")
  },
  {
    "_id": ObjectId("650100000000000000000002"),
    "nic": "OPERATOR001",
    "email": "operator.colombo@smartsolar.lk",
    "fullName": "Kamal Perera (Grid Operator)",
    "passwordHash": defaultPasswordHash,
    "role": "GridOperator",
    "phone": "+94772345678",
    "address": "Solar Hub Colombo Central, Station #01",
    "isActive": true,
    "status": "Active",
    "createdAt": new Date("2026-08-02T09:00:00Z"),
    "updatedAt": new Date("2026-08-02T09:00:00Z")
  },
  {
    "_id": ObjectId("650100000000000000000003"),
    "nic": "OPERATOR002",
    "email": "operator.kandy@smartsolar.lk",
    "fullName": "Nuwan Silva (Grid Operator)",
    "passwordHash": defaultPasswordHash,
    "role": "GridOperator",
    "phone": "+94773456789",
    "address": "Solar Hub Kandy Gateway, Station #02",
    "isActive": true,
    "status": "Active",
    "createdAt": new Date("2026-08-02T09:30:00Z"),
    "updatedAt": new Date("2026-08-02T09:30:00Z")
  },
  {
    "_id": ObjectId("650100000000000000000004"),
    "nic": "981234567V",
    "email": "saman.solar@gmail.com",
    "fullName": "Saman Kumara",
    "passwordHash": defaultPasswordHash,
    "role": "Prosumer",
    "phone": "+94774567890",
    "address": "45/2 Green Valley Gardens, Colombo 05",
    "isActive": true,
    "status": "Active",
    "solarCapacityKWh": 15.5,
    "createdAt": new Date("2026-08-10T10:00:00Z"),
    "updatedAt": new Date("2026-08-10T10:00:00Z")
  },
  {
    "_id": ObjectId("650100000000000000000005"),
    "nic": "200056789123",
    "email": "dilshan.energy@gmail.com",
    "fullName": "Dilshan Fernando",
    "passwordHash": defaultPasswordHash,
    "role": "Prosumer",
    "phone": "+94775678901",
    "address": "12 Temple Road, Kandy",
    "isActive": true,
    "status": "Active",
    "solarCapacityKWh": 20.0,
    "createdAt": new Date("2026-08-12T11:00:00Z"),
    "updatedAt": new Date("2026-08-12T11:00:00Z")
  },
  {
    "_id": ObjectId("650100000000000000000006"),
    "nic": "952345678V",
    "email": "anura.pending@gmail.com",
    "fullName": "Anura Jayasinghe",
    "passwordHash": defaultPasswordHash,
    "role": "Prosumer",
    "phone": "+94776789012",
    "address": "88 Beach Road, Galle",
    "isActive": false,
    "status": "PendingActivation",
    "solarCapacityKWh": 10.0,
    "createdAt": new Date("2026-09-01T14:20:00Z"),
    "updatedAt": new Date("2026-09-01T14:20:00Z")
  },
  {
    "_id": ObjectId("650100000000000000000007"),
    "nic": "913456789V",
    "email": "ruwan.deactivated@gmail.com",
    "fullName": "Ruwan Wickramasinghe",
    "passwordHash": defaultPasswordHash,
    "role": "Prosumer",
    "phone": "+94777890123",
    "address": "104 Main Street, Negombo",
    "isActive": false,
    "status": "Deactivated",
    "solarCapacityKWh": 8.5,
    "createdAt": new Date("2026-08-05T09:00:00Z"),
    "updatedAt": new Date("2026-08-20T16:00:00Z")
  }
]);

// 2. SolarStationInfo (Microgrid Nodes)
db.SolarStationInfo.insertMany([
  {
    "_id": ObjectId("650200000000000000000001"),
    "stationCode": "HUB-CMB-01",
    "name": "Colombo Central Solar Hub",
    "locationDescription": "Viharamahadevi Park Energy Station, Colombo 07",
    "latitude": 6.9147,
    "longitude": 79.8606,
    "capacityKWh": 500.0,
    "currentStoredKWh": 320.5,
    "totalBatterySlots": 20,
    "availableBatterySlots": 14,
    "unitRateBuy": 48.50,
    "unitRateSell": 56.00,
    "schedule": {
      "openTime": "06:00",
      "closeTime": "22:00",
      "operatingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    },
    "isActive": true,
    "createdAt": new Date("2026-08-01T08:00:00Z"),
    "updatedAt": new Date("2026-08-01T08:00:00Z")
  },
  {
    "_id": ObjectId("650200000000000000000002"),
    "stationCode": "HUB-KDY-01",
    "name": "Kandy Gateway Microgrid Station",
    "locationDescription": "Peradeniya Road Solar Substation, Kandy",
    "latitude": 7.2906,
    "longitude": 80.6337,
    "capacityKWh": 350.0,
    "currentStoredKWh": 210.0,
    "totalBatterySlots": 15,
    "availableBatterySlots": 9,
    "unitRateBuy": 49.00,
    "unitRateSell": 57.50,
    "schedule": {
      "openTime": "06:00",
      "closeTime": "20:00",
      "operatingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    },
    "isActive": true,
    "createdAt": new Date("2026-08-02T08:00:00Z"),
    "updatedAt": new Date("2026-08-02T08:00:00Z")
  },
  {
    "_id": ObjectId("650200000000000000000003"),
    "stationCode": "HUB-GAL-01",
    "name": "Galle Coastal Solar Grid",
    "locationDescription": "Galle Fort Energy Port, Galle",
    "latitude": 6.0329,
    "longitude": 80.2168,
    "capacityKWh": 400.0,
    "currentStoredKWh": 280.0,
    "totalBatterySlots": 16,
    "availableBatterySlots": 11,
    "unitRateBuy": 47.50,
    "unitRateSell": 55.00,
    "schedule": {
      "openTime": "06:00",
      "closeTime": "21:00",
      "operatingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    },
    "isActive": true,
    "createdAt": new Date("2026-08-03T08:00:00Z"),
    "updatedAt": new Date("2026-08-03T08:00:00Z")
  },
  {
    "_id": ObjectId("650200000000000000000004"),
    "stationCode": "HUB-NEG-01",
    "name": "Negombo Aerocity Solar Facility",
    "locationDescription": "Katunayake Airport Access Road, Negombo",
    "latitude": 7.2083,
    "longitude": 79.8736,
    "capacityKWh": 300.0,
    "currentStoredKWh": 140.0,
    "totalBatterySlots": 12,
    "availableBatterySlots": 8,
    "unitRateBuy": 48.00,
    "unitRateSell": 56.50,
    "schedule": {
      "openTime": "07:00",
      "closeTime": "19:00",
      "operatingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    "isActive": true,
    "createdAt": new Date("2026-08-04T08:00:00Z"),
    "updatedAt": new Date("2026-08-04T08:00:00Z")
  },
  {
    "_id": ObjectId("650200000000000000000005"),
    "stationCode": "HUB-JAF-01",
    "name": "Jaffna Peninsula Solar Array",
    "locationDescription": "A9 Highway Northern Junction, Jaffna",
    "latitude": 9.6615,
    "longitude": 80.0255,
    "capacityKWh": 600.0,
    "currentStoredKWh": 450.0,
    "totalBatterySlots": 24,
    "availableBatterySlots": 20,
    "unitRateBuy": 46.00,
    "unitRateSell": 54.00,
    "schedule": {
      "openTime": "06:00",
      "closeTime": "22:00",
      "operatingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    },
    "isActive": false,
    "createdAt": new Date("2026-08-05T08:00:00Z"),
    "updatedAt": new Date("2026-08-05T08:00:00Z")
  }
]);

// 3. EnergyBookingSlots (Slots within 7 days)
const today = new Date();
const getFutureDate = (daysAhead) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysAhead);
  d.setHours(0, 0, 0, 0);
  return d;
};

db.EnergyBookingSlots.insertMany([
  {
    "_id": ObjectId("650300000000000000000001"),
    "stationId": "650200000000000000000001",
    "stationCode": "HUB-CMB-01",
    "date": getFutureDate(1),
    "startTime": "09:00",
    "endTime": "10:00",
    "slotType": "DropOff",
    "maxCapacityKWh": 50.0,
    "bookedCapacityKWh": 15.0,
    "totalSlots": 5,
    "bookedSlots": 1,
    "status": "Available"
  },
  {
    "_id": ObjectId("650300000000000000000002"),
    "stationId": "650200000000000000000001",
    "stationCode": "HUB-CMB-01",
    "date": getFutureDate(1),
    "startTime": "10:00",
    "endTime": "11:00",
    "slotType": "DropOff",
    "maxCapacityKWh": 50.0,
    "bookedCapacityKWh": 0.0,
    "totalSlots": 5,
    "bookedSlots": 0,
    "status": "Available"
  },
  {
    "_id": ObjectId("650300000000000000000003"),
    "stationId": "650200000000000000000001",
    "stationCode": "HUB-CMB-01",
    "date": getFutureDate(2),
    "startTime": "14:00",
    "endTime": "15:00",
    "slotType": "Charging",
    "maxCapacityKWh": 40.0,
    "bookedCapacityKWh": 20.0,
    "totalSlots": 4,
    "bookedSlots": 1,
    "status": "Available"
  },
  {
    "_id": ObjectId("650300000000000000000004"),
    "stationId": "650200000000000000000002",
    "stationCode": "HUB-KDY-01",
    "date": getFutureDate(1),
    "startTime": "11:00",
    "endTime": "12:00",
    "slotType": "DropOff",
    "maxCapacityKWh": 30.0,
    "bookedCapacityKWh": 10.0,
    "totalSlots": 3,
    "bookedSlots": 1,
    "status": "Available"
  }
]);

// 4. EnergyReservations Collection
db.EnergyReservations.insertMany([
  {
    "_id": ObjectId("650400000000000000000001"),
    "reservationNumber": "RES-2026-0001",
    "prosumerNic": "981234567V",
    "prosumerName": "Saman Kumara",
    "prosumerPhone": "+94774567890",
    "stationId": "650200000000000000000001",
    "stationCode": "HUB-CMB-01",
    "stationName": "Colombo Central Solar Hub",
    "slotId": "650300000000000000000001",
    "reservationDate": getFutureDate(1),
    "startTime": "09:00",
    "endTime": "10:00",
    "transferType": "DropOff_SolarEnergy",
    "energyAmountKWh": 15.0,
    "unitRate": 48.50,
    "totalAmount": 727.50,
    "status": "Approved",
    "qrCodeToken": "QR_SECURE_TOKEN_RES_0001_981234567V_HUB_CMB_01",
    "qrCodePayload": JSON.stringify({
      "reservationNumber": "RES-2026-0001",
      "prosumerNic": "981234567V",
      "stationCode": "HUB-CMB-01",
      "energyKWh": 15.0,
      "type": "DropOff_SolarEnergy",
      "sig": "SECURE_AUTH_SIG_981234567V"
    }),
    "notes": "Grid tie-in solar drop-off reservation.",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "_id": ObjectId("650400000000000000000002"),
    "reservationNumber": "RES-2026-0002",
    "prosumerNic": "200056789123",
    "prosumerName": "Dilshan Fernando",
    "prosumerPhone": "+94775678901",
    "stationId": "650200000000000000000002",
    "stationCode": "HUB-KDY-01",
    "stationName": "Kandy Gateway Microgrid Station",
    "slotId": "650300000000000000000004",
    "reservationDate": getFutureDate(1),
    "startTime": "11:00",
    "endTime": "12:00",
    "transferType": "DropOff_SolarEnergy",
    "energyAmountKWh": 10.0,
    "unitRate": 49.00,
    "totalAmount": 490.00,
    "status": "Pending",
    "qrCodeToken": "",
    "qrCodePayload": "",
    "notes": "Awaiting grid operator verification.",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "_id": ObjectId("650400000000000000000003"),
    "reservationNumber": "RES-2026-0003",
    "prosumerNic": "981234567V",
    "prosumerName": "Saman Kumara",
    "prosumerPhone": "+94774567890",
    "stationId": "650200000000000000000001",
    "stationCode": "HUB-CMB-01",
    "stationName": "Colombo Central Solar Hub",
    "slotId": "650300000000000000000001",
    "reservationDate": new Date("2026-08-25T09:00:00Z"),
    "startTime": "09:00",
    "endTime": "10:00",
    "transferType": "DropOff_SolarEnergy",
    "energyAmountKWh": 25.0,
    "unitRate": 48.50,
    "totalAmount": 1212.50,
    "status": "Completed",
    "qrCodeToken": "QR_SECURE_TOKEN_RES_0003_COMPLETED",
    "completedAt": new Date("2026-08-25T09:45:00Z"),
    "completedByOperatorNic": "OPERATOR001",
    "notes": "Transfer successful.",
    "createdAt": new Date("2026-08-24T10:00:00Z"),
    "updatedAt": new Date("2026-08-25T09:45:00Z")
  }
]);

// Create Unique and Search Indexes
db.Users.createIndex({ "nic": 1 }, { unique: true });
db.Users.createIndex({ "email": 1 }, { unique: true });
db.SolarStationInfo.createIndex({ "stationCode": 1 }, { unique: true });
db.SolarStationInfo.createIndex({ "latitude": 1, "longitude": 1 });
db.EnergyBookingSlots.createIndex({ "stationId": 1, "date": 1, "startTime": 1 });
db.EnergyReservations.createIndex({ "reservationNumber": 1 }, { unique: true });
db.EnergyReservations.createIndex({ "prosumerNic": 1 });
db.EnergyReservations.createIndex({ "stationId": 1 });
db.EnergyReservations.createIndex({ "status": 1 });

print("SmartSolarDb successfully initialized with 4 collections and indexes.");
