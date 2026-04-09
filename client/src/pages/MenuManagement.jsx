import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/menuManagement.css";

const MenuManagement = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    isAvailable: true,
    image: ""
  });

  const fetchMenu = async () => {
    try {
      const res = await axios.get("/menu");
      setItems(res.data);
    } catch (err) {
      console.error("Menu fetch error:", err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`/menu/update/${editingItem.id}`, formData);
      } else {
        await axios.post("/menu/add", formData);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: "", price: "", category: "", isAvailable: true, image: "" });
      fetchMenu();
    } catch (err) {
      alert("Failed to save item");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      isAvailable: !!item.isAvailable,
      image: item.image || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`/menu/delete/${id}`);
        fetchMenu();
      } catch (err) {
        alert("Failed to delete item");
      }
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await axios.patch(`/menu/${id}/availability`, {
        isAvailable: !currentStatus
      });
      setItems(prev => prev.map(item => item.id === id ? { ...item, isAvailable: !currentStatus } : item));
    } catch (err) {
      console.error("Availability update failed:", err);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="menu-page">
      <div className="menu-header">
        <div>
          <h2>Menu Management</h2>
          <p>Manage your canteen menu items</p>
        </div>
        <div className="header-actions">
          <button className="add-btn" onClick={() => { setShowModal(true); setEditingItem(null); }}>
            + Add New Item
          </button>
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </div>

      <div className="menu-search">
        <input
          type="text"
          placeholder="Search items by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="menu-table-container">
        <table className="menu-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>₹{item.price}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={item.isAvailable}
                      onChange={() => toggleAvailability(item.id, item.isAvailable)}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="edit-icon-btn" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="delete-icon-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingItem ? "Edit Item" : "Add New Item"}</h3>
            <form onSubmit={handleAddOrUpdate}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} required>
                  <option value="">Select Category</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>
              <div className="form-group">
                <label>Image URL (Optional)</label>
                <input type="text" name="image" value={formData.image} onChange={handleInputChange} placeholder="https://example.com/image.jpg" />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleInputChange} />
                  Available
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">Save Item</button>
                <button type="button" className="cancel-btn-modal" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;