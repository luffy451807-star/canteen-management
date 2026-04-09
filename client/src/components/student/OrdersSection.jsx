import OrderCard from "./OrderCard";
import { STATUS_META } from "../../utils/studentHelpers";

const Badge = ({ count, color }) =>
  count > 0 ? (
    <span style={{ marginLeft: "6px", background: color, color: "white", borderRadius: "999px", padding: "1px 7px", fontSize: "11px", fontWeight: 700 }}>
      {count}
    </span>
  ) : null;

// Shows paid → confirmed → preparing → ready progress bar on each in-progress order
const IN_PROGRESS_STEPS = ["PAID", "CONFIRMED", "PREPARING", "READY"];

function ProgressBar({ status }) {
  const currentIdx = IN_PROGRESS_STEPS.indexOf(status);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, margin: "12px 0 4px" }}>
      {IN_PROGRESS_STEPS.map((step, idx) => {
        const done   = idx < currentIdx;
        const active = idx === currentIdx;
        const meta   = STATUS_META[step];
        return (
          <div key={step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            {/* Connector line */}
            {idx !== 0 && (
              <div style={{
                position: "absolute", top: 14, right: "50%", width: "100%", height: 2,
                background: done || active ? "var(--red-500)" : "var(--gray-200)",
                zIndex: 0,
              }} />
            )}
            {/* Circle */}
            <div style={{
              width: 28, height: 28, borderRadius: "50%", zIndex: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13,
              background: active ? "var(--red-600)" : done ? "var(--red-400)" : "var(--gray-200)",
              boxShadow: active ? "0 0 0 3px rgba(192,57,43,0.2)" : "none",
              transition: "all 0.3s",
            }}>
              {meta.icon}
            </div>
            {/* Label */}
            <span style={{
              fontSize: 10, marginTop: 5, fontWeight: 600, textAlign: "center",
              color: active ? "var(--red-600)" : done ? "var(--red-400)" : "var(--gray-400)",
            }}>
              {meta.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const OrdersSection = ({
  awaitingPaymentOrders,
  inProgressOrders,
  completedOrders,
  orderTab,
  setOrderTab,
  onPay,
  onDelete,
}) => (
  <div>
    {/* Sub-tabs */}
    <div className="category-tabs" style={{ marginBottom: "20px" }}>
      <button className={`cat-tab ${orderTab === "awaiting" ? "active" : ""}`} onClick={() => setOrderTab("awaiting")}>
        ⏳ Awaiting Payment
        <Badge count={awaitingPaymentOrders.length} color="#D97706" />
      </button>
      <button className={`cat-tab ${orderTab === "inprogress" ? "active" : ""}`} onClick={() => setOrderTab("inprogress")}>
        🍳 In Progress
        <Badge count={inProgressOrders.length} color="#16A34A" />
      </button>
      <button className={`cat-tab ${orderTab === "completed" ? "active" : ""}`} onClick={() => setOrderTab("completed")}>
        📋 Completed
        <Badge count={completedOrders.length} color="#6B7280" />
      </button>
    </div>

    {/* Panel — Awaiting Payment */}
    {orderTab === "awaiting" && (
      <div className="orders-list">
        {awaitingPaymentOrders.length === 0
          ? <div className="empty-state"><div className="empty-icon">⏳</div><h4>No orders awaiting payment</h4><p>Orders awaiting payment will appear here</p></div>
          : awaitingPaymentOrders.map(order => <OrderCard key={order.id} order={order} onPay={onPay} onDelete={onDelete} />)
        }
      </div>
    )}

    {/* Panel — In Progress */}
    {orderTab === "inprogress" && (
      <div className="orders-list">
        {inProgressOrders.length === 0
          ? <div className="empty-state"><div className="empty-icon">🍳</div><h4>Nothing in progress</h4><p>Paid orders being prepared will appear here</p></div>
          : inProgressOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
        }
      </div>
    )}
    {/* Panel — Completed */}
    {orderTab === "completed" && (
      <div className="orders-list">
        {completedOrders.length === 0
          ? <div className="empty-state"><div className="empty-icon">📋</div><h4>No completed orders yet</h4><p>Completed and cancelled orders will appear here</p></div>
          : completedOrders.map(order => <OrderCard key={order.id} order={order} />)
        }
      </div>
    )}
  </div>
);

export default OrdersSection;