const cron = require("node-cron");
const db = require("../config/db");

function startOrderExpiryJob() {
  // run every minute
  cron.schedule("*/1 * * * *", async () => {
    try {
      // 1️⃣ Delete expired unpaid orders
      // Note: order_items should be deleted first if there's no ON DELETE CASCADE
      const [expiredOrders] = await db.query(`
        SELECT id FROM orders 
        WHERE payment_status = 'UNPAID' 
        AND expires_at < NOW()
      `);

      for (const order of expiredOrders) {
        await db.query("DELETE FROM order_items WHERE order_id = ?", [order.id]);
        await db.query("DELETE FROM orders WHERE id = ?", [order.id]);
      }

      if (expiredOrders.length > 0) {
        console.log("Cleaned up expired unpaid orders:", expiredOrders.length);
      }

      // 2️⃣ Handle other status transitions if needed (e.g., mark as CANCELLED instead of a non-existent 'expired')
      const [result] = await db.query(`
        UPDATE orders 
        SET order_status = 'CANCELLED' 
        WHERE order_status IN ('PLACED', 'CONFIRMED', 'READY') 
        AND payment_status = 'PAID' 
        AND expires_at < NOW()
      `);

      if (result.affectedRows > 0) {
        console.log("Cancelled overdue paid orders:", result.affectedRows);
      }

    } catch (err) {
      console.error("Order lifecycle cron failed:", err);
    }
  });
}

module.exports = startOrderExpiryJob;