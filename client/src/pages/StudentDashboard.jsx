import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axios";
import "../styles/studentDashboard.css";

import StatsRow      from "../components/student/StatsRow";
import MenuSection   from "../components/student/MenuSection";
import CartSection   from "../components/student/CartSection";
import OrdersSection from "../components/student/OrdersSection";
import Toast         from "../components/shared/Toast";

const StudentDashboard = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [menu,      setMenu]      = useState([]);
  const [cart,      setCart]      = useState([]);
  const [orders,    setOrders]    = useState([]);
  const [category,  setCategory]  = useState("All");
  const [placing,   setPlacing]   = useState(false);
  const [toast,     setToast]     = useState(null);
  const [activeTab, setActiveTab] = useState("menu");
  const [orderTab,  setOrderTab]  = useState("pending");
  const [time,      setTime]      = useState(new Date());

  // ── Clock ──────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchMenu = async () => {
    try {
      const res  = await axios.get("/menu");
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setMenu(data || []);
    } catch (err) { console.error("Menu fetch failed", err); setMenu([]); }
  };

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get("/orders/my");
      setOrders(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) { console.error("Orders fetch failed", err); }
  }, []);

  useEffect(() => {
    fetchMenu();
    fetchOrders();
    const poller = setInterval(fetchOrders, 30000);
    return () => clearInterval(poller);
  }, [fetchOrders]);

  // ── Auto-switch order tab ──────────────────────────────────
  useEffect(() => {
    if (activeTab !== "orders") return;
    if (awaitingPaymentOrders.length > 0)    setOrderTab("awaiting");
    else if (inProgressOrders.length > 0) setOrderTab("inprogress");
    else setOrderTab("completed");
  }, [activeTab, orders]);

  // ── Cart actions ───────────────────────────────────────────
  const addToCart  = (item) => setCart(prev => {
    const ex = prev.find(c => c.id === item.id);
    return ex
      ? prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      : [...prev, { ...item, quantity: 1 }];
  });
  const increaseQty = (id) => setCart(c => c.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
  const decreaseQty = (id) => setCart(c => c.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0));
  const clearCart   = () => setCart([]);

  // ── Order actions ──────────────────────────────────────────
  const placeOrder = async () => {
    if (!cart.length) return;
    setPlacing(true);
    try {
      const res = await axios.post("/orders/create", {
        items: cart.map(item => ({ menuItemId: item.id, quantity: item.quantity }))
      });
      
      const orderId = res.data.orderId;
      clearCart();
      setToast({ message: "Order created! Redirecting to payment...", type: "success" });
      
      // Delay navigation slightly so toast is visible
      setTimeout(() => {
        navigate(`/payment/${orderId}`);
      }, 1500);
      
    } catch (err) {
      console.error("Order creation failed", err);
      setToast({ message: "Failed to place order. Try again.", type: "error" });
    } finally {
      setPlacing(false);
    }
  };

  const payOrder = async (orderId) => {
    try {
      await axios.post(`/orders/pay/${orderId}`);
      await fetchOrders();
      setToast({ message: "Payment submitted for verification!", type: "success" });
    } catch (err) {
      setToast({ message: "Payment failed!", type: "error" });
      console.error(err);
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await axios.delete(`/orders/delete/${orderId}`);
      await fetchOrders();
      setToast({ message: "Order deleted", type: "success" });
    } catch (err) {
      setToast({ message: "Something went wrong", type: "error" });
      throw err;
    }
  };

  // ── Derived ────────────────────────────────────────────────
  const awaitingPaymentOrders = orders.filter(o => ['UNPAID', 'PENDING_VERIFICATION'].includes(o.payment_status));
  const inProgressOrders = orders.filter(o => o.payment_status === 'PAID' && !['DELIVERED', 'CANCELLED'].includes(o.order_status));
  const completedOrders = orders.filter(o => o.order_status === 'DELIVERED' || o.order_status === 'CANCELLED' || o.payment_status === 'FAILED');
  const realActiveCount  = awaitingPaymentOrders.length + inProgressOrders.length;
  const cartCount        = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalSpent       = orders.filter(o => o.payment_status === 'PAID').reduce((s, o) => s + (parseFloat(o.total_amount) || 0), 0);
  const initials         = user?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <div className="dashboard">

      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="header-brand">
          <div className="header-brand-icon">🍽️</div>
          <div className="header-brand-text">
            <h1>PICT Canteen</h1>
            <span>Pune Institute of Computer Technology</span>
          </div>
        </div>
        <div className="header-right">
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Dark/Light Mode">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <div className="header-user">
            <div className="header-avatar">{initials}</div>
            <div className="header-user-info">
              <p className="user-name">{user?.name}</p>
              <p className="user-role">Student</p>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>↩ Logout</button>
        </div>
      </header>

      <main className="dashboard-content">

        {/* ── Welcome Banner ── */}
        <div className="welcome-banner">
          <div className="welcome-text">
            <h2>Hey {user?.name?.split(" ")[0]} 👋</h2>
            <p>What would you like to order today?</p>
          </div>
          <div className="welcome-time">
            <div className="time">{time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
            <div className="date">{time.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
          </div>
        </div>

        {/* ── Stats ── */}
        <StatsRow cartCount={cartCount} realActiveCount={realActiveCount} totalSpent={totalSpent} />

        {/* ── Main Tab Nav ── */}
        <div className="category-tabs" style={{ marginBottom: "20px" }}>
          <button className={`cat-tab ${activeTab === "menu" ? "active" : ""}`} onClick={() => setActiveTab("menu")}>
            🍽️ Menu & Cart
          </button>
          <button className={`cat-tab ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
            📋 My Orders
            {realActiveCount > 0 && (
              <span style={{ marginLeft: "6px", background: "var(--red-500)", color: "white", borderRadius: "999px", padding: "1px 7px", fontSize: "11px", fontWeight: 700 }}>
                {realActiveCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Panels ── */}
        {activeTab === "menu" && (
          <div className="dashboard-grid">
            <MenuSection menu={menu} category={category} setCategory={setCategory} addToCart={addToCart} />
            <CartSection cart={cart} increaseQty={increaseQty} decreaseQty={decreaseQty} clearCart={clearCart} placeOrder={placeOrder} placing={placing} />
          </div>
        )}

        {activeTab === "orders" && (
          <OrdersSection
            awaitingPaymentOrders={awaitingPaymentOrders}
            inProgressOrders={inProgressOrders}
            completedOrders={completedOrders}
            orderTab={orderTab}
            setOrderTab={setOrderTab}
            onPay={payOrder}
            onDelete={deleteOrder}
          />
        )}

      </main>

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
};

export default StudentDashboard;