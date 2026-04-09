-- SQL script to update the canteen management system schema for improved payment and order tracking

-- 1. Update orders table with new payment and order statuses
ALTER TABLE orders
MODIFY COLUMN payment_status ENUM('UNPAID', 'PENDING_VERIFICATION', 'PAID', 'FAILED') DEFAULT 'UNPAID',
MODIFY COLUMN order_status ENUM('PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED') DEFAULT 'PLACED';

-- 2. Update existing orders to map old statuses to new ones
UPDATE orders SET payment_status = 'PAID' WHERE payment_status = 'success';
UPDATE orders SET payment_status = 'FAILED' WHERE payment_status = 'failed';
UPDATE orders SET payment_status = 'PENDING_VERIFICATION' WHERE payment_status = 'pending';

UPDATE orders SET order_status = 'PLACED' WHERE order_status = 'Received';
UPDATE orders SET order_status = 'READY' WHERE order_status = 'Preparing';
UPDATE orders SET order_status = 'DELIVERED' WHERE order_status = 'Delivered';

-- 3. Ensure menu_items has isAvailable
ALTER TABLE menu_items MODIFY COLUMN isAvailable BOOLEAN DEFAULT TRUE;
