import React, { useEffect, useState } from 'react'
import api from "../../api/axios";

const Walkin = () => {
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState({ name: "", email: "", phone: "", companyName: "", host_id: "", purpose: "" });
    const [photo, setPhoto] = useState(null);
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/users?role=employee")
            .then((res) => setEmployees(res.data))
            .catch(() => setError("Failed to load employee list"));
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setQrDataUrl(null);

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => formData.append(key, value));
        if (photo) formData.append("photo", photo);

        try {
            const res = await api.post("/appointments/walkin", formData);
            setQrDataUrl(res.data.qrDataUrl);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to register walk-in visitor");
        }
    };

    const handleNext = () => {
        setForm({ name: "", email: "", phone: "", companyName: "", host_id: "", purpose: "" });
        setPhoto(null);
        setQrDataUrl(null);
    };

    if (qrDataUrl) {
        return (
            <div className="container py-3">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card p-4 shadow-sm text-center">
                            <h2 className="text-success mb-3">Pass Ready</h2>
                            <div className="mb-4">
                                <img src={qrDataUrl} alt="Visitor pass QR code" className="img-fluid" style={{ maxWidth: "200px" }} />
                            </div>
                            <p className="text-muted mb-4">Show this to security for check-in.</p>
                            <button className="btn btn-primary w-100" onClick={handleNext}>Register Next Visitor</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-3">
            <div className="row justify-content-center">
                <div className="col-md-7 col-lg-6">
                    <div className="card p-4 shadow-sm">
                        <h2 className="mb-4 text-center">Register Walk-in Visitor</h2>
                        <form onSubmit={handleSubmit}>

                            <div className="mb-3">
                                <label htmlFor='name' className="form-label">Full name:</label>
                                <input
                                    type="text"
                                    name="name"
                                    id='name'
                                    className="form-control"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor='phone' className="form-label">Phone :</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    id='phone'
                                    className="form-control"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor='email' className="form-label">Email :</label>
                                <input
                                    type="email"
                                    name="email"
                                    id='email'
                                    className="form-control"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor='companyName' className="form-label"> Company Name:</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    id='companyName'
                                    className="form-control"
                                    value={form.companyName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor='purpose' className="form-label"> Purpose:</label>
                                <input
                                    type="text"
                                    name="purpose"
                                    id='purpose'
                                    className="form-control"
                                    value={form.purpose}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor='role' className="form-label">Who are visitor visiting?</label>
                                <select
                                    name="host_id" id='role' className="form-select" value={form.host_id}
                                    onChange={handleChange} required >

                                    <option value="">Who are they visiting?</option>
                                    {employees.map((emp) => (
                                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                                    ))}

                                </select>
                            </div>

                            <div className="mb-3">
                                <label htmlFor='file' className="form-label"> Upload photo :</label>
                                <input type="file" accept="image/jpeg,image/png,image/webp" id='file' className="form-control"
                                    onChange={(e) => setPhoto(e.target.files[0])} />
                            </div>


                            {error && <p className="text-danger mb-3">{error}</p>}

                            <button type='submit' className='btn btn-primary w-100 mt-2'>Submit</button>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Walkin
