import { useState } from "react";
import { createPortal } from "react-dom";
import { getEmoji, formatDate, STATUS_META } from "../../utils/studentHelpers";
import Spinner from "../shared/Spinner";

// Progress bar for order status
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

const OrderCard = ({ order, onPay, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [paying, setPaying]     = useState(false);
  const paymentMeta = STATUS_META[order.payment_status] || STATUS_META.UNPAID;
  const orderMeta = STATUS_META[order.order_status] || STATUS_META.PLACED;

  const handlePay = async (e) => {
    e.stopPropagation();
    setPaying(true);
    try {
      setExpanded(false);
      await onPay(order.id);
    } finally {
      setPaying(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      setExpanded(false);
      await onDelete(order.id);
    } catch {}
  };

  return (
    <div className="order-card">

      {/* ── Card row ── */}
      <div className="order-card-header">
        <p className="order-id">
          <span>ORD-{String(order.id).padStart(4, "0")}</span>
        </p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          <span className="order-time">{formatDate(order.created_at)}</span>
          <div style={{ display: "flex", gap: "6px" }}>
            <span className={`status-pill order-${order.order_status}`}>
              {orderMeta.icon} {orderMeta.label}
            </span>
            <span className={`status-pill payment-${order.payment_status}`}>
              {paymentMeta.icon} {paymentMeta.label}
            </span>
          </div>
        </div>
      </div>

      <div className="order-footer">
        <span className="order-amount">₹{order.total_amount ?? "—"}</span>
        <button
          className="view-btn"
          onClick={() => setExpanded(true)}
          style={{
            backgroundColor: "#d12608ea", color: "white",
            padding: "10px 20px", border: "none",
            borderRadius: "5px", cursor: "pointer",
          }}
        >
          View details
        </button>
      </div>

      {/* ── Modal rendered via Portal so position:fixed is always relative to viewport ── */}
      {expanded && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setExpanded(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 999,
            }}
          />

          {/* Modal box */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              width: "90%", maxWidth: "400px",
              zIndex: 1000,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
          >
            {/* Header */}
            <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: 700 }}>
              ORD-{String(order.id).padStart(4, "0")}
            </h3>
            <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "var(--gray-400)" }}>
              {formatDate(order.created_at)}
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span className={`status-pill order-${order.order_status}`}>
                Order: {orderMeta.icon} {orderMeta.label}
              </span>
              <span className={`status-pill payment-${order.payment_status}`}>
                Payment: {paymentMeta.icon} {paymentMeta.label}
              </span>
            </div>

            {(order.payer_name || order.transaction_id) && (
              <div style={{ marginTop: '12px', padding: '8px', background: 'var(--gray-50)', borderRadius: '8px', fontSize: '12px' }}>
                {order.payer_name && <div><strong>Payer Name:</strong> {order.payer_name}</div>}
                {order.transaction_id && <div><strong>Txn ID:</strong> {order.transaction_id}</div>}
              </div>
            )}

            {/* Progress Bar for in-progress orders */}
            {order.payment_status === 'PAID' && ['PLACED', 'CONFIRMED', 'PREPARING', 'READY'].includes(order.order_status) && (
              <div style={{ marginTop: "16px" }}>
                <ProgressBar status={order.order_status} />
              </div>
            )}

            {/* Items */}
            <div style={{ marginTop: "16px" }}>
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "6px 0", fontSize: "13px", color: "var(--gray-700)",
                    borderBottom: "1px solid var(--gray-100)",
                  }}
                >
                  <span>{getEmoji(item.menu_item_id ?? idx)} {item.name} × {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{
              marginTop: "12px", paddingTop: "12px",
              display: "flex", justifyContent: "space-between",
              fontWeight: 700, fontSize: "15px",
              borderTop: "1px solid var(--gray-100)",
            }}>
              <span>Total</span>
              <span>₹{order.total_amount ?? "—"}</span>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
              {order.payment_status === "UNPAID" && order.order_status === "PLACED" && (
                <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                  <button className="pay-btn" onClick={handlePay} disabled={paying}>
                    {paying ? <><Spinner /> Processing…</> : "💳 Pay Now"}
                  </button>
                  <button className="drop-btn" onClick={handleDelete} disabled={paying}>
                    🗑 Drop Order
                  </button>
                </div>
              )}
              <button
                onClick={() => setExpanded(false)}
                style={{
                  width: "100%", padding: "10px", borderRadius: "8px",
                  background: "#000", color: "#fff",
                  border: "none", cursor: "pointer",
                  fontSize: "14px", fontWeight: 600,
                }}
              >
                Close
              </button>
            </div>

          </div>
        </>,
        document.body   // ← renders outside the card's DOM tree entirely
      )}

    </div>
  );
};

export default OrderCard;