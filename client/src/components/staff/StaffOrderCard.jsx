import axios from "../../api/axios";

const nextStatus = {
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "DELIVERED",
};

const StaffOrderCard = ({ order, status, onOrderUpdated }) => {

  const handleNext = async () => {
    try {
      await axios.patch(`/orders/status/${order.id}`, {
        status: nextStatus[status],
      });
      onOrderUpdated();
    } catch (err) {
      console.error("Failed to update order status", err);
    }
  };

  return (
    <div className="order-card">
      <div className="order-card-header">
        <h3>ORD-{String(order.id).padStart(4, '0')}</h3>
        <span className="order-time">
          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <div className="order-user-name">
        <div style={{ fontWeight: '500', color: '#374151' }}>{order.user_name || 'Unknown User'}</div>
        <div style={{ fontSize: '0.85em', color: '#6b7280' }}>{order.user_email || 'No Email'}</div>
        {order.payer_name && <div style={{ fontSize: '0.85em', color: '#10b981', marginTop: '4px', fontWeight: '500' }}>Payer: {order.payer_name}</div>}
      </div>

      <ul className="order-items-list">
        {(order.items || []).map((item) => (
          <li key={item.id}>
            <span className="item-qty">{item.quantity}x</span> {item.name}
          </li>
        ))}
      </ul>

      <div className="order-card-actions">
        {status === "CONFIRMED" && (
          <button className="action-btn preparing-btn" onClick={handleNext}>
            👨‍🍳 Start Preparing
          </button>
        )}
        {status === "PREPARING" && (
          <button className="action-btn ready-btn" onClick={handleNext}>
            ✅ Mark Ready
          </button>
        )}
        {status === "READY" && (
          <button className="action-btn complete-btn" onClick={handleNext}>
            🥡 Mark Delivered
          </button>
        )}
      </div>
    </div>
  );
};

export default StaffOrderCard;