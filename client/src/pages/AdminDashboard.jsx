import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/adminDashboard.css";

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/orders/admin/all");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const verifyPayment = async (orderId, success) => {
    try {
      await axios.patch(`/orders/verify/${orderId}`, { success });
      fetchOrders();
    } catch (err) {
      alert("Failed to verify payment");
    }
  };

  const changeOrderStatus = async (orderId, status) => {
    try {
      await axios.patch(`/orders/status/${orderId}`, { status });
      fetchOrders();
    } catch (err) {
      alert("Failed to update order status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return '#16a34a';
      case 'PENDING_VERIFICATION': return '#d97706';
      case 'FAILED': return '#dc2626';
      case 'UNPAID': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active">
            📊 Dashboard
          </button>
          <button className="nav-item" onClick={() => navigate("/staff/menu")}>
            🍴 Manage Menu
          </button>
          <button className="nav-item" onClick={() => navigate("/admin/staff")}>
            👥 Manage Staff
          </button>
        </nav>
      </div>

      <div className="admin-main">
        <header className="admin-header">
          <h1>Dashboard Overview</h1>
          <div className="header-actions">
            <button className="logout-btn" onClick={logout}>
              ↩ Logout
            </button>
          </div>
        </header>

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Total Orders</h3>
              <p className="stat-val">{orders.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>Pending Verification</h3>
              <p className="stat-val">{orders.filter(o => o.payment_status === 'PENDING_VERIFICATION').length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Revenue</h3>
              <p className="stat-val">₹{orders.filter(o => o.payment_status === 'PAID').reduce((sum, o) => sum + parseFloat(o.total_amount), 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="orders-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
          </div>
          {loading ? (
            <p>Loading orders...</p>
          ) : (
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Payment Status</th>
                    <th>Order Status</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: '600', color: '#111827' }}>
                        ORD-{String(order.id).padStart(4, '0')}
                      </td>
                      <td>
                        <div style={{ fontWeight: '500', color: '#1f2937' }}>{order.user_name || 'Unknown User'}</div>
                        <div style={{ fontSize: '0.85em', color: '#6b7280' }}>{order.user_email || 'No Email'}</div>
                        {order.payer_name && <div style={{ fontSize: '0.85em', color: '#10b981', marginTop: '4px', fontWeight: '500' }}>Payer: {order.payer_name}</div>}
                        {order.transaction_id && <div style={{ fontSize: '0.8em', color: '#4b5563' }}>Txn ID: {order.transaction_id}</div>}
                      </td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: getStatusColor(order.payment_status) }}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td>{order.order_status}</td>
                      <td>₹{order.total_amount}</td>
                      <td>
                        {order.payment_status === 'PENDING_VERIFICATION' && (
                          <div className="action-btns">
                            <button className="verify-btn" onClick={() => verifyPayment(order.id, true)}>Verify</button>
                            <button className="reject-btn" onClick={() => verifyPayment(order.id, false)}>Reject</button>
                          </div>
                        )}
                        {order.payment_status === 'PAID' && !['DELIVERED', 'CANCELLED'].includes(order.order_status) && (
                          <select
                            value={order.order_status}
                            onChange={(e) => changeOrderStatus(order.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="PLACED">Placed</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PREPARING">Preparing</option>
                            <option value="READY">Ready</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;