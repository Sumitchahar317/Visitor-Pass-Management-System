import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import CreateUser from "./pages/admin/CreateUser";
import CheckIn from "./pages/security/CheckIn";
import Appointments from "./pages/host/Appointments";
import Invite from "./pages/host/Invite";
import PreRegister from "./pages/visitor/PreRegister";
import Walkin from "./pages/security/Walkin";
import Dashboard from "./pages/admin/Dashboard";
import Logs from "./pages/security/Logs";
import Navbar from "./components/Navbar";


function App() {
  return (
    // BrowserRouter enables client-side routing for the application.
    <BrowserRouter>
      {/* AuthProvider makes authentication state (user, login, logout) available to all child components. */}
      <AuthProvider>
        <Navbar />
        <div className="container">
          {/* The Routes component manages which component to render based on the current URL. */}
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            {/* This route is for visitors to complete their pre-registration.
                ':inviteToken' is a URL parameter that will hold the unique invitation token. */}
            
            <Route path="/pre-register/:inviteToken" element={<PreRegister />} />

            {/* Protected Routes */}
            {/* This route is only accessible to users with the 'admin' role. */}
            
            <Route path="/admin/users/new" element={<ProtectedRoute roles={["admin"]}><CreateUser /></ProtectedRoute>} />

            <Route path="/security/checkin" element={<ProtectedRoute roles={["security","admin"]}><CheckIn /></ProtectedRoute>} />
            
            <Route path="/host/appointments" element={<ProtectedRoute roles={["employee","admin"]}><Appointments /></ProtectedRoute>} />
            
            <Route path="/host/invite" element={<ProtectedRoute roles={["employee","admin"]}><Invite /></ProtectedRoute>} />
            
            <Route path="/security/walkin" element={<ProtectedRoute roles={["security","admin"]}><Walkin /></ProtectedRoute>} />

            <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><Dashboard /></ProtectedRoute>} />
            
            <Route path="/security/logs" element={<ProtectedRoute roles={["security","admin"]}><Logs /></ProtectedRoute>} />
            
            {/* Redirect root path to the login page. 
                The 'replace' prop prevents the user from using the back button to get to the root path. */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* A catch-all route that renders a 404 message for any path that doesn't match the ones above. */}
            <Route path="*" element={<h2>404</h2>} />
            
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
