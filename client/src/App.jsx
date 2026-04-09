import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from './pages/Home';
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import StaffManagement from "./pages/StaffManagement";
import MenuManagement from "./pages/MenuManagement";
import Payment from "./pages/Payment";
import "./styles/global.css"
import ThemeToggle from "./components/shared/ThemeToggle";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeToggle />
        <Routes>
        
          <Route path="/" element={<Home />}/>
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute role="admin">
                <StaffManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff"
            element={
              <ProtectedRoute role="staff">
                <StaffDashboard/>
              </ProtectedRoute>
            }
          />
     
     <Route
  path="/staff/menu"
  element={ <ProtectedRoute role={["staff", "admin"]}>
                <MenuManagement/> 
              </ProtectedRoute>}
/>
          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment/:orderId"
            element={
              <ProtectedRoute role="student">
                <Payment />
              </ProtectedRoute>
            }
          />
          
        </Routes>

        
      </AuthProvider>
      
    </BrowserRouter>
  );
}

export default App;