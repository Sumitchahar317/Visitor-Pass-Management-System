import axios from "axios";

// All requests made with this `api` instance will be prefixed with "/api".
// e.g., api.get("/users") will make a request to "/api/users".
const api = axios.create({baseURL: import.meta.env.VITE_API_URL || "/api"})

// This is a "request interceptor". runs before any request sent from client
api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) config.headers.Authorization = `Bearer ${token}`;
   
    return config;
});


// This is a "response interceptor".runs after res from backend/server

api.interceptors.response.use(
  (response) => response, // handles successful responses (status 2xx).
  (error) => { // handel error

    if (error.response?.status === 401 && !error.config?.url?.includes("/auth/login")) {

      localStorage.removeItem("token"); // token is either expired or invalid
      
      // Force a redirect to the login page to re-authenticate
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;


