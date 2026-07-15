import { useEffect, useState } from "react";
import api from "../../api/axios";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [gateId, setGateId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/checklogs", { params: gateId ? { gateId } : {} });
      setLogs(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="container py-3">
      <h2 className="mb-4">Check-In / Check-Out Logs</h2>

      <div className="card p-3 mb-4">
        <form onSubmit={handleFilter} className="row g-3 align-items-center">
          <div className="col-sm-4">
            <input 
              value={gateId} 
              onChange={(e) => setGateId(e.target.value)} 
              placeholder="Filter by Gate ID (e.g. main-gate)" 
              className="form-control"
            />
          </div>
          <div className="col-sm-2">
            <button type="submit" className="btn btn-primary w-100">Filter</button>
          </div>
        </form>
      </div>

      {loading && <p>Loading logs...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <div className="card p-3 shadow-sm">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0 align-middle">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Gate</th>
                  <th>Checked In</th>
                  <th>Checked Out</th>
                  <th>Scanned By</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td><strong>{log.pass?.visitor?.name || "—"}</strong></td>
                    <td>{log.gateId}</td>
                    <td>{log.checkInTime ? new Date(log.checkInTime).toLocaleString() : "—"}</td>
                    <td>
                      {log.checkOutTime ? (
                        new Date(log.checkOutTime).toLocaleString()
                      ) : (
                        <span className="badge bg-success">On Premises</span>
                      )}
                    </td>
                    <td>{log.scannedBy?.name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!loading && logs.length === 0 && <p className="text-muted">No logs found.</p>}
    </div>
  );
};

export default Logs;