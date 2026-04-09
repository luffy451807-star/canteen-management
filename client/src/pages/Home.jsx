import { useNavigate } from "react-router-dom";
import "../styles/home.css"

function Home() {
  const navigate = useNavigate();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="auth-container">
      <div className="home-card">
        <div className="home-logo">🍽️</div>
        <p className="home-college">PICT · Pune</p>
        <h1>PICT Canteen</h1>
        <p>{greeting}! Order fresh meals, track your order in real-time, and skip the queue.</p>

        <div className="home-buttons">
          <button className="btn-primary" onClick={() => navigate("/login")}>Login</button>
          <button className="btn-outline" onClick={() => navigate("/register")}>Register</button>
        </div>

        <div className="home-divider">Available for</div>

        <div className="home-badges">
          <span className="home-badge">🎓 Students</span>
          <span className="home-badge">👩‍🏫 Staff</span>
          <span className="home-badge">⚙️ Admins</span>
        </div>
      </div>
    </div>
  );
}

export default Home;