import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate
} from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserPage from "./pages/UserPage";
import CreateRecipe from './pages/CreateRecipe';

// --- IMPORT 2 FILE ADMIN VỪA TẠO ---
import AdminRoute from "./components/AdminRoute"; 
import AdminDashboard from "./pages/AdminDashboard"; 

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function NotificationBanner() {
  const [notifications, setNotifications] = useState(() => {
    const sharedRecipes = localStorage.getItem("sharedRecipes");
    if (sharedRecipes) {
      const recipes = JSON.parse(sharedRecipes);
      return recipes.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        message: `Đã nhận được ${recipe.likes || 0} lượt thích!`,
        time: "Vừa xong",
      }));
    }
    return [];
  });

  const [showInBody, setShowInBody] = useState(() => {
    const userSettings = localStorage.getItem("userSettings");
    if (userSettings) {
      const settings = JSON.parse(userSettings);
      return settings.showNotificationsInBody;
    }
    return false;
  });

  useEffect(() => {
    const handleStorage = () => {
      const userSettings = localStorage.getItem("userSettings");
      if (userSettings) {
        const settings = JSON.parse(userSettings);
        setShowInBody(settings.showNotificationsInBody);
      }

      const sharedRecipes = localStorage.getItem("sharedRecipes");
      if (sharedRecipes) {
        const recipes = JSON.parse(sharedRecipes);
        const notifs = recipes.map((recipe) => ({
          id: recipe.id,
          title: recipe.title,
          message: `Đã nhận được ${recipe.likes || 0} lượt thích!`,
          time: "Vừa xong",
        }));
        setNotifications(notifs);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (!showInBody || notifications.length === 0) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-40 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-orange-500 text-white p-4 rounded-lg shadow-lg"
        >
          <h4 className="font-semibold">{notification.title}</h4>
          <p className="text-sm mt-1">{notification.message}</p>
          <span className="text-xs opacity-75 mt-1 block">
            {notification.time}
          </span>
        </div>
      ))}
    </div>
  );
}

// --- COMPONENT XỬ LÝ LOGIC ẨN NAVBAR ---
function AppContent() {
  const location = useLocation();

  // Mình thêm "/admin" vào đây để trang Quản trị có không gian rộng rãi, không bị vướng Navbar chung
  const hideNavbarPaths = ["/login", "/register", "/admin"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-white">
      {/* Chỉ hiện Navbar và Notification nếu không phải trang login/register/admin */}
      {!shouldHideNavbar && <Navbar />}
      {!shouldHideNavbar && <NotificationBanner />}

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<UserPage />} />
          <Route path="/create-recipe" element={<CreateRecipe />} />
          
          {/* --- ĐÂY LÀ TRANG DÀNH RIÊNG CHO ADMIN --- */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />

          {/* Nếu không khớp cái nào thì về trang chủ hoặc hiện 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      {/* Cấu hình ToastContainer mới - Hiện đại, sang trọng */}
      <ToastContainer
        position="top-center"       // Đưa ra giữa màn hình phía trên
        autoClose={2000}            // Tắt nhanh sau 2 giây (mặc định là 5s hơi lâu)
        hideProgressBar={true}      // Giấu cái thanh thời gian chạy lùi đi
        newestOnTop={true}          
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={true}
        pauseOnHover={false}
        theme="dark"                // Chuyển sang giao diện Dark Mode
        toastClassName={() => 
          "relative flex items-center justify-center p-4 mb-4 min-h-12 rounded-full justify-between overflow-hidden cursor-pointer bg-gray-900 text-white shadow-2xl font-bold text-sm text-center"
        }
      />
    </Router>
  );
}

export default App;