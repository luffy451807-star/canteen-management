import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/staffManagement.css";

const StaffManagement = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [message, setMessage] = useState({ type: "", text: "" });

    const fetchStaff = async () => {
        try {
            const res = await axios.get("/auth/staff-list");
            setStaff(res.data);
        } catch (err) {
            console.error("Failed to fetch staff", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/auth/staff", formData);
            setMessage({ type: "success", text: "Staff added successfully!" });
            setFormData({ name: "", email: "", password: "" });
            fetchStaff();
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to add staff" });
        }
    };

    const handleDeleteStaff = async (id) => {
        if (!window.confirm("Are you sure you want to remove this staff member?")) return;
        try {
            await axios.delete(`/auth/staff/${id}`);
            setMessage({ type: "success", text: "Staff removed successfully!" });
            fetchStaff();
        } catch (err) {
            setMessage({ type: "error", text: "Failed to remove staff" });
        }
    };

    return (
        <div className="staff-management">
            <header className="staff-header">
                <button className="back-btn" onClick={() => navigate("/admin")}>
                    ← Back to Dashboard
                </button>
                <h1>Staff Management</h1>
            </header>

            {message.text && (
                <div className={`status-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="staff-grid">
                <div className="add-staff-card">
                    <h2>Add New Staff</h2>
                    <form onSubmit={handleAddStaff}>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter full name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter email address"
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter strong password"
                            />
                        </div>
                        <button type="submit" className="submit-btn">
                            Create Account
                        </button>
                    </form>
                </div>

                <div className="staff-list-card">
                    <h2>Active Staff</h2>
                    {loading ? (
                        <p>Loading staff list...</p>
                    ) : (
                        <div className="table-wrapper">
                            <table className="staff-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staff.map((s) => (
                                        <tr key={s.id}>
                                            <td>{s.name}</td>
                                            <td>{s.email}</td>
                                            <td>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteStaff(s.id)}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {staff.length === 0 && (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: "center" }}>
                                                No staff accounts found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffManagement;
