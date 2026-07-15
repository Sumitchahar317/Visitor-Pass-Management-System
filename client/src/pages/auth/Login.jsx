import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    // Prevent the default form behavior which reloads the page.
    e.preventDefault();

    setError("");
    try {
      // Call the login function from the AuthContext with the user's credentials.
      const user = await login(email, password);

      // Define a map to determine the correct homepage based on the user's role.
      const roleHome = {
        admin: "/admin/dashboard",
        security: "/security/checkin",
        employee: "/host/appointments",
      };

      // Redirect the user to their role-specific homepage, or to the root if no role matches.
      navigate(roleHome[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card p-4 shadow-sm">
            <h2 className="mb-4 text-center">Login</h2>
            
            {error && <p className="alert alert-danger">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="inpEmail1" className="form-label">Email address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  id="inpEmail1" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="inpPassword" className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  id="inpPassword" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 mt-2">Login</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

};

export default Login;
