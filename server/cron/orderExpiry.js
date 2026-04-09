const cron = require("node-cron");
const db = require("../config/db");

function startOrderExpiryJob() {

  // run every minute
  cron.schedule("*/1 * * * *", async () => {

    try {

      // 1️⃣ Delete pending unpaid orders (expired 10 minutes)
      const [deleted] = await db.query(`
        DELETE FROM orders
        WHERE status = 'pending'
        AND expires_at < NOW()
      `);

      if (deleted.affectedRows > 0) {
        console.log("Deleted unpaid orders:", deleted.affectedRows);
      }


      // 2️⃣ Expire paid orders not picked same day
      const [expired] = await db.query(`
        UPDATE orders SET status = 'expired' WHERE status IN  ['paid' ,'ready'] AND expires_at < NOW();`);

      if (expired.affectedRows > 0) {
        console.log("Expired pickup orders:", expired.affectedRows);
      }

    } catch (err) {
      console.error("Order lifecycle cron failed:", err);
    }

  });

}

module.exports = startOrderExpiryJob;