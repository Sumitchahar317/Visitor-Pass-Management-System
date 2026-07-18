# 🎫 Visitor Pass Management System

This is a full-stack web application built using the MERN stack (MongoDB, Express, React, Node.js). It replaces manual paper registers at front desks with digital visitor passes. It allows hosts to pre-register visitors, sends QR-code passes via email and SMS, and lets security check visitors in and out by scanning their codes.

---

## 🔗 Live Links

| Resource | Link |
|---|---|
| 🌐 Live App | [visitor-pass-management-system-eight.vercel.app](https://visitor-pass-management-system-eight.vercel.app/) |
| ⚙️ Backend API | [visitor-pass-management-system-w3h2.onrender.com](https://visitor-pass-management-system-w3h2.onrender.com/) |
| 💻 GitHub Repository | [Sumitchahar317/Visitor-Pass-Management-System](https://github.com/Sumitchahar317/Visitor-Pass-Management-System) |

---

## 📁 Project Structure

Here is the complete layout of the files and folders in this project:

```text
visitor-pass-system/
├── client/                     # Frontend React Application
│   ├── .env                    # Client environment settings (URLs)
│   ├── index.html              # HTML template entry point
│   ├── vite.config.js          # Vite build tool configuration
│   └── src/
│       ├── main.jsx            # React app entry file
│       ├── App.jsx             # App layout and route definitions
│       ├── index.css           # Global custom CSS
│       ├── App.css             # Page-specific styles
│       ├── api/
│       │   └── axios.js        # Axios instance configured with token interceptors
│       ├── components/
│       │   ├── Navbar.jsx      # Navigation bar showing options based on logged-in role
│       │   └── ProtectedRoute.jsx # Route helper that blocks unauthenticated or wrong-role users
│       ├── context/
│       │   └── AuthContext.jsx # Global state to keep track of the logged-in user
│       └── pages/
│           ├── admin/
│           │   ├── CreateUser.jsx # Admin form to create new staff accounts (Employee/Security)
│           │   └── Dashboard.jsx  # Admin page showing metrics and on-site visitor counts
│           ├── auth/
│           │   └── Login.jsx      # Portal for staff members to sign in
│           ├── host/
│           │   ├── Appointments.jsx # Page for employees to view and approve/reject visits
│           │   └── Invite.jsx     # Form for employees to invite new visitors
│           ├── security/
│           │   ├── CheckIn.jsx    # QR code scanner page for entry and exit logging
│           │   ├── Logs.jsx       # Read-only audit log of visitor check-ins and check-outs
│           │   └── Walkin.jsx     # Form for security to register unannounced visitors on the spot
│           └── visitor/
│               └── PreRegister.jsx # Public form for visitors to upload photo and phone number
└── server/                     # Backend Express API Server
    ├── server.js               # Express application setup and database connection
    ├── seed.js                 # Script to create the initial Admin account
    ├── .env                    # Backend secrets (DB link, JWT key, email/SMS API credentials)
    ├── controller/             # Functions handling logic for API requests
    │   ├── appointmentController.js # Managing pre-registrations, walk-ins, and approvals
    │   ├── checkLogsController.js   # Creating and viewing gate check-in/out logs
    │   ├── dashboardController.js   # Gathering stats for the admin homepage
    │   ├── passController.js        # Creating and downloading visitor pass PDFs/QR codes
    │   ├── userController.js        # Managing staff accounts (Employee, Security, Admin)
    │   └── visitorController.js     # Updating and reading visitor profile details
    ├── middleware/             # Express handlers that run before route controllers
    │   ├── authMiddleware.js   # Verifying JWT tokens and user roles
    │   └── upload.js           # Multer settings for handling visitor photo uploads
    ├── model/                  # MongoDB schemas defining how data is stored
    │   ├── appointmentModel.js # Database schema for a scheduled or walk-in visit
    │   ├── checkLogsModel.js   # Database schema for gate check-in and check-out logs
    │   ├── passModel.js        # Database schema for issued visitor passes
    │   ├── userModel.js        # Database schema for staff accounts
    │   └── visitorModel.js     # Database schema for visitor profile details
    ├── route/                  # API endpoint route paths
    │   ├── appointmentRoute.js
    │   ├── checkLogsRoute.js
    │   ├── dashboardRoute.js
    │   ├── passRoute.js
    │   ├── userRoute.js
    │   └── visitorRoute.js
    └── utils/                  # Helper utilities for third-party integrations
        ├── mailer.js           # Configured Nodemailer settings to send emails
        └── sms.js              # Configured Textbelt integration to send texts
```

---

## 📖 How the Features Work

This system handles the entire lifecycle of a visitor coming to an office. Here is how the features are organized:

### 1. User Roles & Access
*   **Admin**: The manager of the system. Admins can view the dashboard stats (like how many people are currently inside the building) and create accounts for other staff members.
*   **Employee (Host)**: Regular office staff. They can invite new visitors and approve or reject appointments requested in their name.
*   **Security**: Guards at the main gate. They register unexpected walk-in visitors and scan the QR codes of arriving/departing visitors.
*   **Visitor**: The guests. They receive email and text notifications and fill out their own profile details using an invite link.

### 2. Pre-Registration Flow (Invites)
*   An **Employee** goes to the **Invite** page, fills out the guest's name, email, phone number, and scheduled date, and submits.
*   The system creates a visitor record and generates a random, unique `inviteToken`.
*   An invitation email and SMS are sent to the guest containing a link to the public pre-registration page.
*   The **Visitor** clicks the link, inputs their phone number, uploads a photo of themselves, and saves.
*   The host reviews this under **My Appointments** and clicks **Approve**. Once approved, a pass containing a QR code is generated, and a pass PDF is emailed to the visitor.

### 3. Walk-in Flow
*   If a guest arrives without an invite, the **Security** guard opens the **Register Walk-in Visitor** page.
*   Security fills out their name, phone number, company name, selects which employee they want to visit, and uploads a quick snapshot of the visitor.
*   Once submitted, a pass is immediately generated and approved, showing a QR code on the screen which the visitor can scan with their phone.

### 4. Scanning & Check-in
*   At the entrance gate, the visitor presents their QR code.
*   The **Security** guard opens the camera scanner tool on the **Check-in** tab and scans the QR code.
*   The system verifies if the pass is valid for the current day and updates the pass status to `checked-in`.
*   When the visitor leaves, the guard scans the QR code again, changing the pass status to `checked-out`. This prevents someone from reusing the same pass to enter the building a second time.

---

## 🔒 Security & Code Patterns Explained Simply

Instead of relying on over-complicated security setups, the project implements a clean, developer-friendly approach to protect data:

*   **Protecting Passwords (bcrypt)**: When staff accounts are created, their passwords are encrypted using a library called `bcrypt` before saving to MongoDB. The system never stores plain text passwords, and password hashes are filtered out of API responses.
*   **API Route Guarding (JWT)**: When a staff member logs in, the backend sends a secure JSON Web Token (JWT) back. The React client saves this token and attaches it to every API request header. Express middleware checks this token to make sure the user is logged in and has the required role (e.g., stopping a standard employee from accessing admin routes).
*   **Safe QR Codes**: The QR code printed on passes does not store name, company, or email inside it. Instead, it contains a simple random ID string (UUID). If someone takes a picture of the QR code, they cannot read any personal information from it. The scanner simply sends the ID string back to the server, and the server fetches the visitor info safely from the database.
*   **Double-Scan Protection**: Every pass has a status of `issued`, `checked-in`, or `checked-out`. The server checks this status during scans so visitors cannot check in twice or use a pass that has already checked out.

---

## 🛠️ Third-Party Tools Used

*   **Mongoose (MongoDB)**: Used to define schemas and fetch/update database collections for visitors, users, passes, and check logs.
*   **Multer**: Used on the server to handle profile picture uploads and save them locally inside the `server/uploads/` directory.
*   **Nodemailer**: Connects to a Gmail SMTP configuration to send invitation links and pass QR codes.
*   **Textbelt**: Sends text message alerts to visitors containing their pre-registration links or check-in confirmations.
*   **PDFKit**: Used on the server side to build and draw visitor pass PDF badges.
*   **html5-qrcode**: A client-side library that accesses the webcam to scan visitor passes from the browser.

---

## 🚀 How to Run the Project Locally

### Prerequisites
*   [Node.js](https://nodejs.org/) installed (version 18 or higher is recommended)
*   A running [MongoDB](https://www.mongodb.com/) database (local instance or MongoDB Atlas cluster)

### 1. Set Up the Server (Backend)
1.  Navigate into the server folder:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a file named `.env` inside the `server` directory and configure your keys:
    ```env
    PORT=8080
    URL=your_mongodb_connection_string
    SECRET=your_jwt_secret_key_here
    CLIENT_URL=http://localhost:5173

    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your_gmail_address@gmail.com
    SMTP_PASS=your_gmail_app_password

    # Optional: Enter your Textbelt API key (leave blank to run in mock sandbox mode)
    TEXTBELT_API_KEY=
    ```
4.  Seed the database to generate the default Admin account:
    ```bash
    npm run seed
    ```
5.  Start the backend server:
    ```bash
    npm run dev
    ```
    The server will start running on `http://localhost:8080`.

### 2. Set Up the Client (Frontend)
1.  Open a new terminal window and navigate to the client folder:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the frontend development server:
    ```bash
    npm run dev
    ```
    The frontend will run at `http://localhost:5173`. Open this URL in your web browser.

---

## 🔑 Default Login Credentials

Use these accounts to sign in and test the system:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admi1@gmail.com` | `Admin@121` |
| **Security** | `security1@gmail.com` | `Security@1` |
| **Employee** | `employee1@gmail.com` | `Employee@1` |

> **Note**: To create new staff members, log in as the **Admin** and use the **Create Staff** link in the navigation bar.
