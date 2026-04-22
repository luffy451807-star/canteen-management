const db = require("../config/db");

// ─── Helper: attach items to an array of orders ───────────────────────────────
const attachItems = async (orders) => {
  for (const order of orders) {
    const [items] = await db.query(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [order.id]
    );
    order.items = items;
  }
  return orders;
};

// ─── Create Order ─────────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  const { items, paymentMethod = "QR" } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const ids = items.map((i) => i.menuItemId);
    const [menuRows] = await connection.query(
      `SELECT * FROM menu_items WHERE id IN (?) AND isAvailable=true`,
      [ids]
    );

    if (menuRows.length !== items.length) {
      throw new Error("Invalid or unavailable items");
    }

    let totalAmount = 0;
    const orderItemsData = [];

    for (let item of items) {
      const menuItem = menuRows.find((m) => m.id === item.menuItemId);
      const subtotal = menuItem.price * item.quantity;
      totalAmount += subtotal;
      orderItemsData.push([
        menuItem.id,
        menuItem.name,
        menuItem.price,
        item.quantity,
        subtotal,
      ]);
    }

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, payment_status, order_status, payment_method, expires_at)
       VALUES (?, ?, 'UNPAID', 'PLACED', ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
      [userId, totalAmount, paymentMethod]
    );

    const orderId = orderResult.insertId;

    for (let data of orderItemsData) {
      await connection.query(
        `INSERT INTO order_items (order_id, menu_item_id, name, price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, ...data]
      );
    }

    await connection.commit();
    res.status(201).json({
      orderId,
      totalAmount,
      message: "Order created successfully",
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};

// ─── Mark Paid (Pending Verification) ─────────────────────────────────────────
exports.payOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;
  const { payerName, transactionId } = req.body;

  try {
    const [rows] = await db.query(
      `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
      [orderId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = rows[0];

    // Status check: only allow if UNPAID
    if (order.payment_status !== "UNPAID") {
      return res.status(400).json({ message: "Order already processed" });
    }

    await db.query(
      `UPDATE orders 
       SET payment_status = 'PENDING_VERIFICATION', 
           payment_method = 'QR',
           payer_name = ?,
           transaction_id = ?
       WHERE id = ?`,
      [payerName || null, transactionId || null, orderId]
    );

    res.json({ message: "Payment submitted for verification" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Verify Payment (Admin Only) ──────────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  const { orderId } = req.params;
  const { success } = req.body;

  try {
    if (success) {
      await db.query(
        `UPDATE orders SET payment_status = 'PAID', order_status = 'CONFIRMED' WHERE id = ?`,
        [orderId]
      );
    } else {
      await db.query(
        `UPDATE orders SET payment_status = 'FAILED' WHERE id = ?`,
        [orderId]
      );
    }

    res.json({ message: `Payment marked as ${success ? 'PAID' : 'FAILED'}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Change Order Status (Staff/Admin) ───────────────────────────────────────
exports.changeOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; // PLACED, CONFIRMED, PREPARING, READY, DELIVERED, CANCELLED

  const validStatuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  try {
    // First check if payment is PAID
    const [orderRows] = await db.query(
      `SELECT payment_status FROM orders WHERE id = ?`,
      [orderId]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (orderRows[0].payment_status !== 'PAID') {
      return res.status(400).json({ message: "Cannot update order status: Payment not verified" });
    }

    const [result] = await db.query(
      `UPDATE orders SET order_status = ? WHERE id = ?`,
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: `Order status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Get My Orders ───────────────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const [orders] = await db.query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    const ordersWithItems = await attachItems(orders);
    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Get Orders (Admin/Staff) ────────────────────────────────────────────────
exports.getAllOrders = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.query;
    let query = "SELECT orders.*, users.name as user_name, users.email as user_email FROM orders JOIN users ON orders.user_id = users.id";
    let params = [];

    if (orderStatus || paymentStatus) {
      query += " WHERE";
      if (orderStatus) {
        query += " order_status = ?";
        params.push(orderStatus);
      }
      if (orderStatus && paymentStatus) query += " AND";
      if (paymentStatus) {
        query += " payment_status = ?";
        params.push(paymentStatus);
      }
    }

    query += " ORDER BY created_at DESC";

    const [orders] = await db.query(query, params);
    const ordersWithItems = await attachItems(orders);
    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Get Order By ID ─────────────────────────────────────────────────────────
exports.getOrderById = async (req, res) => {
  const { orderId } = req.params;
  try {
    const [orders] = await db.query(
      `SELECT orders.*, users.name as user_name, users.email as user_email FROM orders JOIN users ON orders.user_id = users.id WHERE orders.id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const [items] = await db.query(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [orderId]
    );

    res.json({ ...orders[0], items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Delete Order ─────────────────────────────────────────────────────────────
exports.deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  try {
    // First delete items
    await db.query(`DELETE FROM order_items WHERE order_id = ?`, [orderId]);

    // Then delete order
    const [result] = await db.query(
      `DELETE FROM orders WHERE id = ? AND user_id = ? AND payment_status = 'UNPAID' AND order_status = 'PLACED'`,
      [orderId, userId]
    );

    if (!result.affectedRows) {
      return res.status(400).json({ message: "Order cannot be deleted or already deleted" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Delete order error:", err);
    res.status(500).json({ message: err.message });
  }
};

