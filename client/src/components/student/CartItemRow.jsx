
import { getEmoji } from "../../utils/studentHelpers";

const CartItemRow = ({ item, increaseQty, decreaseQty }) => (
  <div className="cart-item">
    <div className="cart-item-icon">{getEmoji(item.id)}</div>
    <div className="cart-item-info">
      <p className="cart-item-name">{item.name}</p>
      <p className="cart-item-price">₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}</p>
    </div>
    <div className="qty-controls">
      <button className="qty-btn" onClick={() => decreaseQty(item.id)}>−</button>
      <span className="qty-value">{item.quantity}</span>
      <button className="qty-btn" onClick={() => increaseQty(item.id)}>+</button>
    </div>
  </div>
);

export default CartItemRow;