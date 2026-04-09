
const express = require("express");
const router = express.Router();
const { register, login,logout,getMe, getStaff, addStaff, removeStaff } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post('/logout',logout);


router.get("/me", verifyToken, getMe);

router.get("/admin", verifyToken, authorize("admin"), (req, res) => {
  res.json({ message: "Admin Dashboard" });
});

router.get("/student", verifyToken, authorize("student"), (req, res) => {
  res.json({ message: "Student Dashboard" });
});


router.get("/staff-list", verifyToken, authorize("admin"), getStaff);
router.post("/staff", verifyToken, authorize("admin"), addStaff);
router.delete("/staff/:id", verifyToken, authorize("admin"), removeStaff);

router.get("/staff", verifyToken, authorize("staff"), (req, res) => {
  res.json({ message: "Staff Dashboard" });
});

module.exports = router;