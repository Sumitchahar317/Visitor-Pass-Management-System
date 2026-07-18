import React, { useState } from 'react'
import api from '../../api/axios'


const Invite = () => {
    const [form , setForm] = useState({name : "", email : "", phone: "", purpose : "", scheduledDate : ""});
    const [message , setMessage] = useState("")
    const [error , setError] = useState("")

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e)=>{

        e.preventDefault();
        setMessage("") 
        setError("")

        try{
            await api.post("/appointments/invite", form)
           
            setMessage("Invite sent! The visitor will receive an email and SMS with their registration link.");
            setForm({ name: "", email: "", phone: "", purpose: "", scheduledDate: "" });

        }catch(err){
            setError(err.response?.data?.message || "Failed to send invite");
        }

    }

  return (
    <div className="container py-3">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card p-4 shadow-sm">
            <h2 className="mb-4 text-center">Invite a Visitor</h2>
            
            {message && <p className="alert alert-success">{message}</p>}
            {error && <p className="alert alert-danger">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Visitor Name</label>
                <input type="text" name="name" className="form-control" id="name"  
                  value={form.name} onChange={handleChange} required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email address</label>
                <input type="email" name="email" className="form-control" id="email" 
                  value={form.email} onChange={handleChange} required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input type="tel" name="phone" className="form-control" id="phone" 
                  value={form.phone} onChange={handleChange} required
                  placeholder="e.g. +15555555555"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="purpose" className="form-label">Purpose</label>
                <input type="text" name="purpose" className="form-control" id="purpose" 
                  value={form.purpose} onChange={handleChange} required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="scheduledDate" className="form-label">Schedule Date</label>
                <input type="date" name="scheduledDate" className="form-control" id="scheduledDate" 
                  value={form.scheduledDate} onChange={handleChange} required
                />
              </div>
              
              <button type="submit" className="btn btn-primary w-100 mt-2">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Invite;
