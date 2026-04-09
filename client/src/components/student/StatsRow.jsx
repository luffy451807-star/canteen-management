
const StatsRow = ({ cartCount, realActiveCount, totalSpent }) => (
  <div className="stats-row">
    <div className="stat-card">
      <div className="stat-icon red">🛒</div>
      <div>
        <div className="stat-value">{cartCount}</div>
        <div className="stat-label">Items in cart</div>
      </div>
    </div>
    <div className="stat-card">
      <div className="stat-icon green">📋</div>
      <div>
        <div className="stat-value">{realActiveCount}</div>
        <div className="stat-label">Active orders</div>
      </div>
    </div>
    <div className="stat-card">
      <div className="stat-icon blue">💰</div>
      <div>
        <div className="stat-value">₹{totalSpent.toFixed(2)}</div>
        <div className="stat-label">Total spent</div>
      </div>
    </div>
  </div>
);

export default StatsRow;