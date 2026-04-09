const mysql = require("mysql2/promise");
require("dotenv").config();

async function run() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123450",
    database: process.env.DB_NAME || "root"
  });

  try {
    const [result] = await db.execute(
      "UPDATE users SET role = 'admin' WHERE email = 'luffy451807@gmail.com'"
    );
    console.log("Success! Affected rows:", result.affectedRows);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await db.end();
  }
}

run();
