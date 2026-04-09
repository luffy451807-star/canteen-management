import { createContext, useState, useContext, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkUser = async () => {
    try {
      const res = await axios.get("/auth/me");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to load user from localStorage optimistically
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    checkUser();
  }, []);

  const login = async (data) => {
    const res = await axios.post("/auth/login", data);
    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
    redirectByRole(res.data.role);
  };

  const register = async (data) => {
    await axios.post("/auth/register", data);
    navigate("/login");
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const redirectByRole = (role) => {
    if (role === "admin") navigate("/admin");
    else if (role === "staff") navigate("/staff");
    else navigate("/student");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);