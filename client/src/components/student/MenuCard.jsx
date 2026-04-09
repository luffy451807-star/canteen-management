
import { useState } from "react";
import { getEmoji } from "../../utils/studentHelpers";

const MenuCard = ({ item, addToCart }) => {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  const imageUrl = item.image 
    ? (item.image.startsWith('http') ? item.image : `http://localhost:5000/uploads/${item.image}`)
    : null;

  return (
    <div className="menu-card">
      <div className="menu-card-img">
        {imageUrl
          ? <img 
              src={imageUrl} 
              alt={item.name} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = ""; // Fallback to emoji if image fails to load
                e.target.parentElement.innerHTML = `<span>${getEmoji(item.id)}</span>`;
              }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
          : <span>{getEmoji(item.id)}</span>
        }
      </div>
      <div className="menu-card-body">
        <p className="menu-card-name" title={item.name}>{item.name}</p>
        <p className="menu-card-price">₹{item.price} <span>/ item</span></p>
        <button className="add-btn" onClick={handleAdd}>
          {added ? "✓ Added" : "+ Add"}
        </button>
      </div>
    </div>
  );
};

export default MenuCard;