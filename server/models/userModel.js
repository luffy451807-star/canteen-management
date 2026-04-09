
const db = require("../config/db");

exports.findUserByEmail = async (email) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
};

exports.createUser = async (name, email, password, role) => {
  return await db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, password, role]
  );
};

exports.getUsersByRole = async (role) => {
  const [rows] = await db.query(
    "SELECT id, name, email, role FROM users WHERE role = ?",
    [role]
  );
  return rows;
};

exports.deleteUserById = async (id) => {
  return await db.query(
    "DELETE FROM users WHERE id = ?",
    [id]
  );
};