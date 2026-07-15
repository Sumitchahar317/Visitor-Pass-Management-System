import React, { useEffect, useState } from 'react'
import api from "../../api/axios"
import { useParams } from 'react-router-dom'


const PreRegister = () => {
    
    const { inviteToken } = useParams();
    // State to hold the appointment details fetched from the server.
    const [appointment, setAppointment] = useState(null);
    
    const [loading, setLoading] = useState(true);
  
    const [error, setError] = useState("");
    // State to track if the form has been successfully submitted.
    const [submitted, setSubmitted] = useState(false);

    const [phone, setPhone] = useState("");
    
    const [photo, setPhoto] = useState(null);

    // This effect runs once when the component mounts to fetch the appointment details.
    useEffect(() => {
      
      api.get(`/appointments/invite/${inviteToken}`)
        // If successful, store the appointment data in state.
        .then((res) => setAppointment(res.data.appointment))
        // If an error occurs (e.g., invalid token), set an error message.
        .catch((err) => setError(err.response?.data?.message || "Invalid or expired invite link"))
        // No matter the outcome, set loading to false to hide the loading indicator.
        .finally(() => setLoading(false));
    }, [inviteToken]);

    /**
     * Handles the form submission to complete the visitor's registration.
     */
    const handleSubmit = async (e) => {
      // Prevent the default browser behavior of reloading the page on form submission.
      e.preventDefault();
     
      setError("");

      // Create a FormData object to handle the file upload.
      const formData = new FormData();

      // Append the phone number to the form data.
      formData.append("phone", phone);

      // If a photo file has been selected, append it as well.
      if (photo) formData.append("photo", photo);

      try {
        
        await api.put(`/appointments/invite/${inviteToken}/complete`, formData);
        // On success, set the submitted flag to true to show the confirmation message.
        setSubmitted(true);
      } catch (err) {
        
        setError(err.response?.data?.message || "Failed to submit registration");
    }
  };

  
  if (loading) return <p>Loading your invite...</p>;
  
  if (error && !appointment) return <p className="login-error">{error}</p>;
  
  
  if (submitted) return (
  <div>
    <h2>Registration complete!</h2>
    <p>Your host will review your visit request. You'll be notified once it's approved and your pass is ready.</p>
  </div>
);
  
  return (
    <div>
        <h2>Complete Your Registration</h2>
        
      <p>You're invited by {appointment.host?.name} — {appointment.purpose}</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor='phone'className="form-label" >Phone Number:</label>
          
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          required
          className='form-control'
        />
        </div>  

        <div className="mb-3">
          <label htmlFor='photo'className="form-label" >Photo:</label>
          
          <input
          type="file"
          id='photo'
          className='form-control'
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setPhoto(e.target.files[0])}
        />
        </div>
        
        
        {error && <p className="login-error">{error}</p>}
        <button type="submit" className='btn btn-primary mt-2'>Complete Registration</button>
      </form>
      
    </div>
  )
}

export default PreRegister
