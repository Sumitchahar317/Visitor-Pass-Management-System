import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        {/* Brand Link */}
        <Link className="navbar-brand ms-2" to="/">
          Visitor Pass System
        </Link>
        
        {/* Responsive Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links (Responsive collapse block) */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {user && (
              <>
                {/* Admin-only links */}
                {user.role === "admin" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/dashboard">
                        Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/users/new">
                        Create Staff
                      </Link>
                    </li>
                  </>
                )}

                {/* Security or Admin links */}
                {(user.role === "security" || user.role === "admin") && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/security/checkin">
                        Gate Check-In
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/security/walkin">
                        Register Walk-In
                      </Link>
                    </li>
                  </>
                )}

                {/* Employee (Host) or Admin links */}
                {(user.role === "employee" || user.role === "admin") && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/host/appointments">
                        My Appointments
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/host/invite">
                        Invite Visitor
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>

          {/* User Status / Login Button Panel */}
          <div className="d-flex align-items-center me-2">
            {user ? (
              <>
                <span className="navbar-text text-white me-3">
                  Signed in as: <strong className="text-info">{user.name}</strong> ({user.role})
                </span>
                <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link className="btn btn-outline-light btn-sm" to="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
