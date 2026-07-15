import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute component limits access to authenticated users
 * and can optionally restrict routes based on user roles.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The component to render if authorized.
 * @param {string[]} [props.roles] - Optional array of authorized roles.
 */
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  // 1. While the authentication status is being checked/verified,
  // display a loading indicator to avoid premature redirection.
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h3>Loading...</h3>
      </div>
    );
  }

  // 2. If the user is not authenticated, redirect them to the login page.
  // We use `replace` to prevent them from hitting the back-button and returning here.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If specific roles are required and the user's role is not allowed,
  // show an Access Denied message or redirect them as appropriate.
  if (roles && !roles.includes(user.role)) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>403 - Access Denied</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  // 4. If authenticated and authorized, render the child component.
  return children;
};

export default ProtectedRoute;
