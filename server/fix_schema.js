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
    console.log("Checking and fixing database schema...");

    // Check columns in orders table
    const [columns] = await db.execute("DESCRIBE orders");
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes("expires_at")) {
      console.log("Adding expires_at to orders table...");
      await db.execute("ALTER TABLE orders ADD COLUMN expires_at TIMESTAMP NULL");
    }

    if (!columnNames.includes("payment_method")) {
      console.log("Adding payment_method to orders table...");
      await db.execute("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'QR'");
    }

    // Use a safer two-step conversion: first to VARCHAR, then update, then back to ENUM
    console.log("Safely updating status columns...");
    await db.execute("ALTER TABLE orders MODIFY COLUMN payment_status VARCHAR(50)");
    await db.execute("ALTER TABLE orders MODIFY COLUMN order_status VARCHAR(50)");

    console.log("Mapping old status values to new ones...");
    await db.execute("UPDATE orders SET payment_status = 'UNPAID' WHERE payment_status = 'pending' OR payment_status IS NULL");
    await db.execute("UPDATE orders SET payment_status = 'PAID' WHERE payment_status = 'success'");
    await db.execute("UPDATE orders SET order_status = 'PLACED' WHERE order_status = 'Received' OR order_status IS NULL");
    
    // Ensure all rows have valid values before ENUM conversion
    await db.execute("UPDATE orders SET payment_status = 'UNPAID' WHERE payment_status NOT IN ('UNPAID', 'PENDING_VERIFICATION', 'PAID', 'FAILED')");
    await db.execute("UPDATE orders SET order_status = 'PLACED' WHERE order_status NOT IN ('PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED')");

    // Update payment_status to include new states
    console.log("Converting payment_status to ENUM...");
    await db.execute(`
      ALTER TABLE orders 
      MODIFY COLUMN payment_status ENUM('UNPAID', 'PENDING_VERIFICATION', 'PAID', 'FAILED') NOT NULL DEFAULT 'UNPAID'
    `);

    // Update order_status to include new states
    console.log("Converting order_status to ENUM...");
    await db.execute(`
      ALTER TABLE orders 
      MODIFY COLUMN order_status ENUM('PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PLACED'
    `);



    console.log("Database schema fix complete!");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await db.end();
  }
}

run();
