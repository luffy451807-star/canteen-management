const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const { 
  getMenu, 
  changeAvailablity, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
} = require("../controllers/menuController");

// Public (Student/Staff/Admin)
router.get("/", verifyToken, getMenu);

// Staff/Admin
router.patch("/:id/availability", verifyToken, authorize("staff", "admin"), changeAvailablity);

// Admin Only
router.post("/add", verifyToken, authorize("admin"), addMenuItem);
router.put("/update/:id", verifyToken, authorize("admin"), updateMenuItem);
router.delete("/delete/:id", verifyToken, authorize("admin"), deleteMenuItem);

module.exports = router;