export const CATEGORIES = ["All", "Breakfast", "Lunch", "Snacks", "Beverages"];

export const STATUS_META = {
  UNPAID:               { label: "Unpaid",           icon: "💰" },
  PENDING_VERIFICATION: { label: "Verifying",        icon: "⏳" },
  PAID:                 { label: "Paid",             icon: "💳" },
  FAILED:               { label: "Failed",           icon: "❌" },
  PLACED:               { label: "Placed",           icon: "📝" },
  CONFIRMED:            { label: "Confirmed",        icon: "✅" },
  PREPARING:            { label: "Preparing",        icon: "👨‍🍳" },
  READY:                { label: "Ready!",           icon: "🔔" },
  DELIVERED:            { label: "Delivered",        icon: "🚚" },
  CANCELLED:            { label: "Cancelled",        icon: "🚫" },
};

const FOOD_EMOJI = ["🍛","🍜","🥙","🥪","🍟","☕","🥤","🍱","🧆","🥗"];
export const getEmoji = (id) => FOOD_EMOJI[id % FOOD_EMOJI.length];

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const isToday = d.toDateString() === new Date().toDateString();
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return isToday
    ? `Today, ${time}`
    : `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${time}`;
}