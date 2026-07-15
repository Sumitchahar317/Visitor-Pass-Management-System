import { useEffect, useState } from "react";
import api from "../../api/axios";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load stats"));
  }, []);

  if (error) return <p className="login-error">{error}</p>;
  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div className="container py-3">
      <h2 className="mb-4">Admin Dashboard</h2>

      <div className="row g-4 mb-4">
        {/* Metric Card */}
        <div className="col-md-4">
          <div className="card bg-primary text-white p-4 text-center">
            <h1 className="display-4 fw-bold">{stats.currentlyCheckedIn}</h1>
            <p className="mb-0 fs-5">Visitors currently on premises</p>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="col-md-4">
          <div className="card p-4">
            <h4 className="mb-3">Appointments by Status</h4>
            <ul className="list-group list-group-flush">
              {stats.statusBreakdown.map((s) => (
                <li key={s._id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span className="text-capitalize">{s._id}</span>
                  <span className={`badge px-2 py-1 rounded-pill ${
                    s._id === "approved" ? "badge-approved" : 
                    s._id === "rejected" ? "badge-rejected" : "badge-pending"
                  }`}>
                    {s.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Check-ins timeline Card */}
        <div className="col-md-4">
          <div className="card p-4">
            <h4 className="mb-3">Daily Check-ins (30 Days)</h4>
            <div style={{ maxHeight: "150px", overflowY: "auto" }}>
              <ul className="list-group list-group-flush">
                {stats.visitsPerDay.map((v) => (
                  <li key={v._id} className="list-group-item d-flex justify-content-between align-items-center px-0 py-1">
                    <small>{v._id}</small>
                    <span className="badge bg-secondary">{v.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;