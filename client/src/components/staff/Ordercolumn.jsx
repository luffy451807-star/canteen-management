import StaffOrderCard from "./StaffOrderCard";
import axios from "../../api/axios";
import { useEffect, useState } from "react";

const OrderColumn = ({ title, status, refreshKey, onOrderUpdated }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`/orders/admin/all?orderStatus=${status}`);
        // Only show orders that are PAID
        const visibleOrders = Array.isArray(res.data) 
          ? res.data.filter(o => o.payment_status === 'PAID')
          : [];
        setOrders(visibleOrders);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [status, refreshKey]);

  return (
    <div className="order-column">
      <h2>{title}</h2>
      {orders.map((order) => (
        <StaffOrderCard
          key={order.id}
          order={order}
          status={status}
          onOrderUpdated={onOrderUpdated}
        />
      ))}
    </div>
  );
};

export default OrderColumn;