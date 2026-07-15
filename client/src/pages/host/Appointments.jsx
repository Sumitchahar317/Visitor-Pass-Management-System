import React, { useEffect, useState } from 'react'
import api from '../../api/axios'

const Appointments = () => {
  // State to hold the list of appointments fetched from the API.
  const [appointments, setAppointments] = useState([]);
  
  const [error, setError] = useState("");
  
  const [loading, setLoading] = useState(true);
  // State to store generated QR codes, keyed by appointment ID.
  const [qrByAppointment, setQrByAppointment] = useState({});

  // Fetches the list of appointments from the backend.
  const fetchAppointments = async () => {
    try {
      
      const res = await api.get("/appointments");
  
      setAppointments(res.data);
    } catch (err) { 
      setError(err.response?.data?.message || "Failed to load appointments");
    } finally {
      // This runs whether the request succeeded or failed.
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAppointments();
  }, []);

  /**
   * Rejects a pending appointment.
   * @param {string} id - The ID of the appointment to reject.
   */

  const handleApprove = async (id) => {
    try {
      await api.put(`/appointments/${id}/approve`);
      // Refresh the list of appointments to show the updated status.
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve appointment");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/appointments/${id}/reject`);

      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject appointment");
    }
  };

  /**
   * Issues a visitor pass (QR code) for an approved appointment.
   * @param {string} appointmentId - The ID of the appointment.
   */
  const handleIssuePass = async (appointmentId) => {
    try {
      const res = await api.post(`/passes/issue/${appointmentId}`);
      // Update the state to store the new QR code URL against its appointment ID.
      setQrByAppointment((prev) => ({ ...prev, [appointmentId]: res.data.qrDataUrl }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to issue pass");
    }
  }

  // Conditional rendering based on the component's state.
  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="container py-3">
        <h2 className="mb-4">My Appointments</h2>
        {appointments.length === 0 && <p className="text-muted">No appointments found.</p>}

        <div className="row">
          {appointments.map((appt) => (
           <div key={appt._id} className="col-md-6 col-lg-4 mb-4">
             <div className="card h-100 p-3 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0 text-truncate">{appt.visitor?.name || "Unknown Visitor"}</h5>
                    <span className={`badge ${
                      appt.status === "approved" ? "badge-approved" : 
                      appt.status === "rejected" ? "badge-rejected" : "badge-pending"
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-muted mb-2"><small><strong>Purpose:</strong> {appt.purpose}</small></p>
                  <p className="text-muted mb-3"><small><strong>Type:</strong> {appt.type}</small></p>
                </div>
              
                <div className="mt-auto pt-2 border-top">
                  {/* Show Approve/Reject buttons only for pending appointments. */}
                  {appt.status === "pending" && (
                    <div className="d-flex gap-2">
                      <button className="btn btn-success btn-sm flex-fill" onClick={() => handleApprove(appt._id)}>Approve</button>
                      <button className="btn btn-danger btn-sm flex-fill" onClick={() => handleReject(appt._id)}>Reject</button>
                    </div>
                  )}
                  
                  {/* Show Issue Pass button only for approved appointments that don't have a QR code yet. */}
                  {appt.status === "approved" && !qrByAppointment[appt._id] && (
                    <button className="btn btn-primary btn-sm w-100" onClick={() => handleIssuePass(appt._id)}>Issue Pass</button>
                  )}
                  
                  {/* If a QR code has been generated for this appointment, display it. */}
                  {qrByAppointment[appt._id] && (
                    <div className="text-center mt-2">
                      <img src={qrByAppointment[appt._id]} alt="Visitor pass QR code" className="img-fluid" style={{ maxWidth: "120px" }} />
                    </div>
                  )}
                </div>
             </div>
           </div>
          ))}
        </div>
    </div>
  );
}

export default Appointments
