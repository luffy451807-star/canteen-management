import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axios";
import "../styles/payment.css";

const Payment = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`/orders/${orderId}`);
                setOrder(res.data);
            } catch (err) {
                console.error("Order fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handlePaid = async () => {
        setSubmitting(true);
        try {
            await axios.post(`/orders/pay/${orderId}`);
            setOrder(prev => ({ ...prev, payment_status: 'PENDING_VERIFICATION' }));
            // Poll for status update
            const pollInterval = setInterval(async () => {
                try {
                    const res = await axios.get(`/orders/${orderId}`);
                    const updatedOrder = res.data;
                    setOrder(updatedOrder);
                    if (updatedOrder.payment_status === 'PAID') {
                        clearInterval(pollInterval);
                        navigate("/student");
                    } else if (updatedOrder.payment_status === 'FAILED') {
                        clearInterval(pollInterval);
                        alert("Payment verification failed. Please try again.");
                        navigate("/student");
                    }
                } catch (err) {
                    console.error("Polling failed", err);
                }
            }, 2000); // Poll every 2 seconds
        } catch (err) {
            alert("Failed to submit payment. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="payment-loading">Loading order details...</div>;
    if (!order) return <div className="payment-error">Order not found.</div>;

    return (
        <div className="payment-container" data-theme={theme}>
            <div className="payment-card">
                <div className="payment-header">
                    <h1>Complete Payment</h1>
                    <p>Order ID: <strong>{orderId}</strong></p>
                </div>

                <div className="payment-qr-section">
                    <div className="qr-container">
                        <img 
                            src="https://drive.google.com/uc?id=1mVExvaWGluubcbw4nhXgtbBCxpbdICi5"
                            alt="UPI QR Code" 
                            className="payment-qr"
                            onError={(e) => {
                                // Fallback to local image if drive link fails
                                e.target.src = "/upi_qr.png";
                            }}
                        />
                    </div>
                    <div className="payment-total">
                        <span>Total Payable:</span>
                        <span className="amount">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                    </div>
                </div>
                <p className="upi-id-display">UPI ID: <strong>7066832436@fam</strong></p>

                <div className="payment-instructions">
                    <p>1. Scan the QR code using any UPI app.</p>
                    <p>2. Complete the payment of <strong>₹{order.total_amount}</strong>.</p>
                    <p>3. Once done, click the button below.</p>
                    {order.payment_status === 'PENDING_VERIFICATION' && (
                        <p style={{ color: '#d97706', fontWeight: 'bold' }}>⏳ Payment submitted for verification. Please wait...</p>
                    )}
                </div>

                <div className="payment-actions">
                    {order.payment_status !== 'PENDING_VERIFICATION' ? (
                        <button 
                            className="paid-btn" 
                            onClick={handlePaid} 
                            disabled={submitting}
                        >
                            {submitting ? "Processing..." : "I Have Paid"}
                        </button>
                    ) : (
                        <div className="verification-waiting">
                            <div className="spinner"></div>
                            <p>Verifying payment...</p>
                        </div>
                    )}
                    <button 
                        className="cancel-btn" 
                        onClick={() => navigate("/student")}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Payment;
