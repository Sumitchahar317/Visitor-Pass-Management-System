import React, { useState } from 'react'
import api from "../../api/axios";

const CreateUser = () => {
    // A single state object to manage all form fields.
    const[form , setForm] = useState({name: "", email: "", password : "", phone : "", role: ""}); 
    
    const [message, setMessage] = useState("");

    const [error, setError] = useState("");

    /**
     * A generic handler to update the form state object.
     * It uses the input's `name` attribute to know which field to update.
     */
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async(e)=>{
        // Prevent the browser from reloading the page.
        e.preventDefault();

        // Clear previous messages.
        setError("");
        setMessage("");

        try{
          // Send the entire form state object to the registration endpoint.
          const response = await api.post("/auth/register", form);

          // Display the success message from the server.
          setMessage(response.data.message); // data- body of the successful response from server side

          // Reset the form to its initial empty state.
          setForm({name: "", email: "", password : "", phone : "", role: ""});
        }catch(err){
          setError(err.response?.data?.message || "Something went wrong");
        }
    }

  return (
    <div className="container py-3">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card p-4 shadow-sm">
            <h2 className="mb-4 text-center">Create Staff Account</h2>

            {/* Conditionally render success and error messages */}
            {message && <p className="alert alert-success">{message}</p>}
            {error && <p className="alert alert-danger">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor='name' className="form-label">Full Name:</label>
                <input
                  type="text"
                  name="name"
                  id='name'
                  className="form-control"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>  

              <div className="mb-3">
                <label htmlFor='email' className="form-label">Email Address:</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor='password' className="form-label">Password:</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="form-control"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor='phone' className="form-label">Phone Number:</label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  className="form-control"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor='role' className="form-label">Role:</label>
                <select
                  name="role"
                  id='role'
                  className="form-select"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select role</option>
                  <option value="security">Security</option>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <button type='submit' className="btn btn-primary w-100 mt-2">Create User</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateUser
