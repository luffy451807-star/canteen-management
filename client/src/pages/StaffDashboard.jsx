import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import OrderColumn from "../components/staff/Ordercolumn";
import { useNavigate } from "react-router-dom";
import "../styles/staffDashboard.css";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const handleOrderUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const initials =
    user?.name
      ?.split(" ")
      .map(w => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "ST";

  return (
    <div className="staff-dashboard">

     {/* HEADER */}
<header className="dashboard-header">

  {/* LEFT — Brand only */}
  <div className="header-brand">
    <div className="header-brand-icon">🍽️</div>
    <div>
      <h1>PICT Canteen</h1>
      <span className="header-sub">Pune Institute of Computer Technology</span>
    </div>
  </div>

  {/* CENTER — Clock */}
  <div className="header-clock">
    <span className="clock-time">
      {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
    </span>
    <span className="clock-date">
      {time.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
    </span>
  </div>

  {/* RIGHT — Actions + User */}
  <div className="header-right">
    <button className="menu-manage-btn" onClick={() => navigate("/staff/menu")}>
      🍽️ Manage Menu
    </button>

    <div className="header-divider" />

    <div className="header-user-card">
      <div className="header-avatar">{initials}</div>
      <div className="header-user-info">
        <p className="user-name">{user?.name ?? "Staff"}</p>
        <p className="user-role">👨‍🍳 Staff Member</p>
      </div>
    </div>

    <button className="logout-btn" onClick={logout}>↩ Logout</button>
  </div>

</header>

      {/* ORDERS BOARD */}
      <main className="orders-board">

        <OrderColumn
          title="Received"
          status="CONFIRMED"
          refreshKey={refreshKey}
          onOrderUpdated={handleOrderUpdated}
        />

        <OrderColumn
          title="Preparing"
          status="PREPARING"
          refreshKey={refreshKey}
          onOrderUpdated={handleOrderUpdated}
        />

        <OrderColumn
          title="Ready"
          status="READY"
          refreshKey={refreshKey}
          onOrderUpdated={handleOrderUpdated}
        />

        <OrderColumn
          title="Delivered"
          status="DELIVERED"
          refreshKey={refreshKey}
          onOrderUpdated={handleOrderUpdated}
        />

      </main>

    </div>
  );
};

export default StaffDashboard;