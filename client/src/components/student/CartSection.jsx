import CartItemRow from "./CartItemRow";
import Spinner from "../shared/Spinner";

const CartSection = ({ cart, increaseQty, decreaseQty, clearCart, placeOrder, placing }) => {
  const total     = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="cart-section">
      <div className="section-header">
        <h2>Your Cart</h2>
        {cartCount > 0 && (
          <button
            onClick={clearCart}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "var(--gray-400)", fontFamily: "'DM Sans', sans-serif" }}
          >
            Clear all
          </button>
        )}
      </div>

      <div className="cart-items">
        {cart.length === 0
          ? (
            <div className="cart-empty">
              <span className="empty-icon">🛒</span>
              <p>Your cart is empty</p>
              <p style={{ fontSize: "12px" }}>Add items from the menu</p>
            </div>
          )
          : cart.map(item => (
            <CartItemRow key={item.id} item={item} increaseQty={increaseQty} decreaseQty={decreaseQty} />
          ))
        }
      </div>

      {cart.length > 0 && (
        <div className="cart-footer">
          <div className="cart-total-row">
            <span className="cart-total-label">Total</span>
            <span className="cart-total-amount"><span>₹</span>{total}</span>
          </div>
          <button
            className="btn-primary"
            style={{ width: "100%", fontSize: "15px", padding: "14px" }}
            onClick={placeOrder}
            disabled={placing}
          >
            {placing
              ? <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}><Spinner /> Placing order…</span>
              : `Place Order · ₹${total}`
            }
          </button>
        </div>
      )}
    </div>
  );
};

export default CartSection;