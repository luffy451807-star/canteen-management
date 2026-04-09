const db = require("../config/db");

exports.getMenu = async (req, res) => {
  const { role } = req.user;
  try {  
      const query = role === "admin" || role === "staff" 
        ? "SELECT * FROM menu_items" 
        : "SELECT * FROM menu_items WHERE isAvailable = true";
      const [rows] = await db.query(query);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error("Menu fetch error:", error);
    res.status(500).json({ message: "Failed to fetch menu" });
  }
};

exports.addMenuItem = async (req, res) => {
  const { name, price, image, category, isAvailable = true } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO menu_items (name, price, image, category, isAvailable) VALUES (?, ?, ?, ?, ?)",
      [name, price, image, category, isAvailable]
    );
    res.status(201).json({ id: result.insertId, message: "Item added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, price, image, category, isAvailable } = req.body;
  try {
    await db.query(
      "UPDATE menu_items SET name = ?, price = ?, image = ?, category = ?, isAvailable = ? WHERE id = ?",
      [name, price, image, category, isAvailable, id]
    );
    res.json({ message: "Item updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM menu_items WHERE id = ?", [id]);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changeAvailablity = async (req, res) => {
  const { id } = req.params;
  const { isAvailable } = req.body;

  if (isAvailable === undefined) return res.status(400).json({ error: "isAvailable is required" });
  try {
    await db.query(
      "UPDATE menu_items SET isAvailable = ? WHERE id = ?",
      [isAvailable, id]
    );
    res.json({ success: true, message: "Availability updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update availability" });
  }
};