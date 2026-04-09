
import MenuCard from "./MenuCard";
import { CATEGORIES } from "../../utils/studentHelpers";

const MenuSection = ({ menu, category, setCategory, addToCart }) => {
  const filteredMenu = category === "All"
    ? menu
    : menu.filter(i => i.category?.toLowerCase() === category.toLowerCase());

  return (
    <div className="menu-section">
      <div className="section-header">
        <h2>Today's Menu</h2>
        <span className="section-badge">{filteredMenu.length} items</span>
      </div>

      <div className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`cat-tab ${category === cat ? "active" : ""}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredMenu.length === 0
        ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h4>No items available</h4>
            <p>Try a different category</p>
          </div>
        )
        : (
          <div className="menu-grid">
            {filteredMenu.map(item => (
              <MenuCard key={item.id} item={item} addToCart={addToCart} />
            ))}
          </div>
        )
      }
    </div>
  );
};

export default MenuSection;