
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { findUserByEmail, createUser, getUsersByRole, deleteUserById } = require("../models/userModel");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    await createUser(name, email, hashed, role || "student");

    res.json({ message: "Registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({ id: user.id, name: user.name, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};


exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
  res.json({ message: "Logged out successfully" });
};


 exports.getMe = (req, res) => {
  res.json(req.user);
};

exports.getStaff = async (req, res) => {
  try {
    const staff = await getUsersByRole("staff");
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch staff" });
  }
};

exports.addStaff = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) return res.status(400).json({ message: "Staff already exists" });

    const hashed = await bcrypt.hash(password, 10);
    await createUser(name, email, hashed, "staff");
    res.json({ message: "Staff created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add staff" });
  }
};

exports.removeStaff = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteUserById(id);
    res.json({ message: "Staff removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove staff" });
  }
};
