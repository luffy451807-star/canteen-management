const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkSchema() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123450",
    database: process.env.DB_NAME || "root"
  });

  try {
    const [columns] = await db.execute("DESCRIBE orders");
    console.log("Orders columns:", columns.map(c => c.Field));
  } catch (err) {
    console.error("Error checking schema:", err.message);
  } finally {
    await db.end();
  }
}

checkSchema();
