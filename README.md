# 🎫 Visitor Pass Management System

A full-stack **MERN** application that digitizes the front-desk experience — replacing paper visitor registers with pre-registration, QR-coded digital passes, and secure, auditable check-in/check-out.

---

## 🔗 Live Links

| Resource | Link |
|---|---|
| 🌐 Live App | [visitor-pass-management-system-eight.vercel.app](https://visitor-pass-management-system-eight.vercel.app/) |
| ⚙️ Backend API | [visitor-pass-management-system-w3h2.onrender.com](https://visitor-pass-management-system-w3h2.onrender.com/) |
| 💻 GitHub Repository | [Sumitchahar317/Visitor-Pass-Management-System](https://github.com/Sumitchahar317/Visitor-Pass-Management-System) |

---

## 📖 Overview

Many offices and institutions still rely on manual visitor entry registers — slow, insecure, and impossible to search or audit. This project digitizes the entire visitor lifecycle:

**Invite or walk in → Host approves → A tamper-resistant QR pass is issued → Security scans it at the gate → Every entry and exit is logged.**

The QR code itself never carries visitor data — it's just a random, unguessable pointer to a record on the server. That means a pass can be revoked or expired centrally at any time, and a stolen photo of the code reveals nothing about who it belongs to.

---

## ✨ Features

**Authentication & Authorization**
- JWT-based auth with four distinct roles: Admin, Security, Employee (Host), and Visitor
- Role-gated routes on both the API and the UI — admin-only staff creation, host-scoped appointment approval, and more
- Passwords hashed with bcrypt, never returned in any API response

**Visitor & Appointment Management**
- Host-initiated invites with a unique, tokenized self-registration link — no account required for the visitor
- Visitor self-registration (phone number + photo upload)
- Walk-in registration for unannounced visitors, handled entirely by Security
- Host approval / rejection workflow, scoped so only the actual host (or an admin) can decide

**Digital Passes**
- Auto-issued QR passes the moment an appointment is approved (or a walk-in is registered)
- Validity windows anchored intelligently: a full day for the scheduled visit date on pre-registered passes, an 8-hour window from the moment of entry for walk-ins
- Downloadable PDF visitor badge, complete with photo, host, purpose, and QR code
- Duplicate-issue protection — re-requesting a pass for the same visit returns the existing valid one

**Check-In / Check-Out**
- Live camera-based QR scanning at the gate (via `html5-qrcode`)
- A real state machine: `issued → checked-in → checked-out`, preventing double scans and out-of-order actions
- Full audit trail (`CheckLog`) of every entry and exit, searchable by gate

**Notifications**
- Automated emails at every meaningful step: invite sent, pass ready (QR embedded directly in the email), and the host notified the moment their visitor arrives

**Admin Dashboard**
- Live stats via MongoDB aggregation: appointment breakdown by status, check-ins per day, and visitors currently on-site

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios, Bootstrap |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose ODM |
| Auth | JSON Web Tokens (JWT), bcrypt |
| File Uploads | Multer |
| QR Codes | `qrcode` (generation), `html5-qrcode` (scanning) |
| PDF Generation | PDFKit |
| Email | Nodemailer |

---

## 👥 User Roles & Permissions

| Role | Can do |
|---|---|
| **Admin** | Create staff accounts, view the dashboard, everything a Security or Employee can do |
| **Security** | Register walk-ins, scan QR codes for check-in/check-out, view entry/exit logs |
| **Employee (Host)** | Invite visitors, approve or reject appointments made in their name, issue passes |
| **Visitor** | Complete self-registration via a private invite link — no account needed |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) generated (for email notifications)

### 1. Clone the repository
```bash
git clone <repo-url>
cd visitor-pass-system
```

### 2. Backend setup
```bash
cd server
npm install
```

Create a `.env` file in `/server`:
```env
PORT=8080
URL=your_mongodb_connection_string
SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
```

Seed the database to create the default Admin account:
```bash
npm run seed
```

Start the API server in development mode:
```bash
npm run dev
```
The API will start on `http://localhost:8080`.

### 3. Frontend setup
```bash
cd client
npm install
npm run dev
```
The app will start on `http://localhost:5173`.

---

## 🔑 Demo Credentials

Use these to log in and evaluate each role directly:

| Role | Email | Password |
|---|---|---|
| Admin | `admi1@gmail.com` | `Admin@121` |
| Security | `security1@gmail.com` | `Security@1` |
| Employee | `employee1@gmail.com` | `Employee@1` |

> Since staff accounts can only be created by an existing Admin (by design — see *Security Notes* below), these accounts must exist in the database before login. If you're setting this up fresh, log in as Admin first and create the Security/Employee accounts from **Create Staff** in the navbar.

---

## 📡 API Overview

| Base Route | Purpose |
|---|---|
| `/api/auth` | Register (admin-only), login, current-user check |
| `/api/users` | List staff accounts, filterable by role |
| `/api/visitor` | Visitor profile CRUD |
| `/api/appointments` | Invite, walk-in, approve/reject, list, and the public visitor self-registration endpoints |
| `/api/passes` | Issue, verify, fetch, and download passes as PDF |
| `/api/checkLogs` | Check-in, check-out, and view entry/exit logs |
| `/api/dashboard` | Aggregated stats (admin-only) |

---

## 📁 Project Structure

```
visitor-pass-system/
├── server/
│   ├── controller/     # Route handlers & business logic
│   ├── middleware/      # Auth, role authorization, file upload
│   ├── model/            # Mongoose schemas
│   ├── route/             # Express route definitions
│   ├── utils/             # Mailer and other shared helpers
│   └── server.js
└── client/
    └── src/
        ├── api/            # Axios instance with auth interceptor
        ├── context/        # Global auth state
        ├── components/     # Navbar, ProtectedRoute
        └── pages/
            ├── auth/       # Login
            ├── admin/      # Dashboard, Create Staff
            ├── host/       # Invite, My Appointments
            ├── security/   # Check-In, Walk-In, Logs
            └── visitor/    # Public self-registration
```

---

## 🔒 Security Notes

- Public staff self-registration is intentionally disabled — only an authenticated Admin can create Security or Employee accounts. This closes the obvious gap where anyone could otherwise grant themselves privileged access via a direct API call.
- QR tokens are random and carry no visitor information — the QR code is a pointer, not a data payload.
- Appointment approval and pass issuance are host-scoped: an Employee can only act on appointments where they are the actual host, unless they hold the Admin role.

---

## 🗺️ Possible Future Enhancements

- OTP-based verification at check-in
- Multi-organization / multi-tenant support
- Docker + Nginx deployment
- Richer analytics dashboard with charts

---


