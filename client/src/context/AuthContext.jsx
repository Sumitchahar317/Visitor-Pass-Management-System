import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

// createContext is used to passing data (login/out info) to every component (Avoid prop drilling)

// This will be used to provide and consume authentication data throughout the app.
const AuthContext = createContext(null);

// Create the AuthProvider component.
// This component will wrap your application and manage the authentication state.
export const AuthProvider = ({ children }) => {
  // State to hold the authenticated user object. Null if not logged in.
  const [user, setUser] = useState(null);
  // State to track if the initial authentication check is complete.
  // This is useful for showing a loading spinner on app startup.
  const [loading, setLoading] = useState(() => {
    return !!localStorage.getItem("token");
  });

  // useEffect runs once when the component mounts to check for a persistent session.
  useEffect(() => {
    // Try to get the token from the browser's local storage.
    const token = localStorage.getItem("token");
    // If there's no token, we know the user isn't logged in.
    if (!token) return;

    // If a token exists, send it to the backend to verify who the user is.
    // Our `api` instance automatically attaches the token to this request.
    api.get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      // No matter the outcome, the initial loading process is finished.
      .finally(() => setLoading(false));
  }, []);

  /**
   * Logs the user in by sending credentials to the API.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<object>} The user object from the server.
   */
  const login = async (email, password) => {
    // Make a POST request to the login endpoint.
    const res = await api.post("/auth/login", { email, password });
    // If successful, store the new token in local storage for persistence.
    localStorage.setItem("token", res.data.token);
    // Update the user state with the user data from the response.
    setUser(res.data.user);
    return res.data.user;
  };

  /**
   * Logs the user out.
   */
  const logout = () => {
    // Remove the token from local storage.
    localStorage.removeItem("token");
    // Clear the user from the state.
    setUser(null);
  };

  // The Provider component makes the auth state and functions available to any child component.
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create a custom hook for easy access to the context.
// This avoids having to import `useContext` and `AuthContext` in every component.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);




