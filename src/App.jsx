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

// --- TẠO COMPONENT NÀY ĐỂ XỬ LÝ LOGIC ẨN NAVBAR ---
function AppContent() {
  const location = useLocation();

  // Danh sách các đường dẫn KHÔNG hiện Navbar
  const hideNavbarPaths = ["/login", "/register"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-white">
      {/* Chỉ hiện Navbar và Notification nếu không phải trang login/register */}
      {!shouldHideNavbar && <Navbar />}
      {!shouldHideNavbar && <NotificationBanner />}

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<UserPage />} />
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Router>
  );
}

export default App;
