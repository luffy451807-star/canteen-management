const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function run() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123450",
    database: process.env.DB_NAME || "root"
  });

  try {
    const newPassword = "123456";
    const hashed = await bcrypt.hash(newPassword, 10);

    const [result] = await db.execute(
      "UPDATE users SET password = ? WHERE email = 'luffy451807@gmail.com'",
      [hashed]
    );

    if (result.affectedRows === 1) {
      console.log("Success! Password reset to: " + newPassword);
    } else {
      console.log("Error: User not found.");
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await db.end();
  }
}

run();
