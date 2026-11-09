# Atharva Travels - Enterprise Transport System (ETS)

A production-grade, distributed corporate mobility platform powered by a single unified **PostgreSQL + Prisma ORM** database, **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **genuine Google Maps JavaScript SDK**.

---

## 🏛️ Ecosystem Architecture

All applications connect to the **same central database** with role-based access control (RBAC):

```
                       ┌──────────────────────────────────────────────┐
                       │     Unified PostgreSQL Database (Prisma)     │
                       └──────────────────────┬───────────────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         │                                    │                                    │
┌────────▼──────────────┐          ┌──────────▼───────────┐             ┌──────────▼───────────┐
│  Employee Mobile App  │          │   Driver Mobile App   │             │   ETS Web Portal     │
├───────────────────────┤          ├──────────────────────┤             ├──────────────────────┤
│ • Shift Rostering     │          │ • Turn-by-Turn Nav   │             │ 1. Corporate Vendor  │
│ • Boarding PIN (OTP)  │          │ • Stop Manifest      │             │    (Company / HR)    │
│ • Real-time Tracking  │          │ • PIN Verification   │             ├──────────────────────┤
│ • Report Geo Issue    │          │ • Live Telemetry     │             │ 2. Atharva Admin     │
│ • SOS Emergency Alert │          │ • Pushed Waypoints   │             │    (Fleet Command)   │
└───────────────────────┘          └──────────────────────┘             └──────────────────────┘
```

---

## 🗺️ Real Google Maps Integration

The portal integrates the genuine **Google Maps JavaScript API** (`GoogleMapsTracker.tsx`) featuring:
1. **Live Traffic Layer**: Toggle real-time city traffic conditions (green/yellow/red congestion).
2. **Google Directions Engine**: Automatically computes the driving geometry from Driver location ➔ Employee Pickup ➔ Office Tech Park.
3. **Interactive Draggable Pin Reassignment**: Dragging the green pickup marker on Google Maps reverse-geocodes the coordinates and pushes the updated location directly to the driver!
4. **Roadmap & Satellite 3D View**: Switch between Google Roadmap and high-resolution Satellite tiles.

### Configuring Your Google Maps Key
Set your key in `.env.local` or enter it directly into the in-portal key connector:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSy..."
```

---

## 🔐 Dual Web Portal Logins

The website portal provides two separate portals powered by the same database:

### 1. Corporate Vendor Portal (`CORPORATE_CLIENT`)
- Designed for corporate clients (e.g., Walmart Global Tech, Tech Parks, Corporate Facilities).
- **Roster Management**: Approve weekly shift rosters and headcount allocations.
- **Safety Safeguards**: Live monitor female employees on night shifts with assigned armed/security escorts.
- **SLA Metrics**: 99.4% on-time punctuality tracking, carbon offset reports, and shared vehicle pooling factors.
- **Location Issue Handling**: Update employee pickup nodes if gates or premises are inaccessible.

### 2. Atharva Travels Admin Portal (`ATHARVA_ADMIN`)
- Designed for Atharva Travels fleet dispatchers, operations managers, and central control room (TCR) officers.
- **Master Fleet Radar**: Live Google Maps tracking of all 42 Atharva vehicles on the road.
- **Emergency SOS Command**: Immediate acoustic/visual alert when an employee triggers SOS, with live GPS telemetry and one-click Quick Response Team (QRT) dispatch.
- **Dynamic Geolocation Reassignment**: View employee location change requests and push updated waypoints directly to the driver's phone with reason logs.

---

## 📲 Connected Mobile Apps

### 1. Employee Mobile App
- View active pickup/drop cards.
- View 4-digit Safe Boarding PIN (`7492`) to share with driver.
- Trigger SOS panic alert transmitting live GPS coordinates.
- **"Issue with Pickup? Reassign Location"** button to shift coordinates (e.g. to Indiranagar Metro Station) and update the driver instantly.

### 2. Driver Mobile App
- Displays route stops in sequence.
- Enter 4-digit employee PIN to verify boarding and mark as `BOARDED`.
- **Live Push Notification Banner**: Instantly alerts the driver when an employee's location is reassigned, adjusting the route map automatically.

---

## 🗄️ Prisma Database Schema Summary

Key models in `prisma/schema.prisma`:
- **`User`**: Base identity supporting `EMPLOYEE`, `DRIVER`, `CORPORATE_CLIENT`, `ATHARVA_ADMIN`.
- **`EmployeeProfile`**: Default home coordinates, live coordinates, and female safeguard flags.
- **`DriverProfile`**: Live vehicle telemetry (`currentLatitude`, `currentLongitude`, `currentHeading`, `currentSpeed`).
- **`CorporateClientProfile`**: Corporate client data (e.g., Walmart, SLA tier, billing).
- **`Vehicle`**: Fleet registry (`KA-03-HA-8821`, Toyota Innova, seating capacity).
- **`Trip` & `TripPassenger`**: Roster allocations, stops, boarding OTPs, and status.
- **`LocationReassignmentEvent`**: Audit trail of employee location adjustments pushed to drivers.
- **`EmergencyAlert`**: SOS incidents with GPS telemetry and admin resolution logs.
- **`PushNotificationLog`**: Push notification dispatches to mobile apps.

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Generate Prisma client
npx prisma generate

# 4. Start Next.js dev server
npm run dev
```

Visit `http://localhost:3000` to interact with the portal, toggle between the Dual Login, Vendor Portal, Atharva Admin Command, Employee Mobile App, and Driver Mobile App!
