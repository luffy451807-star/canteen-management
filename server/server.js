require("dotenv").config();
const express = require("express");
const cors = require("cors")
const cookieParser= require("cookie-parser");
const startOrderExpiryJob = require("./cron/orderExpiry");



const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const menuRoutes =require("./routes/menuRoutes");
const path = require("path");
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
startOrderExpiryJob();
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/menu",menuRoutes);
app.listen(5000, () =>
 console.log("Server running on port 5000")
);

